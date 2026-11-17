"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Price } from "@/components/currency/Price";
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

type Suit = "couples" | "families" | "groups";

/**
 * Who a house will take.
 *
 * These read off `Homestay.suitability`, which is a **policy the house
 * states**, not something inferred from its photographs or its size. None of
 * the four Guwahati houses has told us yet, so each of these currently
 * matches nothing — the control says so rather than quietly returning an
 * empty grid, and the moment a value lands in the content file the filter
 * starts working with no change here.
 */
const SUITS: { value: Suit; label: string }[] = [
  { value: "couples", label: "Couple friendly" },
  { value: "families", label: "Family" },
  { value: "groups", label: "Party" },
];

/** Everything a house says about itself, as one searchable blob. */
function haystack(stay: Homestay): string {
  return [
    ...stay.amenities,
    ...stay.rooms.flatMap((room) => room.amenities),
    stay.mealsIncluded ? MEALS[stay.mealsIncluded] : "",
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
  const [suits, setSuits] = useState<Suit[]>([]);
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");
  const [showMap, setShowMap] = useState(false);

  /* Only the chips that would actually match something. */
  const chips = useMemo(() => {
    const blobs = houses.map(haystack);
    return FILTERS.filter((f) => blobs.some((b) => f.test.test(b)));
  }, [houses]);

  const shown = useMemo(() => {
    const matched = houses.filter((stay) => {
      const blob = haystack(stay);
      const byAmenity = active.every((label) =>
        FILTERS.find((f) => f.label === label)?.test.test(blob),
      );
      /* Every selected suitability must be stated by the house. An unset
         `suitability` matches nothing, which is the honest answer to "is
         this couple friendly?" when nobody has told us. */
      const bySuit = suits.every((v) => stay.suitability?.includes(v));
      return byAmenity && bySuit;
    });

    if (sort === "featured") return matched;
    /*
     * Houses with no published rate sort last whichever way the list runs.
     * They are not free and they are not expensive; they are unknown, and
     * putting an unpriced house at the top of "lowest first" would read as
     * a claim that it is the cheapest.
     */
    return [...matched].sort((a, b) => {
      if (a.fromPrice === undefined) return 1;
      if (b.fromPrice === undefined) return -1;
      return sort === "low"
        ? a.fromPrice - b.fromPrice
        : b.fromPrice - a.fromPrice;
    });
  }, [houses, active, suits, sort]);

  /* Any rate at all? With none, a price sort has nothing to order. */
  const priced = houses.some((stay) => stay.fromPrice !== undefined);

  const toggleSuit = (value: Suit) =>
    setSuits((current) =>
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    );

  const toggle = (label: string) =>
    setActive((current) =>
      current.includes(label)
        ? current.filter((l) => l !== label)
        : [...current, label],
    );

  const anySuitData = houses.some((stay) => stay.suitability?.length);

  return (
    <div className="min-w-0">
      {/* --- Who it suits, and price. Top right. --------------------- */}
      <div className="mb-6 flex flex-wrap items-center justify-end gap-x-3 gap-y-3">
        <span className="u-label mr-auto text-ink-faint">Filter</span>

        {SUITS.map((suit) => {
          const on = suits.includes(suit.value);
          return (
            <button
              key={suit.value}
              type="button"
              onClick={() => toggleSuit(suit.value)}
              aria-pressed={on}
              className={cn(
                "u-label min-h-10 shrink-0 rounded-full border px-4",
                "transition-colors duration-[var(--dur-micro)] ease-brand",
                on
                  ? "border-ink bg-ink text-night-text"
                  : "border-[var(--ink-hairline-strong)] text-ink-soft hover:border-ink",
              )}
            >
              {suit.label}
            </button>
          );
        })}

        {/*
          Price sits with them but is a sort, not a toggle — a nightly rate
          is a number, and "cheap" is a comparison rather than a property a
          house either has or does not. Hidden entirely while no house has a
          published rate, because there would be nothing to order.
        */}
        {priced ? (
          <span className="relative inline-flex shrink-0">
            <label htmlFor="stay-sort" className="sr-only">
              Sort by price
            </label>
            <select
              id="stay-sort"
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as "featured" | "low" | "high")
              }
              className="u-label min-h-10 cursor-pointer appearance-none rounded-full border border-[var(--ink-hairline-strong)] bg-transparent pr-9 pl-4 text-ink-soft transition-colors duration-[var(--dur-micro)] ease-brand hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
            >
              <option value="featured">Our order</option>
              <option value="low">Price, lowest</option>
              <option value="high">Price, highest</option>
            </select>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-ink-faint"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 9 7 7 7-7" />
            </svg>
          </span>
        ) : null}
      </div>

      {/*
        Said once, here, instead of three disabled buttons.
        Who a house takes is its own policy — not a thing to read off a
        photograph — and none of the four has told us yet. The filters stay
        live so the page does not change shape when the answers arrive.
      */}
      {!anySuitData && suits.length > 0 ? (
        <p role="status" className="mb-6 max-w-prose text-16 text-ink-soft">
          We have not confirmed which of these houses take couples, families or
          groups — it is the family&rsquo;s own rule to state, not ours to
          assume. Ask us and we will check before you book.
        </p>
      ) : null}

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
        {/* Only where there are real reviews behind it. An unrated house
            shows nothing rather than a zero or an invented score. */}
        {stay.rating !== undefined ? (
          <span className="u-num shrink-0 text-14">
            <span aria-hidden="true" className="text-clay-ink">
              ★
            </span>{" "}
            {stay.rating.toFixed(1)}
            {stay.reviewCount !== undefined ? (
              <span className="text-ink-faint"> ({stay.reviewCount})</span>
            ) : null}
          </span>
        ) : null}
      </span>

      <span className="mt-1.5 block text-18 group-hover:underline">
        {stay.name}
      </span>

      {/* Built from whatever the house has told us, joined with middots, and
          omitted entirely when that is nothing. */}
      {(() => {
        const meta = [
          stay.bedrooms
            ? `${stay.bedrooms} ${stay.bedrooms === 1 ? "room" : "rooms"}`
            : null,
          stay.maxGuests ? `sleeps ${stay.maxGuests}` : null,
          stay.mealsIncluded ? MEALS[stay.mealsIncluded] : null,
        ].filter(Boolean);
        return meta.length > 0 ? (
          <span className="u-label mt-1.5 block text-ink-faint">
            {meta.join(" · ")}
          </span>
        ) : null;
      })()}

      {/*
        A rate, or nothing at all.

        These four houses are real businesses whose nightly rates we have not
        been given, and a figure here would be a price somebody could hold us
        to. The unpriced branch briefly read "Rate on request / We will
        confirm it with the house", which put two lines of apology on every
        card on the page for a fact the card can simply not mention. The
        enquiry panel on the detail page says it once, where somebody is
        actually deciding.
      */}
      {stay.fromPrice !== undefined ? (
        <>
          <span className="mt-3 block text-16">
            <span className="u-num font-medium">
              <Price rupees={stay.fromPrice} />
            </span>{" "}
            <span className="text-ink-soft">a night</span>
          </span>
          <span className="u-label mt-1 block text-ink-faint">
            Nothing payable to book
          </span>
        </>
      ) : null}
    </Link>
  );
}
