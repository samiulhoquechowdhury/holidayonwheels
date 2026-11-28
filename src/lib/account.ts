import "server-only";

import type { WeaveRegion } from "@/components/layout/weave-motifs";

/**
 * The shape the API's `/account` endpoint returns.
 *
 * ## Why these types are declared here and not imported from the API
 *
 * The two packages cannot share types across their separate `drizzle-orm`
 * installs — the long version is in `src/lib/db/schema.ts`. But even without
 * that, an HTTP boundary is a place where a *stated* contract is worth more
 * than a derived one: the API can change a column without changing what it
 * serves, and this file says what the pages were written against.
 *
 * It is narrower than the database on purpose. `staffNotes` exists on a
 * booking and is deliberately absent here, because the API does not send it
 * to a traveller and the pages must not be written as though it might arrive.
 */

export type AccountBooking = {
  id: string;
  reference: string;
  kind: "tour" | "moto" | "stay" | "event";
  title: string;
  itemSlug: string;
  /**
   * Plain `string`, and narrowed with `asWeaveRegion` at the point of use.
   *
   * The database column is free text — a presentation token owned by the
   * components, which the schema deliberately does not constrain so that
   * adding a motif needs no migration. Typing it as `WeaveRegion` here would
   * be a claim this module cannot keep: the value arrives over HTTP from a
   * column anybody with psql can write.
   */
  region: string;
  startDate: string;
  endDate: string;
  travellers: number;
  /** Whole rupees, as quoted. */
  total: number;
  amountPaid: number;
  status: "pending-payment" | "confirmed" | "completed" | "cancelled";
  bookedAt: string;
};

export type AccountPermit = {
  id: string;
  reference: string;
  state: string;
  kind: "ILP" | "PAP";
  travellerName: string;
  validFrom: string;
  validTo: string;
  status: "draft" | "submitted" | "approved" | "rejected" | "expired";
  submittedAt: string | null;
  bookingId: string | null;
};

export type AccountProfile = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  emailVerified: string | null;
  createdAt: string;
};

export type AccountPayload = {
  profile: AccountProfile;
  /**
   * Soonest first, and cancelled trips are in neither list.
   *
   * The split is done in SQL rather than here: the two lists have different
   * orderings, and partitioning in the browser would mean fetching every
   * booking somebody has ever made to render the two coming up.
   */
  upcomingBookings: AccountBooking[];
  /** Most recent first. */
  pastBookings: AccountBooking[];
  permits: AccountPermit[];
};

/**
 * Narrow a region string from the API to the union the motifs accept.
 *
 * Anything unrecognised becomes `"neutral"`, which is a real motif and the
 * right fallback: the alternative is indexing a lookup with a key that is not
 * there and rendering nothing where a pattern should be. A region nobody has
 * drawn a motif for should look plain, not broken.
 */
const WEAVE_REGIONS = new Set<string>([
  "assam",
  "meghalaya",
  "arunachal",
  "nagaland",
  "manipur",
  "mizoram",
  "tripura",
  "sikkim",
  "neutral",
]);

export function asWeaveRegion(value: string | null | undefined): WeaveRegion {
  return value && WEAVE_REGIONS.has(value) ? (value as WeaveRegion) : "neutral";
}
