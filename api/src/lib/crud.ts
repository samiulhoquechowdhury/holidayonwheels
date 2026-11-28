import { Router } from "express";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  getTableColumns,
  type SQL,
  type AnyColumn,
} from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { z, type ZodTypeAny } from "zod";
import { db } from "../db/client";
import {
  ApiError,
  asyncHandler,
  fieldErrors,
  pagination,
  parseOr400,
} from "./http";
import { recordAudit, diff } from "./audit";
import { requireAdmin } from "../middleware/session";

/**
 * One router, for every editable catalogue table.
 *
 * ## Why a factory and not fifteen route files
 *
 * Tours, homestays, expeditions, events, activities, cafés, journal posts,
 * FAQs and the rest need the same seven endpoints with the same pagination,
 * the same search, the same publish/unpublish, the same audit entries and the
 * same error translation. Written out fifteen times, the fourth copy already
 * disagrees with the first about whether `?q=` is case-insensitive, and a fix
 * to one is a fix to one. Written once, every resource behaves identically
 * and a change to the contract is a change in a single place.
 *
 * What differs per resource is declared, not coded: the table, its zod
 * schemas, which columns are searched, and how it sorts by default.
 *
 * ## Who can do what
 *
 * Reads are public but **filtered**: an anonymous caller sees only
 * `published` rows. Staff see drafts too, because the whole point of a draft
 * is that the office can look at it before anybody else can. Writes are
 * admin-only — `staff` answer enquiries, they do not change prices.
 */

export type ResourceConfig = {
  /** Plural, lower-case, as it appears in the path and the audit log. */
  name: string;
  table: PgTable;
  /** The primary key. Always `id` in this schema, but passed explicitly. */
  idColumn: AnyColumn;
  /** The URL-facing key, where the table has one. */
  slugColumn?: AnyColumn;
  /** What a human recognises in the audit log: a title or a name. */
  labelColumn?: AnyColumn;
  /** Present on everything except the key/value planner tables. */
  statusColumn?: AnyColumn;
  /** Columns `?q=` searches, case-insensitively. */
  searchColumns?: AnyColumn[];
  /** Columns `?state=`, `?category=` and friends filter on, by name. */
  filterColumns?: Record<string, AnyColumn>;
  defaultOrder: SQL[];
  createSchema: ZodTypeAny;
  updateSchema: ZodTypeAny;
};

export function resourceRouter(cfg: ResourceConfig): Router {
  const router = Router();
  const { table, idColumn, slugColumn, labelColumn, statusColumn, name } = cfg;

  /* Resolved once. See `columnKeyResolver` for why this is not per request. */
  const keyOf = columnKeyResolver(table);
  const idKey = keyOf(idColumn);
  const labelKey = labelColumn ? keyOf(labelColumn) : null;
  const statusKey = statusColumn ? keyOf(statusColumn) : null;

  /** Rows an anonymous caller may see. Staff see everything. */
  const visibility = (isStaff: boolean): SQL | undefined => {
    if (isStaff || !statusColumn) return undefined;
    return eq(statusColumn, "published" as never);
  };

  /* ------------------------------------------------------------------ */
  /* GET /                                                              */
  /* ------------------------------------------------------------------ */
  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const isStaff = req.user?.role === "staff" || req.user?.role === "admin";
      const { limit, offset } = pagination(req);
      const where: (SQL | undefined)[] = [visibility(isStaff)];

      /* `?q=` — case-insensitive, across the declared columns. */
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
      if (q && cfg.searchColumns?.length) {
        where.push(
          or(...cfg.searchColumns.map((c) => ilike(c, `%${escapeLike(q)}%`))),
        );
      }

      /* `?status=draft,published` — staff only; ignored for everyone else,
       * because honouring it for the public would let `?status=draft` read
       * unpublished content. */
      if (isStaff && statusColumn && typeof req.query.status === "string") {
        const wanted = req.query.status
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        if (wanted.length) where.push(inArray(statusColumn, wanted as never[]));
      }

      /* Declared equality filters: `?state=assam`, `?category=food`. */
      for (const [param, column] of Object.entries(cfg.filterColumns ?? {})) {
        const raw = req.query[param];
        if (typeof raw === "string" && raw.trim()) {
          const values = raw
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
          where.push(
            values.length > 1
              ? inArray(column, values as never[])
              : eq(column, values[0] as never),
          );
        }
      }

      const predicate = combine(where);

      /*
       * The count runs as its own statement rather than as a window function
       * on the page. A `count(*) over ()` would be cheaper by one round trip,
       * but it returns nothing at all when the page is empty — so the last
       * page of a list would report a total of zero and the admin's pager
       * would jump back to the start.
       */
      const [rows, counted] = await Promise.all([
        db
          .select()
          .from(table)
          .where(predicate)
          .orderBy(...cfg.defaultOrder)
          .limit(limit)
          .offset(offset),
        db
          .select({ total: sql<number>`count(*)::int` })
          .from(table)
          .where(predicate),
      ]);

      res.json({
        data: rows,
        meta: { total: counted[0]?.total ?? 0, limit, offset },
      });
    }),
  );

  /* ------------------------------------------------------------------ */
  /* GET /:idOrSlug                                                     */
  /* ------------------------------------------------------------------ */
  router.get(
    "/:idOrSlug",
    asyncHandler(async (req, res) => {
      const isStaff = req.user?.role === "staff" || req.user?.role === "admin";
      const row = await findOne(req.params.idOrSlug!, isStaff);
      if (!row) throw ApiError.notFound(`No ${singular(name)} with that id.`);
      res.json({ data: row });
    }),
  );

  /* ------------------------------------------------------------------ */
  /* POST /                                                             */
  /* ------------------------------------------------------------------ */
  router.post(
    "/",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const values = parseOr400(cfg.createSchema, req.body);
      const [row] = await db
        .insert(table)
        .values(values as never)
        .returning();

      await recordAudit(req, {
        action: "create",
        entity: name,
        entityId: idOf(row),
        entityLabel: labelOf(row),
        after: row,
      });

      res.status(201).json({ data: row });
    }),
  );

  /* ------------------------------------------------------------------ */
  /* PATCH /:id                                                         */
  /* ------------------------------------------------------------------ */
  router.patch(
    "/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const values = parseOr400(cfg.updateSchema, req.body) as Record<
        string,
        unknown
      >;
      if (Object.keys(values).length === 0) {
        throw ApiError.badRequest("No fields to change were sent.");
      }

      const before = await findOne(req.params.id!, true);
      if (!before)
        throw ApiError.notFound(`No ${singular(name)} with that id.`);

      /*
       * Re-validate the row as it *will be*, not just the fields sent.
       *
       * `updateSchema` is the create schema made `.partial()`, and
       * `.partial()` on a refined schema drops the refinements — so without
       * this, every cross-field invariant (a tour's day count matching its
       * nights, the headline price matching the smallest-party band, bands
       * that do not get more expensive as the group grows) was enforced on
       * create and silently skipped on update. Updates are where prices get
       * changed, which made it the wrong half to skip.
       *
       * Merging the patch onto the stored row and parsing the whole thing
       * with the create schema closes that gap and is strictly stronger: a
       * PATCH is now rejected if it would *leave* the row invalid, even when
       * every field it sends is individually fine.
       */
      const merged = { ...stripServerOwned(before), ...values };
      const invalid = cfg.createSchema.safeParse(merged);
      if (!invalid.success) {
        throw ApiError.badRequest(
          "That change would leave this record inconsistent.",
          fieldErrors(invalid.error),
        );
      }

      const [row] = await db
        .update(table)
        .set(values as never)
        .where(eq(idColumn, idOf(before) as never))
        .returning();

      /*
       * `diff` returns null when nothing actually changed, and no audit entry
       * is written in that case — a log full of no-op "edits" is a log nobody
       * reads. This mirrors the `set_updated_at` trigger, which also declines
       * to stamp a row that did not change.
       */
      const changed = diff(
        before as Record<string, unknown>,
        row as Record<string, unknown>,
      );
      if (changed) {
        await recordAudit(req, {
          action: "update",
          entity: name,
          entityId: idOf(row),
          entityLabel: labelOf(row),
          before: changed.before,
          after: changed.after,
        });
      }

      res.json({ data: row });
    }),
  );

  /* ------------------------------------------------------------------ */
  /* Publish / unpublish                                                */
  /* ------------------------------------------------------------------ */
  if (statusColumn) {
    for (const [path, status] of [
      ["publish", "published"],
      ["unpublish", "draft"],
      ["archive", "archived"],
    ] as const) {
      router.post(
        `/:id/${path}`,
        requireAdmin,
        asyncHandler(async (req, res) => {
          const before = await findOne(req.params.id!, true);
          if (!before) {
            throw ApiError.notFound(`No ${singular(name)} with that id.`);
          }
          const [row] = await db
            .update(table)
            .set({ [statusKey!]: status } as never)
            .where(eq(idColumn, idOf(before) as never))
            .returning();

          await recordAudit(req, {
            action: path,
            entity: name,
            entityId: idOf(row),
            entityLabel: labelOf(row),
            before: { status: (before as Record<string, unknown>)[statusKey!] },
            after: { status },
          });

          res.json({ data: row });
        }),
      );
    }
  }

  /* ------------------------------------------------------------------ */
  /* DELETE /:id                                                        */
  /* ------------------------------------------------------------------ */
  router.delete(
    "/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const before = await findOne(req.params.id!, true);
      if (!before)
        throw ApiError.notFound(`No ${singular(name)} with that id.`);

      /*
       * The foreign keys from `bookings` are ON DELETE RESTRICT, so deleting
       * a product somebody has booked raises 23503 and the error middleware
       * turns it into a 400 saying so. That is deliberate: the alternatives
       * are cascading (destroying the record of a sale) or nulling (a booking
       * for nothing). Archiving is the route for a product that no longer
       * runs, which is why `/archive` exists above.
       */
      await db.delete(table).where(eq(idColumn, idOf(before) as never));

      await recordAudit(req, {
        action: "delete",
        entity: name,
        entityId: idOf(before),
        entityLabel: labelOf(before),
        before,
      });

      res.status(204).end();
    }),
  );

  /* ------------------------------------------------------------------ */

  async function findOne(key: string, isStaff: boolean) {
    const matchers: SQL[] = [];
    /*
     * Only try the id column when the value actually looks like a uuid.
     * Comparing a slug against a uuid column makes Postgres raise 22P02
     * (invalid input syntax), which would surface as a 500 for the perfectly
     * ordinary request `GET /tours/the-tawang-run`.
     */
    if (UUID_RE.test(key)) matchers.push(eq(idColumn, key as never));
    if (slugColumn) matchers.push(eq(slugColumn, key as never));
    if (!matchers.length) return undefined;

    const rows = await db
      .select()
      .from(table)
      .where(combine([or(...matchers), visibility(isStaff)]))
      .limit(1);
    return rows[0];
  }

  function idOf(row: unknown): string {
    return String((row as Record<string, unknown>)[idKey]);
  }

  function labelOf(row: unknown): string | null {
    if (!labelKey) return null;
    const v = (row as Record<string, unknown>)[labelKey];
    return v == null ? null : String(v);
  }

  return router;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function combine(parts: (SQL | undefined)[]): SQL | undefined {
  const kept = parts.filter((p): p is SQL => Boolean(p));
  if (kept.length === 0) return undefined;
  if (kept.length === 1) return kept[0];
  return and(...kept);
}

/**
 * The TypeScript property name behind a Drizzle column.
 *
 * `.set()` and the row objects Drizzle returns are keyed by the property
 * name, not by the SQL column name — `hostName`, not `host_name`. A column's
 * own `.name` is the *SQL* name, so using it to index a returned row gives
 * `undefined` for every snake_cased column.
 *
 * The mapping only exists on the table, via `getTableColumns`, so the lookup
 * is by identity against that map. It is resolved once per router rather than
 * per request: it cannot change, and scanning ~30 columns on every write
 * would be work done for no reason.
 *
 * An earlier version of this read `column._.name`, which does not exist at
 * runtime at all — every create, update and publish threw a TypeError *after*
 * the row had already been written, so the database was changed and the
 * client was told the request failed. Hence the explicit throw below: a
 * misconfigured resource should fail at startup, not halfway through a write.
 */
function columnKeyResolver(table: PgTable) {
  const columns = getTableColumns(table) as Record<string, AnyColumn>;
  const byIdentity = new Map<AnyColumn, string>();
  for (const [key, column] of Object.entries(columns)) {
    byIdentity.set(column, key);
  }
  return (column: AnyColumn): string => {
    const key = byIdentity.get(column);
    if (!key) {
      throw new Error(
        `Column ${String((column as unknown as { name: string }).name)} does not belong to this resource's table.`,
      );
    }
    return key;
  };
}

/** `%` and `_` are wildcards in LIKE; a search for "50%" must mean "50%". */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

/**
 * Drop the fields the server owns before merging a stored row into a
 * create-schema parse.
 *
 * Every create schema is `.strict()` and omits `id`, `createdAt` and
 * `updatedAt`, so leaving them on the merged object makes the parse fail with
 * "unrecognized keys" on a perfectly valid patch.
 */
function stripServerOwned(row: unknown): Record<string, unknown> {
  const { id, createdAt, updatedAt, ...rest } = row as Record<string, unknown>;
  void id;
  void createdAt;
  void updatedAt;
  return rest;
}

function singular(plural: string): string {
  if (plural.endsWith("ies")) return `${plural.slice(0, -3)}y`;
  if (plural.endsWith("s")) return plural.slice(0, -1);
  return plural;
}

export { asc, desc, z };
