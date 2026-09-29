import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionShell } from "@/components/layout/SectionShell";
import { JumpBar } from "@/components/layout/JumpBar";
import { Rise } from "@/components/motion/Rise";
import { Accent } from "@/components/primitives/Accent";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { ActivityCard } from "@/components/cards/ResultCard";
import {
  ACTIVITY_BANDS,
  ACTIVITY_CATEGORIES,
  getActivities,
  getActivitiesByBand,
  getActivityRange,
} from "@/content/activities";
import { activityShots } from "@/config/showcase";
import { paletteCycle } from "@/config/palette";
import { formatINR } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Things to do around Guwahati",
  description:
    "Eleven half-days and evenings within reach of Guwahati — a sunset cruise on the Brahmaputra, rhino at Pobitora, the silk village at Sualkuchi, the market food walk. Priced per person, transport and guide included.",
};

/**
 * Things to do around Guwahati.
 *
 * Rebuilt around one complaint: a reader could not tell what this page *was*.
 * Three things were wrong and all three were structural.
 *
 *  - **The first screen showed no product.** A full viewport went to one
 *    headline and three lines of copy, with the right half of the page empty,
 *    so the first activity sat below the fold. The masthead is now half the
 *    height and carries the most-booked thing beside it, so the page
 *    demonstrates itself before it describes itself.
 *  - **It never said how any of it worked.** Whether these were bookable,
 *    what the price covered, whether you needed a trip to go on one — all of
 *    it lived on the detail pages. Three lines under the headline now answer
 *    that, because a visitor who has to click to find out what a page sells
 *    usually does not click.
 *  - **It was organised by taxonomy rather than by decision.** Grouping ran
 *    water / wildlife / heritage / craft / food, which is how a curator
 *    thinks. Nobody stands in a lobby at eight in the morning in a heritage
 *    mood; they think "I have until two". Grouping is by time needed now, and
 *    category travels on each card as a coloured chip so the mood is still
 *    answerable.
 *
 * The comparison table under the bands exists because eleven items across
 * three sections still cannot be held in the head at once. Duration, distance
 * and price on one line, sortable by eye, is the fastest way to answer "which
 * of these fits" — and it is the only view that shows all eleven at once.
 */
export default function ActivitiesPage() {
  const range = getActivityRange();
  const all = getActivities();
  const lead = all.find((a) => a.featured) ?? all[0];

  const bands = ACTIVITY_BANDS.map((band, index) => ({
    ...band,
    colour: paletteCycle[index % paletteCycle.length],
    items: getActivitiesByBand(band.id),
  })).filter((band) => band.items.length > 0);

  return (
    <>
      {/* --- Masthead: what this is, and one of them ------------------- */}
      <SectionShell
        tint="paper"
        width="wide"
        spacing="flush"
        className="pt-[calc(var(--header-h)+3rem)] pb-14 lg:pt-[calc(var(--header-h)+4.5rem)] lg:pb-20"
      >
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16">
          <div>
            <Eyebrow rule>
              {range.count} things to do · all within a day of Guwahati
            </Eyebrow>
            <h1 className="mt-7 max-w-2xl text-48 lg:text-88">
              Half a day in Guwahati, <Accent>well</Accent> spent
            </h1>

            {/*
             * How it works, in three lines and above the fold. This is the
             * part that was missing: the page listed eleven things without
             * ever saying what buying one involved.
             */}
            <dl className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-3">
              <Point term="Everything is a day or less">
                Out of the city and back the same day. Nothing here needs a
                night away.
              </Point>
              <Point term="The price is per person">
                Transport from your hotel, the guide and entry fees are in it.
                From {formatINR(range.fromPrice)}.
              </Point>
              <Point term="Added to a trip, or on its own">
                Most people slot one into a spare morning. You do not need to be
                booked on anything else.
              </Point>
            </dl>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <LuxeButtonLink href="#all" variant="primary">
                Compare all {range.count}
              </LuxeButtonLink>
              <LuxeButtonLink href="/destinations#plan" variant="ghost">
                Plan the trip around them
              </LuxeButtonLink>
            </div>
          </div>

          {/*
           * One activity, whole, beside the headline. A card the reader can
           * actually price and picture does more to explain this page than
           * another paragraph would.
           */}
          {lead ? (
            <Rise delay={0.1}>
              <Link
                href={`/activities/${lead.slug}`}
                className="group block overflow-hidden rounded-[var(--radius-card)] border border-[var(--ink-hairline)] transition-colors duration-[var(--dur-micro)] ease-brand hover:border-[var(--ink-hairline-strong)]"
              >
                <span className="relative block aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={lead.image ?? activityShots[lead.slug]}
                    alt={lead.heroAlt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-[1.04]"
                  />
                  <span className="u-glass u-label absolute top-4 left-4 rounded-full px-4 py-2 text-ink">
                    Most booked
                  </span>
                </span>
                <span className="block p-6">
                  <span className="font-display text-28">{lead.name}</span>
                  <span className="mt-2 block text-16 text-ink-soft">
                    {lead.strapline}
                  </span>
                  <span className="u-label mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-ink-faint">
                    <span>{lead.durationLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{distanceLabel(lead.distanceKm)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="u-num text-clay-ink">
                      From {formatINR(lead.fromPrice)}
                    </span>
                  </span>
                </span>
              </Link>
            </Rise>
          ) : null}
        </div>
      </SectionShell>

      <JumpBar
        label="Jump to a length"
        align="centre"
        items={bands.map((band) => ({
          id: band.id,
          label: band.label,
          colour: band.colour.surface,
          ink: band.colour.ink,
          note: String(band.items.length),
        }))}
      />

      {bands.map((band, index) => (
        <SectionShell
          key={band.id}
          id={band.id}
          tint={index % 2 === 0 ? "paper" : "shell"}
          width="wide"
          className="scroll-mt-[calc(var(--header-h)+4rem)]"
        >
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--ink-hairline)] pb-8">
            <div>
              <h2 className="text-36 lg:text-48">
                <span
                  aria-hidden="true"
                  className="mr-4 inline-block size-2.5 rounded-full align-middle"
                  style={{ backgroundColor: band.colour.surface }}
                />
                {band.label}
              </h2>
              <p className="mt-3 max-w-md text-16 text-ink-soft">
                {band.blurb}
              </p>
            </div>
            <p className="u-label text-ink-faint">
              {band.items.length}{" "}
              {band.items.length === 1 ? "thing to do" : "things to do"}
            </p>
          </div>

          <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {band.items.map((activity, cardIndex) => (
              <li key={activity.slug}>
                <Rise delay={Math.min(cardIndex, 3) * 0.05} distance={20}>
                  <ActivityCard
                    activity={activity}
                    priority={index === 0 && cardIndex < 3}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                  />
                </Rise>
              </li>
            ))}
          </ul>
        </SectionShell>
      ))}

      {/* --- All eleven, on one screen -------------------------------- */}
      <SectionShell
        id="all"
        tint="sand"
        width="wide"
        className="scroll-mt-[calc(var(--header-h)+4rem)]"
      >
        <Eyebrow rule>Side by side</Eyebrow>
        <h2 className="mt-6 max-w-2xl text-36 lg:text-48">
          All {range.count}, on <Accent>one</Accent> screen
        </h2>
        <p className="mt-4 max-w-xl text-16 text-ink-soft">
          {range.inCity} of them never leave the city. The furthest is{" "}
          {range.furthestKm} km out.
        </p>

        {/*
         * A table on a desktop and a list of rows on a phone — the same
         * markup, because a table that scrolls sideways on a phone is a table
         * nobody reads. The header row is hidden below `md` and each cell
         * carries its own label there instead.
         */}
        <div className="mt-10 overflow-hidden rounded-[var(--radius-panel)] border border-[var(--ink-hairline)] bg-paper">
          <div className="u-label hidden grid-cols-[2.2fr_1fr_1fr_1fr_0.8fr] gap-4 border-b border-[var(--ink-hairline)] px-6 py-4 text-ink-faint md:grid">
            <span>What</span>
            <span>How long</span>
            <span>How far</span>
            <span>When</span>
            <span className="text-right">From</span>
          </div>

          <ul>
            {[...all]
              .sort(
                (a, b) =>
                  a.durationHours - b.durationHours ||
                  a.fromPrice - b.fromPrice,
              )
              .map((activity) => {
                const category = ACTIVITY_CATEGORIES.find(
                  (c) => c.id === activity.category,
                );
                return (
                  <li
                    key={activity.slug}
                    className="border-b border-[var(--ink-hairline)] last:border-b-0"
                  >
                    <Link
                      href={`/activities/${activity.slug}`}
                      className="group grid gap-2 px-6 py-5 transition-colors duration-[var(--dur-micro)] ease-brand hover:bg-shell md:grid-cols-[2.2fr_1fr_1fr_1fr_0.8fr] md:items-baseline md:gap-4"
                    >
                      <span>
                        <span className="block text-18 group-hover:underline">
                          {activity.name}
                        </span>
                        <span className="u-label mt-1.5 block text-ink-faint">
                          {category?.label}
                        </span>
                      </span>
                      <Cell label="How long">{activity.durationLabel}</Cell>
                      <Cell label="How far">
                        {distanceLabel(activity.distanceKm)}
                      </Cell>
                      <Cell label="When">{activity.bestTime}</Cell>
                      <span className="u-num text-16 md:text-right">
                        {formatINR(activity.fromPrice)}
                      </span>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>

        <p className="mt-5 text-14 text-ink-faint">
          Prices are per person and include transport from your hotel, the guide
          and entry fees. Park and permit fees where they apply are listed on
          each page.
        </p>
      </SectionShell>

      <SectionShell tint="night" spacing="tight" width="wide">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <p className="max-w-2xl text-22 text-night-text lg:text-28">
            Any of these can be <Accent>built into</Accent> a trip — plan the
            days and tell us which mornings are free.
          </p>
          <LuxeButtonLink href="/destinations#plan" variant="onDark">
            Plan a trip
          </LuxeButtonLink>
        </div>
      </SectionShell>
    </>
  );
}

/** "In the city" beats "0 km", and "50 km out" beats "50". */
function distanceLabel(km: number): string {
  return km === 0 ? "In the city" : `${km} km out`;
}

function Point({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[var(--ink-hairline)] pt-4">
      <dt className="u-label text-ink">{term}</dt>
      <dd className="mt-2 text-14 text-ink-soft">{children}</dd>
    </div>
  );
}

/** Carries its own label below `md`, where the table header is not shown. */
function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="text-14 text-ink-soft md:text-16">
      <span className="u-label mr-2 text-ink-faint md:hidden">{label}</span>
      {children}
    </span>
  );
}
