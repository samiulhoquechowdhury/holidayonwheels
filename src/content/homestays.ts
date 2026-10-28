import type { Homestay, StateSlug } from "./types";
import { shot } from "@/config/showcase";

/**
 * Homestays. Browsable and bookable on their own, and offered as an add-on
 * after a tour selection via `getHomestaysNear`.
 *
 * Coordinates are approximate and exist for the index map only — they are not
 * exact property locations, and should be replaced when the client supplies
 * real addresses.
 */

/*
 * ---------------------------------------------------------------------------
 * PLACEHOLDER DATA — GUWAHATI. NOT REAL PROPERTIES. DO NOT LAUNCH ON THIS.
 * ---------------------------------------------------------------------------
 *
 * Every field in the four entries below is invented: the houses, the families,
 * the rates, the ratings and the review counts. They exist so the redesigned
 * homestays page can be judged on layout and copy while the client's real
 * Guwahati properties are outstanding.
 *
 * They are written to be replaced, not edited around:
 *
 *  - every slug starts `ghy-`, which is how `getGuwahatiHomestays()` finds
 *    them and how you find them again;
 *  - `reviewCount` and `rating` are the dangerous ones. A fabricated review
 *    count is a specific factual claim about a real business and is the first
 *    thing to delete if these ship by accident;
 *  - the coordinates are real Guwahati localities, so the locator is honest
 *    about geography even while the houses are not;
 *  - photography is placeholder stock like the rest of the site. See
 *    `config/showcase.ts` and MEDIA.md.
 *
 * The rest of this file — Majuli, Ziro, Khonoma and the other eight — is the
 * original content set and is not placeholder in this sense.
 */
const GUWAHATI_PLACEHOLDERS: Homestay[] = [
  {
    slug: "ghy-uzan-bazar-house",
    name: "The Uzan Bazar house",
    strapline:
      "A veranda, a garden, and the Brahmaputra at the end of the lane",
    state: "assam",
    region: "assam",
    locality: "Uzan Bazar, Guwahati",
    lat: 26.188,
    lng: 91.759,
    fromPrice: 3400,
    maxGuests: 6,
    bedrooms: 3,
    rating: 4.8,
    reviewCount: 94,
    mealsIncluded: "breakfast",
    featured: true,
    intro:
      "An old Assamese town house in the quarter the city started in, with a deep veranda on carved pillars, a garden that has been there longer than the road, and the river four minutes' walk away.",
    body: [
      "Uzan Bazar is the oldest part of Guwahati and still the quietest, which is not a sentence anyone expects to read about a city of a million people. The house sits behind a gate on a lane of similar houses, most of which have been replaced by flats.",
      "Breakfast is on the veranda — luchi, aloo pitika, and tea from the family's own estate connections. Dinner is not served, and that is deliberate: Uzan Bazar has better food within walking distance than the kitchen is pretending to.",
    ],
    hostName: "Pranab and Nabanita Barua",
    hostStory:
      "Pranab's grandfather built the house in 1948 and Pranab has refused three offers from developers for it. He taught history at Cotton College for thirty years and will walk you round the quarter if you ask on the first night rather than the last.",
    rooms: [
      {
        name: "The veranda room",
        sleeps: 2,
        perNight: 3400,
        description:
          "The front room, opening through double doors onto the long veranda and the garden.",
        amenities: [
          "Double bed",
          "Private bathroom",
          "Air conditioning",
          "Desk",
        ],
      },
      {
        name: "The garden room",
        sleeps: 3,
        perNight: 4200,
        description:
          "At the back, quieter, with a window seat over the jackfruit tree.",
        amenities: [
          "Double bed and a single",
          "Private bathroom",
          "Air conditioning",
          "Reading chair",
        ],
      },
    ],
    amenities: [
      "Breakfast on the veranda",
      "Airport pickup on request",
      "Wifi throughout",
      "Off-street parking inside the gate",
      "Laundry, same day",
    ],
    houseRules: [
      "No smoking inside the house; the veranda is fine",
      "The gate is locked at eleven — tell them if you will be later",
      "Shoes off in the bedrooms",
    ],
    heroAlt:
      "A sunlit veranda on carved painted pillars with cane chairs, looking onto a green garden",
    // sunlit veranda, ornate painted pillars, cane chairs, garden beyond
    image: shot("1792772531515-45f54df5cdf3"),
  },
  {
    slug: "ghy-kharghuli-hill-home",
    name: "The Kharghuli hill home",
    strapline: "Above the city, with the river laid out underneath it",
    state: "assam",
    region: "assam",
    locality: "Kharghuli, Guwahati",
    lat: 26.192,
    lng: 91.748,
    fromPrice: 2800,
    maxGuests: 4,
    bedrooms: 2,
    rating: 4.7,
    reviewCount: 61,
    mealsIncluded: "half-board",
    intro:
      "A modern family house on the Kharghuli slope, ten minutes above the traffic, where the porch looks down the length of the Brahmaputra and the evenings are ten degrees more civilised than the road below.",
    body: [
      "Kharghuli is the hill the city's older money moved up onto, and the view is the whole reason. From the porch swing the river runs west to east across the entire horizon, and the Saraighat bridge lights come on at dusk.",
      "Two rooms only, in the family's own house, with breakfast and dinner eaten with them at the table. If you want a hotel this is the wrong booking.",
    ],
    hostName: "Rituparna Goswami",
    hostStory:
      "Rituparna worked in Bengaluru for eleven years and came back in 2019 to look after her mother, who lives downstairs and does most of the cooking. She runs a small textile label from the back room and is a useful person to know if you want silk that is actually from Sualkuchi.",
    rooms: [
      {
        name: "River-facing room",
        sleeps: 2,
        perNight: 3200,
        description:
          "The front bedroom, with the porch outside it and the whole river in the window.",
        amenities: [
          "Double bed",
          "Private bathroom",
          "Air conditioning",
          "Porch access",
        ],
      },
      {
        name: "Hill-side room",
        sleeps: 2,
        perNight: 2800,
        description:
          "Looks back into the hill and the trees. Cooler, darker, and quieter in the mornings.",
        amenities: ["Twin beds", "Private bathroom", "Ceiling fan"],
      },
    ],
    amenities: [
      "Breakfast and dinner with the family",
      "The porch, and the view off it",
      "Wifi",
      "Parking on the slope",
      "Airport pickup on request",
    ],
    houseRules: [
      "Dinner is at eight and is not a buffet — say if you will miss it",
      "The hill road is steep; large vehicles park at the bottom",
      "No smoking anywhere on the property",
    ],
    heroAlt:
      "A covered porch with a hanging swing, looking out over a garden from a hillside house",
    // modern porch with a swing seat, looking out over a garden
    image: shot("1711963383546-a8f78c3ab5f4"),
  },
  {
    slug: "ghy-north-bank-house",
    name: "The north bank house",
    strapline: "Across the river, where the city stops being loud",
    state: "assam",
    region: "assam",
    locality: "Rajaduar, North Guwahati",
    lat: 26.2,
    lng: 91.72,
    fromPrice: 2400,
    maxGuests: 5,
    bedrooms: 3,
    rating: 4.6,
    reviewCount: 38,
    mealsIncluded: "full-board",
    intro:
      "A low green house under palms on the north bank, twenty minutes by ferry from the city and a different century from it. Three rooms, all meals, and the Umananda temple boat from the ghat at the end of the road.",
    body: [
      "North Guwahati is technically the same city and functionally a village: paddy, ponds, satras, and a bazaar that shuts at eight. The ferry across takes twenty minutes and runs until dark; after that it is the long way round by the bridge.",
      "All three meals are cooked in the house. Fish from the river most days, and the family grows the rest of it in the back.",
    ],
    hostName: "Dhiren and Mamoni Kalita",
    hostStory:
      "Dhiren ran the ferry ticket office for twenty-two years and knows every boatman on both banks by name. Mamoni cooks, and does not take suggestions about the fish.",
    rooms: [
      {
        name: "Front room",
        sleeps: 2,
        perNight: 2400,
        description:
          "Off the main hall, with the garden and the palms outside.",
        amenities: [
          "Double bed",
          "Private bathroom",
          "Ceiling fan",
          "Mosquito net",
        ],
      },
      {
        name: "Pond room",
        sleeps: 3,
        perNight: 3000,
        description: "At the back, over the pond, with windows on two sides.",
        amenities: [
          "Double bed and a single",
          "Shared bathroom",
          "Ceiling fan",
          "Mosquito net",
        ],
      },
    ],
    amenities: [
      "All three meals, cooked in the house",
      "Ferry timings, and someone who knows them",
      "Bicycles",
      "Solar backup during power cuts",
      "Boat to Umananda arranged from the ghat",
    ],
    houseRules: [
      "Cash preferred — the nearest ATM is back across the river",
      "The last ferry is at dusk; plan the evening around it",
      "Power is intermittent and the wifi is worse",
    ],
    heroAlt:
      "A low green and white heritage house at the end of a palm-lined drive",
    // green-painted old house, palm drive, quiet compound
    image: shot("1759738103259-f2f9bb73a9d9"),
  },
  {
    slug: "ghy-sualkuchi-weavers-house",
    name: "The weavers' house at Sualkuchi",
    strapline: "Sleep above the looms, in the village that makes the silk",
    state: "assam",
    region: "assam",
    locality: "Sualkuchi, 32 km from Guwahati",
    lat: 26.1667,
    lng: 91.5667,
    fromPrice: 2600,
    maxGuests: 6,
    bedrooms: 3,
    rating: 4.9,
    reviewCount: 52,
    mealsIncluded: "full-board",
    intro:
      "A working weaving household in Sualkuchi, where the whole village makes muga and pat silk and has done for five hundred years. The looms run downstairs from six in the morning, which is both the charm and the warning.",
    body: [
      "Sualkuchi is not a craft demonstration. It is an industry: roughly seventeen thousand looms in a village of a few thousand households, and the sound of them is the sound of the place.",
      "You are welcome at the loom and the family will put you on one, badly, for as long as you like. What they will not do is sell you a sari at tourist prices — the rate is the rate the traders pay, and they will tell you what it is.",
    ],
    hostName: "Hemanta and Junu Das",
    hostStory:
      "Four generations of Hemanta's family have woven in this house and Junu is the faster of the two by some distance. Their daughter is studying textile design in Delhi and is the one who insisted they take guests.",
    rooms: [
      {
        name: "Upstairs front",
        sleeps: 2,
        perNight: 2600,
        description:
          "Over the loom room, with the village street below. Earplugs are in the drawer.",
        amenities: [
          "Double bed",
          "Shared bathroom",
          "Ceiling fan",
          "Mosquito net",
        ],
      },
      {
        name: "Upstairs back",
        sleeps: 4,
        perNight: 3600,
        description:
          "The larger room, over the courtyard, away from the street and the looms.",
        amenities: [
          "Two double beds",
          "Private bathroom",
          "Ceiling fan",
          "Mosquito net",
        ],
      },
    ],
    amenities: [
      "All meals, eaten with the family",
      "Time at the loom, with somebody who can actually weave",
      "Silk bought at the trade rate, if you want any",
      "Shared transport to Guwahati most mornings",
      "Walking tour of the village's other workshops",
    ],
    houseRules: [
      "The looms start at six. This is not negotiable and is the point",
      "Ask before photographing anyone at work",
      "Cash only",
    ],
    heroAlt:
      "Weavers working a bright silk warp on a traditional loom in an open-sided village workshop",
    // weaving on a loom in a bamboo-walled Assamese workshop
    image: shot("1759738099669-d64b0656f6cf"),
  },
];

const originalHomestays: Homestay[] = [
  {
    slug: "mishing-stilt-house-majuli",
    name: "The Mishing stilt house",
    strapline: "Bamboo, on stilts, on a river island",
    state: "assam",
    region: "assam",
    locality: "Garamur, Majuli",
    lat: 26.95,
    lng: 94.17,
    fromPrice: 3200,
    maxGuests: 8,
    bedrooms: 4,
    rating: 4.8,
    reviewCount: 126,
    mealsIncluded: "full-board",
    featured: true,
    intro:
      "A traditional Mishing chang ghar built entirely from bamboo and thatch, raised on stilts against the flood. Four rooms, a shared veranda that runs the length of the house, and the Brahmaputra a ten-minute walk away.",
    body: [
      "The Mishing build on stilts because Majuli floods every year and always has. The house is rebuilt or repaired most seasons, which is not a defect — it is how the architecture works. Nothing here is decorative.",
      "Meals are cooked on the hearth in the middle of the house: rice, fish from the river, and apong, the rice beer, which your hosts will insist you try and will not accept a no on.",
    ],
    hostName: "Jitu and Rina Payeng",
    hostStory:
      "Jitu grew up on Majuli and spent twelve years in Guwahati before coming back to run the house with Rina. He is the person to ask about the island's erosion, and he will tell you the unvarnished version.",
    rooms: [
      {
        name: "Veranda room",
        sleeps: 2,
        perNight: 3200,
        description:
          "A bamboo-walled room opening straight onto the long veranda, with the paddy on that side.",
        amenities: ["Double bed", "Mosquito net", "Shared bathroom", "Fan"],
      },
      {
        name: "Corner room",
        sleeps: 3,
        perNight: 4200,
        description:
          "The largest room, in the corner of the house, with windows on two sides.",
        amenities: [
          "Double bed and a single",
          "Mosquito net",
          "Private bathroom",
          "Fan",
        ],
      },
    ],
    amenities: [
      "All meals included, cooked on the house hearth",
      "Bicycles for the island",
      "Hot water by bucket",
      "Solar backup during power cuts",
      "Guided walk to the satras",
    ],
    houseRules: [
      "No shoes inside the house",
      "Cash preferred — the nearest ATM is in Kamalabari",
      "Power is intermittent and the wifi is worse",
    ],
    heroAlt:
      "A traditional Mishing bamboo house raised on stilts above paddy fields on Majuli island, Assam",
    // stilt huts over calm water
    image: shot("1761342612154-57377cda7a89"),
  },
  {
    slug: "khasi-cottage-mawphlang",
    name: "The Khasi cottage at Mawphlang",
    strapline: "Stone, pine, and a sacred grove at the end of the lane",
    state: "meghalaya",
    region: "meghalaya",
    locality: "Mawphlang, East Khasi Hills",
    lat: 25.45,
    lng: 91.75,
    fromPrice: 4800,
    maxGuests: 6,
    bedrooms: 3,
    rating: 4.9,
    reviewCount: 214,
    mealsIncluded: "half-board",
    featured: true,
    intro:
      "A stone cottage at 1,800 metres, three rooms, a wood stove that is genuinely needed most of the year, and the Mawphlang sacred grove a fifteen-minute walk down the lane.",
    body: [
      "Mawphlang is high, cold and quiet. The sacred grove next door has never been cut because Khasi custom forbids removing anything from it — not a fallen branch, not a leaf — and walking it with Bahdor, who grew up here, is the reason to stay rather than visit.",
      "Breakfast and dinner are Khasi: jadoh, dohneiiong, and a great deal of black tea. Lunch you sort out yourself, which usually means you are out walking anyway.",
    ],
    hostName: "Bahdor and Iaishah Lyngdoh",
    hostStory:
      "Bahdor is a registered grove guide and has been taking people through it for nineteen years. Iaishah runs the kitchen and the vegetable garden that supplies most of it.",
    rooms: [
      {
        name: "Stove room",
        sleeps: 2,
        perNight: 4800,
        description:
          "The warmest room in the house, with the wood stove and a window onto the pines.",
        amenities: [
          "Double bed",
          "Wood stove",
          "Private bathroom",
          "Hot water",
        ],
      },
      {
        name: "Pine room",
        sleeps: 2,
        perNight: 4400,
        description:
          "Upstairs, quieter, with the grove visible from the window.",
        amenities: ["Double bed", "Private bathroom", "Extra blankets"],
      },
      {
        name: "Family room",
        sleeps: 4,
        perNight: 6800,
        description: "Two double beds under the eaves, best for a family.",
        amenities: ["Two double beds", "Private bathroom", "Wood stove"],
      },
    ],
    amenities: [
      "Breakfast and dinner included",
      "Wood stove in two rooms",
      "Guided sacred grove walk with the host",
      "Hot water throughout",
      "Packed lunches on request",
    ],
    houseRules: [
      "Nothing may be removed from the sacred grove, including stones and leaves",
      "Quiet after ten — the village is close",
      "No smoking indoors",
    ],
    heroAlt:
      "A stone cottage with a pitched tin roof among pines at Mawphlang, East Khasi Hills, Meghalaya",
    // timber houses under forest
    image: shot("1788146534999-516a87a14f20"),
  },
  {
    slug: "riverside-nongriat",
    name: "Riverside at Nongriat",
    strapline: "Below the root bridge, and only reachable on foot",
    state: "meghalaya",
    region: "meghalaya",
    locality: "Nongriat, East Khasi Hills",
    lat: 25.24,
    lng: 91.71,
    fromPrice: 2400,
    maxGuests: 10,
    bedrooms: 5,
    rating: 4.6,
    reviewCount: 341,
    mealsIncluded: "full-board",
    intro:
      "Three thousand steps below Tyrna, in the village the double-decker root bridge belongs to. There is no road. Everything here, including your bag if you pay someone to carry it, arrives on somebody's back.",
    body: [
      "Staying overnight is the whole point: the day-trippers are gone by four and the bridge, the rock pools and Rainbow Falls are effectively yours from then until about nine the next morning.",
      "The rooms are basic and honest about it. Cold water, intermittent electricity, and the best sleep you will get in Meghalaya because there is genuinely nothing to hear except the river.",
    ],
    hostName: "Byron Nongrum",
    hostStory:
      "Byron's family has lived in Nongriat for four generations and helped train two of the root bridges you will walk across. He can tell you roughly how old each one is.",
    rooms: [
      {
        name: "River-facing double",
        sleeps: 2,
        perNight: 2400,
        description:
          "A simple double with the stream directly below the window.",
        amenities: ["Double bed", "Mosquito net", "Shared bathroom"],
      },
      {
        name: "Dormitory bunk",
        sleeps: 1,
        perNight: 1200,
        description: "One bunk in a six-bed dorm. Bring a head torch.",
        amenities: ["Single bunk", "Locker", "Shared bathroom"],
      },
    ],
    amenities: [
      "All meals included",
      "Guided walk to Rainbow Falls",
      "Porter service from Tyrna, arranged in advance",
      "Drinking water refills",
    ],
    houseRules: [
      "There is no road — the walk in is around 3,000 steps down",
      "Cash only; there is no ATM and no card machine",
      "Electricity runs on a generator for a few hours each evening",
      "Carry your rubbish back out",
    ],
    heroAlt:
      "Simple guesthouse rooms beside the stream at Nongriat village below the double-decker root bridge, Meghalaya",
    // a timber house on a river
    image: shot("1592339422218-d8038161461c"),
  },
  {
    slug: "apatani-home-ziro",
    name: "The Apatani home at Hong",
    strapline: "A working farmhouse on the plateau",
    state: "arunachal-pradesh",
    region: "arunachal",
    locality: "Hong village, Ziro",
    lat: 27.55,
    lng: 93.83,
    fromPrice: 3800,
    maxGuests: 6,
    bedrooms: 3,
    rating: 4.9,
    reviewCount: 87,
    mealsIncluded: "full-board",
    featured: true,
    intro:
      "A working Apatani farmhouse in Hong, one of the largest villages on the plateau. Bamboo floors, a central hearth, and fields immediately outside that grow rice and fish in the same water.",
    body: [
      "The Apatani paddy-cum-fish system is one of the most efficient traditional agricultural methods anywhere, and it is easier to understand standing in it than reading about it. Hibu will take you out at planting or harvest and put you to work if you want.",
      "The house is a real house. There is a hearth in the middle of the main room and it stays lit, which is how the bamboo stays dry and the food gets cooked.",
    ],
    hostName: "Hibu Tatung and family",
    hostStory:
      "Hibu farms four plots on the plateau and has hosted travellers since 2016. His mother, who lives in the house, is one of the last generation of Apatani women with facial tattoos and nose plugs.",
    rooms: [
      {
        name: "Hearth room",
        sleeps: 2,
        perNight: 3800,
        description: "Off the main room, warm from the hearth wall.",
        amenities: ["Double bed", "Shared bathroom", "Extra quilts"],
      },
      {
        name: "Field room",
        sleeps: 4,
        perNight: 5600,
        description:
          "A larger room at the back looking straight over the paddy.",
        amenities: ["Two double beds", "Private bathroom", "Hot water"],
      },
    ],
    amenities: [
      "All meals, cooked on the house hearth",
      "Guided walk through the paddy-cum-fish system",
      "Rice beer, brewed in the house",
      "Bicycles",
      "Airport pickup from Lilabari on request",
    ],
    houseRules: [
      "An Inner Line Permit is required to be in Arunachal at all — we arrange it",
      "Ask before photographing anyone, particularly the elders",
      "No shoes inside",
    ],
    heroAlt:
      "A bamboo Apatani farmhouse in Hong village at Ziro, Arunachal Pradesh, with paddy terraces behind it",
    // a village among rice terraces
    image: shot("1663378441740-25274eb4d59d"),
  },
  {
    slug: "angami-house-khonoma",
    name: "The Angami house at Khonoma",
    strapline: "Terraces, alder, and a village that stopped hunting",
    state: "nagaland",
    region: "nagaland",
    locality: "Khonoma, Kohima district",
    lat: 25.65,
    lng: 94.02,
    fromPrice: 4200,
    maxGuests: 8,
    bedrooms: 4,
    rating: 4.9,
    reviewCount: 158,
    mealsIncluded: "full-board",
    featured: true,
    intro:
      "A stone-and-timber Angami house inside Khonoma, the village that banned hunting on its own eighty square kilometres in 1998 and turned it into a community conservation area.",
    body: [
      "Khonoma's terraces are worked with alder trees left standing in the fields — the alder fixes nitrogen, so the terraces have been continuously cropped for centuries without fertiliser. It is one of the most sophisticated agricultural systems in India and hardly anybody outside the state knows about it.",
      "Meals are Naga: smoked pork, akhuni, bamboo shoot, and chillies used with a great deal more restraint than the reputation suggests. Vegetarians are catered for but should say so at booking.",
    ],
    hostName: "Kevi and Vinuo Meru",
    hostStory:
      "Kevi was part of the village council that pushed the hunting ban through and will talk you through exactly how contested it was at the time. Vinuo weaves and can explain what any shawl in the house means.",
    rooms: [
      {
        name: "Terrace-view double",
        sleeps: 2,
        perNight: 4200,
        description:
          "A wood-floored double looking down over the rice terraces.",
        amenities: ["Double bed", "Private bathroom", "Hot water", "Heater"],
      },
      {
        name: "Loft room",
        sleeps: 3,
        perNight: 5400,
        description: "Up under the roof, with the village spread out below.",
        amenities: ["Double bed and single", "Private bathroom", "Heater"],
      },
    ],
    amenities: [
      "All meals included",
      "Village and conservation-area walk with the host",
      "Naga cooking session on request",
      "Shawl weaving demonstration",
      "Hot water and room heaters",
    ],
    houseRules: [
      "An Inner Line Permit is required for Nagaland — we arrange it",
      "The community forest is not open to hunting or foraging",
      "Sunday is observed quietly in the village",
    ],
    heroAlt:
      "A stone and timber Angami house in Khonoma village, Nagaland, above alder-studded rice terraces",
    // houses on terraced hillsides in mist
    image: shot("1786558675588-5a46f55984b7"),
  },
  {
    slug: "phumdi-hut-loktak",
    name: "The phumdi hut on Loktak",
    strapline: "A hut on a floating island, reached only by boat",
    state: "manipur",
    region: "manipur",
    locality: "Champu Khangpok, Loktak Lake",
    lat: 24.52,
    lng: 93.82,
    fromPrice: 3600,
    maxGuests: 4,
    bedrooms: 2,
    rating: 4.7,
    reviewCount: 64,
    mealsIncluded: "full-board",
    intro:
      "A two-room hut built directly on a phumdi — a floating mat of vegetation thick enough to carry a building — in the middle of Loktak. The only way in is a forty-minute boat ride.",
    body: [
      "Champu Khangpok is a floating village and its residents fish the lake as they always have, though the fishing is harder every year. Staying here is a straightforward transaction: the household earns from the room, and you get the lake at dawn with nobody else on it.",
      "This is basic accommodation on a floating platform. If that sounds uncomfortable, it is, slightly, and it is also the single most memorable night most travellers have in the Northeast.",
    ],
    hostName: "Thoiba and Ongbi Sanatombi",
    hostStory:
      "Thoiba has fished Loktak since he was eleven and is on the village committee negotiating with the Loktak Development Authority over the phumdi clearances. He is worth listening to on it.",
    rooms: [
      {
        name: "Lake room",
        sleeps: 2,
        perNight: 3600,
        description:
          "A simple bamboo room with the water immediately outside on three sides.",
        amenities: ["Double mattress", "Mosquito net", "Shared washroom"],
      },
      {
        name: "Second room",
        sleeps: 2,
        perNight: 3200,
        description: "The inner room, slightly warmer at night.",
        amenities: ["Double mattress", "Mosquito net", "Shared washroom"],
      },
    ],
    amenities: [
      "All meals, mostly fish from the lake",
      "Dawn boat out onto the phumdis",
      "Boat transfer from Sendra included",
      "Solar lighting",
    ],
    houseRules: [
      "An Inner Line Permit is required for Manipur — we arrange it",
      "There is no mains power and no hot water",
      "The washroom is shared and basic",
      "Check current travel advisories before booking; we monitor them",
    ],
    heroAlt:
      "A bamboo hut built on a floating phumdi island in the middle of Loktak Lake, Manipur",
    // thatched huts on stilts over water
    image: shot("1780433644894-fe773f5b83b2"),
  },
  {
    slug: "mizo-ridge-house-reiek",
    name: "The Mizo ridge house",
    strapline: "Above the cloud line at Reiek, with a loom in the front room",
    state: "mizoram",
    region: "mizoram",
    locality: "Reiek, Mamit district",
    lat: 23.69,
    lng: 92.6,
    fromPrice: 3400,
    maxGuests: 6,
    bedrooms: 3,
    rating: 4.8,
    reviewCount: 52,
    mealsIncluded: "half-board",
    intro:
      "A timber house on the ridge below Reiek Tlang, with the valley falling away on both sides and a working loom in the front room where the puanchei gets made.",
    body: [
      "Reiek is an hour from Aizawl and about a thousand metres above most of the state's cloud. On a clear morning the view reaches into Bangladesh; on most mornings you are above a white floor with ridges poking through it.",
      "Lalrinpuii weaves the puanchei — the Mizo ceremonial wraparound — on the loom in the front room, and will show you the whole process if you ask, which takes considerably longer than you expect.",
    ],
    hostName: "Lalrinpuii and Zonunmawia",
    hostStory:
      "Lalrinpuii has woven since she was fourteen and supplies several shops in Aizawl. Zonunmawia guides the Reiek Tlang climb and knows the birds on it.",
    rooms: [
      {
        name: "Valley room",
        sleeps: 2,
        perNight: 3400,
        description:
          "Front room with the drop straight off the ridge below it.",
        amenities: ["Double bed", "Private bathroom", "Hot water", "Heater"],
      },
      {
        name: "Twin room",
        sleeps: 2,
        perNight: 3200,
        description: "Two singles at the back, quieter and warmer.",
        amenities: ["Two single beds", "Shared bathroom", "Hot water"],
      },
    ],
    amenities: [
      "Breakfast and dinner included",
      "Puanchei weaving demonstration",
      "Guided climb up Reiek Tlang",
      "Hot water and heaters",
    ],
    houseRules: [
      "An Inner Line Permit is required for Mizoram — we arrange it",
      "Sunday is strictly observed; almost nothing is open",
      "No alcohol on the premises",
    ],
    heroAlt:
      "A timber house on a ridge below Reiek Tlang in Mizoram, above a valley filled with cloud",
    // a two-storey house on a forested ridge
    image: shot("1760366621225-55dceb1a3882"),
  },
  {
    slug: "planters-bungalow-jorhat",
    name: "The planter's bungalow",
    strapline: "Nineteen-twenties tea country, with the cook who came with it",
    state: "assam",
    region: "assam",
    locality: "Gatoonga, near Jorhat",
    lat: 26.72,
    lng: 94.19,
    fromPrice: 9800,
    maxGuests: 8,
    bedrooms: 4,
    rating: 4.9,
    reviewCount: 193,
    mealsIncluded: "full-board",
    featured: true,
    intro:
      "A 1920s manager's bungalow on a working tea estate: four vast rooms, ceiling fans that predate independence, a veranda the length of the house, and a garden that runs into the tea.",
    body: [
      "This is the most comfortable accommodation on this list by a distance, and the least like a homestay — it is a heritage property with staff. What makes it worth including is that the estate is still working, so you can walk the plucking rounds and stand in the factory during the cycle.",
      "Dinner is served on the veranda and cooked by Ranjit, who has been in the kitchen since 1994 and makes the best mutton curry in upper Assam. He will not tell you what is in it.",
    ],
    hostName: "The Gatoonga estate",
    hostStory:
      "The bungalow is run by the estate rather than a family, with a resident manager who will walk you through the gardens and the factory if you ask the evening before.",
    rooms: [
      {
        name: "Master suite",
        sleeps: 2,
        perNight: 12500,
        description:
          "The original manager's room, with a dressing room and a private section of veranda.",
        amenities: [
          "King bed",
          "Private bathroom with tub",
          "Private veranda",
          "Air conditioning",
        ],
      },
      {
        name: "Garden room",
        sleeps: 2,
        perNight: 9800,
        description: "Opens onto the lawn, with the tea immediately beyond it.",
        amenities: ["Double bed", "Private bathroom", "Air conditioning"],
      },
      {
        name: "Twin room",
        sleeps: 2,
        perNight: 9800,
        description: "Two singles, at the quiet end of the house.",
        amenities: ["Two single beds", "Private bathroom", "Air conditioning"],
      },
    ],
    amenities: [
      "All meals, served on the veranda",
      "Estate and factory tour with the manager",
      "Professional tea tasting",
      "Bicycles and a croquet lawn that has seen things",
      "Laundry service",
    ],
    houseRules: [
      "Dinner is served at eight and the kitchen closes at nine-thirty",
      "The factory tour depends on the plucking cycle — not available in winter dormancy",
    ],
    heroAlt:
      "The veranda of a 1920s planter's bungalow on a working tea estate near Jorhat, Assam",
    // a verandah of wicker chairs over green
    image: shot("1785245647183-6ab9ddf670a1"),
  },
  {
    slug: "lepcha-house-yuksom",
    name: "The Lepcha house at Yuksom",
    strapline: "Cardamom terraces, and the trailhead at the top of the lane",
    state: "sikkim",
    region: "sikkim",
    locality: "Yuksom, West Sikkim",
    lat: 27.37,
    lng: 88.22,
    fromPrice: 4600,
    maxGuests: 8,
    bedrooms: 4,
    rating: 4.8,
    reviewCount: 176,
    mealsIncluded: "full-board",
    intro:
      "A timber house in Sikkim's first capital, surrounded by cardamom terraces, twenty minutes' walk from Dubdi — the oldest monastery in the state — and at the foot of the Goecha La trail.",
    body: [
      "Yuksom is where Sikkim was founded in 1642 and where the Goecha La trek starts, which means the village runs on a rhythm of trekkers arriving and leaving. Staying a few days either side of that is the pleasant way to do it.",
      "The house grows large cardamom on its own terraces, which you will smell before you see, and the family will take you through the drying sheds during the season.",
    ],
    hostName: "Pemba and Dechen Lepcha",
    hostStory:
      "Pemba guided on Goecha La for fifteen years before his knees made the decision for him. He still knows the current state of every bridge on the route.",
    rooms: [
      {
        name: "Cardamom room",
        sleeps: 2,
        perNight: 4600,
        description: "Overlooking the terraces, with a wood-panelled interior.",
        amenities: ["Double bed", "Private bathroom", "Hot water", "Heater"],
      },
      {
        name: "Trekker's twin",
        sleeps: 2,
        perNight: 3800,
        description: "Simple twin room with drying space for wet kit.",
        amenities: ["Two single beds", "Shared bathroom", "Drying rack"],
      },
      {
        name: "Family room",
        sleeps: 4,
        perNight: 7200,
        description: "The largest room, upstairs, with a small sitting area.",
        amenities: ["Two double beds", "Private bathroom", "Heater"],
      },
    ],
    amenities: [
      "All meals included",
      "Cardamom terrace and drying shed walk in season",
      "Guided walk to Dubdi monastery",
      "Trek kit storage and drying space",
      "Hot water and heaters",
    ],
    houseRules: [
      "An Inner Line Permit is required for Sikkim — we arrange it",
      "Single-use plastics are banned across Sikkim; bring a refillable bottle",
      "No open fires on the terraces",
    ],
    heroAlt:
      "A timber house among large cardamom terraces at Yuksom, west Sikkim, with forested ridges behind",
    // a house on a green hillside
    image: shot("1700305732566-9bab903fd490"),
  },
  {
    slug: "gangtok-town-house",
    name: "The Gangtok town house",
    strapline: "Five minutes off MG Marg, and quiet anyway",
    state: "sikkim",
    region: "sikkim",
    locality: "Development Area, Gangtok",
    lat: 27.33,
    lng: 88.61,
    fromPrice: 5200,
    maxGuests: 6,
    bedrooms: 3,
    rating: 4.6,
    reviewCount: 231,
    mealsIncluded: "breakfast",
    intro:
      "A family home on the slope above Gangtok, five minutes' walk from MG Marg but far enough off it to sleep. Three rooms, a shared kitchen you may use, and a terrace facing the ridge.",
    body: [
      "Useful as a base rather than a destination: permits for north Sikkim are arranged from Gangtok, vehicles leave from here, and the family will handle the paperwork run for you if you give them a day.",
      "Breakfast only, deliberately — there are better dinners within a ten-minute walk than any home kitchen in the neighbourhood is going to produce.",
    ],
    hostName: "The Rai family",
    hostStory:
      "Three generations in the same house. Anjali runs the bookings, her father has driven north Sikkim for thirty years and can tell you exactly which road is currently closed.",
    rooms: [
      {
        name: "Ridge-view double",
        sleeps: 2,
        perNight: 5200,
        description: "Top floor, opening onto the terrace.",
        amenities: ["Double bed", "Private bathroom", "Heater", "Wifi"],
      },
      {
        name: "Standard double",
        sleeps: 2,
        perNight: 4400,
        description: "Middle floor, quieter, no view to speak of.",
        amenities: ["Double bed", "Private bathroom", "Heater", "Wifi"],
      },
      {
        name: "Twin",
        sleeps: 2,
        perNight: 4200,
        description: "Two singles on the ground floor.",
        amenities: ["Two single beds", "Shared bathroom", "Wifi"],
      },
    ],
    amenities: [
      "Breakfast included",
      "Shared kitchen access",
      "North Sikkim permit runs handled by the family",
      "Reliable wifi, which is rarer here than it should be",
      "Airport and NJP transfers arranged",
    ],
    houseRules: [
      "An Inner Line Permit is required for Sikkim — we arrange it",
      "No single-use plastics, per state law",
      "Front door is locked at eleven; ask for a key if you will be later",
    ],
    heroAlt:
      "A multi-storey family home on the hillside above Gangtok, Sikkim, with the ridge visible behind",
    // a colourful hill town
    image: shot("1781030567598-324ad53db41a"),
  },
  {
    slug: "konyak-longhouse-mon",
    name: "The Konyak longhouse at Mon",
    strapline: "Log drum, morung carvings, and the border ten minutes away",
    state: "nagaland",
    region: "nagaland",
    locality: "Longwa, Mon district",
    lat: 26.87,
    lng: 95.13,
    fromPrice: 3600,
    maxGuests: 6,
    bedrooms: 3,
    rating: 4.7,
    reviewCount: 41,
    mealsIncluded: "full-board",
    intro:
      "A Konyak house at Longwa, ten minutes from the international boundary and a few doors from the Angh's house, which famously has a room in India and a room in Myanmar.",
    body: [
      "This is the far north of Nagaland and the road in is genuinely bad. What you get for it is Konyak country: the morung carvings, the log drum, and the last generation of men carrying the facial tattoos that marked a successful head-taking.",
      "Your hosts will introduce you rather than have you wander. That matters here more than in most places — Longwa gets a steady trickle of photographers and is fairly tired of being photographed without being spoken to.",
    ],
    hostName: "Wangnao and family",
    hostStory:
      "Wangnao's grandfather was among the last tattooed generation. He is candid about how the village feels about visitors, and about the opium question, if you ask properly.",
    rooms: [
      {
        name: "Longhouse room",
        sleeps: 2,
        perNight: 3600,
        description: "A partitioned room off the main longhouse hall.",
        amenities: ["Double mattress", "Shared bathroom", "Quilts"],
      },
      {
        name: "Annexe twin",
        sleeps: 2,
        perNight: 3200,
        description: "In the newer block behind the main house.",
        amenities: [
          "Two single beds",
          "Shared bathroom",
          "Hot water by bucket",
        ],
      },
    ],
    amenities: [
      "All meals included",
      "Introduction to the Angh's house, arranged by your host",
      "Village walk with a Konyak interpreter",
      "Hot water by bucket",
    ],
    houseRules: [
      "An Inner Line Permit is required — we arrange it",
      "Always ask before photographing anyone, and accept a no",
      "The road in is unsurfaced and impassable after heavy rain",
      "Cash only",
    ],
    heroAlt:
      "A Konyak longhouse with carved gables and a log drum at Longwa village, Mon district, Nagaland",
    // thatched houses behind a fence
    image: shot("1769372763562-c1679a3a5163"),
  },
  {
    slug: "tripuri-house-jampui",
    name: "The Tripuri house in the Jampui hills",
    strapline: "Orange groves at 940 metres, and cloud below the veranda",
    state: "tripura",
    region: "tripura",
    locality: "Vanghmun, Jampui Hills",
    lat: 23.95,
    lng: 92.28,
    fromPrice: 2800,
    maxGuests: 6,
    bedrooms: 3,
    rating: 4.5,
    reviewCount: 38,
    mealsIncluded: "full-board",
    intro:
      "Tripura's only real hill station, at 940 metres, surrounded by orange groves that come into season in November. A simple house with a veranda that spends most mornings above the cloud.",
    body: [
      "The Jampui hills are a Mizo-majority area inside Tripura, which makes the food and the language here quite different from Agartala three hours down the road. The orange festival in November is the busiest the range ever gets, which is to say mildly busy.",
      "There is very little to do beyond walking, eating oranges and watching the cloud, which is precisely the appeal.",
    ],
    hostName: "Lalthanmawia and Zairemi",
    hostStory:
      "The family has farmed oranges on the ridge for three generations and will explain, at length and with feeling, why the crop is not what it was.",
    rooms: [
      {
        name: "Veranda double",
        sleeps: 2,
        perNight: 2800,
        description: "Opens onto the veranda, facing the drop.",
        amenities: ["Double bed", "Private bathroom", "Hot water"],
      },
      {
        name: "Grove twin",
        sleeps: 2,
        perNight: 2400,
        description: "Looking into the orange grove behind the house.",
        amenities: ["Two single beds", "Shared bathroom"],
      },
    ],
    amenities: [
      "All meals included",
      "Orange grove walk in season",
      "Guided ridge walks",
      "Hot water",
    ],
    houseRules: [
      "Sunday is observed quietly across the range",
      "No alcohol on the premises",
      "Roads can close briefly in heavy rain",
    ],
    heroAlt:
      "A house with a wide veranda among orange groves in the Jampui Hills, Tripura, above a valley of cloud",
    // a timber house among flowers
    image: shot("1774174689250-b0d4aa85143b"),
  },
];

/*
 * Guwahati first, then the rest.
 *
 * The homestays page leads on Guwahati and holds the other seven states back
 * as "coming soon", so the order here is the order the site reads them in and
 * there is no sorting anywhere downstream.
 */
const homestays: Homestay[] = [...GUWAHATI_PLACEHOLDERS, ...originalHomestays];

const bySlug = new Map(homestays.map((h) => [h.slug, h]));

export function getHomestays(): Homestay[] {
  return homestays;
}

/**
 * The houses that are actually bookable today.
 *
 * Selected by the `ghy-` slug prefix rather than by locality string, because
 * "Sualkuchi, 32 km from Guwahati" does not contain the word on its own and a
 * substring match would be one typo away from dropping a house off the page.
 * The prefix is also the marker for the placeholder block above, so when real
 * properties arrive this keeps working without being touched.
 */
export function getGuwahatiHomestays(): Homestay[] {
  return homestays.filter((h) => h.slug.startsWith("ghy-"));
}

/** Everything not yet open for booking, for the "coming soon" block. */
export function getUpcomingHomestays(): Homestay[] {
  return homestays.filter((h) => !h.slug.startsWith("ghy-"));
}

export function getHomestayBySlug(slug: string): Homestay | undefined {
  return bySlug.get(slug);
}

export function getFeaturedHomestays(limit = 4): Homestay[] {
  return homestays.filter((h) => h.featured).slice(0, limit);
}

export function getHomestaysByState(state: StateSlug): Homestay[] {
  return homestays.filter((h) => h.state === state);
}

/**
 * Homestays worth suggesting alongside a tour — anything in a state the tour
 * passes through. Used by the checkout add-on step.
 */
export function getHomestaysNear(states: StateSlug[], limit = 3): Homestay[] {
  return homestays.filter((h) => states.includes(h.state)).slice(0, limit);
}
