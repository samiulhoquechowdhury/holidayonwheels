"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";
import { formatLong, formatShort, formatWeekday } from "@/lib/date";
import { summariseDay, type DaySelection, type Selections } from "@/lib/extras";
import { glideToElement, shiftScroll } from "@/lib/scroll";
import type { DayOptions, PlannedDay } from "@/lib/plan";
import type { MealPlan } from "@/content/types";

/**
 * The itinerary, as a form.
 *
 * Each day opens into the decisions that belong to that day — where we meet
 * you, where you sleep, what else you want to do — and the price panel beside
 * it moves as they are made.
 *
 * ### Three kinds of choice, three shapes
 *
 * The same row repeated for every question made every question look equally
 * weighty, and the one that matters most looked like the others:
 *
 *  - **Where we meet you** is a short factual pick with no price attached, so
 *    it is a set of compact pills. The detail of the chosen one — "met inside
 *    arrivals with a board" — appears once, under the set, rather than on all
 *    four.
 *  - **Where you sleep** is chosen on sight, the way anybody picks a room on a
 *    booking site: a photograph, a name and a price. No paragraph. The
 *    listings are cards in a grid, and the chosen one is ringed in the
 *    state's colour.
 *  - **Anything else** is a checklist, so it stays a list — one line of name,
 *    duration and price, with a short line of what it is.
 *
 * ### Radios where the answer is one thing, checkboxes where it is not
 *
 * You sleep in one room and arrive at one airport; those are native radio
 * groups, so the arrow keys and the "2 of 3" announcement work without a line
 * of JavaScript. Activities are checkboxes, because you can do two things in a
 * day. Every input is visually hidden with the whole card as its label, and
 * the focus ring sits on the card.
 *
 * ### Every day starts complete
 *
 * The included option is pre-selected everywhere, so the itinerary is a
 * finished, costed trip before anything is touched, and every tap afterwards
 * is the traveller choosing to spend more.
 */

const MEAL_LABEL: Record<MealPlan, string> = {
  breakfast: "Breakfast",
  "half-board": "Breakfast & dinner",
  "full-board": "All meals",
  none: "No meals",
};

const KIND_LABEL: Record<string, string> = {
  included: "Included",
  homestay: "Our homestay",
  hotel: "Hotel",
  heritage: "Heritage",
  lodge: "Lodge",
  camp: "Camp",
};

export function PlannedItinerary({
  days,
  dayOptions,
  selections,
  onChange,
  colour,
  ink,
  heads,
  className,
}: {
  days: PlannedDay[];
  dayOptions: DayOptions[];
  selections: Selections;
  onChange: (day: number, next: DaySelection) => void;
  /** The state's colour, so a chosen option is the same colour as the state. */
  colour: string;
  ink: string;
  heads: number;
  className?: string;
}) {
  const [open, setOpen] = useState<number[]>([1]);
  const allOpen = open.length === days.length;

  /*
   * Which day was just opened, and where its header was on screen when it
   * was tapped.
   *
   * Opening a day closes the one that was open, and if that one sat *above*
   * — which it does whenever you read a day, scroll down and open the next —
   * its whole panel collapses out from above you. Everything below it moves
   * up by that height in the same frame, so the header you just tapped ends
   * up somewhere above the top of the screen and you have to scroll back to
   * find the day you asked for.
   *
   * So the tap position is recorded, and after React has rendered but before
   * the browser paints, the page is shifted by exactly the distance the
   * header moved. The header never visibly leaves your finger. Then the day
   * glides up to the top of the screen so its contents are in view.
   */
  const pending = useRef<{ day: number; anchorTop: number | null } | null>(
    null,
  );

  useLayoutEffect(() => {
    const next = pending.current;
    if (!next) return;
    pending.current = null;

    const row = document.getElementById(`plan-dayrow-${next.day}`);
    if (!row) return;

    if (next.anchorTop !== null) {
      const header = row.querySelector<HTMLElement>("button[aria-controls]");
      if (header) {
        shiftScroll(header.getBoundingClientRect().top - next.anchorTop);
      }
    }
    requestAnimationFrame(() => glideToElement(row));
  }, [open]);

  function toggle(day: number, header: HTMLElement) {
    if (open.includes(day)) {
      // Closing leaves the header where it is; nothing above it moves.
      setOpen((current) => current.filter((d) => d !== day));
      return;
    }
    pending.current = { day, anchorTop: header.getBoundingClientRect().top };
    setOpen([day]);
  }

  function jumpTo(day: number) {
    pending.current = { day, anchorTop: null };
    setOpen([day]);
  }

  return (
    <div className={cn("min-w-0", className)}>
      {/* --- Day strip ------------------------------------------------ */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="-mx-[var(--gutter)] flex scrollbar-none gap-1.5 overflow-x-auto px-[var(--gutter)] pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {days.map((day) => {
            const isOpen = open.includes(day.day);
            const touched = Boolean(
              summariseDay(dayOptions[day.day - 1], selections[day.day]),
            );
            return (
              <button
                key={day.day}
                type="button"
                onClick={() => jumpTo(day.day)}
                aria-current={isOpen ? "true" : undefined}
                aria-label={`Day ${day.day}, ${formatLong(day.date)}`}
                className={cn(
                  "u-label flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3.5",
                  "transition-colors duration-[var(--dur-micro)] ease-brand",
                  isOpen
                    ? "border-transparent text-night-text"
                    : "border-[var(--ink-hairline)] text-ink-soft hover:border-[var(--ink-hairline-strong)]",
                )}
                style={isOpen ? { backgroundColor: colour } : undefined}
              >
                <span className="u-num whitespace-nowrap">
                  {formatShort(day.date)}
                </span>
                {/* A dot on any day already changed from the default, so
                    the strip doubles as a record of what was touched. */}
                {touched && !isOpen ? (
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: colour }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setOpen(allOpen ? [] : days.map((d) => d.day))}
          className="u-label min-h-10 shrink-0 px-1 underline underline-offset-4"
          style={{ color: ink }}
        >
          {allOpen ? "Collapse all" : "Open every day"}
        </button>
      </div>

      {/* --- The days ------------------------------------------------- */}
      <ol className="flex flex-col gap-3">
        {days.map((day, index) => {
          const options = dayOptions[index];
          const selection = selections[day.day];
          const isOpen = open.includes(day.day);
          const panelId = `plan-day-${day.day}`;
          const summary = options ? summariseDay(options, selection) : null;

          return (
            <li
              key={day.day}
              id={`plan-dayrow-${day.day}`}
              className={cn(
                "scroll-mt-[calc(var(--header-h)+1rem)] rounded-[var(--radius-card)] border bg-paper",
                "transition-[border-color,box-shadow] duration-[var(--dur)] ease-brand",
                isOpen
                  ? "shadow-[0_18px_48px_-28px_rgb(46_42_36/0.35)]"
                  : "border-[var(--ink-hairline)] hover:border-[var(--ink-hairline-strong)]",
              )}
              style={isOpen ? { borderColor: colour } : undefined}
            >
              <h4>
                <button
                  type="button"
                  onClick={(event) => toggle(day.day, event.currentTarget)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center gap-4 p-4 text-left sm:gap-5 sm:p-5"
                >
                  {/* The day number, as a badge that fills when open. */}
                  <span
                    className={cn(
                      "u-num grid size-11 shrink-0 place-items-center rounded-full border text-16",
                      "transition-colors duration-[var(--dur-micro)] ease-brand",
                      isOpen
                        ? "border-transparent text-night-text"
                        : "border-[var(--ink-hairline-strong)]",
                    )}
                    style={isOpen ? { backgroundColor: colour } : undefined}
                  >
                    {day.day}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-18 leading-snug font-medium sm:text-22">
                      {day.title}
                    </span>
                    <span className="u-label mt-1.5 flex flex-col gap-1 text-ink-faint sm:flex-row sm:items-center sm:gap-2">
                      <span className="u-num">
                        {formatWeekday(day.date)} {formatShort(day.date)}
                      </span>
                      <span aria-hidden="true" className="max-sm:hidden">
                        ·
                      </span>
                      <span>
                        {day.stay ? `Night in ${day.stay}` : "Departure day"}
                      </span>
                    </span>
                    {/* What was chosen, visible without opening the day. */}
                    {!isOpen && summary ? (
                      <span
                        className="mt-2 line-clamp-1 block text-14"
                        style={{ color: ink }}
                      >
                        {summary}
                      </span>
                    ) : null}
                  </span>

                  <ExpandGlyph open={isOpen} />
                </button>
              </h4>

              <div
                id={panelId}
                hidden={!isOpen}
                className="border-t border-[var(--ink-hairline)] px-4 pt-5 pb-6 sm:px-5 sm:pb-7"
              >
                {/* --- The day, briefly --------------------------------- */}
                <p className="max-w-prose text-16 text-ink-soft">
                  {day.summary}
                </p>

                <ul className="mt-4 flex flex-wrap gap-1.5">
                  <Fact>{MEAL_LABEL[day.meals]}</Fact>
                  {day.distanceKm ? (
                    <Fact>{day.distanceKm} km by road</Fact>
                  ) : null}
                  {day.altitude ? (
                    <Fact warn={day.altitude >= 3500}>
                      {day.altitude.toLocaleString("en-IN")} m
                    </Fact>
                  ) : null}
                  {day.highlights.map((highlight) => (
                    <Fact key={highlight}>{highlight}</Fact>
                  ))}
                </ul>

                {options ? (
                  <div className="mt-8 flex flex-col gap-9">
                    {/* --- Getting there / meeting you ------------------ */}
                    {options.transfer ? (
                      <Section
                        title={options.transfer.legend}
                        hint={
                          options.transfer.options.some((t) => t.price > 0)
                            ? "Priced for the party, not per person."
                            : "Changes nothing on the price — just where we will be standing."
                        }
                      >
                        <div className={TILE_GRID}>
                          {options.transfer.options.map((option) => (
                            <ChoiceTile
                              key={option.id}
                              type="radio"
                              name={`transfer-${day.day}`}
                              id={`transfer-${day.day}-${option.id}`}
                              checked={selection?.transferId === option.id}
                              onChange={() =>
                                onChange(day.day, {
                                  ...emptySelection(selection),
                                  transferId: option.id,
                                })
                              }
                              label={option.name}
                              price={
                                option.price > 0
                                  ? `+${formatINR(option.price)}`
                                  : undefined
                              }
                              colour={colour}
                              ink={ink}
                            />
                          ))}
                        </div>
                      </Section>
                    ) : null}

                    {/* --- Where you sleep ------------------------------ */}
                    {options.stays.length > 0 ? (
                      <Section
                        title={`Tonight${options.place ? ` in ${options.place}` : ""}`}
                        hint="Upgrades are per person, per night."
                      >
                        {/*
                         * On a phone, a row you swipe — the way every room
                         * listing on a phone works — so three rooms cost one
                         * card's height instead of two rows of them. The
                         * third card is cut off at the edge, which is what
                         * says there is more. From `sm`, small fixed-width
                         * cards: the photograph is there to recognise the
                         * room, not to fill the column.
                         */}
                        <div className="-mt-1 -mr-4 -ml-1 flex snap-x snap-mandatory scrollbar-none gap-3 overflow-x-auto pt-1 pr-4 pb-1 pl-1 sm:m-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(9.5rem,11rem))] sm:gap-x-4 sm:gap-y-5 sm:overflow-visible sm:p-0">
                          {options.stays.map((option) => (
                            <StayCard
                              key={option.id}
                              name={`stay-${day.day}`}
                              id={`stay-${day.day}-${option.id}`}
                              checked={selection?.stayId === option.id}
                              onChange={() =>
                                onChange(day.day, {
                                  ...emptySelection(selection),
                                  stayId: option.id,
                                })
                              }
                              title={option.name}
                              image={option.image}
                              badge={KIND_LABEL[option.kind]}
                              price={
                                option.supplement === 0
                                  ? "Included"
                                  : `+${formatINR(option.supplement)} / night`
                              }
                              colour={colour}
                              ink={ink}
                            />
                          ))}
                        </div>
                      </Section>
                    ) : null}

                    {/* --- Anything else -------------------------------- */}
                    {options.activities.length > 0 ? (
                      <Section
                        title="Add to the day"
                        hint={`Priced per person, so ×${heads}.`}
                      >
                        <div className={TILE_GRID}>
                          {options.activities.map((option) => {
                            const on =
                              selection?.activityIds.includes(option.id) ??
                              false;
                            return (
                              <ChoiceTile
                                key={option.id}
                                type="checkbox"
                                name={`activity-${day.day}-${option.id}`}
                                id={`activity-${day.day}-${option.id}`}
                                checked={on}
                                onChange={() => {
                                  const current = emptySelection(selection);
                                  onChange(day.day, {
                                    ...current,
                                    activityIds: on
                                      ? current.activityIds.filter(
                                          (id) => id !== option.id,
                                        )
                                      : [...current.activityIds, option.id],
                                  });
                                }}
                                label={option.name}
                                price={
                                  option.price === 0
                                    ? "Free"
                                    : `+${formatINR(option.price)}`
                                }
                                colour={colour}
                                ink={ink}
                              />
                            );
                          })}
                        </div>
                      </Section>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** A selection object that is safe to spread, even on first touch. */
function emptySelection(selection: DaySelection | undefined): DaySelection {
  return selection ?? { activityIds: [] };
}

function Fact({
  children,
  warn = false,
}: {
  children: React.ReactNode;
  warn?: boolean;
}) {
  return (
    <li
      className={cn(
        "rounded-full px-3 py-1.5 text-12 leading-none",
        warn
          ? "bg-[color-mix(in_srgb,var(--ember)_13%,transparent)] text-ember-ink"
          : "bg-[rgb(46_42_36/0.055)] text-ink-soft",
      )}
    >
      {children}
    </li>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-16 font-medium">{title}</span>
      </legend>
      <p className="mt-1 text-14 text-ink-faint">{hint}</p>
      <div className="mt-4">{children}</div>
    </fieldset>
  );
}

/** The ring every chosen option shares, in the state's colour. */
const FOCUS =
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sage";

/**
 * Every non-room choice on a day, in one shape.
 *
 * Name and price, nothing else. Two across on a phone, three from `sm` —
 * a grid of equal tiles scans as "pick from these" in a way a stack of
 * sentence-length rows never did, and the descriptions those rows carried
 * were the reason one open day ran to two screens.
 */
const TILE_GRID = "grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5";

function ChoiceTile({
  type,
  name,
  id,
  checked,
  onChange,
  label,
  price,
  colour,
  ink,
}: {
  type: "radio" | "checkbox";
  name: string;
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  price?: string;
  colour: string;
  ink: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex h-full min-h-[4.5rem] cursor-pointer flex-col justify-between gap-2 rounded-[var(--radius-input)] border p-3",
        "transition-[border-color,background-color] duration-[var(--dur-micro)] ease-brand",
        FOCUS,
        checked
          ? "bg-[rgb(46_42_36/0.03)]"
          : "border-[var(--ink-hairline)] hover:border-[var(--ink-hairline-strong)]",
      )}
      style={checked ? { borderColor: colour } : undefined}
    >
      <input
        id={id}
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="u-sr-only"
      />
      <span className="flex items-start gap-2.5">
        <Mark type={type} checked={checked} colour={colour} />
        <span className="min-w-0 text-14 leading-snug font-medium">
          {label}
        </span>
      </span>
      {price ? (
        <span
          className={cn(
            "u-num pl-[1.875rem] text-14",
            !checked && "text-ink-soft",
          )}
          style={checked ? { color: ink } : undefined}
        >
          {price}
        </span>
      ) : null}
    </label>
  );
}

/**
 * A room, chosen on sight.
 *
 * Photograph, name, price — the three things anyone looks at on a listing,
 * and nothing else. The ring and the tick are both in the state's colour, and
 * the kind of place sits on the photograph so it costs no line of its own.
 */
function StayCard({
  name,
  id,
  checked,
  onChange,
  title,
  image,
  badge,
  price,
  colour,
  ink,
}: {
  name: string;
  id: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  image: string;
  badge: string;
  price: string;
  colour: string;
  ink: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "group/stay block w-[36vw] max-w-40 shrink-0 cursor-pointer snap-start rounded-[var(--radius-card)] sm:w-auto sm:max-w-none",
        FOCUS,
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="u-sr-only"
      />

      <span
        className="relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-input)] bg-shell transition-shadow duration-[var(--dur-micro)] ease-brand"
        style={{
          boxShadow: checked
            ? `0 0 0 2px var(--paper), 0 0 0 4px ${colour}`
            : undefined,
        }}
      >
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 640px) 36vw, 176px"
          className="object-cover transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover/stay:scale-[1.05]"
        />

        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-paper/90 px-2 py-1 text-12 leading-none text-ink backdrop-blur-sm">
          {badge}
        </span>

        {/* The tick. An empty ring until chosen, so it reads as selectable. */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full border-2",
            "transition-colors duration-[var(--dur-micro)] ease-brand",
            checked
              ? "border-transparent"
              : "border-paper bg-[rgb(0_0_0/0.18)]",
          )}
          style={checked ? { backgroundColor: colour } : undefined}
        >
          {checked ? <TickGlyph className="size-3.5 text-night-text" /> : null}
        </span>
      </span>

      <span className="mt-2 line-clamp-2 block text-14 leading-snug font-medium">
        {title}
      </span>
      <span
        className={cn("u-num mt-1 block text-14", !checked && "text-ink-soft")}
        style={checked ? { color: ink } : undefined}
      >
        {price}
      </span>
    </label>
  );
}

/** A circle for a radio, a square for a checkbox — the shape says "pick one". */
function Mark({
  type,
  checked,
  colour,
}: {
  type: "radio" | "checkbox";
  checked: boolean;
  colour: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "mt-px grid size-5 shrink-0 place-items-center border",
        "transition-colors duration-[var(--dur-micro)] ease-brand",
        type === "radio" ? "rounded-full" : "rounded-[6px]",
        checked ? "border-transparent" : "border-[var(--ink-hairline-strong)]",
      )}
      style={checked ? { backgroundColor: colour } : undefined}
    >
      {checked ? (
        type === "radio" ? (
          <span className="size-2 rounded-full bg-night-text" />
        ) : (
          <TickGlyph className="size-3.5 text-night-text" />
        )
      ) : null}
    </span>
  );
}

function TickGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}

function ExpandGlyph({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--ink-hairline)]"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "size-3.5 transition-transform duration-[var(--dur-micro)] ease-brand",
          open && "rotate-180",
        )}
      >
        <path d="M3.5 6 8 10.5 12.5 6" />
      </svg>
    </span>
  );
}
