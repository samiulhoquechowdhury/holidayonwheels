"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";
import { formatLong, formatMedium, formatRange } from "@/lib/date";
import { Chip } from "@/components/primitives/Chip";
import { Accent } from "@/components/primitives/Accent";
import { ItineraryTimeline } from "@/components/booking/ItineraryTimeline";
import { LuxeButton, LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { tourShots } from "@/config/showcase";
import { partyDef } from "@/lib/party";
import type { TripPlan } from "@/lib/plan";

/**
 * The itinerary.
 *
 * Everything before this screen was a form; this is the thing the form was
 * for, and it is built to be read rather than confirmed. The day-by-day is
 * the same timeline component the catalogue tours use — carrying real dates
 * this time, because on a trip that exists only for these dates the date is
 * the more useful of the two numbers.
 *
 * The three panels beside it are where the trust is won or lost:
 *
 *  - **The quote is indicative and says so, in the panel, not in a footnote.**
 *    A number that turns out to be wrong later costs more than a number that
 *    was honest about being an estimate.
 *  - **"How we shaped this" shows the reasoning.** A generated itinerary that
 *    cannot explain itself reads as a template with the state name swapped.
 *    One that says *why* the 5,430-metre day is missing reads as a person.
 *  - **What we left out is listed.** Naming the days that did not fit is the
 *    single most persuasive argument for a longer trip, and it is also just
 *    true.
 *
 * The catalogue trips at the foot are not an upsell. A traveller whose dates
 * happen to line up with a fixed departure gets a guaranteed price, a
 * guaranteed group and a page they can read tonight — which is a better
 * outcome than a bespoke draft, and worth losing the bespoke enquiry for.
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
  const dates = plan.days.map((day) => day.date);

  return (
    <div>
      {/* --- What this is --------------------------------------------- */}
      <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[var(--ink-hairline)] pb-10">
        <div className="min-w-0">
          <p className="u-label flex flex-wrap items-center gap-3 text-ink-faint">
            <span
              aria-hidden="true"
              className="h-0.5 w-12 shrink-0 rounded-full"
              style={{ backgroundColor: party.colour }}
            />
            Reference {plan.reference}
          </p>
          <h3 className="mt-6 max-w-3xl text-36 lg:text-64">
            {plan.nights} nights in <Accent>{plan.stateName}</Accent>
          </h3>
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
        {/* --- The days ----------------------------------------------- */}
        <div className="min-w-0">
          <h4 className="text-28">Day by day</h4>
          <p className="mt-3 max-w-prose text-16 text-ink-soft">
            Drafted against your dates from the routes we run. Nothing here is
            fixed — it is the version we would put in front of you first.
          </p>

          <ItineraryTimeline days={plan.days} dates={dates} className="mt-8" />

          {plan.notIncluded.length > 0 ? (
            <div className="mt-12 rounded-[var(--radius-card)] bg-shell p-7">
              <h5 className="u-label text-ink-faint">
                On this road but not in these dates
              </h5>
              <ul className="mt-4 flex flex-col gap-2">
                {plan.notIncluded.map((title) => (
                  <li key={title} className="flex gap-3 text-16 text-ink-soft">
                    <span aria-hidden="true" className="text-clay">
                      —
                    </span>
                    {title}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-14 text-ink-faint">
                Each of these is a day. Add {plan.notIncluded.length}{" "}
                {plan.notIncluded.length === 1 ? "night" : "nights"} and they
                come back in the order listed.
              </p>
            </div>
          ) : null}
        </div>

        {/* --- The money, the reasoning, and the next move -------------- */}
        <aside className="flex flex-col gap-8 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
          <div
            className="rounded-[var(--radius-panel)] border p-7"
            style={{ borderColor: party.colour }}
          >
            <p className="u-label text-ink-faint">Indicative, per person</p>
            <p className="u-num mt-3 font-display text-48 leading-none">
              {formatINR(plan.quote.perAdult)}
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

            <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-[var(--ink-hairline)] pt-6">
              <span className="text-16">Total</span>
              <span className="u-num text-22">
                {formatINR(plan.quote.total)}
              </span>
            </div>
            <p className="mt-3 text-14 text-ink-soft">
              {formatINR(plan.quote.deposit)} confirms it; the balance is due
              six weeks before you fly.
            </p>

            <p className="mt-6 border-t border-[var(--ink-hairline)] pt-5 text-12 text-ink-faint">
              An estimate, not a quote. It is built from what we charge for
              comparable days in {plan.stateName} and it excludes flights into
              the region and travel insurance. We confirm the figure in writing
              before anything is payable.
            </p>
          </div>

          {plan.shaping.length > 0 ? (
            <div className="rounded-[var(--radius-panel)] bg-shell p-7">
              <h5 className="u-label text-ink-faint">How we shaped this</h5>
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
              <h5 className="u-label text-ink-faint">Before you reply</h5>
              <ul className="mt-4 flex flex-col gap-5">
                {plan.warnings.map((line) => (
                  <li
                    key={line}
                    className="border-l-2 py-1 pl-5 text-14 text-ink-soft"
                    style={{ borderColor: party.colour }}
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
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h4 className="text-28">Or take one we already run</h4>
              <p className="mt-3 max-w-xl text-16 text-ink-soft">
                Written for the same state and the same kind of party, with a
                fixed price and a group already forming.
              </p>
            </div>
            <LuxeButtonLink href={`/tours?state=${plan.state}`} variant="ghost">
              Every {plan.stateName} trip
            </LuxeButtonLink>
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
                      <span style={{ color: party.ink }}>
                        · exactly your length
                      </span>
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

      {/* --- What happens next --------------------------------------- */}
      <div className="mt-16 border-t border-[var(--ink-hairline)] pt-12">
        {sent ? (
          <div className="max-w-2xl">
            <Chip tone="sage">Sent</Chip>
            <h4 className="mt-6 text-36">We have it.</h4>
            <p className="mt-5 text-18 text-ink-soft">
              Quote <span className="u-num">{plan.reference}</span> and someone
              who has driven this route will reply within one working day —
              usually the same day. They will come back with the same days,
              costed properly, and the two or three things they would change.
            </p>
            <p className="u-num mt-6 text-16 text-ink-soft">
              {formatLong(plan.startDate)} · {plan.dayCount} days ·{" "}
              {plan.stateName}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <LuxeButtonLink href="/tours" variant="ghost">
                Back to the trips
              </LuxeButtonLink>
              <button
                type="button"
                onClick={onRestart}
                className="u-label min-h-13 px-3 text-ink-faint underline underline-offset-4 transition-colors hover:text-ink"
              >
                Plan another
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-8">
            <p className="max-w-xl text-18 text-ink-soft">
              Send it and a person reads it. No deposit, no card, and no
              obligation on either side — you get the same days costed properly
              and the two or three things we would change.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <LuxeButton variant="clay" size="lg" onClick={onSend}>
                Send this to us
              </LuxeButton>
              <button
                type="button"
                onClick={onChangeDates}
                className={cn(
                  "u-label min-h-13 px-3 text-ink-faint underline underline-offset-4",
                  "transition-colors hover:text-ink",
                )}
              >
                Change the dates
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
