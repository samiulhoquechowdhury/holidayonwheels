"use client";

import { useMemo, useState } from "react";
import {
  FilterRail,
  type FilterGroupDef,
  type FilterState,
} from "@/components/search/FilterRail";
import { ResultsGrid, EmptyResults } from "@/components/search/ResultsGrid";
import { TourCard } from "@/components/cards/ResultCard";
import { Reveal } from "@/components/layout/Reveal";
import type { TourSummary } from "@/content/tours";
import type { Destination } from "@/content/types";

/**
 * Tours index, client side.
 *
 * Initial filter state arrives as a prop, read from the URL on the *server*.
 * It deliberately does not call `useSearchParams`: inside a Suspense boundary
 * that opts the whole subtree out of server rendering, so the static HTML
 * contained a skeleton and all 47 cards rendered only after hydration —
 * bad for LCP and invisible to crawlers. Reading the query server-side keeps
 * the full result list in the HTML.
 */

export type InitialFilters = { type?: string; state?: string };

type SortKey = "recommended" | "price-asc" | "price-desc" | "duration-asc";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price, lowest first" },
  { value: "price-desc", label: "Price, highest first" },
  { value: "duration-asc", label: "Shortest first" },
];

export function ToursBrowser({
  tours,
  destinations,
  initialFilters,
}: {
  tours: TourSummary[];
  destinations: Destination[];
  initialFilters: InitialFilters;
}) {
  const [state, setState] = useState<FilterState>(() => ({
    type: initialFilters.type ? [initialFilters.type] : [],
    state: initialFilters.state ? [initialFilters.state] : [],
    duration: [],
    difficulty: [],
  }));
  const [sort, setSort] = useState<SortKey>("recommended");

  const groups: FilterGroupDef[] = useMemo(
    () => [
      {
        id: "type",
        label: "Travelling as",
        options: [
          {
            value: "couple",
            label: "A couple",
            count: count(tours, "type", "couple"),
          },
          {
            value: "honeymoon",
            label: "Honeymoon",
            count: count(tours, "type", "honeymoon"),
          },
          {
            value: "group",
            label: "Small group",
            count: count(tours, "type", "group"),
          },
          {
            value: "solo",
            label: "On my own",
            count: count(tours, "type", "solo"),
          },
        ],
      },
      {
        id: "state",
        label: "State",
        options: destinations.map((destination) => ({
          value: destination.slug,
          label: destination.name,
          count: tours.filter((t) => t.states.includes(destination.slug))
            .length,
        })),
      },
      {
        id: "duration",
        label: "Length",
        options: [
          { value: "short", label: "Up to 5 nights" },
          { value: "medium", label: "6 to 9 nights" },
          { value: "long", label: "10 nights or more" },
        ],
      },
      {
        id: "difficulty",
        label: "Effort",
        options: [
          {
            value: "easy",
            label: "Easy",
            count: count(tours, "difficulty", "easy"),
          },
          {
            value: "moderate",
            label: "Moderate",
            count: count(tours, "difficulty", "moderate"),
          },
          {
            value: "challenging",
            label: "Challenging",
            count: count(tours, "difficulty", "challenging"),
          },
        ],
      },
    ],
    [tours, destinations],
  );

  const results = useMemo(
    () => filterAndSort(tours, state, sort),
    [tours, state, sort],
  );

  function toggle(groupId: string, value: string) {
    setState((current) => {
      const values = current[groupId] ?? [];
      return {
        ...current,
        [groupId]: values.includes(value)
          ? values.filter((v) => v !== value)
          : [...values, value],
      };
    });
  }

  function clear() {
    setState({ type: [], state: [], duration: [], difficulty: [] });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-16">
      <FilterRail
        groups={groups}
        state={state}
        onChange={toggle}
        onClear={clear}
        resultCount={results.length}
      />

      <div className="min-w-0">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--ink-hairline)] pb-5">
          <h2 className="u-mono text-ink-soft">
            {results.length} {results.length === 1 ? "trip" : "trips"}
          </h2>
          <div className="flex items-center gap-3">
            <label htmlFor="sort" className="u-mono text-ink-soft">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="min-h-11 rounded-[var(--radius-control)] border border-[var(--ink-hairline-strong)] bg-transparent px-3 text-14"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {results.length > 0 ? (
          <ResultsGrid count={results.length}>
            {results.map((tour, index) => (
              <li key={tour.slug}>
                <Reveal delay={Math.min(index, 5) * 0.04}>
                  <TourCard
                    tour={tour}
                    priority={index < 3}
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px"
                  />
                </Reveal>
              </li>
            ))}
          </ResultsGrid>
        ) : (
          <EmptyResults onClear={clear} />
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function count(
  tours: TourSummary[],
  key: "type" | "difficulty",
  value: string,
): number {
  return tours.filter((tour) =>
    key === "type"
      ? tour.types.includes(value as TourSummary["types"][number])
      : tour.difficulty === value,
  ).length;
}

function inDurationBand(nights: number, band: string): boolean {
  if (band === "short") return nights <= 5;
  if (band === "medium") return nights >= 6 && nights <= 9;
  return nights >= 10;
}

export function filterAndSort(
  tours: TourSummary[],
  state: FilterState,
  sort: SortKey,
): TourSummary[] {
  const filtered = tours.filter((tour) => {
    const types = state.type ?? [];
    const states = state.state ?? [];
    const durations = state.duration ?? [];
    const difficulties = state.difficulty ?? [];

    // Within a group the filters are OR; across groups they are AND. That is
    // what people expect and what makes the result count feel honest.
    if (
      types.length &&
      !types.some((t) => tour.types.includes(t as TourSummary["types"][number]))
    )
      return false;
    if (
      states.length &&
      !states.some((s) =>
        tour.states.includes(s as TourSummary["states"][number]),
      )
    )
      return false;
    if (
      durations.length &&
      !durations.some((d) => inDurationBand(tour.nights, d))
    )
      return false;
    if (difficulties.length && !difficulties.includes(tour.difficulty))
      return false;
    return true;
  });

  const sorted = [...filtered];
  if (sort === "price-asc") sorted.sort((a, b) => a.fromPrice - b.fromPrice);
  else if (sort === "price-desc")
    sorted.sort((a, b) => b.fromPrice - a.fromPrice);
  else if (sort === "duration-asc") sorted.sort((a, b) => a.nights - b.nights);
  else
    sorted.sort(
      (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
    );

  return sorted;
}
