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
import { formatINR } from "@/lib/currency";

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

  const from = Math.min(...houses.map((stay) => stay.fromPrice));
  const rating =
    houses.reduce((sum, stay) => sum + stay.rating, 0) / houses.length;
  const reviews = houses.reduce((sum, stay) => sum + stay.reviewCount, 0);
  const beds = houses.reduce((sum, stay) => sum + stay.bedrooms, 0);

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
      {/* --- Masthead ------------------------------------------------- */}
      <SectionShell
        tint="paper"
        width="wide"
        spacing="flush"
        className="pt-[calc(var(--header-h)+3rem)] pb-14 lg:pt-[calc(var(--header-h)+4.5rem)] lg:pb-20"
      >
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16">
          <div className="min-w-0 lg:col-span-2">
            <Eyebrow rule>{houses.length} houses · Guwahati</Eyebrow>
            <h1 className="mt-7 max-w-2xl text-48 lg:text-88">
              Stay in somebody&rsquo;s <Accent>house</Accent>
            </h1>
            <p className="mt-8 max-w-xl text-18 text-ink-soft lg:text-22">
              Four families in and around Guwahati, each one living in the house
              they let you into. They set their own rate. We take a booking
              commission and nothing else.
            </p>

            <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              <Figure label="Houses" value={String(houses.length)} />
              <Figure label="From" value={formatINR(from)} note="a night" />
              <Figure label="Rooms" value={String(beds)} note="in total" />
              <Figure
                label="Rated"
                value={rating.toFixed(1)}
                note={`${reviews.toLocaleString("en-IN")} reviews`}
              />
            </dl>
          </div>
        </div>
      </SectionShell>

      {/* --- The houses, browsable ------------------------------------ */}
      <SectionShell id="houses" tint="paper" width="wide" spacing="tight">
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
function Figure({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    /*
     * The note lives inside the <dd>, not beside it.
     *
     * A <div> inside a <dl> may wrap a <dt>/<dd> pair and nothing else. A
     * loose <p> in there is invalid, and axe flags the whole list for it.
     */
    <div className="border-t border-[var(--ink-hairline)] pt-4">
      <dt className="u-label text-ink-faint">{label}</dt>
      <dd className="mt-2">
        <span className="u-num block font-display text-28 lg:text-36">
          {value}
        </span>
        {note ? (
          <span className="u-label mt-1 block text-ink-faint">{note}</span>
        ) : null}
      </dd>
    </div>
  );
}
