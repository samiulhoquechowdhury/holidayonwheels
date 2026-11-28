import request from "supertest";
import { hash } from "@node-rs/argon2";
import { sql } from "drizzle-orm";
import { db, pool } from "../db/client";
import * as t from "../db/schema/index";
import { createApp } from "../app";

/**
 * The pieces every test file needs: an app, a signed-in user, a product.
 *
 * ## Why sessions are rows and not real Auth.js cookies
 *
 * The API accepts two credentials: an Auth.js JWT and an opaque token with a
 * row in `sessions`. Minting a JWT in a test would mean importing Auth.js's
 * encoder and keeping the salt in step with the cookie name — testing the
 * library rather than this service. Inserting a session row exercises the
 * same `attachSession` middleware and the same role and `disabled_at` checks,
 * which is the behaviour that belongs to us.
 *
 * The JWT path has its own test, in `session.test.ts`, where encoding it *is*
 * the thing under test.
 */
export const app = createApp();
export const api = () => request(app);

export type Role = "traveller" | "staff" | "admin";

/** A user plus a session token for them. */
export async function makeUser(
  role: Role,
  overrides: { email?: string; password?: string; disabled?: boolean } = {},
) {
  const email =
    overrides.email ??
    `${role}-${Math.random().toString(36).slice(2, 10)}@test.invalid`;

  const [user] = await db
    .insert(t.users)
    .values({
      email,
      name: `Test ${role}`,
      role,
      passwordHash: overrides.password
        ? await hash(overrides.password, { algorithm: 2 })
        : null,
      disabledAt: overrides.disabled ? new Date() : null,
    })
    .returning();

  const token = `test-${Math.random().toString(36).slice(2)}${Date.now()}`;
  await db.insert(t.sessions).values({
    sessionToken: token,
    userId: user!.id,
    /* An hour is plenty and keeps expiry out of the picture. */
    expires: new Date(Date.now() + 3_600_000),
  });

  return { ...user!, token, auth: `authjs.session-token=${token}` };
}

/** A published tour with one departure, for booking tests. */
export async function makeTour(
  overrides: { seats?: number; perPerson?: number; slug?: string } = {},
) {
  const slug =
    overrides.slug ?? `test-tour-${Math.random().toString(36).slice(2, 9)}`;

  const [tour] = await db
    .insert(t.tours)
    .values({
      slug,
      title: `Test tour ${slug}`,
      strapline: "s",
      region: "assam",
      states: ["assam"],
      types: ["group"],
      nights: 3,
      days: 4,
      fromPrice: 40_000,
      priceBands: [
        { fromPax: 2, perPerson: 40_000 },
        { fromPax: 6, perPerson: 36_000 },
      ],
      intro: "i",
      difficulty: "easy",
      groupSizeMax: 12,
      startsAt: "Guwahati",
      endsAt: "Guwahati",
      heroAlt: "alt",
      status: "published",
    })
    .returning();

  const [departure] = await db
    .insert(t.departures)
    .values({
      tourId: tour!.id,
      date: "2027-06-01",
      endDate: "2027-06-05",
      seatsLeft: overrides.seats ?? 10,
      perPerson: overrides.perPerson ?? 40_000,
      status: "open",
    })
    .returning();

  return { tour: tour!, departure: departure! };
}

/**
 * Empty the tables a test touches, children first.
 *
 * `truncate ... cascade` would be shorter and is deliberately avoided: it
 * silently empties tables not named here, so a test that depended on seeded
 * content would start failing for a reason nowhere in its own file. Listing
 * the tables keeps the blast radius visible.
 */
export async function resetTables() {
  await db.execute(sql`
    truncate table
      ${t.payments}, ${t.bookings}, ${t.permits},
      ${t.enquiries}, ${t.tripRequests},
      ${t.departures}, ${t.homestayRooms}, ${t.eventTicketTiers},
      ${t.auditLog}, ${t.sessions}, ${t.accounts},
      ${t.tours}, ${t.motorcycleTours}, ${t.homestays}, ${t.events},
      ${t.activities}, ${t.cafes}, ${t.journalPosts}, ${t.faqs},
      ${t.policies}, ${t.users}
    restart identity cascade
  `);
}

export { db, pool, t };
