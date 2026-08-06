import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailLayout, DetailSections } from "@/components/layout/DetailLayout";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { WeaveBand } from "@/components/layout/WeaveBand";
import { Reveal } from "@/components/layout/Reveal";
import { TicketPicker } from "@/components/booking/TicketPicker";
import { EventCard, StayCard } from "@/components/cards/ResultCard";
import { getEventBySlug, getEvents, getEventsByState } from "@/content/events";
import { getDestinationName } from "@/content/destinations";
import { getHomestaysByState } from "@/content/homestays";
import { formatRange } from "@/lib/date";

export function generateStaticParams() {
  return getEvents().map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};
  return { title: event.name, description: event.intro.slice(0, 155) };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const stays = getHomestaysByState(event.state).slice(0, 3);
  const others = getEventsByState(event.state).filter((e) => e.slug !== slug);

  return (
    <>
      <DetailLayout
        seed={event.slug}
        region={event.region}
        eyebrow={`${formatRange(event.startDate, event.endDate)} · ${getDestinationName(event.state)}`}
        title={event.name}
        strapline={event.strapline}
        chips={[event.venue, event.locality, event.category]}
        gallery={[
          { alt: event.heroAlt, src: event.image },
          { alt: `Crowds at ${event.name}, ${event.locality}` },
          { alt: `Performers at ${event.name}, ${event.venue}` },
        ]}
        panel={<TicketPicker event={event} />}
      >
        <DetailSections
          sections={[
            {
              id: "about",
              label: "About",
              content: (
                <div className="max-w-prose">
                  <p className="text-18 text-ink-soft">{event.intro}</p>
                  {event.body.map((paragraph) => (
                    <p key={paragraph} className="mt-5 text-16 text-ink-soft">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ),
            },
            ...(event.lineup
              ? [
                  {
                    id: "programme",
                    label: "Programme",
                    content: (
                      <ul className="flex flex-col gap-3">
                        {event.lineup.map((item) => (
                          <li
                            key={item}
                            className="flex gap-4 border-b border-[var(--ink-hairline)] pb-3 text-18"
                          >
                            <span aria-hidden="true" className="text-muga-gold">
                              —
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ),
                  },
                ]
              : []),
            {
              id: "tickets",
              label: "Ticket tiers",
              content: (
                <ul className="grid gap-6 sm:grid-cols-2">
                  {event.tickets.map((tier) => (
                    <li
                      key={tier.name}
                      className="flex flex-col rounded-[var(--radius-media)] border border-[var(--ink-hairline)] p-6"
                    >
                      <h3 className="text-22">{tier.name}</h3>
                      <p className="mt-3 flex-1 text-16 text-ink-soft">
                        {tier.description}
                      </p>
                      <ul className="mt-5 flex flex-col gap-2">
                        {tier.perks.map((perk) => (
                          <li key={perk} className="flex gap-3 text-14">
                            <span aria-hidden="true" className="text-deep-teal">
                              —
                            </span>
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ),
            },
          ]}
        />
      </DetailLayout>

      {stays.length > 0 ? (
        <>
          <WeaveBand region={event.region} height={32} opacity={0.45} />
          <SectionShell
            tint="paddy"
            pattern={event.region}
            patternOpacity={0.03}
          >
            <SectionHeader
              eyebrow="Where to stay"
              title={`Homestays in ${getDestinationName(event.state)}`}
              intro="Festival accommodation is the part that causes trouble. Book it at the same time as the ticket."
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

      {others.length > 0 ? (
        <>
          <WeaveBand region="neutral" height={28} opacity={0.4} />
          <SectionShell tint="cloud" pattern="neutral" patternOpacity={0.03}>
            <SectionHeader
              eyebrow="Also in this state"
              title="Other events nearby"
              link={{ href: "/events", label: "All events" }}
              align="split"
            />
            <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {others.map((other, index) => (
                <li key={other.slug}>
                  <Reveal delay={index * 0.06}>
                    <EventCard
                      event={other}
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
