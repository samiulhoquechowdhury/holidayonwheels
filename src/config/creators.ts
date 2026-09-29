import { shot } from "./showcase";

/**
 * The creator programme's content, and every word of it is a placeholder.
 *
 * **Nothing here is a real person.** The handles, the captions, the follower
 * counts and the view counts are invented so the feed can be judged at the
 * right density and length before a single creator has been signed. Shipping
 * an invented handle is worse than shipping lorem: it is attributable, and
 * somebody will click it. Replace the lot before this page goes public — or,
 * if the programme launches empty, cut the feed and keep the application
 * section, which is the only part that has to be true on day one.
 *
 * The frames are the same mock pool as the rest of the site (see MEDIA.md).
 * They were each looked at rather than chosen from an id, and they are all
 * generic travel photography, which is the one category where a placeholder
 * is honest here: a creator's feed is *meant* to look like somebody else's
 * pictures.
 *
 * Two shapes, because the page shows two things:
 *
 *  - `reels` are vertical, 9:16, and carry a duration. There is no video
 *    behind them yet — they are posters with a play affordance, which is the
 *    honest way to lay out a feed whose footage does not exist. When real
 *    clips land, add a `src` here and the tile becomes a player.
 *  - `gallery` is the flat stills, landscape and portrait mixed, for the
 *    grid below the rail.
 */

export type CreatorReel = {
  id: string;
  /** The creator, as they would be credited. Placeholder. */
  handle: string;
  /** Where it was shot. Real places; the posts are not. */
  place: string;
  caption: string;
  /** mm:ss, as it would sit on the tile. */
  duration: string;
  /** Rounded, as a feed shows it. Placeholder. */
  views: string;
  image: string;
  alt: string;
};

export type CreatorStill = {
  id: string;
  handle: string;
  place: string;
  image: string;
  alt: string;
  /** Portrait tiles claim two rows in the grid. */
  tall?: boolean;
};

export const creatorReels: CreatorReel[] = [
  {
    id: "gurudongmar-dawn",
    handle: "@anoushka.rides",
    place: "Gurudongmar, North Sikkim",
    caption: "5,430m before sunrise. Nobody tells you how loud the wind is.",
    duration: "0:44",
    views: "182K",
    image: shot("1571401835393-8c5f35328320"),
    alt: "Prayer flags strung above a high lake at first light",
  },
  {
    id: "sela-pass",
    handle: "@theslowroadin",
    place: "Sela Pass, Arunachal Pradesh",
    caption: "Four thousand metres and the road still goes up.",
    duration: "1:02",
    views: "96K",
    image: shot("1544735716-392fe2489ffa"),
    alt: "A stupa on a ridge below snow peaks",
  },
  {
    id: "root-bridges",
    handle: "@mist.and.moss",
    place: "Nongriat, Meghalaya",
    caption: "Three thousand steps down. Worth every one of them.",
    duration: "0:38",
    views: "241K",
    image: shot("1470071459604-3b5ec3a7fe05"),
    alt: "A green ridge under low cloud",
  },
  {
    id: "hornbill-night",
    handle: "@kohima.diaries",
    place: "Kisama, Nagaland",
    caption: "Sixteen tribes, one week, and the loudest December in India.",
    duration: "0:55",
    views: "310K",
    image: shot("1516450360452-9312f5e86fc7"),
    alt: "A crowd under stage light at a night festival",
  },
  {
    id: "camp-night",
    handle: "@twowheels.east",
    place: "Dzükou valley, Nagaland",
    caption: "We cooked badly and nobody minded.",
    duration: "1:17",
    views: "74K",
    image: shot("1478131143081-80f7f84ca84d"),
    alt: "A group around a campfire in forest at night",
  },
  {
    id: "the-ride",
    handle: "@bullet.and.brew",
    place: "The Assam–Arunachal road",
    caption: "Six hundred kilometres, one puncture, zero regrets.",
    duration: "0:49",
    views: "128K",
    image: shot("1558981806-ec527fa84c39"),
    alt: "A motorcycle on an open road at dusk",
  },
];

export const creatorStills: CreatorStill[] = [
  {
    id: "still-flags",
    handle: "@anoushka.rides",
    place: "North Sikkim",
    image: shot("1533130061792-64b345e4a833"),
    alt: "Late light on a high ridge",
    tall: true,
  },
  {
    id: "still-market",
    handle: "@kohima.diaries",
    place: "Imphal, Manipur",
    image: shot("1533900298318-6b8da08a523e"),
    alt: "A covered market in full swing",
  },
  {
    id: "still-thali",
    handle: "@mist.and.moss",
    place: "Guwahati, Assam",
    image: shot("1567337710282-00832b415979"),
    alt: "A thali of curries and bread",
  },
  {
    id: "still-ridge",
    handle: "@theslowroadin",
    place: "Above Tawang, Arunachal Pradesh",
    image: shot("1439853949127-fa647821eba0"),
    alt: "A still lake below mountains at first light",
    tall: true,
  },
  {
    id: "still-stars",
    handle: "@twowheels.east",
    place: "Above Tawang",
    image: shot("1519681393784-d120267933ba"),
    alt: "The Milky Way over a snow peak",
  },
  {
    id: "still-lake",
    handle: "@bullet.and.brew",
    place: "Loktak, Manipur",
    image: shot("1503220317375-aaad61436b1b"),
    alt: "A traveller looking out across a still lake",
  },
  /*
   * The seventh is here for the grid, not for the edit. Six stills with two
   * tall ones is eight row-units across a three-column grid, which leaves one
   * cell empty in the bottom corner. Seven makes nine and the block closes.
   * Cut one and put a third `tall` on another, or the hole comes back.
   */
  {
    id: "still-cloud",
    handle: "@anoushka.rides",
    place: "Sela Pass, Arunachal Pradesh",
    image: shot("1506905925346-21bda4d32df4"),
    alt: "Cloud breaking over a high range at sunset",
  },
];

/** What the programme actually offers. Terms are the client's to confirm. */
export const creatorTerms = [
  {
    title: "The trip is on us",
    copy: "A seat on a scheduled departure — vehicle, guide, rooms, permits and park fees. You cover getting to Guwahati.",
  },
  {
    title: "You keep everything you shoot",
    copy: "Your footage stays yours. We ask for a licence to re-post, credited, not for the copyright.",
  },
  {
    title: "A guide who knows the ground",
    copy: "Somebody from the state you are in, who knows which morning the light is worth getting up for.",
  },
  {
    title: "A rate for your audience",
    copy: "A code that takes money off for the people who book because of you, and pays you on each one.",
  },
];
