import type { NEEvent, StateSlug } from "./types";

/**
 * Northeast-specific events and ticketing.
 *
 * Dates are real annual fixtures where the festival has a settled slot;
 * where a festival's dates move each year they are our best current estimate
 * and are flagged as such in the copy.
 */

const events: NEEvent[] = [
  {
    slug: "hornbill-festival-2026",
    name: "Hornbill Festival",
    strapline: "All sixteen Naga tribes, ten days, one heritage village",
    state: "nagaland",
    region: "nagaland",
    venue: "Naga Heritage Village, Kisama",
    locality: "Kisama, 12km from Kohima",
    startDate: "2026-12-01",
    endDate: "2026-12-10",
    category: "festival",
    fromPrice: 1200,
    featured: true,
    intro:
      "The festival of festivals. Every recognised Naga tribe builds and staffs its own morung at Kisama for ten days: log drum ceremonies, wrestling, chilli-eating, and the largest assembled display of Naga textile there is.",
    body: [
      "The programme is strongest between the third and seventh days, once the opening formalities are done and before the closing sets in. Mornings are ceremonial, afternoons are competitive, and the night market in Kohima is where the actual festival happens.",
      "Accommodation in Kohima is effectively fully booked a year ahead. If you are considering this, book the room before the ticket — we can do both.",
      "An Inner Line Permit is required for Nagaland. We process it as part of your booking at no extra charge.",
    ],
    lineup: [
      "Morung ceremonies from all sixteen tribes",
      "Traditional log drum pulling",
      "Naga wrestling championship",
      "Hornbill International Rock Contest",
      "Night market at Kohima",
    ],
    tickets: [
      {
        name: "Day pass",
        price: 1200,
        description: "Entry to Kisama for one day of the festival.",
        remaining: null,
        perks: ["Single-day entry", "Access to all morungs"],
      },
      {
        name: "Three-day pass",
        price: 3200,
        description:
          "Entry across the three strongest days of the programme, days three to five.",
        remaining: 420,
        perks: [
          "Three consecutive days",
          "Reserved seating at the main arena",
          "Festival programme",
        ],
      },
      {
        name: "Full festival pass with transfers",
        price: 11500,
        description:
          "All ten days, plus daily return transfers from Kohima, which is the part that actually causes trouble.",
        remaining: 85,
        perks: [
          "All ten days",
          "Daily return transfer from Kohima",
          "Reserved seating",
          "Guided morung introduction on day one",
        ],
      },
    ],
    heroAlt:
      "Naga dancers in ceremonial shawls and headdresses performing at the Hornbill Festival, Kisama, Nagaland",
  },
  {
    slug: "ziro-festival-of-music-2027",
    name: "Ziro Festival of Music",
    strapline:
      "Four days of independent music in a paddy field at 1,688 metres",
    state: "arunachal-pradesh",
    region: "arunachal",
    venue: "Ziro valley festival grounds",
    locality: "Ziro, Lower Subansiri",
    startDate: "2027-09-23",
    endDate: "2027-09-26",
    category: "music",
    fromPrice: 6500,
    featured: true,
    intro:
      "India's best-run independent music festival, held on bamboo stages in the middle of the Apatani valley. Four days, two stages, and a camping ground in a paddy field.",
    body: [
      "Ziro works because of where it is rather than who is playing — the valley is a UNESCO tentative-list cultural landscape and the stages are built from local bamboo each year and taken down afterwards.",
      "It rains. It always rains. Bring boots you do not mind writing off, and a tent that has actually been tested.",
      "Dates are confirmed roughly six months ahead and occasionally shift by a week. An Inner Line Permit is required for Arunachal Pradesh and is included in every ticket tier below.",
    ],
    lineup: [
      "Two stages across four days",
      "A strong Northeast independent line-up",
      "Late-night sets at the bamboo stage",
    ],
    tickets: [
      {
        name: "Festival pass",
        price: 6500,
        description:
          "Entry for all four days. Camping and travel not included.",
        remaining: 1100,
        perks: ["Four-day entry", "Inner Line Permit processing"],
      },
      {
        name: "Pass with camping",
        price: 11000,
        description:
          "Four-day entry plus a pitched two-person tent on the festival ground, which saves you carrying one over a mountain.",
        remaining: 340,
        perks: [
          "Four-day entry",
          "Pre-pitched two-person tent",
          "Sleeping mats",
          "Inner Line Permit processing",
        ],
      },
      {
        name: "Pass with homestay",
        price: 24500,
        description:
          "Four-day entry with four nights in an Apatani homestay in Hong village and daily transfers.",
        remaining: 40,
        perks: [
          "Four-day entry",
          "Four nights in an Apatani home, all meals",
          "Daily return transfers",
          "Inner Line Permit processing",
        ],
      },
    ],
    heroAlt:
      "A bamboo stage set in a paddy field at the Ziro Festival of Music, Arunachal Pradesh, with pine ridges behind",
  },
  {
    slug: "bihu-guwahati-2027",
    name: "Rongali Bihu",
    strapline: "Assam's spring new year, and a week of husori in the streets",
    state: "assam",
    region: "assam",
    venue: "Across Guwahati and the Brahmaputra valley",
    locality: "Guwahati and upper Assam",
    startDate: "2027-04-14",
    endDate: "2027-04-20",
    category: "culture",
    fromPrice: 0,
    featured: true,
    intro:
      "Rongali Bihu marks the Assamese new year and the start of the sowing season. For a week the whole valley stops working: husori troupes move house to house, the dhol does not let up, and everybody eats pitha.",
    body: [
      "This is not a ticketed festival — it happens in courtyards, on streets and in community grounds across the valley, and the good version is the one you are invited into rather than the one on a stage.",
      "Our Bihu package places you with a family in a village outside Jorhat for the first three days, then at the large public bihutolis in Guwahati for the competitive dancing.",
    ],
    tickets: [
      {
        name: "Public celebrations",
        price: 0,
        description:
          "Free. Bihu happens in the open and nobody charges for it. Go and watch.",
        remaining: null,
        perks: ["Open to all"],
      },
      {
        name: "Village Bihu experience",
        price: 18500,
        description:
          "Three nights with a family in a village outside Jorhat, including the husori rounds, pitha making, and a bihutoli evening.",
        remaining: 24,
        perks: [
          "Three nights full board with a host family",
          "Husori rounds with the village troupe",
          "Pitha and larus made in the kitchen",
          "Transfers from Jorhat",
        ],
      },
    ],
    heroAlt:
      "Bihu dancers in muga silk mekhela chador performing with dhol players at a bihutoli ground in Assam",
  },
  {
    slug: "wangala-festival-2026",
    name: "Wangala",
    strapline: "The hundred-drums harvest festival of the Garo hills",
    state: "meghalaya",
    region: "meghalaya",
    venue: "Asanang, near Tura",
    locality: "West Garo Hills",
    startDate: "2026-11-12",
    endDate: "2026-11-14",
    category: "festival",
    fromPrice: 900,
    intro:
      "The Garo harvest festival, thanking Misi Saljong for the crop. The hundred-drums version at Asanang is the big one: rows of drummers in feathered headdresses, moving in formation for hours.",
    body: [
      "Wangala is much less visited than Hornbill and considerably less packaged, which is either the point or the problem depending on what you want. The Garo hills are a five-hour drive from Guwahati and there is limited accommodation at Tura.",
      "No permit is required for Meghalaya.",
    ],
    lineup: [
      "Hundred-drums formation dancing",
      "Garo wrestling",
      "Traditional bamboo instrument performances",
    ],
    tickets: [
      {
        name: "Day entry",
        price: 900,
        description: "Entry to the Asanang grounds for one day.",
        remaining: null,
        perks: ["Single-day entry"],
      },
      {
        name: "Two-day pass with transfers",
        price: 5400,
        description:
          "Both main days plus return transfers from Tura, where you will be staying.",
        remaining: 120,
        perks: ["Two-day entry", "Return transfers from Tura", "Seating"],
      },
    ],
    heroAlt:
      "Garo drummers in feathered headdresses performing in formation at the Wangala festival, Meghalaya",
  },
  {
    slug: "sangai-festival-2026",
    name: "Manipur Sangai Festival",
    strapline: "Ten days of Manipuri dance, martial arts and Loktak",
    state: "manipur",
    region: "manipur",
    venue: "Hapta Kangjeibung and multiple venues",
    locality: "Imphal",
    startDate: "2026-11-21",
    endDate: "2026-11-30",
    category: "festival",
    fromPrice: 800,
    intro:
      "Named after the brow-antlered sangai deer that survives only on Loktak's floating park. Ten days of Manipuri classical dance, thang-ta martial arts, indigenous sport and a very good food section.",
    body: [
      "The festival spreads across several venues in and around Imphal rather than sitting on one ground, and the Loktak component takes place at the lake itself.",
      "An Inner Line Permit is required for Manipur, included in every tier. Check current advisories before travelling; we monitor them and will advise honestly.",
    ],
    lineup: [
      "Manipuri Ras Leela",
      "Thang-ta martial arts demonstrations",
      "Indigenous sports including yubi lakpi",
      "Loktak boat races",
    ],
    tickets: [
      {
        name: "Day entry",
        price: 800,
        description: "Entry to the main Hapta Kangjeibung venue for one day.",
        remaining: null,
        perks: ["Single-day entry", "Inner Line Permit processing"],
      },
      {
        name: "Five-day pass",
        price: 3400,
        description: "Five days across all festival venues.",
        remaining: 260,
        perks: [
          "Five-day multi-venue entry",
          "Reserved seating for evening performances",
          "Inner Line Permit processing",
        ],
      },
    ],
    heroAlt:
      "Manipuri Ras Leela dancers in traditional kumin costume performing at the Sangai Festival, Imphal",
  },
  {
    slug: "chapchar-kut-2027",
    name: "Chapchar Kut",
    strapline: "Mizoram's spring festival, and the bamboo dance done properly",
    state: "mizoram",
    region: "mizoram",
    venue: "Assam Rifles Ground",
    locality: "Aizawl",
    startDate: "2027-03-05",
    endDate: "2027-03-06",
    category: "festival",
    fromPrice: 0,
    intro:
      "The oldest Mizo festival, marking the end of the jhum clearing. Cheraw — the bamboo dance, where dancers step between clashing bamboo poles — is performed en masse, in puanchei, and it is genuinely impressive.",
    body: [
      "Chapchar Kut is free and open. The mass cheraw at the Assam Rifles ground in Aizawl involves hundreds of dancers and pole-holders in coordination.",
      "An Inner Line Permit is required for Mizoram; we process it free with any booking.",
    ],
    lineup: [
      "Mass cheraw bamboo dance",
      "Chai and khuallam performances",
      "Mizo craft and food stalls",
    ],
    tickets: [
      {
        name: "Free entry",
        price: 0,
        description: "Chapchar Kut is free to attend. Arrive early for a view.",
        remaining: null,
        perks: ["Open to all", "Inner Line Permit processing on request"],
      },
      {
        name: "Reserved seating with guide",
        price: 2800,
        description:
          "Reserved seats for the mass cheraw plus a Mizo guide to explain what you are looking at.",
        remaining: 90,
        perks: [
          "Reserved seating",
          "Mizo guide for both days",
          "Inner Line Permit processing",
        ],
      },
    ],
    heroAlt:
      "Mizo dancers in puanchei performing the cheraw bamboo dance at Chapchar Kut, Aizawl, Mizoram",
  },
  {
    slug: "losar-tawang-2027",
    name: "Losar at Tawang",
    strapline: "Monpa new year at 3,048 metres",
    state: "arunachal-pradesh",
    region: "arunachal",
    venue: "Tawang Monastery and town",
    locality: "Tawang",
    startDate: "2027-02-07",
    endDate: "2027-02-09",
    category: "culture",
    fromPrice: 0,
    intro:
      "Tibetan new year, observed by the Monpa across Tawang and Dirang. Butter lamps, cham dancing at the monastery, and households opening their doors to anyone passing.",
    body: [
      "Losar in February means Sela Pass in deep winter, which is a serious undertaking and occasionally impossible. We run it as a guided departure only, never as a self-drive.",
      "An Inner Line Permit is required for Arunachal Pradesh.",
    ],
    lineup: [
      "Cham masked dancing at Tawang monastery",
      "Butter lamp offerings",
    ],
    tickets: [
      {
        name: "Free to attend",
        price: 0,
        description:
          "Losar is a religious observance, not a ticketed event. Attend respectfully.",
        remaining: null,
        perks: ["Open to all"],
      },
      {
        name: "Guided Losar departure",
        price: 96000,
        description:
          "A seven-day guided winter departure from Guwahati timed to Losar, with all permits and winter-rated vehicles.",
        remaining: 8,
        perks: [
          "Seven days guided, all accommodation",
          "Winter-rated vehicle and chains",
          "Monastery access arranged",
          "All permits",
        ],
      },
    ],
    heroAlt:
      "Monks performing cham masked dance in the courtyard of Tawang monastery during Losar, Arunachal Pradesh",
  },
  {
    slug: "kharchi-puja-2027",
    name: "Kharchi Puja",
    strapline: "Fourteen deities, seven days, and Tripura's largest gathering",
    state: "tripura",
    region: "tripura",
    venue: "Chaturdasha Devata temple, Old Agartala",
    locality: "Agartala",
    startDate: "2027-07-12",
    endDate: "2027-07-18",
    category: "festival",
    fromPrice: 0,
    intro:
      "The worship of the fourteen deities of the Tripuri royal house, held over seven days at Old Agartala and drawing the largest crowds the state sees all year.",
    body: [
      "Kharchi is a Hindu-Tripuri syncretic festival with roots considerably older than the temple that hosts it. The bathing of the fourteen deity heads in the Saidra river opens the week.",
      "No permit is required for Tripura. July is hot and wet; plan accordingly.",
    ],
    tickets: [
      {
        name: "Free entry",
        price: 0,
        description:
          "Kharchi Puja is a public religious festival, free to all.",
        remaining: null,
        perks: ["Open to all"],
      },
      {
        name: "Guided evening with a historian",
        price: 2400,
        description:
          "A two-hour guided evening explaining the syncretic history and the fourteen deities.",
        remaining: 60,
        perks: ["Two-hour guided walk", "Small group, capped at twelve"],
      },
    ],
    heroAlt:
      "Crowds at the Chaturdasha Devata temple during Kharchi Puja at Old Agartala, Tripura",
  },
  {
    slug: "saga-dawa-sikkim-2027",
    name: "Saga Dawa",
    strapline: "Sikkim's holiest month, and a procession through Gangtok",
    state: "sikkim",
    region: "sikkim",
    venue: "Tsuklakhang Palace Monastery and across Sikkim",
    locality: "Gangtok",
    startDate: "2027-05-30",
    endDate: "2027-05-30",
    category: "culture",
    fromPrice: 0,
    intro:
      "The triple-blessed day marking the Buddha's birth, enlightenment and parinirvana. Monks carry the holy books through Gangtok in procession, and merit earned on this day is held to be multiplied many times over.",
    body: [
      "Saga Dawa is observed across the whole month but the full-moon day is the one to be present for. The procession from Tsuklakhang moves through the town in the morning.",
      "An Inner Line Permit is required for Sikkim; we process it free with any booking.",
    ],
    tickets: [
      {
        name: "Free to attend",
        price: 0,
        description:
          "A religious observance rather than an event. Watch quietly and do not block the procession.",
        remaining: null,
        perks: ["Open to all"],
      },
    ],
    heroAlt:
      "Monks carrying scriptures in procession through Gangtok during Saga Dawa, Sikkim",
  },
  {
    slug: "dree-festival-ziro-2027",
    name: "Dree Festival",
    strapline: "The Apatani agricultural festival, in the valley it belongs to",
    state: "arunachal-pradesh",
    region: "arunachal",
    venue: "Dree ground, Hapoli",
    locality: "Ziro",
    startDate: "2027-07-05",
    endDate: "2027-07-07",
    category: "festival",
    fromPrice: 600,
    intro:
      "The Apatani's own festival, propitiating the deities that govern the crop. Priests, ritual sacrifice, the daminda dance, and cucumbers distributed to everyone present — the last of which is taken very seriously.",
    body: [
      "Dree is an agricultural festival rather than a spectacle for visitors, which is exactly its appeal. It falls in July, in the middle of the wet season, and Ziro in July is a committed choice.",
      "An Inner Line Permit is required for Arunachal Pradesh.",
    ],
    lineup: ["Daminda dance", "Priestly rites at the Dree ground"],
    tickets: [
      {
        name: "Day entry",
        price: 600,
        description: "Entry to the Dree ground at Hapoli.",
        remaining: null,
        perks: ["Single-day entry", "Inner Line Permit processing"],
      },
      {
        name: "Three days with homestay",
        price: 21000,
        description:
          "All three days plus three nights in an Apatani home in Hong village, full board.",
        remaining: 16,
        perks: [
          "Three-day entry",
          "Three nights full board in an Apatani home",
          "Village introduction",
          "Inner Line Permit processing",
        ],
      },
    ],
    heroAlt:
      "Apatani priests conducting rites at the Dree festival ground at Hapoli, Ziro, Arunachal Pradesh",
  },
  {
    slug: "brahmaputra-river-marathon-2027",
    name: "Brahmaputra half marathon",
    strapline: "Twenty-one kilometres along the embankment at first light",
    state: "assam",
    region: "assam",
    venue: "Guwahati riverfront",
    locality: "Guwahati",
    startDate: "2027-02-14",
    endDate: "2027-02-14",
    category: "sport",
    fromPrice: 1400,
    intro:
      "A flat, fast half marathon along the Brahmaputra embankment starting at half past five, when the river is still under mist and the city is still asleep.",
    body: [
      "There are 5k, 10k and 21k distances. February in Guwahati is the only sensible month for it — pleasant at dawn, unpleasant by nine.",
      "No permit is required for Assam.",
    ],
    tickets: [
      {
        name: "5 kilometres",
        price: 1400,
        description: "The short course, along the riverfront and back.",
        remaining: 800,
        perks: ["Race entry", "Timing chip", "Finisher's medal"],
      },
      {
        name: "10 kilometres",
        price: 1900,
        description: "Out along the embankment to Sukleshwar and back.",
        remaining: 600,
        perks: ["Race entry", "Timing chip", "Finisher's medal", "Race tee"],
      },
      {
        name: "Half marathon",
        price: 2800,
        description: "The full 21.1km embankment course.",
        remaining: 340,
        perks: [
          "Race entry",
          "Timing chip",
          "Finisher's medal and tee",
          "Post-race breakfast",
        ],
      },
    ],
    heroAlt:
      "Runners on the Brahmaputra embankment at dawn during the Guwahati half marathon, Assam",
  },
  {
    slug: "northeast-food-festival-shillong-2027",
    name: "Northeast food festival",
    strapline: "Eight states, one field, three days of fermentation",
    state: "meghalaya",
    region: "meghalaya",
    venue: "Polo Ground",
    locality: "Shillong",
    startDate: "2027-03-19",
    endDate: "2027-03-21",
    category: "food",
    fromPrice: 500,
    intro:
      "Every state in the region cooking in one place: akhuni, jadoh, smoked pork, bamboo shoot, eromba, and rather more varieties of fermented soybean than most people are expecting.",
    body: [
      "Three days at the Polo Ground with stalls run by cooks from all eight states, plus demonstration sessions and a rice beer tent that gets busy early.",
      "No permit is required for Meghalaya.",
    ],
    tickets: [
      {
        name: "Day entry",
        price: 500,
        description: "Entry for one day. Food is bought at the stalls.",
        remaining: null,
        perks: ["Single-day entry"],
      },
      {
        name: "Tasting pass",
        price: 3200,
        description:
          "Entry across all three days plus a tasting flight from eight state kitchens and two demonstration sessions.",
        remaining: 180,
        perks: [
          "Three-day entry",
          "Eight-state tasting flight",
          "Two cooking demonstrations",
          "Rice beer tasting",
        ],
      },
    ],
    heroAlt:
      "Food stalls from across the eight Northeast states set up at the Polo Ground, Shillong, Meghalaya",
  },
];

const bySlug = new Map(events.map((e) => [e.slug, e]));

export function getEvents(): NEEvent[] {
  return [...events].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function getEventBySlug(slug: string): NEEvent | undefined {
  return bySlug.get(slug);
}

export function getFeaturedEvents(limit = 3): NEEvent[] {
  return events.filter((e) => e.featured).slice(0, limit);
}

export function getEventsByState(state: StateSlug): NEEvent[] {
  return getEvents().filter((e) => e.state === state);
}

/** Events falling inside a date window — used by the tour add-on step. */
export function getEventsBetween(fromISO: string, toISO: string): NEEvent[] {
  return getEvents().filter(
    (e) => e.startDate <= toISO && e.endDate >= fromISO,
  );
}
