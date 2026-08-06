import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";
import { formatMedium } from "@/lib/date";
import { Media } from "@/components/primitives/Media";
import { Chip } from "@/components/primitives/Chip";
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

const ACCENT: Record<ResultCardVariant, string> = {
  tour: "text-muga-gold-ink",
  moto: "text-naga-red-ink",
  stay: "text-deep-teal-ink",
  event: "text-ink-soft",
};

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
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="overflow-hidden rounded-[var(--radius-media)]">
        <Media
          alt={imageAlt}
          src={imageSrc}
          seed={href}
          region={region}
          aspect="3/2"
          priority={priority}
          sizes={sizes}
          // The image scales inside the frame; the card itself never moves.
          imageClassName="transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-105"
        />
      </div>

      {/* Caption lifts 4px on hover. Reduced motion drops the transform. */}
      <div className="mt-5 transition-transform duration-[var(--dur)] ease-brand motion-safe:group-hover:-translate-y-1">
        <p
          className={cn(
            "u-mono",
            dark ? "text-night-text-soft" : ACCENT[variant],
          )}
        >
          {eyebrow}
        </p>

        <h3
          className={cn(
            "mt-2.5 text-22 leading-tight",
            dark && "text-night-text",
          )}
        >
          {/* The whole card is the hit area, via this stretched link. */}
          <Link href={href} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>

        {strapline ? (
          <p
            className={cn(
              "mt-2 text-16",
              dark ? "text-night-text-soft" : "text-ink-soft",
            )}
          >
            {strapline}
          </p>
        ) : null}

        {chips.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <li key={chip}>
                <Chip tone={dark ? "onDark" : "neutral"}>{chip}</Chip>
              </li>
            ))}
          </ul>
        ) : null}

        <div
          className={cn(
            "mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t pt-4",
            dark
              ? "border-[rgb(255_255_255/0.16)]"
              : "border-[var(--ink-hairline)]",
          )}
        >
          {/* A free event says "free", not "from ₹0". */}
          {price === 0 ? (
            <p className="font-mono text-18">Free</p>
          ) : (
            <p className="flex items-baseline gap-2">
              <span
                className={cn(
                  "u-mono",
                  dark ? "text-night-text-soft" : "text-ink-soft",
                )}
              >
                from
              </span>
              <span
                className={cn(
                  "font-mono text-18 tabular-nums",
                  dark && "text-night-text",
                )}
              >
                {formatINR(price)}
              </span>
              <span
                className={cn(
                  "u-mono",
                  dark ? "text-night-text-soft" : "text-ink-soft",
                )}
              >
                {priceUnit ?? DEFAULT_UNIT[variant]}
              </span>
            </p>
          )}
          {note ? (
            <p
              className={cn(
                "u-mono",
                noteUrgent
                  ? dark
                    ? "text-naga-red-glow"
                    : "text-naga-red-ink"
                  : dark
                    ? "text-night-text-soft"
                    : "text-ink-faint",
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
