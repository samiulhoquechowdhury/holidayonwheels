"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * What the house offers, one icon per line.
 *
 * ## What changed, and why
 *
 * This used to sort the amenities into six themed groups — "Food and the
 * kitchen", "Warmth and washing" — each with a single glyph and a column of
 * bulleted strings under it. It read as a filing system rather than a list
 * of what you get, and on the Guwahati houses, which carry four or five
 * amenities each, it produced six headings over almost nothing.
 *
 * The reference does it flat: one row per amenity, each with its own icon,
 * two columns, and a "show all" button once the list is longer than the eye
 * wants to scan. That is what this is now. The grouping logic is gone rather
 * than hidden behind a flag, because two ways of presenting the same list is
 * how one of them rots.
 *
 * ## The icons are matched, not authored
 *
 * The content is free text written per house — "Hot water by bucket", "Rooms
 * facing the river", "Time at the loom, with somebody who can actually
 * weave". A fixed facility checklist would flatten exactly the differences
 * this page exists to show, so the strings keep their wording and an ordered
 * keyword table picks the glyph. First match wins, so specific rules come
 * before loose ones — `river` before `view`, `kitchen` before `meal`.
 *
 * `dot` is the fallback and is meant to be reachable: a neutral mark beside
 * a line nobody wrote a keyword for is correct, where no icon at all leaves
 * a ragged column and a guessed one is a small lie about the house.
 *
 * This is the fourth local copy of the same 1.5-unit glyph conventions in
 * this codebase, after `StayDetailsDialog`, `HouseFacts` and
 * `CurrencySwitcher`. A shared icon module is overdue and is deliberately
 * not being done inside a content change.
 */

type IconName =
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

function iconFor(amenity: string): IconName {
  return ICON_RULES.find((rule) => rule.test.test(amenity))?.icon ?? "dot";
}

function Glyph({ name }: { name: IconName }) {
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
      className="mt-0.5 size-6 shrink-0 text-sage"
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

/** How many show before the list asks to be opened. */
const PREVIEW = 8;

export function Amenities({
  amenities,
  className,
}: {
  amenities: string[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  if (amenities.length === 0) return null;

  /*
   * Everything, or the first eight. Four or five amenities — which is what
   * the Guwahati houses carry — never reach the button, and nineteen do not
   * flood the page before somebody asks.
   */
  const shown = open ? amenities : amenities.slice(0, PREVIEW);
  const hidden = amenities.length - shown.length;

  return (
    <div className={cn("min-w-0", className)}>
      <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
        {shown.map((amenity) => (
          <li
            key={amenity}
            className="flex items-start gap-4 border-b border-[var(--ink-hairline)] pb-4 text-16 text-ink-soft"
          >
            <Glyph name={iconFor(amenity)} />
            <span className="min-w-0">{amenity}</span>
          </li>
        ))}
      </ul>

      {hidden > 0 || open ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "u-label mt-8 min-h-12 rounded-[var(--radius-input)] border px-6",
            "border-ink text-ink transition-colors duration-[var(--dur-micro)] ease-brand",
            "hover:bg-[rgb(46_42_36/0.045)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
          )}
        >
          {open ? "Show less" : `Show all ${amenities.length} amenities`}
        </button>
      ) : null}
    </div>
  );
}
