import type { Request } from "express";
import { db } from "../db/client";
import { auditLog } from "../db/schema/index";

/**
 * Record a change.
 *
 * ## Why only the changed fields are stored
 *
 * `before`/`after` hold a diff, not whole rows. A tour carries nineteen
 * itinerary days and several paragraphs of body copy; storing both versions
 * on every edit would make the audit table larger than the content table and
 * make "what changed?" a question somebody has to answer by reading two JSON
 * blobs side by side.
 *
 * ## Why a failure here is swallowed
 *
 * An audit write must never fail the operation it is recording. If the log
 * insert throws, the edit has already happened and succeeded — raising would
 * tell the client their change failed when it did not, and they would make it
 * twice. The failure is logged loudly instead.
 *
 * This is a deliberate trade: the log can have gaps under database trouble.
 * The alternative, wrapping each write and its log entry in one transaction,
 * means a full audit table takes the whole admin down, which is worse.
 */
export async function recordAudit(
  req: Request,
  entry: {
    action: string;
    entity: string;
    entityId?: string | null;
    entityLabel?: string | null;
    before?: unknown;
    after?: unknown;
  },
) {
  try {
    await db.insert(auditLog).values({
      actorUserId: req.user?.id ?? null,
      actorEmail: req.user?.email ?? null,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId ?? null,
      entityLabel: entry.entityLabel ?? null,
      before: (entry.before as never) ?? null,
      after: (entry.after as never) ?? null,
      /*
       * `req.ip` is only trustworthy when Express is told how many proxies
       * sit in front of it — see `trust proxy` in index.ts. Behind Vercel or
       * a load balancer without that setting it records the proxy's address
       * on every row, which is worse than useless because it looks real.
       */
      ipAddress: req.ip ?? null,
      userAgent: req.headers["user-agent"] ?? null,
    });
  } catch (err) {
    req.log?.error({ err, entry }, "audit write failed");
  }
}

/**
 * The fields that actually differ, for `before`/`after`.
 *
 * Compares with JSON equality so arrays and nested objects are handled, and
 * returns `null` when nothing changed — an update that changes nothing should
 * not produce a log entry claiming it did.
 */
export function diff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): { before: Record<string, unknown>; after: Record<string, unknown> } | null {
  const b: Record<string, unknown> = {};
  const a: Record<string, unknown> = {};

  for (const key of Object.keys(after)) {
    const wasRaw = before[key];
    const isRaw = after[key];
    /*
     * Dates and Postgres `date` columns come back as different types on the
     * two sides of an update (Date vs string), so compare serialised forms.
     */
    if (JSON.stringify(wasRaw ?? null) !== JSON.stringify(isRaw ?? null)) {
      b[key] = wasRaw ?? null;
      a[key] = isRaw ?? null;
    }
  }

  return Object.keys(a).length ? { before: b, after: a } : null;
}
