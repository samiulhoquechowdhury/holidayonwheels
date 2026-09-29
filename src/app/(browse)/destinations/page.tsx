import Image from "next/image";
import type { Metadata } from "next";
import { SectionShell } from "@/components/layout/SectionShell";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Rise } from "@/components/motion/Rise";
import { ParallaxMedia } from "@/components/motion/Parallax";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { JumpBar } from "@/components/layout/JumpBar";
import { MonthStrip } from "@/components/destinations/MonthStrip";
import { getDestinations } from "@/content/destinations";
import { TripPlanner } from "@/components/planner/TripPlanner";
import type { PlannerState } from "@/components/planner/types";
import { getTours, getTourSummaries } from "@/content/tours";
import { getRoute, maxDaysFor } from "@/content/routes";
import { stateColours } from "@/config/palette";
import { stateShots } from "@/config/showcase";
import { cn } from "@/lib/cn";
import { toISO } from "@/lib/date";
import type { Destination } from "@/content/types";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Plan a trip across the eight states of Northeast India — pick a state, tell us who is travelling and when, and get a dated day-by-day itinerary. Plus what each state is for, and when to go.",
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
 *    state was previously unreachable without scrolling past seven. It is the
 *    shared `JumpBar` — the events index uses the same one for months.
 *  - **A month strip** in place of a line of prose listing the good months —
 *    the single most useful upgrade on the page, and the only one that makes
 *    two states comparable at a glance.
 *
 * Order is west to east, matching the hero reel and the home index. Every
 * index of the map on this site agrees with every other.
 */
export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const destinations = getDestinations();
  const tours = getTours();
  const summaries = getTourSummaries();

  const tripCounts = Object.fromEntries(
    destinations.map((destination) => [
      destination.slug,
      tours.filter((tour) => tour.states.includes(destination.slug)).length,
    ]),
  );

  /*
   * The planner's view of a state. Assembled here rather than in the client
   * component for the usual reason — a `Destination` carries three paragraphs
   * of body copy, and eight of them would be serialised into the payload of a
   * page that renders one line of each.
   */
  const plannerStates: PlannerState[] = destinations.map((destination) => {
    const colour = stateColours[destination.slug];
    const route = getRoute(destination.slug);
    return {
      slug: destination.slug,
      name: destination.name,
      tagline: destination.tagline,
      gateway: destination.gateway,
      bestMonths: destination.bestMonths,
      knownFor: destination.knownFor,
      requiresILP: destination.requiresILP,
      region: destination.region,
      tripCount: summaries.filter((tour) =>
        tour.states.includes(destination.slug),
      ).length,
      minDays: route.minDays,
      maxDays: maxDaysFor(destination.slug),
      routeNote: route.note,
      image: stateShots[destination.slug] ?? "",
      colour: colour.surface,
      ink: colour.ink,
    };
  });

  return (
    <>
      {/*
       * The planner, at the top of the page it belongs to.
       *
       * It used to live at `/tours`, behind its own tab, which split one
       * question across two places: "which of the eight" was the whole of the
       * destinations page *and* the planner's first step. The tab is gone and
       * the flow starts here, because choosing a state and planning a trip to
       * it are the same decision.
       *
       * `overflow-visible` overrides the shell's clipping. An `overflow:
       * hidden` ancestor stops `position: sticky` working, and the price panel
       * beside the itinerary has to stay in view while the days scroll. `html`
       * already clips horizontal overflow site-wide, so nothing bleeds
       * sideways without it.
       */}
      <SectionShell
        tint="paper"
        width="wide"
        id="plan"
        spacing="flush"
        className="overflow-visible pt-[calc(var(--header-h)+3rem)] pb-[var(--section-pad)] lg:pt-[calc(var(--header-h)+4.5rem)]"
      >
        <TripPlanner
          states={plannerStates}
          eyebrow={`Built around your dates, from ${tours.length} routes we run`}
          // Resolved on the server so the earliest selectable date is the same
          // in the HTML and after hydration. `new Date()` in the client
          // component would differ across a midnight boundary or a timezone.
          today={toISO(new Date())}
          initialState={one("state")}
          initialParty={one("type")}
        />
      </SectionShell>

      {/*
       * Everything below is reading rather than planning, and it is hidden
       * once the planner is past its first step — see `.u-flow-hide`. Nobody
       * choosing rooms for day four of their own itinerary wants eight
       * encyclopaedia entries and a footer underneath it.
       */}
      <div className="u-flow-hide">
        {/*
         * The slim index, which sticks.
         *
         * There used to be a "What each of the eight is for" grid above it,
         * naming and picturing all eight states a second time directly under
         * the planner's own eight cards. Two full sets of the same eight, one
         * screen apart, made the page feel like it had restarted. The grid is
         * gone; the eight write-ups below are the answer to "what is each one
         * for", at the length that question deserves.
         *
         * This bar stays. It is the only way to reach the eighth state without
         * scrolling past seven, and a chip rail is not a third listing in the
         * way a grid of photographs is.
         */}
        <JumpBar
          label="Jump to a state"
          items={destinations.map((destination) => ({
            id: destination.slug,
            label: destination.name,
            colour: stateColours[destination.slug].surface,
            ink: stateColours[destination.slug].ink,
          }))}
        />

        {destinations.map((destination, index) => (
          <StateBlock
            key={destination.slug}
            destination={destination}
            index={index}
            tripCount={tripCounts[destination.slug] ?? 0}
          />
        ))}
      </div>
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

            {/* The planner leads. This block is the argument for a state;
                the action that follows an argument is to start, not to read
                a second article. "{n} trips" was the ghost button and it
                described a catalogue rather than naming what happens next —
                which is that the planner opens on this state and asks who is
                travelling. */}
            <div className="mt-10 flex flex-wrap gap-3">
              <LuxeButtonLink
                href={`/destinations?state=${destination.slug}#plan`}
              >
                Plan a trip to {destination.name}
              </LuxeButtonLink>
              <LuxeButtonLink
                href={`/destinations/${destination.slug}`}
                variant="ghost"
              >
                Read more
              </LuxeButtonLink>
            </div>
          </Rise>
        </div>
      </div>
    </SectionShell>
  );
}
