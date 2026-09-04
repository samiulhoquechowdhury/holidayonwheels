"use client";

import { cn } from "@/lib/cn";
import { addDays, formatLong, nightsBetween, parseISO } from "@/lib/date";
import { DateRangeCalendar } from "./DateRangeCalendar";
import type { PlannerState } from "./types";

/**
 * When.
 *
 * The step is a calendar and a running total, and the total is the point: the
 * planner builds the itinerary from the *length*, so the length has to be
 * visible while the dates are being chosen rather than after. The range is
 * drawn as the cursor sweeps and the nights count moves with it.
 *
 * Around that, three things the picker itself cannot know:
 *
 *  - **Three presets drawn from the route.** The shortest length the state is
 *    worth flying for, a middle, and the longest the road actually holds.
 *    That is a recommendation with a reason behind it rather than three round
 *    numbers.
 *  - **The month is checked against the state.** Meghalaya in June is a real
 *    holiday and also monsoon. Being told so here — before an itinerary
 *    exists — is worth more than being told after a quote.
 *  - **Nothing blocks.** Every advisory says what we think and then gets out
 *    of the way. The traveller picks the dates; the planner plans them.
 *
 * The permit lead time and the longest trip we will draft are enforced by the
 * calendar rather than validated after the fact — an impossible range is
 * better prevented than rejected.
 */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Matches the server action's own ceiling, so the two cannot disagree. */
const MAX_LEAD_DAYS = 540;
/** 21 days is the longest single-state trip the planner will attempt. */
const MAX_NIGHTS = 20;

export function PlannerDates({
  state,
  today,
  start,
  end,
  onStartChange,
  onEndChange,
}: {
  state: PlannerState;
  /** From the server, so the earliest selectable date cannot drift on hydration. */
  today: string;
  start: string;
  end: string;
  onStartChange: (iso: string) => void;
  onEndChange: (iso: string) => void;
}) {
  // A fortnight is the honest floor: permits for the ILP states take about
  // that long, and offering a date we could not deliver is worse than not
  // offering it.
  const earliest = addDays(today, 14);
  const latest = addDays(today, MAX_LEAD_DAYS);
  const nights = start && end ? nightsBetween(start, end) : 0;
  const dayCount = nights > 0 ? nights + 1 : 0;

  const presets = Array.from(
    new Set([
      state.minDays,
      Math.round((state.minDays + state.maxDays) / 2),
      state.maxDays,
    ]),
  ).sort((a, b) => a - b);

  const month = start ? MONTHS[parseISO(start).getUTCMonth()] : null;
  const monthOff = month ? !state.bestMonths.includes(month) : false;
  const tooLong = dayCount > state.maxDays;
  const tooShort = dayCount > 0 && dayCount < state.minDays;

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
      <div className="min-w-0">
        <div className="rounded-[var(--radius-panel)] border border-[var(--ink-hairline)] bg-paper p-6 sm:p-8">
          <DateRangeCalendar
            start={start}
            end={end}
            onChange={(nextStart, nextEnd) => {
              onStartChange(nextStart);
              onEndChange(nextEnd);
            }}
            earliest={earliest}
            latest={latest}
            maxNights={MAX_NIGHTS}
            bestMonths={state.bestMonths}
            colour={state.colour}
            ink={state.ink}
            stateName={state.name}
          />
        </div>

        {/* The presets. Lengths this road is actually good at, in its own
            words, rather than a row of round numbers. */}
        <div className="mt-8">
          <p className="u-label text-ink-faint">
            {start
              ? "Or take the length we would suggest"
              : "Pick an arrival day first, then these set the length for you"}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {presets.map((preset, index) => {
              const on = dayCount === preset;
              return (
                <li key={preset}>
                  <button
                    type="button"
                    disabled={!start}
                    onClick={() =>
                      start && onEndChange(addDays(start, preset - 1))
                    }
                    aria-pressed={on}
                    className={cn(
                      "u-label flex min-h-11 items-center gap-2.5 rounded-full border px-5",
                      "transition-colors duration-[var(--dur-micro)] ease-brand",
                      "disabled:cursor-not-allowed disabled:opacity-40",
                      on
                        ? "border-transparent text-night-text"
                        : "border-[var(--ink-hairline)] hover:border-[var(--ink-hairline-strong)]",
                    )}
                    style={{
                      backgroundColor: on ? state.colour : undefined,
                      color: on ? undefined : state.ink,
                    }}
                  >
                    {preset} days
                    <span
                      className="text-ink-faint"
                      style={on ? { color: "inherit" } : undefined}
                    >
                      {index === 0
                        ? "the short week"
                        : index === presets.length - 1
                          ? "the whole road"
                          : "the usual"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Advisories. Never blocking — they say what we think and then get
            out of the way. */}
        <div className="mt-10 flex flex-col gap-4 empty:mt-0">
          {monthOff ? (
            <Advisory colour={state.colour}>
              <strong className="font-medium">
                {month} is outside the window we recommend for {state.name}.
              </strong>{" "}
              We would rather you went in{" "}
              {state.bestMonths.slice(0, 3).join(", ")}. It is cheaper and
              emptier off-season, and it rains — your call, and we will plan
              either.
            </Advisory>
          ) : null}

          {tooLong ? (
            <Advisory colour={state.colour}>
              <strong className="font-medium">
                {state.maxDays} days is as far as this road goes.
              </strong>{" "}
              {state.routeNote} We will plan {state.maxDays} days here and
              suggest where to put the rest.
            </Advisory>
          ) : null}

          {tooShort ? (
            <Advisory colour={state.colour}>
              <strong className="font-medium">
                {state.minDays} days is the shortest we would recommend.
              </strong>{" "}
              At {dayCount} a large share of the trip is the drive in and the
              drive out. We will still plan it.
            </Advisory>
          ) : null}
        </div>
      </div>

      {/* The readout. The one number the whole step exists to produce. */}
      <aside className="lg:pt-1">
        <div className="rounded-[var(--radius-panel)] border border-[var(--ink-hairline)] p-7 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <p className="u-label text-ink-faint">That is</p>
          {dayCount > 0 ? (
            <>
              <p className="u-num mt-3 font-display text-48 leading-none">
                {nights}
                <span className="ml-2 font-sans text-16 text-ink-soft">
                  {nights === 1 ? "night" : "nights"}
                </span>
              </p>
              <p className="mt-2 text-16 text-ink-soft">
                {dayCount} days on the ground, including the day you land and
                the day you leave.
              </p>
              <dl className="mt-6 flex flex-col gap-3 border-t border-[var(--ink-hairline)] pt-6">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="u-label text-ink-faint">Arrive</dt>
                  <dd className="u-num text-right text-14">
                    {formatLong(start)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="u-label text-ink-faint">Depart</dt>
                  <dd className="u-num text-right text-14">
                    {formatLong(end)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="u-label text-ink-faint">Fly into</dt>
                  <dd className="text-right text-14">{state.gateway}</dd>
                </div>
              </dl>
            </>
          ) : start ? (
            <>
              <p className="u-num mt-3 font-display text-28 leading-tight">
                {formatLong(start)}
              </p>
              <p className="mt-3 text-16 text-ink-soft">
                Now pick the day you fly home, or take one of the lengths we
                suggest below the calendar.
              </p>
            </>
          ) : (
            <p className="mt-3 text-16 text-ink-soft">
              Pick the day you arrive and we will suggest the length.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Advisory({
  colour,
  children,
}: {
  colour: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className="border-l-2 py-1 pl-5 text-16 text-ink-soft"
      style={{ borderColor: colour }}
    >
      {children}
    </p>
  );
}
