import { Router } from "express";
import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client";
import * as t from "../db/schema/index";
import { ApiError, asyncHandler, parseOr400 } from "../lib/http";
import { recordAudit } from "../lib/audit";
import { requireUser } from "../middleware/session";

/**
 * What a signed-in traveller may see and change about themselves.
 *
 * ## Why this is separate from `/users`
 *
 * `/users` is an administrator's view and every handler there is behind
 * `requireAdmin`. Serving a traveller's own record from the same endpoints
 * would mean each one deciding, per field, whether the caller is allowed —
 * and the first field anybody forgets is `role`, which is self-promotion to
 * administrator.
 *
 * So the split is by audience, not by table: nothing here accepts a user id
 * at all. Every query is scoped to `req.user.id`, which the session
 * middleware set, and which no request body can influence.
 */
export const accountRouter: Router = Router();

accountRouter.use(requireUser);

accountRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const me = req.user!;
    const today = new Date().toISOString().slice(0, 10);

    const [profile, upcoming, past, permits] = await Promise.all([
      db
        .select({
          id: t.users.id,
          name: t.users.name,
          email: t.users.email,
          phone: t.users.phone,
          image: t.users.image,
          emailVerified: t.users.emailVerified,
          createdAt: t.users.createdAt,
        })
        .from(t.users)
        .where(eq(t.users.id, me.id))
        .limit(1),

      /*
       * Split in SQL rather than fetched together and partitioned in the
       * browser. The account page shows them as two lists with different
       * orderings — soonest first for what is coming, most recent first for
       * what is done — and a cancelled trip belongs in neither.
       */
      db
        .select(BOOKING_COLUMNS)
        .from(t.bookings)
        .where(
          and(
            eq(t.bookings.userId, me.id),
            gte(t.bookings.endDate, today),
            sql`${t.bookings.status} <> 'cancelled'`,
          ),
        )
        .orderBy(asc(t.bookings.startDate)),

      db
        .select(BOOKING_COLUMNS)
        .from(t.bookings)
        .where(
          and(
            eq(t.bookings.userId, me.id),
            lt(t.bookings.endDate, today),
            sql`${t.bookings.status} <> 'cancelled'`,
          ),
        )
        .orderBy(desc(t.bookings.startDate)),

      db
        .select({
          id: t.permits.id,
          reference: t.permits.reference,
          state: t.permits.state,
          kind: t.permits.kind,
          travellerName: t.permits.travellerName,
          validFrom: t.permits.validFrom,
          validTo: t.permits.validTo,
          status: t.permits.status,
          submittedAt: t.permits.submittedAt,
          bookingId: t.permits.bookingId,
        })
        .from(t.permits)
        .where(eq(t.permits.userId, me.id))
        .orderBy(desc(t.permits.validFrom)),
    ]);

    if (!profile[0]) {
      /*
       * The session resolved but the row is gone. Only reachable if the user
       * was deleted between the session lookup and this query, which the
       * schema's `on delete cascade` on sessions makes very unlikely — but
       * returning a 200 with a null profile would make every consumer handle
       * a state that means "your account no longer exists".
       */
      throw ApiError.unauthorized("That account no longer exists.");
    }

    res.json({
      data: {
        profile: profile[0],
        upcomingBookings: upcoming,
        pastBookings: past,
        permits,
      },
    });
  }),
);

const profileUpdate = z
  .object({
    name: z.string().min(1).max(200).nullable().optional(),
    phone: z.string().max(40).nullable().optional(),
  })
  .strict();

accountRouter.patch(
  "/",
  asyncHandler(async (req, res) => {
    const values = parseOr400(profileUpdate, req.body);
    if (Object.keys(values).length === 0) {
      throw ApiError.badRequest("No fields to change were sent.");
    }

    /*
     * Note what is *not* here: email and role. Changing an email address is
     * an identity change that needs the new address verified before it takes
     * effect, or it becomes an account-takeover route — claim somebody's
     * address, then use password reset. Role is never self-serve.
     */
    const [row] = await db
      .update(t.users)
      .set(values as never)
      .where(eq(t.users.id, req.user!.id))
      .returning({
        id: t.users.id,
        name: t.users.name,
        email: t.users.email,
        phone: t.users.phone,
      });

    await recordAudit(req, {
      action: "update",
      entity: "users",
      entityId: req.user!.id,
      entityLabel: req.user!.email,
      after: values,
    });

    res.json({ data: row });
  }),
);

const BOOKING_COLUMNS = {
  id: t.bookings.id,
  reference: t.bookings.reference,
  kind: t.bookings.kind,
  title: t.bookings.title,
  itemSlug: t.bookings.itemSlug,
  region: t.bookings.region,
  startDate: t.bookings.startDate,
  endDate: t.bookings.endDate,
  travellers: t.bookings.travellers,
  total: t.bookings.total,
  amountPaid: t.bookings.amountPaid,
  status: t.bookings.status,
  bookedAt: t.bookings.bookedAt,
  /* Deliberately absent: `staffNotes`. It is the office's, not the guest's. */
} as const;
