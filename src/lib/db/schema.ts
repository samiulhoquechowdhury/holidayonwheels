import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * The four authentication tables, as this app sees them.
 *
 * ## Why this is a second definition, and why that was the lesser evil
 *
 * `api/src/db/schema/auth.ts` defines these same tables and is where
 * migrations are generated from. Importing it here was the first attempt and
 * it does not typecheck: the two packages resolve *different installed copies*
 * of `drizzle-orm` (pnpm keys the directory by peer dependencies, and the
 * API's copy has no React peers), so `users` from one is nominally a
 * different type from `users` in the other. Every query built from the
 * imported table failed with "`config` is protected but type `Column` is not
 * a class derived from `Column`".
 *
 * The alternatives were worse. Hoisting one copy with a tsconfig `paths`
 * override makes the types agree while the *runtime* still loads two
 * instances, which is the kind of mismatch that works until something does
 * an identity check. A pnpm workspace does not help either, because the peer
 * hashes still differ.
 *
 * So: duplicated on purpose, scoped to the four tables this app genuinely
 * needs, and **checked rather than trusted**. `pnpm db:check-schema` compares
 * every column below against the live database and fails if they disagree.
 * That turns the drift this duplication invites into a failing command
 * instead of a runtime error at sign-in.
 *
 * ## What is deliberately not here
 *
 * The catalogue — tours, homestays, bookings. This app does not query them
 * directly; it goes through the Express API, which is the whole point of
 * having one. Adding a table here should feel like a decision, not a
 * convenience.
 */

export const userRole = pgEnum("user_role", ["traveller", "staff", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  /* Auth.js's contract. These column names are not ours to tidy. */
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { withTimezone: true }),
  image: text("image"),

  passwordHash: text("password_hash"),
  role: userRole("role").notNull().default("traveller"),
  phone: text("phone"),
  disabledAt: timestamp("disabled_at", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

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
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);
