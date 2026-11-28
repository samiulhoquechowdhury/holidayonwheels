import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  date,
  jsonb,
  doublePrecision,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
  stateSlug,
  publishState,
  mealPlan,
  tourType,
  difficulty,
  departureStatus,
  eventCategory,
  activityCategory,
  suitability,
  faqTopic,
} from "./enums";
import { users } from "./auth";

/**
 * The catalogue: everything the public site shows and the client may edit.
 *
 * ## What is a column and what is JSONB
 *
 * The rule applied throughout: **a field is a column if the database or the
 * admin needs to filter, sort or constrain by it, and JSONB if it is editorial
 * structure that is read and written whole.**
 *
 * So `from_price`, `nights`, `state` and `difficulty` are columns — the
 * listing pages filter on them and the admin sorts by them. `itinerary` is
 * JSONB: twelve nested days with highlights and altitudes that no query ever
 * reaches into, edited as one document in one form. Normalising it would mean
 * an `itinerary_days` table, a `day_highlights` table, ordering columns on
 * both, and a form that saves across three tables to change a sentence.
 *
 * Arrays of plain strings (`highlights`, `includes`, `amenities`) are
 * `text[]`, not JSONB. Postgres can index and query them, `@>` works, and
 * they survive a glance in psql.
 *
 * ## Where the rule is deliberately broken
 *
 * `departures`, `homestay_rooms` and `event_ticket_tiers` are real tables
 * even though they look like nested arrays, because **they hold stock**.
 * `seats_left` and `remaining` go down when somebody books. Decrementing a
 * number inside a JSONB array means reading the document, editing it in the
 * application and writing it back, which is a lost update the moment two
 * people book the last seat at once. As rows, `update ... set seats_left =
 * seats_left - 1 where ... and seats_left >= 1` is atomic and the race is
 * gone.
 *
 * ## Slugs
 *
 * Every catalogue table keys on a surrogate `uuid` and carries a unique
 * `slug`. The slug is the URL and the client can change it; bookings and
 * media point at the uuid, so renaming a tour does not orphan them. The old
 * `src/content/*.ts` files used the slug as the only identity, which is why
 * this is worth stating.
 */

/* ======================================================================= */
/* Destinations                                                            */
/* ======================================================================= */

export const destinations = pgTable(
  "destinations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /*
     * The eight states are an enum here and not free text: the slug IS the
     * state, several other tables reference it, and there is no ninth.
     */
    slug: stateSlug("slug").notNull().unique(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull(),
    intro: text("intro").notNull(),
    body: text("body")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    region: text("region").notNull(),
    tint: text("tint").notNull(),

    requiresIlp: boolean("requires_ilp").notNull().default(false),
    requiresPap: boolean("requires_pap").notNull().default(false),

    bestMonths: text("best_months")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    gateway: text("gateway").notNull(),
    knownFor: text("known_for")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    heroAlt: text("hero_alt").notNull(),
    image: text("image"),

    status: publishState("status").notNull().default("published"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [index("destinations_status_idx").on(t.status, t.sortOrder)],
);

/* ======================================================================= */
/* Tours                                                                   */
/* ======================================================================= */

export const tours = pgTable(
  "tours",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    strapline: text("strapline").notNull(),

    /* Many-to-many as an array, not a join table: a tour crosses two or
     * three states, the set is tiny and fixed, and `states @> '{sikkim}'` is
     * a GIN index away. A `tour_states` table would be three joins to render
     * one card. */
    states: stateSlug("states")
      .array()
      .notNull()
      .default(sql`'{}'::state_slug[]`),
    region: text("region").notNull(),
    types: tourType("types")
      .array()
      .notNull()
      .default(sql`'{}'::tour_type[]`),

    nights: integer("nights").notNull(),
    days: integer("days").notNull(),

    /**
     * The headline figure, in whole rupees.
     *
     * Derived from `price_bands` in the old content files ("the lowest
     * per-person figure across all bands") but stored, not computed, for the
     * same reason `trip_requests.plan` is stored: a card must show what the
     * business advertised, and recomputing a minimum from bands somebody is
     * midway through editing would make the price flicker.
     */
    fromPrice: integer("from_price").notNull(),
    priceBands: jsonb("price_bands")
      .notNull()
      .default(sql`'[]'::jsonb`),
    singleSupplement: integer("single_supplement"),

    intro: text("intro").notNull(),
    highlights: text("highlights")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    includes: text("includes")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    excludes: text("excludes")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    itinerary: jsonb("itinerary")
      .notNull()
      .default(sql`'[]'::jsonb`),

    difficulty: difficulty("difficulty").notNull(),
    groupSizeMax: integer("group_size_max").notNull(),
    startsAt: text("starts_at").notNull(),
    endsAt: text("ends_at").notNull(),
    requiresIlp: boolean("requires_ilp").notNull().default(false),

    heroAlt: text("hero_alt").notNull(),
    image: text("image"),
    featured: boolean("featured").notNull().default(false),

    status: publishState("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [
    index("tours_status_idx").on(t.status, t.sortOrder),
    index("tours_from_price_idx").on(t.fromPrice),
    index("tours_featured_idx").on(t.featured),
    check("tours_price_nonneg", sql`${t.fromPrice} >= 0`),
    check("tours_nights_positive", sql`${t.nights} > 0`),
  ],
);

/* ======================================================================= */
/* Motorcycle expeditions                                                  */
/* ======================================================================= */

export const motorcycleTours = pgTable(
  "motorcycle_tours",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    strapline: text("strapline").notNull(),

    states: stateSlug("states")
      .array()
      .notNull()
      .default(sql`'{}'::state_slug[]`),
    region: text("region").notNull(),

    nights: integer("nights").notNull(),
    days: integer("days").notNull(),
    distanceKm: integer("distance_km").notNull(),
    maxAltitude: integer("max_altitude").notNull(),

    fromPrice: integer("from_price").notNull(),
    /** Riding behind somebody rather than taking a bike. */
    pillionPrice: integer("pillion_price").notNull(),

    intro: text("intro").notNull(),
    terrain: text("terrain")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    /** `{ name, engineCc, surcharge }[]` — objects, so JSONB. */
    bikes: jsonb("bikes")
      .notNull()
      .default(sql`'[]'::jsonb`),
    supportVehicle: text("support_vehicle")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    highlights: text("highlights")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    includes: text("includes")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    excludes: text("excludes")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    itinerary: jsonb("itinerary")
      .notNull()
      .default(sql`'[]'::jsonb`),

    difficulty: difficulty("difficulty").notNull(),
    groupSizeMax: integer("group_size_max").notNull(),
    startsAt: text("starts_at").notNull(),
    endsAt: text("ends_at").notNull(),
    requiresIlp: boolean("requires_ilp").notNull().default(false),
    ridingExperience: text("riding_experience").notNull(),

    heroAlt: text("hero_alt").notNull(),
    image: text("image"),
    featured: boolean("featured").notNull().default(false),

    status: publishState("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [
    index("moto_status_idx").on(t.status, t.sortOrder),
    index("moto_from_price_idx").on(t.fromPrice),
    check(
      "moto_price_nonneg",
      sql`${t.fromPrice} >= 0 and ${t.pillionPrice} >= 0`,
    ),
  ],
);

/* ======================================================================= */
/* Departures — stock, so a table                                          */
/* ======================================================================= */

export const departures = pgTable(
  "departures",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    /*
     * Exactly one of these is set. The alternative — one `product_kind` +
     * `product_id` pair — cannot have a foreign key at all, so a deleted
     * tour would leave departures pointing at nothing and no error would be
     * raised. Two nullable FKs plus the CHECK below keeps referential
     * integrity for both catalogues at the cost of one dead column per row.
     */
    tourId: uuid("tour_id").references(() => tours.id, { onDelete: "cascade" }),
    motorcycleTourId: uuid("motorcycle_tour_id").references(
      () => motorcycleTours.id,
      { onDelete: "cascade" },
    ),

    date: date("date").notNull(),
    endDate: date("end_date").notNull(),

    /**
     * Decremented on booking. See the note at the top of this file: this is
     * a column precisely so that the decrement can be a single atomic
     * statement guarded by `seats_left >= n`.
     */
    seatsLeft: integer("seats_left").notNull(),
    perPerson: integer("per_person").notNull(),
    /** Set only when this departure is discounted from the standard rate. */
    wasPerPerson: integer("was_per_person"),

    status: departureStatus("status").notNull().default("open"),
    ...stamps(),
  },
  (t) => [
    index("departures_tour_idx").on(t.tourId, t.date),
    index("departures_moto_idx").on(t.motorcycleTourId, t.date),
    index("departures_date_idx").on(t.date),
    check(
      "departures_exactly_one_parent",
      sql`(${t.tourId} is not null)::int + (${t.motorcycleTourId} is not null)::int = 1`,
    ),
    check("departures_seats_nonneg", sql`${t.seatsLeft} >= 0`),
    check("departures_dates_ordered", sql`${t.endDate} >= ${t.date}`),
  ],
);

/* ======================================================================= */
/* Homestays                                                               */
/* ======================================================================= */

export const homestays = pgTable(
  "homestays",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    strapline: text("strapline").notNull(),

    state: stateSlug("state").notNull(),
    region: text("region").notNull(),
    locality: text("locality").notNull(),
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),

    /**
     * Nullable on purpose, and it must stay that way.
     *
     * The four Guwahati houses are real businesses whose rates we have not
     * been given. Absent means "ask us", which the cards say in words. It
     * must never be defaulted to a number to keep a form happy — that would
     * publish a price a real business never quoted.
     */
    fromPrice: integer("from_price"),
    maxGuests: integer("max_guests"),
    bedrooms: integer("bedrooms"),

    intro: text("intro").notNull(),
    body: text("body")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    /** The family's own name. Unset until they have said we may print it. */
    hostName: text("host_name"),
    hostStory: text("host_story"),

    amenities: text("amenities")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    houseRules: text("house_rules")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    mealsIncluded: mealPlan("meals_included"),

    /**
     * A rating and a review count are specific factual claims about a named
     * business. Both stay null until there are real reviews behind them, and
     * the CHECK stops a stray 0 or a 7 getting in.
     */
    rating: doublePrecision("rating"),
    reviewCount: integer("review_count"),

    heroAlt: text("hero_alt").notNull(),
    image: text("image"),
    gallery: text("gallery")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    /** Policies the house states. Empty means nobody has told us. */
    suitability: suitability("suitability")
      .array()
      .notNull()
      .default(sql`'{}'::suitability[]`),

    featured: boolean("featured").notNull().default(false),
    status: publishState("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [
    index("homestays_status_idx").on(t.status, t.sortOrder),
    index("homestays_state_idx").on(t.state),
    index("homestays_from_price_idx").on(t.fromPrice),
    check(
      "homestays_price_nonneg",
      sql`${t.fromPrice} is null or ${t.fromPrice} >= 0`,
    ),
    check(
      "homestays_rating_range",
      sql`${t.rating} is null or (${t.rating} >= 0 and ${t.rating} <= 5)`,
    ),
    check(
      "homestays_review_count_nonneg",
      sql`${t.reviewCount} is null or ${t.reviewCount} >= 0`,
    ),
  ],
);

export const homestayRooms = pgTable(
  "homestay_rooms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    homestayId: uuid("homestay_id")
      .notNull()
      .references(() => homestays.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sleeps: integer("sleeps").notNull(),
    perNight: integer("per_night").notNull(),
    description: text("description").notNull(),
    amenities: text("amenities")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    /** More shots of this room, for the detail dialog's thumbnail strip. */
    gallery: text("gallery")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [
    index("homestay_rooms_homestay_idx").on(t.homestayId, t.sortOrder),
    check("homestay_rooms_sleeps_positive", sql`${t.sleeps} > 0`),
    check("homestay_rooms_rate_nonneg", sql`${t.perNight} >= 0`),
  ],
);

/* ======================================================================= */
/* Events                                                                  */
/* ======================================================================= */

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    strapline: text("strapline").notNull(),

    state: stateSlug("state").notNull(),
    region: text("region").notNull(),
    venue: text("venue").notNull(),
    locality: text("locality").notNull(),

    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    category: eventCategory("category").notNull(),

    fromPrice: integer("from_price").notNull(),
    intro: text("intro").notNull(),
    body: text("body")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    lineup: text("lineup")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    heroAlt: text("hero_alt").notNull(),
    image: text("image"),
    featured: boolean("featured").notNull().default(false),
    status: publishState("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [
    index("events_status_idx").on(t.status, t.startDate),
    index("events_start_date_idx").on(t.startDate),
    check("events_dates_ordered", sql`${t.endDate} >= ${t.startDate}`),
  ],
);

export const eventTicketTiers = pgTable(
  "event_ticket_tiers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    price: integer("price").notNull(),
    description: text("description").notNull(),
    /**
     * Null means unlimited — the content contract's own convention, kept.
     * It is not 0 and not -1: those are a sold-out tier and a bug.
     */
    remaining: integer("remaining"),
    perks: text("perks")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [
    index("event_tiers_event_idx").on(t.eventId, t.sortOrder),
    check("event_tiers_price_nonneg", sql`${t.price} >= 0`),
    check(
      "event_tiers_remaining_nonneg",
      sql`${t.remaining} is null or ${t.remaining} >= 0`,
    ),
  ],
);

/* ======================================================================= */
/* Activities                                                              */
/* ======================================================================= */

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    strapline: text("strapline").notNull(),
    category: activityCategory("category").notNull(),
    locality: text("locality").notNull(),

    /** "Half day" — read, not computed. */
    durationLabel: text("duration_label").notNull(),
    /** Door to door, including the drive. What the index bands by. */
    durationHours: doublePrecision("duration_hours").notNull(),
    /** One way from the middle of Guwahati. 0 means in the city itself. */
    distanceKm: integer("distance_km").notNull(),

    bestTime: text("best_time").notNull(),
    fromPrice: integer("from_price").notNull(),
    groupSizeMax: integer("group_size_max").notNull(),
    meetingPoint: text("meeting_point").notNull(),

    intro: text("intro").notNull(),
    body: text("body")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    highlights: text("highlights")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    includes: text("includes")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    excludes: text("excludes")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    heroAlt: text("hero_alt").notNull(),
    image: text("image"),
    featured: boolean("featured").notNull().default(false),
    status: publishState("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [
    index("activities_status_idx").on(t.status, t.sortOrder),
    index("activities_category_idx").on(t.category),
    check("activities_distance_nonneg", sql`${t.distanceKm} >= 0`),
  ],
);

/* ======================================================================= */
/* Cafés                                                                   */
/* ======================================================================= */

export const cafes = pgTable(
  "cafes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    locality: text("locality").notNull(),
    blurb: text("blurb").notNull(),
    /*
     * No hours, no price level and no rating. Those are claims about a real
     * business that changes them without telling us, and a stale opening
     * time sends somebody across Guwahati to a closed door.
     */
    heroAlt: text("hero_alt").notNull(),
    image: text("image"),
    status: publishState("status").notNull().default("published"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [index("cafes_status_idx").on(t.status, t.sortOrder)],
);

/* ======================================================================= */
/* Journal                                                                 */
/* ======================================================================= */

export const journalPosts = pgTable(
  "journal_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    publishedAt: date("published_at").notNull(),
    readingMinutes: integer("reading_minutes").notNull(),
    /** Free text: guest writers are not users of this system. */
    author: text("author").notNull(),
    /** The user who wrote it, when it was somebody with an account. */
    authorUserId: uuid("author_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    region: text("region").notNull(),
    tag: text("tag").notNull(),
    heroAlt: text("hero_alt").notNull(),
    image: text("image"),
    status: publishState("status").notNull().default("draft"),
    ...stamps(),
  },
  (t) => [index("journal_status_idx").on(t.status, t.publishedAt)],
);

/* ======================================================================= */
/* FAQs, policies, and the loose copy                                      */
/* ======================================================================= */

export const faqs = pgTable(
  "faqs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    topic: faqTopic("topic").notNull(),
    status: publishState("status").notNull().default("published"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [index("faqs_topic_idx").on(t.topic, t.sortOrder)],
);

export const policies = pgTable("policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  /**
   * The date printed on the page, which is a legal statement about when the
   * terms changed — so it is set by whoever edits, not by `updated_at`.
   * Fixing a typo must not claim the cancellation policy changed today.
   *
   * Named `effectiveFrom`, not `updatedAt`, because `stamps()` below also
   * defines an `updatedAt` property: spread last, it silently won the key
   * and this column was dropped from the generated table entirely. The
   * first migration shipped without it. Two fields that mean different
   * things must not be one spread away from colliding.
   */
  effectiveFrom: date("effective_from").notNull(),
  /** `{ heading, body[] }[]`. */
  sections: jsonb("sections")
    .notNull()
    .default(sql`'[]'::jsonb`),
  status: publishState("status").notNull().default("published"),
  ...stamps(),
});

/**
 * Everything else the client wants to reword: hero lines, section headings,
 * the contact details in the footer.
 *
 * A key/value table and not columns, because the set of editable strings
 * changes every time a section is redesigned, and a migration per heading is
 * not a workflow. `value` is JSONB so one key can hold a string, a list of
 * bullet points, or a small object without three nullable columns.
 *
 * The risk is a typo'd key silently rendering nothing, so reads go through an
 * accessor that takes a default from the code — the code stays the source of
 * truth for *what exists*, the database for *what it says*.
 */
export const siteContent = pgTable(
  "site_content",
  {
    key: text("key").primaryKey(),
    value: jsonb("value").notNull(),
    /** Shown beside the field in the admin so the client knows what it is. */
    label: text("label").notNull(),
    description: text("description"),
    /** Groups the admin form into sections: "home", "footer", "contact". */
    group: text("group").notNull().default("general"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...stamps(),
  },
  (t) => [index("site_content_group_idx").on(t.group, t.sortOrder)],
);

/* ======================================================================= */

/**
 * The two timestamps every editable row carries.
 *
 * A function rather than a shared object because Drizzle's column builders
 * are mutable: spreading one shared `{ createdAt, updatedAt }` literal into
 * twelve tables hands all twelve the same builder instances, and the name
 * assigned by the last table wins on all of them. Calling this per table
 * makes fresh builders each time.
 *
 * `updated_at` is maintained by a trigger created in a later migration, not
 * by the application — an `UPDATE` run from psql to fix one field should not
 * be able to leave a lying timestamp behind.
 */
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
