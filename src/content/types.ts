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
  /** Headline price — the lowest per-person figure across all bands. */
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
  fromPrice: number;
  maxGuests: number;
  bedrooms: number;
  intro: string;
  body: string[];
  hostName: string;
  hostStory: string;
  rooms: HomestayRoomType[];
  amenities: string[];
  houseRules: string[];
  mealsIncluded: MealPlan;
  rating: number;
  reviewCount: number;
  heroAlt: string;
  image?: string;
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
