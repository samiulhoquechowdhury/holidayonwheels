"use client";

import { useMemo, useState } from "react";
import {
  FilterRail,
  type FilterGroupDef,
  type FilterState,
} from "@/components/search/FilterRail";
import { ResultsGrid, EmptyResults } from "@/components/search/ResultsGrid";
import { TourCard } from "@/components/cards/ResultCard";
import { Rise } from "@/components/motion/Rise";
import { stateColours } from "@/config/palette";
import { PARTY_TYPES, matchesParty, type PartyType } from "@/lib/party";
import { cn } from "@/lib/cn";
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
        /*
         * The planner's five, not the catalogue's four. `matchesParty` is
         * what reconciles them — "family" is derived rather than authored,
         * and it is derived in exactly one place so this rail and the planner
         * can never disagree about which trips suit a family.
         */
        options: PARTY_TYPES.map((option) => ({
          value: option.id,
          label: option.label,
          count: tours.filter((tour) => matchesParty(tour, option.id)).length,
        })),
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

  /** Flat list of what is currently applied, for the chip row. */
  const active = useMemo(() => {
    const out: { group: string; value: string; label: string }[] = [];
    for (const group of groups) {
      for (const value of state[group.id] ?? []) {
        const option = group.options.find((o) => o.value === value);
        if (option) out.push({ group: group.id, value, label: option.label });
      }
    }
    return out;
  }, [groups, state]);

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
        {/*
         * The fastest path to the most common filter, before the rail.
         * "Which state" is the first question most people arrive with, and
         * making them find it inside a checkbox group is the difference
         * between filtering and giving up. The chips carry each state's own
         * colour, so this row reads as the same object as the jump bar on the
         * destinations page.
         */}
        <div className="mb-8">
          <p className="u-label text-ink-faint">Jump to a state</p>
          <ul className="-mx-[var(--gutter)] mt-3 flex scrollbar-none gap-2 overflow-x-auto px-[var(--gutter)] pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
            {destinations.map((destination) => {
              const on = (state.state ?? []).includes(destination.slug);
              const colour = stateColours[destination.slug];
              return (
                <li key={destination.slug} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => toggle("state", destination.slug)}
                    aria-pressed={on}
                    className={cn(
                      "u-label flex min-h-9 items-center gap-2.5 rounded-full border px-4",
                      "transition-colors duration-[var(--dur-micro)] ease-brand",
                      on
                        ? "border-transparent text-night-text"
                        : "border-[var(--ink-hairline)] hover:border-[var(--ink-hairline-strong)]",
                    )}
                    style={{
                      backgroundColor: on ? colour.surface : undefined,
                      color: on ? undefined : colour.ink,
                    }}
                  >
                    {!on ? (
                      <span
                        aria-hidden="true"
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: colour.surface }}
                      />
                    ) : null}
                    <span className="whitespace-nowrap">
                      {destination.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/*
         * Sticky, because the alternative is scrolling back past forty cards
         * to change the sort or to find out how many results you are looking
         * at. It sits under the header, and it is the only sticky thing on
         * the page.
         */}
        <div className="sticky top-[var(--header-h)] z-20 -mx-1 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--ink-hairline)] bg-paper/92 px-1 py-4 backdrop-blur-md">
          {/* Announced when the count changes — a filter that silently
              rewrites the page is unusable with a screen reader. */}
          <h2 className="u-label text-ink-soft" aria-live="polite">
            {results.length} {results.length === 1 ? "trip" : "trips"}
            {active.length > 0 ? ` of ${tours.length}` : ""}
          </h2>
          <div className="flex items-center gap-3">
            <label htmlFor="sort" className="u-label text-ink-soft">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="min-h-11 rounded-[var(--radius-input)] border border-[var(--ink-hairline-strong)] bg-transparent px-3 text-14"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/*
         * What is currently applied, and how to undo any one of it. The rail
         * already holds the checkboxes, but on a phone the rail is collapsed
         * behind a button — without this row a visitor can filter themselves
         * down to two results with no visible explanation of why.
         */}
        {active.length > 0 ? (
          <ul className="mt-6 flex flex-wrap items-center gap-2">
            {active.map((item) => (
              <li key={`${item.group}-${item.value}`}>
                <button
                  type="button"
                  onClick={() => toggle(item.group, item.value)}
                  className="u-label group flex min-h-9 items-center gap-2 rounded-full bg-ink px-4 text-paper transition-colors duration-[var(--dur-micro)] ease-brand hover:bg-clay hover:text-clay-on"
                >
                  {item.label}
                  <span aria-hidden="true" className="text-[13px] leading-none">
                    ×
                  </span>
                  <span className="u-sr-only">— remove this filter</span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={clear}
                className="u-label min-h-9 px-3 text-ink-faint underline underline-offset-4 transition-colors hover:text-ink"
              >
                Clear all
              </button>
            </li>
          </ul>
        ) : null}

        <div className="mt-10">
          {results.length > 0 ? (
            <ResultsGrid count={results.length}>
              {results.map((tour, index) => (
                <li key={tour.slug}>
                  <Rise delay={Math.min(index, 5) * 0.04} distance={20}>
                    <TourCard
                      tour={tour}
                      priority={index < 3}
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px"
                    />
                  </Rise>
                </li>
              ))}
            </ResultsGrid>
          ) : (
            <EmptyResults onClear={clear} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function count(tours: TourSummary[], key: "difficulty", value: string): number {
  return tours.filter((tour) => tour[key] === value).length;
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
    if (types.length && !types.some((t) => matchesParty(tour, t as PartyType)))
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
