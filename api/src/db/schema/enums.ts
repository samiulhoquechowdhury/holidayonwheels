import { pgEnum } from "drizzle-orm/pg-core";

/**
 * The closed sets, as Postgres types.
 *
 * Each of these mirrors a union in `src/content/types.ts`. They are enums and
 * not `text` with a CHECK because an enum is one name to add a value to, and
 * because `select unnest(enum_range(null::state_slug))` lets the admin build
 * a dropdown from the database rather than from a list copied into a form.
 *
 * ## The cost, stated plainly
 *
 * Removing a value from a Postgres enum is not possible without recreating
 * the type, and reordering is not possible at all. So these are only for sets
 * that are genuinely closed: there are eight states in the Northeast and that
 * is a fact about India, not a product decision. Anything the business might
 * want to add to next quarter — tags, amenity names, regions — is `text` or a
 * table, not an enum.
 *
 * `region` and `tint` are deliberately plain `text`. They are presentation
 * tokens owned by components (`WeaveRegion`, `SectionTint`); the day somebody
 * adds a motif, the database should not need a migration to accept it.
 */

export const stateSlug = pgEnum("state_slug", [
  "assam",
  "meghalaya",
  "arunachal-pradesh",
  "nagaland",
  "manipur",
  "mizoram",
  "tripura",
  "sikkim",
]);

/**
 * Whether the public site may show a row.
 *
 * `draft` is the reason this exists: the client needs to be able to write a
 * homestay over three days without it appearing half-finished on the live
 * site. `archived` is not `deleted` — a tour that no longer runs still has
 * bookings pointing at it, and its page should keep resolving for the people
 * who are on it.
 */
export const publishState = pgEnum("publish_state", [
  "draft",
  "published",
  "archived",
]);

export const mealPlan = pgEnum("meal_plan", [
  "breakfast",
  "half-board",
  "full-board",
  "none",
]);

export const tourType = pgEnum("tour_type", [
  "couple",
  "honeymoon",
  "group",
  "solo",
]);

/**
 * One enum for both catalogues.
 *
 * `Tour` uses easy/moderate/challenging and `MotorcycleTour` uses
 * moderate/challenging/expert. Two enums with overlapping values would mean
 * two dropdowns and two mappings for one idea; the narrower per-catalogue
 * range is enforced in the zod schemas, where it can be changed without a
 * migration.
 */
export const difficulty = pgEnum("difficulty", [
  "easy",
  "moderate",
  "challenging",
  "expert",
]);

export const departureStatus = pgEnum("departure_status", [
  "open",
  "filling",
  "sold-out",
  "guaranteed",
]);

export const eventCategory = pgEnum("event_category", [
  "festival",
  "music",
  "culture",
  "sport",
  "food",
]);

export const activityCategory = pgEnum("activity_category", [
  "water",
  "wildlife",
  "heritage",
  "culture",
  "food",
]);

/**
 * Who a house will take.
 *
 * These are policies the house states, not inferences. See the note on
 * `Homestay.suitability` in `src/content/types.ts`: whether a place accepts
 * unmarried couples is its owners' decision and sometimes a legally sensitive
 * one, so an empty array means "nobody has told us" and never "no".
 */
export const suitability = pgEnum("suitability", [
  "couples",
  "families",
  "groups",
]);

export const faqTopic = pgEnum("faq_topic", [
  "booking",
  "permits",
  "travel",
  "payment",
  "motorcycle",
]);

/* --- Commerce ---------------------------------------------------------- */

export const bookingKind = pgEnum("booking_kind", [
  "tour",
  "moto",
  "stay",
  "event",
]);

export const bookingStatus = pgEnum("booking_status", [
  "pending-payment",
  "confirmed",
  "completed",
  "cancelled",
]);

export const permitKind = pgEnum("permit_kind", ["ILP", "PAP"]);

export const permitStatus = pgEnum("permit_status", [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "expired",
]);

export const enquiryStatus = pgEnum("enquiry_status", [
  "new",
  "in_progress",
  "closed",
]);

export const tripRequestStatus = pgEnum("trip_request_status", [
  "new",
  "in_progress",
  "quoted",
  "confirmed",
  "lost",
  "closed",
]);
