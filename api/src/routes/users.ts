import { Router } from "express";
import { and, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { hash } from "@node-rs/argon2";
import { z } from "zod";
import { db } from "../db/client";
import * as t from "../db/schema/index";
import { ApiError, asyncHandler, pagination, parseOr400 } from "../lib/http";
import { recordAudit } from "../lib/audit";
import { requireAdmin } from "../middleware/session";

/**
 * Accounts, for an administrator.
 *
 * ## What is never returned
 *
 * `password_hash` is excluded from every response in this file by selecting
 * columns explicitly rather than `select()`. A hash is not a secret in the
 * way a password is, but it is an offline-cracking target and there is no
 * screen that needs it. Explicit column lists also mean a column added later
 * does not silently start appearing in API responses.
 *
 * ## Why accounts are disabled and not deleted
 *
 * `DELETE` here sets `disabled_at`. A real delete would take the person's
 * bookings with them or orphan them, and the business has to keep the record
 * of a trip it sold. Disabling is immediate — every request re-reads
 * `disabled_at`, so the next one fails — and reversible, which a delete is
 * not.
 */
export const usersRouter: Router = Router();

usersRouter.use(requireAdmin);

/** The shape every response in this file returns. No hash, ever. */
const PUBLIC_COLUMNS = {
  id: t.users.id,
  name: t.users.name,
  email: t.users.email,
  emailVerified: t.users.emailVerified,
  image: t.users.image,
  role: t.users.role,
  phone: t.users.phone,
  disabledAt: t.users.disabledAt,
  lastLoginAt: t.users.lastLoginAt,
  createdAt: t.users.createdAt,
  updatedAt: t.users.updatedAt,
} as const;

/**
 * At least 12 characters, and nothing else.
 *
 * No required mix of character classes. Composition rules push people to
 * `Password1!` and NIST SP 800-63B advises against them; length is what
 * actually costs an attacker. 12 is the floor, matching the seed script.
 */
const password = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(200, "That is longer than 200 characters.");

const userCreate = z
  .object({
    email: z.string().email().toLowerCase(),
    name: z.string().min(1).max(200).nullable().optional(),
    phone: z.string().max(40).nullable().optional(),
    role: z.enum(["traveller", "staff", "admin"]).default("traveller"),
    password: password.optional(),
  })
  .strict();

const userUpdate = z
  .object({
    name: z.string().min(1).max(200).nullable().optional(),
    phone: z.string().max(40).nullable().optional(),
    role: z.enum(["traveller", "staff", "admin"]).optional(),
    password: password.optional(),
    /** `true` locks the account out, `false` restores it. */
    disabled: z.boolean().optional(),
  })
  .strict();

/* ===================================================================== */

usersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { limit, offset } = pagination(req);
    const where: (SQL | undefined)[] = [];

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q) {
      where.push(
        or(ilike(t.users.email, `%${q}%`), ilike(t.users.name, `%${q}%`)),
      );
    }
    if (typeof req.query.role === "string" && req.query.role.trim()) {
      where.push(
        inArray(
          t.users.role,
          req.query.role.split(",").map((s) => s.trim()) as never[],
        ),
      );
    }
    const predicate = where.length
      ? and(...where.filter((p): p is SQL => Boolean(p)))
      : undefined;

    const [rows, counted] = await Promise.all([
      db
        .select(PUBLIC_COLUMNS)
        .from(t.users)
        .where(predicate)
        .orderBy(desc(t.users.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(t.users)
        .where(predicate),
    ]);

    res.json({
      data: rows,
      meta: { total: counted[0]?.total ?? 0, limit, offset },
    });
  }),
);

usersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const rows = await db
      .select(PUBLIC_COLUMNS)
      .from(t.users)
      .where(eq(t.users.id, req.params.id!))
      .limit(1);
    if (!rows[0]) throw ApiError.notFound("No account with that id.");

    const bookings = await db
      .select({
        id: t.bookings.id,
        reference: t.bookings.reference,
        title: t.bookings.title,
        startDate: t.bookings.startDate,
        total: t.bookings.total,
        amountPaid: t.bookings.amountPaid,
        status: t.bookings.status,
      })
      .from(t.bookings)
      .where(eq(t.bookings.userId, rows[0].id))
      .orderBy(desc(t.bookings.bookedAt));

    res.json({ data: { ...rows[0], bookings } });
  }),
);

usersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = parseOr400(userCreate, req.body);

    const [row] = await db
      .insert(t.users)
      .values({
        email: input.email,
        name: input.name ?? null,
        phone: input.phone ?? null,
        role: input.role,
        /*
         * No password is a valid account: somebody invited who will sign in
         * with Google, or a traveller record the office created from a phone
         * call. The credentials provider refuses an account with no hash
         * rather than comparing against an empty string.
         */
        passwordHash: input.password
          ? await hash(input.password, { algorithm: 2 })
          : null,
      })
      .returning(PUBLIC_COLUMNS);

    await recordAudit(req, {
      action: "create",
      entity: "users",
      entityId: row!.id,
      entityLabel: row!.email,
      after: { email: row!.email, role: row!.role },
    });

    res.status(201).json({ data: row });
  }),
);

usersRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = parseOr400(userUpdate, req.body);
    if (Object.keys(input).length === 0) {
      throw ApiError.badRequest("No fields to change were sent.");
    }

    const existing = (
      await db
        .select(PUBLIC_COLUMNS)
        .from(t.users)
        .where(eq(t.users.id, req.params.id!))
        .limit(1)
    )[0];
    if (!existing) throw ApiError.notFound("No account with that id.");

    /*
     * An administrator may not remove their own admin rights or lock
     * themselves out. Both are one click from an organisation with no
     * administrator at all, recoverable only by someone with database access.
     */
    if (existing.id === req.user!.id) {
      if (input.role && input.role !== "admin") {
        throw ApiError.badRequest(
          "You cannot remove your own administrator access. Ask another administrator.",
          { role: "Not allowed on your own account." },
        );
      }
      if (input.disabled === true) {
        throw ApiError.badRequest("You cannot disable your own account.", {
          disabled: "Not allowed on your own account.",
        });
      }
    }

    /*
     * And the last remaining administrator may not be demoted or disabled by
     * anyone, including another administrator — the check above only covers
     * somebody acting on themselves.
     */
    if (
      existing.role === "admin" &&
      (input.disabled === true || (input.role && input.role !== "admin"))
    ) {
      const [{ remaining } = { remaining: 0 }] = await db
        .select({ remaining: sql<number>`count(*)::int` })
        .from(t.users)
        .where(
          and(eq(t.users.role, "admin"), sql`${t.users.disabledAt} is null`),
        );

      if (remaining <= 1) {
        throw ApiError.badRequest(
          "This is the only active administrator. Promote somebody else first.",
          { role: "Last administrator." },
        );
      }
    }

    const [row] = await db
      .update(t.users)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.password !== undefined
          ? { passwordHash: await hash(input.password, { algorithm: 2 }) }
          : {}),
        ...(input.disabled !== undefined
          ? { disabledAt: input.disabled ? new Date() : null }
          : {}),
      })
      .where(eq(t.users.id, existing.id))
      .returning(PUBLIC_COLUMNS);

    /*
     * Changing a password or disabling an account ends the person's sessions.
     * Without this, a password changed because it leaked leaves every session
     * opened with the old one still working.
     */
    if (input.password !== undefined || input.disabled === true) {
      await db.delete(t.sessions).where(eq(t.sessions.userId, existing.id));
    }

    await recordAudit(req, {
      action: "update",
      entity: "users",
      entityId: row!.id,
      entityLabel: row!.email,
      before: { role: existing.role, disabledAt: existing.disabledAt },
      after: {
        role: row!.role,
        disabledAt: row!.disabledAt,
        /* Never the hash, and never the password. Only that it changed. */
        ...(input.password !== undefined ? { passwordChanged: true } : {}),
      },
    });

    res.json({ data: row });
  }),
);

usersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user!.id) {
      throw ApiError.badRequest("You cannot disable your own account.");
    }
    const [row] = await db
      .update(t.users)
      .set({ disabledAt: new Date() })
      .where(eq(t.users.id, req.params.id!))
      .returning(PUBLIC_COLUMNS);
    if (!row) throw ApiError.notFound("No account with that id.");

    await db.delete(t.sessions).where(eq(t.sessions.userId, row.id));

    await recordAudit(req, {
      action: "disable",
      entity: "users",
      entityId: row.id,
      entityLabel: row.email,
      after: { disabledAt: row.disabledAt },
    });

    res.json({ data: row });
  }),
);
