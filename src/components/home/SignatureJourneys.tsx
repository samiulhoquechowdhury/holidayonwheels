import Image from "next/image";
import Link from "next/link";
import { Rise } from "@/components/motion/Rise";
import { ArrowButton } from "@/components/primitives/LuxeButton";
import { getTourBySlug } from "@/content/tours";
import { stateColours } from "@/config/palette";
import type { StateSlug } from "@/content/types";
import { getDestinationName } from "@/content/destinations";
import { stateShots } from "@/config/showcase";
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
 * The three are named rather than taken off the top of the featured list.
 * Ordered by featured flag alone the section opened Assam, Meghalaya, Assam —
 * the same state twice in a row of three, which makes the region look smaller
 * than it is on the one screen whose job is to make it look larger. Naming
 * them also lets the row carry an argument: the plains, the frontier and the
 * high Himalaya, in ascending order of altitude and of nerve, from an easy
 * week at ₹74,500 to two passes above 4,000m.
 *
 * The photograph follows the trip's state, not its position in the grid. It
 * used to index `tourShots` by slot, so a card's picture changed whenever the
 * running order did and matched its state only by luck. Keyed by state, a
 * place looks the same here as it does on the destinations index.
 *
 * The label over each photograph is drawn hollow and fills solid on hover
 * (`.u-knockout`). Outlined type lets the picture read through the word, so
 * the card can carry a huge place-name without a scrim flattening the image
 * underneath it. It is the one piece of type on the site that sits on a
 * photograph, and it earns it by being transparent most of the time.
 */
/**
 * The three trips the home page leads on, in order.
 *
 * Assam is the feature: it is the cheapest, the only one of the three that
 * needs no permit and the only one rated easy, so it is the one most readers
 * can actually picture themselves on. The two behind it are what the region
 * is for once that is established.
 */
const SIGNATURE_SLUGS = [
  "brahmaputra-and-the-rhino-country",
  "tawang-and-sela-pass",
  "sikkim-north-gurudongmar",
] as const;

/**
 * The five states the three cards above do not cover.
 *
 * Derived from `SIGNATURE_SLUGS` rather than typed out, so editing the
 * running order can never leave this list claiming a state is missing that is
 * sitting in the row beside it.
 */
const SHOWN = new Set(
  SIGNATURE_SLUGS.map((slug) => getTourBySlug(slug)?.states[0]).filter(Boolean),
);
const REST = (Object.keys(stateColours) as StateSlug[]).filter(
  (state) => !SHOWN.has(state),
);
const REST_NAMES = listOf(REST.map((state) => getDestinationName(state)));

/** `a, b and c` — British, so no Oxford comma. */
function listOf(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function SignatureJourneys() {
  const tours = SIGNATURE_SLUGS.map(getTourBySlug).filter(
    (tour): tour is Tour => Boolean(tour),
  );

  return (
    /*
     * No heading, no eyebrow, no button, and the same paper as the manifesto
     * above it — because this *is* the manifesto's last paragraph.
     *
     * It used to open with "Signature routes" over "The trips we would book
     * ourselves" and a "Plan your own" button on the right. All three were
     * restating what the section above had just finished arguing. The
     * manifesto ends on "we do not sell the eight states, we sell the week
     * you spend in them"; the honest next thing is to show three weeks, not
     * to clear the throat and introduce them.
     *
     * So the ground matches, the top padding is gone, and the bento reads as
     * the evidence under the claim rather than as a second section making its
     * own case. The way into the planner is still here — it is the fourth
     * tile, which asks for it in the one place somebody is already looking
     * for an alternative.
     */
    <section className="relative bg-paper pt-0 pb-[var(--section-pad)]">
      <div className="u-container-wide">
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
          className="grid gap-4 lg:grid-cols-12 lg:grid-rows-[repeat(2,minmax(0,1fr))] lg:gap-5"
        >
          {tours[0] ? (
            <li className="lg:col-span-5 lg:row-span-2">
              <JourneyCard tour={tours[0]} feature />
            </li>
          ) : null}
          {tours[1] ? (
            <li className="lg:col-span-7">
              <JourneyCard tour={tours[1]} />
            </li>
          ) : null}
          {tours[2] ? (
            <li className="lg:col-span-4">
              <JourneyCard tour={tours[2]} />
            </li>
          ) : null}

          {/* The fourth tile is not a trip. It stops the bento reading as an
              incomplete row and puts the way into the planner where the eye
              already is.

              It also has a job the other three cannot do: say that the other
              five states exist. Three cards out of eight states reads as a
              catalogue of three, and somebody whose week is in Meghalaya has
              no reason to believe this company goes there. So the tile wears
              a fan of the five it is not showing — the same overlapping-print
              device as the homestays stack on this page — and names them.

              The prints are decorative and `aria-hidden`: the five names are
              in the text below them, so nothing is said in pictures alone. */}
          <li className="lg:col-span-3">
            <Link
              href="/destinations#plan"
              className="group flex h-full min-h-56 flex-col justify-between gap-6 overflow-hidden rounded-[var(--radius-card)] bg-clay p-7 text-clay-on transition-colors duration-[var(--dur)] ease-brand hover:bg-clay-deep"
            >
              <span>
                <span className="u-label">Not quite it?</span>

                <span
                  aria-hidden="true"
                  className="mt-5 flex h-20 items-center"
                >
                  {REST.map((state, index) => (
                    <span
                      key={state}
                      className={cn(
                        "relative block size-16 shrink-0 overflow-hidden rounded-[var(--radius-input)]",
                        "border-2 border-clay shadow-[var(--shadow-soft)]",
                        "transition-transform duration-[var(--dur)] ease-brand",
                        index > 0 && "-ml-7",
                        // Fanned, and opened a little under the pointer so the
                        // stack reads as more than one object.
                        index % 2 === 0 ? "-rotate-6" : "rotate-6",
                        "motion-safe:group-hover:rotate-0",
                      )}
                      style={{ zIndex: REST.length - index }}
                    >
                      <Image
                        src={stateShots[state] ?? ""}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                  ))}
                </span>
              </span>

              <span>
                <span className="block font-display text-28 leading-[var(--leading-display)] lg:text-36">
                  Customise your holiday as per your dates
                </span>
                <span className="mt-3 block text-14 text-clay-on/80">
                  {REST_NAMES} are all on the map too.
                </span>
                <span className="mt-6 flex items-center justify-between">
                  <span className="u-label">Start planning</span>
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
 *
 * The card opens the planner on its state rather than the trip's own page.
 * Three named weeks are what makes the region concrete here, but the thing
 * being sold is a trip built around somebody's dates — so the click goes
 * where that starts, with the state already answered. The trips themselves
 * are still reachable in full from each state's write-up.
 */
function JourneyCard({
  tour,
  feature = false,
}: {
  tour: Tour;
  feature?: boolean;
}) {
  const state = tour.states[0];
  const image = stateShots[state];

  return (
    <Link
      href={`/destinations?state=${state}#plan`}
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
          this darkens the half of the frame the type actually sits on.
          Strengthened when the cards moved to state photography: a snowfield
          and a wall of prayer flags are far brighter than the frames that
          were here before, and at the old 0.24 midpoint the strapline and the
          price sat on white at roughly 2:1. The top half is untouched, so the
          picture still reads. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(20_18_15/0.94)] from-10% via-[rgb(20_18_15/0.55)] via-45% to-transparent"
      />

      {/* The length badge is gone, and so is the price below. This section is
          the recommendation, not the catalogue — a reader here is deciding
          whether a place appeals, and three cards each shouting a different
          number turned that into a comparison between figures none of which
          mean anything until the dates are chosen. Both still sit on the trip
          page, where they are being chosen rather than skimmed.

          The permit flag stays. It is the one fact that changes what somebody
          has to do rather than what it costs, and it reads as reassurance
          rather than as a price tag. */}
      {tour.requiresILP ? (
        <span className="absolute top-6 right-6 lg:top-8 lg:right-8">
          <span className="u-glass-dark u-label rounded-full px-4 py-2">
            ILP included
          </span>
        </span>
      ) : null}

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
        </span>
        <ArrowButton tone="paper" />
      </span>
    </Link>
  );
}
