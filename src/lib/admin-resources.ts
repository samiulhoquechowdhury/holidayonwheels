import "server-only";

/**
 * The editable resources, and how the admin should show each one.
 *
 * ## Why this is a table and not fifteen pages
 *
 * The API already exposes every catalogue table through one generic router;
 * duplicating that shape as fifteen near-identical admin screens would mean
 * the fourth copy disagrees with the first about what the status column is
 * called. One declaration per resource, one page that reads it.
 *
 * What differs per resource is only ever: what it is called, which fields are
 * worth putting in a list, and whether it has a publish state. That is what
 * is here.
 *
 * ## `columns` is for a list, not a form
 *
 * Three or four fields, chosen so an operator can find a row — a name, a
 * price, a place. Not every field: a tour has twenty-nine columns and a table
 * of twenty-nine is unreadable. Editing a whole record is a different screen
 * from finding one.
 */

export type ResourceField = {
  /** The key in the API's JSON. */
  key: string;
  label: string;
  /** Right-aligned and tabular. */
  numeric?: boolean;
  /** Rendered as rupees. */
  money?: boolean;
};

export type ResourceDef = {
  /** The path segment, matching the API's. */
  slug: string;
  /** Plural, for headings: "Homestays". */
  title: string;
  /** Singular, for sentences: "homestay". */
  singular: string;
  blurb: string;
  /** The field holding a human-readable name. */
  titleField: string;
  columns: ResourceField[];
  /** False for the key/value planner tables, which are not published. */
  publishable: boolean;
  /** Where the public page lives, for a "view" link. Null if there is none. */
  publicPath?: (slug: string) => string;
};

export const RESOURCES: ResourceDef[] = [
  {
    slug: "tours",
    title: "Tours",
    singular: "tour",
    blurb: "Guided itineraries with departures and price bands.",
    titleField: "title",
    columns: [
      { key: "nights", label: "Nights", numeric: true },
      { key: "fromPrice", label: "From", numeric: true, money: true },
      { key: "difficulty", label: "Difficulty" },
    ],
    publishable: true,
    publicPath: (slug) => `/tours/${slug}`,
  },
  {
    slug: "homestays",
    title: "Homestays",
    singular: "homestay",
    blurb:
      "The houses. Some have no nightly rate on purpose — absent means “ask us”, never free.",
    titleField: "name",
    columns: [
      { key: "locality", label: "Where" },
      { key: "fromPrice", label: "From", numeric: true, money: true },
      { key: "state", label: "State" },
    ],
    publishable: true,
    publicPath: (slug) => `/homestays/${slug}`,
  },
  {
    slug: "motorcycle-tours",
    title: "Expeditions",
    singular: "expedition",
    blurb: "Guided rides, with a support truck.",
    titleField: "title",
    columns: [
      { key: "days", label: "Days", numeric: true },
      { key: "distanceKm", label: "Km", numeric: true },
      { key: "fromPrice", label: "From", numeric: true, money: true },
    ],
    publishable: true,
    publicPath: (slug) => `/motorcycle-tours/${slug}`,
  },
  {
    slug: "events",
    title: "Events",
    singular: "event",
    blurb: "Festivals and gatherings, with ticket tiers.",
    titleField: "name",
    columns: [
      { key: "startDate", label: "Starts" },
      { key: "state", label: "State" },
      { key: "fromPrice", label: "From", numeric: true, money: true },
    ],
    publishable: true,
    publicPath: (slug) => `/events/${slug}`,
  },
  {
    slug: "activities",
    title: "Activities",
    singular: "activity",
    blurb: "Half-days and mornings near Guwahati.",
    titleField: "name",
    columns: [
      { key: "locality", label: "Where" },
      { key: "durationLabel", label: "How long" },
      { key: "fromPrice", label: "From", numeric: true, money: true },
    ],
    publishable: true,
    publicPath: (slug) => `/activities/${slug}`,
  },
  {
    slug: "destinations",
    title: "Destinations",
    singular: "destination",
    blurb: "The eight states, and what each page says about them.",
    titleField: "name",
    columns: [
      { key: "gateway", label: "Gateway" },
      { key: "requiresIlp", label: "ILP" },
      { key: "requiresPap", label: "PAP" },
    ],
    publishable: true,
    publicPath: (slug) => `/destinations/${slug}`,
  },
  {
    slug: "cafes",
    title: "Cafés",
    singular: "café",
    blurb:
      "Places to eat near the houses. No opening hours by design — a stale one sends somebody to a closed door.",
    titleField: "name",
    columns: [{ key: "locality", label: "Where" }],
    publishable: true,
  },
  {
    slug: "journal",
    title: "Journal",
    singular: "post",
    blurb: "Writing for the site.",
    titleField: "title",
    columns: [
      { key: "publishedAt", label: "Published" },
      { key: "author", label: "Author" },
      { key: "tag", label: "Tag" },
    ],
    publishable: true,
    publicPath: (slug) => `/journal/${slug}`,
  },
  {
    slug: "faqs",
    title: "Questions",
    singular: "question",
    blurb: "The answers on the FAQ page.",
    titleField: "question",
    columns: [{ key: "topic", label: "Topic" }],
    publishable: true,
  },
  {
    slug: "policies",
    title: "Policies",
    singular: "policy",
    blurb:
      "Terms, cancellation and privacy. The effective date is a legal statement — set it only when the terms actually change.",
    titleField: "title",
    columns: [{ key: "effectiveFrom", label: "Effective from" }],
    publishable: true,
  },
  {
    slug: "site-content",
    title: "Site copy",
    singular: "entry",
    blurb: "Headings, hero lines and contact details.",
    titleField: "label",
    columns: [
      { key: "key", label: "Key" },
      { key: "group", label: "Section" },
    ],
    publishable: false,
  },
  {
    slug: "place-options",
    title: "Planner places",
    singular: "place",
    blurb:
      "What the planner can offer at each place: stays, activities and vehicles.",
    titleField: "place",
    columns: [{ key: "state", label: "State" }],
    publishable: true,
  },
  {
    slug: "day-templates",
    title: "Planner days",
    singular: "day",
    blurb: "The day templates itineraries are built from.",
    titleField: "title",
    columns: [{ key: "key", label: "Key" }],
    publishable: true,
  },
  {
    slug: "quote-terms",
    title: "Quote terms",
    singular: "list",
    blurb: "The standard inclusions and exclusions every quote inherits.",
    titleField: "label",
    columns: [{ key: "key", label: "Key" }],
    publishable: false,
  },
  {
    slug: "amenities",
    title: "Amenities",
    singular: "amenity",
    blurb: "The names and icons behind the amenity lists.",
    titleField: "label",
    columns: [
      { key: "key", label: "Key" },
      { key: "group", label: "Group" },
    ],
    publishable: false,
  },
];

export function findResource(slug: string): ResourceDef | undefined {
  return RESOURCES.find((r) => r.slug === slug);
}
