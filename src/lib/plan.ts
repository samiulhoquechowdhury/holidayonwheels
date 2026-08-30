import {
  buildItinerary,
  days as dayLibrary,
  type DayKey,
} from "@/content/day-library";
import { getRoute, type RouteLeg } from "@/content/routes";
import { getDestinationBySlug } from "@/content/destinations";
import { getToursByState } from "@/content/tours";
import { matchesParty, type PartyType } from "./party";
import { addDays, formatLong, nightsBetween, parseISO } from "./date";
import { formatINR } from "./currency";
import type { ItineraryDay, StateSlug } from "@/content/types";

/**
 * The itinerary planner.
 *
 * Given a state, a party, and two dates, this composes a day-by-day trip that
 * exists nowhere in the catalogue and prices it. It is the piece that turns
 * the tours page from a list you search into a question you answer.
 *
 * It is a pure function over the content files, deliberately: it is called
 * from a server action today, and the day it is called from a real API
 * instead, nothing here changes. It never reaches for `Math.random` or
 * `new Date()` — every figure it returns is derived from its inputs, so the
 * same enquiry always produces the same plan and the same reference.
 *
 * What it will not do is pretend. If the dates are longer than the road
 * supports it plans to the road's length and says so; if a family is going to
 * Sikkim it drops the 5,430-metre day rather than quietly leaving it in; if
 * the month is wrong for the state it prices the trip and flags the month.
 * Every one of those is a sentence in `warnings` or `shaping`, because the
 * alternative — a plausible itinerary that cannot be driven — is the failure
 * mode that costs an operator a booking at the worst possible moment.
 */

/** One day of a planned trip: a library day, dated. */
export type PlannedDay = ItineraryDay & { date: string };

export type QuoteLine = {
  label: string;
  amount: number;
  note?: string;
};

export type PlanQuote = {
  perAdult: number;
  /** Null when no children are travelling. */
  perChild: number | null;
  lines: QuoteLine[];
  total: number;
  /** What confirms the booking. The rest is due before departure. */
  deposit: number;
};

/** A catalogue trip close enough to the request to be worth offering. */
export type PlanMatch = {
  slug: string;
  title: string;
  strapline: string;
  nights: number;
  fromPrice: number;
  region: string;
  heroAlt: string;
  image?: string;
  /** How far off the requested length it is, in nights. */
  nightsDelta: number;
  nextDeparture: string | null;
};

export type PlanInput = {
  state: StateSlug;
  party: PartyType;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
};

export type TripPlan = {
  reference: string;
  state: StateSlug;
  stateName: string;
  gateway: string;
  party: PartyType;
  startDate: string;
  /**
   * The end of the trip **as planned**, which is not always the end the
   * traveller asked for — see `clamped`. The itinerary, the length and the
   * price all agree with this date, because a quote that covers more nights
   * than the itinerary shows is the one mistake a traveller will always spot.
   */
  endDate: string;
  nights: number;
  dayCount: number;
  /** What was asked for. Differs from `endDate` only when `clamped`. */
  requestedEndDate: string;
  requestedNights: number;
  /** True when the route ran out before the dates did. */
  clamped: boolean;
  adults: number;
  children: number;
  days: PlannedDay[];
  /** How the trip was shaped, in the planner's own words. */
  shaping: string[];
  /** Things the traveller needs to know before they reply. */
  warnings: string[];
  /** Route days this length could not fit, by title. */
  notIncluded: string[];
  requiresILP: boolean;
  /** What the state's own road network is good for. From the route. */
  routeNote: string;
  quote: PlanQuote;
  matches: PlanMatch[];
};

/** Children are charged a reduced rate; this is the age it applies below. */
const CHILD_AGE_LIMIT = 12;
const CHILD_RATE = 0.65;

/** Rounded to the nearest ₹500, the way every price in the catalogue is. */
const round500 = (value: number) => Math.round(value / 500) * 500;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ---------------------------------------------------------------------- */
/* Selecting the days                                                      */
/* ---------------------------------------------------------------------- */

type IndexedLeg = RouteLeg & { index: number };

/**
 * A leg and everything it depends on, prerequisites first.
 *
 * The guard against a cycle is not defensive padding — `requires` is authored
 * by hand in `routes.ts`, and a typo that points a day at itself would
 * otherwise hang the request rather than fail it.
 */
function chainFor(
  leg: IndexedLeg,
  byKey: Map<DayKey, IndexedLeg>,
): IndexedLeg[] {
  const out: IndexedLeg[] = [];
  const seen = new Set<DayKey>();
  let current: IndexedLeg | undefined = leg;

  while (current && !seen.has(current.key)) {
    seen.add(current.key);
    out.unshift(current);
    current = current.requires ? byKey.get(current.requires) : undefined;
  }
  return out;
}

/**
 * Which legs are on the table at all, before length is considered.
 *
 * Two gates. A `demanding` leg is withdrawn when children are travelling; a
 * windowed leg is withdrawn when the trip does not cover its dates. Both then
 * cascade — a day whose prerequisite has just been withdrawn goes with it,
 * because "Tawang monastery" without the day that drives you over Sela to
 * reach it is not a shorter trip, it is a wrong one.
 */
function availableLegs(
  legs: IndexedLeg[],
  { avoidDemanding, months }: { avoidDemanding: boolean; months: Set<number> },
): { available: IndexedLeg[]; withheld: IndexedLeg[] } {
  const out = new Map<DayKey, IndexedLeg>();
  const withheld: IndexedLeg[] = [];

  for (const leg of legs) {
    const seasonal = leg.months && !leg.months.some((m) => months.has(m));
    const tooMuch = avoidDemanding && leg.demanding;
    if (seasonal || tooMuch) {
      if (tooMuch) withheld.push(leg);
      continue;
    }
    out.set(leg.key, leg);
  }

  // Cascade until stable: dropping a prerequisite drops its dependants, which
  // may themselves be somebody's prerequisite.
  let changed = true;
  while (changed) {
    changed = false;
    for (const leg of [...out.values()]) {
      if (leg.requires && !out.has(leg.requires)) {
        out.delete(leg.key);
        if (avoidDemanding) withheld.push(leg);
        changed = true;
      }
    }
  }

  return {
    available: [...out.values()].sort((a, b) => a.index - b.index),
    withheld,
  };
}

/**
 * Fills `budget` middle days from what is available.
 *
 * Greedy by priority, and a leg is only taken if its whole prerequisite chain
 * fits in what is left — otherwise it is skipped and a cheaper day gets the
 * slot. That is why a five-day Sikkim trip returns Rumtek and Tsomgo rather
 * than one orphaned north-Sikkim day.
 */
function selectLegs(
  available: IndexedLeg[],
  budget: number,
): { chosen: IndexedLeg[]; left: IndexedLeg[] } {
  const byKey = new Map(available.map((leg) => [leg.key, leg]));
  const chosen = new Set<number>();

  const byPriority = [...available].sort(
    (a, b) => a.priority - b.priority || a.index - b.index,
  );

  for (const leg of byPriority) {
    if (chosen.size >= budget) break;
    const missing = chainFor(leg, byKey).filter((l) => !chosen.has(l.index));
    if (missing.length === 0) continue;
    if (chosen.size + missing.length > budget) continue;
    for (const l of missing) chosen.add(l.index);
  }

  return {
    chosen: available.filter((leg) => chosen.has(leg.index)),
    left: available.filter((leg) => !chosen.has(leg.index)),
  };
}

/* ---------------------------------------------------------------------- */
/* Pricing                                                                 */
/* ---------------------------------------------------------------------- */

/**
 * What a night in this state costs, per person, before anything else.
 *
 * Taken as the **median** of the catalogue's own per-night rates for the
 * state rather than invented. Median rather than mean because one twelve-day
 * Sikkim trip with two nights at 4,700 metres drags an average somewhere no
 * traveller would recognise. If a state has no catalogue trips at all the
 * fallback is the region's floor, and the quote says "indicative" either way.
 */
function nightlyRate(state: StateSlug): number {
  const rates = getToursByState(state)
    .map((tour) => tour.fromPrice / tour.nights)
    .sort((a, b) => a - b);
  if (rates.length === 0) return 9000;
  return rates[Math.floor(rates.length / 2)];
}

/**
 * The party-rate ladder, matching the catalogue's own bands exactly. A guide
 * and a vehicle cost the same whether four people or eight are in them, and
 * that is passed on rather than pocketed.
 */
function headcountRatio(heads: number): number {
  if (heads >= 8) return 0.81;
  if (heads >= 6) return 0.86;
  if (heads >= 4) return 0.92;
  return 1;
}

/** Honeymoons hold the best room in every house and never share a vehicle. */
const PARTY_MULTIPLIER: Record<PartyType, number> = {
  couple: 1,
  honeymoon: 1.18,
  family: 1,
  group: 1,
  solo: 1,
};

function buildPlanQuote({
  state,
  party,
  nights,
  adults,
  children,
}: {
  state: StateSlug;
  party: PartyType;
  nights: number;
  adults: number;
  children: number;
}): PlanQuote {
  const heads = adults + children;
  const perAdult = round500(
    nightlyRate(state) *
      nights *
      PARTY_MULTIPLIER[party] *
      headcountRatio(heads),
  );
  const perChild = children > 0 ? round500(perAdult * CHILD_RATE) : null;

  const lines: QuoteLine[] = [
    {
      label: `${formatINR(perAdult)} × ${adults} ${adults === 1 ? "adult" : "adults"}`,
      amount: perAdult * adults,
      note:
        headcountRatio(heads) < 1
          ? `Party rate applied — ${Math.round((1 - headcountRatio(heads)) * 100)}% off the two-person rate`
          : undefined,
    },
  ];

  if (perChild !== null) {
    lines.push({
      label: `${formatINR(perChild)} × ${children} ${children === 1 ? "child" : "children"}`,
      amount: perChild * children,
      note: `Under ${CHILD_AGE_LIMIT}, sharing with an adult`,
    });
  }

  if (party === "solo") {
    // Same 28% the catalogue uses. A solo traveller is paying for a room
    // nobody else is in, and hiding that until checkout is how a quote stops
    // being believed.
    const supplement = round500(perAdult * 0.28);
    lines.push({
      label: "Single room supplement",
      amount: supplement,
      note: "Covers the room we cannot twin-share",
    });
  }

  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  return { perAdult, perChild, lines, total, deposit: round500(total * 0.25) };
}

/* ---------------------------------------------------------------------- */
/* The planner                                                             */
/* ---------------------------------------------------------------------- */

/** Every month the trip touches, so a seasonal day is judged on the whole span. */
function monthsCovered(startISO: string, endISO: string): Set<number> {
  const months = new Set<number>();
  const end = parseISO(endISO).getTime();
  let cursor = startISO;
  let guard = 0;

  while (parseISO(cursor).getTime() <= end && guard < 400) {
    months.add(parseISO(cursor).getUTCMonth() + 1);
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return months;
}

/**
 * A stable reference for the enquiry. Derived from the request, so a
 * traveller who plans the same trip twice quotes the same number back at us
 * and we find the same conversation.
 */
function referenceFor(input: PlanInput): string {
  const seed = `${input.state}|${input.party}|${input.startDate}|${input.endDate}|${input.adults}|${input.children}`;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const serial = String((hash >>> 0) % 1000000).padStart(6, "0");
  return `HOW-P${serial}`;
}

export function planTrip(input: PlanInput): TripPlan {
  const route = getRoute(input.state);
  const destination = getDestinationBySlug(input.state);
  const nights = nightsBetween(input.startDate, input.endDate);
  const dayCount = nights + 1;
  const avoidDemanding = input.children > 0;

  const legs: IndexedLeg[] = route.legs.map((leg, index) => ({
    ...leg,
    index,
  }));
  const months = monthsCovered(input.startDate, input.endDate);
  const { available, withheld } = availableLegs(legs, {
    avoidDemanding,
    months,
  });

  // Day one arrives and the last day leaves; everything else is the route.
  const budget = Math.max(0, dayCount - 2);
  const { chosen, left } = selectLegs(available, budget);

  const keys: DayKey[] = [
    route.arrive,
    ...chosen.map((leg) => leg.key),
    route.depart,
  ];
  const itinerary = buildItinerary(keys);
  const days: PlannedDay[] = itinerary.map((day, index) => ({
    ...day,
    date: addDays(input.startDate, index),
  }));

  /*
   * The planned length, which can be shorter than the requested one — either
   * because the road runs out (Sikkim has nine days in it, not sixteen) or
   * because withholding the high-altitude days from a party with children
   * takes three of them off the table.
   *
   * Everything downstream is priced and dated from *this*, not from what was
   * asked for. A sixteen-night quote attached to a nine-day itinerary is the
   * single fastest way to lose an enquiry, and it is the failure mode a
   * generated planner falls into by default.
   */
  const plannedNights = days.length - 1;
  const plannedEnd = addDays(input.startDate, plannedNights);
  const clamped = days.length < dayCount;

  /* --- What we did, and why ------------------------------------------- */

  const shaping: string[] = [];
  const warnings: string[] = [];

  // The gateway string carries its own travel advice — "Guwahati (GAU), then
  // 3 hours by road" — which reads badly mid-sentence. The airport is the
  // part this sentence is about.
  const airport = (destination?.gateway ?? "the gateway airport").split(",")[0];
  const fullDays = Math.max(0, days.length - 2);
  shaping.push(
    `Day 1 and day ${days.length} are the transfers in and out of ${airport}, so the trip has ${fullDays} full ${fullDays === 1 ? "day" : "days"} in it.`,
  );

  if (chosen.some((leg) => leg.key === "restDay")) {
    shaping.push(
      "One day is left deliberately unscheduled. On a trip this length it is the day people remember, and it is the first thing we add once the essentials fit.",
    );
  }

  if (avoidDemanding && withheld.length > 0) {
    const titles = withheld.map((leg) => dayLibrary[leg.key].title);
    shaping.push(
      `Left out because you are travelling with ${input.children === 1 ? "a child" : "children"}: ${listOf(titles)}. ${withheld.length === 1 ? "It is" : "They are"} either a long day at altitude or a hard climb, and ${withheld.length === 1 ? "it works" : "they work"} badly with young legs. Say the word and we will put ${withheld.length === 1 ? "it" : "them"} back.`,
    );
  }

  if (chosen.some((leg) => leg.months?.includes(12))) {
    shaping.push(
      "Hornbill runs 1–10 December and your dates cover it, so it is in the plan. We will order the days around the festival rather than the other way round.",
    );
  }

  if (clamped) {
    const spare = dayCount - days.length;
    warnings.push(
      `Your dates run to ${formatLong(input.endDate)}, which is ${dayCount} days. This itinerary is ${days.length} — everything the ${destination?.name ?? "state"} road holds${avoidDemanding && withheld.length > 0 ? " once the high days are set aside for the children" : ""} — and it is priced for ${days.length}, not for what you asked. The spare ${spare} ${spare === 1 ? "day is" : "days are"} best spent in a neighbouring state. Tell us which and we will draft it.`,
    );
  } else if (dayCount < route.minDays) {
    warnings.push(
      `${route.minDays} days is the shortest we would recommend for ${destination?.name ?? "this state"}. We have planned the ${dayCount} you asked for and it works, but it spends a larger share of itself on the road than we would like.`,
    );
  }

  const startMonth = parseISO(input.startDate).getUTCMonth() + 1;
  if (
    destination &&
    !destination.bestMonths.includes(MONTH_NAMES[startMonth - 1])
  ) {
    warnings.push(
      `${MONTH_NAMES[startMonth - 1]} sits outside the window we recommend for ${destination.name} — that is ${listOf(destination.bestMonths)}. We will still run it, and it will be quieter and cheaper, but expect rain and the odd closed road.`,
    );
  }

  if (destination?.requiresILP) {
    warnings.push(
      `${destination.name} needs an Inner Line Permit. We raise it for you, but it wants a fortnight, and the names on it have to match your identity documents exactly.`,
    );
  }

  /* --- Catalogue trips close to this ---------------------------------- */

  const matches: PlanMatch[] = getToursByState(input.state)
    .filter((tour) => matchesParty(tour, input.party))
    .map((tour) => ({
      slug: tour.slug,
      title: tour.title,
      strapline: tour.strapline,
      nights: tour.nights,
      fromPrice: tour.fromPrice,
      region: tour.region,
      heroAlt: tour.heroAlt,
      image: tour.image,
      nightsDelta: Math.abs(tour.nights - plannedNights),
      nextDeparture:
        tour.departures.find((d) => d.status !== "sold-out")?.date ?? null,
    }))
    .sort((a, b) => a.nightsDelta - b.nightsDelta || a.fromPrice - b.fromPrice)
    .slice(0, 3);

  return {
    reference: referenceFor(input),
    state: input.state,
    stateName: destination?.name ?? input.state,
    gateway: destination?.gateway ?? "",
    party: input.party,
    startDate: input.startDate,
    endDate: plannedEnd,
    nights: plannedNights,
    dayCount: days.length,
    requestedEndDate: input.endDate,
    requestedNights: nights,
    clamped,
    adults: input.adults,
    children: input.children,
    days,
    shaping,
    warnings,
    // The unscheduled day is excluded deliberately. It is a *shape* rather
    // than a place, and listing "A day with nothing in it" under "what you
    // are missing" invites the reader to pay for another night of nothing.
    notIncluded: left
      .filter((leg) => leg.key !== "restDay")
      .map((leg) => dayLibrary[leg.key].title),
    requiresILP: Boolean(destination?.requiresILP),
    routeNote: route.note,
    quote: buildPlanQuote({
      state: input.state,
      party: input.party,
      nights: plannedNights,
      adults: input.adults,
      children: input.children,
    }),
    matches,
  };
}

/** `a, b and c` — an Oxford-comma-free list, because this is British copy. */
function listOf(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Exported for the enquiry summary, which quotes the head count back. */
export function describeParty(adults: number, children: number): string {
  const parts = [`${adults} ${adults === 1 ? "adult" : "adults"}`];
  if (children > 0) {
    parts.push(`${children} ${children === 1 ? "child" : "children"}`);
  }
  return parts.join(", ");
}
