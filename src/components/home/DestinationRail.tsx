import Link from "next/link";
import { cn } from "@/lib/cn";
import { Media } from "@/components/primitives/Media";
import { WeavePattern } from "@/components/layout/WeavePattern";
import { getDestinations } from "@/content/destinations";
import { getTours } from "@/content/tours";
import type { SectionTint } from "@/components/layout/SectionShell";

/**
 * The eight states as a horizontal rail, each on its own tint.
 *
 * A real overflow-scroll list rather than a JS carousel: it works with a
 * trackpad, a touch swipe, keyboard tabbing and a screen reader without any
 * of them being special-cased, and it ships no JavaScript.
 */

const TINT_BG: Record<SectionTint, string> = {
  paper: "bg-paper",
  shell: "bg-shell",
  sand: "bg-sand",
  night: "bg-night",
};

export function DestinationRail() {
  const destinations = getDestinations();
  const tours = getTours();

  return (
    <div
      // Bleeds to the viewport edge so the rail reads as continuing past it.
      className="-mx-[var(--gutter)] [scrollbar-width:thin] overflow-x-auto px-[var(--gutter)] pb-4"
    >
      <ul className="flex snap-x snap-mandatory gap-4">
        {destinations.map((destination) => {
          const count = tours.filter((t) =>
            t.states.includes(destination.slug),
          ).length;

          return (
            <li
              key={destination.slug}
              className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[340px]"
            >
              <Link
                href={`/destinations/${destination.slug}`}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-media)]",
                  TINT_BG[destination.tint],
                )}
              >
                <WeavePattern
                  region={destination.region}
                  scale={4}
                  opacity={0.05}
                />

                <div className="relative overflow-hidden">
                  <Media
                    alt={destination.heroAlt}
                    src={destination.image}
                    seed={`destination-${destination.slug}`}
                    region={destination.region}
                    aspect="4/3"
                    sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 340px"
                    imageClassName="transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-105"
                  />
                </div>

                <div className="relative flex flex-1 flex-col p-6">
                  <p className="u-label text-ink-soft">
                    {count} {count === 1 ? "trip" : "trips"}
                    {destination.requiresILP ? " · permit needed" : ""}
                  </p>
                  <h3 className="mt-3 text-28">{destination.name}</h3>
                  <p className="mt-3 flex-1 text-16 text-ink-soft">
                    {destination.tagline}
                  </p>
                  <p className="u-label mt-6 text-ink">
                    {destination.bestMonths[0]} –{" "}
                    {destination.bestMonths.at(-1)}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
