import "server-only";

import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Who is allowed into `/admin`.
 *
 * **This is a single shared password, chosen knowingly.** It is the weakest of
 * the three options that were on the table and it has two costs the office
 * should know about: there is no record of *who* did anything, and it cannot
 * be revoked for one person without changing it for everybody. It was picked
 * because exactly one person uses the admin today.
 *
 * Everything that depends on that choice is behind `checkPassword` and
 * `startSession`. Moving to named accounts means replacing those two
 * functions and adding a `staff` table — the pages, the guard and the cookie
 * format do not change, because none of them knows how many people there are.
 *
 * ## The cookie
 *
 * `<expiry>.<hmac>`, signed with `ADMIN_SESSION_SECRET`, `httpOnly`, `secure`
 * in production, `sameSite: lax`. It carries no identity because there is no
 * identity to carry; it says only "somebody knew the password, until this
 * timestamp". The signature is what stops it being forged, so the secret must
 * be a real random string and not the password again.
 *
 * Two deliberate properties:
 *
 *  - **The expiry is inside the signed payload, not just in the cookie's own
 *    `Max-Age`.** A cookie's expiry is a hint to the browser and is trivially
 *    editable by whoever holds it; this one is checked server-side against a
 *    value that cannot be edited without the secret.
 *  - **Comparisons are timing-safe.** `===` on a password leaks its length
 *    and then its prefix to anybody willing to measure, which over a public
 *    endpoint is a practical attack rather than a theoretical one.
 *
 * ## Why not `middleware.ts`
 *
 * Middleware runs on the edge runtime, where `node:crypto` is unavailable,
 * and a guard that cannot verify a signature is not a guard. The check lives
 * in the admin layout instead, which is a server component and runs before
 * any page under it renders.
 */

const COOKIE = "how_admin";
/** Eight hours: a working day, so nobody is signed in overnight by accident. */
const TTL_MS = 8 * 60 * 60 * 1000;

function secret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || null;
}

/** Whether admin access is configured at all. Both are required. */
export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && secret());
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("hex");
}

/**
 * Constant-time string equality.
 *
 * `timingSafeEqual` throws when the buffers differ in length, which would
 * itself leak the length, so both sides are hashed to a fixed 32 bytes first
 * and the comparison is made on those.
 */
function equal(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Does this password match the configured one? */
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !secret()) return false;
  return equal(input, expected);
}

/** Issue the session cookie. The caller has already checked the password. */
export async function startSession(): Promise<void> {
  const key = secret();
  if (!key) throw new Error("ADMIN_SESSION_SECRET is unset");

  const expiry = String(Date.now() + TTL_MS);
  /* A nonce so two sessions issued in the same millisecond differ. */
  const nonce = randomBytes(8).toString("hex");
  const payload = `${expiry}.${nonce}`;

  const store = await cookies();
  store.set(COOKIE, `${payload}.${sign(payload, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(TTL_MS / 1000),
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Is the caller signed in? Used by the admin layout, before anything renders. */
export async function isSignedIn(): Promise<boolean> {
  const key = secret();
  if (!key) return false;

  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;

  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [expiry, nonce, mac] = parts;

  if (!equal(sign(`${expiry}.${nonce}`, key), mac)) return false;

  const at = Number(expiry);
  return Number.isFinite(at) && at > Date.now();
}
