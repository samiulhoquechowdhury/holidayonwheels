import Image from "next/image";
import Link from "next/link";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Rise } from "@/components/motion/Rise";
import { Accent } from "@/components/primitives/Accent";
import {
  ArrowButton,
  LuxeButtonLink,
} from "@/components/primitives/LuxeButton";
import { getFeaturedTours } from "@/content/tours";
import { getDestinationName } from "@/content/destinations";
import { tourShots } from "@/config/showcase";
import { colourFor } from "@/config/palette";
import { formatINR } from "@/lib/currency";
import { cn } from "@/lib/cn";
import type { Tour } from "@/content/types";

/**
 * The featured trips, as a bento rather than a row of three equal cards.
 *
 * Three identical cards side by side is the single most common shape on the
 * internet and it tells the reader nothing: if all three are the same size,
 * none of them is the recommendation. Here the first trip is twice the height
 * of the others and holds the composition, and the eye goes to it before it
 * has read a word — which is precisely what a featured trip is for.
 *
 * The label over each photograph is drawn hollow and fills solid on hover
 * (`.u-knockout`). Outlined type lets the picture read through the word, so
 * the card can carry a huge place-name without a scrim flattening the image
 * underneath it. It is the one piece of type on the site that sits on a
 * photograph, and it earns it by being transparent most of the time.
 */
export function SignatureJourneys() {
  const tours = getFeaturedTours(3);

  return (
    <section className="relative bg-mint py-[var(--section-pad)]">
      <div className="u-container-wide">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Rise className="u-label mb-6 flex items-center gap-4 text-ink-faint">
              <span className="h-px w-12 bg-[var(--ink-hairline-strong)]" />
              Signature routes
            </Rise>
            <SplitReveal className="max-w-2xl text-48 lg:text-88">
              The trips we would <Accent>book</Accent> ourselves
            </SplitReveal>
          </div>
          <Rise delay={0.15}>
            <LuxeButtonLink href="/tours" variant="ghost">
              All trips
            </LuxeButtonLink>
          </Rise>
        </div>

        {/*
          Twelve columns, two equal rows. The first card claims five columns
          and both rows; the other three divide what is left. Below `lg` the
          whole thing collapses to a single column and the hierarchy is
          carried by order alone, which is the correct answer on a phone.

          The rows are explicitly `minmax(0,1fr)` rather than `grid-rows-2`.
          With `auto` rows the tall feature card sized row one to half of
          itself while the wide card below sized row two to its own min-height,
          and the two disagreed — which is what put the third card through the
          bottom of the second. Equal fractional rows cannot do that.
        */}
        <Rise
          as="ul"
          stagger={0.1}
          className="mt-14 grid gap-4 lg:mt-20 lg:grid-cols-12 lg:grid-rows-[repeat(2,minmax(0,1fr))] lg:gap-5"
        >
          {tours[0] ? (
            <li className="lg:col-span-5 lg:row-span-2">
              <JourneyCard tour={tours[0]} index={0} feature />
            </li>
          ) : null}
          {tours[1] ? (
            <li className="lg:col-span-7">
              <JourneyCard tour={tours[1]} index={1} />
            </li>
          ) : null}
          {tours[2] ? (
            <li className="lg:col-span-4">
              <JourneyCard tour={tours[2]} index={2} />
            </li>
          ) : null}

          {/* The fourth tile is not a trip. A solid clay panel closing the
              grid does two things a fourth photograph cannot: it stops the
              bento reading as an incomplete row, and it puts the catalogue
              link where the eye already is. */}
          <li className="lg:col-span-3">
            <Link
              href="/tours"
              className="group flex h-full min-h-56 flex-col justify-between rounded-[var(--radius-card)] bg-clay p-7 text-clay-on transition-colors duration-[var(--dur)] ease-brand hover:bg-clay-deep"
            >
              <span className="u-label">Everything else</span>
              <span>
                <span className="block font-display text-36 leading-[var(--leading-display)]">
                  47 routes across the eight
                </span>
                <span className="mt-6 flex items-center justify-between">
                  <span className="u-label">Browse the catalogue</span>
                  <ArrowButton tone="ink" />
                </span>
              </span>
            </Link>
          </li>
        </Rise>
      </div>
    </section>
  );
}

/**
 * One trip.
 *
 * `feature` switches the crop from landscape to portrait and the label up two
 * sizes — the same component, not a second one, so the two never drift apart.
 */
function JourneyCard({
  tour,
  index,
  feature = false,
}: {
  tour: Tour;
  /** Position in the bento. Picks the photograph — see `tourShots`. */
  index: number;
  feature?: boolean;
}) {
  const state = tour.states[0];
  const image = tourShots[index % tourShots.length];
  const colour = colourFor(state);

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className={cn(
        "group relative isolate flex h-full flex-col justify-end overflow-hidden",
        "rounded-[var(--radius-card)] bg-night p-6 text-night-text lg:p-8",
        feature
          ? "min-h-[30rem] lg:min-h-[44rem]"
          : "min-h-80 lg:min-h-[21rem]",
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={tour.heroAlt}
          fill
          sizes={
            feature
              ? "(max-width: 1024px) 100vw, 42vw"
              : "(max-width: 1024px) 100vw, 30vw"
          }
          className="u-media-push -z-10 object-cover"
        />
      ) : null}

      {/* Bottom-weighted scrim only. A full overlay would kill the picture;
          this darkens the third of the frame the type actually sits on. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(20_18_15/0.86)] via-[rgb(20_18_15/0.24)] to-transparent"
      />

      {/* Metadata rides the top edge, away from the title block. The state
          chip is filled in that state's own colour, which is how the palette
          gets learned: the same magenta appears on the Manipur row of the
          index two sections down. */}
      <span className="absolute inset-x-6 top-6 flex items-start justify-between gap-4 lg:inset-x-8 lg:top-8">
        <span
          className="u-label rounded-full px-4 py-2 text-night-text"
          style={{ backgroundColor: colour.surface }}
        >
          {tour.nights} nights · {tour.days} days
        </span>
        {tour.requiresILP ? (
          <span className="u-glass-dark u-label rounded-full px-4 py-2">
            ILP included
          </span>
        ) : null}
      </span>

      <span
        aria-hidden="true"
        className={cn(
          "u-knockout block font-display leading-[0.9] tracking-[var(--tracking-statement)]",
          feature ? "text-64 lg:text-88" : "text-48 lg:text-64",
        )}
      >
        {state ? getDestinationName(state) : tour.title}
      </span>

      <span className="mt-4 flex items-end justify-between gap-6 border-t border-[var(--night-hairline)] pt-5">
        <span className="min-w-0">
          <span className="block text-18 lg:text-22">{tour.title}</span>
          <span className="mt-1.5 block text-14 text-night-text-soft">
            {tour.strapline}
          </span>
          <span className="u-num u-label mt-4 block text-clay">
            From {formatINR(tour.fromPrice)} per person
          </span>
        </span>
        <ArrowButton tone="paper" />
      </span>
    </Link>
  );
}
