import type { WeaveRegion } from "@/components/layout/weave-motifs";
import type { SectionTint } from "@/components/layout/SectionShell";

/**
 * The content contract.
 *
 * Every accessor in this folder returns these shapes. When the backend lands,
 * the accessor bodies change and nothing else does — no component may read a
 * data file directly.
 *
 * Money is integer rupees. Dates are ISO `YYYY-MM-DD` strings.
 */

export type StateSlug =
  | "assam"
  | "meghalaya"
  | "arunachal-pradesh"
  | "nagaland"
  | "manipur"
  | "mizoram"
  | "tripura"
  | "sikkim";

export type Destination = {
  slug: StateSlug;
  name: string;
  /** One-line hook used on cards. */
  tagline: string;
  /** Editorial paragraph for the destination page. */
  intro: string;
  body: string[];
  region: WeaveRegion;
  tint: SectionTint;
  /** Requires an Inner Line Permit for Indian nationals. */
  requiresILP: boolean;
  /** Requires a Protected Area Permit for foreign nationals. */
  requiresPAP: boolean;
  bestMonths: string[];
  gateway: string;
  knownFor: string[];
  heroAlt: string;
  image?: string;
};

export type TourType = "couple" | "honeymoon" | "group" | "solo";

export type MealPlan = "breakfast" | "half-board" | "full-board" | "none";

export type ItineraryDay = {
  day: number;
  title: string;
  summary: string;
  /** Where the night is spent. `null` on the final day. */
  stay: string | null;
  meals: MealPlan;
  /** Metres above sea level, where it matters to the traveller. */
  altitude?: number;
  /** Kilometres covered by road that day. */
  distanceKm?: number;
  highlights: string[];
};

export type PriceBand = {
  /** Number of travellers this band applies from. */
  fromPax: number;
  perPerson: number;
};

export type Tour = {
  slug: string;
  title: string;
  /** Short editorial subtitle shown under the title. */
  strapline: string;
  states: StateSlug[];
  region: WeaveRegion;
  types: TourType[];
  nights: number;
  days: number;
  /**
   * Headline price — the per-person rate for the **smallest** party, i.e. the
   * band with the lowest `fromPax`.
   *
   * This used to read "the lowest per-person figure across all bands", which
   * is the opposite of what every tour in the catalogue does: per-person
   * price falls as the group grows, so the smallest party pays the most each
   * and that is the figure a card shows. All 47 tours follow the rule as
   * stated here; none followed it as previously stated.
   */
  fromPrice: number;
  priceBands: PriceBand[];
  /** Single-supplement, added for solo travellers. */
  singleSupplement?: number;
  intro: string;
  highlights: string[];
  includes: string[];
  excludes: string[];
  itinerary: ItineraryDay[];
  /** Departure dates that still have seats. */
  departures: Departure[];
  difficulty: "easy" | "moderate" | "challenging";
  groupSizeMax: number;
  startsAt: string;
  endsAt: string;
  requiresILP: boolean;
  heroAlt: string;
  image?: string;
  featured?: boolean;
};

export type Departure = {
  date: string;
  endDate: string;
  seatsLeft: number;
  perPerson: number;
  /** Set when this departure is discounted from the standard rate. */
  wasPerPerson?: number;
  status: "open" | "filling" | "sold-out" | "guaranteed";
};

export type MotorcycleTour = {
  slug: string;
  title: string;
  strapline: string;
  states: StateSlug[];
  region: WeaveRegion;
  nights: number;
  days: number;
  /** Total route distance in kilometres. */
  distanceKm: number;
  /** Highest point reached, in metres. */
  maxAltitude: number;
  fromPrice: number;
  /** Rate for riding pillion rather than taking a bike. */
  pillionPrice: number;
  intro: string;
  terrain: string[];
  bikes: MotorcycleOption[];
  /** What the support truck carries. */
  supportVehicle: string[];
  highlights: string[];
  includes: string[];
  excludes: string[];
  itinerary: ItineraryDay[];
  departures: Departure[];
  difficulty: "moderate" | "challenging" | "expert";
  groupSizeMax: number;
  startsAt: string;
  endsAt: string;
  requiresILP: boolean;
  ridingExperience: string;
  heroAlt: string;
  image?: string;
  featured?: boolean;
};

export type MotorcycleOption = {
  name: string;
  engineCc: number;
  /** Added to the base per-rider price. */
  surcharge: number;
};

export type HomestayRoomType = {
  name: string;
  sleeps: number;
  perNight: number;
  description: string;
  amenities: string[];
};

export type Homestay = {
  slug: string;
  name: string;
  strapline: string;
  state: StateSlug;
  region: WeaveRegion;
  locality: string;
  /** Approximate coordinates for the index map. */
  lat: number;
  lng: number;
  /**
   * Nightly rate, per room, from. **Optional on purpose.**
   *
   * The four Guwahati houses are real businesses whose rates we have not
   * been given, and a price is the one field on a listing nobody treats as
   * provisional. Absent means "ask us", which the cards and the detail page
   * say in words; it does not mean free, and it must never be defaulted to a
   * number to keep a component happy.
   */
  fromPrice?: number;
  /** Unset where the house has not told us. See `fromPrice`. */
  maxGuests?: number;
  /** Unset where the house has not told us. See `fromPrice`. */
  bedrooms?: number;
  intro: string;
  body: string[];
  /** The family's own name. Unset until they have told us to print it. */
  hostName?: string;
  hostStory?: string;
  rooms: HomestayRoomType[];
  amenities: string[];
  houseRules: string[];
  /** Unset where unknown — not defaulted to `none`, which is a claim. */
  mealsIncluded?: MealPlan;
  /**
   * A rating and a review count are the most dangerous fields in this file:
   * invented, they are specific factual claims about a named business. Both
   * stay unset until there are real reviews behind them.
   */
  rating?: number;
  reviewCount?: number;
  heroAlt: string;
  image?: string;
  /**
   * More of the same house, after `image`: the rooms, the yard, the way in.
   * Shown as a thumbnail strip under the main photograph, and omitted
   * entirely where it is unset — a house with one picture gets one picture
   * rather than a strip padded out with something else's.
   */
  gallery?: string[];
  /**
   * Who the house will take, as the house itself states it.
   *
   * These are **policies, not observations**. Whether a place accepts
   * unmarried couples, or allows a gathering, is a decision its owners make
   * and sometimes a legally sensitive one in India — it cannot be read off a
   * photograph and must never be inferred from the size of a room. Unset
   * means nobody has told us, and the filter treats it that way: the option
   * is offered but matches nothing until a value arrives.
   */
  suitability?: ("couples" | "families" | "groups")[];
  featured?: boolean;
};

export type EventCategory = "festival" | "music" | "culture" | "sport" | "food";

export type TicketTier = {
  name: string;
  price: number;
  description: string;
  /** Null means unlimited. */
  remaining: number | null;
  perks: string[];
};

export type NEEvent = {
  slug: string;
  name: string;
  strapline: string;
  state: StateSlug;
  region: WeaveRegion;
  venue: string;
  locality: string;
  startDate: string;
  endDate: string;
  category: EventCategory;
  fromPrice: number;
  intro: string;
  body: string[];
  lineup?: string[];
  tickets: TicketTier[];
  heroAlt: string;
  image?: string;
  featured?: boolean;
};

export type ActivityCategory =
  "water" | "wildlife" | "heritage" | "culture" | "food";

/**
 * A day activity near Guwahati.
 *
 * Deliberately not a `Tour`: there is no itinerary, no departure list and no
 * price band, because these are half-days bolted onto a trip rather than
 * trips themselves. What they carry instead is a meeting point and a time of
 * day, which is what somebody with a free morning actually needs to know.
 */
export type Activity = {
  slug: string;
  name: string;
  strapline: string;
  category: ActivityCategory;
  /** Where it happens, and how far out of the city. */
  locality: string;
  /** "2 hours", "Half day" — read, not computed. */
  durationLabel: string;
  /**
   * Door to door, in hours, including the drive out and back.
   *
   * `durationLabel` is what a reader wants to see and this is what the page
   * needs to sort and band by. Keeping both means the label can stay
   * idiomatic ("Half day") while the index can still answer the question
   * people actually arrive with, which is whether a thing fits the morning
   * they have free.
   */
  durationHours: number;
  /**
   * Kilometres from the middle of Guwahati, one way. Zero for anything in
   * the city itself — the index shows "In the city" rather than "0 km".
   */
  distanceKm: number;
  /** When in the day or the year it is worth doing. */
  bestTime: string;
  /** Per person. */
  fromPrice: number;
  groupSizeMax: number;
  meetingPoint: string;
  intro: string;
  body: string[];
  highlights: string[];
  includes: string[];
  excludes: string[];
  heroAlt: string;
  image?: string;
  featured?: boolean;
};

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  publishedAt: string;
  readingMinutes: number;
  author: string;
  region: WeaveRegion;
  tag: string;
  heroAlt: string;
  image?: string;
};

export type Booking = {
  reference: string;
  kind: "tour" | "moto" | "stay" | "event";
  /** Slug of the booked product. */
  itemSlug: string;
  title: string;
  startDate: string;
  endDate: string;
  travellers: number;
  total: number;
  status: "confirmed" | "pending-payment" | "completed" | "cancelled";
  bookedAt: string;
  region: WeaveRegion;
};

export type Permit = {
  reference: string;
  state: StateSlug;
  /** Inner Line Permit or Protected Area Permit. */
  kind: "ILP" | "PAP";
  travellerName: string;
  validFrom: string;
  validTo: string;
  status: "draft" | "submitted" | "approved" | "rejected" | "expired";
  submittedAt?: string;
  /** Linked booking, when the permit was raised as part of a trip. */
  bookingReference?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
  topic: "booking" | "permits" | "travel" | "payment" | "motorcycle";
};

export type Policy = {
  slug: string;
  title: string;
  updatedAt: string;
  sections: { heading: string; body: string[] }[];
};
