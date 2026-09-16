"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";
import { formatLong, formatMedium, formatRange } from "@/lib/date";
import { Chip } from "@/components/primitives/Chip";
import { Accent } from "@/components/primitives/Accent";
import { LuxeButton, LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { PlannedItinerary } from "./PlannedItinerary";
import { tourShots } from "@/config/showcase";
import { partyDef } from "@/lib/party";
import { stateColours } from "@/config/palette";
import {
  buildExtras,
  defaultSelections,
  type DaySelection,
  type Selections,
} from "@/lib/extras";
import type { TripPlan } from "@/lib/plan";
import { glideToElement } from "@/lib/scroll";

/**
 * The itinerary, and the form it turned into.
 *
 * Everything before this screen produced a draft. This screen is where the
 * draft becomes specific: each day opens into where we meet you, where you
 * sleep and what else you want to do, and the panel beside it moves as those
 * are answered. Nothing is a separate "extras" step, because the only place
 * those questions make sense is beside the day they change.
 *
 * The panel is the part that has to be trusted, so it is built to be checked:
 *
 *  - **Two totals, never one.** What the trip costs, and what has been added
 *    to it, kept apart down to the last line. A single number that silently
 *    absorbs four upgrades is a number nobody can verify.
 *  - **The arithmetic is spelled out.** "×6 nights · ×4 people" beside every
 *    line. Nobody should have to reverse-engineer a total to check it.
 *  - **It says it is an estimate, in the panel, not in a footnote.** A figure
 *    that turns out to be wrong later costs more than one that was honest
 *    about being provisional.
 *
 * "How we shaped this" is the other half of the same argument. A generated
 * itinerary that cannot explain itself reads as a template with the state
 * name swapped in; one that says *why* the 5,430-metre day is missing reads
 * as a person having thought about it.
 *
 * The catalogue trips at the foot are not an upsell. A traveller whose dates
 * happen to line up with a fixed departure gets a guaranteed price and a
 * group already forming, which is a better outcome than a bespoke draft and
 * worth losing the bespoke enquiry for.
 */
export function PlannerResult({
  plan,
  sent,
  onSend,
  onChangeDates,
  onRestart,
}: {
  plan: TripPlan;
  sent: boolean;
  onSend: () => void;
  onChangeDates: () => void;
  onRestart: () => void;
}) {
  const party = partyDef(plan.party);
  const heads = plan.adults + plan.children;

  /*
   * The itinerary takes the *state's* colour, not the party's.
   *
   * Colour on this site identifies a place and only a place — that is the
   * whole value of the system, and it is why a reader who has seen magenta
   * three times beside the word Manipur has learned a code nobody taught
   * them. A Meghalaya trip drawn in the family card's blue would be the one
   * page on the site where the colour means something else.
   *
   * The party keeps its own colour on the cards in step two, where it is
   * identifying a party rather than a place.
   */
  const { surface: colour, ink } = stateColours[plan.state];

  /*
   * Starts on the included option for every day, so the trip on screen is
   * complete and costed before anything is touched. The parent keys this
   * component on `plan.reference`, so a re-planned trip gets fresh
   * selections rather than carrying a Sikkim lodge onto a Meghalaya day.
   */
  const [selections, setSelections] = useState<Selections>(() =>
    defaultSelections(plan.dayOptions),
  );

  const extras = useMemo(
    () => buildExtras(plan.dayOptions, selections, heads),
    [plan.dayOptions, selections, heads],
  );

  const grandTotal = plan.quote.total + extras.total;
  const deposit = Math.round((grandTotal * 0.25) / 500) * 500;

  /*
   * Confirm, then bring the confirmation into view. From the pinned bar on a
   * phone the confirm block can be several days up the page, and a request
   * that succeeds somewhere off-screen looks exactly like one that did
   * nothing.
   */
  function send() {
    onSend();
    requestAnimationFrame(() => {
      const block = document.getElementById("plan-confirm");
      if (block) glideToElement(block);
    });
  }

  function setDay(day: number, next: DaySelection) {
    setSelections((current) => ({ ...current, [day]: next }));
  }

  return (
    // Room for the pinned summary below `lg`, until the enquiry is sent.
    <div className={cn(!sent && "max-lg:pb-24")}>
      {/* --- What this is --------------------------------------------- */}
      <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[var(--ink-hairline)] pb-10">
        <div className="min-w-0">
          <p className="u-label flex flex-wrap items-center gap-3 text-ink-faint">
            <span
              aria-hidden="true"
              className="h-0.5 w-12 shrink-0 rounded-full"
              style={{ backgroundColor: colour }}
            />
            Reference {plan.reference}
          </p>
          <h2 className="mt-6 max-w-3xl text-36 lg:text-64">
            {plan.nights} nights in <Accent>{plan.stateName}</Accent>
          </h2>
          <p className="u-num mt-5 text-18 text-ink-soft lg:text-22">
            {formatRange(plan.startDate, plan.endDate)}
          </p>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          <li>
            <Chip tone="sage">{party.label}</Chip>
          </li>
          <li>
            <Chip>
              {plan.adults} {plan.adults === 1 ? "adult" : "adults"}
              {plan.children > 0
                ? `, ${plan.children} ${plan.children === 1 ? "child" : "children"}`
                : ""}
            </Chip>
          </li>
          <li>
            <Chip>{plan.dayCount} days</Chip>
          </li>
          {plan.requiresILP ? (
            <li>
              <Chip tone="ember">Permit needed</Chip>
            </li>
          ) : null}
        </ul>
      </div>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_380px] lg:gap-16">
        {/* --- The days, and the decisions on them -------------------- */}
        <div className="min-w-0">
          <h3 className="text-28">Day by day</h3>
          <p className="mt-3 max-w-prose text-16 text-ink-soft">
            Drafted against your dates from the routes we run, and every day is
            already priced. Open one to change where you sleep, tell us where to
            meet you, or add something to it.
          </p>

          <PlannedItinerary
            className="mt-8"
            days={plan.days}
            dayOptions={plan.dayOptions}
            selections={selections}
            onChange={setDay}
            colour={colour}
            ink={ink}
            heads={heads}
          />

          {/*
           * Confirm, directly under the last day.
           *
           * It used to be the last thing on the page, below the price
           * reasoning and a row of fixed departures — so having made every
           * choice, the visitor had to scroll past two unrelated sections to
           * find out how to finish, and plenty of people reasonably assume a
           * page that ends in "other trips" has nothing left to submit. The
           * action belongs where the choosing ends. It repeats the trip and
           * the live total beside the button, so what is being confirmed is
           * on screen at the moment it is confirmed.
           *
           * "Confirm booking", and the line under it says plainly that no
           * payment is taken and the price is confirmed in writing — which is
           * true, and which is the thing anyone hesitating over that button
           * wants to know.
           */}
          <div
            id="plan-confirm"
            className="mt-6 scroll-mt-[calc(var(--header-h)+1rem)] rounded-[var(--radius-card)] border bg-paper p-5 sm:p-6"
            style={{ borderColor: colour }}
          >
            {sent ? (
              <div>
                <Chip tone="sage">Booking request received</Chip>
                <p className="mt-5 font-display text-28 leading-[var(--leading-display)] sm:text-36">
                  We have it.
                </p>
                <p className="mt-4 max-w-prose text-16 text-ink-soft">
                  Your reference is{" "}
                  <span className="u-num text-ink">{plan.reference}</span>.
                  Someone who has driven this route will confirm availability
                  and the final price in writing within one working day —
                  usually the same day.
                </p>
                <p className="u-num mt-4 text-14 text-ink-faint">
                  {formatLong(plan.startDate)} · {plan.dayCount} days ·{" "}
                  {plan.stateName} · {formatINR(grandTotal)}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <LuxeButtonLink href="/destinations" variant="ghost">
                    Look at the other states
                  </LuxeButtonLink>
                  <button
                    type="button"
                    onClick={onRestart}
                    className="u-label min-h-11 px-2 text-ink-faint underline underline-offset-4 transition-colors hover:text-ink"
                  >
                    Plan another trip
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
                  <div className="min-w-0">
                    <p className="u-label text-ink-faint">Your trip</p>
                    <p className="mt-2 font-display text-22 leading-[var(--leading-display)] sm:text-28">
                      {plan.nights} nights in {plan.stateName}
                    </p>
                    <p className="u-num mt-1.5 text-14 text-ink-soft">
                      {formatRange(plan.startDate, plan.endDate)} ·{" "}
                      {party.label} · {plan.adults}{" "}
                      {plan.adults === 1 ? "adult" : "adults"}
                      {plan.children > 0
                        ? `, ${plan.children} ${plan.children === 1 ? "child" : "children"}`
                        : ""}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="u-label text-ink-faint">
                      {extras.total > 0 ? "Total, with your choices" : "Total"}
                    </p>
                    <p className="u-num mt-1 text-28">
                      {formatINR(grandTotal)}
                    </p>
                  </div>
                </div>

                {/*
                 * A normal-sized button, at the end of a row — not a
                 * full-width slab. At column width a large block button was
                 * the heaviest object on the screen, heavier than the total it
                 * sits under, and a submit that shouts reads as a commitment
                 * nobody was ready to make. The reassurance sits beside it,
                 * where the eye goes just before the click.
                 */}
                <div className="mt-5 flex flex-col gap-3 border-t border-[var(--ink-hairline)] pt-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
                  <p className="text-14 text-ink-faint lg:max-w-xs">
                    No payment now — we confirm availability and the final price
                    in writing within a day.{" "}
                    <button
                      type="button"
                      onClick={onChangeDates}
                      className="underline underline-offset-4 transition-colors hover:text-ink"
                    >
                      Change the dates
                    </button>
                  </p>
                  <LuxeButton
                    variant="clay"
                    onClick={send}
                    // Desktop only. Below `lg` the pinned bar at the foot of the
                    // screen carries this same button, and two "Confirm
                    // booking" buttons on one phone screen reads as two
                    // different things to press.
                    className="shrink-0 max-lg:hidden"
                  >
                    Confirm booking
                  </LuxeButton>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- The money, the reasoning, and the next move -------------- */}
        {/* Sticky, and capped to the viewport with its own scroll. A party
            that upgrades six nights and adds four activities grows this panel
            past the screen, and a sticky element taller than the viewport
            pins its top and hides its total. */}
        <aside className="u-sticky-panel flex flex-col gap-8 lg:self-start lg:pr-1">
          <div
            className="rounded-[var(--radius-panel)] border bg-paper p-7"
            style={{ borderColor: colour }}
          >
            <p className="u-label text-ink-faint">The trip</p>
            <p className="u-num mt-3 font-display text-48 leading-none">
              {formatINR(plan.quote.perAdult)}
              <span className="ml-2 font-sans text-14 text-ink-soft">
                per adult
              </span>
            </p>

            <dl className="mt-7 flex flex-col gap-4 border-t border-[var(--ink-hairline)] pt-6">
              {plan.quote.lines.map((line) => (
                <div key={line.label}>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-14 text-ink-soft">{line.label}</dt>
                    <dd className="u-num shrink-0 text-14">
                      {formatINR(line.amount)}
                    </dd>
                  </div>
                  {line.note ? (
                    <p className="mt-1 text-12 text-ink-faint">{line.note}</p>
                  ) : null}
                </div>
              ))}
            </dl>

            {/*
             * Kept in its own block with its own subtotal rather than folded
             * into the lines above. The traveller chose these; they should be
             * able to see exactly what choosing them cost, and to see it go
             * back to zero if they change their mind.
             */}
            <div className="mt-6 border-t border-[var(--ink-hairline)] pt-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="u-label text-ink-faint">What you added</p>
                <p className="u-num text-14" style={{ color: ink }}>
                  {extras.total > 0
                    ? `+${formatINR(extras.total)}`
                    : "Nothing yet"}
                </p>
              </div>

              {extras.total > 0 ? (
                <dl className="mt-4 flex flex-col gap-4">
                  {[
                    ...extras.stays,
                    ...extras.activities,
                    ...extras.transfers,
                  ].map((line) => (
                    <div key={line.key}>
                      <div className="flex items-baseline justify-between gap-4">
                        <dt className="text-14 text-ink-soft">{line.label}</dt>
                        <dd className="u-num shrink-0 text-14">
                          {formatINR(line.amount)}
                        </dd>
                      </div>
                      <p className="mt-1 text-12 text-ink-faint">
                        {line.detail}
                      </p>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-2 text-14 text-ink-soft">
                  Every day is on the room and the vehicle the price already
                  covers. Open a day to change that.
                </p>
              )}
            </div>

            <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-[var(--ink-hairline)] pt-6">
              <span className="text-16">Total</span>
              <span className="u-num text-22">{formatINR(grandTotal)}</span>
            </div>
            <p className="mt-3 text-14 text-ink-soft">
              {formatINR(deposit)} confirms it; the balance is due six weeks
              before you fly.
            </p>

            <p className="mt-6 border-t border-[var(--ink-hairline)] pt-5 text-12 text-ink-faint">
              An estimate, not a quote. It is built from what we charge for
              comparable days in {plan.stateName} and it excludes flights into
              the region and travel insurance. We confirm the figure in writing
              before anything is payable.
            </p>
          </div>

          {plan.shaping.length > 0 ? (
            <div className="rounded-[var(--radius-panel)] bg-paper p-7">
              <h4 className="u-label text-ink-faint">How we shaped this</h4>
              <ul className="mt-4 flex flex-col gap-4">
                {plan.shaping.map((line) => (
                  <li key={line} className="text-14 text-ink-soft">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {plan.warnings.length > 0 ? (
            <div>
              <h4 className="u-label text-ink-faint">Before you reply</h4>
              <ul className="mt-4 flex flex-col gap-5">
                {plan.warnings.map((line) => (
                  <li
                    key={line}
                    className="border-l-2 py-1 pl-5 text-14 text-ink-soft"
                    style={{ borderColor: colour }}
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      {/* --- Fixed departures that happen to fit ---------------------- */}
      {plan.matches.length > 0 ? (
        <div className="mt-16 border-t border-[var(--ink-hairline)] pt-12">
          <div className="max-w-2xl">
            <h3 className="text-28">Or take one we already run</h3>
            <p className="mt-3 text-16 text-ink-soft">
              Written for the same state and the same kind of party, with the
              price fixed, the dates published and a group already forming.
              Sometimes the trip that already exists is the better answer.
            </p>
          </div>

          <ul className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plan.matches.map((match, index) => (
              <li key={match.slug}>
                <Link
                  href={`/tours/${match.slug}`}
                  className="group flex h-full flex-col"
                >
                  <span className="relative block aspect-[3/2] overflow-hidden rounded-[var(--radius-card)]">
                    <Image
                      // By position, not by region — the same reason the home
                      // page's bento does it. Two of the three matches are
                      // usually in the same state, and the region map holds
                      // two frames per state, so keying on region put the
                      // identical photograph on neighbouring cards. A reader
                      // reads that as a bug rather than as a theme.
                      src={match.image ?? tourShots[index % tourShots.length]}
                      alt={match.heroAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, 320px"
                      className="object-cover transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-[1.04]"
                    />
                  </span>
                  <span className="u-label mt-4 flex items-center gap-2 text-ink-faint">
                    {match.nights} nights
                    {match.nightsDelta === 0 ? (
                      <span style={{ color: ink }}>· exactly your length</span>
                    ) : null}
                  </span>
                  <span className="mt-2 block text-18 group-hover:underline group-hover:underline-offset-4">
                    {match.title}
                  </span>
                  <span className="mt-2 block flex-1 text-14 text-ink-soft">
                    {match.strapline}
                  </span>
                  <span className="u-num mt-4 block text-16">
                    From {formatINR(match.fromPrice)}
                    {match.nextDeparture ? (
                      <span className="u-label ml-3 text-ink-faint">
                        next {formatMedium(match.nextDeparture)}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/*
       * The pinned summary, phones only.
       *
       * The itinerary above it is the length of the trip — six to nine days
       * of prose, each with three decisions on it — so in flow the total and
       * the send button are several screens below the day somebody is
       * actually reading. Two things then go wrong: the number stops moving
       * where you can see it while you change rooms, and the way to finish is
       * somewhere you have to go looking for.
       *
       * Pinning both fixes both. It carries the live total, so every choice
       * on every day is answered in the same place, and the action that ends
       * the flow is always one tap away. It goes as soon as the enquiry is
       * sent — there is nothing left to do with it then.
       *
       * `fixed` rather than `sticky` for the same reason as the step bar:
       * `SectionShell` sets `overflow: hidden`, which stops sticky sticking.
       */}
      {!sent ? (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-[var(--ink-hairline)] bg-paper/95 px-[var(--gutter)] py-3 backdrop-blur-md lg:hidden">
          <span className="min-w-0">
            <span className="u-label block text-ink-faint">
              {extras.total > 0 ? "Total, with your extras" : "Total"}
            </span>
            <span className="u-num block truncate text-18">
              {formatINR(grandTotal)}
            </span>
          </span>
          <LuxeButton variant="clay" onClick={send} className="shrink-0">
            Confirm booking
          </LuxeButton>
        </div>
      ) : null}
    </div>
  );
}
