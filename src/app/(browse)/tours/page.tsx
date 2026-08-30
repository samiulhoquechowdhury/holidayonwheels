import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Rise } from "@/components/motion/Rise";
import { Accent } from "@/components/primitives/Accent";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { SearchBar } from "@/components/search/SearchBar";
import { TripPlanner } from "@/components/planner/TripPlanner";
import type { PlannerState } from "@/components/planner/types";
import { ToursBrowser } from "./ToursBrowser";
import { getTours, getTourSummaries } from "@/content/tours";
import { getDestinations } from "@/content/destinations";
import { getRoute, maxDaysFor } from "@/content/routes";
import { stateColours } from "@/config/palette";
import { stateShots } from "@/config/showcase";
import { toISO } from "@/lib/date";

export const metadata: Metadata = {
  title: "Guided tours",
  description:
    "Plan a trip across the eight states of Northeast India — pick a state, tell us who is travelling and when, and get a dated day-by-day itinerary and an indicative price.",
};

/**
 * The tours index, in two halves.
 *
 * **The planner comes first**, because the catalogue only serves a visitor who
 * already knows what they want. Someone who has decided on ten nights in
 * Meghalaya for a honeymoon in October is well served by forty-seven cards
 * and a filter rail; someone who has decided on "the Northeast, sometime in
 * the spring, with the kids" is not, and that is most of the people who
 * arrive here. The planner asks them the four questions an agent would ask on
 * the phone and answers with a dated itinerary.
 *
 * **The catalogue is still the whole catalogue**, below it, unchanged. Fixed
 * departures are a better outcome than a bespoke draft when one happens to
 * fit — guaranteed price, group already forming, a page you can read tonight
 * — so nothing here hides them, the hero links straight down to them, and the
 * planner's own result screen offers the ones that match.
 *
 * The query string is read here, on the server, rather than with
 * `useSearchParams` in the browser component. That keeps the whole result
 * list in the server-rendered HTML — with a client-side read it sat behind a
 * Suspense boundary and shipped a skeleton instead. It also lets the home
 * page's state index and journey tiles land *inside* the planner with their
 * first answer already given.
 */
export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  // Only the lean summary crosses into the client component.
  const tours = getTourSummaries();
  const total = getTours().length;
  const destinations = getDestinations();

  /*
   * The planner's view of a state. Assembled here rather than in the client
   * component for the usual reason — a `Destination` carries three paragraphs
   * of body copy and eight of them would be serialised into the payload of a
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
      tripCount: tours.filter((tour) => tour.states.includes(destination.slug))
        .length,
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
      <PageHero
        eyebrow={`${total} trips, or one built for you`}
        title="Tell us when you can go and we will draft the trip"
        accent="draft"
        media={false}
        intro="Answer four questions and you get a dated day-by-day itinerary for your own dates, with an indicative price — drawn from the same routes we have been running for years, not from a template."
        tint="paper"
        region="assam"
      >
        <div className="flex flex-col gap-8">
          <SearchBar className="max-w-3xl" />
          <p className="u-label text-ink-faint">
            {/* A real 44px target, not a 14px line of text. It is the only
                route past the planner on a phone, and it is the one link on
                this page a thumb has to find. */}
            <a
              href="#browse"
              className="inline-flex min-h-11 items-center underline underline-offset-4 transition-colors hover:text-ink"
            >
              Or skip straight to all {total} trips
            </a>
          </p>
        </div>
      </PageHero>

      {/*
       * The planner sits on a tint, not on paper. It is the one thing on this
       * page that is not a list, and the surface change is what says so
       * before a word of it is read.
       */}
      <SectionShell tint="shell" width="wide" id="plan">
        <TripPlanner
          states={plannerStates}
          // Resolved on the server so the earliest selectable date is the
          // same in the HTML and after hydration. `new Date()` in the client
          // component would differ across a midnight boundary or a timezone.
          today={toISO(new Date())}
          initialState={one("state")}
          initialParty={one("type")}
        />
      </SectionShell>

      <SectionShell tint="paper" id="browse">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[var(--ink-hairline)] pb-12">
          <div>
            <Rise className="u-label mb-6 flex items-center gap-4 text-ink-faint">
              <span className="h-px w-12 bg-[var(--ink-hairline-strong)]" />
              Fixed departures
            </Rise>
            <SplitReveal className="max-w-3xl text-48 lg:text-64">
              <>
                Or take one we already <Accent>run</Accent>
              </>
            </SplitReveal>
          </div>
          <Rise delay={0.15}>
            <p className="max-w-sm text-16 text-ink-soft">
              {total} trips with the price fixed, the dates published and the
              group already forming. Everything here can also be run privately
              on dates that suit you.
            </p>
          </Rise>
        </div>

        <div className="mt-14">
          <ToursBrowser
            tours={tours}
            destinations={destinations}
            initialFilters={{ type: one("type"), state: one("state") }}
          />
        </div>
      </SectionShell>

      <SectionShell tint="night" spacing="tight">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <p className="max-w-xl text-22 text-night-text lg:text-28">
            Nothing here quite it? Say what you are after in your own words and
            a person will answer.
          </p>
          <LuxeButtonLink href="/contact" variant="onDark">
            Write to us instead
          </LuxeButtonLink>
        </div>
      </SectionShell>
    </>
  );
}
