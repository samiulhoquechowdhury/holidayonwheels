import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { verify } from "@node-rs/argon2";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users, accounts, sessions, verificationTokens } from "@/lib/db/schema";

/**
 * Authentication.
 *
 * ## Why the session strategy is `jwt` and not `database`
 *
 * It is not a preference. `@auth/core` refuses the other combination: with a
 * credentials provider and the database strategy it returns
 * `UnsupportedStrategy: Signing in with credentials only supported if JWT
 * strategy is enabled`, and its credentials callback encodes a JWT into the
 * cookie regardless of what the config asks for. Email and password means
 * JWT sessions.
 *
 * The usual objection to JWTs — that a disabled account keeps working until
 * the token expires — does not apply here, because the Express API re-reads
 * the user row on every request and refuses a disabled one. See
 * `api/src/middleware/session.ts`. So the cookie says *who*, and the database
 * still says *whether*.
 *
 * ## Why the adapter is configured anyway
 *
 * Under the JWT strategy the adapter's `sessions` table goes unused, so this
 * looks redundant. It is not: when Google sign-in is added, the adapter is
 * what creates the user row, links the `accounts` entry to an existing
 * account with the same email, and keeps one person from ending up with two
 * profiles. Configuring it now means that is a provider entry later rather
 * than a migration against live user rows.
 *
 * ## Why `authorize` says so little
 *
 * It returns null for every failure — no account, no password set, wrong
 * password, disabled — and the UI says only "those details did not match".
 * Distinguishing them turns the form into an account-existence oracle:
 * anybody could check whether an address is registered, which is worth
 * something to a phisher and nothing to the person signing in.
 */

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "traveller" | "staff" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "traveller" | "staff" | "admin";
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),

  session: {
    strategy: "jwt",
    /*
     * 30 days, refreshed a day at a time. Long enough that a traveller
     * checking their itinerary next month is not asked to sign in again;
     * short enough that an abandoned session on a shared machine does not
     * live for ever.
     */
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  providers: [
    Credentials({
      /*
       * Declared so Auth.js knows the field names. The built-in form is never
       * shown — `pages.signIn` points at this project's own.
       */
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();

        const found = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            image: users.image,
            role: users.role,
            passwordHash: users.passwordHash,
          })
          .from(users)
          .where(and(eq(users.email, email), isNull(users.disabledAt)))
          .limit(1);

        const user = found[0];

        /*
         * An account with no password is a real state, not missing data:
         * somebody the office created from a phone call, or who will sign in
         * with Google. It has to be refused rather than compared against an
         * empty string.
         */
        if (!user?.passwordHash) {
          /*
           * Spend the time anyway. Returning immediately for an unknown
           * address makes the response measurably faster than for a known
           * one — the same account-existence oracle the vague message is
           * there to prevent, just timed with a stopwatch instead of read off
           * the screen.
           */
          await verify(DUMMY_HASH, parsed.data.password).catch(() => false);
          return null;
        }

        const ok = await verify(user.passwordHash, parsed.data.password).catch(
          () => false,
        );
        if (!ok) return null;

        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, user.id));

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * Put the id and the role in the token.
     *
     * The role is re-read from the database when the token refreshes rather
     * than carried from sign-in for ever. Somebody promoted should not have
     * to sign out and in again, and — more importantly — somebody demoted
     * should lose the extra access without waiting 30 days.
     */
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role ?? "traveller";
        return token;
      }

      if (trigger === "update" || !token.role) {
        if (typeof token.sub === "string") {
          const rows = await db
            .select({ role: users.role, disabledAt: users.disabledAt })
            .from(users)
            .where(eq(users.id, token.sub))
            .limit(1);

          /* Disabled or deleted: drop the token, which signs them out. */
          if (!rows[0] || rows[0].disabledAt) return null;
          token.role = rows[0].role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.role =
        (token.role as "traveller" | "staff" | "admin") ?? "traveller";
      return session;
    },
  },

  /*
   * Auth.js reads AUTH_SECRET from the environment by itself. It is named
   * here so that a missing value fails at startup with a sentence somebody
   * can act on, rather than at the first sign-in with a decryption error.
   */
  secret: requireSecret(),

  trustHost: true,
});

function requireSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET is missing or shorter than 32 characters. Generate one " +
        "with `openssl rand -base64 48` and set it in .env.local — it must " +
        "match the value in api/.env, or the API cannot read this app's " +
        "session cookies.",
    );
  }
  return secret;
}

/**
 * A real argon2id hash of a value nobody knows, used only to burn the same
 * CPU as a genuine verification would. See the note in `authorize`.
 */
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$1c700NH7X7ZhmFTPgHrS4Q$OrD++AMa1biA10g/vrnVH/3pnMlaAG1AEyd55JSrCHg";
