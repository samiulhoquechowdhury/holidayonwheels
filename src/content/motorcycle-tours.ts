import type { Departure, MotorcycleTour } from "./types";
import { buildItinerary, type DayKey } from "./day-library";
import { addDays } from "@/lib/date";

/**
 * Guided motorcycle expeditions.
 *
 * These are tours, not rentals. Standalone bike hire lives on beepdrive.com
 * and is linked out from /rentals — see src/config/external.ts. Nothing in
 * this file should ever link there.
 *
 * Every departure runs with a support pickup truck carrying spares, luggage,
 * fuel and a mechanic, which is the difference between an expedition and a
 * group of people on bikes hoping for the best.
 */

const SUPPORT_VEHICLE = [
  "A mechanic travelling with the group for the full route",
  "Common spares: levers, cables, tubes, chains, sprockets, bulbs",
  "All luggage, so you ride with a day pack and nothing else",
  "Jerry cans, because fuel stops are 150km apart in places",
  "A first-aid kit, stretcher board and supplementary oxygen above 4,000m",
  "Recovery gear and a winch",
];

const STANDARD_INCLUDES = [
  "Motorcycle hire for the full route, with fuel",
  "A lead rider and a sweep rider, both from the region",
  "Support pickup truck with mechanic and spares",
  "All accommodation on a twin-share basis",
  "Breakfast and dinner daily",
  "All permits, park fees and border formalities",
  "Airport transfers on arrival and departure days",
  "24-hour support line",
];

const STANDARD_EXCLUDES = [
  "Flights to and from the region",
  "Riding gear — helmet, jacket, gloves, boots (hire available, ask us)",
  "Travel and medical insurance, which we require you to hold",
  "Lunches and all drinks",
  "Damage to the motorcycle beyond fair wear, up to the security deposit",
  "Anything not explicitly listed as included",
];

const HIMALAYAN: MotorcycleTour["bikes"] = [
  { name: "Royal Enfield Himalayan 450", engineCc: 452, surcharge: 0 },
  { name: "Royal Enfield Classic 350", engineCc: 349, surcharge: -6000 },
  { name: "KTM 390 Adventure", engineCc: 373, surcharge: 12000 },
];

const ROADSTER: MotorcycleTour["bikes"] = [
  { name: "Royal Enfield Classic 350", engineCc: 349, surcharge: 0 },
  { name: "Royal Enfield Himalayan 450", engineCc: 452, surcharge: 8000 },
];

function seeded(seed: string, salt = 0): number {
  let hash = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 10000;
}

function makeDepartures(
  slug: string,
  startDates: string[],
  nights: number,
  basePrice: number,
  groupMax: number,
): Departure[] {
  return startDates.map((date, index) => {
    const seatsLeft = Math.max(0, Math.round(seeded(slug, index) * groupMax));
    let status: Departure["status"] = "open";
    if (seatsLeft === 0) status = "sold-out";
    else if (seatsLeft <= 2) status = "filling";
    else if (seatsLeft >= groupMax - 2) status = "guaranteed";
    return {
      date,
      endDate: addDays(date, nights),
      seatsLeft,
      perPerson: basePrice,
      status,
    };
  });
}

type MotoSeed = Pick<
  MotorcycleTour,
  | "slug"
  | "title"
  | "strapline"
  | "states"
  | "region"
  | "distanceKm"
  | "maxAltitude"
  | "intro"
  | "terrain"
  | "highlights"
  | "difficulty"
  | "startsAt"
  | "endsAt"
  | "requiresILP"
  | "ridingExperience"
  | "heroAlt"
> & {
  fromPrice: number;
  groupSizeMax: number;
  bikes: MotorcycleTour["bikes"];
  itinerary: DayKey[];
  departureDates: string[];
  featured?: boolean;
  extraIncludes?: string[];
};

function makeMoto(seed: MotoSeed): MotorcycleTour {
  const itinerary = buildItinerary(seed.itinerary);
  const days = itinerary.length;
  const nights = days - 1;

  return {
    ...seed,
    nights,
    days,
    // Pillion riders share a bike, so they pay materially less.
    pillionPrice: Math.round((seed.fromPrice * 0.7) / 500) * 500,
    bikes: seed.bikes,
    supportVehicle: SUPPORT_VEHICLE,
    includes: [...STANDARD_INCLUDES, ...(seed.extraIncludes ?? [])],
    excludes: STANDARD_EXCLUDES,
    itinerary,
    departures: makeDepartures(
      seed.slug,
      seed.departureDates,
      nights,
      seed.fromPrice,
      seed.groupSizeMax,
    ),
  };
}

const seeds: MotoSeed[] = [
  {
    slug: "tawang-run",
    title: "The Tawang run",
    strapline: "Sela Pass at 4,170 metres, and the road that gets you there",
    states: ["arunachal-pradesh", "assam"],
    region: "arunachal",
    distanceKm: 1180,
    maxAltitude: 4170,
    fromPrice: 148000,
    groupSizeMax: 12,
    difficulty: "challenging",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: true,
    featured: true,
    ridingExperience:
      "You should have at least 5,000km on a motorcycle in the last two years, including some unsurfaced road. This is not a first big ride.",
    intro:
      "Nine days and roughly twelve hundred kilometres from the Assam plains to 3,048 metres at Tawang, over a pass that is usually in snow. The surface ranges from good tarmac to river crossings, and the last hundred kilometres before Sela will be the hardest riding most people in the group have done.",
    terrain: [
      "Tarmac in reasonable condition to Bhalukpong",
      "Broken surface and gravel from Bomdila to Dirang",
      "Snow, slush and standing water at Sela in most seasons",
      "Two or three shallow water crossings depending on rainfall",
    ],
    highlights: [
      "Sela Pass at 4,170 metres",
      "Tawang monastery, the largest in India",
      "The Sangti valley at dawn",
      "Sangetsar lake and the Bum La approach road",
    ],
    heroAlt:
      "A group of motorcycles on the snow-lined approach to Sela Pass at 4,170 metres, western Arunachal Pradesh",
    bikes: HIMALAYAN,
    itinerary: [
      "guwahatiArrive",
      "bhalukpongTransfer",
      "dirang",
      "tawangSela",
      "tawangMonastery",
      "restDay",
      "dirang",
      "bhalukpongTransfer",
      "guwahatiDepart",
    ],
    departureDates: [
      "2026-09-12",
      "2026-10-03",
      "2026-10-24",
      "2027-03-20",
      "2027-04-17",
      "2027-05-15",
    ],
  },
  {
    slug: "north-sikkim-high-road",
    title: "The north Sikkim high road",
    strapline: "Gurudongmar at 5,430 metres, on two wheels",
    states: ["sikkim"],
    region: "sikkim",
    distanceKm: 890,
    maxAltitude: 5430,
    fromPrice: 162000,
    groupSizeMax: 10,
    difficulty: "expert",
    startsAt: "Bagdogra",
    endsAt: "Bagdogra",
    requiresILP: true,
    featured: true,
    ridingExperience:
      "Serious high-altitude experience required. If you have not ridden above 4,000m before, take the Tawang run first — we will say no to this one.",
    intro:
      "Eight days across Sikkim ending at Gurudongmar, one of the highest lakes in the world at 5,430 metres. The altitude is the real difficulty, not the road: two acclimatisation nights are built in and they are not optional. Oxygen and a pulse oximeter travel with the support truck.",
    terrain: [
      "Excellent tarmac up the Teesta valley",
      "Broken road and landslide repairs beyond Chungthang",
      "Loose gravel and river-wash above Thangu",
      "Frozen surface on the Gurudongmar approach before ten in the morning",
    ],
    highlights: [
      "Gurudongmar lake at 5,430 metres",
      "Yumthang valley and Zero Point",
      "Nathu La on the old Silk Road",
      "Two built-in acclimatisation nights",
    ],
    heroAlt:
      "A motorcycle parked on the frozen shore of Gurudongmar lake at 5,430 metres, north Sikkim",
    bikes: HIMALAYAN,
    extraIncludes: [
      "Two acclimatisation nights, built in and non-negotiable",
      "Pulse oximeter monitoring and supplementary oxygen in the support truck",
    ],
    itinerary: [
      "gangtokTransfer",
      "gangtokMonasteries",
      "tsomgoNathula",
      "restDay",
      "gurudongmar",
      "lachungYumthang",
      "restDay",
      "departBagdogra",
    ],
    departureDates: [
      "2026-09-19",
      "2026-10-10",
      "2027-04-10",
      "2027-05-08",
      "2027-06-05",
    ],
  },
  {
    slug: "meghalaya-monsoon-loop",
    title: "The Meghalaya loop",
    strapline: "Six hundred kilometres of the wettest tarmac on earth",
    states: ["meghalaya"],
    region: "meghalaya",
    distanceKm: 640,
    maxAltitude: 1800,
    fromPrice: 84000,
    groupSizeMax: 14,
    difficulty: "moderate",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: false,
    featured: true,
    ridingExperience:
      "The most approachable ride we run. Comfortable on a 350 in traffic and on hill roads is enough. No high altitude.",
    intro:
      "Five days through the Khasi hills on some of the best-surfaced hill roads in India — the state maintains them properly — with more corners per kilometre than anywhere else in the Northeast. Low altitude, short days, and the option of riding it in monsoon if you want the waterfalls at full volume.",
    terrain: [
      "Well-surfaced hill tarmac almost throughout",
      "Tight hairpins on the Sohra plateau descent",
      "Standing water and reduced visibility in monsoon",
    ],
    highlights: [
      "The Sohra plateau escarpment road",
      "Dawki and the Bangladesh border road",
      "Mawphlang sacred grove",
      "Laitlum canyon at the end of the day",
    ],
    heroAlt:
      "A motorcycle on the escarpment road above the Sohra plateau in Meghalaya with cloud filling the gorge below",
    bikes: ROADSTER,
    itinerary: [
      "shillongTransfer",
      "cherrapunji",
      "dawkiMawlynnong",
      "mawphlang",
      "guwahatiDepart",
    ],
    departureDates: [
      "2026-10-10",
      "2026-11-07",
      "2026-12-05",
      "2027-02-06",
      "2027-03-06",
      "2027-06-12",
    ],
  },
  {
    slug: "naga-hills-expedition",
    title: "The Naga hills expedition",
    strapline: "Kohima to Longwa, and a border through a chief's house",
    states: ["nagaland", "assam"],
    region: "nagaland",
    distanceKm: 980,
    maxAltitude: 2452,
    fromPrice: 126000,
    groupSizeMax: 10,
    difficulty: "challenging",
    startsAt: "Dimapur",
    endsAt: "Dimapur",
    requiresILP: true,
    ridingExperience:
      "Comfortable riding a loaded bike on genuinely bad surface for six hours. The Mon road is the worst in this catalogue.",
    intro:
      "Eight days through the Naga hills to Konyak country in the far north. The road to Mon is the roughest we ride and the reason to do it is Longwa, where the Angh's house sits on the Myanmar border and the older men still carry the facial tattoos of the headhunting years.",
    terrain: [
      "Reasonable tarmac from Dimapur to Kohima",
      "Deteriorating surface north of Mokokchung",
      "Unsurfaced, rutted and often washed out on the Mon approach",
      "Steep loose climbs into the villages themselves",
    ],
    highlights: [
      "Longwa and the international boundary",
      "Khonoma's community conservation area",
      "The Dzükou valley trailhead",
      "Kohima war cemetery",
    ],
    heroAlt:
      "Motorcycles on an unsurfaced ridge road through the Naga hills towards Mon district, Nagaland",
    bikes: HIMALAYAN,
    itinerary: [
      "kohimaTransfer",
      "khonoma",
      "dzukou",
      "monLongwa",
      "monLongwa",
      "restDay",
      "kohimaTransfer",
      "departDimapur",
    ],
    departureDates: ["2026-10-17", "2026-11-14", "2027-01-23", "2027-02-20"],
  },
  {
    slug: "seven-states-grand-expedition",
    title: "Seven states, one expedition",
    strapline: "Three thousand kilometres, twenty-one days, four permits",
    states: [
      "assam",
      "meghalaya",
      "arunachal-pradesh",
      "nagaland",
      "manipur",
      "mizoram",
      "tripura",
    ],
    region: "neutral",
    distanceKm: 3120,
    maxAltitude: 4170,
    fromPrice: 298000,
    groupSizeMax: 10,
    difficulty: "expert",
    startsAt: "Guwahati",
    endsAt: "Agartala",
    requiresILP: true,
    featured: true,
    ridingExperience:
      "Three weeks in the saddle across every surface the region has. You need long-distance touring experience and the fitness to ride eight-hour days back to back.",
    intro:
      "The full traverse on two wheels: twenty-one days, seven states, three thousand kilometres and every road surface the Northeast has. This is the hardest thing we run and we vet every rider individually before confirming a place. Two rest days are built in and you will want both.",
    terrain: [
      "Everything: highway, hill tarmac, gravel, snow, river crossing, mud",
      "Sela Pass in whatever condition October gives us",
      "The Mon road, which is the worst surface on the route",
      "Long plains transits between the hill sections",
    ],
    highlights: [
      "Sela Pass, Dzükou, Loktak, Phawngpui and Unakoti in one route",
      "All four Inner Line Permits handled",
      "Two support vehicles rather than one",
      "A single lead rider for all twenty-one days",
    ],
    heroAlt:
      "A line of motorcycles crossing a high ridge road in cloud somewhere between Nagaland and Manipur",
    bikes: HIMALAYAN,
    extraIncludes: [
      "Two support vehicles for the full route",
      "All four Inner Line Permits",
      "Two built-in rest days",
    ],
    itinerary: [
      "guwahatiArrive",
      "shillongTransfer",
      "cherrapunji",
      "dawkiMawlynnong",
      "kazirangaTransfer",
      "kazirangaSafari",
      "bhalukpongTransfer",
      "dirang",
      "tawangSela",
      "tawangMonastery",
      "restDay",
      "dirang",
      "kohimaTransfer",
      "khonoma",
      "dzukou",
      "imphalArrive",
      "loktakLake",
      "aizawlArrive",
      "reiek",
      "restDay",
      "agartalaArrive",
      "departAgartala",
    ],
    departureDates: ["2026-10-24", "2027-03-13", "2027-10-23"],
  },
  {
    slug: "assam-river-run",
    title: "The Brahmaputra river run",
    strapline: "Flat, fast, and a ferry in the middle of it",
    states: ["assam"],
    region: "assam",
    distanceKm: 720,
    maxAltitude: 213,
    fromPrice: 76000,
    groupSizeMax: 14,
    difficulty: "moderate",
    startsAt: "Guwahati",
    endsAt: "Jorhat",
    requiresILP: false,
    ridingExperience:
      "The easiest ride in this catalogue. If you are comfortable on a highway and a rough village road, you are fine.",
    intro:
      "Five days along the Brahmaputra with a bike on a ferry in the middle of it. Almost no altitude, mostly good surface, and the best introduction to riding in the Northeast if you have not done it before. Kaziranga and Majuli in the same route.",
    terrain: [
      "National highway in good condition for most of the route",
      "Rough embankment tracks around the char villages",
      "A loaded ferry crossing with bikes lashed on deck",
    ],
    highlights: [
      "Riding a bike onto the Majuli ferry",
      "A safari day at Kaziranga",
      "Tea garden roads outside Jorhat",
    ],
    heroAlt:
      "Motorcycles lashed on the deck of a Brahmaputra ferry crossing to Majuli island, Assam",
    bikes: ROADSTER,
    itinerary: [
      "guwahatiArrive",
      "kazirangaTransfer",
      "kazirangaSafari",
      "majuliFerry",
      "majuliSatras",
      "guwahatiDepart",
    ],
    departureDates: [
      "2026-11-08",
      "2026-12-06",
      "2027-01-10",
      "2027-02-07",
      "2027-03-07",
    ],
  },
  {
    slug: "mizoram-ridge-ride",
    title: "The Mizoram ridge ride",
    strapline: "Empty roads, and a Sunday when nothing moves",
    states: ["mizoram"],
    region: "mizoram",
    distanceKm: 810,
    maxAltitude: 2157,
    fromPrice: 108000,
    groupSizeMax: 8,
    difficulty: "challenging",
    startsAt: "Aizawl",
    endsAt: "Aizawl",
    requiresILP: true,
    ridingExperience:
      "Long days on narrow ridge roads with steep drops and no barrier. Comfortable riding exposed hill roads is essential.",
    intro:
      "Seven days south from Aizawl to Phawngpui and back, on roads that carry almost no traffic and run along ridgelines for hours at a time. Three hundred kilometres each way to the Blue Mountain, and it takes a full day in each direction.",
    terrain: [
      "Narrow ridge tarmac with no barriers and long exposure",
      "Broken surface and landslide repair south of Lunglei",
      "Unsurfaced final approach to the Phawngpui gate",
    ],
    highlights: [
      "Phawngpui, the Blue Mountain, at 2,157 metres",
      "The Chhimtuipui river valley",
      "Reiek Tlang above Aizawl",
      "Roads with essentially no other vehicles on them",
    ],
    heroAlt:
      "A motorcycle on a narrow ridge road running along a spine of hills in southern Mizoram",
    bikes: HIMALAYAN,
    itinerary: [
      "aizawlArrive",
      "reiek",
      "phawngpui",
      "phawngpui",
      "restDay",
      "reiek",
      "departAizawl",
    ],
    departureDates: ["2026-10-24", "2026-11-21", "2027-02-20", "2027-03-20"],
  },
  {
    slug: "eastern-frontier-ride",
    title: "The eastern frontier ride",
    strapline: "Nagaland into Manipur, by the road nobody takes",
    states: ["nagaland", "manipur"],
    region: "manipur",
    distanceKm: 940,
    maxAltitude: 2452,
    fromPrice: 132000,
    groupSizeMax: 8,
    difficulty: "challenging",
    startsAt: "Dimapur",
    endsAt: "Imphal",
    requiresILP: true,
    ridingExperience:
      "Sustained hill riding on mixed surface, with some long days. Previous multi-day tour experience expected.",
    intro:
      "Nine days from the Naga hills into the Imphal valley by road, which very few groups do. The two states share the Dzükou range and not much else, and the crossing between them is one of the more interesting days of riding in the region.",
    terrain: [
      "Mixed tarmac and gravel through the Naga hills",
      "A long, rough descent into the Imphal valley",
      "Good valley-floor roads around Loktak",
    ],
    highlights: [
      "The Dzükou valley trailhead",
      "The Nagaland–Manipur ridge crossing",
      "Loktak's phumdis",
      "Ima Keithel in Imphal",
    ],
    heroAlt:
      "A motorcycle on the ridge road crossing from the Naga hills into the Imphal valley, with cloud below",
    bikes: HIMALAYAN,
    itinerary: [
      "kohimaTransfer",
      "khonoma",
      "dzukou",
      "restDay",
      "imphalArrive",
      "loktakLake",
      "andro",
      "restDay",
      "departImphal",
    ],
    departureDates: ["2026-11-14", "2026-12-12", "2027-02-13"],
  },
  {
    slug: "ziro-music-ride",
    title: "The Ziro ride",
    strapline: "Up to the Apatani plateau for the festival, and back",
    states: ["arunachal-pradesh", "assam"],
    region: "arunachal",
    distanceKm: 760,
    maxAltitude: 1688,
    fromPrice: 96000,
    groupSizeMax: 12,
    difficulty: "moderate",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: true,
    ridingExperience:
      "Moderate. The climb to Ziro is long but the surface is manageable, and there is no serious altitude.",
    intro:
      "Six days up to the Apatani plateau, timed to land inside the Ziro Festival of Music where the dates allow. The climb from the Assam plains through pine into the valley is one of the best hours of riding in the Northeast.",
    terrain: [
      "Highway across the Assam plains",
      "A long steady climb on mixed surface from Hapoli",
      "Good valley-floor roads once you are up",
    ],
    highlights: [
      "The pine climb into the Ziro valley",
      "Apatani villages at Hong and Hija",
      "Ziro Festival of Music where dates align",
    ],
    heroAlt:
      "Motorcycles on the pine-lined climb into the Ziro valley, Arunachal Pradesh",
    bikes: ROADSTER,
    itinerary: [
      "guwahatiArrive",
      "ziroTransfer",
      "ziroValley",
      "restDay",
      "ziroTransfer",
      "guwahatiDepart",
    ],
    departureDates: ["2026-09-24", "2026-10-15", "2027-03-18", "2027-04-15"],
  },
  {
    slug: "tripura-and-the-southern-plains",
    title: "Tripura and the southern plains",
    strapline: "A gentle five days for a first tour",
    states: ["tripura", "assam"],
    region: "tripura",
    distanceKm: 580,
    maxAltitude: 940,
    fromPrice: 68000,
    groupSizeMax: 12,
    difficulty: "moderate",
    startsAt: "Agartala",
    endsAt: "Agartala",
    requiresILP: false,
    ridingExperience:
      "Suitable for a first guided tour. Warm, flat, short days, and no permits.",
    intro:
      "Five easy days around Tripura: Unakoti, Neermahal, and the Jampui hills at 940 metres for the orange season. Short riding days, warm weather, and the least demanding route we run.",
    terrain: [
      "Good state highway throughout",
      "One moderate hill climb into the Jampui range",
      "Rough village lanes on the Unakoti approach",
    ],
    highlights: [
      "Unakoti's rock reliefs",
      "Neermahal across Rudrasagar",
      "The Jampui hills in orange season",
    ],
    heroAlt:
      "A motorcycle on a quiet plains road running between paddy fields towards the Jampui hills, Tripura",
    bikes: ROADSTER,
    itinerary: [
      "agartalaArrive",
      "unakoti",
      "restDay",
      "neermahal",
      "departAgartala",
    ],
    departureDates: ["2026-11-21", "2026-12-19", "2027-01-23", "2027-02-20"],
  },
];

const motorcycleTours: MotorcycleTour[] = seeds.map(makeMoto);
const bySlug = new Map(motorcycleTours.map((t) => [t.slug, t]));

export function getMotorcycleTours(): MotorcycleTour[] {
  return motorcycleTours;
}

export function getMotorcycleTourBySlug(
  slug: string,
): MotorcycleTour | undefined {
  return bySlug.get(slug);
}

export function getFeaturedMotorcycleTours(limit = 3): MotorcycleTour[] {
  return motorcycleTours.filter((t) => t.featured).slice(0, limit);
}

export function getRelatedMotorcycleTours(
  slug: string,
  limit = 3,
): MotorcycleTour[] {
  const tour = bySlug.get(slug);
  if (!tour) return [];
  return motorcycleTours
    .filter(
      (t) => t.slug !== slug && t.states.some((s) => tour.states.includes(s)),
    )
    .slice(0, limit);
}
