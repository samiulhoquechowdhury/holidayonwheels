import Image from "next/image";
import Link from "next/link";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Rise } from "@/components/motion/Rise";
import { Accent, Ember } from "@/components/primitives/Accent";
import {
  ArrowButton,
  LuxeButtonLink,
} from "@/components/primitives/LuxeButton";
import { getFeaturedEvents } from "@/content/events";
import { getDestinationName } from "@/content/destinations";
import { eventShots } from "@/config/showcase";
import { colourFor } from "@/config/palette";
import { formatMedium } from "@/lib/date";

/**
 * Festivals.
 *
 * The only section on the page with a deadline in it, and it is built around
 * that. Every card leads with the month, the countdown sits in ember, and the
 * scarcity line is a fact rather than a pressure tactic — Hornbill's Kohima
 * accommodation genuinely does go a year out, and saying so is useful where
 * "book now!" is not.
 *
 * Portrait crops, deliberately. Festivals are the one subject here that is
 * about people rather than landscape, and a 4:5 frame holds a crowd where a
 * 3:2 turns it into scenery.
 */
export function FestivalRail() {
  const events = getFeaturedEvents(3);

  return (
    <section className="relative bg-blush py-[var(--section-pad)]">
      <div className="u-container-wide">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[var(--ink-hairline)] pb-12">
          <div>
            <Rise className="u-label mb-6 flex items-center gap-4 text-ink-faint">
              <span className="h-px w-12 bg-[var(--ink-hairline-strong)]" />
              Festivals and events
            </Rise>
            <SplitReveal className="max-w-2xl text-48 lg:text-88">
              Time it <Accent>right</Accent>
            </SplitReveal>
          </div>
          <Rise delay={0.15} className="max-w-sm">
            <p className="text-16 text-ink-soft">
              Hornbill in December, Ziro in September, Bihu in April.{" "}
              <Ember>
                Several of these sell their accommodation out a year ahead.
              </Ember>
            </p>
            <div className="mt-7">
              <LuxeButtonLink href="/events" variant="ghost">
                All events
              </LuxeButtonLink>
            </div>
          </Rise>
        </div>

        <Rise
          as="ul"
          stagger={0.09}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
        >
          {events.map((event, index) => (
            <li key={event.slug}>
              <Link
                href={`/events/${event.slug}`}
                className="group relative isolate flex h-full min-h-[26rem] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-night p-6 text-night-text lg:min-h-[32rem] lg:p-7"
              >
                <Image
                  src={eventShots[index % eventShots.length] ?? ""}
                  alt={event.heroAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 32vw"
                  className="u-media-push -z-10 object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(20_18_15/0.9)] via-[rgb(20_18_15/0.3)] to-[rgb(20_18_15/0.15)]"
                />

                {/* Date chip in the state's colour. On a festival card this
                    is the most important thing on it — a festival you cannot
                    reach in time is not a product. */}
                <span
                  className="u-label absolute top-6 left-6 rounded-full px-4 py-2 text-night-text lg:top-7 lg:left-7"
                  style={{ backgroundColor: colourFor(event.state).surface }}
                >
                  {formatMedium(event.startDate)}
                </span>

                <span className="block font-display text-36 lg:text-48">
                  {event.name}
                </span>
                <span className="mt-2 block text-14 text-night-text-soft">
                  {event.venue} · {getDestinationName(event.state)}
                </span>

                <span className="mt-6 flex items-end justify-between gap-4 border-t border-[var(--night-hairline)] pt-5">
                  <span className="u-label text-clay">{event.category}</span>
                  <ArrowButton tone="paper" className="size-10" />
                </span>
              </Link>
            </li>
          ))}
        </Rise>
      </div>
    </section>
  );
}
