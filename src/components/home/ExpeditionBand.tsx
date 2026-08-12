import Image from "next/image";
import Link from "next/link";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Rise } from "@/components/motion/Rise";
import { Counter } from "@/components/motion/Counter";
import { ParallaxMedia } from "@/components/motion/Parallax";
import { Accent, Ember } from "@/components/primitives/Accent";
import {
  ArrowButton,
  LuxeButtonLink,
} from "@/components/primitives/LuxeButton";
import { getFeaturedMotorcycleTours } from "@/content/motorcycle-tours";
import { motoShots, editorial } from "@/config/showcase";
import { formatINR } from "@/lib/currency";

/**
 * The one dark band on the page.
 *
 * It happens once, and it happens here, because the motorcycle expeditions
 * are the only thing on this site with genuine risk attached to them — the
 * change of ground is doing editorial work rather than decorating a section
 * break. A page that alternates light and dark every section has no dark
 * section at all.
 *
 * The band leads with the support truck rather than with the bikes, which is
 * the actual argument: anyone can rent a Himalayan, and what is being sold
 * is the mechanic, the spares and the oxygen following you at 4,000 metres.
 * The three figures at the top are counted up on entry — a number that tallies
 * in front of you reads as evidence in a way a printed one does not.
 */
export function ExpeditionBand() {
  const tours = getFeaturedMotorcycleTours(3);

  return (
    <section className="is-dark relative isolate overflow-hidden bg-night py-[var(--section-pad)] text-night-text">
      <div aria-hidden="true" className="u-grid-lines" />

      {/* A single photograph bled behind the top of the band at low opacity.
          It stops the black reading as a flat panel without ever competing
          with the type sitting on it. */}
      <ParallaxMedia
        amount={16}
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] opacity-25"
      >
        <Image
          src={editorial.duskMountain}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </ParallaxMedia>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-gradient-to-b from-[rgb(42_38_33/0.55)] via-[rgb(42_38_33/0.8)] to-night"
      />

      <div className="u-container-wide relative">
        <Rise className="u-label mb-8 flex items-center gap-4 text-night-text-soft">
          <span className="h-px w-12 bg-[var(--night-hairline)]" />
          Motorcycle expeditions
        </Rise>

        <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-24">
          <SplitReveal className="text-48 lg:text-88">
            Guided rides, with a <Accent>truck</Accent> behind you
          </SplitReveal>
          <Rise delay={0.15}>
            <p className="u-lede max-w-md text-18 text-night-text-soft">
              Every departure runs with a support pickup carrying a mechanic,
              spares, fuel, luggage and — above four thousand metres —{" "}
              <Ember>oxygen</Ember>. That is the difference between an
              expedition and a group of people on bikes hoping for the best.
            </p>
          </Rise>
        </div>

        {/* Three figures, counted. */}
        <Rise
          stagger={0.1}
          className="mt-16 grid gap-8 border-y border-[var(--night-hairline)] py-10 sm:grid-cols-3 lg:mt-20"
        >
          {[
            { value: 4170, suffix: " m", label: "Highest pass crossed" },
            { value: 1, suffix: " : 4", label: "Mechanic to riders, minimum" },
            { value: 0, suffix: "", label: "Departures run without support" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-64 leading-none text-clay">
                <Counter to={stat.value} suffix={stat.suffix} />
              </p>
              <p className="u-label mt-4 text-night-text-soft">{stat.label}</p>
            </div>
          ))}
        </Rise>

        {/* The expeditions themselves, plus one solid tile that closes the
            row and carries the link out. */}
        <Rise
          as="ul"
          stagger={0.09}
          className="mt-14 grid gap-4 lg:grid-cols-12 lg:gap-5"
        >
          {tours.map((tour, index) => (
            <li key={tour.slug} className="lg:col-span-3">
              <Link
                href={`/motorcycle-tours/${tour.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-night-soft"
              >
                <span className="relative block aspect-[4/3] overflow-hidden">
                  <Image
                    src={motoShots[index % motoShots.length] ?? ""}
                    alt={tour.heroAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 24vw"
                    className="u-media-push object-cover"
                  />
                  <span className="u-glass-dark u-label absolute top-4 left-4 rounded-full px-3.5 py-1.5">
                    {tour.difficulty}
                  </span>
                </span>

                <span className="flex flex-1 flex-col justify-between gap-6 p-6">
                  <span>
                    <span className="block text-22">{tour.title}</span>
                    <span className="mt-2 block text-14 text-night-text-soft">
                      {tour.days} days ·{" "}
                      {tour.distanceKm.toLocaleString("en-IN")} km ·{" "}
                      {tour.maxAltitude.toLocaleString("en-IN")} m
                    </span>
                  </span>
                  <span className="flex items-end justify-between gap-4">
                    <span className="u-num u-label text-clay">
                      From {formatINR(tour.fromPrice)}
                    </span>
                    <ArrowButton tone="paper" className="size-10" />
                  </span>
                </span>
              </Link>
            </li>
          ))}

          <li className="lg:col-span-3">
            <div className="flex h-full flex-col justify-between gap-8 rounded-[var(--radius-card)] border border-[var(--night-hairline)] p-6 lg:p-7">
              <p className="text-22">
                Nine more expeditions, from three days to a fortnight.
              </p>
              <LuxeButtonLink href="/motorcycle-tours" variant="onDark">
                All expeditions
              </LuxeButtonLink>
            </div>
          </li>
        </Rise>
      </div>
    </section>
  );
}
