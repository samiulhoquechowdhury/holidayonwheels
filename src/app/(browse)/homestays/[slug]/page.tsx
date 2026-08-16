import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailLayout, DetailSections } from "@/components/layout/DetailLayout";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Reveal } from "@/components/layout/Reveal";
import { StayBookingWidget } from "@/components/booking/StayBookingWidget";
import { StayCard, TourCard } from "@/components/cards/ResultCard";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Chip } from "@/components/primitives/Chip";
import { formatINR } from "@/lib/currency";
import { toISO } from "@/lib/date";
import {
  getHomestayBySlug,
  getHomestays,
  getHomestaysByState,
} from "@/content/homestays";
import { getDestinationName } from "@/content/destinations";
import { getToursByState, toTourSummary } from "@/content/tours";

export function generateStaticParams() {
  return getHomestays().map((stay) => ({ slug: stay.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const stay = getHomestayBySlug(slug);
  if (!stay) return {};
  return { title: stay.name, description: stay.intro.slice(0, 155) };
}

export default async function HomestayDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const stay = getHomestayBySlug(slug);
  if (!stay) notFound();

  // Computed on the server so the default check-in date is identical in the
  // HTML and on hydration.
  const today = toISO(new Date());

  const nearby = getHomestaysByState(stay.state).filter((s) => s.slug !== slug);
  const tours = getToursByState(stay.state).slice(0, 3);

  return (
    <>
      <DetailLayout
        seed={stay.slug}
        region={stay.region}
        eyebrow={`${stay.locality} · ${getDestinationName(stay.state)}`}
        title={stay.name}
        strapline={stay.strapline}
        chips={[
          `Sleeps ${stay.maxGuests}`,
          `${stay.bedrooms} bedrooms`,
          `${stay.rating.toFixed(1)} from ${stay.reviewCount} reviews`,
        ]}
        gallery={[
          { alt: stay.heroAlt, src: stay.image },
          { alt: `A guest room at ${stay.name}, ${stay.locality}` },
          { alt: `The view from ${stay.name} over ${stay.locality}` },
        ]}
        panel={<StayBookingWidget stay={stay} today={today} />}
      >
        <DetailSections
          sections={[
            {
              id: "about",
              label: "About the house",
              content: (
                <div className="max-w-prose">
                  <p className="text-18 text-ink-soft">{stay.intro}</p>
                  {stay.body.map((paragraph) => (
                    <p key={paragraph} className="mt-5 text-16 text-ink-soft">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ),
            },
            {
              id: "host",
              label: "Your hosts",
              content: (
                <div className="max-w-prose rounded-[var(--radius-card)] bg-shell p-6 lg:p-8">
                  <Eyebrow tone="sage">Hosted by</Eyebrow>
                  <p className="mt-4 text-28">{stay.hostName}</p>
                  <p className="mt-4 text-16 text-ink-soft">{stay.hostStory}</p>
                </div>
              ),
            },
            {
              id: "rooms",
              label: "Rooms",
              content: (
                <ul className="grid gap-8 sm:grid-cols-2">
                  {stay.rooms.map((room) => (
                    <li
                      key={room.name}
                      className="flex flex-col rounded-[var(--radius-card)] bg-shell p-6"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-22">{room.name}</h3>
                        <p className="u-num shrink-0 text-16">
                          {formatINR(room.perNight)}
                        </p>
                      </div>
                      <p className="u-label mt-2 text-ink-faint">
                        Sleeps {room.sleeps} · per night
                      </p>
                      <p className="mt-4 flex-1 text-16 text-ink-soft">
                        {room.description}
                      </p>
                      <ul className="mt-5 flex flex-wrap gap-1.5">
                        {room.amenities.map((amenity) => (
                          <li key={amenity}>
                            <Chip>{amenity}</Chip>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              id: "practical",
              label: "Practical",
              content: (
                <div className="grid gap-12 sm:grid-cols-2">
                  <div>
                    <Eyebrow tone="sage" className="mb-4">
                      What is here
                    </Eyebrow>
                    <ul className="flex flex-col gap-3">
                      {stay.amenities.map((item) => (
                        <li key={item} className="flex gap-3 text-16">
                          <span aria-hidden="true" className="text-sage">
                            —
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Eyebrow className="mb-4">Before you book</Eyebrow>
                    <ul className="flex flex-col gap-3">
                      {stay.houseRules.map((item) => (
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
                </div>
              ),
            },
          ]}
        />
      </DetailLayout>

      {tours.length > 0 ? (
        <>
          <SectionShell tint="sand">
            <SectionHeader
              eyebrow="Guided trips nearby"
              title={`Tours through ${getDestinationName(stay.state)}`}
              intro="Book the stay and the trip together and we line the transfers up between them."
              link={{ href: "/tours", label: "All trips" }}
              align="split"
            />
            <ul className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {tours.map((tour, index) => (
                <li key={tour.slug}>
                  <Reveal delay={index * 0.06}>
                    <TourCard
                      tour={toTourSummary(tour)}
                      sizes="(max-width: 640px) 100vw, 400px"
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
          </SectionShell>
        </>
      ) : null}

      {nearby.length > 0 ? (
        <>
          <SectionShell tint="shell">
            <SectionHeader
              eyebrow="Also in this state"
              title="Other houses nearby"
              link={{ href: "/homestays", label: "All homestays" }}
              align="split"
            />
            <ul className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {nearby.map((other, index) => (
                <li key={other.slug}>
                  <Reveal delay={index * 0.06}>
                    <StayCard
                      stay={other}
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
