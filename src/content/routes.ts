import type { DayKey } from "./day-library";
import type { StateSlug } from "./types";

/**
 * Route spines, one per state.
 *
 * The catalogue holds forty-seven *finished* itineraries. This file holds the
 * raw material behind them: for each state, the arrival day, the departure
 * day, and every place-day in between in the order you would actually drive
 * them. Give it a length and it can compose an itinerary that did not exist
 * before — which is what the planner needs, because a traveller arriving with
 * "we have five days in October" is not asking to be sold a fixed departure.
 *
 * Two orderings live in one array, and keeping them separate is the whole
 * design:
 *
 *  - **Array order is route order.** Where a day sits in `legs` is where it
 *    sits on the map, driving from the gateway outwards and back. This never
 *    changes.
 *  - **`priority` is the order days are *added* as a trip gets longer.** 1 is
 *    the day the trip does not exist without; 7 is what you get on the tenth
 *    night. A four-day Meghalaya trip and an eight-day one are the same road
 *    with more stops on it, not two different routes.
 *
 * The planner picks by priority and then re-sorts into route order, so a
 * short trip is always a *subset* of the long one and never a scramble.
 *
 * Every `DayKey` here resolves against `day-library.ts`, which means one
 * correction to a fact — a monastery closed on Mondays, a road washed out —
 * lands in the catalogue and in every planned trip at the same time.
 */

export type RouteLeg = {
  key: DayKey;
  /** Lower is more essential. 1 = the reason the trip is being taken. */
  priority: number;
  /**
   * A day that makes no sense without another one before it. Selecting this
   * leg pulls its prerequisite in; dropping the prerequisite drops this too.
   * You cannot see Tawang monastery without first crossing Sela to reach it.
   */
  requires?: DayKey;
  /**
   * A long day, a high pass, or a hard climb. Dropped when children are
   * travelling — along with anything that required it.
   */
  demanding?: boolean;
  /**
   * Months (1–12) this day is only offered in. Used for dated events: the
   * Hornbill day is a real day of the trip in December and a fiction in
   * March, and a planner that offers it year-round is lying in the one place
   * a traveller will check.
   */
  months?: number[];
};

export type Route = {
  state: StateSlug;
  /** Day one. Always the transfer in from the gateway airport. */
  arrive: DayKey;
  /** The last day. Always resolves its stay to null in `buildItinerary`. */
  depart: DayKey;
  legs: RouteLeg[];
  /**
   * The shortest length the route is worth flying for. Shorter is still
   * planned — refusing to plan is worse than planning with a warning — but
   * the traveller is told.
   */
  minDays: number;
  /** What the state's own road network is good for, before combining. */
  note: string;
};

/**
 * Assam. The one route that starts and ends at the region's main airport, so
 * it is also the one every neighbouring state borrows its arrival day from.
 *
 * Manas sits last rather than first even though it is west of Guwahati: a
 * traveller who has already seen Kaziranga reads Manas as the quiet one,
 * which is what it is. Seen first it just reads as a smaller Kaziranga.
 */
const assam: Route = {
  state: "assam",
  arrive: "guwahatiArrive",
  depart: "guwahatiDepart",
  minDays: 4,
  note: "The river, the grassland and the satras are all a day's drive apart on decent road.",
  legs: [
    { key: "kazirangaTransfer", priority: 1 },
    { key: "kazirangaSafari", priority: 1, requires: "kazirangaTransfer" },
    { key: "kazirangaEastern", priority: 4, requires: "kazirangaTransfer" },
    { key: "majuliFerry", priority: 2 },
    { key: "majuliSatras", priority: 2, requires: "majuliFerry" },
    { key: "jorhatTea", priority: 3, requires: "majuliFerry" },
    { key: "sivasagar", priority: 5, requires: "jorhatTea" },
    { key: "restDay", priority: 6 },
    { key: "manasPark", priority: 7 },
  ],
};

/**
 * Meghalaya. Two bases — Shillong and Sohra — and everything is a day trip
 * from one of them, which is why this route takes a short length better than
 * any other in the region.
 */
const meghalaya: Route = {
  state: "meghalaya",
  arrive: "guwahatiArrive",
  depart: "guwahatiDepart",
  minDays: 4,
  note: "Two bases, everything a day trip from one of them. The state that works best on a short week.",
  legs: [
    { key: "shillongTransfer", priority: 1 },
    { key: "mawphlang", priority: 4, requires: "shillongTransfer" },
    { key: "cherrapunji", priority: 1, requires: "shillongTransfer" },
    { key: "nongriat", priority: 3, requires: "cherrapunji", demanding: true },
    { key: "dawkiMawlynnong", priority: 2, requires: "shillongTransfer" },
    { key: "restDay", priority: 5 },
  ],
};

/**
 * Arunachal Pradesh, west — the Tawang road.
 *
 * The two Kaziranga days at the top are not padding. Bhalukpong is reached
 * through Assam, the drive is long enough that operators routinely break it,
 * and "Tawang with Kaziranga on the way" is a trip people actually book. They
 * carry priority 6 and 7, so they only appear once the Tawang loop itself is
 * complete — a nine-day request gets the full mountain route *and* the
 * grassland, and a six-day request gets the mountains alone.
 *
 * Ziro and Mechuka are deliberately absent. They are central Arunachal, three
 * days of driving from this road, and stitching them onto a Tawang itinerary
 * would produce a plan that cannot be driven.
 */
const arunachal: Route = {
  state: "arunachal-pradesh",
  arrive: "guwahatiArrive",
  depart: "guwahatiDepart",
  minDays: 6,
  note: "One road, climbing from the Assam plain to 4,170 metres at Sela and back down the same way.",
  legs: [
    { key: "kazirangaTransfer", priority: 6 },
    { key: "kazirangaSafari", priority: 7, requires: "kazirangaTransfer" },
    { key: "bhalukpongTransfer", priority: 1 },
    { key: "dirang", priority: 1, requires: "bhalukpongTransfer" },
    { key: "tawangSela", priority: 1, requires: "dirang" },
    { key: "tawangMonastery", priority: 2, requires: "tawangSela" },
    { key: "restDay", priority: 4 },
  ],
};

/**
 * Nagaland. Kohima is the base for three of the four days; Mon is eight hours
 * north of it and only earns its place on a longer trip.
 *
 * `hornbillFestival` is the one date-gated day on the site. It runs 1–10
 * December, so it is offered in December and nowhere else — and because it
 * carries priority 1 in that month, a December trip is built *around* it
 * rather than being offered it as an extra.
 */
const nagaland: Route = {
  state: "nagaland",
  arrive: "kohimaTransfer",
  depart: "departDimapur",
  minDays: 4,
  note: "Kohima and the Angami villages within an hour of it; Konyak country is a long day further north.",
  legs: [
    { key: "hornbillFestival", priority: 1, months: [12] },
    { key: "khonoma", priority: 1 },
    { key: "dzukou", priority: 3, demanding: true },
    { key: "monLongwa", priority: 4 },
    { key: "restDay", priority: 6 },
  ],
};

/** Manipur. Compact — Imphal, the lake, and the craft villages around them. */
const manipur: Route = {
  state: "manipur",
  arrive: "imphalArrive",
  depart: "departImphal",
  minDays: 3,
  note: "Everything within an hour of Imphal, which makes it the easiest state to add to another.",
  legs: [
    { key: "loktakLake", priority: 1 },
    { key: "andro", priority: 2 },
    { key: "restDay", priority: 4 },
  ],
};

/** Mizoram. Aizawl on its ridge, and one very long drive south to Phawngpui. */
const mizoram: Route = {
  state: "mizoram",
  arrive: "aizawlArrive",
  depart: "departAizawl",
  minDays: 3,
  note: "Aizawl and Reiek are close together. Phawngpui is three hundred kilometres of hill road and needs its own days.",
  legs: [
    { key: "reiek", priority: 1 },
    { key: "phawngpui", priority: 2, demanding: true },
    { key: "restDay", priority: 4 },
  ],
};

/** Tripura. Agartala, the water palace, and the rock reliefs in the north. */
const tripura: Route = {
  state: "tripura",
  arrive: "agartalaArrive",
  depart: "departAgartala",
  minDays: 3,
  note: "Small, flat and quick to cover. Unakoti in the north is the one long drive.",
  legs: [
    { key: "neermahal", priority: 1 },
    { key: "unakoti", priority: 2 },
    { key: "restDay", priority: 4 },
  ],
};

/**
 * Sikkim. Gangtok, then north to Lachung and Lachen, then west to Pelling —
 * which is the order the permits and the roads both want.
 *
 * Three of these days are above 4,000 metres and two are above 4,700, so the
 * `demanding` flags matter more here than anywhere else on the site: a family
 * planning Sikkim with a six-year-old gets Rumtek and Pelling, and does not
 * get Gurudongmar at 5,430 metres.
 */
const sikkim: Route = {
  state: "sikkim",
  arrive: "gangtokTransfer",
  depart: "departBagdogra",
  minDays: 4,
  note: "North Sikkim and west Sikkim are opposite ends of the state. Doing both properly takes eight days.",
  legs: [
    { key: "gangtokMonasteries", priority: 1 },
    { key: "tsomgoNathula", priority: 2, demanding: true },
    { key: "lachungYumthang", priority: 3, demanding: true },
    {
      key: "gurudongmar",
      priority: 5,
      requires: "lachungYumthang",
      demanding: true,
    },
    { key: "pellingKanchenjunga", priority: 4 },
    {
      key: "yuksomTrek",
      priority: 6,
      requires: "pellingKanchenjunga",
    },
    { key: "restDay", priority: 7 },
  ],
};

const routes: Record<StateSlug, Route> = {
  assam,
  meghalaya,
  "arunachal-pradesh": arunachal,
  nagaland,
  manipur,
  mizoram,
  tripura,
  sikkim,
};

export function getRoute(state: StateSlug): Route {
  return routes[state];
}

/**
 * The longest trip this route can fill without repeating itself — arrival,
 * every leg, departure. Trips longer than this are planned to this length and
 * the traveller is told why, rather than being handed padding.
 */
export function maxDaysFor(state: StateSlug): number {
  return routes[state].legs.length + 2;
}
