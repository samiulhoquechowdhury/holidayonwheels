import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { WeaveBand } from "@/components/layout/WeaveBand";
import { Reveal } from "@/components/layout/Reveal";
import { Media } from "@/components/primitives/Media";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Chip } from "@/components/primitives/Chip";
import { ButtonLink } from "@/components/primitives/Button";
import {
  TourCard,
  MotoCard,
  StayCard,
  EventCard,
} from "@/components/cards/ResultCard";
import { getDestinationBySlug, getDestinations } from "@/content/destinations";
import { getToursByState, toTourSummary } from "@/content/tours";
import { getMotorcycleTours } from "@/content/motorcycle-tours";
import { getHomestaysByState } from "@/content/homestays";
import { getEventsByState } from "@/content/events";
import type { StateSlug } from "@/content/types";

export function generateStaticParams() {
  return getDestinations().map((destination) => ({ slug: destination.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);
  if (!destination) return {};
  return {
    title: destination.name,
    description: destination.intro.slice(0, 155),
  };
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);
  if (!destination) notFound();

  const state = destination.slug as StateSlug;
  const tours = getToursByState(state).slice(0, 6);
  const motos = getMotorcycleTours()
    .filter((t) => t.states.includes(state))
    .slice(0, 3);
  const stays = getHomestaysByState(state);
  const events = getEventsByState(state);

  return (
    <>
      <PageHero
        eyebrow={`Gateway ${destination.gateway}`}
        title={destination.name}
        intro={destination.tagline}
        tint={destination.tint}
        region={destination.region}
      />

      {/* Editorial opening */}
      <SectionShell
        tint="paper"
        pattern={destination.region}
        patternOpacity={0.025}
      >
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <p className="text-22 text-ink-soft">{destination.intro}</p>
            {destination.body.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-6 max-w-prose text-16 text-ink-soft"
              >
                {paragraph}
              </p>
            ))}

            <ul className="mt-8 flex flex-wrap gap-1.5">
              {destination.knownFor.map((thing) => (
                <li key={thing}>
                  <Chip>{thing}</Chip>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-[var(--radius-media)]">
              <Media
                alt={destination.heroAlt}
                src={destination.image}
                seed={`destination-hero-${destination.slug}`}
                region={destination.region}
                aspect="4/5"
                priority
                sizes="(max-width: 1024px) 100vw, 520px"
              />
            </div>

            <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Fact
                label="Best months"
                value={destination.bestMonths.join(", ")}
              />
              <Fact label="Gateway" value={destination.gateway} />
              <Fact
                label="Indian nationals"
                value={
                  destination.requiresILP
                    ? "Inner Line Permit required"
                    : "No permit required"
                }
              />
              <Fact
                label="Foreign nationals"
                value={
                  destination.requiresPAP
                    ? "Protected Area Permit required"
                    : "No permit required"
                }
              />
            </dl>

            {destination.requiresILP ? (
              <div className="mt-8 rounded-[var(--radius-control)] border border-[color-mix(in_srgb,var(--deep-teal)_35%,transparent)] bg-[color-mix(in_srgb,var(--deep-teal)_6%,transparent)] p-5">
                <Eyebrow tone="teal">Permits</Eyebrow>
                <p className="mt-3 text-16">
                  {destination.name} needs an Inner Line Permit. We process it
                  for every traveller on every booking at no charge, and we
                  apply the day your booking is confirmed rather than close to
                  departure.
                </p>
                <ButtonLink
                  href="/ilp"
                  variant="secondary"
                  size="sm"
                  className="mt-5"
                >
                  How permits work
                </ButtonLink>
              </div>
            ) : null}
          </Reveal>
        </div>
      </SectionShell>

      {tours.length > 0 ? (
        <>
          <WeaveBand region={destination.region} height={32} opacity={0.45} />
          <SectionShell
            tint="muga"
            pattern={destination.region}
            patternOpacity={0.03}
          >
            <SectionHeader
              eyebrow="Guided tours"
              title={`Trips through ${destination.name}`}
              link={{ href: "/tours", label: "All trips" }}
              align="split"
            />
            <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {tours.map((tour, index) => (
                <li key={tour.slug}>
                  <Reveal delay={Math.min(index, 3) * 0.05}>
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

      {motos.length > 0 ? (
        <>
          <WeaveBand region={destination.region} height={36} opacity={0.5} />
          <SectionShell
            tint="night"
            pattern={destination.region}
            patternOpacity={0.05}
          >
            <SectionHeader
              tone="onDark"
              eyebrow="Motorcycle expeditions"
              title={`Riding in ${destination.name}`}
              link={{ href: "/motorcycle-tours", label: "All expeditions" }}
              align="split"
            />
            <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {motos.map((tour, index) => (
                <li key={tour.slug}>
                  <Reveal delay={index * 0.06}>
                    <MotoCard
                      tour={tour}
                      tone="onDark"
                      sizes="(max-width: 640px) 100vw, 400px"
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
          </SectionShell>
        </>
      ) : null}

      {stays.length > 0 ? (
        <>
          <WeaveBand region={destination.region} height={32} opacity={0.45} />
          <SectionShell
            tint="paddy"
            pattern={destination.region}
            patternOpacity={0.03}
          >
            <SectionHeader
              eyebrow="Homestays"
              title={`Where to stay in ${destination.name}`}
              link={{ href: "/homestays", label: "All homestays" }}
              align="split"
            />
            <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
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

      {events.length > 0 ? (
        <>
          <WeaveBand region={destination.region} height={32} opacity={0.45} />
          <SectionShell
            tint="cherry"
            pattern={destination.region}
            patternOpacity={0.03}
          >
            <SectionHeader
              eyebrow="Festivals and events"
              title={`What happens in ${destination.name}`}
              link={{ href: "/events", label: "All events" }}
              align="split"
            />
            <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {events.map((event, index) => (
                <li key={event.slug}>
                  <Reveal delay={index * 0.06}>
                    <EventCard
                      event={event}
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
