import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
  integer,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * Identity: people, their credentials, and their sessions.
 *
 * ## Why these four tables look the way they do
 *
 * `users`, `accounts`, `sessions` and `verification_tokens` are the shape
 * Auth.js's Drizzle adapter expects, down to the column names. They are not
 * designed here and they must not be "tidied" — renaming `sessionToken` to
 * `session_token_id`, or making `accounts` use a surrogate key, breaks the
 * adapter at runtime rather than at compile time. Extra columns are safe to
 * add and that is where everything this project needs beyond sign-in lives.
 *
 * ## Why database sessions and not JWTs
 *
 * Auth.js runs in the Next.js app; the API is a separate Express process.
 * With JWT sessions, Express would have to decrypt Auth.js's JWE cookie,
 * which means duplicating the secret and reimplementing its token format —
 * crypto written twice, in two languages' worth of libraries, to answer a
 * question Postgres can answer with one indexed lookup. With database
 * sessions, Express reads the cookie, selects the row, and joins to `users`.
 *
 * It also makes revocation real: deleting the row logs somebody out
 * everywhere, immediately. A signed JWT stays valid until it expires no
 * matter what the database says, which is the wrong default for a system
 * where staff accounts can be disabled.
 *
 * ## Why `accounts` exists before Google does
 *
 * Google sign-in is a later phase, but the table it needs costs nothing now
 * and retrofitting it later means a migration against live user rows. When
 * Google lands, a provider entry is added in the Next.js config and rows
 * appear here; no schema change, and an existing password user can link
 * Google to the same `userId` rather than ending up with two accounts.
 */

/**
 * What somebody is allowed to do.
 *
 * Three levels, because the business has three: the people who book trips,
 * the office staff who answer them, and whoever is allowed to change prices
 * and make other staff. `staff` deliberately cannot edit content or users —
 * that separation is the whole reason this is not a boolean.
 */
export const userRole = pgEnum("user_role", ["traveller", "staff", "admin"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    /* --- The Auth.js contract ------------------------------------------- */
    name: text("name"),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("emailVerified", { withTimezone: true }),
    image: text("image"),

    /* --- Ours ----------------------------------------------------------- */

    /**
     * Argon2id. Null is a legitimate state, not missing data: a user who
     * signed up with Google has no password, and the credentials provider
     * must refuse them rather than compare against an empty string.
     */
    passwordHash: text("password_hash"),

    role: userRole("role").notNull().default("traveller"),

    /** Travellers give one at booking; it is how the office actually calls. */
    phone: text("phone"),

    /**
     * Set to lock an account out without deleting it. Deleting a user would
     * take their bookings with them (or orphan them), and the business needs
     * to keep the record of a trip it sold. Every session check tests this,
     * so disabling somebody ejects them on their next request.
     */
    disabledAt: timestamp("disabled_at", { withTimezone: true }),

    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("users_role_idx").on(t.role)],
);

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [
    /*
     * The adapter looks an account up by (provider, providerAccountId) — the
     * pair Google hands back — so that pair is the key. A surrogate id here
     * would need a unique index on the same two columns anyway.
     */
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("accounts_user_id_idx").on(t.userId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("sessionToken").primaryKey(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);
