import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { SearchBar } from "@/components/search/SearchBar";
import { ToursBrowser } from "./ToursBrowser";
import { getTours, getTourSummaries } from "@/content/tours";
import { getDestinations } from "@/content/destinations";

export const metadata: Metadata = {
  title: "Guided tours",
  description:
    "Guided tours across the eight states of Northeast India — for couples, honeymoons, small groups and solo travellers, with permits handled.",
};

/**
 * The query string is read here, on the server, rather than with
 * `useSearchParams` in the browser component. That keeps the whole result
 * list in the server-rendered HTML — with a client-side read it sat behind a
 * Suspense boundary and shipped a skeleton instead.
 */
export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  // Only the lean summary crosses into the client component.
  const tours = getTourSummaries();
  const total = getTours().length;
  const destinations = getDestinations();

  return (
    <>
      <PageHero
        eyebrow={`${total} trips`}
        title="Guided tours across the Northeast"
        accent="Northeast"
        media={false}
        intro="Fixed departures and private trips across all eight states. Every one includes a guide from the region, all ground transport, and any permits you need."
        tint="sand"
        region="assam"
      >
        <SearchBar className="max-w-3xl" />
      </PageHero>

      <SectionShell tint="paper">
        <ToursBrowser
          tours={tours}
          destinations={destinations}
          initialFilters={{ type: one("type"), state: one("state") }}
        />
      </SectionShell>
    </>
  );
}
