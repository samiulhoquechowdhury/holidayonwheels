import Image from "next/image";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Rise } from "@/components/motion/Rise";
import { ParallaxMedia } from "@/components/motion/Parallax";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { StateJumpBar } from "@/components/destinations/StateJumpBar";
import { MonthStrip } from "@/components/destinations/MonthStrip";
import { getDestinations } from "@/content/destinations";
import { getTours } from "@/content/tours";
import { stateColours } from "@/config/palette";
import { stateShots } from "@/config/showcase";
import { cn } from "@/lib/cn";
import type { Destination } from "@/content/types";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura and Sikkim — what each one is for, and when to go.",
};

/**
 * The eight states.
 *
 * Rebuilt on the home page's system, and the changes are not cosmetic:
 *
 *  - **The weave patterns are gone.** Every block used to sit on a tinted
 *    surface with a regional motif behind it and a decorated band between it
 *    and the next. That is eight patterned fields competing with eight
 *    photographs, and it read as decoration filling space. Blocks now
 *    alternate between paper and the state's own pale tint, and nothing sits
 *    behind the type.
 *  - **Colour carries the state.** Index number, month strip, stat figures
 *    and jump chip all take that state's colour from the shared palette, so
 *    the reader learns the code by the second block.
 *  - **A jump bar**, because the page is nine screens long and the eighth
 *    state was previously unreachable without scrolling past seven.
 *  - **A month strip** in place of a line of prose listing the good months —
 *    the single most useful upgrade on the page, and the only one that makes
 *    two states comparable at a glance.
 *
 * Order is west to east, matching the hero reel and the home index. Every
 * index of the map on this site agrees with every other.
 */
export default function DestinationsPage() {
  const destinations = getDestinations();
  const tours = getTours();

  return (
    <>
      <PageHero
        eyebrow="Eight states"
        title="Where you could go"
        accent="could"
        intro="Roughly west to east. Each of these is a different country in every way that matters to a traveller — language, food, altitude, religion and road quality."
        tint="paper"
        region="meghalaya"
      />

      <StateJumpBar destinations={destinations} />

      {destinations.map((destination, index) => (
        <StateBlock
          key={destination.slug}
          destination={destination}
          index={index}
          tripCount={
            tours.filter((tour) => tour.states.includes(destination.slug))
              .length
          }
        />
      ))}
    </>
  );
}

/**
 * One state.
 *
 * The layout alternates side to side, which is the oldest device in editorial
 * layout and still the right one for a list of eight peers: it gives the eye a
 * reason to keep going without ranking any of them. What stops it becoming
 * monotonous is that the *ground* alternates too — paper, then the state's own
 * tint — so the page changes temperature on every block.
 */
function StateBlock({
  destination,
  index,
  tripCount,
}: {
  destination: Destination;
  index: number;
  tripCount: number;
}) {
  const colour = stateColours[destination.slug];
  const flip = index % 2 === 1;
  const tint = index % 2 === 0 ? "paper" : destination.tint;

  return (
    <SectionShell
      id={destination.slug}
      tint={tint}
      width="wide"
      // Clears the fixed header *and* the sticky jump bar, so an anchor jump
      // lands on the heading rather than under two bars of chrome.
      className="scroll-mt-[calc(var(--header-h)+4rem)]"
    >
      <div
        className={cn(
          "grid items-center gap-10 lg:grid-cols-12 lg:gap-16",
          flip && "lg:[&>*:first-child]:order-2",
        )}
      >
        {/* --- The photograph ------------------------------------------- */}
        <div className="lg:col-span-5">
          <ParallaxMedia
            amount={12}
            className="aspect-[4/5] w-full rounded-[var(--radius-media)]"
          >
            <Image
              src={stateShots[destination.slug] ?? ""}
              alt={destination.heroAlt}
              fill
              priority={index < 2}
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </ParallaxMedia>
        </div>

        {/* --- The argument --------------------------------------------- */}
        <div className="lg:col-span-7">
          <Rise className="flex items-center gap-4">
            <span
              className="u-num font-display text-36 leading-none"
              style={{ color: colour.ink }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              aria-hidden="true"
              className="h-0.5 w-14 rounded-full"
              style={{ backgroundColor: colour.surface }}
            />
            <span className="u-label text-ink-faint">
              {destination.requiresILP ? "Inner Line Permit" : "No permit"}
            </span>
          </Rise>

          <SplitReveal className="mt-6 text-48 lg:text-88">
            {destination.name}
          </SplitReveal>

          <Rise delay={0.08}>
            <p className="u-lede mt-5 max-w-xl text-22 text-ink-soft lg:text-28">
              {destination.tagline}
            </p>
            <p className="mt-6 max-w-xl text-16 text-ink-soft">
              {destination.intro}
            </p>
          </Rise>

          {/* Three facts a traveller actually decides on, on one rule. */}
          <Rise delay={0.12}>
            <dl className="mt-9 grid grid-cols-2 gap-6 border-y border-[var(--ink-hairline)] py-6 sm:grid-cols-3">
              <div>
                <dt className="u-label text-ink-faint">Trips</dt>
                <dd
                  className="u-num mt-1.5 font-display text-28"
                  style={{ color: colour.ink }}
                >
                  {tripCount}
                </dd>
              </div>
              <div>
                <dt className="u-label text-ink-faint">Fly into</dt>
                <dd className="mt-1.5 text-16">{destination.gateway}</dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="u-label text-ink-faint">Known for</dt>
                <dd className="mt-1.5 text-16">
                  {destination.knownFor.slice(0, 2).join(", ")}
                </dd>
              </div>
            </dl>
          </Rise>

          <Rise delay={0.16}>
            <MonthStrip
              months={destination.bestMonths}
              colour={colour.surface}
              className="mt-8 max-w-xl"
            />

            <div className="mt-10 flex flex-wrap gap-3">
              <LuxeButtonLink href={`/destinations/${destination.slug}`}>
                Read about {destination.name}
              </LuxeButtonLink>
              {tripCount > 0 ? (
                <LuxeButtonLink
                  href={`/tours?state=${destination.slug}`}
                  variant="ghost"
                >
                  {tripCount} {tripCount === 1 ? "trip" : "trips"}
                </LuxeButtonLink>
              ) : null}
            </div>
          </Rise>
        </div>
      </div>
    </SectionShell>
  );
}
