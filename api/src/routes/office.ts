import { Router } from "express";
import {
  and,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client";
import * as t from "../db/schema/index";
import { ApiError, asyncHandler, pagination, parseOr400 } from "../lib/http";
import { recordAudit } from "../lib/audit";
import { requireStaff } from "../middleware/session";

/**
 * The office's inbox: enquiries and planner requests, and the figures above
 * them.
 *
 * Both tables are worked the same way — triaged, assigned, annotated, closed
 * — so they share the handler shapes below. They are not merged into one
 * resource: an enquiry is a sentence somebody typed and a trip request is a
 * priced itinerary, and a list that mixes them cannot sort by value.
 */
export const officeRouter: Router = Router();

officeRouter.use(requireStaff);

const triage = z
  .object({
    staffNotes: z.string().max(8000).nullable().optional(),
    /** Null unassigns. */
    assignedToUserId: z.string().uuid().nullable().optional(),
  })
  .strict();

const enquiryUpdate = triage.extend({
  status: z.enum(["new", "in_progress", "closed"]).optional(),
});

const tripRequestUpdate = triage.extend({
  status: z
    .enum(["new", "in_progress", "quoted", "confirmed", "lost", "closed"])
    .optional(),
});

/* ===================================================================== */
/* Enquiries                                                             */
/* ===================================================================== */

officeRouter.get(
  "/enquiries",
  asyncHandler(async (req, res) => {
    const { limit, offset } = pagination(req);
    const where: (SQL | undefined)[] = [];

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q) {
      where.push(
        or(
          ilike(t.enquiries.name, `%${q}%`),
          ilike(t.enquiries.email, `%${q}%`),
          ilike(t.enquiries.message, `%${q}%`),
        ),
      );
    }
    if (typeof req.query.status === "string" && req.query.status.trim()) {
      where.push(
        inArray(
          t.enquiries.status,
          req.query.status.split(",").map((s) => s.trim()) as never[],
        ),
      );
    }
    /* `?mine=1` — the only filter anybody actually uses every morning. */
    if (req.query.mine === "1") {
      where.push(eq(t.enquiries.assignedToUserId, req.user!.id));
    }
    if (req.query.unassigned === "1") {
      where.push(isNull(t.enquiries.assignedToUserId));
    }

    const predicate = where.length
      ? and(...where.filter((p): p is SQL => Boolean(p)))
      : undefined;

    const [rows, counted] = await Promise.all([
      db
        .select()
        .from(t.enquiries)
        .where(predicate)
        .orderBy(desc(t.enquiries.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(t.enquiries)
        .where(predicate),
    ]);

    res.json({
      data: rows,
      meta: { total: counted[0]?.total ?? 0, limit, offset },
    });
  }),
);

officeRouter.patch(
  "/enquiries/:id",
  asyncHandler(async (req, res) => {
    const values = parseOr400(enquiryUpdate, req.body);
    if (Object.keys(values).length === 0) {
      throw ApiError.badRequest("No fields to change were sent.");
    }
    const [row] = await db
      .update(t.enquiries)
      .set({
        ...values,
        /*
         * `handled_at` is stamped when the status first leaves `new`, and
         * never overwritten after. It answers "how long did this sit before
         * anyone touched it", which is the number worth having; overwriting
         * it on every later edit would turn it into a second `updated_at`.
         */
        ...(values.status && values.status !== "new"
          ? { handledAt: sql`coalesce(${t.enquiries.handledAt}, now())` }
          : {}),
      } as never)
      .where(eq(t.enquiries.id, req.params.id!))
      .returning();
    if (!row) throw ApiError.notFound("No enquiry with that id.");

    await recordAudit(req, {
      action: "update",
      entity: "enquiries",
      entityId: row.id,
      entityLabel: row.email,
      after: values,
    });

    res.json({ data: row });
  }),
);

/* ===================================================================== */
/* Trip requests                                                         */
/* ===================================================================== */

officeRouter.get(
  "/trip-requests",
  asyncHandler(async (req, res) => {
    const { limit, offset } = pagination(req);
    const where: (SQL | undefined)[] = [];

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q) {
      where.push(
        or(
          ilike(t.tripRequests.reference, `%${q}%`),
          ilike(t.tripRequests.leadName, `%${q}%`),
          ilike(t.tripRequests.leadEmail, `%${q}%`),
        ),
      );
    }
    if (typeof req.query.status === "string" && req.query.status.trim()) {
      where.push(
        inArray(
          t.tripRequests.status,
          req.query.status.split(",").map((s) => s.trim()) as never[],
        ),
      );
    }
    if (req.query.mine === "1") {
      where.push(eq(t.tripRequests.assignedToUserId, req.user!.id));
    }

    const predicate = where.length
      ? and(...where.filter((p): p is SQL => Boolean(p)))
      : undefined;

    const [rows, counted, value] = await Promise.all([
      db
        .select()
        .from(t.tripRequests)
        .where(predicate)
        .orderBy(desc(t.tripRequests.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(t.tripRequests)
        .where(predicate),
      db
        .select({
          quoted: sql<number>`coalesce(sum(${t.tripRequests.total}), 0)::int`,
        })
        .from(t.tripRequests)
        .where(predicate),
    ]);

    res.json({
      data: rows,
      meta: {
        total: counted[0]?.total ?? 0,
        limit,
        offset,
        valueQuoted: value[0]?.quoted ?? 0,
      },
    });
  }),
);

officeRouter.get(
  "/trip-requests/:key",
  asyncHandler(async (req, res) => {
    const key = req.params.key!;
    const rows = await db
      .select()
      .from(t.tripRequests)
      .where(
        or(
          UUID_RE.test(key) ? eq(t.tripRequests.id, key) : undefined,
          eq(t.tripRequests.reference, key),
        ),
      )
      .limit(1);
    if (!rows[0])
      throw ApiError.notFound("No trip request with that reference.");
    res.json({ data: rows[0] });
  }),
);

officeRouter.patch(
  "/trip-requests/:id",
  asyncHandler(async (req, res) => {
    const values = parseOr400(tripRequestUpdate, req.body);
    if (Object.keys(values).length === 0) {
      throw ApiError.badRequest("No fields to change were sent.");
    }
    const [row] = await db
      .update(t.tripRequests)
      .set({
        ...values,
        ...(values.status && values.status !== "new"
          ? { handledAt: sql`coalesce(${t.tripRequests.handledAt}, now())` }
          : {}),
      } as never)
      .where(eq(t.tripRequests.id, req.params.id!))
      .returning();
    if (!row) throw ApiError.notFound("No trip request with that id.");

    await recordAudit(req, {
      action: "update",
      entity: "trip_requests",
      entityId: row.id,
      entityLabel: row.reference,
      after: values,
    });

    res.json({ data: row });
  }),
);

/* ===================================================================== */
/* The dashboard                                                         */
/* ===================================================================== */

/**
 * The figures on the admin's front page.
 *
 * ## Why one endpoint and not six
 *
 * The dashboard needs about a dozen numbers. As separate endpoints that is a
 * dozen round trips on page load, each with its own session lookup. As one,
 * it is one request and the queries run concurrently against the pool.
 *
 * ## Why "needs attention" is a count and not a list
 *
 * The page shows a number and links to the filtered list. Returning the rows
 * as well would mean this endpoint grows every time the dashboard gains a
 * panel, and the lists already exist above with pagination and search.
 */
officeRouter.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);
    const today = now.toISOString().slice(0, 10);

    const [
      enquiryCounts,
      tripCounts,
      bookingCounts,
      money,
      recentMoney,
      upcoming,
      lowSeats,
      contentCounts,
      recentActivity,
    ] = await Promise.all([
      db
        .select({ status: t.enquiries.status, n: sql<number>`count(*)::int` })
        .from(t.enquiries)
        .groupBy(t.enquiries.status),
      db
        .select({
          status: t.tripRequests.status,
          n: sql<number>`count(*)::int`,
        })
        .from(t.tripRequests)
        .groupBy(t.tripRequests.status),
      db
        .select({ status: t.bookings.status, n: sql<number>`count(*)::int` })
        .from(t.bookings)
        .groupBy(t.bookings.status),
      /* Lifetime, excluding cancellations — a cancelled trip is not revenue. */
      db
        .select({
          booked: sql<number>`coalesce(sum(${t.bookings.total}), 0)::int`,
          paid: sql<number>`coalesce(sum(${t.bookings.amountPaid}), 0)::int`,
          outstanding: sql<number>`coalesce(sum(${t.bookings.total} - ${t.bookings.amountPaid}), 0)::int`,
        })
        .from(t.bookings)
        .where(sql`${t.bookings.status} <> 'cancelled'`),
      db
        .select({
          received: sql<number>`coalesce(sum(${t.payments.amount}), 0)::int`,
        })
        .from(t.payments)
        .where(gte(t.payments.receivedAt, thirtyDaysAgo)),
      /* Departing within the next 30 days and not cancelled. */
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(t.bookings)
        .where(
          and(
            gte(t.bookings.startDate, today),
            lt(
              t.bookings.startDate,
              new Date(now.getTime() + 30 * 86_400_000)
                .toISOString()
                .slice(0, 10),
            ),
            sql`${t.bookings.status} <> 'cancelled'`,
          ),
        ),
      /*
       * Departures nearly full, so the office can decide whether to open
       * another. Future-dated only: a sold-out date last March is not news.
       */
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(t.departures)
        .where(
          and(
            gte(t.departures.date, today),
            lt(t.departures.seatsLeft, 3),
            sql`${t.departures.seatsLeft} > 0`,
          ),
        ),
      db
        .select({
          tours: sql<number>`(select count(*) from ${t.tours} where status = 'published')::int`,
          tourDrafts: sql<number>`(select count(*) from ${t.tours} where status = 'draft')::int`,
          homestays: sql<number>`(select count(*) from ${t.homestays} where status = 'published')::int`,
          expeditions: sql<number>`(select count(*) from ${t.motorcycleTours} where status = 'published')::int`,
          events: sql<number>`(select count(*) from ${t.events} where status = 'published')::int`,
          activities: sql<number>`(select count(*) from ${t.activities} where status = 'published')::int`,
        })
        .from(sql`(select 1) as _`),
      db
        .select({
          action: t.auditLog.action,
          entity: t.auditLog.entity,
          entityLabel: t.auditLog.entityLabel,
          actorEmail: t.auditLog.actorEmail,
          createdAt: t.auditLog.createdAt,
        })
        .from(t.auditLog)
        .orderBy(desc(t.auditLog.createdAt))
        .limit(12),
    ]);

    /** `[{status, n}]` -> `{status: n}`, with zeroes for the absent ones. */
    const tally = (
      rows: { status: string; n: number }[],
      statuses: string[],
    ): Record<string, number> => {
      const out: Record<string, number> = {};
      for (const s of statuses) out[s] = 0;
      for (const r of rows) out[r.status] = r.n;
      return out;
    };

    res.json({
      data: {
        enquiries: tally(enquiryCounts, ["new", "in_progress", "closed"]),
        tripRequests: tally(tripCounts, [
          "new",
          "in_progress",
          "quoted",
          "confirmed",
          "lost",
          "closed",
        ]),
        bookings: tally(bookingCounts, [
          "pending-payment",
          "confirmed",
          "completed",
          "cancelled",
        ]),
        money: {
          ...(money[0] ?? { booked: 0, paid: 0, outstanding: 0 }),
          receivedLast30Days: recentMoney[0]?.received ?? 0,
        },
        attention: {
          departingWithin30Days: upcoming[0]?.n ?? 0,
          departuresNearlyFull: lowSeats[0]?.n ?? 0,
          newEnquiries: tally(enquiryCounts, ["new"]).new,
          newTripRequests: tally(tripCounts, ["new"]).new,
        },
        content: contentCounts[0] ?? {},
        recentActivity,
      },
    });
  }),
);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
