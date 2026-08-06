/**
 * Hero media configuration.
 *
 * The client is supplying the footage (open question 2 in the brief). Until
 * files exist, `src` stays null and the hero renders poster-only — which is
 * the correct behaviour anyway, because the poster image must be the LCP
 * element and the video must never be.
 *
 * To switch the video on: drop the encodes into `public/media/`, fill in the
 * paths below, and nothing else changes. See MEDIA.md for the encode targets.
 */

export type HeroVideo = {
  /** Desktop encode. Max 4MB, H.264 MP4, ~1920×1080. */
  src: string | null;
  /** Portrait-safe encode for mobile. Shorter, lighter, ~1080×1350. */
  srcMobile: string | null;
  /** Poster image. Always present — this is the LCP element. */
  poster: string | null;
  /** Describes the place, for the poster's alt text. */
  posterAlt: string;
};

export const homeHero: HeroVideo = {
  src: null,
  srcMobile: null,
  poster: null,
  posterAlt:
    "Cloud moving through forested ridges above a river valley in Northeast India at first light",
};
