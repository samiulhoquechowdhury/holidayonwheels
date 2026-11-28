import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { stateSlug, publishState } from "./enums";

/**
 * The trip planner's data.
 *
 * ## Why this is JSONB where the catalogue is columns
 *
 * `src/content/day-options.ts` is 1,845 lines of `Record<string,
 * PlaceOptions>` — per place, a list of stays, activities and transfer
 * vehicles, each with their own nested shape. `day-library.ts` is a further
 * 564 lines of named day templates the planner composes itineraries from, and
 * `routes.ts` is a per-state graph of legs.
 *
 * Fully normalising that is roughly eight more tables whose only consumer is
 * one algorithm that loads all of it at once, per request, and walks it in
 * memory. Nothing filters on it in SQL. So each row here is one keyed
 * document, and the shape is enforced by a zod schema on write instead of by
 * the column types.
 *
 * **The honest cost:** Postgres will accept `{"stays": "banana"}` in these
 * columns. The validation is in one place in the API, and a direct `UPDATE`
 * in psql bypasses it. That is a real weakness, accepted because the
 * alternative is eight tables and a form that writes across all of them to
 * change one bed's nightly rate. If the planner's data ever needs to be
 * queried — "every stay under ₹3,000" — these become tables and the zod
 * schemas become the migration's guide.
 */

/**
 * What can be chosen at one place on one day: the stays, the things to do,
 * and the vehicles that get you there.
 *
 * Keyed by place name, matching `PLACE_OPTIONS` in the content file. It is
 * not a foreign key to `destinations`: a place is "Shnongpdeng", a village,
 * not one of the eight states.
 */
export const placeOptions = pgTable(
  "place_options",
  {
    place: text("place").primaryKey(),
    /** Which state the planner reaches this place from. */
    state: stateSlug("state"),

    /** `StayOption[]` — id, name, nightly rate, amenities. */
    stays: jsonb("stays")
      .notNull()
      .default(sql`'[]'::jsonb`),
    /** `ActivityOption[]` — id, name, per-person price, duration. */
    activities: jsonb("activities")
      .notNull()
      .default(sql`'[]'::jsonb`),
    /** `TransferOption[]` — vehicle, seats, per-km or per-day rate. */
    transfers: jsonb("transfers")
      .notNull()
      .default(sql`'[]'::jsonb`),

    status: publishState("status").notNull().default("published"),
    ...stamps(),
  },
  (t) => [index("place_options_state_idx").on(t.state)],
);

/**
 * Where a trip can start, and what it costs to get out of there.
 *
 * `GATEWAY_POINTS` in the content file. Separate from `place_options` because
 * a gateway is an airport or a railhead with transfer pricing attached, not
 * somewhere a night is spent.
 */
export const gatewayPoints = pgTable(
  "gateway_points",
  {
    key: text("key").primaryKey(),
    label: text("label").notNull(),
    state: stateSlug("state"),
    /** The whole gateway record as the planner reads it. */
    data: jsonb("data").notNull(),
    status: publishState("status").notNull().default("published"),
    ...stamps(),
  },
  (t) => [index("gateway_points_state_idx").on(t.state)],
);

/**
 * The named day templates the planner assembles itineraries from.
 *
 * `days` in `day-library.ts`, keyed by `DayKey`. One row per template so the
 * client can reword a day's summary without touching the other ninety.
 */
export const dayTemplates = pgTable("day_templates", {
  key: text("key").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  /** The full `ItineraryDay` minus `day`, which the planner assigns. */
  data: jsonb("data").notNull(),
  status: publishState("status").notNull().default("published"),
  ...stamps(),
});

/**
 * The per-state route graph: which legs exist, how long each takes, and the
 * most days a trip through that state can sensibly run to.
 */
export const routes = pgTable("routes", {
  state: stateSlug("state").primaryKey(),
  /** `RouteLeg[]`, in order. */
  legs: jsonb("legs")
    .notNull()
    .default(sql`'[]'::jsonb`),
  maxDays: integer("max_days").notNull(),
  status: publishState("status").notNull().default("published"),
  ...stamps(),
});

/**
 * The "while you are there" panel: markets, viewpoints, places to eat.
 *
 * One row per state, null where there is nothing written yet — the component
 * already handles that case by rendering nothing.
 */
export const localGuides = pgTable("local_guides", {
  state: stateSlug("state").primaryKey(),
  intro: text("intro"),
  /** `LocalPlace[]`. */
  places: jsonb("places")
    .notNull()
    .default(sql`'[]'::jsonb`),
  status: publishState("status").notNull().default("published"),
  ...stamps(),
});

/**
 * The standard inclusions and exclusions every quote inherits.
 *
 * A table with two well-known keys rather than two `text[]` columns on a
 * singleton row, so the admin edits them as two lists in one form and a third
 * list can be added without a migration.
 */
export const quoteTerms = pgTable("quote_terms", {
  /** 'includes' | 'excludes'. */
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  items: text("items")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  ...stamps(),
});

/**
 * Amenity definitions, so an amenity is a thing with a name and an icon
 * rather than a bare string repeated across twelve stays.
 *
 * `STAY_AMENITIES` in the content file. The catalogue tables still store
 * amenities as `text[]`; this is the lookup that gives each one its label and
 * glyph, and an unknown string simply renders without an icon rather than
 * breaking the page.
 */
export const amenities = pgTable("amenities", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  /** Matches an `IconName` in `src/components/homestays/amenity-icons.tsx`. */
  icon: text("icon"),
  group: text("group").notNull().default("general"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...stamps(),
});

/** See the note in `content.ts`: fresh builders per table, not a shared one. */
function stamps() {
  return {
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  };
}
