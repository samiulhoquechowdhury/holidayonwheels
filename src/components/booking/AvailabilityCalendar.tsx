"use client";

import { cn } from "@/lib/cn";
import { formatMedium, formatRange, relativeToNow } from "@/lib/date";
import { formatINR } from "@/lib/currency";
import type { Departure } from "@/content/types";

/**
 * Departure selection.
 *
 * Two modes. `departures` lists fixed group departure dates — the model tours
 * and motorcycle expeditions use. `nights` renders a night-count selector for
 * homestays, where the traveller picks a length rather than a date.
 *
 * Rendered as a radio group so keyboard traversal and screen-reader semantics
 * come from the platform rather than from ARIA patched over divs.
 */

const STATUS_LABEL: Record<Departure["status"], string> = {
  open: "Available",
  filling: "Filling fast",
  guaranteed: "Guaranteed to run",
  "sold-out": "Sold out",
};

const STATUS_TONE: Record<Departure["status"], string> = {
  open: "text-ink-soft",
  filling: "text-naga-red-ink",
  guaranteed: "text-deep-teal-ink",
  "sold-out": "text-ink-faint",
};

export function AvailabilityCalendar({
  departures,
  selected,
  onSelect,
  name = "departure",
  className,
}: {
  departures: Departure[];
  selected?: string;
  onSelect: (date: string) => void;
  name?: string;
  className?: string;
}) {
  if (departures.length === 0) {
    return (
      <p className="text-16 text-ink-soft">
        No dates are published for this season yet. Ask us and we will run it
        privately on dates that suit you.
      </p>
    );
  }

  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="u-sr-only">Choose a departure date</legend>
      <ul className="flex flex-col gap-2">
        {departures.map((departure) => {
          const soldOut = departure.status === "sold-out";
          const isSelected = selected === departure.date;
          const id = `${name}-${departure.date}`;

          return (
            <li key={departure.date}>
              <label
                htmlFor={id}
                className={cn(
                  "flex min-h-14 cursor-pointer items-center justify-between gap-3 border px-4 py-3",
                  "rounded-[var(--radius-control)] transition-colors duration-[var(--dur-micro)] ease-brand",
                  soldOut && "cursor-not-allowed opacity-50",
                  isSelected
                    ? "border-ink bg-[rgb(20_32_27/0.04)]"
                    : "border-[var(--ink-hairline)] hover:border-[var(--ink-hairline-strong)]",
                  // The focus ring lives on the label because the input itself
                  // is visually hidden.
                  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-deep-teal",
                )}
              >
                <input
                  id={id}
                  type="radio"
                  name={name}
                  value={departure.date}
                  checked={isSelected}
                  disabled={soldOut}
                  onChange={() => onSelect(departure.date)}
                  className="u-sr-only"
                />
                <span className="min-w-0">
                  <span className="block font-mono text-14 tabular-nums">
                    {formatRange(departure.date, departure.endDate)}
                  </span>
                  <span
                    className={cn(
                      "u-mono mt-1 block",
                      STATUS_TONE[departure.status],
                    )}
                  >
                    {soldOut
                      ? STATUS_LABEL[departure.status]
                      : `${STATUS_LABEL[departure.status]} · ${departure.seatsLeft} left · ${relativeToNow(departure.date)}`}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  {departure.wasPerPerson ? (
                    <span className="block font-mono text-12 text-ink-faint line-through">
                      {formatINR(departure.wasPerPerson)}
                    </span>
                  ) : null}
                  <span className="block font-mono text-16 tabular-nums">
                    {formatINR(departure.perPerson)}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

/**
 * Night-count selector for homestays, where there is no fixed departure —
 * the traveller picks a check-in date and a number of nights.
 */
export function NightSelector({
  checkIn,
  nights,
  onCheckInChange,
  onNightsChange,
  minDate,
  className,
}: {
  checkIn: string;
  nights: number;
  onCheckInChange: (iso: string) => void;
  onNightsChange: (nights: number) => void;
  minDate: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      <div>
        <label htmlFor="check-in" className="u-mono mb-2 block text-ink-soft">
          Check in
        </label>
        <input
          id="check-in"
          type="date"
          value={checkIn}
          min={minDate}
          onChange={(event) => onCheckInChange(event.target.value)}
          className="min-h-12 w-full rounded-[var(--radius-control)] border border-[var(--ink-hairline-strong)] bg-paper px-3 font-mono text-14 tabular-nums"
        />
      </div>
      <div>
        <label htmlFor="nights" className="u-mono mb-2 block text-ink-soft">
          Nights
        </label>
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={() => onNightsChange(Math.max(1, nights - 1))}
            disabled={nights <= 1}
            aria-label="One night fewer"
            className="min-h-12 w-12 shrink-0 rounded-l-[var(--radius-control)] border border-[var(--ink-hairline-strong)] text-18 disabled:opacity-40"
          >
            –
          </button>
          <output
            htmlFor="nights"
            className="flex min-h-12 flex-1 items-center justify-center border-y border-[var(--ink-hairline-strong)] font-mono text-16 tabular-nums"
          >
            {nights}
          </output>
          <button
            type="button"
            onClick={() => onNightsChange(Math.min(21, nights + 1))}
            disabled={nights >= 21}
            aria-label="One night more"
            className="min-h-12 w-12 shrink-0 rounded-r-[var(--radius-control)] border border-[var(--ink-hairline-strong)] text-18 disabled:opacity-40"
          >
            +
          </button>
        </div>
        <p className="u-mono mt-2 text-ink-faint">
          Checking out {formatMedium(addNights(checkIn, nights))}
        </p>
      </div>
    </div>
  );
}

function addNights(iso: string, nights: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + nights);
  return date.toISOString().slice(0, 10);
}
