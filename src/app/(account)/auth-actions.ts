"use server";

import { unstable_rethrow } from "next/navigation";
import { AuthError } from "next-auth";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * Signing in, registering, and signing out.
 *
 * ## Why these are server actions and not a client fetch
 *
 * Same reason the admin's form is: a plain `<form action={...}>` works before
 * hydration. Somebody on a slow connection in Guwahati can sign in while the
 * JavaScript is still arriving, and the progressive-enhancement layer on top
 * only adds the inline error message.
 *
 * ## The redirect-throws-an-error trap
 *
 * `signIn()` and `redirect()` both signal success by *throwing* — Next
 * unwinds the request with a special error it recognises. A bare
 * `try { ... } catch { return error }` therefore catches the success case and
 * reports a failure, so the user sees "something went wrong" on a sign-in
 * that worked.
 *
 * `unstable_rethrow` is the supported way to let those through: it re-throws
 * Next's control-flow errors (redirect and not-found) and returns for
 * everything else. The alternative is importing `isRedirectError` from
 * `next/dist/...`, which is an internal path that can move between patch
 * releases — and when it moves, the failure is this silent one again.
 */

export type AuthResult = { ok: false; error: string; field?: string };

const emailField = z
  .string()
  .min(1, "Enter your email address.")
  .email("That does not look like an email address.")
  .transform((v) => v.trim().toLowerCase());

/**
 * At least 12 characters, and no composition rules.
 *
 * Mixed-class requirements push people to `Password1!`; NIST SP 800-63B
 * advises against them. Length is what actually costs an attacker. The floor
 * matches the API's validator and the seed script, so a password set in one
 * place is never rejected by another.
 */
const passwordField = z
  .string()
  .min(12, "Use at least 12 characters — a short phrase works well.")
  .max(200, "That is longer than 200 characters.");

const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password."),
});

const registerSchema = z.object({
  name: z.string().min(1, "Enter your name.").max(200),
  email: emailField,
  password: passwordField,
  phone: z
    .string()
    .max(40)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
});

export async function signInWithPassword(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult | null> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first?.message ?? "Check the details and try again.",
      field: first?.path[0] as string | undefined,
    };
  }

  const redirectTo = safeRedirect(formData.get("redirectTo"));

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });
    return null;
  } catch (error) {
    /* Success unwinds through here. See the note above. */
    unstable_rethrow(error);

    if (error instanceof AuthError) {
      /*
       * One message for every credential failure — unknown address, no
       * password set, wrong password, disabled account. Telling them apart
       * turns this form into an account-existence oracle.
       */
      return {
        ok: false,
        error: "Those details did not match an account.",
        field: "password",
      };
    }

    throw error;
  }
}

export async function registerAccount(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult | null> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") ?? undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first?.message ?? "Check the details and try again.",
      field: first?.path[0] as string | undefined,
    };
  }

  const { name, email, password, phone } = parsed.data;

  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      /*
       * This one *does* disclose that the address is taken, unlike sign-in.
       * It has to: the alternative is refusing to create the account without
       * saying why, which is unusable. The mitigation is that registration is
       * the slow, rate-limitable path and sign-in is not.
       */
      return {
        ok: false,
        error:
          "There is already an account with that email address. Try signing in instead.",
        field: "email",
      };
    }

    await db.insert(users).values({
      name,
      email,
      phone,
      /*
       * Argon2id. Not bcrypt, which silently truncates at 72 bytes — a long
       * passphrase would have its tail ignored and nobody would ever know.
       */
      passwordHash: await hash(password, { algorithm: 2 }),
      /*
       * `role` is deliberately not settable from this form. It defaults to
       * `traveller` in the schema. Accepting it here would be self-promotion
       * to administrator via a crafted POST — the form fields are not the
       * boundary, the action is.
       *
       * `emailVerified` stays null: nothing has verified it. The column is
       * honest about that even though no feature uses it yet.
       */
    });

    await signIn("credentials", {
      email,
      password,
      redirectTo: safeRedirect(formData.get("redirectTo")),
    });
    return null;
  } catch (error) {
    unstable_rethrow(error);

    /* 23505: another request created the same address between the check and
     * the insert. The unique index is what actually prevents it; this turns
     * the race into the same sentence as the check above. */
    if ((error as { code?: string }).code === "23505") {
      return {
        ok: false,
        error:
          "There is already an account with that email address. Try signing in instead.",
        field: "email",
      };
    }

    if (error instanceof AuthError) {
      return {
        ok: false,
        error:
          "Your account was created, but signing in failed. Try signing in.",
      };
    }

    throw error;
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

/**
 * Only same-site paths may be redirected to after sign-in.
 *
 * `?redirectTo=https://example.com` on a sign-in link is an open redirect: it
 * makes a link that genuinely starts on this site and lands on somebody
 * else's, which is what makes a phishing page plausible. Anything not
 * beginning with a single `/` is discarded, and `//host` is rejected too
 * because a protocol-relative URL is absolute.
 */
function safeRedirect(value: FormDataEntryValue | null): string {
  const fallback = "/account";
  if (typeof value !== "string" || !value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
