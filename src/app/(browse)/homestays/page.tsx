import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { Rise } from "@/components/motion/Rise";
import { Accent } from "@/components/primitives/Accent";
import { StayCard } from "@/components/cards/ResultCard";
import { LocatorMap } from "@/components/homestays/LocatorMap";
import { getHomestays } from "@/content/homestays";
import { stayShots } from "@/config/showcase";
import { formatINR } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Homestays",
  description:
    "Family-run homestays across Northeast India — stilt houses on Majuli, Apatani farmhouses at Ziro, a hut on a floating island on Loktak.",
};

/**
 * Homestays.
 *
 * Deliberately *not* grouped by state, unlike the events index. Twelve houses
 * across eight states is one or two per state, and grouping produces eight
 * headings with a card and a half under each — which looks like a page that
 * has run out of content rather than one that is organised. The map already
 * does the spatial grouping, far better than eight subheadings would.
 *
 * What it gains instead is a summary rule above the grid. On a page selling
 * "somebody's house" rather than a hotel, the four figures that answer the
 * unspoken question — is this a real network or four cottages? — are the
 * count, the spread, the floor price and the rating. They are the same four
 * kinds of claim the home page's proof band makes, set small because here
 * they support the list rather than being the argument.
 */
export default function HomestaysPage() {
  const homestays = getHomestays();

  const states = new Set(homestays.map((stay) => stay.state)).size;
  const from = Math.min(...homestays.map((stay) => stay.fromPrice));
  const rating =
    homestays.reduce((sum, stay) => sum + stay.rating, 0) / homestays.length;
  const reviews = homestays.reduce((sum, stay) => sum + stay.reviewCount, 0);

  return (
    <>
      <PageHero
        eyebrow={`${homestays.length} places to stay`}
        title="Stay in somebody's house"
        accent="house"
        image={stayShots[0]}
        intro="Every homestay here is owned and run by the family living in it, and they set their own rates. We take a booking commission and nothing else. Two of them have no road to them at all."
        tint="paper"
        region="arunachal"
      />

      <SectionShell tint="paper" spacing="tight">
        <Rise
          as="dl"
          stagger={0.07}
          className="grid grid-cols-2 gap-8 border-b border-[var(--ink-hairline)] pb-10 sm:grid-cols-4"
        >
          <Figure label="Houses" value={String(homestays.length)} />
          <Figure label="States covered" value={`${states} of 8`} />
          <Figure label="From" value={formatINR(from)} note="a night" />
          <Figure
            label="Average rating"
            value={rating.toFixed(1)}
            note={`${reviews} reviews`}
          />
        </Rise>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div className="min-w-0">
            <h2 className="mb-10 text-28 lg:text-36">
              Twelve families, and the <Accent>rooms</Accent> they keep
            </h2>

            <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2">
              {homestays.map((stay, index) => (
                <li key={stay.slug}>
                  <Rise delay={Math.min(index, 5) * 0.04} distance={20}>
                    <StayCard
                      stay={stay}
                      priority={index < 2}
                      sizes="(max-width: 640px) 100vw, 420px"
                    />
                  </Rise>
                </li>
              ))}
            </ul>
          </div>

          {/* The locator sticks alongside the list on desktop and sits above
              it on mobile, where a sticky panel would eat the viewport. */}
          <div className="order-first lg:order-none">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <LocatorMap homestays={homestays} />
            </div>
          </div>
        </div>
      </SectionShell>
    </>
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
    <div>
      <dt className="u-label text-ink-faint">{label}</dt>
      <dd className="u-num mt-2 font-display text-36 lg:text-48">{value}</dd>
      {note ? <p className="u-label mt-1 text-ink-faint">{note}</p> : null}
    </div>
  );
}
