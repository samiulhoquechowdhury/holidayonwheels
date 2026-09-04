import type { Metadata } from "next";
import { SectionShell } from "@/components/layout/SectionShell";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { TripPlanner } from "@/components/planner/TripPlanner";
import type { PlannerState } from "@/components/planner/types";
import { getTours, getTourSummaries } from "@/content/tours";
import { getDestinations } from "@/content/destinations";
import { getRoute, maxDaysFor } from "@/content/routes";
import { stateColours } from "@/config/palette";
import { stateShots } from "@/config/showcase";
import { toISO } from "@/lib/date";

export const metadata: Metadata = {
  title: "Guided tours",
  description:
    "Plan a trip across the eight states of Northeast India — pick a state, tell us who is travelling and when, and get a dated day-by-day itinerary you can add rooms and activities to.",
};

/**
 * The trip planner.
 *
 * This page used to be a catalogue: forty-seven cards, a filter rail and a
 * hero to introduce them. It is now a single flow — where, who, when, who
 * exactly, and then a dated itinerary you can specify room by room and day by
 * day. Both halves of the old page are gone deliberately.
 *
 * **The hero went** because there is no longer a list at the top of this page
 * to introduce. There is a question, and a screen of preamble in front of a
 * question is a screen between the visitor and the only thing they came to
 * do. The planner starts at the top and its first question is the `h1`.
 *
 * **The fixed-departure index went** because it answered a question this page
 * no longer asks. A catalogue serves the visitor who already knows what they
 * want; the planner serves the one who does not, and on a region most people
 * cannot name eight states of, that is nearly all of them. The forty-seven
 * trips still exist at `/tours/[slug]`, they still carry their own departure
 * dates and prices, and the planner's own result screen offers the two or
 * three that fit the dates it was given — which is a better way to meet a
 * fixed departure than a wall of cards nobody filtered.
 *
 * The query string is still read here, on the server, so the home page's
 * state index and its journey tiles land *inside* the planner with their
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
      {/*
       * The planner is the whole page, so this section owns the offset for
       * the fixed header that `PageHero` used to. Paper, not a tint: the form
       * controls inside it are recessed shells, and on a shell ground they
       * disappear.
       */}
      <SectionShell
        tint="paper"
        width="wide"
        id="plan"
        spacing="flush"
        className="pt-[calc(var(--header-h)+3rem)] pb-[var(--section-pad)] lg:pt-[calc(var(--header-h)+4.5rem)]"
      >
        <TripPlanner
          states={plannerStates}
          eyebrow={`Built around your dates, from ${total} routes we run`}
          // Resolved on the server so the earliest selectable date is the
          // same in the HTML and after hydration. `new Date()` in the client
          // component would differ across a midnight boundary or a timezone.
          today={toISO(new Date())}
          initialState={one("state")}
          initialParty={one("type")}
        />
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
