import type { Activity } from "./types";

/**
 * Day activities, all of them within reach of Guwahati.
 *
 * These are the half-days and evenings that fill the gaps a guided trip
 * leaves — the afternoon before the flight, the spare morning in the city,
 * the Sunday somebody arrives early. They are deliberately local: every one
 * is reachable and back the same day from Guwahati, because that is where
 * almost everybody lands and where almost everybody has a spare half-day.
 *
 * They are sold per person and booked as part of a trip rather than in
 * isolation, which is why each one carries a meeting point and a time of day
 * rather than a departure date.
 *
 * Prices are the real shape of what these cost to run — a jeep and a forest
 * fee for Pobitora, a boat and a boatman for Umananda — and the client
 * confirms the figures before launch.
 */

const activities: Activity[] = [
  {
    slug: "brahmaputra-sunset-cruise",
    name: "Sunset on the Brahmaputra",
    strapline: "Two hours on the widest river in India as the light goes",
    category: "water",
    locality: "Kachari Ghat, Guwahati",
    durationLabel: "2 hours",
    durationHours: 2,
    distanceKm: 0,
    bestTime: "Boards at 4.30pm, back by sunset",
    fromPrice: 1200,
    groupSizeMax: 40,
    meetingPoint: "Kachari Ghat jetty, ten minutes from Paltan Bazar",
    intro:
      "The Brahmaputra is eight kilometres wide in places and you cannot understand that from the bank. An hour out on it, with the city going gold on one side and nothing at all on the other, is the cheapest and best introduction to Assam there is.",
    body: [
      "The boat leaves Kachari Ghat in the late afternoon and works upstream past the Umananda rock, the Saraighat bridge and the sandbars that move every monsoon. The crew will point out the river dolphins if they are surfacing, which between October and March they usually are.",
      "It is a working river rather than a scenic one, and that is the point: ferries, sand barges and fishing boats all cross in front of you, and the sun goes down behind the Nilachal hills at the far end of the reach.",
    ],
    highlights: [
      "Gangetic river dolphin, October to March",
      "Umananda island from the water",
      "Sunset behind the Nilachal hills",
    ],
    includes: [
      "Seat on the scheduled sunset departure",
      "A guide from the city on board",
      "Tea and light snacks",
    ],
    excludes: ["Transfers to the ghat", "Drinks beyond the tea served"],
    heroAlt:
      "A wooden boat on the Brahmaputra at dusk with the Guwahati bank behind it",
    featured: true,
  },
  {
    slug: "umananda-island",
    name: "Umananda island by country boat",
    strapline:
      "The smallest inhabited river island in the world, ten minutes offshore",
    category: "water",
    locality: "Umananda Ghat, Guwahati",
    durationLabel: "2 hours",
    durationHours: 2,
    distanceKm: 0,
    bestTime: "Best before 10am, before the day heats up",
    fromPrice: 900,
    groupSizeMax: 12,
    meetingPoint: "Umananda Ghat, below the Kachari Ghat car park",
    intro:
      "A rock in the middle of the Brahmaputra with a Shiva temple on top of it, a population of about ten, and a troop of golden langurs that were introduced in the 1990s and have no intention of leaving.",
    body: [
      "The crossing takes ten minutes in a country boat and the climb up is a hundred and twenty steps. The temple is seventeenth century, rebuilt after the 1897 earthquake, and carved with figures that predate the rebuild by a long way.",
      "The langurs are the reason to go early: they come down for the first hour of the day and disappear into the trees once it is warm.",
    ],
    highlights: [
      "Golden langur, one of the rarest primates in India",
      "Umananda temple and its earlier carvings",
      "The city skyline from midstream",
    ],
    includes: ["Return country boat", "Temple entry", "A guide from the city"],
    excludes: ["Transfers to the ghat", "Camera fees where charged"],
    heroAlt:
      "A country boat crossing to the wooded rock of Umananda island in the Brahmaputra",
  },
  {
    slug: "kamakhya-dawn",
    name: "Kamakhya before the queue",
    strapline:
      "A five o'clock start to be inside before the line reaches the road",
    category: "heritage",
    locality: "Nilachal hill, Guwahati",
    durationLabel: "3 hours",
    durationHours: 3,
    distanceKm: 0,
    bestTime: "Leaves at 5am; the queue is impossible by nine",
    fromPrice: 900,
    groupSizeMax: 10,
    meetingPoint: "Picked up from your hotel in the city",
    intro:
      "The most important Shakta temple in the country and the single most visited building in Assam. The only way to see it rather than queue for it is to be at the gate before dawn, which is what this is.",
    body: [
      "Kamakhya sits on Nilachal hill above the river and has been rebuilt repeatedly since the eighth century; the current structure is Ahom, from 1565. The sanctum holds no image, which is the whole theological point and the thing most visitors are never told.",
      "Your guide is from the city and will explain what is happening rather than walk you past it — the goat sacrifices included, which some travellers would rather avoid and should say so when booking.",
    ],
    highlights: [
      "Inside before the crowd, most mornings",
      "The Ahom rebuilding and the earlier carvings",
      "The city and the river from the hill",
    ],
    includes: [
      "Hotel pickup and return",
      "A guide from Guwahati",
      "Temple entry",
    ],
    excludes: ["Fast-track darshan tickets", "Offerings"],
    heroAlt:
      "The temple complex on Nilachal hill above Guwahati at first light",
    featured: true,
  },
  {
    slug: "pobitora-safari",
    name: "Rhino at Pobitora",
    strapline:
      "The densest rhino population on earth, an hour and a half from the city",
    category: "wildlife",
    locality: "Pobitora Wildlife Sanctuary, 50 km east",
    durationLabel: "Half day",
    durationHours: 5,
    distanceKm: 50,
    bestTime: "November to April; dawn departure",
    fromPrice: 3200,
    groupSizeMax: 6,
    meetingPoint: "Picked up from your hotel at 5.30am",
    intro:
      "Thirty-eight square kilometres holding more greater one-horned rhinoceros per square kilometre than anywhere in the world, including Kaziranga. If you have one morning and want to see a rhino, this is the better bet.",
    body: [
      "The jeep works the grassland circuit for two hours from first light. Rhino are close to guaranteed here in a way they are nowhere else, and the wetland at the edge of the sanctuary carries enormous numbers of wintering duck between December and February.",
      "It is small, and that is its limitation as well as its strength: you will not have the sense of scale Kaziranga gives you, and you will be back in the city for lunch.",
    ],
    highlights: [
      "Greater one-horned rhinoceros, near certain in season",
      "Wintering waterfowl on the Rajamayong beel",
      "Back in Guwahati by early afternoon",
    ],
    includes: [
      "Private vehicle from Guwahati and back",
      "Jeep safari and forest entry",
      "A naturalist for the drive",
    ],
    excludes: ["Camera fees", "Meals"],
    heroAlt:
      "Tall elephant grass at Pobitora with a figure watching from the track",
    featured: true,
  },
  {
    slug: "deepor-beel-birding",
    name: "Deepor Beel at first light",
    strapline:
      "A Ramsar wetland on the edge of the city, best before the traffic",
    category: "wildlife",
    locality: "Deepor Beel, 13 km west",
    durationLabel: "Half day",
    durationHours: 4,
    distanceKm: 13,
    bestTime: "November to March, from 6am",
    fromPrice: 1800,
    groupSizeMax: 8,
    meetingPoint: "Picked up from your hotel at 5.45am",
    intro:
      "The only Ramsar site in Assam, and the last permanent freshwater lake the Brahmaputra has left near Guwahati. Two hundred and nineteen bird species have been counted on it, and the good ones are all early.",
    body: [
      "You walk the southern bund with a local birder while the mist is still on the water — lesser adjutant, spot-billed pelican, and in a good winter the greater adjutant, of which perhaps twelve hundred remain anywhere.",
      "It is also a lesson in what the city is doing to itself: the railway line, the landfill and the encroachment on the western edge are all visible from the same bund, and your guide will not pretend otherwise.",
    ],
    highlights: [
      "Greater adjutant stork, one of the rarest storks on earth",
      "Pelican and open-bill colonies in winter",
      "Elephants crossing the railway line, with luck",
    ],
    includes: [
      "Private vehicle and return",
      "A local birding guide",
      "Use of a spotting scope",
    ],
    excludes: ["Binoculars", "Breakfast"],
    heroAlt:
      "Still water at Deepor Beel at dawn with a single figure on the bund",
  },
  {
    slug: "sualkuchi-silk",
    name: "Sualkuchi, the silk village",
    strapline: "Where Assam's muga and pat silk is actually woven",
    category: "culture",
    locality: "Sualkuchi, 35 km north-west",
    durationLabel: "Half day",
    durationHours: 5,
    distanceKm: 35,
    bestTime: "Any morning except Sunday",
    fromPrice: 1600,
    groupSizeMax: 8,
    meetingPoint: "Picked up from your hotel at 9am",
    intro:
      "A town on the north bank where most of the households weave, and where the golden muga silk that only exists in Assam is made on handlooms you can stand next to.",
    body: [
      "You will sit with a weaving family rather than tour a showroom. Muga takes its colour from the silkworm rather than a dye, cannot be produced anywhere else, and a mekhela chador can take a fortnight on the loom — all of which is easier to believe when the loom is in front of you.",
      "Buying is entirely optional and nobody will work on you. If you do want to, your guide will tell you what a fair price is, which is the part a showroom will not.",
    ],
    highlights: [
      "Muga, pat and eri silk on the handloom",
      "A weaving household rather than a showroom",
      "The north bank ferry crossing, water permitting",
    ],
    includes: [
      "Private vehicle and return",
      "A guide from the region",
      "The visit with a weaving family",
    ],
    excludes: ["Anything you buy", "Meals"],
    heroAlt:
      "A handloom in a Sualkuchi weaving household, north bank of the Brahmaputra",
  },
  {
    slug: "chandubi-lake",
    name: "Chandubi lake and the Rabha villages",
    strapline:
      "A lake made by an earthquake, and the people who farm around it",
    category: "water",
    locality: "Chandubi, 60 km south",
    durationLabel: "Full day",
    durationHours: 8,
    distanceKm: 60,
    bestTime: "October to March",
    fromPrice: 2800,
    groupSizeMax: 10,
    meetingPoint: "Picked up from your hotel at 8am",
    intro:
      "The 1897 earthquake dropped a patch of forest and the water filled it. What is left is a quiet lagoon against the Meghalaya foothills, with Rabha and Garo villages around it and almost no visitors on a weekday.",
    body: [
      "The day is a slow one: a country boat on the lake, a walk through the village, lunch cooked by a Rabha family, and the drive back through the foothills. Birdlife on the water is good all winter.",
      "There is nothing to see in the sense of a monument. It is a day for people who want to be somewhere ordinary and well outside the city, which is exactly what it is.",
    ],
    highlights: [
      "Country boat on the lake",
      "Lunch with a Rabha household",
      "The Meghalaya foothills from the Assam side",
    ],
    includes: [
      "Private vehicle and return",
      "Boat on the lake",
      "Lunch in the village",
      "A guide from the region",
    ],
    excludes: ["Drinks", "Anything you buy in the village"],
    heroAlt:
      "The still water of Chandubi lake below the forested Meghalaya foothills",
  },
  {
    slug: "guwahati-food-walk",
    name: "Eating through Fancy Bazaar",
    strapline: "An evening of pitha, jolpan and whatever is frying",
    category: "food",
    locality: "Fancy Bazaar, Guwahati",
    durationLabel: "3 hours",
    durationHours: 3,
    distanceKm: 0,
    bestTime: "Evenings, from 5pm",
    fromPrice: 1500,
    groupSizeMax: 8,
    meetingPoint: "Outside the Fancy Bazaar main gate at 5pm",
    intro:
      "Six or seven stops on foot through the oldest market in the city, eating the things Assam eats rather than the things a restaurant serves to visitors.",
    body: [
      "Pitha and jolpan, fish cooked in a banana leaf, khar if the stall has it, and the Marwari sweet shops that have been in the bazaar for a century. Your guide eats here and orders accordingly.",
      "Vegetarian is straightforward and should be flagged when booking. Assamese food is not chilli-heavy, and anybody expecting Naga heat will be surprised in the other direction.",
    ],
    highlights: [
      "Pitha, jolpan and the rice-based sweets",
      "A century-old sweet shop in the bazaar",
      "Tea the way it is actually drunk here",
    ],
    includes: ["All food and tea at the stops", "A guide who eats there"],
    excludes: ["Transfers to the market", "Alcohol"],
    heroAlt: "Stalls and shoppers in Fancy Bazaar, Guwahati, in the evening",
    featured: true,
  },
  {
    slug: "madan-kamdev",
    name: "Madan Kamdev, the ruins nobody stops at",
    strapline: "Tenth-century carving in a forest clearing, and usually empty",
    category: "heritage",
    locality: "Baihata Chariali, 40 km north",
    durationLabel: "Half day",
    durationHours: 5,
    distanceKm: 40,
    bestTime: "Any morning; take repellent in the wet months",
    fromPrice: 2200,
    groupSizeMax: 8,
    meetingPoint: "Picked up from your hotel at 8.30am",
    intro:
      "Hundreds of carved stone fragments from the Pala period scattered across a wooded hillock, some of it erotic, almost all of it uncatalogued, and on most days you will have it to yourself.",
    body: [
      "It gets called the Khajuraho of Assam, which oversells the comparison and undersells the strangeness: this is a ruin field rather than a standing temple, excavated in the 1970s and still largely unexplained.",
      "The small site museum holds the best of the recovered pieces. An hour and a half on the hill is enough unless you are photographing it.",
    ],
    highlights: [
      "Tenth to twelfth-century Pala carving",
      "The site museum's recovered panels",
      "Almost no other visitors on a weekday",
    ],
    includes: [
      "Private vehicle and return",
      "A guide with the history",
      "Site entry",
    ],
    excludes: ["Meals", "Camera fees where charged"],
    heroAlt:
      "Carved stone fragments among trees at Madan Kamdev, north of Guwahati",
  },
  {
    slug: "hajo-trail",
    name: "Hajo: three faiths in one afternoon",
    strapline: "A Hindu temple, a Buddhist pilgrimage and a mosque on one hill",
    category: "heritage",
    locality: "Hajo, 32 km north-west",
    durationLabel: "Half day",
    durationHours: 5,
    distanceKm: 32,
    bestTime: "Afternoons, any day",
    fromPrice: 2400,
    groupSizeMax: 8,
    meetingPoint: "Picked up from your hotel at 1pm",
    intro:
      "Hayagriva Madhava on Monikut hill is sacred to Hindus and revered by Buddhists who hold that the Buddha attained nirvana there. Twenty minutes away, Poa Mecca is one of the oldest mosques in eastern India. The three have coexisted here for centuries.",
    body: [
      "The temple is Ahom, rebuilt in 1583 on a much older site, and the stone elephants along its plinth are the part people photograph. Bhutanese pilgrims still come.",
      "Poa Mecca was built by Pir Giasuddin Auliya in the twelfth century, and its name — a quarter of Mecca — is a claim about the merit of praying there. The view over the Brahmaputra plain from the hill is the other reason to climb it.",
    ],
    highlights: [
      "Hayagriva Madhava and its stone elephants",
      "Poa Mecca and the plain from the hill",
      "Bell-metal work in the village below",
    ],
    includes: [
      "Private vehicle and return",
      "A guide from the region",
      "All entries",
    ],
    excludes: ["Meals", "Offerings"],
    heroAlt: "A temple on a wooded hill at Hajo, north-west of Guwahati",
  },
  {
    slug: "guwahati-ropeway",
    name: "The river ropeway at dusk",
    strapline: "The longest river ropeway in India, and eight minutes each way",
    category: "culture",
    locality: "Kachari Ghat to North Guwahati",
    durationLabel: "90 minutes",
    durationHours: 1.5,
    distanceKm: 0,
    bestTime: "Last cars around 5.30pm; go for the light",
    fromPrice: 700,
    groupSizeMax: 12,
    meetingPoint: "Ropeway terminal at Kachari Ghat",
    intro:
      "Eighteen hundred metres across the Brahmaputra at about sixty metres up. It is a piece of municipal transport rather than an attraction, which is why it costs almost nothing and why the view is better than it has any right to be.",
    body: [
      "You cross to North Guwahati, walk ten minutes to the Aswaklanta temple on the far bank, and come back as the lights come on along the river. The whole thing takes about an hour and a half.",
      "It closes in high wind and occasionally for maintenance, and the queue on a Sunday is long enough to reconsider. A weekday evening is the one to take.",
    ],
    highlights: [
      "The full width of the Brahmaputra from above",
      "Aswaklanta temple on the north bank",
      "The city lighting up on the return crossing",
    ],
    includes: ["Return ropeway tickets", "A guide for the crossing"],
    excludes: ["Transfers to the terminal", "Refreshments"],
    heroAlt: "The Brahmaputra at dusk seen from the Guwahati ropeway crossing",
  },
];

const bySlug = new Map(activities.map((a) => [a.slug, a]));

export function getActivities(): Activity[] {
  return activities;
}

export function getActivityBySlug(slug: string): Activity | undefined {
  return bySlug.get(slug);
}

export function getFeaturedActivities(limit = 3): Activity[] {
  return activities.filter((a) => a.featured).slice(0, limit);
}

export function getActivitiesByCategory(
  category: Activity["category"],
): Activity[] {
  return activities.filter((a) => a.category === category);
}

/** Related activities for a detail page: same category first, then the rest. */
export function getRelatedActivities(slug: string, limit = 3): Activity[] {
  const activity = bySlug.get(slug);
  if (!activity) return [];
  const others = activities.filter((a) => a.slug !== slug);
  return [
    ...others.filter((a) => a.category === activity.category),
    ...others.filter((a) => a.category !== activity.category),
  ].slice(0, limit);
}

/**
 * Banded by how much of the day a thing takes, which is the question people
 * actually arrive with.
 *
 * The index used to group by category — water, wildlife, heritage — and that
 * is a taxonomy rather than a decision. Nobody stands in a hotel lobby at
 * eight in the morning thinking "I am in a heritage mood"; they think "I have
 * until two". Category still travels on every card as a coloured chip, so the
 * mood is answerable, but it is no longer what the page is organised around.
 *
 * Bands are door to door and inclusive of the drive, because that is what
 * eats a morning. Three of them, not five: the moment a reader has to hold
 * more than three options in their head the band stops doing its job.
 */
export const ACTIVITY_BANDS: {
  id: string;
  label: string;
  blurb: string;
  max: number;
}[] = [
  {
    id: "short",
    label: "Two or three hours",
    blurb: "In the city, and back before you have missed anything.",
    max: 3,
  },
  {
    id: "half",
    label: "Half a day",
    blurb: "Out of town and back for a late lunch. Most of these leave early.",
    max: 5,
  },
  {
    id: "full",
    label: "A full day",
    blurb: "The whole day gone, and worth it.",
    max: Infinity,
  },
];

export function getActivitiesByBand(bandId: string): Activity[] {
  const index = ACTIVITY_BANDS.findIndex((b) => b.id === bandId);
  if (index < 0) return [];
  const floor = index === 0 ? 0 : ACTIVITY_BANDS[index - 1].max;
  const { max } = ACTIVITY_BANDS[index];
  return activities
    .filter((a) => a.durationHours > floor && a.durationHours <= max)
    .sort(
      (a, b) => a.durationHours - b.durationHours || a.fromPrice - b.fromPrice,
    );
}

/** The orienting numbers above the list: cheapest, shortest, furthest out. */
export function getActivityRange() {
  return {
    count: activities.length,
    fromPrice: Math.min(...activities.map((a) => a.fromPrice)),
    shortestHours: Math.min(...activities.map((a) => a.durationHours)),
    furthestKm: Math.max(...activities.map((a) => a.distanceKm)),
    inCity: activities.filter((a) => a.distanceKm === 0).length,
  };
}

export const ACTIVITY_CATEGORIES: {
  id: Activity["category"];
  label: string;
}[] = [
  { id: "water", label: "On the water" },
  { id: "wildlife", label: "Wildlife" },
  { id: "heritage", label: "Heritage" },
  { id: "culture", label: "Craft and culture" },
  { id: "food", label: "Food" },
];
