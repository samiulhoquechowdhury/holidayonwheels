import Link from "next/link";
import type { Metadata } from "next";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { WeaveBand } from "@/components/layout/WeaveBand";
import { Reveal } from "@/components/layout/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { ButtonLink } from "@/components/primitives/Button";
import { Media } from "@/components/primitives/Media";
import { VideoHero } from "@/components/home/VideoHero";
import { TourTypeTiles } from "@/components/home/TourTypeTiles";
import { DestinationRail } from "@/components/home/DestinationRail";
import { RentalsOutbound } from "@/components/home/RentalsOutbound";
import { MotoCard, EventCard, StayCard } from "@/components/cards/ResultCard";
import { getFeaturedMotorcycleTours } from "@/content/motorcycle-tours";
import { getFeaturedHomestays } from "@/content/homestays";
import { getFeaturedEvents } from "@/content/events";
import { getJournalPosts } from "@/content/journal";
import { getILPStates } from "@/content/destinations";
import { formatMedium } from "@/lib/date";

export const metadata: Metadata = {
  title: "Northeast India, properly travelled",
  description:
    "Guided tours, motorcycle expeditions, homestays and events across the eight states of Northeast India, with Inner Line Permits handled for you.",
};

/**
 * Home.
 *
 * Section tints cycle so no two adjacent sections share a family:
 * warm → cool → neutral → green → warm → cool → neutral → warm.
 * The weave band between them carries the region each section is about.
 */
export default function HomePage() {
  const motos = getFeaturedMotorcycleTours(3);
  const stays = getFeaturedHomestays(2);
  const events = getFeaturedEvents(3);
  const posts = getJournalPosts().slice(0, 3);
  const ilpStates = getILPStates();

  return (
    <>
      <VideoHero
        eyebrow="Assam · Meghalaya · Arunachal · Nagaland · Manipur · Mizoram · Tripura · Sikkim"
        lines={["Eight states most people", "never think to visit."]}
        ctaLabel="Find your trip"
        ctaHref="/tours"
      />

      {/* 2 — Tour type entry ------------------------------------------- */}
      <WeaveBand region="assam" height={32} opacity={0.45} />
      <SectionShell tint="muga" pattern="assam" patternOpacity={0.035}>
        <SectionHeader
          eyebrow="Start here"
          title="How are you travelling?"
          intro="The same places, run four different ways. It changes the pace, the group size and the vehicle more than it changes the map."
          link={{ href: "/tours", label: "See all trips" }}
          align="split"
        />
        <TourTypeTiles />
      </SectionShell>

      {/* 3 — Destinations ---------------------------------------------- */}
      <WeaveBand region="meghalaya" height={32} opacity={0.45} />
      <SectionShell tint="cloud" pattern="meghalaya" patternOpacity={0.035}>
        <SectionHeader
          eyebrow="The eight states"
          title="Where you could go"
          intro="Roughly west to east. Four of the eight need an Inner Line Permit, which we handle as part of any booking."
          link={{ href: "/destinations", label: "All destinations" }}
          align="split"
        />
        <Reveal>
          <DestinationRail />
        </Reveal>
      </SectionShell>

      {/* 4 — Motorcycle expeditions — the one dark band below the hero -- */}
      <WeaveBand region="nagaland" height={36} opacity={0.5} />
      <SectionShell tint="night" pattern="nagaland" patternOpacity={0.05}>
        <SectionHeader
          tone="onDark"
          eyebrow="Motorcycle expeditions"
          title="Guided rides, with a truck behind you"
          intro="Every departure runs with a support pickup carrying a mechanic, spares, fuel, luggage and — above four thousand metres — oxygen. That is the difference between an expedition and a group of people on bikes hoping for the best."
          link={{ href: "/motorcycle-tours", label: "All expeditions" }}
          align="split"
        />
        <ul className="grid gap-8 md:grid-cols-3 md:gap-6">
          {motos.map((tour, index) => (
            <li key={tour.slug}>
              <Reveal delay={index * 0.06}>
                <MotoCard
                  tour={tour}
                  tone="onDark"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </SectionShell>

      {/* 5 — Homestays -------------------------------------------------- */}
      <WeaveBand region="arunachal" height={32} opacity={0.45} />
      <SectionShell tint="paddy" pattern="arunachal" patternOpacity={0.035}>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)] lg:self-start">
            <SectionHeader
              className="mb-8 lg:mb-10"
              eyebrow="Homestays"
              title="Stay in somebody's house"
              intro="Every homestay here is owned and run by the family living in it, and they set their own rates. We take a booking commission and nothing else. Some of them have no road to them at all."
              link={{ href: "/homestays", label: "Browse homestays" }}
            />
          </div>
          <ul className="grid gap-10 sm:grid-cols-2">
            {stays.map((stay, index) => (
              <li key={stay.slug}>
                <Reveal delay={index * 0.08}>
                  <StayCard
                    stay={stay}
                    sizes="(max-width: 640px) 100vw, 340px"
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </SectionShell>

      {/* 6 — Events ----------------------------------------------------- */}
      <WeaveBand region="mizoram" height={32} opacity={0.45} />
      <SectionShell tint="cherry" pattern="mizoram" patternOpacity={0.035}>
        <SectionHeader
          eyebrow="Festivals and events"
          title="Time it right"
          intro="Hornbill in December, Ziro in September, Bihu in April. Several of these sell their accommodation out a year ahead."
          link={{ href: "/events", label: "All events" }}
          align="split"
        />
        <ul className="grid gap-8 md:grid-cols-3 md:gap-6">
          {events.map((event, index) => (
            <li key={event.slug}>
              <Reveal delay={index * 0.06}>
                <EventCard
                  event={event}
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </SectionShell>

      {/* 7 — ILP helper -------------------------------------------------- */}
      <WeaveBand region="manipur" height={28} opacity={0.4} />
      <SectionShell
        tint="loktak"
        pattern="manipur"
        patternOpacity={0.03}
        spacing="tight"
      >
        <Reveal className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-20">
          <div>
            <Eyebrow tone="teal">Inner Line Permits</Eyebrow>
            <h2 className="mt-5 text-36">
              Four of the eight states need a permit. We do the paperwork.
            </h2>
            <p className="mt-5 max-w-xl text-18 text-ink-soft">
              An Inner Line Permit lets an Indian citizen enter a protected
              state. They are not difficult, but they are refused for name
              mismatches and they are refused for late applications — so we
              apply the day your booking is confirmed, at no charge.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/ilp" variant="secondary">
                How permits work
              </ButtonLink>
              <ButtonLink href="/ilp/apply" variant="primary">
                Start an application
              </ButtonLink>
            </div>
          </div>

          <ul className="grid gap-px overflow-hidden rounded-[var(--radius-media)] border border-[var(--ink-hairline)] bg-[var(--ink-hairline)] sm:grid-cols-2">
            {ilpStates.map((state) => (
              <li key={state.slug} className="bg-tint-loktak p-5">
                <p className="u-mono text-deep-teal-ink">Permit required</p>
                <p className="mt-2 text-18">{state.name}</p>
                <p className="mt-1 text-14 text-ink-soft">
                  {state.requiresPAP
                    ? "Foreign nationals need a Protected Area Permit"
                    : "Indian nationals, Inner Line Permit"}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </SectionShell>

      {/* 8 — Rentals, outbound ------------------------------------------ */}
      <WeaveBand region="tripura" height={28} opacity={0.4} />
      <SectionShell tint="paper" pattern="tripura" patternOpacity={0.03}>
        <SectionHeader
          eyebrow="Self-drive"
          title="Or take the wheel yourself"
          intro="Car and bike hire is run by our partner Beep Drive rather than booked here. It opens in a new tab and is paid for separately."
          align="split"
        />
        <RentalsOutbound />
      </SectionShell>

      {/* 9 — Journal ---------------------------------------------------- */}
      <WeaveBand region="sikkim" height={32} opacity={0.45} />
      <SectionShell tint="muga" pattern="sikkim" patternOpacity={0.035}>
        <SectionHeader
          eyebrow="Journal"
          title="Worth reading before you book"
          link={{ href: "/journal", label: "All writing" }}
          align="split"
        />
        <ul className="grid gap-10 md:grid-cols-3 md:gap-6">
          {posts.map((post, index) => (
            <li key={post.slug}>
              <Reveal delay={index * 0.06}>
                <article className="group">
                  <Link href={`/journal/${post.slug}`} className="block">
                    <div className="overflow-hidden rounded-[var(--radius-media)]">
                      <Media
                        alt={post.heroAlt}
                        src={post.image}
                        seed={`journal-${post.slug}`}
                        region={post.region}
                        aspect="3/2"
                        sizes="(max-width: 768px) 100vw, 400px"
                        imageClassName="transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-105"
                      />
                    </div>
                    <p className="u-mono mt-5 text-ink-soft">
                      {post.tag} · {formatMedium(post.publishedAt)}
                    </p>
                    <h3 className="mt-3 text-22">{post.title}</h3>
                    <p className="mt-2 text-16 text-ink-soft">{post.excerpt}</p>
                    <p className="u-mono mt-4 text-ink-faint">
                      {post.readingMinutes} min read
                    </p>
                  </Link>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </SectionShell>
    </>
  );
}
