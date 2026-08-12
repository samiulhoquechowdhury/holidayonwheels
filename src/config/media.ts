import type { WeaveRegion } from "@/components/layout/weave-motifs";

/**
 * Hero media configuration.
 *
 * The hero runs a three-clip reel: one film at a time, crossfading, with a
 * chapter control that lets you jump between them. This file is the whole
 * contract — drop the encodes into `public/media/`, fill in the paths, and
 * nothing else changes.
 *
 * The client is supplying the footage (open question 2 in the brief). Until
 * files exist, every `src` stays null and each chapter renders its poster
 * placeholder instead: still a real hero, still the right aspect, still no
 * layout shift when the footage lands. See MEDIA.md for the encode targets.
 *
 * The poster is always the LCP element and the video never is — see the
 * loading contract in components/home/VideoHero.tsx.
 */

export type HeroClip = {
  /** Stable key. Also the expected filename stem under `public/media/`. */
  id: string;
  /** Desktop encode. Max 4MB, H.264 MP4, ~1920×1080. */
  src: string | null;
  /** Portrait-safe encode for mobile. Shorter, lighter, ~1080×1350. */
  srcMobile: string | null;
  /** Poster image. Chapter 1's poster is the LCP element. */
  poster: string | null;
  /** Describes the place, for the poster's alt text. Never "image". */
  posterAlt: string;
  /** Chapter name in the hero's control. Two words at most. */
  label: string;
  /** Where the footage is from. Sits under the label. */
  place: string;
  /** Motif used by the placeholder while `poster` is null. */
  region: WeaveRegion;
};

/**
 * Three chapters, ordered west to east — the same geography the destinations
 * rail uses, so the hero reads as an opening statement of the same map.
 */
export const heroReel: HeroClip[] = [
  {
    id: "hero-ridgelines",
    src: null,
    srcMobile: null,
    poster: null,
    posterAlt:
      "Cloud moving through forested ridges above a river valley in Meghalaya at first light",
    label: "Ridgelines",
    place: "Meghalaya",
    region: "meghalaya",
  },
  {
    id: "hero-river",
    src: null,
    srcMobile: null,
    poster: null,
    posterAlt:
      "The Brahmaputra running wide and flat past sandbars below a tea-covered bank in Assam",
    label: "The river",
    place: "Assam",
    region: "assam",
  },
  {
    id: "hero-pass",
    src: null,
    srcMobile: null,
    poster: null,
    posterAlt:
      "A single road switching back across a high bare pass under snow in western Arunachal Pradesh",
    label: "The pass",
    place: "Arunachal",
    region: "arunachal",
  },
];

/**
 * How long each chapter holds before the reel advances.
 *
 * Long on purpose. A hero that changes every three seconds reads as a
 * slideshow; at seven it reads as film. Mirrored into CSS as the duration of
 * the `hero-chapter` keyframes — change both or the progress rule desyncs.
 */
export const HERO_CLIP_MS = 7000;
