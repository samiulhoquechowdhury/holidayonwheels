/**
 * Mock photography and footage.
 *
 * TEMPORARY. Every URL in this file points at a third-party placeholder while
 * the client's own shoot is outstanding (open question 2 in the brief). None
 * of it is Northeast India — it is stock chosen to carry the right *grade* and
 * the right subject class, so the layout can be judged on composition now and
 * re-shot against later.
 *
 * The swap is one edit per entry. Drop the real file under `public/media/`,
 * change the string to its path, delete the matching `remotePatterns` host in
 * next.config.ts when the last remote URL is gone. Nothing else moves: every
 * consumer goes through `Media`, which holds the aspect ratio either way, so
 * there is no layout shift and no CLS when the real photography lands.
 *
 * See MEDIA.md for the encode targets the real assets have to meet.
 */

/** Unsplash's imgix endpoint. Crop and quality are applied per call site. */
const shot = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80`;

/**
 * Hero footage. A forest waterfall — the closest stock analogue to Meghalaya
 * that reads at 21:9 without a recognisable non-Indian landmark in it.
 *
 * Streamed from a remote CDN rather than committed: 13MB of placeholder MP4
 * does not belong in the repository, and the real encode (≤ 4MB, see MEDIA.md)
 * will live in `public/media/` instead.
 */
export const heroFilm = {
  src: "https://videos.pexels.com/video-files/2098989/2098989-hd_1280_720_30fps.mp4",
  poster: shot("1470071459604-3b5ec3a7fe05"),
  alt: "Water falling through dense forest into a still green pool",
} as const;

/**
 * The eight states, west to east — the same order the destinations rail and
 * the hero reel use, so every index of the map on this site agrees.
 */
export const stateShots: Record<string, string> = {
  assam: shot("1476514525535-07fb3b4ae5f1"),
  meghalaya: shot("1470071459604-3b5ec3a7fe05"),
  "arunachal-pradesh": shot("1544735716-392fe2489ffa"),
  nagaland: shot("1516450360452-9312f5e86fc7"),
  manipur: shot("1490077476659-095159692ab5"),
  mizoram: shot("1523592121529-f6dde35f079e"),
  tripura: shot("1548013146-72479768bada"),
  sikkim: shot("1571401835393-8c5f35328320"),
};

/**
 * Featured trips, by position rather than by state.
 *
 * Deliberately not keyed off `stateShots`: two of the three featured tours
 * start in Assam, so keying by state put the same photograph on two cards
 * sitting in the same bento. A reader reads that as a bug, not as a theme.
 * The state is still identified — by the knockout name and by the colour of
 * the chip — so nothing is lost by giving each card its own frame.
 */
export const tourShots = [
  shot("1476514525535-07fb3b4ae5f1"), // river, from a boat
  shot("1470071459604-3b5ec3a7fe05"), // green hills under cloud
  shot("1533130061792-64b345e4a833"), // late light on a high ridge
  shot("1523592121529-f6dde35f079e"), // a walker on a green ridge
  shot("1483728642387-6c3bdd6c93e5"), // dusk over a dark range
];

/** How you travel. Four, matching the four tour types. */
export const journeyShots = {
  couple: shot("1501785888041-af3ef285b470"),
  honeymoon: shot("1439853949127-fa647821eba0"),
  group: shot("1503220317375-aaad61436b1b"),
  solo: shot("1558981806-ec527fa84c39"),
} as const;

/** Rotated through the featured cards in order, so no two neighbours match. */
export const motoShots = [
  shot("1558981806-ec527fa84c39"),
  shot("1483728642387-6c3bdd6c93e5"),
  shot("1626621341517-bbf3d9990a23"),
];

/**
 * Homestays. Timber, forest and water — never a hotel room.
 *
 * The obvious stock for "accommodation" is a white-linened hotel suite, and
 * it is exactly wrong here: the entire argument of that section is that these
 * are houses people live in. A resort bedroom on a homestay card contradicts
 * the copy sitting beside it, which is worse than no photograph at all.
 */
export const stayShots = [
  shot("1611892440504-42a792e24d32"), // warm timber room, lamps lit
  shot("1449158743715-0a90ebb6d2d8"), // a cabin alone in forest
  shot("1618773928121-c32242e63f39"), // a lamp-lit room at night
  shot("1470071459604-3b5ec3a7fe05"), // the valley it stands in
];

/**
 * Festivals. People, not scenery — this is the one section on the page that
 * is about a crowd, and every frame here has one in it.
 */
export const eventShots = [
  shot("1516450360452-9312f5e86fc7"), // a crowd under stage light
  shot("1547153760-18fc86324498"), // a dancer mid-turn
  shot("1533900298318-6b8da08a523e"), // a market in full swing
];

export const journalShots = [
  shot("1519681393784-d120267933ba"),
  shot("1609920658906-8223bd289001"),
  shot("1517824806704-9040b037703b"),
];

/**
 * The pill-shaped images set inside the hero headline. Three, small, and
 * cropped square — they are read as punctuation inside a sentence, not as
 * photographs, so the subject has to survive being 64px wide.
 */
export const headlineChips = [
  {
    src: shot("1506905925346-21bda4d32df4"),
    alt: "Peaks standing above cloud",
  },
  { src: shot("1571401835393-8c5f35328320"), alt: "Prayer flags over a pass" },
  { src: shot("1558981806-ec527fa84c39"), alt: "A rider on an empty road" },
] as const;

/**
 * Culture, food and people — the colour in the page.
 *
 * Landscape photography of the Northeast is overwhelmingly green and grey,
 * and a page built only from it goes cold however bright the palette around
 * it is. These are the frames that carry actual saturation: a dancer in
 * yellow, a thali, a market, prayer flags. They are placed deliberately in
 * the sections that need warming rather than sprinkled evenly.
 */
export const culture = {
  dancer: shot("1547153760-18fc86324498"),
  thali: shot("1567337710282-00832b415979"),
  market: shot("1533900298318-6b8da08a523e"),
  prayerFlags: shot("1571401835393-8c5f35328320"),
  crowd: shot("1516450360452-9312f5e86fc7"),
  street: shot("1601050690597-df0568f70950"),
} as const;

/** Editorial stills used by the statement sections and the parallax rows. */
export const editorial = {
  summit: shot("1533130061792-64b345e4a833"),
  ridgeRoad: shot("1470071459604-3b5ec3a7fe05"),
  nightRange: shot("1519681393784-d120267933ba"),
  duskMountain: shot("1483728642387-6c3bdd6c93e5"),
  riverBoat: shot("1476514525535-07fb3b4ae5f1"),
  forestStream: shot("1609920658906-8223bd289001"),
} as const;

/**
 * Region fallbacks for `Media`.
 *
 * Every photograph on the site that has not been given an explicit `src`
 * resolves through here, keyed by the weave region the call site already
 * declares. That is what dresses the inner pages — tours, destinations,
 * homestays, events, the journal — without touching thirty files: they were
 * already passing `region`, so they get a subject-appropriate frame for free.
 *
 * Two entries per region, chosen by the seed, so a grid of eight cards from
 * one state does not repeat a single photograph eight times.
 *
 * The moment a call site is given a real `src`, this is bypassed for it. When
 * every call site has one, delete this map.
 */
const REGION_MOCKS: Record<string, string[]> = {
  assam: [
    shot("1476514525535-07fb3b4ae5f1"),
    shot("1590050752117-238cb0fb12b1"),
  ],
  meghalaya: [
    shot("1470071459604-3b5ec3a7fe05"),
    shot("1609920658906-8223bd289001"),
  ],
  arunachal: [
    shot("1544735716-392fe2489ffa"),
    shot("1626621341517-bbf3d9990a23"),
  ],
  nagaland: [
    shot("1516450360452-9312f5e86fc7"),
    shot("1547153760-18fc86324498"),
  ],
  manipur: [
    shot("1490077476659-095159692ab5"),
    shot("1533900298318-6b8da08a523e"),
  ],
  mizoram: [
    shot("1523592121529-f6dde35f079e"),
    shot("1449158743715-0a90ebb6d2d8"),
  ],
  tripura: [
    shot("1548013146-72479768bada"),
    shot("1477587458883-47145ed94245"),
  ],
  sikkim: [
    shot("1571401835393-8c5f35328320"),
    shot("1501785888041-af3ef285b470"),
  ],
  neutral: [
    shot("1483728642387-6c3bdd6c93e5"),
    shot("1533130061792-64b345e4a833"),
  ],
};

/**
 * Picks a stable mock for a region. `seed` is the same string the weave
 * placeholder used, so a given card keeps the same photograph across renders
 * and across builds — a card whose picture changes on refresh looks broken.
 */
export function mockFor(region: string, seed: string): string | undefined {
  const options = REGION_MOCKS[region] ?? REGION_MOCKS.neutral;
  if (!options || options.length === 0) return undefined;

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return options[hash % options.length];
}

/**
 * Faces for the proof band. Portraits, not avatars — a 96px circular crop of
 * a real face is the single cheapest credibility signal on a travel page, and
 * an illustrated avatar is worth nothing.
 */
export const faces = [
  { src: shot("1583407723467-9b2d22504831"), alt: "Ritwik B." },
  { src: shot("1607346256330-dee7af15f7c5"), alt: "Anjali and Dev M." },
  { src: shot("1591019479261-1a103585c559"), alt: "The Lotha family, Kohima" },
] as const;
