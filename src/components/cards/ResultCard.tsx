import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";
import { formatMedium } from "@/lib/date";
import { Media } from "@/components/primitives/Media";
import { Chip } from "@/components/primitives/Chip";
import { regionColour } from "@/config/palette";
import type { WeaveRegion } from "@/components/layout/weave-motifs";

/**
 * One card for every kind of result. The variant changes the accent, the
 * meta line and the price unit — never the structure. Four card components
 * would drift within a month; one with a variant prop cannot.
 *
 * Server component. The hover motion is CSS on a group, not JS, so a grid of
 * forty of these ships no client JavaScript at all.
 */

export type ResultCardVariant = "tour" | "moto" | "stay" | "event";

export type ResultCardProps = {
  variant: ResultCardVariant;
  href: string;
  title: string;
  /** Editorial subtitle under the title. */
  strapline?: string;
  /** Small mono line above the title — usually the place. */
  eyebrow: string;
  price: number;
  /** "per person", "per night", "per ticket" — always stated. */
  priceUnit?: string;
  /** Alt text describing the place. Required — never "image". */
  imageAlt: string;
  imageSrc?: string;
  region?: WeaveRegion;
  /** Metadata pills: duration, difficulty, distance, sleeps. */
  chips?: string[];
  /** Right-aligned status note: seats left, dates, rating. */
  note?: string;
  /** Renders the note in the urgency accent. */
  noteUrgent?: boolean;
  /** `onDark` for the one dark band. Changes text and rule colours only. */
  tone?: "light" | "onDark";
  /** Fills its grid cell rather than sizing to content. */
  className?: string;
  /** Above-the-fold cards pass this so the image is an LCP candidate. */
  priority?: boolean;
  sizes?: string;
};

/*
 * The per-variant accent colour is gone. It used to tint the eyebrow by the
 * *kind* of result — clay for tours, ember for expeditions — which competed
 * with the state palette for the same slot and meant the same place appeared
 * in two different colours on two different pages. Colour on this site
 * identifies the place, never the product category.
 */

const DEFAULT_UNIT: Record<ResultCardVariant, string> = {
  tour: "per person",
  moto: "per rider",
  stay: "per night",
  event: "per ticket",
};

export function ResultCard({
  variant,
  href,
  title,
  strapline,
  eyebrow,
  price,
  priceUnit,
  imageAlt,
  imageSrc,
  region = "neutral",
  chips = [],
  note,
  noteUrgent = false,
  tone = "light",
  className,
  priority = false,
  sizes,
}: ResultCardProps) {
  const dark = tone === "onDark";
  const colour = regionColour(region);
  const rule = dark
    ? "border-[var(--night-hairline)]"
    : "border-[var(--ink-hairline)]";
  const soft = dark ? "text-night-text-soft" : "text-ink-faint";

  return (
    <article className={cn("group relative flex flex-col", className)}>
      {/*
       * Portrait, not landscape. 4:5 is the crop a place looks best in when
       * the subject is a valley or a ridge — the old 3:2 cut the height out
       * of everything — and a column of tall frames sets a slower rhythm
       * down the page, which is the whole point of this design.
       */}
      <div className="relative overflow-hidden rounded-[var(--radius-card)]">
        <Media
          alt={imageAlt}
          src={imageSrc}
          seed={href}
          region={region}
          aspect="4/5"
          priority={priority}
          sizes={sizes}
          // The image scales inside the frame; the card itself never moves.
          imageClassName="transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-[1.04]"
        />

        {/*
         * The state's own colour, as a bar across the foot of the frame. It
         * is the cheapest possible way to carry the palette onto a grid of
         * forty cards: no extra element competing for attention, no chip
         * covering the photograph, and the colour still reads at a glance
         * when the grid is scanned rather than read.
         */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 bottom-0 h-1 origin-left transition-transform duration-[var(--dur)] ease-brand",
            "scale-x-0 group-hover:scale-x-100",
          )}
          style={{ backgroundColor: colour.surface }}
        />
      </div>

      <div className="mt-7 flex flex-1 flex-col">
        <p
          className="u-label flex items-center gap-2.5"
          style={{ color: dark ? undefined : colour.ink }}
        >
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: colour.surface }}
          />
          <span className={cn(dark && "text-night-text-soft")}>{eyebrow}</span>
        </p>

        <h3 className={cn("mt-4 text-22", dark && "text-night-text")}>
          {/* The whole card is the hit area, via this stretched link. The
              rule under the title is the only hover feedback in the caption:
              the old version lifted the entire text block 4px, which in a
              grid of twelve made the page look like it was breathing. */}
          <Link href={href} className="after:absolute after:inset-0">
            <span className="relative inline">
              {title}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -bottom-1 left-0 block h-px w-full origin-right scale-x-0",
                  "transition-transform duration-[var(--dur-micro)] ease-brand",
                  "group-hover:origin-left group-hover:scale-x-100",
                  dark ? "bg-night-text" : "bg-ink",
                )}
              />
            </span>
          </Link>
        </h3>

        {strapline ? (
          <p
            className={cn(
              "mt-3 text-16",
              dark ? "text-night-text-soft" : "text-ink-soft",
            )}
          >
            {strapline}
          </p>
        ) : null}

        {chips.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip}>
                <Chip tone={dark ? "onDark" : "neutral"}>{chip}</Chip>
              </li>
            ))}
          </ul>
        ) : null}

        {/* `mt-auto` pins the price to the bottom of the cell, so a row of
            cards with different strapline lengths still lines its prices up. */}
        <div
          className={cn(
            "mt-auto flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t pt-6",
            rule,
          )}
        >
          {/* A free event says "free", not "from ₹0". */}
          {price === 0 ? (
            <p
              className={cn(
                "font-display text-22 leading-none",
                dark && "text-night-text",
              )}
            >
              Free
            </p>
          ) : (
            <p className="flex items-baseline gap-2">
              <span className={cn("u-label", soft)}>from</span>
              <span
                className={cn(
                  "u-num font-display text-22 leading-none",
                  dark && "text-night-text",
                )}
              >
                {formatINR(price)}
              </span>
              <span className={cn("u-label", soft)}>
                {priceUnit ?? DEFAULT_UNIT[variant]}
              </span>
            </p>
          )}
          {note ? (
            <p
              className={cn(
                "u-label",
                noteUrgent
                  ? dark
                    ? "text-ember-glow"
                    : "text-ember-ink"
                  : soft,
              )}
            >
              {note}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------------- */
/* Typed adapters. Pages pass domain objects; these decide how each kind of
   thing describes itself, so that logic lives once rather than in every
   index page. */

import type { MotorcycleTour, Homestay, NEEvent } from "@/content/types";
import { type TourSummary } from "@/content/tours";
import { getDestinationName } from "@/content/destinations";

const DIFFICULTY_LABEL = {
  easy: "Easy",
  moderate: "Moderate",
  challenging: "Challenging",
  expert: "Expert",
} as const;

/**
 * Takes a `TourSummary`, not a `Tour`. Index pages pass their data through a
 * client component, so anything on this object is serialised to the browser —
 * see the note on TourSummary in content/tours.ts.
 */
export function TourCard({
  tour,
  priority,
  sizes,
}: {
  tour: TourSummary;
  priority?: boolean;
  sizes?: string;
}) {
  const nextOpen = tour.nextDeparture;
  return (
    <ResultCard
      variant="tour"
      href={`/tours/${tour.slug}`}
      title={tour.title}
      strapline={tour.strapline}
      eyebrow={tour.states.map(getDestinationName).join(" · ")}
      price={tour.fromPrice}
      imageAlt={tour.heroAlt}
      imageSrc={tour.image}
      region={tour.region}
      chips={[
        `${tour.nights} nights`,
        DIFFICULTY_LABEL[tour.difficulty],
        ...(tour.requiresILP ? ["Permit included"] : []),
      ]}
      note={
        nextOpen
          ? `Next ${formatMedium(nextOpen.date)}`
          : "Next season on request"
      }
      noteUrgent={Boolean(nextOpen && nextOpen.status === "filling")}
      priority={priority}
      sizes={sizes}
    />
  );
}

export function MotoCard({
  tour,
  priority,
  sizes,
  tone,
}: {
  tour: MotorcycleTour;
  priority?: boolean;
  sizes?: string;
  tone?: ResultCardProps["tone"];
}) {
  const nextOpen = tour.departures.find((d) => d.status !== "sold-out");
  return (
    <ResultCard
      variant="moto"
      tone={tone}
      href={`/motorcycle-tours/${tour.slug}`}
      title={tour.title}
      strapline={tour.strapline}
      eyebrow={`${tour.distanceKm.toLocaleString("en-IN")} km · ${tour.maxAltitude.toLocaleString("en-IN")} m`}
      price={tour.fromPrice}
      imageAlt={tour.heroAlt}
      imageSrc={tour.image}
      region={tour.region}
      chips={[
        `${tour.nights} nights`,
        DIFFICULTY_LABEL[tour.difficulty],
        "Support truck",
      ]}
      note={
        nextOpen && nextOpen.seatsLeft <= 2
          ? `${nextOpen.seatsLeft} bikes left`
          : nextOpen
            ? `Next ${formatMedium(nextOpen.date)}`
            : "Next season on request"
      }
      noteUrgent={Boolean(nextOpen && nextOpen.seatsLeft <= 2)}
      priority={priority}
      sizes={sizes}
    />
  );
}

export function StayCard({
  stay,
  priority,
  sizes,
}: {
  stay: Homestay;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <ResultCard
      variant="stay"
      href={`/homestays/${stay.slug}`}
      title={stay.name}
      strapline={stay.strapline}
      eyebrow={`${stay.locality} · ${getDestinationName(stay.state)}`}
      price={stay.fromPrice}
      imageAlt={stay.heroAlt}
      imageSrc={stay.image}
      region={stay.region}
      chips={[
        `Sleeps ${stay.maxGuests}`,
        `${stay.bedrooms} bedrooms`,
        stay.mealsIncluded === "full-board"
          ? "All meals"
          : stay.mealsIncluded === "half-board"
            ? "Breakfast & dinner"
            : "Breakfast",
      ]}
      note={`${stay.rating.toFixed(1)} · ${stay.reviewCount} reviews`}
      priority={priority}
      sizes={sizes}
    />
  );
}

export function EventCard({
  event,
  priority,
  sizes,
}: {
  event: NEEvent;
  priority?: boolean;
  sizes?: string;
}) {
  const free = event.fromPrice === 0;
  return (
    <ResultCard
      variant="event"
      href={`/events/${event.slug}`}
      title={event.name}
      strapline={event.strapline}
      eyebrow={`${formatMedium(event.startDate)} · ${getDestinationName(event.state)}`}
      price={event.fromPrice}
      priceUnit={free ? "free entry" : "per ticket"}
      imageAlt={event.heroAlt}
      imageSrc={event.image}
      region={event.region}
      chips={[event.locality, event.category]}
      priority={priority}
      sizes={sizes}
    />
  );
}
