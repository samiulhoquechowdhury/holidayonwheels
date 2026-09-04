"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";
import { formatShort, formatWeekday } from "@/lib/date";
import { Chip } from "@/components/primitives/Chip";
import { summariseDay, type DaySelection, type Selections } from "@/lib/extras";
import type { DayOptions, PlannedDay } from "@/lib/plan";
import type { MealPlan } from "@/content/types";

/**
 * The itinerary, as a form.
 *
 * This is the difference between a plan and a booking. Each day opens into
 * the three decisions that actually belong to that day — where we meet you,
 * where you sleep, and what else you want to do — and the total under it
 * moves as they are made. Nothing is a separate screen, because the only
 * place these questions make sense is next to the day they change.
 *
 * ### Radios where the answer is one thing, checkboxes where it is not
 *
 * You sleep in one hotel and arrive at one airport; those are radio groups,
 * and native ones, so a screen reader announces "2 of 3" and the arrow keys
 * work without a line of JavaScript. Activities are a checkbox each, because
 * you can do two things in a day. Getting this backwards — a checkbox list of
 * hotels — is the most common mistake in booking forms and it produces
 * enquiries with two rooms booked for one night.
 *
 * ### Every day starts complete
 *
 * The included option is pre-selected everywhere, so the itinerary is a
 * finished, costed trip before anything is touched. Every subsequent tap is
 * the traveller choosing to spend more, rather than being made to assemble a
 * trip out of parts before the total means anything.
 *
 * ### The last day has no bed
 *
 * `stays` comes back empty on the departure day — you do not sleep anywhere
 * on the day you fly home — so that section is simply absent rather than
 * present and disabled. It still offers the morning's activities and the
 * drop-off, which is the part of a departure day people actually want to
 * decide.
 */

const MEAL_LABEL: Record<MealPlan, string> = {
  breakfast: "Breakfast",
  "half-board": "Breakfast & dinner",
  "full-board": "All meals",
  none: "No meals",
};

const KIND_LABEL: Record<string, string> = {
  included: "In the price",
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
  // Day one open, the rest closed. A nine-day trip with every panel open is
  // four screens of form before the first decision, and it reads as work.
  const [open, setOpen] = useState<number[]>([1]);
  const allOpen = open.length === days.length;

  const toggle = (day: number) =>
    setOpen((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day],
    );

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-14 text-ink-faint">
          Every day is already costed. Open one to change where you sleep or add
          something to it.
        </p>
        <button
          type="button"
          onClick={() => setOpen(allOpen ? [] : days.map((d) => d.day))}
          className="u-label min-h-11 shrink-0 px-1 underline underline-offset-4"
          style={{ color: ink }}
        >
          {allOpen ? "Collapse all days" : "Open every day"}
        </button>
      </div>

      <ol className="flex flex-col">
        {days.map((day, index) => {
          const options = dayOptions[index];
          const selection = selections[day.day];
          const isOpen = open.includes(day.day);
          const panelId = `plan-day-${day.day}`;
          const summary = options ? summariseDay(options, selection) : null;

          return (
            <li
              key={day.day}
              className="border-t border-[var(--ink-hairline)] last:border-b"
            >
              <h4>
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
                    <span className="u-num mt-1 block text-12 text-ink-soft">
                      {formatWeekday(day.date)} {formatShort(day.date)}
                    </span>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-18 font-medium sm:text-22">
                      {day.title}
                    </span>
                    {!isOpen ? (
                      <>
                        <span className="mt-1.5 line-clamp-2 block text-16 text-ink-soft">
                          {day.summary}
                        </span>
                        {/* What was chosen, visible without opening the day.
                            A choice hidden inside a closed panel is a choice
                            the traveller cannot check before sending. */}
                        {summary ? (
                          <span
                            className="u-label mt-3 flex items-center gap-2"
                            style={{ color: ink }}
                          >
                            <span
                              aria-hidden="true"
                              className="size-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: colour }}
                            />
                            {summary}
                          </span>
                        ) : null}
                      </>
                    ) : null}
                  </span>

                  <ExpandGlyph open={isOpen} />
                </button>
              </h4>

              <div
                id={panelId}
                hidden={!isOpen}
                className="pb-8 sm:pl-[calc(4rem+1.5rem)]"
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
                        <span aria-hidden="true" style={{ color: ink }}>
                          —
                        </span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {options ? (
                  <div className="mt-9 flex flex-col gap-9">
                    {options.transfer ? (
                      <OptionGroup
                        legend={options.transfer.legend}
                        note={options.transfer.note}
                      >
                        {options.transfer.options.map((option) => (
                          <OptionRow
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
                            title={option.name}
                            blurb={option.blurb}
                            price={
                              option.price === 0
                                ? "Included"
                                : `+${formatINR(option.price)}`
                            }
                            priceNote={
                              option.price === 0 ? undefined : "for the party"
                            }
                            colour={colour}
                            ink={ink}
                          />
                        ))}
                      </OptionGroup>
                    ) : null}

                    {options.stays.length > 0 ? (
                      <OptionGroup
                        legend="Tonight"
                        note={`Where you sleep${options.place ? ` in ${options.place}` : ""}. The first is the room the trip price already bought; the others are the difference, per person per night.`}
                      >
                        {options.stays.map((option) => (
                          <OptionRow
                            key={option.id}
                            type="radio"
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
                            blurb={option.blurb}
                            tag={KIND_LABEL[option.kind]}
                            href={
                              option.homestaySlug
                                ? `/homestays/${option.homestaySlug}`
                                : undefined
                            }
                            price={
                              option.supplement === 0
                                ? "Included"
                                : `+${formatINR(option.supplement)}`
                            }
                            priceNote={
                              option.supplement === 0
                                ? undefined
                                : "per person, per night"
                            }
                            colour={colour}
                            ink={ink}
                          />
                        ))}
                      </OptionGroup>
                    ) : null}

                    {options.activities.length > 0 ? (
                      <OptionGroup
                        legend="Anything else"
                        note={`Not already in the day above — everything here is genuinely additional. Priced per person, so ×${heads}.`}
                      >
                        {options.activities.map((option) => {
                          const on =
                            selection?.activityIds.includes(option.id) ?? false;
                          return (
                            <OptionRow
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
                              title={option.name}
                              blurb={option.blurb}
                              tag={option.duration}
                              price={
                                option.price === 0
                                  ? "No charge"
                                  : `+${formatINR(option.price)}`
                              }
                              priceNote={
                                option.price === 0 ? undefined : "per person"
                              }
                              colour={colour}
                              ink={ink}
                            />
                          );
                        })}
                      </OptionGroup>
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

function OptionGroup({
  legend,
  note,
  children,
}: {
  legend: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="u-label">{legend}</legend>
      <p className="mt-2 max-w-prose text-14 text-ink-faint">{note}</p>
      <div className="mt-4 flex flex-col gap-2.5">{children}</div>
    </fieldset>
  );
}

/**
 * One choice.
 *
 * The input is visually hidden and the whole card is the label, so the target
 * is the card rather than a 16px dot — and the focus ring lives on the label
 * via `has-[:focus-visible]`, so keyboard focus is visible on the thing that
 * looks focusable. The control itself is a real native input underneath,
 * which is what makes the arrow keys, the group announcement and the form
 * semantics work without any of it being reimplemented.
 */
function OptionRow({
  type,
  name,
  id,
  checked,
  onChange,
  title,
  blurb,
  tag,
  href,
  price,
  priceNote,
  colour,
  ink,
}: {
  type: "radio" | "checkbox";
  name: string;
  id: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  blurb: string;
  tag?: string;
  /** Renders a link out to the page for this option, where one exists. */
  href?: string;
  price: string;
  priceNote?: string;
  colour: string;
  ink: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "group/opt relative flex cursor-pointer items-start gap-4 rounded-[var(--radius-input)] border p-4",
        "transition-[border-color,background-color] duration-[var(--dur-micro)] ease-brand",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sage",
        checked
          ? "bg-paper"
          : "border-[var(--ink-hairline)] hover:border-[var(--ink-hairline-strong)] hover:bg-paper/60",
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

      {/* The mark. A circle for a radio and a square for a checkbox, because
          the shape is what tells a user whether they can pick two. */}
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center border",
          "transition-colors duration-[var(--dur-micro)] ease-brand",
          type === "radio" ? "rounded-full" : "rounded-[6px]",
          checked
            ? "border-transparent"
            : "border-[var(--ink-hairline-strong)]",
        )}
        style={checked ? { backgroundColor: colour } : undefined}
      >
        {checked ? (
          type === "radio" ? (
            <span className="size-2 rounded-full bg-night-text" />
          ) : (
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5 text-night-text"
            >
              <path d="M3 8.5 6.5 12 13 4.5" />
            </svg>
          )
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        {/*
         * The price sits in the title's own row, not in a third column.
         * A fixed right-hand column costs about a third of a 390px screen,
         * and it was spending it on "+₹3,500" while pushing "The vehicle we
         * already booked" into four wrapped lines. Here it wraps under the
         * title on a phone and sits right-aligned beside it from `sm`.
         */}
        <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-16 font-medium">{title}</span>
            {tag ? <span className="u-label text-ink-faint">{tag}</span> : null}
          </span>

          <span className="flex shrink-0 items-baseline gap-2 sm:flex-col sm:items-end sm:gap-1">
            <span
              className={cn("u-num text-14", !checked && "text-ink-soft")}
              style={checked ? { color: ink } : undefined}
            >
              {price}
            </span>
            {priceNote ? (
              <span className="text-12 text-ink-faint">{priceNote}</span>
            ) : null}
          </span>
        </span>

        <span className="mt-1.5 block text-14 text-ink-soft">{blurb}</span>
        {href ? (
          // Stops the click reaching the label, which would toggle the
          // option the visitor was only trying to read about.
          <Link
            href={href}
            onClick={(event) => event.stopPropagation()}
            className="u-label mt-2.5 inline-flex min-h-8 items-center underline underline-offset-4"
            style={{ color: ink }}
          >
            See the house
          </Link>
        ) : null}
      </span>
    </label>
  );
}

function ExpandGlyph({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-[var(--ink-hairline)] transition-colors duration-[var(--dur-micro)] ease-brand group-hover:border-[var(--ink-hairline-strong)]"
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
