import type { Destination, StateSlug } from "./types";

/**
 * The eight states. Order is deliberate: it runs roughly west to east, which
 * is how the horizontal scroll on the home page reads.
 */
const destinations: Destination[] = [
  {
    slug: "sikkim",
    name: "Sikkim",
    tagline: "Kanchenjunga at dawn, and monasteries above the cloud line",
    intro:
      "India's least populous state packs eight thousand metres of vertical range into an area smaller than Delhi. You can be in subtropical forest at breakfast and standing on frozen lake ice by mid-afternoon.",
    body: [
      "Sikkim rewards travellers who slow down. The state banned single-use plastics before it was fashionable, farms entirely organically, and has a road network that punishes anyone in a hurry. What it offers in return is a Himalaya that still feels inhabited rather than staged — villages with working monasteries, valleys where cardamom drying racks line the road, and a view of Kanchenjunga that on a clear October morning is genuinely difficult to look away from.",
      "North Sikkim requires a permit even for Indian nationals, and Nathu La and Gurudongmar add further layers. We handle all of it. What you need to bring is a tolerance for switchbacks and a jacket heavier than you think you need.",
    ],
    region: "sikkim",
    tint: "cloud",
    requiresILP: true,
    requiresPAP: true,
    bestMonths: ["March", "April", "May", "October", "November"],
    gateway: "Bagdogra (IXB) or New Jalpaiguri (NJP)",
    knownFor: [
      "Kanchenjunga",
      "Gurudongmar Lake",
      "Rumtek Monastery",
      "Yumthang Valley",
    ],
    heroAlt:
      "First light on Kanchenjunga seen across terraced fields above Pelling, west Sikkim",
  },
  {
    slug: "assam",
    name: "Assam",
    tagline: "The Brahmaputra, one-horned rhino, and tea to the horizon",
    intro:
      "Assam is the Northeast's front door and its river. The Brahmaputra is so wide in places that the far bank disappears, and everything about the state — its tea, its rice, its politics — is organised around it.",
    body: [
      "Kaziranga holds two-thirds of the world's greater one-horned rhinoceros. Majuli, upstream, is one of the largest river islands anywhere and home to the satras, monastic institutions where Vaishnavite dance and mask-making have been practised continuously since the sixteenth century.",
      "Assam is also the easiest state in the region to travel: good roads, frequent flights into Guwahati and Jorhat, no permits, and a tea-estate bungalow tradition that produces some of the most comfortable accommodation in eastern India.",
    ],
    region: "assam",
    tint: "muga",
    requiresILP: false,
    requiresPAP: false,
    bestMonths: ["November", "December", "January", "February", "March"],
    gateway: "Guwahati (GAU)",
    knownFor: ["Kaziranga", "Majuli", "Kamakhya", "Tea estates"],
    heroAlt:
      "Morning mist over elephant grass in Kaziranga National Park, central Assam",
  },
  {
    slug: "meghalaya",
    name: "Meghalaya",
    tagline: "Living root bridges under the wettest sky on earth",
    intro:
      "Cherrapunji and Mawsynram trade the title of wettest inhabited place on earth between them. The rain has carved the Khasi hills into gorges, waterfalls and the longest cave systems in the subcontinent.",
    body: [
      "The living root bridges of the Khasi and Jaintia hills are grown, not built: ficus elastica roots trained across a stream over decades until they carry weight. The double-decker at Nongriat is the famous one, and it costs three thousand steps down and three thousand back.",
      "Meghalaya is also the region's cleanest introduction to matrilineal society — property passes through the youngest daughter — and to Khasi and Garo food, which is more austere and more interesting than its neighbours'.",
    ],
    region: "meghalaya",
    tint: "cloud",
    requiresILP: false,
    requiresPAP: false,
    bestMonths: ["October", "November", "December", "February", "March"],
    gateway: "Guwahati (GAU), then 3 hours by road",
    knownFor: ["Living root bridges", "Dawki", "Mawlynnong", "Laitlum Canyon"],
    heroAlt:
      "The double-decker living root bridge at Nongriat, grown from ficus roots across a stream in the Khasi hills",
  },
  {
    slug: "arunachal-pradesh",
    name: "Arunachal Pradesh",
    tagline: "Tawang, Ziro, and the last road before Tibet",
    intro:
      "The largest of the eight states and the emptiest. Twenty-six major tribes, more than a hundred languages, and passes that stay closed for months. Arunachal is where Northeast India stops being a holiday and starts being an expedition.",
    body: [
      "Tawang sits at 3,048 metres behind Sela Pass and holds the largest monastery in India. Ziro, in the Apatani valley, is a UNESCO tentative-list cultural landscape where wet rice and fish are farmed in the same paddy field. Between them lie some of the worst and most rewarding roads on the subcontinent.",
      "Every visitor — Indian or foreign — needs a permit, and the state is strict about it. Plan long. Nothing here is reachable in a single day from anywhere.",
    ],
    region: "arunachal",
    tint: "paddy",
    requiresILP: true,
    requiresPAP: true,
    bestMonths: ["March", "April", "May", "September", "October"],
    gateway: "Guwahati (GAU) or Dibrugarh (DIB)",
    knownFor: ["Tawang", "Ziro valley", "Sela Pass", "Namdapha"],
    heroAlt:
      "Terraced rice fields of the Apatani valley at Ziro, Arunachal Pradesh, with bamboo groves on the ridges",
  },
  {
    slug: "nagaland",
    name: "Nagaland",
    tagline: "Sixteen tribes, one hornbill, and the loudest December in India",
    intro:
      "Nagaland's Hornbill Festival gathers sixteen tribes into one week at Kisama, and it is the single best introduction to Naga material culture there is — shawls, log drums, morungs, and food that will reorder your idea of Indian cooking.",
    body: [
      "Beyond December, Nagaland is quieter and better. Khonoma, the green village, banned hunting on its own land and now runs its forest as a community conservation area. Longwa straddles the Myanmar border so precisely that the Angh's house has a room in each country.",
      "The textile tradition here is the strongest in the region: every Naga shawl pattern encodes clan, status and achievement, and none of it is decorative.",
    ],
    region: "nagaland",
    tint: "cherry",
    requiresILP: true,
    requiresPAP: false,
    bestMonths: ["October", "November", "December", "January"],
    gateway: "Dimapur (DMU) or Guwahati (GAU)",
    knownFor: ["Hornbill Festival", "Khonoma", "Longwa", "Dzükou Valley"],
    heroAlt:
      "Morung carvings and log drum at Kisama heritage village outside Kohima, Nagaland",
  },
  {
    slug: "manipur",
    name: "Manipur",
    tagline: "Floating islands on Loktak and the birthplace of polo",
    intro:
      "Loktak Lake carries phumdis — floating mats of vegetation thick enough to build on — and the world's only floating national park, home to the sangai deer. Manipur invented polo, and still plays it on ponies half the size of the English kind.",
    body: [
      "Imphal's Ima Keithel is run entirely by women, several thousand of them, and has been for around five centuries. It is the largest market of its kind anywhere.",
      "Manipur asks more of a traveller than its neighbours and gives more back. Check current advisories before you commit; we monitor them continuously and will tell you plainly if a departure should not run.",
    ],
    region: "manipur",
    tint: "loktak",
    requiresILP: true,
    requiresPAP: false,
    bestMonths: ["October", "November", "December", "January", "February"],
    gateway: "Imphal (IMF)",
    knownFor: ["Loktak Lake", "Ima Keithel", "Keibul Lamjao", "Manipuri dance"],
    heroAlt:
      "Circular floating phumdi islands on Loktak Lake at dawn, Manipur, with a fisherman's hut on one of them",
  },
  {
    slug: "mizoram",
    name: "Mizoram",
    tagline: "Ridge-top towns, bamboo forest, and the quietest roads east",
    intro:
      "Mizoram is built along ridgelines — Aizawl runs down a spine at 1,100 metres with the valley falling away on both sides. It has the second-highest literacy rate in India and, on a Sunday, some of the emptiest streets.",
    body: [
      "Phawngpui, the Blue Mountain, is the state's high point and a national park of orchid meadows and cliff faces. The Vantawng falls and the bamboo forests of the south see almost no visitors.",
      "Mizo hospitality is understated and the puanchei — the ceremonial wraparound — is one of the finest weaves in the region.",
    ],
    region: "mizoram",
    tint: "paddy",
    requiresILP: true,
    requiresPAP: false,
    bestMonths: ["October", "November", "December", "January", "March"],
    gateway: "Lengpui, Aizawl (AJL)",
    heroAlt:
      "Aizawl's houses stacked along a ridge above cloud-filled valleys, Mizoram",
    knownFor: ["Aizawl", "Phawngpui", "Reiek", "Vantawng falls"],
  },
  {
    slug: "tripura",
    name: "Tripura",
    tagline: "Palaces, rock reliefs, and a kingdom that lasted five centuries",
    intro:
      "Tripura was ruled by the Manikya dynasty for over five hundred years, and it shows: Ujjayanta Palace in Agartala, the water palace at Neermahal, and the extraordinary rock-cut reliefs at Unakoti.",
    body: [
      "Unakoti is the reason to come. Vast Shaiva figures carved directly into a hillside, some over nine metres tall, dated somewhere between the seventh and ninth centuries and still not fully explained.",
      "Tripura is small, warm, easy to reach and almost entirely absent from Northeast itineraries. That is exactly why it is worth three days.",
    ],
    region: "tripura",
    tint: "muga",
    requiresILP: false,
    requiresPAP: false,
    bestMonths: ["November", "December", "January", "February", "March"],
    gateway: "Agartala (IXA)",
    knownFor: ["Unakoti", "Neermahal", "Ujjayanta Palace", "Jampui Hills"],
    heroAlt:
      "The nine-metre rock-cut face of Unakotiswara Kal Bhairava carved into the hillside at Unakoti, Tripura",
  },
];

const bySlug = new Map(destinations.map((d) => [d.slug, d]));

export function getDestinations(): Destination[] {
  return destinations;
}

export function getDestinationBySlug(slug: string): Destination | undefined {
  return bySlug.get(slug as StateSlug);
}

export function getDestinationName(slug: StateSlug): string {
  return bySlug.get(slug)?.name ?? slug;
}

/** States that need an Inner Line Permit for Indian nationals. */
export function getILPStates(): Destination[] {
  return destinations.filter((d) => d.requiresILP);
}
