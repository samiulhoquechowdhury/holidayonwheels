import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./auth";

/**
 * The machinery: uploaded files, and a record of who changed what.
 */

/**
 * An image the client uploaded.
 *
 * ## Why width and height are stored and not read from the file
 *
 * `next/image` needs intrinsic dimensions to reserve space, and this project
 * uses a custom loader (`src/lib/image-loader.ts`) that rewrites `/media/`
 * paths into pre-sized buckets. So the sizes are not a nicety: without them
 * the loader cannot pick a bucket and every upload would shift the layout as
 * it loads. They are measured once, when the file arrives.
 *
 * ## Why `alt` is not nullable
 *
 * Every image on this site already carries real alt text, and a CMS that
 * lets alt text be skipped is how that stops being true after the first
 * week. Empty string is still accepted, deliberately — a purely decorative
 * image should be `alt=""` rather than described — but it has to be chosen.
 */
export const media = pgTable(
  "media",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    /** Path as the site serves it: `/media/homestays/hatigaon/01.webp`. */
    path: text("path").notNull().unique(),
    /** What the uploader called it, for searching the library. */
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),

    alt: text("alt").notNull(),
    /** Free tags so the library can be filtered: "homestay", "guwahati". */
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    /**
     * Which pre-sized variants exist on disk, as widths: `{400,800}`. The
     * loader may only ask for a bucket that is listed here; asking for one
     * that was never generated serves a 404 in place of a photograph.
     */
    variantWidths: integer("variant_widths")
      .array()
      .notNull()
      .default(sql`'{}'::int[]`),

    uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("media_tags_idx").on(t.tags),
    index("media_created_idx").on(t.createdAt),
  ],
);

/**
 * Who changed what, and what it looked like before.
 *
 * ## Why this is not optional
 *
 * The client's staff can now change prices on live, published products. When
 * a traveller says they were quoted ₹98,000 and the page says ₹112,000, the
 * only way to answer is a record of the edit. `before` and `after` hold the
 * changed fields only, not whole rows, so the log stays readable and does not
 * duplicate every paragraph of body copy on a typo fix.
 *
 * It is append-only by convention and by permission: nothing in the API
 * updates or deletes from this table, and the migration grants no such right
 * to the application role.
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    /** Null for an action taken by the system rather than a person. */
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    /** Kept as text as well, so the entry survives the user being deleted. */
    actorEmail: text("actor_email"),

    /** "create" | "update" | "delete" | "publish" | "login" | … */
    action: text("action").notNull(),
    /** The table the row lives in. */
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    /** Something a human recognises in a list: the tour's title. */
    entityLabel: text("entity_label"),

    /** The changed fields only. See the note above. */
    before: jsonb("before"),
    after: jsonb("after"),

    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_log_entity_idx").on(t.entity, t.entityId, t.createdAt),
    index("audit_log_actor_idx").on(t.actorUserId, t.createdAt),
    index("audit_log_created_idx").on(t.createdAt),
  ],
);
