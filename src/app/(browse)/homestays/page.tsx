import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionShell } from "@/components/layout/SectionShell";
import { JumpBar } from "@/components/layout/JumpBar";
import { Rise } from "@/components/motion/Rise";
import { Accent } from "@/components/primitives/Accent";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { StayCard } from "@/components/cards/ResultCard";
import { LocatorMap } from "@/components/homestays/LocatorMap";
import { getHomestays } from "@/content/homestays";
import { getDestinationName } from "@/content/destinations";
import { stateColours } from "@/config/palette";
import { formatINR } from "@/lib/currency";
import type { Homestay, MealPlan } from "@/content/types";

export const metadata: Metadata = {
  title: "Homestays",
  description:
    "Twelve family-run homestays across the eight states of Northeast India — stilt houses on Majuli, Apatani farmhouses at Ziro, a hut on a floating island on Loktak. The family sets the rate; we take a booking commission and nothing else.",
};

const MEALS: Record<MealPlan, string> = {
  "full-board": "All meals",
  "half-board": "Breakfast and dinner",
  breakfast: "Breakfast",
  none: "No meals",
};

/**
 * Homestays.
 *
 * The page sells somebody's house, and the old one never showed you whose.
 * Three changes, in the order they matter:
 *
 *  - **The host is on the card now.** "Jitu and Rina Payeng" was buried on the
 *    detail page while the index led with the building. On a page whose whole
 *    argument is that a family lives here and sets the rate, the family is the
 *    product and the roof is the packaging.
 *  - **The first screen shows a house.** It opened on a full viewport of
 *    headline beside a photograph of an anonymous boutique bedroom — a picture
 *    that actively contradicted the copy under it. The masthead is half the
 *    height and carries a real one, with its host, its state and its rate.
 *  - **Grouped by state, jumpable.** Twelve houses across eight states is the
 *    one list on this site where "which state" *is* the question, because it
 *    is the question the rest of the trip has already answered. The note on
 *    the old version — that grouping leaves a card and a half per heading —
 *    was right about headings and wrong about the need: the jump bar does the
 *    grouping without spending a screen on it.
 *
 * The locator keeps its column but no longer repeats the twelve names
 * underneath itself in eight-point type; the list below is the list.
 */
export default function HomestaysPage() {
  const homestays = getHomestays();

  const states = new Set(homestays.map((stay) => stay.state));
  const from = Math.min(...homestays.map((stay) => stay.fromPrice));
  const rating =
    homestays.reduce((sum, stay) => sum + stay.rating, 0) / homestays.length;
  const reviews = homestays.reduce((sum, stay) => sum + stay.reviewCount, 0);
  const allMeals = homestays.filter(
    (stay) => stay.mealsIncluded === "full-board",
  ).length;

  const lead = homestays.find((stay) => stay.featured) ?? homestays[0];

  /* Grouped in the order the states appear in `getDestinations()`. */
  const grouped = [...states].map((state) => ({
    state,
    name: getDestinationName(state),
    colour: stateColours[state],
    items: homestays.filter((stay) => stay.state === state),
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
          <div>
            <Eyebrow rule>
              {homestays.length} houses · {states.size} of 8 states
            </Eyebrow>
            <h1 className="mt-7 max-w-2xl text-48 lg:text-88">
              Stay in somebody&rsquo;s <Accent>house</Accent>
            </h1>
            <p className="mt-8 max-w-xl text-18 text-ink-soft lg:text-22">
              Every one is owned and run by the family living in it, and they
              set their own rate. We take a booking commission and nothing else.
              Two of them have no road to them at all.
            </p>

            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              <Figure label="Houses" value={String(homestays.length)} />
              <Figure label="From" value={formatINR(from)} note="a night" />
              <Figure
                label="All meals in"
                value={`${allMeals} of ${homestays.length}`}
              />
              <Figure
                label="Rated"
                value={rating.toFixed(1)}
                note={`${reviews.toLocaleString("en-IN")} reviews`}
              />
            </dl>
          </div>

          {lead ? (
            <Rise delay={0.1}>
              <Link
                href={`/homestays/${lead.slug}`}
                className="group block overflow-hidden rounded-[var(--radius-card)] border border-[var(--ink-hairline)] transition-colors duration-[var(--dur-micro)] ease-brand hover:border-[var(--ink-hairline-strong)]"
              >
                <span className="relative block aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={lead.image ?? ""}
                    alt={lead.heroAlt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-[1.04]"
                  />
                  <span className="u-glass u-label absolute top-4 left-4 rounded-full px-4 py-2 text-ink">
                    {lead.locality}
                  </span>
                </span>
                <span className="block p-6">
                  <span className="u-label text-ink-faint">
                    {lead.hostName}&rsquo;s house
                  </span>
                  <span className="mt-2 block font-display text-28">
                    {lead.name}
                  </span>
                  <span className="mt-2 block text-16 text-ink-soft">
                    {lead.strapline}
                  </span>
                  <span className="u-label mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-ink-faint">
                    <span>Sleeps {lead.maxGuests}</span>
                    <span aria-hidden="true">·</span>
                    <span>{MEALS[lead.mealsIncluded]}</span>
                    <span aria-hidden="true">·</span>
                    <span className="u-num text-clay-ink">
                      From {formatINR(lead.fromPrice)} a night
                    </span>
                  </span>
                </span>
              </Link>
            </Rise>
          ) : null}
        </div>
      </SectionShell>

      <JumpBar
        label="Jump to a state"
        align="centre"
        items={grouped.map((group) => ({
          id: group.state,
          label: group.name,
          colour: group.colour.surface,
          ink: group.colour.ink,
          note: String(group.items.length),
        }))}
      />

      {/* --- The houses, by state, with the locator alongside --------- */}
      <SectionShell tint="paper" width="wide">
        <div className="grid gap-12 lg:grid-cols-[1fr_300px] lg:gap-16">
          <div className="min-w-0">
            {grouped.map((group) => (
              <section
                key={group.state}
                id={group.state}
                className="scroll-mt-[calc(var(--header-h)+4.5rem)] not-first:mt-16 lg:not-first:mt-20"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--ink-hairline)] pb-5">
                  <h2 className="text-28 lg:text-36">
                    <span
                      aria-hidden="true"
                      className="mr-3 inline-block size-2.5 rounded-full align-middle"
                      style={{ backgroundColor: group.colour.surface }}
                    />
                    {group.name}
                  </h2>
                  <p className="u-label text-ink-faint">
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "house" : "houses"}
                  </p>
                </div>

                <ul className="mt-9 grid gap-x-8 gap-y-14 sm:grid-cols-2">
                  {group.items.map((stay, index) => (
                    <li key={stay.slug}>
                      <Rise delay={Math.min(index, 3) * 0.05} distance={20}>
                        <HostedStay stay={stay} priority={index < 2} />
                      </Rise>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {/* Sticks alongside on desktop, sits above the list on mobile
              where a sticky panel would eat the viewport. */}
          <div className="order-first lg:order-none">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <LocatorMap homestays={homestays} />
            </div>
          </div>
        </div>
      </SectionShell>

      {/* --- All twelve, side by side --------------------------------- */}
      <SectionShell id="all" tint="sand" width="wide">
        <Eyebrow rule>Side by side</Eyebrow>
        <h2 className="mt-6 max-w-2xl text-36 lg:text-48">
          All {homestays.length}, and what they <Accent>cost</Accent>
        </h2>
        <p className="mt-4 max-w-xl text-16 text-ink-soft">
          Rates are per night for the house, set by the family. Sorted by what
          they charge.
        </p>

        <div className="mt-10 overflow-hidden rounded-[var(--radius-panel)] border border-[var(--ink-hairline)] bg-paper">
          <div className="u-label hidden grid-cols-[2.4fr_1.2fr_0.8fr_1.2fr_0.9fr] gap-4 border-b border-[var(--ink-hairline)] px-6 py-4 text-ink-faint md:grid">
            <span>House</span>
            <span>Host</span>
            <span>Sleeps</span>
            <span>Meals</span>
            <span className="text-right">Per night</span>
          </div>
          <ul>
            {[...homestays]
              .sort((a, b) => a.fromPrice - b.fromPrice)
              .map((stay) => (
                <li
                  key={stay.slug}
                  className="border-b border-[var(--ink-hairline)] last:border-b-0"
                >
                  <Link
                    href={`/homestays/${stay.slug}`}
                    className="group grid gap-2 px-6 py-5 transition-colors duration-[var(--dur-micro)] ease-brand hover:bg-shell md:grid-cols-[2.4fr_1.2fr_0.8fr_1.2fr_0.9fr] md:items-baseline md:gap-4"
                  >
                    <span>
                      <span className="block text-18 group-hover:underline">
                        {stay.name}
                      </span>
                      <span className="u-label mt-1.5 block text-ink-faint">
                        {stay.locality}
                      </span>
                    </span>
                    <Cell label="Host">{stay.hostName}</Cell>
                    <Cell label="Sleeps">{stay.maxGuests}</Cell>
                    <Cell label="Meals">{MEALS[stay.mealsIncluded]}</Cell>
                    <span className="u-num text-16 md:text-right">
                      {formatINR(stay.fromPrice)}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
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
 * A house, led by the family that keeps it.
 *
 * `StayCard` carries the building; this wraps it with the host line above,
 * because the host is the reason to book a homestay rather than a hotel and
 * the card component is shared with places where there is no host to name.
 */
function HostedStay({
  stay,
  priority,
}: {
  stay: Homestay;
  priority?: boolean;
}) {
  return (
    <div>
      <p className="u-label mb-3 flex items-center gap-2.5 text-ink-faint">
        <span
          aria-hidden="true"
          className="h-px w-5 shrink-0"
          style={{ backgroundColor: stateColours[stay.state].surface }}
        />
        Hosted by {stay.hostName}
      </p>
      <StayCard
        stay={stay}
        priority={priority}
        sizes="(max-width: 640px) 100vw, 420px"
      />
    </div>
  );
}

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
    <div className="border-t border-[var(--ink-hairline)] pt-4">
      <dt className="u-label text-ink-faint">{label}</dt>
      <dd className="u-num mt-2 font-display text-28 lg:text-36">{value}</dd>
      {note ? <p className="u-label mt-1 text-ink-faint">{note}</p> : null}
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
