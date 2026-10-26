import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SectionShell } from "@/components/layout/SectionShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Accent } from "@/components/primitives/Accent";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import {
  getAllStays,
  getStayById,
  STAY_AMENITIES,
} from "@/content/day-options";
import { formatINR } from "@/lib/currency";

const KIND_LABEL: Record<string, string> = {
  included: "Included in the trip",
  hotel: "Hotel room",
  heritage: "Heritage property",
  homestay: "Family homestay",
  lodge: "Park lodge",
  camp: "Tented camp",
};

export function generateStaticParams() {
  return getAllStays()
    .filter((entry) => !entry.stay.homestaySlug)
    .map((entry) => ({ id: entry.stay.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const entry = getStayById(id);
  if (!entry) return {};
  return {
    title: entry.stay.name,
    description: entry.stay.blurb.slice(0, 155),
    // One room out of sixty-six, reachable only from inside a drafted
    // itinerary. Useful to the person looking at it, noise in an index.
    robots: { index: false, follow: true },
  };
}

/**
 * One room, in full.
 *
 * The planner's accordion shows a photograph, a name and a price, which is
 * enough to choose between three rooms and not enough to commit to one. This
 * is where "view details" goes: what the room is, what it comes with, what it
 * costs on top, and the way back to the day you were planning.
 *
 * **Rooms that are one of our homestays redirect to the homestay itself.**
 * Twelve of the sixty-six are, and those have a real page with the family
 * named, the house described and its own photography. A thinner second page
 * about the same bed would be the worse of the two.
 *
 * The amenities come from the kind of room rather than from the property —
 * see `STAY_AMENITIES`, which explains why, and says so on the page rather
 * than implying a survey nobody has done.
 */
export default async function StayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = getStayById(id);
  if (!entry) notFound();

  const { stay, place } = entry;
  if (stay.homestaySlug) redirect(`/homestays/${stay.homestaySlug}`);

  const amenities = STAY_AMENITIES[stay.kind];

  return (
    <>
      <SectionShell
        tint="paper"
        width="wide"
        spacing="flush"
        className="pt-[calc(var(--header-h)+2.5rem)] pb-14 lg:pt-[calc(var(--header-h)+3.5rem)] lg:pb-20"
      >
        <Link
          href="/destinations#plan"
          className="u-label text-ink-faint underline underline-offset-4 transition-colors hover:text-ink"
        >
          Back to planning
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
          <div className="min-w-0">
            <Eyebrow rule>
              {KIND_LABEL[stay.kind] ?? stay.kind}
              {place ? ` · ${place}` : ""}
            </Eyebrow>
            <h1 className="mt-6 max-w-2xl text-36 lg:text-64">{stay.name}</h1>
            <p className="mt-6 max-w-xl text-18 text-ink-soft lg:text-22">
              {stay.blurb}
            </p>
            <p className="mt-5 max-w-xl text-16 text-ink-soft">
              {amenities.note}
            </p>

            <div className="mt-10 border-t border-[var(--ink-hairline)] pt-8">
              <h2 className="text-22">{amenities.label}</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {amenities.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-16 text-ink-soft"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-clay"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-xl text-14 text-ink-faint">
                These are what this kind of room includes as standard on our
                trips. The property itself is named and confirmed in writing
                before anything is payable — nothing in the planner is a booking
                until we have both agreed it.
              </p>
            </div>
          </div>

          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-media)]">
              <Image
                src={stay.image}
                alt={stay.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="object-cover"
              />
            </span>

            <div className="mt-6 rounded-[var(--radius-panel)] border border-[var(--ink-hairline)] p-6">
              <p className="u-label text-ink-faint">
                {stay.supplement === 0 ? "Already in the price" : "Supplement"}
              </p>
              <p className="u-num mt-2 font-display text-36 leading-none">
                {stay.supplement === 0
                  ? "Included"
                  : `+${formatINR(stay.supplement)}`}
              </p>
              <p className="mt-2 text-14 text-ink-soft">
                {stay.supplement === 0
                  ? "No supplement on this room."
                  : "Per person, per night, on top of the trip price."}
              </p>
              <LuxeButtonLink
                href="/destinations#plan"
                variant="primary"
                block
                className="mt-6"
              >
                Put it on a day
              </LuxeButtonLink>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell tint="night" spacing="tight" width="wide">
        <p className="max-w-2xl text-22 text-night-text lg:text-28">
          Rooms are chosen <Accent>night by night</Accent> inside a drafted
          itinerary — plan the days and this one will be on the list.
        </p>
      </SectionShell>
    </>
  );
}
