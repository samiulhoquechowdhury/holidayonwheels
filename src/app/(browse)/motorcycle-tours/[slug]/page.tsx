import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  DetailLayout,
  DetailSections,
  IncludesGrid,
} from "@/components/layout/DetailLayout";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { WeaveBand } from "@/components/layout/WeaveBand";
import { Reveal } from "@/components/layout/Reveal";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { ItineraryTimeline } from "@/components/booking/ItineraryTimeline";
import { MotoCard } from "@/components/cards/ResultCard";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { formatINR } from "@/lib/currency";
import {
  getMotorcycleTourBySlug,
  getMotorcycleTours,
  getRelatedMotorcycleTours,
} from "@/content/motorcycle-tours";
import { getDestinationName } from "@/content/destinations";

export function generateStaticParams() {
  return getMotorcycleTours().map((tour) => ({ slug: tour.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = getMotorcycleTourBySlug(slug);
  if (!tour) return {};
  return { title: tour.title, description: tour.intro.slice(0, 155) };
}

const DIFFICULTY_LABEL = {
  moderate: "Moderate",
  challenging: "Challenging",
  expert: "Expert only",
} as const;

export default async function MotorcycleTourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tour = getMotorcycleTourBySlug(slug);
  if (!tour) notFound();

  const related = getRelatedMotorcycleTours(slug, 3);

  return (
    <>
      <DetailLayout
        seed={tour.slug}
        region={tour.region}
        eyebrow={`${tour.states.map(getDestinationName).join(" · ")} · ${tour.distanceKm.toLocaleString("en-IN")} km`}
        title={tour.title}
        strapline={tour.strapline}
        chips={[
          `${tour.nights} nights`,
          DIFFICULTY_LABEL[tour.difficulty],
          `Max ${tour.maxAltitude.toLocaleString("en-IN")} m`,
          `Max ${tour.groupSizeMax} riders`,
          `Starts ${tour.startsAt}`,
          ...(tour.requiresILP ? ["Permit included"] : []),
        ]}
        gallery={[
          { alt: tour.heroAlt, src: tour.image },
          {
            alt: `The support truck following the group on the ${tour.title} route`,
          },
          { alt: `${tour.highlights[0]} on the ${tour.title} route` },
        ]}
        panel={
          <BookingWidget
            title={tour.title}
            departures={tour.departures}
            priceBands={[{ fromPax: 1, perPerson: tour.fromPrice }]}
            singleSupplement={0}
            maxPax={tour.groupSizeMax}
            checkoutSlug={tour.slug}
            checkoutKind="moto"
            requiresILP={tour.requiresILP}
          />
        }
      >
        <DetailSections
          sections={[
            {
              id: "overview",
              label: "Overview",
              content: (
                <div className="max-w-prose">
                  <p className="text-18 text-ink-soft">{tour.intro}</p>

                  <div className="mt-10 rounded-[var(--radius-control)] border border-[color-mix(in_srgb,var(--naga-red)_35%,transparent)] bg-[color-mix(in_srgb,var(--naga-red)_6%,transparent)] p-5">
                    <Eyebrow tone="red">Riding experience needed</Eyebrow>
                    <p className="mt-3 text-16">{tour.ridingExperience}</p>
                  </div>

                  <Eyebrow className="mt-10 mb-4">What stands out</Eyebrow>
                  <ul className="flex flex-col gap-3">
                    {tour.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3 text-16">
                        <span aria-hidden="true" className="text-naga-red">
                          —
                        </span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            },
            {
              id: "route",
              label: "Route",
              content: <ItineraryTimeline days={tour.itinerary} />,
            },
            {
              id: "terrain",
              label: "Terrain and bikes",
              content: (
                <div className="grid gap-12 lg:grid-cols-2">
                  <div>
                    <Eyebrow className="mb-4">
                      What you will be riding on
                    </Eyebrow>
                    <ul className="flex flex-col gap-3">
                      {tour.terrain.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-16 text-ink-soft"
                        >
                          <span aria-hidden="true" className="text-ink-faint">
                            —
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <Eyebrow className="mb-4">Bikes available</Eyebrow>
                    <ul className="flex flex-col gap-3">
                      {tour.bikes.map((bike) => (
                        <li
                          key={bike.name}
                          className="flex items-baseline justify-between gap-4 border-b border-[var(--ink-hairline)] pb-3"
                        >
                          <span className="text-16">
                            {bike.name}
                            <span className="u-mono ml-2 text-ink-faint">
                              {bike.engineCc}cc
                            </span>
                          </span>
                          <span className="shrink-0 font-mono text-14 tabular-nums">
                            {bike.surcharge === 0
                              ? "Included"
                              : bike.surcharge > 0
                                ? `+${formatINR(bike.surcharge)}`
                                : `−${formatINR(Math.abs(bike.surcharge))}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-14 text-ink-soft">
                      Riding pillion instead of taking a bike costs{" "}
                      {formatINR(tour.pillionPrice)}. Pillion places are limited
                      by the number of bikes in the group.
                    </p>
                  </div>
                </div>
              ),
            },
            {
              id: "support",
              label: "Support vehicle",
              content: (
                <>
                  <p className="max-w-prose text-18 text-ink-soft">
                    A pickup travels with the group for the whole route. This is
                    what is in it.
                  </p>
                  {/* A list, not chips — these are sentences. Chip is
                      whitespace-nowrap by design and overflows at 320px. */}
                  <ul className="mt-6 grid max-w-prose gap-3 sm:grid-cols-2">
                    {tour.supportVehicle.map((item) => (
                      <li key={item} className="flex gap-3 text-16">
                        <span aria-hidden="true" className="text-naga-red">
                          —
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              ),
            },
            {
              id: "included",
              label: "What is included",
              content: (
                <IncludesGrid
                  includes={tour.includes}
                  excludes={tour.excludes}
                />
              ),
            },
          ]}
        />
      </DetailLayout>

      {related.length > 0 ? (
        <>
          <WeaveBand region="nagaland" height={32} opacity={0.45} />
          <SectionShell tint="cherry" pattern="nagaland" patternOpacity={0.03}>
            <SectionHeader
              eyebrow="Also worth a look"
              title="Other expeditions on this ground"
              link={{ href: "/motorcycle-tours", label: "All expeditions" }}
              align="split"
            />
            <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {related.map((other, index) => (
                <li key={other.slug}>
                  <Reveal delay={index * 0.06}>
                    <MotoCard
                      tour={other}
                      sizes="(max-width: 640px) 100vw, 400px"
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
          </SectionShell>
        </>
      ) : null}
    </>
  );
}
