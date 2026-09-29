import type { StateSlug } from "./types";

/**
 * Where to eat and drink in the city a trip starts from.
 *
 * Shown under a drafted itinerary as "while you are there" — three cards:
 * anything on at the time, somewhere for coffee, somewhere for dinner. It is
 * the one part of the planner that is not selling anything; nothing here is
 * booked through us, and that is the point. A page that only ever points at
 * its own inventory reads as a brochure.
 *
 * ## What is verified and what is not
 *
 * **The places are real and were looked up, not invented.** Assam and
 * Meghalaya were researched against current listings — Paradise has been
 * serving Assamese thalis in Guwahati since 1984, Heritage Khorikaa was
 * opened by the chef Atul Lahkar in 2007, Dylan's Cafe in Shillong is the
 * Bob Dylan themed one everybody means. That is a different claim from
 * saying they are open on the night somebody arrives.
 *
 * **What still needs checking before launch**, and it is the client's call
 * because it is their reputation on the recommendation:
 *
 *  - opening hours and closing days, none of which are stated here on
 *    purpose — a wrong Tuesday is worse than no Tuesday;
 *  - that each is still trading, which a listing site is slow to reflect;
 *  - the price bands, which are indicative and rounded.
 *
 * **The six states below Assam and Meghalaya are not researched.** They fall
 * back to their gateway city's entry where one exists and are otherwise
 * empty, and an empty list renders nothing rather than a placeholder — see
 * `localGuideFor`. Do not invent entries to fill them in; a made-up
 * restaurant is the one kind of placeholder a traveller can act on and be
 * let down by.
 */

export type LocalPlace = {
  name: string;
  /** One line. What it is and why this one. */
  note: string;
  /** Indicative, per person, in rupees. Rounded, and not a quote. */
  fromPrice?: number;
};

export type LocalGuide = {
  /** The city these belong to, named on the cards. */
  city: string;
  cafes: LocalPlace[];
  dinners: LocalPlace[];
};

const GUWAHATI: LocalGuide = {
  city: "Guwahati",
  cafes: [
    {
      name: "11th Avenue Cafe Bistro",
      note: "Dark-roast Indian estate arabica and an all-day breakfast. Three branches; Dighalipukhuri is the one to sit in.",
      fromPrice: 400,
    },
    {
      name: "Mocha Cafe and Bar",
      note: "Twenty years old and still the reliable one — Assamese plates alongside the European menu, and the desserts are the reason to stay.",
      fromPrice: 500,
    },
    {
      name: "The Steaming Mug",
      note: "Small, in Ambari, and genuinely about the coffee rather than the room.",
      fromPrice: 300,
    },
  ],
  dinners: [
    {
      name: "Paradise",
      note: "Serving the Assamese thali since 1984 — khar, masor tenga, fish steamed in plantain leaf, and the cream-and-jaggery pudding after.",
      fromPrice: 500,
    },
    {
      name: "Heritage Khorikaa",
      note: "Chef Atul Lahkar's restaurant, open since 2007. The most ambitious cooking of this food anywhere in the city.",
      fromPrice: 700,
    },
    {
      name: "Khorika",
      note: "Assamese barbecue. Order the pork skewers and a plate of rice, and do not over-order.",
      fromPrice: 450,
    },
  ],
};

const SHILLONG: LocalGuide = {
  city: "Shillong",
  cafes: [
    {
      name: "Dylan's Cafe",
      note: "The Bob Dylan one. Wooden floors, memorabilia on every wall, and coffee worth the wait the service sometimes asks of you.",
      fromPrice: 350,
    },
    {
      name: "ML05 Cafe",
      note: "A Harley parked in the middle of the room and a rooftop over the city. Pour-over if you want it made properly.",
      fromPrice: 350,
    },
  ],
  dinners: [
    {
      name: "Trattoria",
      note: "Khasi food, plainly served — putharo, jadoh, black-sesame pork. The local answer to where to eat, not the tourist one.",
      fromPrice: 300,
    },
  ],
};

/**
 * Keyed by the state a trip is built around, not by every city on the route.
 * Three states share Guwahati because Guwahati is where their trips begin and
 * end; that is a fact about the airport, not a shortcut.
 */
const GUIDES: Partial<Record<StateSlug, LocalGuide>> = {
  assam: GUWAHATI,
  meghalaya: SHILLONG,
  "arunachal-pradesh": GUWAHATI,
};

export function localGuideFor(state: StateSlug): LocalGuide | null {
  return GUIDES[state] ?? null;
}
