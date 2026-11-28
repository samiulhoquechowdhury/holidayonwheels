import { Router } from "express";
import {
  and,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client";
import * as t from "../db/schema/index";
import { ApiError, asyncHandler, pagination, parseOr400 } from "../lib/http";
import { recordAudit } from "../lib/audit";
import { requireStaff, requireUser } from "../middleware/session";
import { isoDate, rupees } from "../schemas/resources";

/**
 * Bookings, and the money against them.
 *
 * ## Why creating a booking is a transaction
 *
 * A booking against a departure has to take a seat from it. Read `seats_left`,
 * check it, then write `seats_left - n` and insert the booking, and two people
 * buying the last two seats at the same moment both read 2, both check, and
 * both write 1 — two bookings, one seat gone. The window is milliseconds wide
 * and it will be hit, because the last seats are exactly when everybody is
 * trying at once.
 *
 * So the decrement is a single guarded statement inside a transaction:
 *
 *     update departures set seats_left = seats_left - $n
 *      where id = $id and seats_left >= $n
 *
 * Postgres locks the row for the duration of that statement. The second
 * writer waits, re-evaluates `seats_left >= n` against the committed value,
 * matches nothing, and the transaction rolls back with a 409. This is the
 * reason `departures.seats_left` is a column and not a number inside a JSONB
 * array — see the note in `schema/content.ts`.
 */
export const bookingsRouter: Router = Router();

/**
 * The four kinds of thing a booking can point at.
 *
 * This was a lookup from kind to Drizzle column, but nothing ever read the
 * columns — only `keyof typeof` it for the union. A value that exists solely
 * to have its keys taken is a type wearing a runtime object's clothes, and
 * eslint said so.
 */
type ProductKind = "tour" | "moto" | "stay" | "event";

const companion = z
  .object({ name: z.string().min(1), age: z.number().int().min(0).optional() })
  .strict();

const bookingCreate = z
  .object({
    kind: z.enum(["tour", "moto", "stay", "event"]),
    /** The product's uuid. Which column it lands in follows from `kind`. */
    productId: z.string().uuid(),
    departureId: z.string().uuid().optional(),

    startDate: isoDate,
    endDate: isoDate,
    travellers: z.number().int().positive().max(60),
    total: rupees,
    deposit: rupees.default(0),

    leadName: z.string().min(1).max(200),
    leadEmail: z.string().email(),
    leadPhone: z.string().min(5).max(40),
    companions: z.array(companion).default([]),
    travellerNotes: z.string().max(4000).optional(),

    /** Set by staff booking on somebody's behalf; otherwise the caller. */
    userId: z.string().uuid().nullable().optional(),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.endDate < v.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "A booking cannot end before it starts.",
      });
    }
    if (v.deposit > v.total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deposit"],
        message: "The deposit cannot be more than the total.",
      });
    }
  });

/* ===================================================================== */
/* POST / — make a booking                                               */
/* ===================================================================== */

bookingsRouter.post(
  "/",
  requireUser,
  asyncHandler(async (req, res) => {
    const input = parseOr400(bookingCreate, req.body);
    const actor = req.user!;
    const isStaff = actor.role === "staff" || actor.role === "admin";

    /*
     * A traveller may only book for themselves. Without this, any signed-in
     * user could post `userId` and attach a booking to somebody else's
     * account — and then read it back from the account pages.
     */
    const ownerId = isStaff ? (input.userId ?? null) : actor.id;

    const booking = await db.transaction(async (tx) => {
      /* --- The product, and the snapshot taken from it ----------------- */
      const product = await loadProduct(tx, input.kind, input.productId);
      if (!product) {
        throw ApiError.badRequest(
          "That product does not exist, or is not available to book.",
          { productId: "Not found." },
        );
      }

      /* --- The seat, where there is one ------------------------------- */
      if (input.departureId) {
        const taken = await tx
          .update(t.departures)
          .set({
            seatsLeft: sql`${t.departures.seatsLeft} - ${input.travellers}`,
          })
          .where(
            and(
              eq(t.departures.id, input.departureId),
              /*
               * The guard. Evaluated by Postgres against the committed row
               * while it holds the lock, so a concurrent booking cannot slip
               * between the check and the write.
               */
              gte(t.departures.seatsLeft, input.travellers),
              /* And it must belong to the product being booked. */
              input.kind === "moto"
                ? eq(t.departures.motorcycleTourId, input.productId)
                : eq(t.departures.tourId, input.productId),
            ),
          )
          .returning({
            id: t.departures.id,
            seatsLeft: t.departures.seatsLeft,
          });

        if (taken.length === 0) {
          /*
           * Either the departure is not this product's, or there are no
           * longer enough seats. Both are the client's problem to resolve and
           * neither is a server fault, so: 409, and the transaction unwinds.
           */
          throw ApiError.conflict(
            `There are no longer ${input.travellers} seats left on that departure.`,
            { departureId: "Not enough seats." },
          );
        }
      }

      const [row] = await tx
        .insert(t.bookings)
        .values({
          reference: await uniqueReference(tx),
          userId: ownerId,
          kind: input.kind,
          [productKey(input.kind)]: input.productId,
          departureId: input.departureId ?? null,
          /* The snapshot. See the note in `schema/commerce.ts`. */
          title: product.title,
          itemSlug: product.slug,
          region: product.region,
          startDate: input.startDate,
          endDate: input.endDate,
          travellers: input.travellers,
          total: input.total,
          deposit: input.deposit,
          leadName: input.leadName,
          leadEmail: input.leadEmail,
          leadPhone: input.leadPhone,
          companions: input.companions,
          travellerNotes: input.travellerNotes ?? null,
        } as never)
        .returning();

      return row;
    });

    await recordAudit(req, {
      action: "create",
      entity: "bookings",
      entityId: booking!.id,
      entityLabel: `${booking!.reference} — ${booking!.title}`,
      after: { reference: booking!.reference, total: booking!.total },
    });

    res.status(201).json({ data: booking });
  }),
);

/* ===================================================================== */
/* GET / — the office's list                                             */
/* ===================================================================== */

bookingsRouter.get(
  "/",
  requireStaff,
  asyncHandler(async (req, res) => {
    const { limit, offset } = pagination(req);
    const where: (SQL | undefined)[] = [];

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q) {
      where.push(
        or(
          ilike(t.bookings.reference, `%${q}%`),
          ilike(t.bookings.leadName, `%${q}%`),
          ilike(t.bookings.leadEmail, `%${q}%`),
          ilike(t.bookings.title, `%${q}%`),
        ),
      );
    }
    if (typeof req.query.status === "string" && req.query.status.trim()) {
      where.push(
        inArray(
          t.bookings.status,
          req.query.status.split(",").map((s) => s.trim()) as never[],
        ),
      );
    }
    if (typeof req.query.kind === "string" && req.query.kind.trim()) {
      where.push(eq(t.bookings.kind, req.query.kind as never));
    }

    const predicate = where.length
      ? and(...where.filter(Boolean as never))
      : undefined;

    const [rows, counted, totals] = await Promise.all([
      db
        .select()
        .from(t.bookings)
        .where(predicate)
        .orderBy(desc(t.bookings.bookedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(t.bookings)
        .where(predicate),
      /*
       * Money for the current filter, not just the page. A list that shows
       * "page total" is useless for answering "how much have we sold"; the
       * admin shows this above the table.
       */
      db
        .select({
          booked: sql<number>`coalesce(sum(${t.bookings.total}), 0)::int`,
          paid: sql<number>`coalesce(sum(${t.bookings.amountPaid}), 0)::int`,
        })
        .from(t.bookings)
        .where(predicate),
    ]);

    res.json({
      data: rows,
      meta: {
        total: counted[0]?.total ?? 0,
        limit,
        offset,
        valueBooked: totals[0]?.booked ?? 0,
        valuePaid: totals[0]?.paid ?? 0,
      },
    });
  }),
);

/* ===================================================================== */
/* GET /:idOrReference                                                   */
/* ===================================================================== */

bookingsRouter.get(
  "/:key",
  requireUser,
  asyncHandler(async (req, res) => {
    const key = req.params.key!;
    const actor = req.user!;
    const isStaff = actor.role === "staff" || actor.role === "admin";

    const rows = await db
      .select()
      .from(t.bookings)
      .where(
        and(
          or(
            UUID_RE.test(key) ? eq(t.bookings.id, key) : undefined,
            eq(t.bookings.reference, key),
          ),
          /* A traveller may read only their own. */
          isStaff ? undefined : eq(t.bookings.userId, actor.id),
        ),
      )
      .limit(1);

    const booking = rows[0];
    if (!booking) throw ApiError.notFound("No booking with that reference.");

    const payments = await db
      .select()
      .from(t.payments)
      .where(eq(t.payments.bookingId, booking.id))
      .orderBy(desc(t.payments.receivedAt));

    res.json({
      data: {
        ...booking,
        /* Staff see who recorded what; a traveller sees only the amounts. */
        payments: isStaff
          ? payments
          : payments.map((p) => ({
              amount: p.amount,
              method: p.method,
              receivedAt: p.receivedAt,
            })),
      },
    });
  }),
);

/* ===================================================================== */
/* PATCH /:id — status and staff notes                                   */
/* ===================================================================== */

const bookingUpdate = z
  .object({
    status: z
      .enum(["pending-payment", "confirmed", "completed", "cancelled"])
      .optional(),
    staffNotes: z.string().max(8000).nullable().optional(),
    travellerNotes: z.string().max(4000).nullable().optional(),
  })
  .strict();

bookingsRouter.patch(
  "/:id",
  requireStaff,
  asyncHandler(async (req, res) => {
    const values = parseOr400(bookingUpdate, req.body);
    if (Object.keys(values).length === 0) {
      throw ApiError.badRequest("No fields to change were sent.");
    }

    const booking = await db.transaction(async (tx) => {
      const existing = (
        await tx
          .select()
          .from(t.bookings)
          .where(eq(t.bookings.id, req.params.id!))
          .limit(1)
      )[0];
      if (!existing) throw ApiError.notFound("No booking with that id.");

      /*
       * Cancelling returns the seats.
       *
       * Only on the transition *into* cancelled, and only once — re-cancelling
       * an already-cancelled booking must not hand back the same seats twice.
       * `cancelled_at` is both the record of when and the guard against that.
       */
      const cancelling =
        values.status === "cancelled" && existing.status !== "cancelled";

      if (cancelling && existing.departureId) {
        await tx
          .update(t.departures)
          .set({
            seatsLeft: sql`${t.departures.seatsLeft} + ${existing.travellers}`,
          })
          .where(eq(t.departures.id, existing.departureId));
      }

      const [row] = await tx
        .update(t.bookings)
        .set({
          ...values,
          ...(cancelling ? { cancelledAt: new Date() } : {}),
        } as never)
        .where(eq(t.bookings.id, existing.id))
        .returning();
      return row;
    });

    await recordAudit(req, {
      action: "update",
      entity: "bookings",
      entityId: booking!.id,
      entityLabel: booking!.reference,
      after: values,
    });

    res.json({ data: booking });
  }),
);

/* ===================================================================== */
/* POST /:id/payments — record money in (or out)                         */
/* ===================================================================== */

const paymentCreate = z
  .object({
    /** Negative for a refund. See the column comment. */
    amount: z
      .number()
      .int()
      .refine((n) => n !== 0, "A payment cannot be zero."),
    method: z.enum(["bank-transfer", "upi", "card", "cash", "other"]),
    externalReference: z.string().max(200).nullable().optional(),
    note: z.string().max(2000).nullable().optional(),
    receivedAt: isoDate.optional(),
  })
  .strict();

bookingsRouter.post(
  "/:id/payments",
  requireStaff,
  asyncHandler(async (req, res) => {
    const input = parseOr400(paymentCreate, req.body);

    const result = await db.transaction(async (tx) => {
      const existing = (
        await tx
          .select()
          .from(t.bookings)
          .where(eq(t.bookings.id, req.params.id!))
          .limit(1)
      )[0];
      if (!existing) throw ApiError.notFound("No booking with that id.");

      const [payment] = await tx
        .insert(t.payments)
        .values({
          bookingId: existing.id,
          amount: input.amount,
          method: input.method,
          externalReference: input.externalReference ?? null,
          note: input.note ?? null,
          recordedByUserId: req.user!.id,
          ...(input.receivedAt
            ? { receivedAt: new Date(input.receivedAt) }
            : {}),
        } as never)
        .returning();

      /*
       * `amount_paid` is recomputed from the ledger rather than incremented.
       * Incrementing drifts: one failed request retried by hand, and the
       * running total is permanently wrong with no way to tell. The sum is
       * the truth and this is a cache of it.
       *
       * The `bookings_paid_within_total` CHECK then rejects a payment that
       * would take the total over what was quoted — which is how an entry
       * typed as 150000 instead of 15000 gets caught.
       */
      const [summed] = await tx
        .select({
          paid: sql<number>`coalesce(sum(${t.payments.amount}), 0)::int`,
        })
        .from(t.payments)
        .where(eq(t.payments.bookingId, existing.id));

      const paid = summed?.paid ?? 0;
      if (paid < 0) {
        throw ApiError.badRequest(
          "That refund is larger than everything received for this booking.",
          { amount: "Refund exceeds the amount paid." },
        );
      }

      const [booking] = await tx
        .update(t.bookings)
        .set({
          amountPaid: paid,
          /*
           * Paid in full confirms it — but never un-confirms, and never
           * touches a cancelled booking.
           */
          ...(paid >= existing.total && existing.status === "pending-payment"
            ? { status: "confirmed" as const }
            : {}),
        })
        .where(eq(t.bookings.id, existing.id))
        .returning();

      return { payment, booking };
    });

    await recordAudit(req, {
      action: "payment",
      entity: "bookings",
      entityId: result.booking!.id,
      entityLabel: result.booking!.reference,
      after: {
        amount: input.amount,
        method: input.method,
        amountPaidNow: result.booking!.amountPaid,
      },
    });

    res.status(201).json({ data: result });
  }),
);

/* ===================================================================== */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function productKey(kind: ProductKind): string {
  return {
    tour: "tourId",
    moto: "motorcycleTourId",
    stay: "homestayId",
    event: "eventId",
  }[kind];
}

/**
 * The product's title, slug and region, for the booking's snapshot.
 *
 * Only `published` products can be booked: a draft is something the office is
 * still writing and an archived one no longer runs.
 *
 * Written as four explicit queries rather than one parameterised by a table
 * variable. The generic version needed `.from(table as never)` to typecheck,
 * and `never` propagated into the result so the returned row had no `title`,
 * `slug` or `region` at all — the cast silenced the error at the call site
 * and moved it here. Four short queries keep every column typed, and they
 * differ anyway: tours and expeditions have a `title`, houses and events a
 * `name`.
 */
async function loadProduct(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  kind: ProductKind,
  id: string,
): Promise<{ title: string; slug: string; region: string } | undefined> {
  const published = "published" as const;

  switch (kind) {
    case "tour": {
      const rows = await tx
        .select({
          title: t.tours.title,
          slug: t.tours.slug,
          region: t.tours.region,
        })
        .from(t.tours)
        .where(and(eq(t.tours.id, id), eq(t.tours.status, published)))
        .limit(1);
      return rows[0];
    }
    case "moto": {
      const rows = await tx
        .select({
          title: t.motorcycleTours.title,
          slug: t.motorcycleTours.slug,
          region: t.motorcycleTours.region,
        })
        .from(t.motorcycleTours)
        .where(
          and(
            eq(t.motorcycleTours.id, id),
            eq(t.motorcycleTours.status, published),
          ),
        )
        .limit(1);
      return rows[0];
    }
    case "stay": {
      const rows = await tx
        .select({
          title: t.homestays.name,
          slug: t.homestays.slug,
          region: t.homestays.region,
        })
        .from(t.homestays)
        .where(and(eq(t.homestays.id, id), eq(t.homestays.status, published)))
        .limit(1);
      return rows[0];
    }
    case "event": {
      const rows = await tx
        .select({
          title: t.events.name,
          slug: t.events.slug,
          region: t.events.region,
        })
        .from(t.events)
        .where(and(eq(t.events.id, id), eq(t.events.status, published)))
        .limit(1);
      return rows[0];
    }
  }
}

/**
 * A reference in the format the office already reads out: `HOW-4K7M2Q`.
 *
 * Generated rather than sequential, because sequential references tell a
 * customer how many bookings the business has taken and let anybody guess
 * their neighbours. The alphabet omits I, O, 0 and 1 — these get read over
 * the phone, and those four are the pairs people mishear.
 *
 * Collisions are checked rather than assumed away: 32^6 is large, but "large"
 * is not "unique", and a duplicate would fail the unique index at insert
 * time, losing the whole transaction including the seat that was just taken.
 */
async function uniqueReference(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<string> {
  const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 8; attempt += 1) {
    let body = "";
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    for (const b of bytes) body += ALPHABET[b % ALPHABET.length];
    const reference = `HOW-${body}`;

    const clash = await tx
      .select({ id: t.bookings.id })
      .from(t.bookings)
      .where(eq(t.bookings.reference, reference))
      .limit(1);
    if (clash.length === 0) return reference;
  }
  throw new ApiError(
    500,
    "reference_generation_failed",
    "Could not allocate a booking reference. Please try again.",
  );
}
