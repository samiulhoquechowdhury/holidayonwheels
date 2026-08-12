import type { StateSlug } from "@/content/types";

/**
 * The state colour map.
 *
 * Eight states, eight colours, and the same colour every time a given state
 * appears anywhere on the site — chip, marquee entry, index row, card border.
 * That consistency is the entire value of the system: a reader who sees
 * magenta three times next to the word Manipur has learned a colour code
 * without being taught one, and the page reads as joyful rather than as
 * decorated because the brightness is carrying information.
 *
 * `surface` is for fills and large blocks. `ink` is the darkened step and the
 * only one allowed to carry text on a light ground — every value has been
 * checked to clear AA against `--sand`, the lowest-contrast surface it can
 * land on. Never use `surface` for type.
 *
 * The colours themselves are defined in `styles/tokens.css`; this file only
 * decides which state gets which.
 */
export type StateColour = {
  /** CSS custom property reference, for fills. */
  surface: string;
  /** Darkened step, for text. */
  ink: string;
  /** Tailwind class for the pale ground that matches it. */
  tint: string;
};

export const stateColours: Record<StateSlug, StateColour> = {
  assam: { surface: "var(--sky)", ink: "var(--sky-ink)", tint: "bg-mint" },
  meghalaya: {
    surface: "var(--jade)",
    ink: "var(--jade-ink)",
    tint: "bg-mint",
  },
  "arunachal-pradesh": {
    surface: "var(--indigo)",
    ink: "var(--indigo-ink)",
    tint: "bg-lilac",
  },
  nagaland: {
    surface: "var(--naga)",
    ink: "var(--naga-ink)",
    tint: "bg-blush",
  },
  manipur: {
    surface: "var(--magenta)",
    ink: "var(--magenta-ink)",
    tint: "bg-blush",
  },
  mizoram: { surface: "var(--moss)", ink: "var(--moss-ink)", tint: "bg-mint" },
  tripura: { surface: "var(--plum)", ink: "var(--plum-ink)", tint: "bg-lilac" },
  sikkim: {
    surface: "var(--marigold)",
    ink: "var(--marigold-ink)",
    tint: "bg-butter",
  },
};

/** Falls back to muga gold for anything not tied to a single state. */
export function colourFor(state: StateSlug | undefined): StateColour {
  if (!state)
    return {
      surface: "var(--clay)",
      ink: "var(--clay-ink)",
      tint: "bg-butter",
    };
  return stateColours[state];
}

/**
 * The palette in display order, for anything that cycles through it rather
 * than looking a state up — the marquee's separators, the journey rows, the
 * figures in the proof band.
 */
export const paletteCycle = [
  { surface: "var(--marigold)", ink: "var(--marigold-ink)" },
  { surface: "var(--jade)", ink: "var(--jade-ink)" },
  { surface: "var(--naga)", ink: "var(--naga-ink)" },
  { surface: "var(--indigo)", ink: "var(--indigo-ink)" },
  { surface: "var(--magenta)", ink: "var(--magenta-ink)" },
  { surface: "var(--sky)", ink: "var(--sky-ink)" },
  { surface: "var(--moss)", ink: "var(--moss-ink)" },
  { surface: "var(--plum)", ink: "var(--plum-ink)" },
] as const;
