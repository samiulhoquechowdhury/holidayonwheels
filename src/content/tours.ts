import type { Departure, PriceBand, Tour, TourType } from "./types";
import { buildItinerary, type DayKey } from "./day-library";
import { addDays } from "@/lib/date";

/**
 * Guided tour catalogue.
 *
 * Tours are authored as a compact seed and expanded by `makeTour`, which
 * derives the itinerary from the day library and fills the parts that are the
 * same across the catalogue — price bands, standard inclusions, departure
 * seats. Everything a traveller actually reads is written by hand.
 *
 * Departure seats and dates are derived deterministically from the slug so
 * server and client always render the same figures.
 */

const STANDARD_INCLUDES = [
  "All accommodation on a twin-share basis",
  "All ground transport in a private air-conditioned vehicle",
  "An English-speaking guide from the region throughout",
  "All permits, park fees and entry tickets listed in the itinerary",
  "Meals as specified in the day-by-day",
  "Airport and station transfers on arrival and departure days",
  "24-hour on-trip support line",
];

const STANDARD_EXCLUDES = [
  "Flights to and from the region",
  "Travel insurance, which we require you to hold",
  "Visas for non-Indian nationals",
  "Meals not listed in the itinerary, and all drinks",
  "Camera fees at monasteries and parks where charged separately",
  "Tips for your guide and driver",
  "Anything not explicitly listed as included",
];

/** Stable pseudo-random in [0,1) derived from a string. Never Math.random. */
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
    const roll = seeded(slug, index);
    const seatsLeft = Math.max(0, Math.round(roll * groupMax));
    // The first listed departure of a season is often discounted to get it
    // guaranteed; later ones sit at the standard rate.
    const discounted = index === 0 && roll > 0.55;
    const perPerson = discounted
      ? Math.round((basePrice * 0.88) / 500) * 500
      : basePrice;

    let status: Departure["status"] = "open";
    if (seatsLeft === 0) status = "sold-out";
    else if (seatsLeft <= 3) status = "filling";
    else if (seatsLeft >= groupMax - 2) status = "guaranteed";

    return {
      date,
      endDate: addDays(date, nights),
      seatsLeft,
      perPerson,
      wasPerPerson: discounted ? basePrice : undefined,
      status,
    };
  });
}

/**
 * Group discounts. A couple pays the headline rate; larger parties get the
 * vehicle and guide cost spread further, which is passed on.
 */
function makePriceBands(base: number): PriceBand[] {
  return [
    { fromPax: 2, perPerson: base },
    { fromPax: 4, perPerson: Math.round((base * 0.92) / 500) * 500 },
    { fromPax: 6, perPerson: Math.round((base * 0.86) / 500) * 500 },
    { fromPax: 8, perPerson: Math.round((base * 0.81) / 500) * 500 },
  ];
}

type TourSeed = Pick<
  Tour,
  | "slug"
  | "title"
  | "strapline"
  | "states"
  | "region"
  | "types"
  | "intro"
  | "highlights"
  | "difficulty"
  | "startsAt"
  | "endsAt"
  | "requiresILP"
  | "heroAlt"
> & {
  fromPrice: number;
  groupSizeMax: number;
  itinerary: DayKey[];
  departureDates: string[];
  featured?: boolean;
  singleSupplement?: number;
  extraIncludes?: string[];
  extraExcludes?: string[];
};

function makeTour(seed: TourSeed): Tour {
  const itinerary = buildItinerary(seed.itinerary);
  const days = itinerary.length;
  const nights = days - 1;

  return {
    slug: seed.slug,
    title: seed.title,
    strapline: seed.strapline,
    states: seed.states,
    region: seed.region,
    types: seed.types,
    nights,
    days,
    fromPrice: seed.fromPrice,
    priceBands: makePriceBands(seed.fromPrice),
    singleSupplement:
      seed.singleSupplement ?? Math.round((seed.fromPrice * 0.28) / 500) * 500,
    intro: seed.intro,
    highlights: seed.highlights,
    includes: [...STANDARD_INCLUDES, ...(seed.extraIncludes ?? [])],
    excludes: [...STANDARD_EXCLUDES, ...(seed.extraExcludes ?? [])],
    itinerary,
    departures: makeDepartures(
      seed.slug,
      seed.departureDates,
      nights,
      seed.fromPrice,
      seed.groupSizeMax,
    ),
    difficulty: seed.difficulty,
    groupSizeMax: seed.groupSizeMax,
    startsAt: seed.startsAt,
    endsAt: seed.endsAt,
    requiresILP: seed.requiresILP,
    heroAlt: seed.heroAlt,
    featured: seed.featured,
  };
}

const ALL: TourType[] = ["couple", "honeymoon", "group", "solo"];

const seeds: TourSeed[] = [
  /* ---- Assam ----------------------------------------------------------- */
  {
    slug: "brahmaputra-and-the-rhino-country",
    title: "The Brahmaputra and rhino country",
    strapline: "Kaziranga, Majuli and the tea belt in one unhurried week",
    states: ["assam"],
    region: "assam",
    types: ALL,
    fromPrice: 74500,
    groupSizeMax: 12,
    difficulty: "easy",
    startsAt: "Guwahati",
    endsAt: "Jorhat",
    requiresILP: false,
    featured: true,
    intro:
      "The classic Assam route, run at the pace it deserves. Three nights at Kaziranga rather than the usual one, so you see the eastern range as well as the tourist ranges, then across the Brahmaputra to Majuli for the satras, and out through the tea gardens at Jorhat.",
    highlights: [
      "Three separate safari ranges at Kaziranga, including the quiet eastern one",
      "The ninety-minute ferry crossing to Majuli at the right time of day",
      "Mask-making with the Goswami family at Samaguri satra",
      "A working tea estate, walked with the manager rather than a brochure",
    ],
    heroAlt:
      "A greater one-horned rhinoceros grazing in tall elephant grass at dawn in Kaziranga National Park, Assam",
    itinerary: [
      "guwahatiArrive",
      "kazirangaTransfer",
      "kazirangaSafari",
      "kazirangaEastern",
      "majuliFerry",
      "majuliSatras",
      "jorhatTea",
      "guwahatiDepart",
    ],
    departureDates: [
      "2026-11-08",
      "2026-11-22",
      "2026-12-06",
      "2027-01-10",
      "2027-02-07",
      "2027-03-07",
    ],
  },
  {
    slug: "kaziranga-short-escape",
    title: "Kaziranga short escape",
    strapline: "Four days, three safaris, no wasted hours",
    states: ["assam"],
    region: "assam",
    types: ["couple", "group", "solo"],
    fromPrice: 38500,
    groupSizeMax: 10,
    difficulty: "easy",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: false,
    intro:
      "For travellers with a long weekend and one thing they want to see. Straight to Kaziranga, three safaris across two ranges, and back — no filler days, no half-day drives to fill a brochure.",
    highlights: [
      "Dawn jeep safari in the Kohora central range",
      "Afternoon drive at Bagori, western range",
      "Gangetic dolphin on the Brahmaputra bank",
    ],
    heroAlt:
      "Jeep safari track through elephant grass in the Bagori range of Kaziranga, Assam",
    itinerary: [
      "guwahatiArrive",
      "kazirangaTransfer",
      "kazirangaSafari",
      "guwahatiDepart",
    ],
    departureDates: [
      "2026-11-14",
      "2026-12-12",
      "2027-01-16",
      "2027-02-13",
      "2027-03-13",
    ],
  },
  {
    slug: "assam-tea-and-ahom-heritage",
    title: "Tea, temples and the Ahom kingdom",
    strapline: "Six hundred years of Assam that most itineraries skip",
    states: ["assam"],
    region: "assam",
    types: ["couple", "group", "solo"],
    fromPrice: 68000,
    groupSizeMax: 12,
    difficulty: "easy",
    startsAt: "Guwahati",
    endsAt: "Jorhat",
    requiresILP: false,
    intro:
      "The Ahoms ruled Assam for six centuries and repelled the Mughals seventeen times, and almost no visitor stops at what they left behind. This route pairs Sivasagar's tank temples and palaces with the tea country that replaced them.",
    highlights: [
      "Talatal Ghar and the Rang Ghar amphitheatre at Sivasagar",
      "Two nights in a working planter's bungalow",
      "The satras of Majuli",
    ],
    heroAlt:
      "The oval brick Rang Ghar amphitheatre built by the Ahom kings at Sivasagar, Assam",
    itinerary: [
      "guwahatiArrive",
      "kazirangaTransfer",
      "kazirangaSafari",
      "jorhatTea",
      "sivasagar",
      "majuliFerry",
      "majuliSatras",
      "guwahatiDepart",
    ],
    departureDates: ["2026-11-15", "2026-12-13", "2027-01-17", "2027-02-14"],
  },
  {
    slug: "manas-and-the-bhutan-foothills",
    title: "Manas and the Bhutan foothills",
    strapline: "A tiger reserve with none of the traffic",
    states: ["assam"],
    region: "assam",
    types: ["couple", "group", "solo"],
    fromPrice: 52000,
    groupSizeMax: 10,
    difficulty: "easy",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: false,
    intro:
      "Manas is a tiger reserve, an elephant reserve, a biosphere reserve and a World Heritage site, and on most days you will share it with almost nobody. Golden langur, hispid hare, and a river that runs straight out of Bhutan.",
    highlights: [
      "Jeep safari in the Bansbari and Bhuyanpara ranges",
      "River raft down the Manas, water level permitting",
      "Golden langur in the riverine forest",
    ],
    heroAlt:
      "The Manas river running out of the Bhutan foothills into Manas National Park, Assam",
    itinerary: ["guwahatiArrive", "manasPark", "restDay", "guwahatiDepart"],
    departureDates: ["2026-11-21", "2026-12-19", "2027-02-06", "2027-03-06"],
  },

  /* ---- Meghalaya ------------------------------------------------------- */
  {
    slug: "meghalaya-root-bridges-and-rain",
    title: "Root bridges and the rain country",
    strapline: "Sohra, Nongriat and the clear water at Dawki",
    states: ["meghalaya"],
    region: "meghalaya",
    types: ALL,
    fromPrice: 61500,
    groupSizeMax: 12,
    difficulty: "moderate",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: false,
    featured: true,
    intro:
      "Meghalaya's headline route, with the Nongriat descent given a full day instead of being squeezed into a morning. Six thousand steps is not a photo stop, and treating it as one is why most people come back miserable.",
    highlights: [
      "The double-decker living root bridge at Nongriat, with time to swim",
      "Nohkalikai falling 340 metres into the gorge",
      "The Umngot at Dawki before ten in the morning, when it is still glass",
      "Mawphlang sacred grove, walked with a Khasi guide",
    ],
    heroAlt:
      "The double-decker living root bridge at Nongriat, Meghalaya, its ficus roots grown across a stream in two tiers",
    itinerary: [
      "shillongTransfer",
      "cherrapunji",
      "nongriat",
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
      "2027-03-27",
    ],
  },
  {
    slug: "shillong-weekender",
    title: "Shillong weekender",
    strapline: "Four days in the Khasi hills, no rush",
    states: ["meghalaya"],
    region: "meghalaya",
    types: ["couple", "honeymoon", "solo"],
    fromPrice: 36500,
    groupSizeMax: 8,
    difficulty: "easy",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: false,
    intro:
      "The short version: Shillong, the Sohra waterfall road, and Dawki, without the Nongriat descent. Good for a first visit, a long weekend, or knees that have opinions.",
    highlights: [
      "Laitlum canyon at the end of the afternoon",
      "The Sohra plateau waterfalls",
      "Boating the Umngot at Dawki",
    ],
    heroAlt:
      "Cloud pouring into Laitlum canyon in the Khasi hills outside Shillong, Meghalaya",
    itinerary: [
      "shillongTransfer",
      "cherrapunji",
      "dawkiMawlynnong",
      "guwahatiDepart",
    ],
    departureDates: [
      "2026-10-17",
      "2026-11-14",
      "2026-12-12",
      "2027-02-13",
      "2027-03-13",
    ],
  },
  {
    slug: "assam-meghalaya-classic",
    title: "Assam and Meghalaya, the classic pairing",
    strapline: "Rhino, river and root bridge in ten days",
    states: ["assam", "meghalaya"],
    region: "assam",
    types: ALL,
    fromPrice: 96000,
    groupSizeMax: 12,
    difficulty: "moderate",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: false,
    featured: true,
    intro:
      "If you have ten days and have never been to the Northeast, this is the route. The two most rewarding states, the two most different landscapes, and a single airport at both ends.",
    highlights: [
      "Three ranges at Kaziranga",
      "The Majuli satras and the Brahmaputra ferry",
      "Nongriat's double-decker root bridge",
      "Dawki and the Bangladesh plain from Thangkharang",
    ],
    heroAlt:
      "The Brahmaputra at dusk from a ferry between Nimati Ghat and Majuli island, Assam",
    itinerary: [
      "guwahatiArrive",
      "kazirangaTransfer",
      "kazirangaSafari",
      "kazirangaEastern",
      "majuliFerry",
      "majuliSatras",
      "shillongTransfer",
      "cherrapunji",
      "nongriat",
      "dawkiMawlynnong",
      "guwahatiDepart",
    ],
    departureDates: [
      "2026-10-24",
      "2026-11-14",
      "2026-12-05",
      "2027-01-23",
      "2027-02-20",
      "2027-03-20",
    ],
  },

  /* ---- Arunachal Pradesh ----------------------------------------------- */
  {
    slug: "tawang-and-sela-pass",
    title: "Tawang and the Sela Pass",
    strapline: "Over 4,170 metres to the largest monastery in India",
    states: ["arunachal-pradesh", "assam"],
    region: "arunachal",
    types: ["couple", "group", "solo"],
    fromPrice: 108000,
    groupSizeMax: 10,
    difficulty: "challenging",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: true,
    featured: true,
    intro:
      "Nine days and roughly a thousand kilometres of some of the hardest and best road in India, ending at 3,048 metres in front of Galden Namgey Lhatse. This is a driving trip; the days are long and the reward is a Himalaya almost nobody sees.",
    highlights: [
      "Sela Pass at 4,170 metres, usually under snow",
      "Tawang monastery, the largest in India",
      "Sangetsar lake and the road towards Bum La",
      "The Sangti valley at Dirang, wintering ground for black-necked cranes",
    ],
    heroAlt:
      "Tawang monastery on its ridge at 3,048 metres in western Arunachal Pradesh, with snow peaks behind",
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
      "2026-09-19",
      "2026-10-10",
      "2027-03-20",
      "2027-04-10",
      "2027-05-08",
    ],
  },
  {
    slug: "ziro-valley-and-the-apatani",
    title: "Ziro valley and the Apatani",
    strapline: "Wet rice, fish and pine at 1,688 metres",
    states: ["arunachal-pradesh", "assam"],
    region: "arunachal",
    types: ["couple", "group", "solo"],
    fromPrice: 79000,
    groupSizeMax: 10,
    difficulty: "moderate",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: true,
    intro:
      "The Apatani plateau farms rice and fish in the same flooded field, terraces its water by gravity alone, and has done both for long enough that UNESCO has it on the tentative list. Six days, and three of them spent walking between villages.",
    highlights: [
      "Hong and Hija villages with an Apatani guide",
      "The paddy-cum-fish system explained by the people running it",
      "The edge of the Talley Valley wildlife sanctuary",
    ],
    heroAlt:
      "Flooded paddy-cum-fish terraces of the Apatani valley at Ziro, Arunachal Pradesh, ringed by pine ridges",
    itinerary: [
      "guwahatiArrive",
      "ziroTransfer",
      "ziroValley",
      "restDay",
      "ziroTransfer",
      "guwahatiDepart",
    ],
    departureDates: ["2026-09-12", "2026-10-03", "2027-03-13", "2027-04-17"],
  },
  {
    slug: "mechuka-the-far-valley",
    title: "Mechuka, the far valley",
    strapline: "As far west as the road goes, and then a bit further",
    states: ["arunachal-pradesh"],
    region: "arunachal",
    types: ["group", "solo"],
    fromPrice: 118000,
    groupSizeMax: 8,
    difficulty: "challenging",
    startsAt: "Dibrugarh",
    endsAt: "Dibrugarh",
    requiresILP: true,
    intro:
      "Mechuka is a wide glacial valley at 1,829 metres with a four-hundred-year-old gompa on the hill and a road in that takes two full days. Very few operators run it. If you want the Arunachal that has not been photographed to death, this is it.",
    highlights: [
      "Samten Yongcha gompa",
      "The Siyom river valley",
      "Memba and Ramo villages",
    ],
    heroAlt:
      "The wide glacial floor of the Mechuka valley with the Siyom river running through it, western Arunachal Pradesh",
    itinerary: [
      "guwahatiArrive",
      "ziroTransfer",
      "mechukaValley",
      "restDay",
      "mechukaValley",
      "ziroTransfer",
      "guwahatiDepart",
    ],
    departureDates: ["2026-10-17", "2027-03-27", "2027-04-24"],
  },

  /* ---- Nagaland -------------------------------------------------------- */
  {
    slug: "hornbill-festival",
    title: "The Hornbill Festival",
    strapline: "Sixteen tribes, one week, one heritage village",
    states: ["nagaland"],
    region: "nagaland",
    types: ALL,
    fromPrice: 87500,
    groupSizeMax: 14,
    difficulty: "easy",
    startsAt: "Dimapur",
    endsAt: "Dimapur",
    requiresILP: true,
    featured: true,
    intro:
      "Nagaland gathers all sixteen recognised tribes at Kisama for the first ten days of December, each in their own morung. It is the best single introduction to Naga material culture anywhere, and it sells out early — accommodation in Kohima is booked a year ahead.",
    highlights: [
      "Two full days at Kisama across the festival's strongest programme",
      "Khonoma, the village that banned hunting on its own land",
      "The Kohima war cemetery",
      "The night market, which is where the festival actually happens",
    ],
    heroAlt:
      "Angami dancers in ceremonial shawls at the Hornbill Festival, Kisama heritage village, Nagaland",
    itinerary: [
      "kohimaTransfer",
      "hornbillFestival",
      "hornbillFestival",
      "khonoma",
      "dzukou",
      "departDimapur",
    ],
    departureDates: ["2026-12-01", "2026-12-03", "2026-12-05"],
  },
  {
    slug: "nagaland-konyak-country",
    title: "Konyak country",
    strapline: "Mon, Longwa, and a border that runs through a house",
    states: ["nagaland"],
    region: "nagaland",
    types: ["group", "solo"],
    fromPrice: 92000,
    groupSizeMax: 8,
    difficulty: "challenging",
    startsAt: "Dimapur",
    endsAt: "Dimapur",
    requiresILP: true,
    intro:
      "The far north of Nagaland, where the last generation to carry the headhunting facial tattoos is still alive and the Angh of Longwa's house sits astride the Myanmar border. The roads are genuinely bad. Come anyway.",
    highlights: [
      "Longwa and the international boundary through the Angh's house",
      "Konyak villages around Mon with a local interpreter",
      "Opium-poppy politics discussed honestly rather than sold as spectacle",
    ],
    heroAlt:
      "A Konyak elder with traditional facial tattoos outside a longhouse at Longwa, Mon district, Nagaland",
    itinerary: [
      "kohimaTransfer",
      "khonoma",
      "monLongwa",
      "monLongwa",
      "restDay",
      "departDimapur",
    ],
    departureDates: ["2026-10-24", "2026-11-21", "2027-01-23", "2027-02-20"],
  },
  {
    slug: "dzukou-valley-trek",
    title: "The Dzükou valley",
    strapline: "Dwarf bamboo, a hard climb, and the best floor in the region",
    states: ["nagaland"],
    region: "nagaland",
    types: ["group", "solo"],
    fromPrice: 44000,
    groupSizeMax: 10,
    difficulty: "challenging",
    startsAt: "Dimapur",
    endsAt: "Dimapur",
    requiresILP: true,
    intro:
      "A five-day trip built around one very good day: the climb out of Viswema onto a valley floor of dwarf bamboo at 2,452 metres that does not look like it belongs in India. Overnight in the rest house so you get the valley at dawn.",
    highlights: [
      "Overnight in the Dzükou rest house",
      "The Dzükou lily in June and July",
      "Khonoma on the way back down",
    ],
    heroAlt:
      "The dwarf bamboo floor of the Dzükou valley at 2,452 metres on the Nagaland–Manipur border",
    itinerary: [
      "kohimaTransfer",
      "dzukou",
      "dzukou",
      "khonoma",
      "departDimapur",
    ],
    departureDates: ["2026-10-10", "2026-11-07", "2027-02-13", "2027-03-13"],
  },

  /* ---- Manipur --------------------------------------------------------- */
  {
    slug: "manipur-loktak-and-imphal",
    title: "Loktak and Imphal",
    strapline: "Floating islands, a mothers' market, and the sangai",
    states: ["manipur"],
    region: "manipur",
    types: ["couple", "group", "solo"],
    fromPrice: 58000,
    groupSizeMax: 10,
    difficulty: "easy",
    startsAt: "Imphal",
    endsAt: "Imphal",
    requiresILP: true,
    intro:
      "Five days around Imphal and Loktak. The lake's phumdis are floating mats of vegetation solid enough to build a hut on, and Keibul Lamjao is the only floating national park in the world. Ima Keithel has been run by women for around five centuries.",
    highlights: [
      "Sunrise on Loktak from Sendra",
      "Keibul Lamjao and the sangai deer",
      "Ima Keithel, the mothers' market",
      "An evening of Manipuri Ras Leela",
    ],
    heroAlt:
      "Circular floating phumdi islands on Loktak Lake, Manipur, seen from the Sendra viewpoint at sunrise",
    itinerary: [
      "imphalArrive",
      "loktakLake",
      "andro",
      "restDay",
      "departImphal",
    ],
    departureDates: ["2026-11-07", "2026-12-05", "2027-01-16", "2027-02-13"],
  },

  /* ---- Mizoram --------------------------------------------------------- */
  {
    slug: "mizoram-ridge-and-valley",
    title: "Mizoram: ridge and valley",
    strapline: "Aizawl, Reiek, and the quietest roads in the Northeast",
    states: ["mizoram"],
    region: "mizoram",
    types: ["couple", "group", "solo"],
    fromPrice: 62000,
    groupSizeMax: 10,
    difficulty: "moderate",
    startsAt: "Aizawl",
    endsAt: "Aizawl",
    requiresILP: true,
    intro:
      "Mizoram gets a fraction of the region's visitors and it is hard to say why. Ridge-top towns, bamboo forest, the second-highest literacy rate in India, and a weave — the puanchei — that stands with anything in the Northeast.",
    highlights: [
      "Reiek Tlang, with Bangladesh visible on a clear day",
      "The Mizo heritage village and a puanchei weaving demonstration",
      "Durtlang ridge above Aizawl at dusk",
    ],
    heroAlt:
      "Houses stacked down the ridge at Aizawl, Mizoram, above a valley filled with morning cloud",
    itinerary: ["aizawlArrive", "reiek", "restDay", "departAizawl"],
    departureDates: ["2026-10-17", "2026-11-14", "2027-01-16", "2027-03-13"],
  },
  {
    slug: "phawngpui-blue-mountain",
    title: "Phawngpui, the Blue Mountain",
    strapline: "Mizoram's high point, and a very long drive to reach it",
    states: ["mizoram"],
    region: "mizoram",
    types: ["group", "solo"],
    fromPrice: 84000,
    groupSizeMax: 8,
    difficulty: "challenging",
    startsAt: "Aizawl",
    endsAt: "Aizawl",
    requiresILP: true,
    intro:
      "Three hundred kilometres south of Aizawl on roads that take a full day each way, Phawngpui is a national park of orchid meadows and cliff faces at 2,157 metres. Blyth's tragopan lives here. So does almost nobody else.",
    highlights: [
      "The Thlazuang Khamtough cliff face",
      "Orchid meadows on the summit plateau",
      "The Chhimtuipui river valley on the drive in",
    ],
    heroAlt:
      "Orchid meadows and cliff edges on the summit plateau of Phawngpui, the Blue Mountain, southern Mizoram",
    itinerary: [
      "aizawlArrive",
      "phawngpui",
      "phawngpui",
      "reiek",
      "departAizawl",
    ],
    departureDates: ["2026-10-24", "2026-11-21", "2027-02-20"],
  },

  /* ---- Tripura --------------------------------------------------------- */
  {
    slug: "tripura-unakoti-and-neermahal",
    title: "Unakoti and the Manikya palaces",
    strapline: "Rock reliefs, a water palace, and five centuries of kings",
    states: ["tripura"],
    region: "tripura",
    types: ["couple", "group", "solo"],
    fromPrice: 47500,
    groupSizeMax: 12,
    difficulty: "easy",
    startsAt: "Agartala",
    endsAt: "Agartala",
    requiresILP: false,
    intro:
      "Tripura is small, warm, easy to reach and almost entirely absent from Northeast itineraries. Unakoti alone justifies the flight: Shaiva figures carved into a hillside, the largest over nine metres, and still not properly dated.",
    highlights: [
      "The Unakotiswara Kal Bhairava relief",
      "Neermahal, reached by boat across Rudrasagar",
      "Ujjayanta Palace and the Tripura state museum",
    ],
    heroAlt:
      "The nine-metre rock-cut relief of Unakotiswara Kal Bhairava carved into the hillside at Unakoti, Tripura",
    itinerary: ["agartalaArrive", "unakoti", "neermahal", "departAgartala"],
    departureDates: ["2026-11-14", "2026-12-12", "2027-01-16", "2027-02-13"],
  },

  /* ---- Sikkim ---------------------------------------------------------- */
  {
    slug: "sikkim-north-gurudongmar",
    title: "North Sikkim and Gurudongmar",
    strapline: "5,430 metres, before the wind gets up",
    states: ["sikkim"],
    region: "sikkim",
    types: ["couple", "group", "solo"],
    fromPrice: 89000,
    groupSizeMax: 10,
    difficulty: "challenging",
    startsAt: "Bagdogra",
    endsAt: "Bagdogra",
    requiresILP: true,
    featured: true,
    intro:
      "North Sikkim is the hardest part of the state to reach and the reason most people go. Gurudongmar sits at 5,430 metres and has to be reached before mid-morning; Yumthang, lower and softer, is the valley of flowers in April and May.",
    highlights: [
      "Gurudongmar lake at 5,430 metres",
      "Yumthang valley and Zero Point",
      "Tsomgo lake and Nathu La on the way through",
      "Rumtek, seat of the Karma Kagyu lineage",
    ],
    heroAlt:
      "Gurudongmar lake at 5,430 metres in north Sikkim, its surface part-frozen below bare Himalayan slopes",
    itinerary: [
      "gangtokTransfer",
      "gangtokMonasteries",
      "tsomgoNathula",
      "gurudongmar",
      "lachungYumthang",
      "restDay",
      "departBagdogra",
    ],
    departureDates: [
      "2026-09-26",
      "2026-10-17",
      "2027-03-20",
      "2027-04-17",
      "2027-05-15",
    ],
  },
  {
    slug: "sikkim-west-kanchenjunga",
    title: "West Sikkim and the Kanchenjunga face",
    strapline: "Pelling, Yuksom, and the mountain out of the window",
    states: ["sikkim"],
    region: "sikkim",
    types: ALL,
    fromPrice: 71000,
    groupSizeMax: 10,
    difficulty: "moderate",
    startsAt: "Bagdogra",
    endsAt: "Bagdogra",
    requiresILP: true,
    intro:
      "West Sikkim is where Kanchenjunga is closest and the crowds are thinnest. Pemayangtse, the Rabdentse ruins, and Yuksom — the first capital, and the trailhead for Goecha La if you ever come back with more time.",
    highlights: [
      "Kanchenjunga at dawn from Pelling",
      "Pemayangtse monastery and the Rabdentse ruins",
      "The walk up to Dubdi, the oldest monastery in Sikkim",
    ],
    heroAlt:
      "Kanchenjunga catching first light above the ridges at Pelling, west Sikkim",
    itinerary: [
      "gangtokTransfer",
      "gangtokMonasteries",
      "pellingKanchenjunga",
      "yuksomTrek",
      "restDay",
      "departBagdogra",
    ],
    departureDates: [
      "2026-10-03",
      "2026-11-07",
      "2027-03-06",
      "2027-04-03",
      "2027-05-01",
    ],
  },
  {
    slug: "sikkim-honeymoon-week",
    title: "Sikkim, slowly",
    strapline:
      "Seven days, two valleys, and nothing before nine in the morning",
    states: ["sikkim"],
    region: "sikkim",
    types: ["couple", "honeymoon"],
    fromPrice: 118000,
    groupSizeMax: 2,
    difficulty: "easy",
    startsAt: "Bagdogra",
    endsAt: "Bagdogra",
    requiresILP: true,
    featured: true,
    singleSupplement: 0,
    intro:
      "A private, unhurried Sikkim for two. Better rooms, later starts, a car and driver to yourselves, and the two viewpoints that matter — Kanchenjunga from Pelling and Tsomgo from the pass road — without a group waiting on you.",
    highlights: [
      "Private vehicle and guide throughout",
      "Two nights in a heritage property at Pelling with the mountain in the window",
      "A private dinner set up at the Rabdentse ruins",
      "Nothing scheduled before nine in the morning",
    ],
    heroAlt:
      "A heritage lodge terrace at Pelling, west Sikkim, looking directly at the Kanchenjunga massif",
    extraIncludes: [
      "Private vehicle and dedicated guide, not shared",
      "Room upgrades where the property offers them",
      "One private dinner at the Rabdentse ruins",
    ],
    itinerary: [
      "gangtokTransfer",
      "gangtokMonasteries",
      "tsomgoNathula",
      "pellingKanchenjunga",
      "restDay",
      "yuksomTrek",
      "departBagdogra",
    ],
    departureDates: [
      "2026-10-10",
      "2026-11-07",
      "2026-12-05",
      "2027-03-13",
      "2027-04-10",
    ],
  },

  /* ---- Multi-state ----------------------------------------------------- */
  {
    slug: "seven-sisters-grand-tour",
    title: "The seven sisters, end to end",
    strapline: "Eighteen days, seven states, one very long drive",
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
    types: ["group", "solo"],
    fromPrice: 248000,
    groupSizeMax: 12,
    difficulty: "challenging",
    startsAt: "Guwahati",
    endsAt: "Agartala",
    requiresILP: true,
    featured: true,
    intro:
      "The full traverse. Eighteen days, seven states, four permits and roughly three thousand kilometres of road. This is not a relaxing holiday and we will talk you out of it if it is not what you want — but nothing else gives you the region whole.",
    highlights: [
      "Kaziranga, Majuli, Nongriat, Ziro, Kohima, Loktak, Aizawl and Unakoti",
      "All Inner Line Permits handled end to end",
      "Two rest days built in, deliberately unscheduled",
      "A single guide for the whole eighteen days",
    ],
    heroAlt:
      "A hill road switchbacking through cloud forest between Nagaland and Manipur in the Northeast Indian highlands",
    extraIncludes: [
      "Internal flights between Imphal, Aizawl and Agartala",
      "All Inner Line Permits for Indian nationals",
    ],
    itinerary: [
      "guwahatiArrive",
      "kazirangaTransfer",
      "kazirangaSafari",
      "majuliFerry",
      "majuliSatras",
      "ziroTransfer",
      "ziroValley",
      "restDay",
      "kohimaTransfer",
      "khonoma",
      "dzukou",
      "imphalArrive",
      "loktakLake",
      "aizawlArrive",
      "reiek",
      "restDay",
      "agartalaArrive",
      "unakoti",
      "departAgartala",
    ],
    departureDates: ["2026-10-24", "2026-11-21", "2027-02-13", "2027-03-13"],
  },
  {
    slug: "assam-nagaland-hills-and-plains",
    title: "Hills and plains: Assam and Nagaland",
    strapline: "Kaziranga, Khonoma and the Naga highlands",
    states: ["assam", "nagaland"],
    region: "nagaland",
    types: ALL,
    fromPrice: 98500,
    groupSizeMax: 12,
    difficulty: "moderate",
    startsAt: "Guwahati",
    endsAt: "Dimapur",
    requiresILP: true,
    intro:
      "The plains and the hills in one route, and the contrast is the point: from the alluvial flatness of Kaziranga to Angami terraces at 1,600 metres in a single day's drive.",
    highlights: [
      "Two safaris at Kaziranga",
      "Khonoma's community conservation area",
      "The Kohima war cemetery",
      "Majuli's satras",
    ],
    heroAlt:
      "Alder-terraced fields below the Angami village of Khonoma, Nagaland",
    itinerary: [
      "guwahatiArrive",
      "kazirangaTransfer",
      "kazirangaSafari",
      "majuliFerry",
      "majuliSatras",
      "kohimaTransfer",
      "khonoma",
      "dzukou",
      "departDimapur",
    ],
    departureDates: ["2026-10-31", "2026-11-28", "2027-01-30", "2027-02-27"],
  },
  {
    slug: "meghalaya-tripura-southern-loop",
    title: "The southern loop: Meghalaya and Tripura",
    strapline: "Root bridges, rock reliefs, and the Bangladesh border",
    states: ["meghalaya", "tripura"],
    region: "meghalaya",
    types: ["couple", "group", "solo"],
    fromPrice: 88000,
    groupSizeMax: 10,
    difficulty: "moderate",
    startsAt: "Guwahati",
    endsAt: "Agartala",
    requiresILP: false,
    intro:
      "Two states that share a border with Bangladesh and almost nothing else. The Khasi hills at 1,500 metres and the Tripura plains at sea level, with no permits needed for either.",
    highlights: [
      "Nongriat's double-decker root bridge",
      "The Umngot at Dawki",
      "Unakoti's rock reliefs",
      "Neermahal on Rudrasagar lake",
    ],
    heroAlt:
      "The Umngot river at Dawki, Meghalaya, so clear that the boats appear suspended above the riverbed",
    itinerary: [
      "shillongTransfer",
      "cherrapunji",
      "nongriat",
      "dawkiMawlynnong",
      "agartalaArrive",
      "unakoti",
      "neermahal",
      "departAgartala",
    ],
    departureDates: ["2026-11-07", "2026-12-05", "2027-02-06", "2027-03-06"],
  },
  {
    slug: "manipur-nagaland-eastern-frontier",
    title: "The eastern frontier: Nagaland and Manipur",
    strapline: "Two states, one border range, very few other travellers",
    states: ["nagaland", "manipur"],
    region: "manipur",
    types: ["group", "solo"],
    fromPrice: 104000,
    groupSizeMax: 8,
    difficulty: "challenging",
    startsAt: "Dimapur",
    endsAt: "Imphal",
    requiresILP: true,
    intro:
      "Nagaland and Manipur share the Dzükou range and not much else. This route crosses between them by road, which very few itineraries do, and gives both states enough time to be more than a checklist.",
    highlights: [
      "Dzükou valley from the Nagaland side",
      "Khonoma and the Angami terraces",
      "Loktak's phumdis and Keibul Lamjao",
      "Ima Keithel in Imphal",
    ],
    heroAlt:
      "The ridge road between the Naga hills and the Imphal valley, with cloud sitting in the valleys below",
    itinerary: [
      "kohimaTransfer",
      "khonoma",
      "dzukou",
      "imphalArrive",
      "loktakLake",
      "andro",
      "restDay",
      "departImphal",
    ],
    departureDates: ["2026-11-14", "2026-12-12", "2027-02-13"],
  },
  {
    slug: "himalayan-northeast-sikkim-arunachal",
    title: "The Himalayan Northeast",
    strapline: "Sikkim and Tawang, the two high roads",
    states: ["sikkim", "arunachal-pradesh", "assam"],
    region: "sikkim",
    types: ["group", "solo"],
    fromPrice: 186000,
    groupSizeMax: 10,
    difficulty: "challenging",
    startsAt: "Bagdogra",
    endsAt: "Guwahati",
    requiresILP: true,
    intro:
      "The region's two great high-altitude drives in one fifteen-day route: north Sikkim to Gurudongmar at 5,430 metres, then east across Assam and over Sela Pass to Tawang. Serious mileage, serious altitude, and the best mountain scenery in eastern India.",
    highlights: [
      "Gurudongmar and Yumthang in north Sikkim",
      "Sela Pass and Tawang monastery",
      "Nathu La on the old Silk Road",
      "Two acclimatisation days built in, not optional",
    ],
    heroAlt:
      "Prayer flags on the Sela Pass at 4,170 metres between Dirang and Tawang, western Arunachal Pradesh",
    extraIncludes: [
      "Two built-in acclimatisation days",
      "Pulse oximeter and supplementary oxygen carried by the guide",
    ],
    itinerary: [
      "gangtokTransfer",
      "gangtokMonasteries",
      "tsomgoNathula",
      "gurudongmar",
      "lachungYumthang",
      "restDay",
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
    departureDates: ["2026-09-19", "2026-10-10", "2027-04-10", "2027-05-08"],
  },

  /* ---- Honeymoon and couple specialisations ---------------------------- */
  {
    slug: "meghalaya-honeymoon-cloud-and-water",
    title: "Cloud and water: a Meghalaya honeymoon",
    strapline: "Private, unhurried, and mostly outdoors",
    states: ["meghalaya"],
    region: "meghalaya",
    types: ["honeymoon", "couple"],
    fromPrice: 96000,
    groupSizeMax: 2,
    difficulty: "moderate",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: false,
    singleSupplement: 0,
    featured: true,
    intro:
      "Meghalaya for two, run privately. A cliff-edge property at Sohra with the gorge below the balcony, a full day at Nongriat with a picnic at the rock pools, and the Umngot at first light before any other boat is on it.",
    highlights: [
      "A cliff-edge room above the Sohra gorge",
      "Nongriat with a packed lunch and no schedule",
      "The Umngot at Dawki at first light, ahead of the crowd",
      "A private guide and vehicle throughout",
    ],
    heroAlt:
      "A cliff-edge terrace above the Sohra gorge in Meghalaya with cloud rising off the valley floor",
    extraIncludes: [
      "Private vehicle and dedicated guide",
      "Cliff-edge room at Sohra, subject to availability",
      "A packed riverside lunch at Nongriat",
    ],
    itinerary: [
      "shillongTransfer",
      "cherrapunji",
      "nongriat",
      "restDay",
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
    ],
  },
  {
    slug: "assam-honeymoon-river-and-tea",
    title: "River and tea: an Assam honeymoon",
    strapline: "A planter's bungalow, a river island, and no group",
    states: ["assam"],
    region: "assam",
    types: ["honeymoon", "couple"],
    fromPrice: 104000,
    groupSizeMax: 2,
    difficulty: "easy",
    startsAt: "Guwahati",
    endsAt: "Jorhat",
    requiresILP: false,
    singleSupplement: 0,
    intro:
      "The gentlest week in the region, run privately. Two nights in a colonial-era planter's bungalow with a cook who has been there thirty years, two safaris at Kaziranga, and a slow crossing to Majuli.",
    highlights: [
      "A working planter's bungalow with private dining",
      "Private jeep safaris rather than shared vehicles",
      "The Majuli ferry at the end of the afternoon",
    ],
    heroAlt:
      "The veranda of a colonial-era planter's bungalow looking over a working tea garden near Jorhat, Assam",
    extraIncludes: [
      "Private vehicle and dedicated guide",
      "Private jeep for all safaris",
      "One candlelit dinner on the bungalow lawn",
    ],
    itinerary: [
      "guwahatiArrive",
      "kazirangaTransfer",
      "kazirangaSafari",
      "jorhatTea",
      "restDay",
      "majuliFerry",
      "majuliSatras",
      "guwahatiDepart",
    ],
    departureDates: ["2026-11-14", "2026-12-12", "2027-01-16", "2027-02-13"],
  },
  {
    slug: "nagaland-honeymoon-khonoma-quiet",
    title: "Khonoma, quietly",
    strapline: "A green village, a valley trek, and a lot of nothing",
    states: ["nagaland"],
    region: "nagaland",
    types: ["honeymoon", "couple"],
    fromPrice: 82000,
    groupSizeMax: 2,
    difficulty: "moderate",
    startsAt: "Dimapur",
    endsAt: "Dimapur",
    requiresILP: true,
    singleSupplement: 0,
    intro:
      "Nagaland outside December, which is when it is at its best. Two nights in a village homestay at Khonoma, a day in the Dzükou valley, and enough unscheduled time to actually talk to anyone.",
    highlights: [
      "Two nights in an Angami family home at Khonoma",
      "The Dzükou valley with an early start",
      "Naga cooking, learned in the kitchen it comes from",
    ],
    heroAlt:
      "Stone-walled alder terraces below Khonoma village in the Angami hills of Nagaland",
    extraIncludes: [
      "Private vehicle and dedicated guide",
      "A Naga cooking session with your host family",
    ],
    itinerary: [
      "kohimaTransfer",
      "khonoma",
      "restDay",
      "dzukou",
      "departDimapur",
    ],
    departureDates: ["2026-10-17", "2026-11-14", "2027-02-13", "2027-03-13"],
  },

  /* ---- Solo and small-group specialisations ---------------------------- */
  {
    slug: "solo-northeast-first-timer",
    title: "Northeast for the first time, solo",
    strapline: "A small group, a single supplement waived, and no assumptions",
    states: ["assam", "meghalaya"],
    region: "meghalaya",
    types: ["solo", "group"],
    fromPrice: 79500,
    groupSizeMax: 10,
    difficulty: "moderate",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: false,
    singleSupplement: 0,
    featured: true,
    intro:
      "Built for people travelling on their own. The single supplement is waived, rooms are singles rather than shared twins, and the group is capped at ten. Assam and Meghalaya, which is the right first Northeast.",
    highlights: [
      "No single supplement — a room to yourself is the default",
      "Group capped at ten",
      "Kaziranga, Nongriat and Dawki",
      "Two evenings deliberately left free",
    ],
    heroAlt:
      "A single traveller on the steps down to Nongriat through dense rainforest in the Khasi hills, Meghalaya",
    extraIncludes: ["A single room throughout at no supplement"],
    itinerary: [
      "guwahatiArrive",
      "kazirangaTransfer",
      "kazirangaSafari",
      "shillongTransfer",
      "cherrapunji",
      "nongriat",
      "dawkiMawlynnong",
      "guwahatiDepart",
    ],
    departureDates: [
      "2026-10-17",
      "2026-11-14",
      "2026-12-12",
      "2027-02-13",
      "2027-03-13",
    ],
  },
  {
    slug: "solo-sikkim-slow-travel",
    title: "Sikkim, solo and slow",
    strapline: "Nine days, one valley at a time",
    states: ["sikkim"],
    region: "sikkim",
    types: ["solo"],
    fromPrice: 88000,
    groupSizeMax: 8,
    difficulty: "moderate",
    startsAt: "Bagdogra",
    endsAt: "Bagdogra",
    requiresILP: true,
    singleSupplement: 0,
    intro:
      "Sikkim without the checklist. Nine days across east and west Sikkim with rest days built in, a group of no more than eight, and no single supplement.",
    highlights: [
      "Rumtek, Pemayangtse and Dubdi",
      "Kanchenjunga from Pelling",
      "Two full rest days",
    ],
    heroAlt:
      "Cardamom terraces on the walk up to Dubdi monastery above Yuksom, west Sikkim",
    extraIncludes: ["A single room throughout at no supplement"],
    itinerary: [
      "gangtokTransfer",
      "gangtokMonasteries",
      "restDay",
      "pellingKanchenjunga",
      "yuksomTrek",
      "restDay",
      "tsomgoNathula",
      "restDay",
      "departBagdogra",
    ],
    departureDates: ["2026-10-03", "2026-11-07", "2027-03-06", "2027-04-03"],
  },
  {
    slug: "solo-arunachal-ziro-tawang",
    title: "Arunachal solo: Ziro and Tawang",
    strapline: "The two valleys, twelve days, permits handled",
    states: ["arunachal-pradesh", "assam"],
    region: "arunachal",
    types: ["solo", "group"],
    fromPrice: 142000,
    groupSizeMax: 8,
    difficulty: "challenging",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: true,
    singleSupplement: 0,
    intro:
      "Arunachal is difficult to do alone — permits, distances, and almost no public transport. This route removes all of that: a group of eight, a single room throughout, and both the Apatani plateau and Tawang in one trip.",
    highlights: [
      "Ziro's paddy-cum-fish valley",
      "Sela Pass and Tawang monastery",
      "All Inner Line Permits arranged before you arrive",
    ],
    heroAlt:
      "The road climbing towards Sela Pass through snow banks in western Arunachal Pradesh",
    extraIncludes: [
      "A single room throughout at no supplement",
      "All Inner Line Permits for Indian nationals",
    ],
    itinerary: [
      "guwahatiArrive",
      "ziroTransfer",
      "ziroValley",
      "restDay",
      "bhalukpongTransfer",
      "dirang",
      "tawangSela",
      "tawangMonastery",
      "restDay",
      "dirang",
      "bhalukpongTransfer",
      "guwahatiDepart",
    ],
    departureDates: ["2026-09-26", "2026-10-17", "2027-03-27", "2027-04-24"],
  },

  /* ---- Group and family ------------------------------------------------ */
  {
    slug: "group-wildlife-kaziranga-manas",
    title: "Two parks: Kaziranga and Manas",
    strapline: "Rhino, tiger and golden langur in nine days",
    states: ["assam"],
    region: "assam",
    types: ["group", "couple", "solo"],
    fromPrice: 92000,
    groupSizeMax: 12,
    difficulty: "easy",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: false,
    intro:
      "A wildlife route rather than a cultural one. Five safaris across two very different parks — Kaziranga's grassland and Manas's riverine forest against the Bhutan foothills — with a naturalist rather than a general guide.",
    highlights: [
      "Five game drives across two parks",
      "A resident naturalist throughout",
      "Golden langur at Manas",
      "Gangetic dolphin on the Brahmaputra",
    ],
    heroAlt:
      "A herd of wild water buffalo in the wetlands of Kaziranga National Park, Assam",
    extraIncludes: ["A specialist naturalist guide for the whole trip"],
    itinerary: [
      "guwahatiArrive",
      "kazirangaTransfer",
      "kazirangaSafari",
      "kazirangaEastern",
      "restDay",
      "manasPark",
      "restDay",
      "manasPark",
      "guwahatiDepart",
    ],
    departureDates: ["2026-11-21", "2026-12-19", "2027-01-23", "2027-02-20"],
  },
  {
    slug: "group-festival-season-nagaland-assam",
    title: "Festival season: Nagaland and Assam",
    strapline: "Hornbill, then the river, in one December",
    states: ["nagaland", "assam"],
    region: "nagaland",
    types: ["group", "couple", "solo"],
    fromPrice: 134000,
    groupSizeMax: 14,
    difficulty: "moderate",
    startsAt: "Guwahati",
    endsAt: "Dimapur",
    requiresILP: true,
    intro:
      "December is the region's best month and the Hornbill Festival is its centrepiece. This route puts two days at Kisama inside a wider Assam and Nagaland trip, so the festival is the peak rather than the whole thing.",
    highlights: [
      "Two days at the Hornbill Festival",
      "Kaziranga in peak season",
      "Khonoma and the Kohima war cemetery",
      "Majuli's satras",
    ],
    heroAlt:
      "Log drum ceremony at a tribal morung during the Hornbill Festival at Kisama, Nagaland",
    itinerary: [
      "guwahatiArrive",
      "kazirangaTransfer",
      "kazirangaSafari",
      "majuliFerry",
      "majuliSatras",
      "kohimaTransfer",
      "hornbillFestival",
      "hornbillFestival",
      "khonoma",
      "departDimapur",
    ],
    departureDates: ["2026-11-30", "2026-12-02"],
  },
  {
    slug: "group-photography-northeast",
    title: "A photography expedition",
    strapline: "Twelve days scheduled around light, not opening hours",
    states: ["assam", "meghalaya", "nagaland"],
    region: "neutral",
    types: ["group", "solo"],
    fromPrice: 156000,
    groupSizeMax: 8,
    difficulty: "challenging",
    startsAt: "Guwahati",
    endsAt: "Dimapur",
    requiresILP: true,
    intro:
      "Built for photographers. Every day is scheduled around first and last light rather than a hotel breakfast, groups are capped at eight so nobody is shooting over a shoulder, and the guide is a working photographer from the region.",
    highlights: [
      "Pre-dawn positioning every morning",
      "Group capped at eight",
      "A working Northeast photographer leading",
      "Permissions arranged in advance for village portraits",
    ],
    heroAlt:
      "Mist lifting off the Brahmaputra at first light near Majuli island, Assam",
    extraIncludes: [
      "A working photographer as your guide",
      "Pre-arranged permissions for village and portrait work",
      "Vehicle available for pre-dawn and post-sunset movements",
    ],
    itinerary: [
      "guwahatiArrive",
      "kazirangaTransfer",
      "kazirangaSafari",
      "kazirangaEastern",
      "majuliFerry",
      "majuliSatras",
      "shillongTransfer",
      "cherrapunji",
      "nongriat",
      "kohimaTransfer",
      "khonoma",
      "departDimapur",
    ],
    departureDates: ["2026-10-24", "2026-11-21", "2027-02-20"],
  },
  {
    slug: "group-textile-trail",
    title: "The textile trail",
    strapline: "Muga, eri, puanchei and the Naga shawl, at the loom",
    states: ["assam", "nagaland", "mizoram"],
    region: "neutral",
    types: ["group", "couple", "solo"],
    fromPrice: 128000,
    groupSizeMax: 10,
    difficulty: "moderate",
    startsAt: "Guwahati",
    endsAt: "Aizawl",
    requiresILP: true,
    intro:
      "Northeast India has the densest concentration of living handloom traditions anywhere in the country, and almost none of it reaches a shop. This route goes to the looms: Sualkuchi's muga silk, Naga shawls in Angami villages, and the Mizo puanchei.",
    highlights: [
      "Muga and eri silk at Sualkuchi",
      "Naga shawl weaving in Khonoma, with the clan meanings explained",
      "Puanchei weaving in Mizoram",
      "Direct purchase from weavers, at the weaver's price",
    ],
    heroAlt:
      "A weaver at a throw-shuttle loom working golden muga silk at Sualkuchi, Assam",
    extraIncludes: [
      "Workshop sessions at three separate weaving traditions",
      "A textile historian accompanying the group",
    ],
    itinerary: [
      "guwahatiArrive",
      "majuliFerry",
      "majuliSatras",
      "kohimaTransfer",
      "khonoma",
      "restDay",
      "aizawlArrive",
      "reiek",
      "departAizawl",
    ],
    departureDates: ["2026-11-07", "2027-01-16", "2027-02-13"],
  },
  {
    slug: "group-birding-eaglenest-manas",
    title: "Birding: Manas and the Eaglenest foothills",
    strapline: "Six hundred species, and a Bugun liocichla if you are lucky",
    states: ["assam", "arunachal-pradesh"],
    region: "arunachal",
    types: ["group", "solo"],
    fromPrice: 138000,
    groupSizeMax: 8,
    difficulty: "challenging",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: true,
    intro:
      "The Eastern Himalaya foothills are one of the richest bird regions on earth, and the Bugun liocichla — described in 2006, fewer than twenty known birds — lives in exactly one place. Ten days of very early mornings.",
    highlights: [
      "Manas's grassland and riverine species",
      "The Eaglenest elevation gradient from 500 to 3,250 metres",
      "A dedicated bird guide and spotting scope",
      "Bugun liocichla habitat, with no promises",
    ],
    heroAlt:
      "Dawn mist in the broadleaf forest of the Eaglenest foothills, western Arunachal Pradesh",
    extraIncludes: [
      "A specialist bird guide and a shared spotting scope",
      "Camp accommodation at Lama Camp and Bompu",
    ],
    itinerary: [
      "guwahatiArrive",
      "manasPark",
      "restDay",
      "bhalukpongTransfer",
      "dirang",
      "restDay",
      "bhalukpongTransfer",
      "guwahatiDepart",
    ],
    departureDates: ["2026-11-14", "2027-03-13", "2027-04-10"],
  },
  {
    slug: "group-food-trail-northeast",
    title: "The Northeast food trail",
    strapline: "Bamboo shoot, akhuni, smoked pork and eight kinds of chilli",
    states: ["assam", "nagaland", "meghalaya"],
    region: "assam",
    types: ["group", "couple", "solo"],
    fromPrice: 112000,
    groupSizeMax: 10,
    difficulty: "easy",
    startsAt: "Guwahati",
    endsAt: "Dimapur",
    requiresILP: true,
    intro:
      "Northeast Indian food has almost nothing to do with what the rest of the country eats: fermentation instead of spice paste, smoke instead of oil, and the bhut jolokia used with more restraint than its reputation suggests.",
    highlights: [
      "Assamese thali cooked in a home kitchen",
      "Akhuni and smoked pork in a Naga village",
      "Khasi jadoh and dohneiiong at Shillong's Bara Bazaar",
      "Rice beer, brewed and explained",
    ],
    heroAlt:
      "Smoked pork, bamboo shoot and fermented soybean laid out for a Naga meal in a village kitchen, Nagaland",
    extraIncludes: [
      "Four hands-on cooking sessions in home kitchens",
      "All meals throughout, which is rather the point",
    ],
    itinerary: [
      "guwahatiArrive",
      "shillongTransfer",
      "cherrapunji",
      "kazirangaTransfer",
      "kazirangaSafari",
      "kohimaTransfer",
      "khonoma",
      "departDimapur",
    ],
    departureDates: ["2026-11-07", "2026-12-05", "2027-02-06", "2027-03-06"],
  },
  {
    slug: "group-monastery-circuit",
    title: "The monastery circuit",
    strapline: "Tawang, Rumtek and Pemayangtse in fourteen days",
    states: ["sikkim", "arunachal-pradesh", "assam"],
    region: "sikkim",
    types: ["group", "couple", "solo"],
    fromPrice: 172000,
    groupSizeMax: 10,
    difficulty: "challenging",
    startsAt: "Bagdogra",
    endsAt: "Guwahati",
    requiresILP: true,
    intro:
      "The three most significant Buddhist institutions in the Indian eastern Himalaya, and the roads between them. Timed where possible to coincide with a monastic dance festival — tell us at booking and we will place you accordingly.",
    highlights: [
      "Tawang, the largest monastery in India",
      "Rumtek, seat of the Karma Kagyu lineage in exile",
      "Pemayangtse and the Rabdentse ruins",
      "Morning prayers attended rather than watched",
    ],
    heroAlt:
      "Monks in the assembly hall at Rumtek monastery during morning prayers, east Sikkim",
    itinerary: [
      "gangtokTransfer",
      "gangtokMonasteries",
      "pellingKanchenjunga",
      "yuksomTrek",
      "restDay",
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
    departureDates: ["2026-10-03", "2027-03-20", "2027-04-17"],
  },
  {
    slug: "group-tea-estate-week",
    title: "A week in the tea gardens",
    strapline: "Upper Assam, from plucking to the tasting table",
    states: ["assam"],
    region: "assam",
    types: ["couple", "group", "solo"],
    fromPrice: 86000,
    groupSizeMax: 10,
    difficulty: "easy",
    startsAt: "Jorhat",
    endsAt: "Jorhat",
    requiresILP: false,
    intro:
      "Assam produces more tea than any other single region on earth and almost none of the people drinking it have seen a garden. A week inside two working estates: the plucking rounds, the withering troughs, the CTC line, and the tasting room at seven in the morning.",
    highlights: [
      "Two working estates, staying in planter's bungalows on both",
      "A full factory cycle from leaf to grade",
      "Professional tasting with the estate's own taster",
      "Sivasagar's Ahom monuments on the rest day",
    ],
    heroAlt:
      "Tea pluckers working a section of a mature garden in upper Assam with baskets on their backs",
    extraIncludes: [
      "Two nights in each of two planter's bungalows",
      "A professional tasting session with the estate taster",
    ],
    itinerary: [
      "guwahatiArrive",
      "jorhatTea",
      "sivasagar",
      "restDay",
      "majuliFerry",
      "majuliSatras",
      "guwahatiDepart",
    ],
    departureDates: ["2026-11-14", "2026-12-12", "2027-02-13", "2027-03-13"],
  },
  {
    slug: "couple-loktak-and-the-hills",
    title: "Loktak and the hills, for two",
    strapline: "Manipur privately, with the lake to yourselves at dawn",
    states: ["manipur"],
    region: "manipur",
    types: ["couple", "honeymoon"],
    fromPrice: 76000,
    groupSizeMax: 2,
    difficulty: "easy",
    startsAt: "Imphal",
    endsAt: "Imphal",
    requiresILP: true,
    singleSupplement: 0,
    intro:
      "Manipur run privately for two, with a night on the lake itself at a phumdi homestay and a boat out before anyone else is awake. Six days, no group, no fixed schedule after the first morning.",
    highlights: [
      "A night in a phumdi hut on Loktak",
      "The lake at dawn with a single boatman",
      "Ima Keithel with a Meitei guide",
      "A private Ras Leela performance",
    ],
    heroAlt:
      "A fisherman's hut built on a floating phumdi on Loktak Lake at first light, Manipur",
    extraIncludes: [
      "One night in a phumdi homestay on the lake",
      "A private Manipuri dance performance",
    ],
    itinerary: [
      "imphalArrive",
      "loktakLake",
      "restDay",
      "andro",
      "restDay",
      "departImphal",
    ],
    departureDates: ["2026-11-14", "2026-12-12", "2027-01-16", "2027-02-13"],
  },
  {
    slug: "couple-tripura-quiet-kingdom",
    title: "The quiet kingdom",
    strapline: "Tripura for two, in five unhurried days",
    states: ["tripura"],
    region: "tripura",
    types: ["couple", "honeymoon", "solo"],
    fromPrice: 58000,
    groupSizeMax: 4,
    difficulty: "easy",
    startsAt: "Agartala",
    endsAt: "Agartala",
    requiresILP: false,
    singleSupplement: 0,
    intro:
      "Nobody goes to Tripura, which is the entire argument for going. Five days, a private car, Unakoti with no other visitors on a weekday morning, and a night at Neermahal watching the lake go dark.",
    highlights: [
      "Unakoti early on a weekday, effectively alone",
      "A lakeside night at Rudrasagar",
      "The Jampui hills orange season in November",
    ],
    heroAlt:
      "Neermahal water palace standing in the middle of Rudrasagar lake at dusk, Tripura",
    extraIncludes: ["Private vehicle and dedicated guide"],
    itinerary: [
      "agartalaArrive",
      "unakoti",
      "restDay",
      "neermahal",
      "departAgartala",
    ],
    departureDates: ["2026-11-21", "2026-12-19", "2027-01-23", "2027-02-20"],
  },
  {
    slug: "couple-shillong-and-the-sacred-grove",
    title: "Shillong and the sacred grove",
    strapline: "Five days, one forest that has never been cut",
    states: ["meghalaya"],
    region: "meghalaya",
    types: ["couple", "solo"],
    fromPrice: 54000,
    groupSizeMax: 6,
    difficulty: "easy",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: false,
    intro:
      "A short, gentle Meghalaya without the Nongriat descent. Mawphlang's sacred grove — where Khasi custom forbids removing so much as a leaf — Laitlum canyon, and two nights in a Shillong heritage property.",
    highlights: [
      "Mawphlang sacred grove with a Khasi guide",
      "Laitlum canyon in the late afternoon",
      "David Scott's trail, or the first hour of it",
    ],
    heroAlt:
      "Ancient moss-covered trees inside the Mawphlang sacred grove in the Khasi hills, Meghalaya",
    itinerary: [
      "shillongTransfer",
      "mawphlang",
      "restDay",
      "cherrapunji",
      "guwahatiDepart",
    ],
    departureDates: ["2026-10-17", "2026-11-14", "2027-02-13", "2027-03-13"],
  },
  {
    slug: "group-monsoon-meghalaya",
    title: "Monsoon Meghalaya",
    strapline: "The wettest place on earth, visited on purpose",
    states: ["meghalaya"],
    region: "meghalaya",
    types: ["group", "solo", "couple"],
    fromPrice: 49000,
    groupSizeMax: 8,
    difficulty: "challenging",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: false,
    intro:
      "Everyone tells you not to come in monsoon. They are wrong, if you know what you are signing up for: every waterfall at full volume, cloud moving through the villages, and a fraction of the visitors. You will be wet the entire time.",
    highlights: [
      "Nohkalikai and Seven Sisters at maximum flow",
      "Cloud inversions off the Sohra plateau",
      "Almost no other travellers",
      "Proper wet-weather kit provided",
    ],
    heroAlt:
      "Nohkalikai falls at full monsoon volume dropping 340 metres into the gorge at Sohra, Meghalaya",
    extraIncludes: [
      "Wet-weather kit and dry bags provided",
      "A flexible itinerary with two contingency days",
    ],
    extraExcludes: ["Any guarantee that a specific viewpoint will be visible"],
    itinerary: [
      "shillongTransfer",
      "cherrapunji",
      "restDay",
      "mawphlang",
      "guwahatiDepart",
    ],
    departureDates: ["2027-06-12", "2027-07-10", "2027-08-07"],
  },
  {
    slug: "group-northeast-in-a-week",
    title: "The Northeast in a week",
    strapline: "Two states, seven days, for people who cannot take two weeks",
    states: ["assam", "meghalaya"],
    region: "assam",
    types: ALL,
    fromPrice: 68500,
    groupSizeMax: 14,
    difficulty: "moderate",
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    requiresILP: false,
    intro:
      "The most-asked-for itinerary we run: Kaziranga and Meghalaya's headline sights inside seven days, with a single airport at both ends and no internal flights. Tight but not punishing.",
    highlights: [
      "Two safaris at Kaziranga",
      "Nohkalikai and the Sohra plateau",
      "The Umngot at Dawki",
    ],
    heroAlt:
      "The road climbing from the Assam plains into the Khasi hills above Umiam lake, Meghalaya",
    itinerary: [
      "guwahatiArrive",
      "kazirangaTransfer",
      "kazirangaSafari",
      "shillongTransfer",
      "cherrapunji",
      "dawkiMawlynnong",
      "guwahatiDepart",
    ],
    departureDates: [
      "2026-10-10",
      "2026-11-07",
      "2026-12-05",
      "2027-01-09",
      "2027-02-06",
      "2027-03-06",
    ],
  },
  {
    slug: "group-sikkim-and-darjeeling-hills",
    title: "Sikkim and the eastern Himalaya",
    strapline: "Ten days from the Teesta to Gurudongmar",
    states: ["sikkim"],
    region: "sikkim",
    types: ALL,
    fromPrice: 112000,
    groupSizeMax: 12,
    difficulty: "challenging",
    startsAt: "Bagdogra",
    endsAt: "Bagdogra",
    requiresILP: true,
    intro:
      "All of Sikkim in ten days: east, west and north, with acclimatisation handled properly rather than driving straight from the plains to 5,430 metres and hoping.",
    highlights: [
      "Gurudongmar and Yumthang",
      "Kanchenjunga from Pelling",
      "Nathu La and Tsomgo",
      "A built-in acclimatisation day before going north",
    ],
    heroAlt:
      "The Teesta river running through its gorge on the road from Bagdogra into Sikkim",
    itinerary: [
      "gangtokTransfer",
      "gangtokMonasteries",
      "tsomgoNathula",
      "restDay",
      "gurudongmar",
      "lachungYumthang",
      "pellingKanchenjunga",
      "yuksomTrek",
      "restDay",
      "departBagdogra",
    ],
    departureDates: [
      "2026-09-26",
      "2026-10-17",
      "2027-03-20",
      "2027-04-17",
      "2027-05-15",
    ],
  },
  {
    slug: "group-arunachal-eastern-circuit",
    title: "Eastern Arunachal circuit",
    strapline: "Ziro, Mechuka and the roads nobody drives",
    states: ["arunachal-pradesh"],
    region: "arunachal",
    types: ["group", "solo"],
    fromPrice: 164000,
    groupSizeMax: 8,
    difficulty: "challenging",
    startsAt: "Dibrugarh",
    endsAt: "Guwahati",
    requiresILP: true,
    intro:
      "Two of Arunachal's least-visited valleys in one fourteen-day route. Long driving days, basic accommodation in places, and scenery that has essentially no photographic record outside the state.",
    highlights: [
      "Mechuka and the Siyom valley",
      "Ziro's Apatani plateau",
      "Memba and Ramo villages",
      "Two contingency days for weather and road closures",
    ],
    heroAlt:
      "An unsurfaced mountain road cut into a forested slope above the Siyom river, western Arunachal Pradesh",
    extraExcludes: [
      "Any guarantee of reaching Mechuka if the road is closed by landslide",
    ],
    itinerary: [
      "guwahatiArrive",
      "ziroTransfer",
      "ziroValley",
      "restDay",
      "mechukaValley",
      "restDay",
      "mechukaValley",
      "restDay",
      "ziroTransfer",
      "guwahatiDepart",
    ],
    departureDates: ["2026-10-10", "2027-03-13", "2027-04-10"],
  },
  {
    slug: "group-brahmaputra-cruise-and-park",
    title: "Down the Brahmaputra",
    strapline: "Eight days on the river, with Kaziranga from the water",
    states: ["assam"],
    region: "assam",
    types: ["couple", "group", "honeymoon"],
    fromPrice: 148000,
    groupSizeMax: 12,
    difficulty: "easy",
    startsAt: "Jorhat",
    endsAt: "Guwahati",
    requiresILP: false,
    featured: true,
    intro:
      "The Brahmaputra is the only practical way to see how Assam is actually organised. Eight days downstream from Jorhat with the boat as your hotel, stopping at Majuli, the Kaziranga river frontage, and villages that have no road access at all.",
    highlights: [
      "Eight nights aboard, unpacking once",
      "Kaziranga approached from the river rather than the highway",
      "Villages reachable only by boat",
      "Gangetic dolphin from the deck",
    ],
    heroAlt:
      "A river vessel moored against a sandbar on the Brahmaputra at sunset in central Assam",
    extraIncludes: [
      "All meals aboard",
      "A resident naturalist and an on-board lecture programme",
    ],
    itinerary: [
      "jorhatTea",
      "majuliFerry",
      "majuliSatras",
      "kazirangaEastern",
      "kazirangaSafari",
      "restDay",
      "manasPark",
      "guwahatiDepart",
    ],
    departureDates: ["2026-11-08", "2026-12-06", "2027-01-10", "2027-02-07"],
  },
];

const tours: Tour[] = seeds.map(makeTour);
const bySlug = new Map(tours.map((t) => [t.slug, t]));

export function getTours(): Tour[] {
  return tours;
}

export function getTourBySlug(slug: string): Tour | undefined {
  return bySlug.get(slug);
}

export function getFeaturedTours(limit = 6): Tour[] {
  return tours.filter((t) => t.featured).slice(0, limit);
}

/**
 * The lean shape a card needs.
 *
 * Index pages hand their data to a client component, which means everything
 * passed is serialised into the RSC payload and shipped to the browser.
 * Passing whole `Tour` objects sent all 47 itineraries — day-by-day text,
 * highlights, inclusions — to a page that renders none of it: 280kB of
 * payload, and enough main-thread work to push LCP past three seconds.
 *
 * Anything crossing into a client component uses this instead. If a card
 * starts needing a new field, add it here rather than passing the whole tour.
 */
export type TourSummary = Pick<
  Tour,
  | "slug"
  | "title"
  | "strapline"
  | "states"
  | "region"
  | "types"
  | "nights"
  | "fromPrice"
  | "difficulty"
  | "requiresILP"
  | "heroAlt"
  | "image"
  | "featured"
> & {
  /** The next departure with seats, or null if the season is sold out. */
  nextDeparture: { date: string; status: Departure["status"] } | null;
};

export function toTourSummary(tour: Tour): TourSummary {
  const next = tour.departures.find((d) => d.status !== "sold-out");
  return {
    slug: tour.slug,
    title: tour.title,
    strapline: tour.strapline,
    states: tour.states,
    region: tour.region,
    types: tour.types,
    nights: tour.nights,
    fromPrice: tour.fromPrice,
    difficulty: tour.difficulty,
    requiresILP: tour.requiresILP,
    heroAlt: tour.heroAlt,
    image: tour.image,
    featured: tour.featured,
    nextDeparture: next ? { date: next.date, status: next.status } : null,
  };
}

export function getTourSummaries(): TourSummary[] {
  return tours.map(toTourSummary);
}

export function getToursByType(type: TourType): Tour[] {
  return tours.filter((t) => t.types.includes(type));
}

export function getToursByState(state: string): Tour[] {
  return tours.filter((t) =>
    t.states.includes(state as Tour["states"][number]),
  );
}

/** Related tours for a detail page: shares a state, is not the same tour. */
export function getRelatedTours(slug: string, limit = 3): Tour[] {
  const tour = bySlug.get(slug);
  if (!tour) return [];
  return tours
    .filter(
      (t) => t.slug !== slug && t.states.some((s) => tour.states.includes(s)),
    )
    .slice(0, limit);
}

/** The lowest headline price in the catalogue, for "from" copy. */
export function getLowestTourPrice(): number {
  return Math.min(...tours.map((t) => t.fromPrice));
}
