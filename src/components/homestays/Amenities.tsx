"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Glyph, iconFor } from "./amenity-icons";

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
