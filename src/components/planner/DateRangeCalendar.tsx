"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { formatLong, nightsBetween, parseISO, toISO } from "@/lib/date";

/**
 * The range picker.
 *
 * It replaced two native `<input type="date">` fields, and the reason is not
 * that they looked plain. Two separate date fields make you hold the length
 * of your own holiday in your head: you pick the 10th, you pick the 15th, and
 * only then does anything tell you that is five nights. On a page whose entire
 * output is built from that number, the number has to be visible while you are
 * choosing it — so the range is drawn as you sweep across it, and the nights
 * count moves with the cursor.
 *
 * What it borrows from the platform rather than reinventing:
 *
 *  - **Real `grid` semantics.** `role="grid"` with a `gridcell` per day, so
 *    a screen reader announces the table as a calendar rather than as sixty
 *    buttons.
 *  - **Roving tabindex.** One tab stop for the whole month. Arrows move by a
 *    day, up and down by a week, Home and End to the ends of the week, Page
 *    Up and Down by a month — the bindings people already have in their
 *    fingers from every other date picker.
 *  - **A live region.** The selection is announced as it changes, because a
 *    range drawn in colour is invisible to anyone who cannot see colour.
 *
 * Two things it does that a generic picker cannot, because it knows what the
 * dates are *for*:
 *
 *  - **Months this state is good in are marked.** Not disabled — Meghalaya in
 *    the monsoon is a real and cheaper holiday — but marked, so the choice is
 *    informed rather than blind.
 *  - **It cannot produce a request the planner would reject.** Dates before
 *    the permit lead time are unavailable, and once a start is chosen,
 *    anything beyond the longest trip we will draft is too. An impossible
 *    range is better prevented than validated.
 *
 * Weeks start on Monday, which puts Saturday and Sunday together at the end
 * of the row. People plan trips around weekends, and a calendar that splits
 * the weekend across two rows makes that harder to see.
 */

const WEEKDAYS = [
  { short: "M", long: "Monday" },
  { short: "T", long: "Tuesday" },
  { short: "W", long: "Wednesday" },
  { short: "T", long: "Thursday" },
  { short: "F", long: "Friday" },
  { short: "S", long: "Saturday" },
  { short: "S", long: "Sunday" },
];

const MONTH_NAMES = [
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

const pad = (n: number) => String(n).padStart(2, "0");

const monthStart = (iso: string) => `${iso.slice(0, 7)}-01`;

function addMonths(iso: string, count: number): string {
  const date = parseISO(monthStart(iso));
  date.setUTCMonth(date.getUTCMonth() + count);
  return toISO(date);
}

/** Whole weeks, Monday first, padded with nulls at both ends. */
function weeksOf(monthISO: string): (string | null)[][] {
  const first = parseISO(monthStart(monthISO));
  const year = first.getUTCFullYear();
  const month = first.getUTCMonth();
  const dayCount = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  // getUTCDay is Sunday-based; shift it so Monday is 0.
  const lead = (first.getUTCDay() + 6) % 7;

  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= dayCount; day += 1) {
    cells.push(`${year}-${pad(month + 1)}-${pad(day)}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function DateRangeCalendar({
  start,
  end,
  onChange,
  earliest,
  latest,
  maxNights,
  /** Full month names this state is worth visiting in. */
  bestMonths,
  colour,
  ink,
  stateName,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  earliest: string;
  latest: string;
  maxNights: number;
  bestMonths: string[];
  colour: string;
  ink: string;
  stateName: string;
}) {
  const [view, setView] = useState(() => monthStart(start || earliest));
  const [hover, setHover] = useState<string | null>(null);
  const [focus, setFocus] = useState(() => start || earliest);
  // Only pull DOM focus once the grid has been used from the keyboard. Doing
  // it on every `focus` change would steal focus from the page on first paint.
  const keyboardActive = useRef(false);
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());

  const choosingEnd = Boolean(start) && !end;

  /*
   * The last date that can be picked *right now*. While a start is set and an
   * end is not, the horizon shrinks to the longest trip we will draft, so an
   * impossible range cannot be drawn in the first place.
   */
  const ceiling = useMemo(() => {
    if (!choosingEnd) return latest;
    const cap = toISO(
      new Date(parseISO(start).getTime() + maxNights * 86_400_000),
    );
    return cap < latest ? cap : latest;
  }, [choosingEnd, start, maxNights, latest]);

  const floor = choosingEnd ? start : earliest;

  const isDisabled = (iso: string) => iso < floor || iso > ceiling;

  const months = useMemo(() => [view, addMonths(view, 1)], [view]);

  /*
   * Move real focus to the roving cell, and scroll the month into view if the
   * arrows have walked off the edge of what is rendered.
   *
   * The visibility test is `offsetParent`, not arithmetic against `view`. The
   * second month is in the DOM at every width and hidden with CSS below `md`,
   * so a phone can have a focused cell that exists, is focusable in
   * principle, and cannot be focused at all — `.focus()` on a
   * `display: none` element silently does nothing, and keyboard traversal
   * dies at the month boundary with no error to show for it. Asking the
   * browser whether the node is actually laid out is the only check that is
   * true at every width.
   */
  useEffect(() => {
    if (!keyboardActive.current) return;
    const node = cellRefs.current.get(focus);
    if (node && node.offsetParent !== null) node.focus();
    else setView(monthStart(focus));
  }, [focus, view]);

  function pick(iso: string) {
    if (isDisabled(iso)) return;
    // A fresh click when a range is already complete starts a new one, and a
    // click on or before the current start moves the start. Both are what
    // people do rather than what they are told to do.
    if (!start || end || iso <= start) {
      onChange(iso, "");
      setHover(null);
      return;
    }
    onChange(start, iso);
    setHover(null);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (event.key in moves) {
      event.preventDefault();
      keyboardActive.current = true;
      const next = toISO(
        new Date(parseISO(focus).getTime() + moves[event.key] * 86_400_000),
      );
      if (next >= earliest && next <= latest) setFocus(next);
      return;
    }

    if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      keyboardActive.current = true;
      const next = addMonths(focus, event.key === "PageUp" ? -1 : 1);
      const clamped =
        next < earliest ? earliest : next > latest ? latest : next;
      setFocus(clamped);
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      keyboardActive.current = true;
      const weekday = (parseISO(focus).getUTCDay() + 6) % 7;
      const shift = event.key === "Home" ? -weekday : 6 - weekday;
      setFocus(toISO(new Date(parseISO(focus).getTime() + shift * 86_400_000)));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pick(focus);
    }
  }

  const previewEnd = choosingEnd && hover && hover > start ? hover : end;
  const canGoBack = addMonths(view, -1) >= monthStart(earliest);
  const canGoForward = addMonths(view, 1) <= monthStart(latest);

  return (
    <div>
      {/* --- Month navigation ----------------------------------------
          The pair sits top-right rather than flanking a centred month name.
          Each month already carries its own heading below, and a third copy
          of "September 2026" between two arrows was the same word three
          times on one screen. */}
      <div className="-mb-2 flex items-center justify-end gap-2">
        <NavButton
          direction="back"
          disabled={!canGoBack}
          onClick={() => setView(addMonths(view, -1))}
        />
        <NavButton
          direction="forward"
          disabled={!canGoForward}
          onClick={() => setView(addMonths(view, 1))}
        />
      </div>

      {/* --- The months ---------------------------------------------- */}
      <div
        className="mt-6 grid gap-8 md:grid-cols-2"
        onMouseLeave={() => setHover(null)}
      >
        {months.map((month, index) => (
          <Month
            key={month}
            monthISO={month}
            /* One month on a phone, two from `md`. Two months at 390px gives
               32px cells, which is under any reasonable tap target. */
            className={index === 1 ? "hidden md:block" : undefined}
            start={start}
            end={previewEnd}
            focus={focus}
            recommended={bestMonths.includes(
              MONTH_NAMES[parseISO(month).getUTCMonth()],
            )}
            stateName={stateName}
            isDisabled={isDisabled}
            onPick={pick}
            onHover={setHover}
            onFocusCell={(iso) => {
              keyboardActive.current = true;
              setFocus(iso);
            }}
            onKeyDown={onKeyDown}
            registerCell={(iso, node) => {
              if (node) cellRefs.current.set(iso, node);
              else cellRefs.current.delete(iso);
            }}
            colour={colour}
            ink={ink}
          />
        ))}
      </div>

      {/* Announced, because a range drawn in colour is not a range to
          everybody. */}
      <p aria-live="polite" className="u-sr-only">
        {start && end
          ? `${nightsBetween(start, end)} nights selected, ${formatLong(start)} to ${formatLong(end)}`
          : start
            ? `Arriving ${formatLong(start)}. Now choose the day you fly home.`
            : "No dates chosen yet."}
      </p>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-14 text-ink-faint">
        <p>
          {choosingEnd
            ? "Now pick the day you fly home."
            : start && end
              ? "Click any day to start again."
              : "Click the day you arrive, then the day you fly home."}
        </p>
        {/* Why the first fortnight is greyed out. Without this the calendar
            looks broken rather than careful, and the reason is a genuinely
            good one to tell people about. */}
        <p>
          {choosingEnd
            ? `Up to ${maxNights} nights in one state`
            : `Earliest ${formatLong(earliest)} — permits need a fortnight`}
        </p>
      </div>
    </div>
  );
}

function monthLabel(monthISO: string): string {
  const date = parseISO(monthISO);
  return `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function Month({
  monthISO,
  className,
  start,
  end,
  focus,
  recommended,
  stateName,
  isDisabled,
  onPick,
  onHover,
  onFocusCell,
  onKeyDown,
  registerCell,
  colour,
  ink,
}: {
  monthISO: string;
  className?: string;
  start: string;
  end: string;
  focus: string;
  recommended: boolean;
  stateName: string;
  isDisabled: (iso: string) => boolean;
  onPick: (iso: string) => void;
  onHover: (iso: string | null) => void;
  onFocusCell: (iso: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  registerCell: (iso: string, node: HTMLButtonElement | null) => void;
  colour: string;
  ink: string;
}) {
  const weeks = useMemo(() => weeksOf(monthISO), [monthISO]);
  const label = monthLabel(monthISO);

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="text-18">{label}</h4>
        {recommended ? (
          <span
            className="u-label flex items-center gap-2"
            style={{ color: ink }}
          >
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full"
              style={{ backgroundColor: colour }}
            />
            Good in {stateName}
          </span>
        ) : null}
      </div>

      <div role="grid" aria-label={label} className="mt-4">
        <div role="row" className="grid grid-cols-7">
          {WEEKDAYS.map((day, index) => (
            <div
              key={index}
              role="columnheader"
              aria-label={day.long}
              className="u-label pb-2 text-center text-ink-faint"
            >
              <span aria-hidden="true">{day.short}</span>
            </div>
          ))}
        </div>

        {weeks.map((week, weekIndex) => (
          <div role="row" key={weekIndex} className="grid grid-cols-7">
            {week.map((iso, dayIndex) =>
              iso === null ? (
                <div role="gridcell" key={`pad-${dayIndex}`} />
              ) : (
                <DayCell
                  key={iso}
                  iso={iso}
                  start={start}
                  end={end}
                  focus={focus}
                  disabled={isDisabled(iso)}
                  onPick={onPick}
                  onHover={onHover}
                  onFocusCell={onFocusCell}
                  onKeyDown={onKeyDown}
                  registerCell={registerCell}
                  colour={colour}
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayCell({
  iso,
  start,
  end,
  focus,
  disabled,
  onPick,
  onHover,
  onFocusCell,
  onKeyDown,
  registerCell,
  colour,
}: {
  iso: string;
  start: string;
  end: string;
  focus: string;
  disabled: boolean;
  onPick: (iso: string) => void;
  onHover: (iso: string | null) => void;
  onFocusCell: (iso: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  registerCell: (iso: string, node: HTMLButtonElement | null) => void;
  colour: string;
}) {
  const isStart = iso === start;
  const isEnd = Boolean(end) && iso === end;
  const inRange = Boolean(start && end) && iso > start && iso < end;
  const isEdge = isStart || isEnd;
  const day = Number(iso.slice(8, 10));

  return (
    <div role="gridcell" aria-selected={isEdge || inRange} className="relative">
      {/*
       * The connecting band. A separate layer behind the cell rather than a
       * background on it, so the run of days between the two ends reads as
       * one continuous bar instead of seven adjacent squares — and so the
       * two ends can be round while the middle is not.
       */}
      {inRange || (isEdge && start && end && start !== end) ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-1 -z-0",
            isStart
              ? "right-0 left-1/2"
              : isEnd
                ? "right-1/2 left-0"
                : "inset-x-0",
          )}
          style={{
            backgroundColor: `color-mix(in srgb, ${colour} 16%, transparent)`,
          }}
        />
      ) : null}

      <button
        type="button"
        ref={(node) => registerCell(iso, node)}
        tabIndex={iso === focus ? 0 : -1}
        disabled={disabled}
        aria-label={`${formatLong(iso)}${isStart ? ", arrival" : ""}${isEnd ? ", departure" : ""}`}
        aria-current={isEdge ? "date" : undefined}
        onClick={() => onPick(iso)}
        onMouseEnter={() => onHover(iso)}
        onFocus={() => onFocusCell(iso)}
        onKeyDown={onKeyDown}
        className={cn(
          "u-num relative z-10 grid h-11 w-full place-items-center text-14",
          "transition-[background-color,color] duration-[var(--dur-micro)] ease-brand",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sage",
          isEdge && "rounded-full text-night-text",
          !isEdge && !disabled && "rounded-full hover:bg-[rgb(46_42_36/0.07)]",
          disabled && "cursor-not-allowed text-ink-faint/45",
        )}
        style={isEdge ? { backgroundColor: colour } : undefined}
      >
        {day}
      </button>
    </div>
  );
}

function NavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "back" | "forward";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "back" ? "Previous month" : "Next month"}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full border",
        "border-[var(--ink-hairline-strong)] transition-colors duration-[var(--dur-micro)] ease-brand",
        "hover:bg-[rgb(46_42_36/0.05)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent",
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("size-4", direction === "forward" && "rotate-180")}
      >
        <path d="M10 2.5 4.5 8l5.5 5.5" />
      </svg>
    </button>
  );
}
