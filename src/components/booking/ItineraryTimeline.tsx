"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatShort, formatWeekday } from "@/lib/date";
import { Chip } from "@/components/primitives/Chip";
import type { ItineraryDay, MealPlan } from "@/content/types";

/**
 * Day-by-day itinerary. Each day expands to reveal its highlights; the first
 * is open by default so the component never reads as a wall of closed rows.
 *
 * Uses native `<details>` semantics via a button + region pair rather than
 * `<details>` itself, because the summary needs to carry chips and a rule
 * line that `<summary>` handles badly across browsers.
 *
 * Pass `dates` — one ISO string per day, in order — and the day column
 * carries the real date under the day number. A catalogue tour has no dates
 * until a departure is chosen, so it renders without; a planned trip always
 * has them, and on a planned trip the date is the more useful of the two
 * numbers. It is the same component either way rather than a second timeline,
 * because two of these would have drifted apart by the second change.
 */

const MEAL_LABEL: Record<MealPlan, string> = {
  breakfast: "Breakfast",
  "half-board": "Breakfast & dinner",
  "full-board": "All meals",
  none: "No meals",
};

export function ItineraryTimeline({
  days,
  dates,
  className,
}: {
  days: ItineraryDay[];
  /** One ISO date per day, in order. Omit for an undated catalogue tour. */
  dates?: string[];
  className?: string;
}) {
  const [open, setOpen] = useState<number[]>([1]);

  const toggle = (day: number) =>
    setOpen((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day],
    );

  const allOpen = open.length === days.length;

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(allOpen ? [] : days.map((d) => d.day))}
          className="u-label min-h-11 text-sage-ink underline underline-offset-4"
        >
          {allOpen ? "Collapse all days" : "Expand all days"}
        </button>
      </div>

      <ol className="flex flex-col">
        {days.map((day) => {
          const isOpen = open.includes(day.day);
          const panelId = `itinerary-day-${day.day}`;

          return (
            <li
              key={day.day}
              className="border-t border-[var(--ink-hairline)] last:border-b"
            >
              <h3>
                <button
                  type="button"
                  onClick={() => toggle(day.day)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-start gap-4 py-5 text-left sm:gap-6"
                >
                  <span className="mt-1 w-14 shrink-0 sm:w-16">
                    <span className="u-label u-num block text-ink-faint">
                      Day {day.day}
                    </span>
                    {dates?.[day.day - 1] ? (
                      <span className="u-num mt-1 block text-12 text-ink-soft">
                        {formatWeekday(dates[day.day - 1])}{" "}
                        {formatShort(dates[day.day - 1])}
                      </span>
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-18 font-medium sm:text-22">
                      {day.title}
                    </span>
                    {!isOpen ? (
                      <span className="mt-1.5 line-clamp-2 block text-16 text-ink-soft">
                        {day.summary}
                      </span>
                    ) : null}
                  </span>
                  <ExpandGlyph open={isOpen} />
                </button>
              </h3>

              <div
                id={panelId}
                hidden={!isOpen}
                className="pb-7 pl-[calc(3.5rem+1rem)] sm:pl-[calc(4rem+1.5rem)]"
              >
                <p className="max-w-prose text-16 text-ink-soft">
                  {day.summary}
                </p>

                <ul className="mt-4 flex flex-wrap gap-1.5">
                  <li>
                    <Chip tone="sage">
                      {day.stay ? `Night in ${day.stay}` : "Departure day"}
                    </Chip>
                  </li>
                  <li>
                    <Chip>{MEAL_LABEL[day.meals]}</Chip>
                  </li>
                  {day.distanceKm ? (
                    <li>
                      <Chip>{day.distanceKm} km by road</Chip>
                    </li>
                  ) : null}
                  {day.altitude ? (
                    <li>
                      <Chip tone={day.altitude >= 3500 ? "ember" : "neutral"}>
                        {day.altitude.toLocaleString("en-IN")} m
                        {day.altitude >= 3500 ? " · altitude" : ""}
                      </Chip>
                    </li>
                  ) : null}
                </ul>

                {day.highlights.length > 0 ? (
                  <ul className="mt-5 flex flex-col gap-2">
                    {day.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex gap-3 text-16 text-ink-soft"
                      >
                        <span aria-hidden="true" className="text-clay">
                          —
                        </span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ExpandGlyph({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center"
    >
      <span className="relative block h-3 w-3">
        <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
        <span
          className={cn(
            "absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current",
            "transition-transform duration-[var(--dur-micro)] ease-brand",
            open && "scale-y-0",
          )}
        />
      </span>
    </span>
  );
}
