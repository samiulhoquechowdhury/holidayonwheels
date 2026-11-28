import type { Request, Response, NextFunction } from "express";
import { parse as parseCookie } from "cookie";
import { decode } from "@auth/core/jwt";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../db/client";
import { sessions, users } from "../db/schema/index";
import { ApiError } from "../lib/http";
import { env } from "../env";

/**
 * Who is making this request.
 *
 * ## Two kinds of cookie, because Auth.js issues two
 *
 * This had to change once the facts were checked. The plan was database
 * sessions only: Auth.js writes a row in `sessions`, Express looks it up, no
 * crypto on this side. That works for OAuth — but **not** for email and
 * password. `@auth/core/lib/utils/assert.js` refuses the combination
 * outright:
 *
 *     "Signing in with credentials only supported if JWT strategy is enabled"
 *
 * and the credentials branch of the callback handler encodes a JWT into the
 * cookie regardless of the configured strategy. So a password sign-in always
 * produces an encrypted JWT, never a session row.
 *
 * Both paths are therefore supported, tried in order:
 *
 * 1. **Decode it as an Auth.js JWT.** Using Auth.js's own `decode`, not a
 *    hand-rolled JWE reader — the format is theirs and reimplementing it is
 *    how a verifier ends up subtly wrong. The `salt` is the cookie name,
 *    which is what `callback/index.js` passes to `encode`; the wrong salt
 *    fails to decrypt rather than returning something wrong, so a mismatch
 *    is a 401 and not a security hole.
 * 2. **Look it up in `sessions`.** For an OAuth sign-in under the database
 *    strategy, which is what Google will use if this project ever drops
 *    passwords.
 *
 * ## The JWT path still reads the database, deliberately
 *
 * A JWT is valid until it expires no matter what the database says, which
 * would mean a disabled staff account kept working for the rest of the day.
 * So the decoded `sub` is used to load the user row and the request is
 * refused if the account is disabled. The role comes from that row too, so a
 * demotion takes effect immediately instead of at the next sign-in.
 *
 * That costs one indexed primary-key lookup per request — the same cost the
 * database-session path was always going to pay — and buys back the one
 * property JWTs otherwise give up.
 *
 * ## Why both cookie names
 *
 * Auth.js prefixes the cookie with `__Secure-` when it is issued over HTTPS
 * and omits the prefix on plain HTTP. Production and local development
 * therefore send *different cookie names* for the same thing. Checking only
 * one works perfectly in dev and fails completely on the deployed site.
 */

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "traveller" | "staff" | "admin";
};

/*
 * `req.user` and `req.sessionToken` are declared in
 * `src/types/augmentations.d.ts`, together with the `pino-http` reference
 * that `req.log` needs — one place for all of Express's augmentations.
 */

const COOKIE_NAMES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
  /* Auth.js v4 wrote these. Kept so a mid-upgrade session is not dropped. */
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
] as const;

function readToken(
  req: Request,
): { token: string; cookieName: string | null } | null {
  const header = req.headers.cookie;
  if (header) {
    const jar = parseCookie(header);
    for (const name of COOKIE_NAMES) {
      const value = jar[name];
      /*
       * The cookie name is carried along because it is the JWT's salt. Losing
       * it here would mean guessing at decode time.
       */
      if (value) return { token: value, cookieName: name };
    }
  }

  /*
   * `Authorization: Bearer <token>` is accepted as well, for server-to-server
   * calls from the Next.js app's own server actions, which hold the token but
   * are not a browser and so send no cookie. It is the same token and the
   * same checks — not a second credential type.
   */
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7).trim();
    if (token) return { token, cookieName: null };
  }

  return null;
}

export async function attachSession(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const found = readToken(req);
    if (!found) return next();

    const user =
      (await userFromJwt(found)) ?? (await userFromSessionRow(found.token));

    if (user) {
      req.user = user;
      req.sessionToken = found.token;
    }
    return next();
  } catch (err) {
    /*
     * A database hiccup while reading the session must not turn a public GET
     * into a 500. The request continues as anonymous; anything that actually
     * needs a user then fails with a clear 401 from `requireUser`.
     */
    req.log?.warn({ err }, "session lookup failed; continuing anonymously");
    return next();
  }
}

/**
 * Path 1: the cookie is an Auth.js JWT.
 *
 * Returns null — not throws — when it is not one, so the caller can try the
 * database-session path. A malformed or forged token fails to decrypt and
 * lands here as null too, which is the correct outcome either way.
 */
async function userFromJwt(found: {
  token: string;
  cookieName: string | null;
}): Promise<SessionUser | null> {
  /*
   * A bearer token has no cookie name to use as salt. Auth.js derives the
   * encryption key from (secret, salt) and the salt it encoded with is the
   * cookie name, so every candidate name has to be tried.
   */
  const salts = found.cookieName ? [found.cookieName] : [...COOKIE_NAMES];

  for (const salt of salts) {
    let payload: Record<string, unknown> | null = null;
    try {
      payload = (await decode({
        token: found.token,
        secret: env.AUTH_SECRET,
        salt,
      })) as Record<string, unknown> | null;
    } catch {
      /* Not encrypted with this salt. Try the next. */
      continue;
    }

    const sub = typeof payload?.sub === "string" ? payload.sub : null;
    if (!sub) continue;

    /*
     * The token says who; the database says whether they may. See the note
     * above — this is what keeps revocation immediate under a JWT strategy.
     */
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .where(and(eq(users.id, sub), isNull(users.disabledAt)))
      .limit(1);

    return rows[0] ?? null;
  }

  return null;
}

/** Path 2: the cookie is an opaque token with a row in `sessions`. */
async function userFromSessionRow(token: string): Promise<SessionUser | null> {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.sessionToken, token),
        /*
         * Compared by Postgres against its own clock. Comparing in Node adds
         * a second source of truth for "now" that drifts, and makes an
         * expired session something found-then-rejected rather than simply
         * not found.
         */
        gt(sessions.expires, new Date()),
        isNull(users.disabledAt),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

/** 401 unless signed in. */
export function requireUser(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(ApiError.unauthorized());
  return next();
}

/**
 * 403 unless the signed-in user holds one of these roles.
 *
 * Roles are checked as a set and not as a rank. A ladder (`role >= staff`)
 * reads neatly and then quietly grants admins every future role added below
 * them; naming the allowed roles at each route means adding a role never
 * silently widens an existing one.
 */
export function requireRole(...allowed: SessionUser["role"][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowed.includes(req.user.role)) {
      /*
       * The message names what is actually required. Saying "that area is
       * for staff accounts" to a signed-in staff member who has been refused
       * an admin-only action is both wrong and unactionable — they are staff,
       * and the sentence tells them nothing about what to do next.
       */
      const needs =
        allowed.length === 1
          ? `an ${allowed[0]} account`
          : `a ${allowed.slice(0, -1).join(", ")} or ${allowed.at(-1)} account`;
      return next(
        ApiError.forbidden(
          `That action needs ${needs}; yours is ${req.user.role}. ` +
            `Ask an administrator if you need it.`,
        ),
      );
    }
    return next();
  };
}

/** Convenience: the two roles that may see the office's side of the site. */
export const requireStaff = requireRole("staff", "admin");
/** Content, prices and user management. */
export const requireAdmin = requireRole("admin");
