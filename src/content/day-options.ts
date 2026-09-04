import type { StateSlug } from "./types";

/**
 * What a traveller can change about a planned day.
 *
 * The planner drafts an itinerary; this is what turns that draft into
 * something you can actually specify. Every day of a plan gets three
 * questions, and only the ones that apply to it:
 *
 *  - **Getting there.** On day one that is where we meet you — an airport, a
 *    railway station, or nowhere because you are making your own way. On a
 *    day with a long road transfer it is which vehicle. On the last day it is
 *    where we drop you.
 *  - **Tonight.** Where you sleep. Never on the last day, because you do not
 *    sleep anywhere on the day you fly home.
 *  - **Anything else.** Things that are *not* already in the day. This is the
 *    rule that keeps the section honest: if a day's summary already says you
 *    are cruising the Brahmaputra at sunset, the cruise is not sold here as
 *    an extra. Everything below is genuinely additional.
 *
 * ### Prices are supplements, not rates
 *
 * The trip price already covers accommodation on a twin-share basis, all
 * ground transport and a guide. So the first stay at every place costs
 * **zero** — it is the room the quote already bought — and the others are
 * priced as the difference. A form that quoted ₹6,500 a night beside a total
 * that already included a room would be double-counting in the one place a
 * traveller checks hardest.
 *
 * Three units, and they are not interchangeable:
 *
 *  - a stay supplement is **per person, per night**
 *  - an activity is **per person**
 *  - a transfer is **per party** — a vehicle is a vehicle whether two people
 *    or six get into it
 *
 * ### The names are descriptive, not brands
 *
 * "A business hotel off G.S. Road", not a hotel chain. Naming real
 * properties we have no agreement with would be a claim rather than a
 * placeholder, and it is the kind of claim that is expensive to be wrong
 * about. The real inventory replaces these one entry at a time; nothing
 * else has to change. Where one of *our* homestays is in the right place it
 * is named properly and linked, because that one is ours to promise.
 */

export type StayOption = {
  id: string;
  name: string;
  kind: "included" | "homestay" | "hotel" | "heritage" | "lodge" | "camp";
  blurb: string;
  /** Per person, per night, on top of the trip price. Zero is included. */
  supplement: number;
  /** Set where this is one of ours, so the card can link to it. */
  homestaySlug?: string;
};

export type ActivityOption = {
  id: string;
  name: string;
  blurb: string;
  /** Per person. */
  price: number;
  /** Roughly how long it takes. */
  duration: string;
};

export type TransferOption = {
  id: string;
  name: string;
  blurb: string;
  /** Per party, for the day. Zero is what the trip price already covers. */
  price: number;
};

export type PlaceOptions = {
  stays: StayOption[];
  activities: ActivityOption[];
};

const stay = (
  id: string,
  name: string,
  kind: StayOption["kind"],
  blurb: string,
  supplement: number,
  homestaySlug?: string,
): StayOption => ({ id, name, kind, blurb, supplement, homestaySlug });

const doing = (
  id: string,
  name: string,
  blurb: string,
  price: number,
  duration: string,
): ActivityOption => ({ id, name, blurb, price, duration });

/* ---------------------------------------------------------------------- */
/* Places                                                                  */
/* ---------------------------------------------------------------------- */

/**
 * Keyed by the `stay` string on a day-library day, so a new day added to the
 * library picks its options up automatically as long as it sleeps somewhere
 * that already exists. A place with no entry falls back to `GENERIC`, which
 * is deliberately dull rather than absent — a day with no options at all
 * reads as broken, and a day with three plausible ones reads as a place we
 * have simply not written up yet.
 */
export const PLACE_OPTIONS: Record<string, PlaceOptions> = {
  /* ---- Assam --------------------------------------------------------- */
  Guwahati: {
    stays: [
      stay(
        "ghy-standard",
        "A business hotel off G.S. Road",
        "included",
        "Central, clean and entirely forgettable, which on the night you land is exactly what it is for.",
        0,
      ),
      stay(
        "ghy-river",
        "A river-facing room at Uzan Bazar",
        "hotel",
        "Balconies over the Brahmaputra and the ferry ghat below. Worth it for the first evening alone.",
        2200,
      ),
      stay(
        "ghy-bungalow",
        "The planter's house at Chandmari",
        "heritage",
        "A 1930s house with eight rooms, a verandah down one side, and a cook who has been there thirty years.",
        5500,
      ),
    ],
    activities: [
      doing(
        "ghy-kamakhya-dawn",
        "Kamakhya before the queue",
        "A five o'clock start to be inside before the line reaches the road. The only way to see it without three hours of standing.",
        900,
        "3 hours",
      ),
      doing(
        "ghy-umananda",
        "Umananda island by country boat",
        "The smallest inhabited river island in the world, a Shiva temple on top of it, and golden langurs that are not remotely shy.",
        1100,
        "2 hours",
      ),
      doing(
        "ghy-kitchen",
        "An Assamese kitchen evening",
        "Cooked with a family in Beltola — khar, tenga, and the rice beer if the household makes it. Dinner is what you cooked.",
        2400,
        "4 hours",
      ),
    ],
  },

  Kaziranga: {
    stays: [
      stay(
        "kaz-standard",
        "A park-gate lodge at Kohora",
        "included",
        "Twelve rooms, hot water, and five minutes from the safari assembly point — which at half past four in the morning is the specification that matters.",
        0,
      ),
      stay(
        "kaz-bungalow",
        "A tea-bungalow room at Bagori",
        "heritage",
        "Four rooms in a working garden on the western edge of the park, with elephant grass at the end of the lawn.",
        3200,
      ),
      stay(
        "kaz-camp",
        "The riverside camp at Agoratoli",
        "camp",
        "Canvas on platforms above the Diphlu, walled in on three sides by forest. No wifi, deliberately.",
        4800,
      ),
    ],
    activities: [
      doing(
        "kaz-elephant",
        "Elephant-back safari, western range",
        "The only way into the tall grass a jeep cannot enter. Ninety minutes, booked months ahead, and strictly limited by the forest department.",
        3200,
        "90 minutes",
      ),
      doing(
        "kaz-dolphin",
        "Gangetic dolphin on the Brahmaputra",
        "A country boat out from Biswanath at first light. Sightings are good, not guaranteed — nothing wild ever is.",
        2600,
        "3 hours",
      ),
      doing(
        "kaz-karbi",
        "An evening in a Karbi village",
        "Weaving, rice beer and the drum, on the hill side of the highway rather than the park side.",
        1400,
        "3 hours",
      ),
    ],
  },

  Majuli: {
    stays: [
      stay(
        "maj-standard",
        "A bamboo cottage at Garamur",
        "included",
        "Raised on stilts, thatched, and cooler inside than anything with a concrete roof on the island.",
        0,
      ),
      stay(
        "maj-mishing",
        "The Mishing stilt house",
        "homestay",
        "Ours. A Mishing family's house on the north bank, four metres up on wooden stilts, with the river visible from the verandah.",
        1800,
        "mishing-stilt-house-majuli",
      ),
      stay(
        "maj-satra",
        "A guest room inside a satra",
        "lodge",
        "Two rooms kept for visitors inside the monastic compound. Prayer at four in the morning is not optional; it is thirty feet away.",
        2400,
      ),
    ],
    activities: [
      doing(
        "maj-mask",
        "A mask-making afternoon at Samaguri",
        "Hands on the bamboo and cow dung and clay, with the Goswami family who have made them for six generations.",
        1800,
        "3 hours",
      ),
      doing(
        "maj-cycle",
        "The island by bicycle",
        "Flat, unhurried, and the only sensible way to cover the distance between satras. Bicycles and a guide who knows the ferry timings.",
        900,
        "Half a day",
      ),
      doing(
        "maj-pottery",
        "Salmora pottery, thrown without a wheel",
        "Clay dug from the riverbank and shaped by hand and paddle, a technique the village has not changed and cannot export.",
        1200,
        "2 hours",
      ),
    ],
  },

  Jorhat: {
    stays: [
      stay(
        "jor-standard",
        "A town hotel near Gar-Ali",
        "included",
        "Functional, central, and ten minutes from the airport. The tea country is the point; this is where you sleep before it.",
        0,
      ),
      stay(
        "jor-bungalow",
        "The planter's bungalow at Gatoonga",
        "heritage",
        "Ours. A 1920s manager's house on a working estate — four vast rooms, ceiling fans older than the country, and a verandah the length of the building.",
        6500,
        "planters-bungalow-jorhat",
      ),
      stay(
        "jor-garden",
        "A garden guesthouse at Teok",
        "lodge",
        "Three rooms on a smallholding that sells its leaf to the big factories. Quieter, plainer, and half the price of a bungalow.",
        2600,
      ),
    ],
    activities: [
      doing(
        "jor-tasting",
        "A tasting with the estate's taster",
        "Fourteen cups, no swallowing, and a genuinely humbling forty minutes on how little most people can taste.",
        1600,
        "1 hour",
      ),
      doing(
        "jor-pluck",
        "Plucking, with the women who do it",
        "Dawn on the section, a basket, and about ninety minutes before you understand why it is paid by weight.",
        1200,
        "2 hours",
      ),
      doing(
        "jor-sivasagar",
        "The Ahom capitals at Sivasagar",
        "Talatal Ghar, Rang Ghar and the tank temples, driven as a day trip. Six hundred years of a kingdom almost nobody stops for.",
        3400,
        "Full day",
      ),
    ],
  },

  Manas: {
    stays: [
      stay(
        "man-standard",
        "A forest lodge at Bansbari",
        "included",
        "Inside the range gate, which means the dawn drive starts at the door rather than an hour before it.",
        0,
      ),
      stay(
        "man-camp",
        "Eco-camp on the Manas river",
        "camp",
        "Run by the villages that used to poach here, which is the whole story of this park in one sentence.",
        2800,
      ),
    ],
    activities: [
      doing(
        "man-raft",
        "Rafting the Manas",
        "Grade II, so it is a float rather than a fight, down from the Bhutan border with the forest on both banks.",
        2800,
        "3 hours",
      ),
      doing(
        "man-langur",
        "Golden langur tracking on foot",
        "Walked with a village guide on the Bhutan side of the river. There are perhaps six thousand of these left anywhere.",
        1600,
        "3 hours",
      ),
    ],
  },

  /* ---- Meghalaya ------------------------------------------------------ */
  Shillong: {
    stays: [
      stay(
        "shi-standard",
        "A hotel above Police Bazaar",
        "included",
        "Central, warm, and walkable to everything. Shillong's traffic makes central worth more than it sounds.",
        0,
      ),
      stay(
        "shi-cottage",
        "The Khasi cottage at Mawphlang",
        "homestay",
        "Ours. Stone and timber at the edge of the sacred grove, forty minutes out of town, with a wood stove in every room.",
        2400,
        "khasi-cottage-mawphlang",
      ),
      stay(
        "shi-colonial",
        "A colonial-era guesthouse in Laitumkhrah",
        "heritage",
        "Six rooms in a 1920s house with a fireplace that is lit, not decorative, and a garden of hydrangeas nobody planted deliberately.",
        3600,
      ),
    ],
    activities: [
      doing(
        "shi-music",
        "A Shillong music evening",
        "This city produces more working musicians per head than anywhere in India. An evening in a bar where the standard is genuinely high.",
        1200,
        "3 hours",
      ),
      doing(
        "shi-laitlum",
        "Laitlum canyon at first light",
        "Out before the cloud fills the gorge, which is a matter of an hour either way and entirely worth the alarm.",
        1400,
        "3 hours",
      ),
      doing(
        "shi-market",
        "Iewduh, the old market, with a cook",
        "The largest traditional market in the northeast, walked with somebody who can name the ferns and the fermented fish.",
        1500,
        "2 hours",
      ),
    ],
  },

  Sohra: {
    stays: [
      stay(
        "soh-standard",
        "A guesthouse on the Sohra plateau",
        "included",
        "Plain rooms, enormous windows, and cloud that comes through the room if you leave one open.",
        0,
      ),
      stay(
        "soh-resort",
        "A cliff-edge resort at Laitkynsew",
        "hotel",
        "Purpose-built, comfortable, and facing straight out over the Bangladesh plain. The view is the entire argument.",
        3400,
      ),
      stay(
        "soh-nongriat",
        "Riverside at Nongriat",
        "homestay",
        "Ours, and three thousand steps below the road — your bag comes down with you or not at all. The root bridges are a two-minute walk.",
        1200,
        "riverside-nongriat",
      ),
    ],
    activities: [
      doing(
        "soh-rainbow",
        "On to Rainbow Falls",
        "Another hour beyond the double-decker bridge, and the reason to stay the night down there rather than climb straight back.",
        1100,
        "3 hours",
      ),
      doing(
        "soh-caving",
        "A wild cave, not a lit one",
        "Mawmluh or Krem Dam with helmets and a caver, rather than the handrail-and-floodlight version at Mawsmai.",
        2600,
        "4 hours",
      ),
      doing(
        "soh-kayak",
        "Kayaking at Dawki",
        "Two hours on the Umngot, which is clear enough that the boat's shadow is on the riverbed nine feet down.",
        1900,
        "2 hours",
      ),
    ],
  },

  /* ---- Arunachal Pradesh --------------------------------------------- */
  Bhalukpong: {
    stays: [
      stay(
        "bha-standard",
        "A riverside lodge on the Kameng",
        "included",
        "The last comfortable night before the climb. The river is loud, and you will sleep anyway.",
        0,
      ),
      stay(
        "bha-camp",
        "Tented camp at Tipi",
        "camp",
        "Canvas above the river with an orchid research centre next door holding six hundred species.",
        1800,
      ),
    ],
    activities: [
      doing(
        "bha-orchid",
        "The Tipi orchid centre",
        "Six hundred species under one roof, most of them from within a hundred kilometres. Not a garden — a collection.",
        700,
        "1 hour",
      ),
      doing(
        "bha-angling",
        "An afternoon on the Kameng",
        "Catch and release for golden mahseer with a local ghillie. More sitting than catching, which is the point.",
        2200,
        "4 hours",
      ),
    ],
  },

  Dirang: {
    stays: [
      stay(
        "dir-standard",
        "A valley guesthouse at Dirang",
        "included",
        "Eight rooms, thick walls, and hot water that arrives when the sun has been on the tank.",
        0,
      ),
      stay(
        "dir-orchard",
        "An apple orchard homestay at Sangti",
        "homestay",
        "A Monpa family in the next valley, where the black-necked cranes winter. Butter tea on arrival, and it is not optional.",
        1600,
      ),
      stay(
        "dir-resort",
        "A hillside resort above the dzong",
        "hotel",
        "Heated rooms and glass facing the valley. In February that heating is worth more than the view.",
        3000,
      ),
    ],
    activities: [
      doing(
        "dir-hotspring",
        "The Dirang hot spring",
        "Sulphurous, scalding and entirely local. Bring a towel and no expectations of privacy.",
        600,
        "2 hours",
      ),
      doing(
        "dir-yak",
        "The National Yak Research Centre",
        "The only one in the country. Genuinely interesting, and the staff are delighted anybody came.",
        800,
        "2 hours",
      ),
      doing(
        "dir-sangti",
        "Sangti valley and the cranes",
        "A flat walk up a side valley that black-necked cranes have wintered in for as long as anyone has counted. November to March.",
        1400,
        "Half a day",
      ),
    ],
  },

  Tawang: {
    stays: [
      stay(
        "taw-standard",
        "A hotel below the monastery",
        "included",
        "Ten minutes' walk up to the gompa, heated, and with the only reliable hot water in town.",
        0,
      ),
      stay(
        "taw-monpa",
        "A Monpa family house in the old town",
        "homestay",
        "Three rooms above a working kitchen, a wood stove, and thukpa at every meal you are in for.",
        1400,
      ),
      stay(
        "taw-view",
        "A valley-view lodge at Gyangkhar",
        "lodge",
        "Twenty minutes out, twice the silence, and the whole Tawang chu valley from the breakfast table.",
        3200,
      ),
    ],
    activities: [
      doing(
        "taw-bumla",
        "Bum La and the border",
        "The pass at 4,633 metres and the handshake point with the Chinese post. A separate army permit, which we raise.",
        3600,
        "Full day",
      ),
      doing(
        "taw-nuns",
        "The Ani Gompa at Brahma-dung-chung",
        "A nunnery above the town, and a considerably quieter hour than the main monastery ever offers.",
        900,
        "2 hours",
      ),
      doing(
        "taw-craft",
        "The Monpa paper mill",
        "Handmade mon shugu paper from the daphne bush, a craft that had two practitioners left in 2010 and now has a workshop.",
        1000,
        "2 hours",
      ),
    ],
  },

  Ziro: {
    stays: [
      stay(
        "zir-standard",
        "A guesthouse at Hapoli",
        "included",
        "The town end of the valley, near everything, and warm in a place where that is not a given.",
        0,
      ),
      stay(
        "zir-apatani",
        "The Apatani home at Hong",
        "homestay",
        "Ours. A bamboo house in one of the largest villages in the valley, hearth in the middle, fish from the paddy outside.",
        1800,
        "apatani-home-ziro",
      ),
      stay(
        "zir-pine",
        "A pine-ridge cottage above Ziro Puto",
        "lodge",
        "Two cottages on the ridge, log fire, and the whole plateau under morning mist below you.",
        2800,
      ),
    ],
    activities: [
      doing(
        "zir-talley",
        "The Talley valley edge",
        "A day walk into wet evergreen forest at the rim of the plateau, through bamboo and clouded-leopard country.",
        1800,
        "Full day",
      ),
      doing(
        "zir-fields",
        "Paddy-cum-fish with an Apatani farmer",
        "Rice and fish farmed in the same flooded field without a machine anywhere. Walked with the person who does it.",
        1200,
        "3 hours",
      ),
    ],
  },

  Mechuka: {
    stays: [
      stay(
        "mec-standard",
        "A valley guesthouse at Mechuka",
        "included",
        "Basic, warm, and eight hundred kilometres from anywhere. That is the offer and it is a good one.",
        0,
      ),
      stay(
        "mec-memba",
        "A Memba family house",
        "homestay",
        "Two rooms, a hearth, and the Siyom audible through the wall all night.",
        1200,
      ),
    ],
    activities: [
      doing(
        "mec-gompa",
        "Samten Yongcha gompa",
        "Four hundred years old on the hill above the valley, and reached on foot because the road stops short.",
        800,
        "2 hours",
      ),
      doing(
        "mec-horse",
        "The valley on horseback",
        "Flat, wide, and covered the way it has always been covered. Half a day with a local horseman.",
        2200,
        "Half a day",
      ),
    ],
  },

  /* ---- Nagaland ------------------------------------------------------- */
  Kohima: {
    stays: [
      stay(
        "koh-standard",
        "A hotel in Kohima town",
        "included",
        "Central, heated, and within reach of the war cemetery on foot — which during Hornbill is worth more than any view.",
        0,
      ),
      stay(
        "koh-heritage",
        "A heritage house at Naga Bazaar",
        "heritage",
        "A stone house from the 1940s with six rooms, a fireplace, and the original tin roof it is still proud of.",
        2600,
      ),
      stay(
        "koh-morung",
        "A morung-style lodge at Kisama",
        "lodge",
        "Timber and thatch beside the heritage village. During the festival it is the difference between ten minutes and two hours of traffic.",
        3800,
      ),
    ],
    activities: [
      doing(
        "koh-cemetery",
        "The war cemetery with a historian",
        "The tennis court battle line is still marked in the lawn. An hour with somebody who can explain why it was fought over.",
        1200,
        "2 hours",
      ),
      doing(
        "koh-market",
        "Kohima's Sunday market",
        "Everything that can be eaten in these hills, and a good deal that most visitors would rather not know is eaten. Not for the squeamish.",
        800,
        "2 hours",
      ),
      doing(
        "koh-textile",
        "A Naga weaving workshop",
        "Loin-loom weaving with an Angami weaver. Every pattern encodes clan and status; none of it is decorative.",
        1800,
        "3 hours",
      ),
    ],
  },

  Khonoma: {
    stays: [
      stay(
        "kho-standard",
        "A village guesthouse at Khonoma",
        "included",
        "Run by the village council, four rooms, and every rupee of it stays in the community forest fund.",
        0,
      ),
      stay(
        "kho-angami",
        "The Angami house at Khonoma",
        "homestay",
        "Ours. A working household inside the old fort walls, with terraces below the window and a kitchen you are welcome in.",
        1600,
        "angami-house-khonoma",
      ),
    ],
    activities: [
      doing(
        "kho-forest",
        "The community conservation area on foot",
        "Eighty square kilometres the village took out of hunting in 1998, walked with one of the men who used to hunt it.",
        1400,
        "Half a day",
      ),
      doing(
        "kho-terrace",
        "Alder terraces and the rice cycle",
        "Why the terraces have stood for centuries without fertiliser, explained standing in one of them.",
        1000,
        "2 hours",
      ),
    ],
  },

  Mon: {
    stays: [
      stay(
        "mon-standard",
        "A guesthouse in Mon town",
        "included",
        "Plain and adequate. Everything about this district is about where you go from here, not where you sleep.",
        0,
      ),
      stay(
        "mon-konyak",
        "The Konyak longhouse at Longwa",
        "homestay",
        "Ours. A longhouse on the international boundary — the Angh's village, and the border runs through the house next door.",
        2200,
        "konyak-longhouse-mon",
      ),
    ],
    activities: [
      doing(
        "mon-angh",
        "An audience at the Angh's house",
        "The hereditary chief's morung, half in India and half in Myanmar. Arranged in advance and never guaranteed.",
        1800,
        "2 hours",
      ),
      doing(
        "mon-workshop",
        "Konyak gunsmiths and woodcarvers",
        "Homemade muzzle-loaders and log drums, made in the village by people who learned it from their fathers.",
        1200,
        "2 hours",
      ),
    ],
  },

  /* ---- Manipur -------------------------------------------------------- */
  Imphal: {
    stays: [
      stay(
        "imp-standard",
        "A hotel near Kangla",
        "included",
        "Walkable to the fort and the market, which in Imphal traffic is the whole specification.",
        0,
      ),
      stay(
        "imp-heritage",
        "A Meitei courtyard house",
        "heritage",
        "Four rooms around a central yard with a tulsi shrine in the middle of it, in the old quarter.",
        2400,
      ),
    ],
    activities: [
      doing(
        "imp-polo",
        "Polo at the Mapal Kangjeibung",
        "The oldest polo ground on earth, on Manipuri ponies thirteen hands high. Watching, or riding if you can.",
        2400,
        "3 hours",
      ),
      doing(
        "imp-raasleela",
        "An evening of Manipuri Ras Leela",
        "Four hundred years of a dance form that almost nobody outside the state has seen performed properly.",
        1600,
        "3 hours",
      ),
      doing(
        "imp-ima",
        "Ima Keithel with one of the Imas",
        "Five thousand women, five centuries, and no man permitted to trade. Walked with a stallholder rather than past her.",
        1000,
        "2 hours",
      ),
    ],
  },

  Loktak: {
    stays: [
      stay(
        "lok-standard",
        "A lakeside lodge at Sendra",
        "included",
        "Above the lake on the hill, with every phumdi in the basin laid out below the balcony.",
        0,
      ),
      stay(
        "lok-phumdi",
        "The phumdi hut on Loktak",
        "homestay",
        "Ours, and floating. A fisherman's hut on the vegetation mat itself — you will feel the lake move under the floor.",
        1400,
        "phumdi-hut-loktak",
      ),
    ],
    activities: [
      doing(
        "lok-dawn",
        "Dawn on the lake by shikara",
        "Out before the fishermen, which is a hard thing to arrange and worth every minute of the alarm.",
        1600,
        "3 hours",
      ),
      doing(
        "lok-sangai",
        "Keibul Lamjao and the sangai",
        "The only floating national park anywhere, and the last two hundred and sixty brow-antlered deer on earth.",
        1400,
        "Half a day",
      ),
    ],
  },

  /* ---- Mizoram -------------------------------------------------------- */
  Aizawl: {
    stays: [
      stay(
        "aiz-standard",
        "A hotel on the Aizawl ridge",
        "included",
        "Built down the hillside, as everything here is, so the lobby is on the fifth floor and your room is below it.",
        0,
      ),
      stay(
        "aiz-ridge",
        "The Mizo ridge house at Reiek",
        "homestay",
        "Ours. Timber on a ridge an hour out, with the ground dropping away on both sides and Bangladesh on a clear day.",
        1800,
        "mizo-ridge-house-reiek",
      ),
      stay(
        "aiz-view",
        "A Durtlang view room",
        "hotel",
        "North of town on the high ridge, facing down the whole spine of the city.",
        2200,
      ),
    ],
    activities: [
      doing(
        "aiz-choir",
        "A Sunday church choir",
        "Mizoram sings better than anywhere else in the country, in four-part harmony, and it is entirely unselfconscious about it.",
        0,
        "2 hours",
      ),
      doing(
        "aiz-weave",
        "Puanchei weaving at Thenzawl",
        "The loin loom and the fly-shuttle, in the town that supplies most of the state's cloth.",
        1400,
        "3 hours",
      ),
      doing(
        "aiz-bamboo",
        "Cheraw, the bamboo dance",
        "Four people, four bamboo poles and an alarming amount of trust. You will be asked to try it.",
        1200,
        "2 hours",
      ),
    ],
  },

  Phawngpui: {
    stays: [
      stay(
        "pha-standard",
        "The forest rest house at Farpak",
        "included",
        "Inside the national park, six rooms, and generator power for four hours a night. That is the whole of it.",
        0,
      ),
    ],
    activities: [
      doing(
        "pha-cliff",
        "The Thlazuang Khàm cliff walk",
        "Out to the sheer face above the Chhimtuipui, where the orchid meadows stop and the ground does too.",
        1200,
        "4 hours",
      ),
      doing(
        "pha-birding",
        "Blyth's tragopan at first light",
        "One of the best chances anywhere of seeing it. Cold, early, and no promises.",
        1600,
        "4 hours",
      ),
    ],
  },

  /* ---- Tripura -------------------------------------------------------- */
  Agartala: {
    stays: [
      stay(
        "agt-standard",
        "A hotel near Ujjayanta Palace",
        "included",
        "Central, comfortable and ten minutes from everything the city has.",
        0,
      ),
      stay(
        "agt-heritage",
        "A Manikya-era guesthouse",
        "heritage",
        "Six rooms in a royal outbuilding from the 1910s, with the original tilework and a garden that has been let go beautifully.",
        2400,
      ),
    ],
    activities: [
      doing(
        "agt-neermahal-boat",
        "Neermahal by boat at sunset",
        "The water palace lit from the shore as the light goes. Twenty minutes of crossing and the best of it.",
        900,
        "2 hours",
      ),
      doing(
        "agt-sepahijala",
        "Sepahijala and the spectacled langur",
        "A small sanctuary with a clouded leopard enclosure and the only spectacled langurs in the country.",
        1100,
        "Half a day",
      ),
      doing(
        "agt-border",
        "The Akhaura border ceremony",
        "The smaller, stranger cousin of Wagah, ten kilometres out of town, and far less of a circus.",
        800,
        "2 hours",
      ),
    ],
  },

  Unakoti: {
    stays: [
      stay(
        "una-standard",
        "A tourist lodge at Kailashahar",
        "included",
        "Plain rooms half an hour from the reliefs. There is nothing else within an hour, which settles it.",
        0,
      ),
      stay(
        "una-jampui",
        "The Tripuri house in the Jampui hills",
        "homestay",
        "Ours, and two hours further on. Orange groves, the highest ridge in the state, and cloud below the verandah.",
        1600,
        "tripuri-house-jampui",
      ),
    ],
    activities: [
      doing(
        "una-guide",
        "The reliefs with an archaeologist",
        "Nobody has fully explained this site. An hour with somebody who can at least explain why not.",
        1400,
        "2 hours",
      ),
      doing(
        "una-orange",
        "Jampui orange groves",
        "November to January, on the ridge, with the Lushai families who farm them.",
        1000,
        "3 hours",
      ),
    ],
  },

  /* ---- Sikkim --------------------------------------------------------- */
  Gangtok: {
    stays: [
      stay(
        "gan-standard",
        "A hotel off M.G. Marg",
        "included",
        "On the pedestrian street or one lane behind it, which in Gangtok is the only address worth having.",
        0,
      ),
      stay(
        "gan-townhouse",
        "The Gangtok town house",
        "homestay",
        "Ours. A family house in Development Area with five rooms, a Nepali kitchen, and the whole valley from the top floor.",
        2200,
        "gangtok-town-house",
      ),
      stay(
        "gan-heritage",
        "A heritage bungalow above the ridge",
        "heritage",
        "A 1930s residency with eight rooms, a library, and Kanchenjunga at breakfast when the sky allows it.",
        5500,
      ),
    ],
    activities: [
      doing(
        "gan-rumtek-monk",
        "Rumtek with a monk",
        "The Golden Stupa and the shedra, explained by somebody who lives there rather than read about it.",
        1600,
        "3 hours",
      ),
      doing(
        "gan-momo",
        "A momo and thukpa kitchen evening",
        "Folded badly, eaten well, in a family kitchen in Development Area.",
        1800,
        "3 hours",
      ),
      doing(
        "gan-ropeway",
        "The Gangtok ropeway and Ganesh Tok",
        "Ten minutes over the town and the best cheap view in the state.",
        700,
        "2 hours",
      ),
    ],
  },

  Lachung: {
    stays: [
      stay(
        "lac-standard",
        "A valley lodge at Lachung",
        "included",
        "Wood-panelled, bukhari stove in the room, and hot water in buckets when the pipes freeze. They will freeze.",
        0,
      ),
      stay(
        "lac-riverside",
        "A riverside cottage at Lachung",
        "lodge",
        "Four rooms above the Lachung chu, with the river loud enough to sleep through everything else.",
        2400,
      ),
    ],
    activities: [
      doing(
        "lac-zeropoint",
        "On to Zero Point",
        "4,700 metres and the end of the civilian permit. Snow year-round, and about twenty minutes is enough.",
        2200,
        "3 hours",
      ),
      doing(
        "lac-katao",
        "Katao, the quiet valley",
        "Twenty-eight kilometres up a military road, far emptier than Yumthang, and open only when the army says so.",
        2600,
        "Half a day",
      ),
    ],
  },

  Lachen: {
    stays: [
      stay(
        "lch-standard",
        "A guesthouse at Lachen",
        "included",
        "Basic and warm, and you will be leaving it at half past three in the morning anyway.",
        0,
      ),
      stay(
        "lch-lodge",
        "A heated lodge above the village",
        "lodge",
        "Proper heating and oxygen on hand, which at 2,700 metres before a 5,400-metre morning is not an indulgence.",
        2800,
      ),
    ],
    activities: [
      doing(
        "lch-chopta",
        "Chopta valley on the way back",
        "A wide glacial bowl at 4,000 metres, in rhododendron flower through May, and almost nobody stops.",
        1400,
        "2 hours",
      ),
    ],
  },

  Pelling: {
    stays: [
      stay(
        "pel-standard",
        "A Pelling hotel facing the massif",
        "included",
        "West-facing rooms, which is the only orientation in this town that matters.",
        0,
      ),
      stay(
        "pel-retreat",
        "A hillside retreat at Rimbi",
        "lodge",
        "Twenty minutes below the town, quieter, with the waterfall audible from the terrace.",
        2600,
      ),
      stay(
        "pel-heritage",
        "A heritage lodge near Pemayangtse",
        "heritage",
        "Eight rooms, log fires, and Kanchenjunga filling the window at dawn when the sky is clear.",
        4800,
      ),
    ],
    activities: [
      doing(
        "pel-skywalk",
        "The glass skywalk and Chenrezig",
        "A hundred and thirty-seven feet of statue and a glass floor beneath your boots. Unsubtle, and enjoyable for it.",
        900,
        "2 hours",
      ),
      doing(
        "pel-khecheopalri",
        "Khecheopalri, the wishing lake",
        "Sacred to Buddhists and Lepchas alike, and famous for the fact that no leaf ever settles on the water.",
        1200,
        "3 hours",
      ),
      doing(
        "pel-rabdentse",
        "Rabdentse ruins at dusk",
        "The second capital of Sikkim, in forest, twenty minutes' walk from the road and almost always empty.",
        800,
        "2 hours",
      ),
    ],
  },

  Yuksom: {
    stays: [
      stay(
        "yuk-standard",
        "A trekkers' lodge at Yuksom",
        "included",
        "The Goecha La trailhead, so the beds are made for people who will be up at five.",
        0,
      ),
      stay(
        "yuk-lepcha",
        "The Lepcha house at Yuksom",
        "homestay",
        "Ours. A family house in cardamom terraces, with a kitchen that feeds trekkers properly and a garden of orchids nobody planted.",
        1800,
        "lepcha-house-yuksom",
      ),
    ],
    activities: [
      doing(
        "yuk-dubdi",
        "Dubdi monastery on foot",
        "The oldest monastery in Sikkim, 1701, up through cardamom and forest. An hour and a half, mostly uphill.",
        900,
        "3 hours",
      ),
      doing(
        "yuk-cardamom",
        "A cardamom farm walk",
        "Large black cardamom under alder shade, and the smoke-drying sheds that give it the flavour.",
        1000,
        "2 hours",
      ),
    ],
  },
};

/**
 * The fallback. Dull on purpose — a day with no options at all reads as
 * broken, and these three read as a place we have not written up yet, which
 * is the truth.
 */
const GENERIC: PlaceOptions = {
  stays: [
    stay(
      "gen-standard",
      "The room the trip price already covers",
      "included",
      "Twin-share, chosen by us, and always the best of what is actually available in the place you are sleeping.",
      0,
    ),
    stay(
      "gen-upgrade",
      "The best room in the place",
      "hotel",
      "Where there is something better locally, we book it. Where there is not, we will say so rather than charge you for a view of the car park.",
      2400,
    ),
  ],
  activities: [
    doing(
      "gen-guide",
      "A second guide for the day",
      "A local walking guide in addition to the one travelling with you, for anywhere the language changes.",
      2200,
      "Full day",
    ),
  ],
};

/* ---------------------------------------------------------------------- */
/* Gateways                                                                */
/* ---------------------------------------------------------------------- */

/**
 * Where we meet you and where we drop you.
 *
 * None of these cost anything, and that is the point of asking. A pickup is
 * a pickup; what the operator needs is *which building*, and a form that
 * only offers "airport transfer, included" gets a phone call the next day
 * asking which train the traveller is on.
 */
const meet = (
  id: string,
  name: string,
  blurb: string,
  price = 0,
): TransferOption => ({ id, name, blurb, price });

const GUWAHATI_IN: TransferOption[] = [
  meet(
    "gau-air",
    "Guwahati airport (GAU)",
    "Met inside arrivals with a board. Twenty-five minutes into the city.",
  ),
  meet(
    "gau-rail",
    "Guwahati railway station (GHY)",
    "Met on the concourse at Paltan Bazar. Tell us the train number and we will track it.",
  ),
  meet(
    "gau-hotel",
    "A hotel in the city",
    "Already in Guwahati. Give us the address and a time and we will be outside it.",
  ),
  meet(
    "gau-own",
    "We will make our own way",
    "No vehicle sent. You meet the group at the first night's hotel.",
  ),
];

const GUWAHATI_OUT: TransferOption[] = [
  meet(
    "gau-out-air",
    "Guwahati airport (GAU)",
    "Allow three hours before an international connection, two for a domestic.",
  ),
  meet(
    "gau-out-rail",
    "Guwahati railway station (GHY)",
    "Dropped at Paltan Bazar, ninety minutes before departure.",
  ),
  meet(
    "gau-out-own",
    "Leave us in the city",
    "Dropped anywhere in Guwahati you would rather be.",
  ),
];

export const GATEWAY_POINTS: Record<
  StateSlug,
  { pickups: TransferOption[]; drops: TransferOption[] }
> = {
  assam: { pickups: GUWAHATI_IN, drops: GUWAHATI_OUT },
  meghalaya: { pickups: GUWAHATI_IN, drops: GUWAHATI_OUT },
  "arunachal-pradesh": { pickups: GUWAHATI_IN, drops: GUWAHATI_OUT },
  nagaland: {
    pickups: [
      meet(
        "dmu-air",
        "Dimapur airport (DMU)",
        "Met at arrivals. Two and a half hours up to Kohima.",
      ),
      meet(
        "dmu-rail",
        "Dimapur railway station",
        "Met on the platform. The overnight from Guwahati gets in at six.",
      ),
      meet(
        "gau-air-naga",
        "Guwahati airport (GAU)",
        "The long way in — eight hours by road, and a considerably better introduction to the hills.",
      ),
      meet(
        "dmu-own",
        "We will make our own way",
        "No vehicle sent. You meet the group in Kohima.",
      ),
    ],
    drops: [
      meet(
        "dmu-out-air",
        "Dimapur airport (DMU)",
        "Three hours down from Kohima, and the road does not care about your flight.",
      ),
      meet(
        "dmu-out-rail",
        "Dimapur railway station",
        "For the overnight back to Guwahati.",
      ),
      meet("dmu-out-own", "Leave us in Dimapur", "Dropped in town."),
    ],
  },
  manipur: {
    pickups: [
      meet(
        "imf-air",
        "Imphal airport (IMF)",
        "Met at arrivals. Fifteen minutes into the city.",
      ),
      meet(
        "imf-own",
        "We will make our own way",
        "No vehicle sent. You meet the group at the first hotel.",
      ),
    ],
    drops: [
      meet(
        "imf-out-air",
        "Imphal airport (IMF)",
        "Twenty minutes from anywhere in the city.",
      ),
      meet("imf-out-own", "Leave us in Imphal", "Dropped wherever suits."),
    ],
  },
  mizoram: {
    pickups: [
      meet(
        "ajl-air",
        "Lengpui airport, Aizawl (AJL)",
        "Met at arrivals. An hour up onto the ridge.",
      ),
      meet(
        "ajl-own",
        "We will make our own way",
        "No vehicle sent. You meet the group in Aizawl.",
      ),
    ],
    drops: [
      meet(
        "ajl-out-air",
        "Lengpui airport (AJL)",
        "Ninety minutes down, and the road is slower than the map.",
      ),
      meet("ajl-out-own", "Leave us in Aizawl", "Dropped in town."),
    ],
  },
  tripura: {
    pickups: [
      meet(
        "ixa-air",
        "Agartala airport (IXA)",
        "Met at arrivals. Twenty minutes into the city.",
      ),
      meet("ixa-rail", "Agartala railway station", "Met on the concourse."),
      meet(
        "ixa-own",
        "We will make our own way",
        "No vehicle sent. You meet the group at the first hotel.",
      ),
    ],
    drops: [
      meet(
        "ixa-out-air",
        "Agartala airport (IXA)",
        "Twenty-five minutes from the city.",
      ),
      meet(
        "ixa-out-rail",
        "Agartala railway station",
        "For the line down to Sabroom or up to Silchar.",
      ),
      meet("ixa-out-own", "Leave us in Agartala", "Dropped in town."),
    ],
  },
  sikkim: {
    pickups: [
      meet(
        "ixb-air",
        "Bagdogra airport (IXB)",
        "Met at arrivals. Four to five hours up the Teesta to Gangtok.",
      ),
      meet(
        "njp-rail",
        "New Jalpaiguri station (NJP)",
        "Met at the taxi stand. Same drive, twenty minutes further out.",
      ),
      meet(
        "ixb-heli",
        "Bagdogra, then the Gangtok helicopter",
        "Thirty minutes instead of five hours, weather permitting — and it frequently does not permit. Charged separately at cost.",
        0,
      ),
      meet(
        "ixb-own",
        "We will make our own way",
        "No vehicle sent. You meet the group in Gangtok.",
      ),
    ],
    drops: [
      meet(
        "ixb-out-air",
        "Bagdogra airport (IXB)",
        "Allow five hours from Gangtok. Do not book a flight before two.",
      ),
      meet(
        "njp-out-rail",
        "New Jalpaiguri station (NJP)",
        "For the overnight down to Kolkata.",
      ),
      meet(
        "ixb-out-own",
        "Leave us in Siliguri",
        "Dropped in town, for onward buses to Darjeeling or Nepal.",
      ),
    ],
  },
};

/**
 * Vehicle choices on a day with a real road transfer.
 *
 * Only offered where the day actually covers distance — putting "which
 * vehicle" on a day spent walking around one village is the kind of question
 * that makes a form feel automated.
 */
export const VEHICLE_OPTIONS: TransferOption[] = [
  {
    id: "veh-included",
    name: "The vehicle we already booked",
    blurb:
      "A private air-conditioned SUV with a driver from the state. Included in the trip price.",
    price: 0,
  },
  {
    id: "veh-premium",
    name: "A premium SUV for the day",
    blurb:
      "A Fortuner or equivalent — more clearance, better seats, and a noticeably quieter cabin on a long hill day.",
    price: 3500,
  },
  {
    id: "veh-van",
    name: "A tempo traveller for the party",
    blurb:
      "Worth it above five people: everyone gets a window, and the luggage stops travelling on laps.",
    price: 4500,
  },
];

/** The distance, in kilometres, above which a day is a transfer day. */
export const TRANSFER_DAY_KM = 60;

export function optionsForPlace(place: string | null): PlaceOptions {
  if (!place) return GENERIC;
  return PLACE_OPTIONS[place] ?? GENERIC;
}
