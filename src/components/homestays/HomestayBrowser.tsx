"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";
import { LocatorMap } from "@/components/homestays/LocatorMap";
import type { Homestay, MealPlan } from "@/content/types";

const MEALS: Record<MealPlan, string> = {
  "full-board": "All meals",
  "half-board": "Breakfast and dinner",
  breakfast: "Breakfast",
  none: "No meals",
};

/**
 * The quick filters, in the order they appear.
 *
 * Every one is a keyword tested against everything the house says about
 * itself — its own amenities, and the amenities of each of its rooms,
 * because "Air conditioning" is a property of a room and "Bicycles" is a
 * property of a house and a guest does not care which.
 *
 * A chip only renders if at least one house matches it, so the row can never
 * offer a filter that empties the page. That also means this list can carry
 * more entries than the current four houses justify — when real properties
 * arrive with pools or kitchens, their chips appear on their own.
 */
const FILTERS: { label: string; test: RegExp }[] = [
  { label: "All meals", test: /all meals|all three meals/i },
  { label: "Breakfast", test: /breakfast/i },
  { label: "Wifi", test: /wifi/i },
  { label: "Air conditioning", test: /air conditioning/i },
  { label: "Private bathroom", test: /private bathroom/i },
  { label: "Hot water", test: /hot water/i },
  { label: "Airport pickup", test: /airport/i },
  { label: "Parking", test: /parking/i },
  { label: "Bicycles", test: /bicycle/i },
  { label: "Laundry", test: /laundry/i },
  { label: "Shared kitchen", test: /kitchen/i },
];

/** Everything a house says about itself, as one searchable blob. */
function haystack(stay: Homestay): string {
  return [
    ...stay.amenities,
    ...stay.rooms.flatMap((room) => room.amenities),
    MEALS[stay.mealsIncluded],
  ].join(" | ");
}

/**
 * The houses, browsable.
 *
 * Built on the way Airbnb's results page works, because that is the pattern
 * anybody booking a room already has in their hands: a row of quick filters,
 * a map you can put away, and a dense grid of cards where the photograph
 * does the selling and the text answers in a fixed order — what kind of
 * place and where, how it is rated, what it is called, what you get, what it
 * costs.
 *
 * Three deliberate departures from that model:
 *
 *  - **No carousel on the card.** Airbnb cards flick through six photographs.
 *    There is one photograph per house in the content, and four fake dots
 *    under a single image is a promise of five more that do not exist.
 *  - **No saved/wishlist heart.** There is no account to save to yet. A
 *    control that does nothing is worse than no control.
 *  - **A nightly rate, not a stay total.** Airbnb can total five nights
 *    because it knows your dates. This page does not ask for dates, so it
 *    says what a night costs and leaves the arithmetic alone.
 *
 * Filtering is client-side over four houses — there is nothing here worth a
 * round trip, and the result is instant.
 */
export function HomestayBrowser({ houses }: { houses: Homestay[] }) {
  const [active, setActive] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);

  /* Only the chips that would actually match something. */
  const chips = useMemo(() => {
    const blobs = houses.map(haystack);
    return FILTERS.filter((f) => blobs.some((b) => f.test.test(b)));
  }, [houses]);

  const shown = useMemo(() => {
    if (active.length === 0) return houses;
    return houses.filter((stay) => {
      const blob = haystack(stay);
      return active.every((label) =>
        FILTERS.find((f) => f.label === label)?.test.test(blob),
      );
    });
  }, [houses, active]);

  const toggle = (label: string) =>
    setActive((current) =>
      current.includes(label)
        ? current.filter((l) => l !== label)
        : [...current, label],
    );

  return (
    <div className="min-w-0">
      {/* --- Quick filters ------------------------------------------- */}
      <div className="-mx-[var(--gutter)] flex scrollbar-none items-center gap-2 overflow-x-auto px-[var(--gutter)] pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {chips.map((chip) => {
          const on = active.includes(chip.label);
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => toggle(chip.label)}
              aria-pressed={on}
              className={cn(
                "u-label min-h-10 shrink-0 rounded-full border px-4",
                "transition-colors duration-[var(--dur-micro)] ease-brand",
                on
                  ? "border-ink bg-ink text-night-text"
                  : "border-[var(--ink-hairline-strong)] text-ink-soft hover:border-ink",
              )}
            >
              {chip.label}
            </button>
          );
        })}

        <span
          aria-hidden="true"
          className="hidden h-6 w-px shrink-0 bg-[var(--ink-hairline)] sm:block"
        />

        <button
          type="button"
          onClick={() => setShowMap((v) => !v)}
          aria-pressed={showMap}
          className="u-label min-h-10 shrink-0 rounded-full border border-[var(--ink-hairline-strong)] px-4 text-ink-soft transition-colors duration-[var(--dur-micro)] ease-brand hover:border-ink"
        >
          {showMap ? "Hide map" : "Show map"}
        </button>
      </div>

      {/* --- Result count, and a way back out of a filter ------------- */}
      <p className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-16 text-ink-soft">
        <span>
          {shown.length === houses.length
            ? `${houses.length} ${houses.length === 1 ? "house" : "houses"} in and around Guwahati`
            : `${shown.length} of ${houses.length} match`}
        </span>
        {active.length > 0 ? (
          <button
            type="button"
            onClick={() => setActive([])}
            className="u-label text-ink-faint underline underline-offset-4 transition-colors hover:text-ink"
          >
            Clear filters
          </button>
        ) : null}
      </p>

      <div
        className={cn(
          "mt-8",
          showMap && "grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-12",
        )}
      >
        <div className="min-w-0">
          {shown.length > 0 ? (
            <ul
              className={cn(
                "grid gap-x-6 gap-y-10 sm:grid-cols-2",
                showMap ? "lg:grid-cols-2" : "lg:grid-cols-4",
              )}
            >
              {shown.map((stay, index) => (
                <li key={stay.slug}>
                  <HouseCard stay={stay} priority={index < 4} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="max-w-prose text-16 text-ink-soft">
              Nothing matches all of those at once. Four houses cannot cover
              every combination — take one filter off and see what is left.
            </p>
          )}
        </div>

        {showMap ? (
          <div className="min-w-0">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <LocatorMap homestays={shown.length > 0 ? shown : houses} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * One house, in Airbnb's reading order.
 *
 * Kind and place, then rating, then the name, then what you get, then the
 * rate. The photograph is square because a column of square images is what
 * makes a grid scan as a grid — the houses are different shapes and the
 * crop is what stops that showing.
 */
function HouseCard({ stay, priority }: { stay: Homestay; priority?: boolean }) {
  return (
    <Link href={`/homestays/${stay.slug}`} className="group block min-w-0">
      <span className="relative block aspect-square w-full overflow-hidden rounded-[var(--radius-card)] bg-shell">
        <Image
          src={stay.image ?? ""}
          alt={stay.heroAlt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-[1.04]"
        />
        {stay.mealsIncluded === "full-board" ? (
          <span className="u-glass u-label absolute top-3 left-3 rounded-full px-3 py-1.5 text-ink">
            All meals
          </span>
        ) : null}
      </span>

      <span className="mt-4 flex items-baseline justify-between gap-3">
        <span className="u-label min-w-0 truncate text-ink-faint">
          Homestay in {stay.locality.split(",")[0]}
        </span>
        <span className="u-num shrink-0 text-14">
          <span aria-hidden="true" className="text-clay-ink">
            ★
          </span>{" "}
          {stay.rating.toFixed(1)}{" "}
          <span className="text-ink-faint">({stay.reviewCount})</span>
        </span>
      </span>

      <span className="mt-1.5 block text-18 group-hover:underline">
        {stay.name}
      </span>

      <span className="u-label mt-1.5 block text-ink-faint">
        {stay.bedrooms} {stay.bedrooms === 1 ? "room" : "rooms"} · sleeps{" "}
        {stay.maxGuests} · {MEALS[stay.mealsIncluded]}
      </span>

      <span className="mt-3 block text-16">
        <span className="u-num font-medium">{formatINR(stay.fromPrice)}</span>{" "}
        <span className="text-ink-soft">a night</span>
      </span>

      <span className="u-label mt-1 block text-ink-faint">
        Nothing payable to book
      </span>
    </Link>
  );
}
