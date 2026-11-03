import type { Metadata } from "next";
import Link from "next/link";
import { SectionShell } from "@/components/layout/SectionShell";
import { Accent } from "@/components/primitives/Accent";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { HomestayBrowser } from "@/components/homestays/HomestayBrowser";
import { getGuwahatiHomestays } from "@/content/homestays";
import { getDestinationName, getDestinations } from "@/content/destinations";
import { stateColours } from "@/config/palette";

export const metadata: Metadata = {
  title: "Homestays in Guwahati",
  description:
    "Four family-run houses in and around Guwahati — an old town house in Uzan Bazar, a hill home above the Brahmaputra, a north-bank house reached by ferry, and a weaving household at Sualkuchi. The family sets the rate; we take a booking commission and nothing else.",
};

/**
 * Homestays — Guwahati only, for now.
 *
 * The page used to spread twelve houses across eight states, which read as a
 * national network and was not one: most of those states have a single house
 * in them, and a grid with one card under a heading is a promise the business
 * cannot keep yet. It now does one thing honestly — Guwahati, four houses,
 * properly shown — and says plainly that the rest is coming.
 *
 * Three decisions behind the layout:
 *
 *  - **Four houses get rows, not cards.** A grid is for scanning a long list;
 *    with four there is no list to scan, so each house gets a full-width row
 *    with its photograph, its family, its rooms and its rate — enough to
 *    choose from without opening anything.
 *  - **The masthead carries no photograph.** It used to lead on the featured
 *    house, which with twelve houses sat a long way above that house's card.
 *    With four it sat directly on top of it: on a phone you scrolled past the
 *    same veranda twice in one thumb-flick, which reads as a bug. The rows
 *    own the photography now and the masthead owns the type.
 *  - **The host leads.** The argument for a homestay over a hotel is the
 *    family, so the family is the first line of every row and the building is
 *    the picture, not the headline.
 *  - **"Coming soon" is a line of state names and nothing more.** It is the
 *    part of the page you cannot act on, so it gets the least room on it.
 *
 * @see src/content/homestays.ts — the four Guwahati entries are PLACEHOLDER
 * data and must not launch. The block above them says what to replace.
 */
export default function HomestaysPage() {
  const houses = getGuwahatiHomestays();

  /*
   * Every state we do not yet let you book a house in, west to east.
   *
   * Named, not listed. An earlier pass printed each state's houses under it,
   * which made the block the largest thing on the page and gave the most
   * space to the part you cannot have. The names alone make the promise
   * specific enough.
   */
  const guwahatiStates = new Set(houses.map((stay) => stay.state));
  const laterStates = getDestinations()
    .filter((destination) => !guwahatiStates.has(destination.slug))
    .map((destination) => ({
      slug: destination.slug,
      name: getDestinationName(destination.slug),
      colour: stateColours[destination.slug],
    }));

  return (
    <>
      {/*
       * No masthead.
       *
       * This is a results page, and a results page opens on results. The
       * full-viewport headline that used to sit here — "Stay in somebody's
       * house" over four display figures — spent a whole screen saying what
       * the four cards underneath say better, and pushed the thing somebody
       * came for below the fold. The reference does not do it and neither
       * does this now: a line that says what you are looking at, then the
       * filters, then the houses.
       */}
      <SectionShell
        tint="paper"
        width="wide"
        spacing="flush"
        className="pt-[calc(var(--header-h)+2rem)] pb-10 lg:pt-[calc(var(--header-h)+2.5rem)] lg:pb-12"
      >
        <h1 className="max-w-2xl text-28 lg:text-36">
          Homestays in and around <Accent>Guwahati</Accent>
        </h1>
        <p className="mt-4 max-w-2xl text-16 text-ink-soft">
          Every one is owned and run by the family living in it, and they set
          their own rate. We take a booking commission and nothing else.
        </p>
      </SectionShell>

      {/* --- The houses, browsable ------------------------------------ */}
      <SectionShell
        id="houses"
        tint="paper"
        width="wide"
        spacing="flush"
        className="pb-20 lg:pb-28"
      >
        <HomestayBrowser houses={houses} />
      </SectionShell>

      {/* --- The rest of the map, not yet open ------------------------ */}
      <SectionShell id="soon" tint="paper" width="wide">
        <Eyebrow rule>Coming soon</Eyebrow>
        <h2 className="mt-6 max-w-2xl text-36 lg:text-48">
          The other states are <Accent>next</Accent>
        </h2>
        <p className="mt-6 max-w-xl text-18 text-ink-soft">
          We are signing houses one state at a time, and Guwahati went first
          because it is where every trip starts. Ask us about any of these in
          the meantime and we will arrange it by hand.
        </p>

        <ul className="mt-10 flex flex-wrap gap-3">
          {laterStates.map((state) => (
            <li
              key={state.slug}
              className="u-label flex items-center gap-2.5 rounded-full border border-[var(--ink-hairline)] px-4 py-2.5 text-ink-faint"
            >
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: state.colour.surface }}
              />
              {state.name}
            </li>
          ))}
        </ul>

        <p className="mt-10 text-16 text-ink-soft">
          Want a house in one of these before it opens here?{" "}
          <Link
            href="/contact"
            className="text-ink underline underline-offset-4"
          >
            Tell us which state
          </Link>{" "}
          and we will put it in the itinerary.
        </p>
      </SectionShell>

      <SectionShell tint="night" spacing="tight" width="wide">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <p className="max-w-2xl text-22 text-night-text lg:text-28">
            A house can be <Accent>built into</Accent> a trip — tell us which
            nights you want to spend in one.
          </p>
          <LuxeButtonLink href="/destinations#plan" variant="onDark">
            Plan a trip
          </LuxeButtonLink>
        </div>
      </SectionShell>
    </>
  );
}

/**
 * One house, at full width.
 *
 * Photograph on one side, everything worth knowing on the other, alternating
 * sides down the page so four rows do not read as four identical slabs. The
 * host is the first line because the host is the reason to be here; the rate
 * is last because it is the thing you check after you have decided you like
 * the place, not before.
 */
