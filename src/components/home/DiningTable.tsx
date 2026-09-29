import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Rise } from "@/components/motion/Rise";
import { ArrowButton } from "@/components/primitives/LuxeButton";
import { diningExperiences } from "@/config/dining";
import { formatINR } from "@/lib/currency";
import { cn } from "@/lib/cn";
import type { DiningExperience } from "@/config/dining";

/**
 * Where you eat.
 *
 * It sits directly after the homestays and before the festivals, which is the
 * order the questions actually arrive in: where you sleep, what you eat, when
 * to come. Food was the one part of a trip here the page never mentioned,
 * and in this region that is a strange omission — a Naga kitchen and an
 * Assamese thali are a reason to come, not an amenity.
 *
 * Four, laid out 4–2 over 3–3 on a six-column grid. The asymmetry is doing a
 * job: the long table is the showpiece and is twice the width of the private
 * dinner beside it, so the row has a subject rather than being two equal
 * halves. Below `lg` it stacks and the order alone carries the hierarchy.
 *
 * Deliberately not a bento of photographs with the type over them — the
 * signature routes two sections up already are that, and repeating the device
 * would make the page feel like one idea stretched. Here the picture sits
 * above its own caption block on the section's own ground, which is the
 * quieter of the two treatments and the right one this far down the page.
 */
export function DiningTable() {
  const [feature, ...rest] = diningExperiences;

  return (
    <section className="relative bg-sand py-[var(--section-pad)]">
      <div className="u-container-wide">
        <SectionHeader
          eyebrow="At the table"
          title="Dinner is part of the trip"
          accent="Dinner"
          intro="Not a restaurant list. Four evenings we arrange ourselves, on nights you are already there — from a long table on a tea-estate lawn to the thali the region actually eats at home."
          align="split"
        />

        <div className="mt-14 grid gap-4 lg:mt-20 lg:grid-cols-6 lg:gap-5">
          {feature ? (
            <div className="lg:col-span-4">
              <Rise>
                <DiningCard item={feature} feature priority />
              </Rise>
            </div>
          ) : null}
          {rest[0] ? (
            <div className="lg:col-span-2">
              <Rise delay={0.08}>
                <DiningCard item={rest[0]} />
              </Rise>
            </div>
          ) : null}
          {rest.slice(1).map((item, index) => (
            <div key={item.id} className="lg:col-span-3">
              <Rise delay={0.12 + index * 0.06}>
                <DiningCard item={item} />
              </Rise>
            </div>
          ))}
        </div>

        {/*
         * One way out, and it is the planner rather than a dining index.
         * These are not sold on their own — they go onto a night of an
         * itinerary — so the honest link is the place where the nights exist.
         */}
        <p className="mt-12 max-w-xl text-16 text-ink-soft">
          Tell us which nights you would like one of these on, and we will book
          it into the itinerary.{" "}
          <Link href="/destinations#plan" className="u-link">
            Plan the days first
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

/**
 * One evening.
 *
 * `feature` widens the crop rather than changing anything else — the same
 * component, so the four cannot drift apart as they get edited.
 */
function DiningCard({
  item,
  feature = false,
  priority = false,
}: {
  item: DiningExperience;
  feature?: boolean;
  priority?: boolean;
}) {
  return (
    <article className="group flex h-full flex-col">
      <span
        className={cn(
          "relative block w-full overflow-hidden rounded-[var(--radius-media)]",
          feature ? "aspect-[16/10]" : "aspect-[4/3]",
        )}
      >
        <Image
          src={item.image}
          alt={item.alt}
          fill
          priority={priority}
          sizes={
            feature
              ? "(max-width: 1024px) 100vw, 56vw"
              : "(max-width: 1024px) 100vw, 30vw"
          }
          className="object-cover transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-[1.04]"
        />
        <span className="u-glass u-label absolute top-4 left-4 rounded-full px-4 py-2 text-ink">
          {item.kind}
        </span>
      </span>

      <div className="mt-6 flex flex-1 flex-col">
        <h3
          className={cn(
            "font-display leading-[var(--leading-display)]",
            feature ? "text-36 lg:text-48" : "text-28",
          )}
        >
          {item.name}
        </h3>
        <p
          className={cn(
            "mt-3 text-ink-soft",
            feature ? "max-w-xl text-18" : "text-16",
          )}
        >
          {item.copy}
        </p>

        <div className="mt-6 flex items-end justify-between gap-6 border-t border-[var(--ink-hairline)] pt-5">
          <div className="min-w-0">
            <p className="u-label text-ink-faint">{item.where}</p>
            <p className="u-num u-label mt-2 text-clay-ink">
              From {formatINR(item.fromPrice)} per person
            </p>
          </div>
          {feature ? <ArrowButton tone="ink" /> : null}
        </div>
      </div>
    </article>
  );
}
