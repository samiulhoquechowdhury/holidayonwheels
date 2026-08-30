"use client";

import { cn } from "@/lib/cn";
import { addDays, formatLong, nightsBetween, parseISO } from "@/lib/date";
import type { PlannerState } from "./types";

/**
 * When.
 *
 * Two native date inputs and nothing clever. A custom calendar would have to
 * re-implement keyboard traversal, locale, and the phone's own date wheel —
 * all of which the platform already does better than a booking form ever
 * does, and any of which failing is a dead end rather than a rough edge.
 *
 * What the step actually adds is arithmetic and advice:
 *
 *  - **Length is derived and shown as it is typed.** "6 nights · 7 days" is
 *    the number the traveller is really choosing, and it is the number the
 *    itinerary is built from, so it is on screen before they commit.
 *  - **Three presets, drawn from the route itself.** The shortest the state
 *    is worth flying for, a middle, and the longest the road holds. That is
 *    a genuine recommendation, not three round numbers.
 *  - **The month is checked against the state.** Meghalaya in June is a real
 *    holiday and also monsoon, and being told so here — before an itinerary
 *    exists — is worth more than being told after a quote.
 *
 * None of it blocks. The traveller can pick any dates they like; the planner
 * tells them what it thinks and then plans what they asked for.
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
    <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
      <div className="min-w-0">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="plan-start" className="u-label block text-ink-soft">
              Arriving
            </label>
            <input
              id="plan-start"
              type="date"
              value={start}
              min={earliest}
              onChange={(event) => {
                const value = event.target.value;
                onStartChange(value);
                // Keep the range valid rather than silently allowing an end
                // before its start. Nudging it is friendlier than an error.
                if (value && (!end || end <= value)) {
                  onEndChange(addDays(value, state.minDays - 1));
                }
              }}
              className="u-num mt-2 min-h-13 w-full rounded-[var(--radius-input)] border border-transparent bg-paper px-4 text-16 transition-colors duration-[var(--dur-micro)] ease-brand hover:border-[var(--ink-hairline-strong)] focus:border-ink focus:bg-plate focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="plan-end" className="u-label block text-ink-soft">
              Flying home
            </label>
            <input
              id="plan-end"
              type="date"
              value={end}
              min={start ? addDays(start, 2) : addDays(earliest, 2)}
              disabled={!start}
              onChange={(event) => onEndChange(event.target.value)}
              className="u-num mt-2 min-h-13 w-full rounded-[var(--radius-input)] border border-transparent bg-paper px-4 text-16 transition-colors duration-[var(--dur-micro)] ease-brand hover:border-[var(--ink-hairline-strong)] focus:border-ink focus:bg-plate focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* The presets. Lengths this road is actually good at, in its own
            words, rather than a row of round numbers. */}
        <div className="mt-8">
          <p className="u-label text-ink-faint">
            Or take the length we would suggest
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
        <div className="rounded-[var(--radius-panel)] border border-[var(--ink-hairline)] p-7">
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
          ) : (
            <p className="mt-3 text-16 text-ink-soft">
              Pick an arrival date and we will suggest the length.
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
