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
import { TourCard, StayCard } from "@/components/cards/ResultCard";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import {
  getTourBySlug,
  getTours,
  getRelatedTours,
  toTourSummary,
} from "@/content/tours";
import { getDestinationName } from "@/content/destinations";
import { getHomestaysNear } from "@/content/homestays";

export function generateStaticParams() {
  return getTours().map((tour) => ({ slug: tour.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = getTourBySlug(slug);
  if (!tour) return {};
  return {
    title: tour.title,
    description: tour.intro.slice(0, 155),
  };
}

const DIFFICULTY_LABEL = {
  easy: "Easy going",
  moderate: "Moderate",
  challenging: "Challenging",
} as const;

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tour = getTourBySlug(slug);
  if (!tour) notFound();

  const related = getRelatedTours(slug, 3);
  const stays = getHomestaysNear(tour.states, 2);

  return (
    <>
      <DetailLayout
        seed={tour.slug}
        region={tour.region}
        eyebrow={`${tour.states.map(getDestinationName).join(" · ")} · ${tour.days} days`}
        title={tour.title}
        strapline={tour.strapline}
        chips={[
          `${tour.nights} nights`,
          DIFFICULTY_LABEL[tour.difficulty],
          `Max ${tour.groupSizeMax} travellers`,
          `Starts ${tour.startsAt}`,
          `Ends ${tour.endsAt}`,
          ...(tour.requiresILP ? ["Permit included"] : []),
        ]}
        gallery={[
          { alt: tour.heroAlt, src: tour.image },
          {
            alt: `${tour.itinerary[1]?.title ?? tour.title} — ${getDestinationName(tour.states[0])}`,
          },
          {
            alt: `${tour.highlights[0]} on the ${tour.title} route`,
          },
        ]}
        panel={
          <BookingWidget
            title={tour.title}
            departures={tour.departures}
            priceBands={tour.priceBands}
            singleSupplement={tour.singleSupplement}
            maxPax={tour.groupSizeMax}
            checkoutSlug={tour.slug}
            checkoutKind="tour"
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
                  <Eyebrow className="mt-10 mb-4">What stands out</Eyebrow>
                  <ul className="flex flex-col gap-3">
                    {tour.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3 text-16">
                        <span aria-hidden="true" className="text-muga-gold">
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
              id: "itinerary",
              label: "Day by day",
              content: <ItineraryTimeline days={tour.itinerary} />,
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
            {
              id: "practical",
              label: "Practical",
              content: (
                <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                  <Fact
                    label="Group size"
                    value={`Up to ${tour.groupSizeMax}`}
                  />
                  <Fact
                    label="Effort"
                    value={DIFFICULTY_LABEL[tour.difficulty]}
                  />
                  <Fact label="Starts" value={tour.startsAt} />
                  <Fact label="Ends" value={tour.endsAt} />
                  <Fact
                    label="Permits"
                    value={
                      tour.requiresILP
                        ? "Inner Line Permits required and processed by us at no charge"
                        : "No permits required for this route"
                    }
                  />
                  <Fact
                    label="Single travellers"
                    value={
                      tour.singleSupplement === 0
                        ? "No single supplement — a single room is the default"
                        : "A single supplement applies, shown in the price breakdown"
                    }
                  />
                </dl>
              ),
            },
          ]}
        />
      </DetailLayout>

      {stays.length > 0 ? (
        <>
          <WeaveBand region={tour.region} height={32} opacity={0.45} />
          <SectionShell
            tint="paddy"
            pattern={tour.region}
            patternOpacity={0.03}
          >
            <SectionHeader
              eyebrow="Extend your trip"
              title="Homestays on this route"
              intro="Add a few nights either side. Booked at the same time, so the transfers line up."
              link={{ href: "/homestays", label: "All homestays" }}
              align="split"
            />
            <ul className="grid gap-10 sm:grid-cols-2 lg:gap-6">
              {stays.map((stay, index) => (
                <li key={stay.slug}>
                  <Reveal delay={index * 0.06}>
                    <StayCard
                      stay={stay}
                      sizes="(max-width: 640px) 100vw, 400px"
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
          </SectionShell>
        </>
      ) : null}

      {related.length > 0 ? (
        <>
          <WeaveBand region="neutral" height={28} opacity={0.4} />
          <SectionShell tint="cloud" pattern="neutral" patternOpacity={0.03}>
            <SectionHeader
              eyebrow="Also worth a look"
              title="Trips that cover the same ground"
              link={{ href: "/tours", label: "All trips" }}
              align="split"
            />
            <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {related.map((other, index) => (
                <li key={other.slug}>
                  <Reveal delay={index * 0.06}>
                    <TourCard
                      tour={toTourSummary(other)}
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="u-mono text-ink-soft">{label}</dt>
      <dd className="mt-2 text-16">{value}</dd>
    </div>
  );
}
