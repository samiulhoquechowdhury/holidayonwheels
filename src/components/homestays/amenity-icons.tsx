import { cn } from "@/lib/cn";

/**
 * One line-drawn glyph per kind of amenity, and the table that picks it.
 *
 * ## This is not in `Amenities.tsx` any more, and the reason is a crash
 *
 * `Amenities` carries `"use client"`. `HouseHighlights` is a server
 * component and imported `iconFor` from it, which React rejects at runtime:
 * "Attempted to call iconFor() from the server but iconFor is on the
 * client." The page returned a 500.
 *
 * That is the second time this exact boundary has been crossed in this
 * codebase — `isBookable` did it a few commits ago and now lives in
 * `lib/homestay.ts` for the same reason. Both typechecked and both passed
 * ESLint, because the client/server boundary is not a type: nothing in the
 * compiler knows that a `"use client"` directive changes who may call an
 * exported function. The only defence is to keep shared helpers in modules
 * that declare neither side, which is what this file is.
 *
 * `Glyph` renders no state and calls no hook, so it is safe from both.
 *
 * ## The table
 *
 * Amenity text is written per house — "Hot water by bucket", "Rooms facing
 * the river" — so the strings keep their wording and an ordered keyword
 * table picks the drawing. First match wins, so specific rules come before
 * loose ones: `river` before `view`, `kitchen` before `meal`.
 *
 * `dot` is the fallback and is meant to be reachable. A neutral mark beside
 * a line nobody wrote a keyword for is correct; a guessed one is a small lie
 * about the house.
 */

export type IconName =
  | "river"
  | "view"
  | "terrace"
  | "kitchen"
  | "meal"
  | "water"
  | "bath"
  | "wifi"
  | "power"
  | "cool"
  | "car"
  | "bed"
  | "seat"
  | "laundry"
  | "boat"
  | "loom"
  | "walk"
  | "dot";

const ICON_RULES: { icon: IconName; test: RegExp }[] = [
  { icon: "river", test: /river|brahmaputra|pond|ghat|water's edge/i },
  { icon: "terrace", test: /terrace|veranda|balcony|porch|lawn|garden|yard/i },
  { icon: "view", test: /view|outlook|facing|window|hill/i },
  { icon: "kitchen", test: /kitchen|cook|stove|pantry/i },
  { icon: "meal", test: /meal|breakfast|dinner|lunch|tea|food|rice beer/i },
  { icon: "bath", test: /bath|bathroom|washroom|shower|en-?suite/i },
  { icon: "water", test: /hot water|drinking water|filter/i },
  { icon: "wifi", test: /wi-?fi|internet|signal|network/i },
  { icon: "cool", test: /air conditioning|\bac\b|fan|heater|quilt|blanket/i },
  { icon: "power", test: /power|solar|generator|electric|charg|backup/i },
  { icon: "car", test: /parking|airport|transfer|pickup|drive|taxi|car/i },
  { icon: "boat", test: /boat|ferry|canoe/i },
  { icon: "loom", test: /loom|weav|silk|craft/i },
  { icon: "laundry", test: /laundry|washing|drying|iron/i },
  { icon: "walk", test: /walk|guided|trek|tour|cycle|bicycle/i },
  { icon: "seat", test: /sitting|lounge|daybed|chair|table|desk|sofa/i },
  { icon: "bed", test: /room|bed|sleep|linen/i },
];

export function iconFor(amenity: string): IconName {
  return ICON_RULES.find((rule) => rule.test.test(amenity))?.icon ?? "dot";
}

/**
 * Exported so the detail page's highlights row draws from the same table.
 * Two sets of icons over one vocabulary of amenity strings is how they drift
 * apart — a "kitchen" with one glyph in the highlights and another six
 * inches below it reads as two different facilities.
 */
export function Glyph({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    river: (
      <>
        <path d="M3 8c3-1.6 6-1.6 9 0s6 1.6 9 0" />
        <path d="M3 13c3-1.6 6-1.6 9 0s6 1.6 9 0" />
        <path d="M3 18c3-1.6 6-1.6 9 0s6 1.6 9 0" />
      </>
    ),
    view: (
      <>
        <path d="M3 18h18" />
        <path d="m4 18 5.5-8 3.5 5 2.5-3.5L21 18" />
        <circle cx="16.5" cy="6.5" r="2" />
      </>
    ),
    terrace: (
      <>
        <path d="M3 10h18" />
        <path d="m5 10 7-5 7 5" />
        <path d="M5 10v9M19 10v9" />
        <path d="M5 15h14" />
      </>
    ),
    kitchen: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M4 10h16" />
        <path d="M8 7h.01M11 7h.01" />
        <circle cx="9" cy="15" r="1.6" />
      </>
    ),
    meal: (
      <>
        <path d="M4 10h16a8 8 0 0 1-8 8 8 8 0 0 1-8-8Z" />
        <path d="M12 10V6M9 21h6" />
      </>
    ),
    water: (
      <path d="M12 3c3 3.6 4.5 6.3 4.5 8.4A4.5 4.5 0 0 1 12 16a4.5 4.5 0 0 1-4.5-4.6C7.5 9.3 9 6.6 12 3Z" />
    ),
    bath: (
      <>
        <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
        <path d="M7 12V6.5A2.5 2.5 0 0 1 9.5 4c1.2 0 2 .7 2.3 1.7" />
        <path d="M7 21.5 6 20M17 21.5l1-1.5" />
      </>
    ),
    wifi: (
      <>
        <path d="M3 9a16 16 0 0 1 18 0" />
        <path d="M6.5 13a11 11 0 0 1 11 0" />
        <path d="M10 16.6a5 5 0 0 1 4 0" />
        <path d="M12 20h.01" />
      </>
    ),
    power: <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />,
    cool: (
      <>
        <path d="M12 3v18M3 12h18" />
        <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
      </>
    ),
    car: (
      <>
        <circle cx="6.5" cy="16.5" r="2.4" />
        <circle cx="17.5" cy="16.5" r="2.4" />
        <path d="M8.9 16.5h6.2M5 16.5 7.5 9h9l2.5 7.5" />
      </>
    ),
    bed: (
      <>
        <path d="M3 17v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
        <path d="M3 17h18M3 14h18" />
        <circle cx="7.5" cy="11.5" r="1.4" />
      </>
    ),
    seat: (
      <>
        <path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
        <path d="M4 11h16v5H4z" />
        <path d="M6 16v3M18 16v3" />
      </>
    ),
    laundry: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <circle cx="12" cy="13" r="4" />
        <path d="M8 6.5h.01M11 6.5h.01" />
      </>
    ),
    boat: (
      <>
        <path d="M3 17c2 2 4 2 6 0s4-2 6 0 4 2 6 0" />
        <path d="M5 13h14l-2-5H7l-2 5Z" />
        <path d="M12 8V4" />
      </>
    ),
    loom: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="1.5" />
        <path d="M8 4v16M12 4v16M16 4v16" />
        <path d="M4 12h16" />
      </>
    ),
    walk: (
      <>
        <circle cx="13" cy="4.5" r="1.8" />
        <path d="M11 21l2-6-3-2.5V9l4-1.5 2.5 3L19 11" />
        <path d="m10 12.5-3 3L6 21" />
      </>
    ),
    dot: <circle cx="12" cy="12" r="3.5" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("mt-0.5 size-6 shrink-0 text-sage", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
