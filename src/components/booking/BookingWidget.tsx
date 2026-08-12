"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";
import { formatRange } from "@/lib/date";
import { Button } from "@/components/primitives/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { StickyBookingBar } from "./StickyBookingBar";
import { buildQuote, type BookingLine } from "@/lib/quote";
import type { Departure, PriceBand } from "@/content/types";

/**
 * The money component.
 *
 * Dates, party size, a price breakdown that adds up, and the CTA. Everything
 * here is deliberately explicit — a traveller should never reach the payment
 * step and find a number they have not already seen.
 *
 * On mobile the panel collapses into a bottom sheet driven by
 * `StickyBookingBar`, so the price and CTA are always within thumb reach.
 */

export function BookingWidget({
  title,
  departures,
  priceBands,
  singleSupplement = 0,
  maxPax,
  /** Where the CTA goes. Slug is appended as a query param. */
  checkoutSlug,
  checkoutKind,
  requiresILP = false,
  className,
}: {
  title: string;
  departures: Departure[];
  priceBands: PriceBand[];
  singleSupplement?: number;
  maxPax: number;
  checkoutSlug: string;
  checkoutKind: "tour" | "moto";
  requiresILP?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const firstAvailable = departures.find((d) => d.status !== "sold-out");
  const [date, setDate] = useState(firstAvailable?.date ?? "");
  const [pax, setPax] = useState(2);

  const departure = departures.find((d) => d.date === date);

  const quote = useMemo(
    () =>
      buildQuote({
        departure,
        priceBands,
        pax,
        singleSupplement,
      }),
    [departure, priceBands, pax, singleSupplement],
  );

  const canBook = Boolean(departure) && pax > 0;

  function goToCheckout() {
    if (!departure) return;
    const params = new URLSearchParams({
      kind: checkoutKind,
      slug: checkoutSlug,
      date: departure.date,
      pax: String(pax),
    });
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <>
      <section
        aria-labelledby="booking-heading"
        className={cn(
          "rounded-[var(--radius-panel)] bg-plate p-7 shadow-[var(--shadow-soft)] lg:p-8",
          className,
        )}
      >
        <h2 id="booking-heading" className="u-sr-only">
          Book {title}
        </h2>

        <div className="flex items-baseline justify-between gap-3">
          <Eyebrow>From</Eyebrow>
          <p className="u-num font-display text-28 leading-none">
            {formatINR(quote.perPerson)}
          </p>
        </div>
        <p className="u-label mt-1 text-right text-ink-soft">per person</p>

        <div className="mt-7">
          <Eyebrow className="mb-3">Choose a departure</Eyebrow>
          <AvailabilityCalendar
            departures={departures}
            selected={date}
            onSelect={setDate}
          />
        </div>

        <div className="mt-7">
          <Eyebrow className="mb-3">Travellers</Eyebrow>
          <PaxStepper value={pax} onChange={setPax} max={maxPax} />
          {pax === 1 && singleSupplement > 0 ? (
            <p className="mt-2 text-14 text-ink-soft">
              A single supplement of {formatINR(singleSupplement)} applies. Some
              of our tours waive it — look for the solo traveller tag.
            </p>
          ) : null}
          {pax >= 4 ? (
            <p className="mt-2 text-14 text-sage-ink">
              Your party size qualifies for a lower per-person rate. It is
              already applied above.
            </p>
          ) : null}
        </div>

        <PriceBreakdown lines={quote.lines} total={quote.total} />

        <Button
          variant="primary"
          size="lg"
          block
          className="mt-6"
          disabled={!canBook}
          onClick={goToCheckout}
        >
          {canBook ? "Continue to booking" : "Choose a date to continue"}
        </Button>

        <p className="mt-4 text-14 text-ink-soft">
          A 25% deposit confirms your place. The balance is due 60 days before
          departure.
          {requiresILP
            ? " Inner Line Permits for every traveller are processed by us at no charge."
            : ""}
        </p>
      </section>

      <StickyBookingBar
        label={
          departure
            ? formatRange(departure.date, departure.endDate)
            : "Select a date"
        }
        amount={quote.total}
        amountLabel={`${pax} ${pax === 1 ? "traveller" : "travellers"}, total`}
        ctaLabel="Book"
        onCta={goToCheckout}
        disabled={!canBook}
        watchId="booking-heading"
      />
    </>
  );
}

function PriceBreakdown({
  lines,
  total,
}: {
  lines: BookingLine[];
  total: number;
}) {
  return (
    <div className="mt-7 border-t border-[var(--ink-hairline)] pt-5">
      <Eyebrow className="mb-3">Price breakdown</Eyebrow>
      <dl className="flex flex-col gap-3">
        {lines.map((line) => (
          <div key={line.label} className="flex justify-between gap-4">
            <dt className="text-14 text-ink-soft">
              {line.label}
              {line.note ? (
                <span className="mt-0.5 block text-12 text-ink-faint">
                  {line.note}
                </span>
              ) : null}
            </dt>
            <dd className="u-num shrink-0 text-14">
              {line.amount < 0 ? "−" : ""}
              {formatINR(Math.abs(line.amount))}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-[var(--ink-hairline)] pt-4">
        <p className="u-label">Total</p>
        <p className="u-num font-display text-22 leading-none">
          {formatINR(total)}
        </p>
      </div>
      <p className="u-label mt-2 text-right text-ink-faint">
        Due today {formatINR(Math.round(total * 0.25))}
      </p>
    </div>
  );
}

export function PaxStepper({
  value,
  onChange,
  max,
  min = 1,
  label = "Travellers",
}: {
  value: number;
  onChange: (value: number) => void;
  max: number;
  min?: number;
  label?: string;
}) {
  return (
    <div className="flex items-stretch" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`One ${label.toLowerCase().replace(/s$/, "")} fewer`}
        className="min-h-12 w-12 shrink-0 rounded-l-[var(--radius-control)] border border-[var(--ink-hairline-strong)] text-18 disabled:opacity-40"
      >
        –
      </button>
      <p
        aria-live="polite"
        className="u-num flex min-h-12 flex-1 items-center justify-center border-y border-[var(--ink-hairline-strong)] text-16"
      >
        {value}
        <span className="u-sr-only"> {label}</span>
      </p>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`One more ${label.toLowerCase().replace(/s$/, "")}`}
        className="min-h-12 w-12 shrink-0 rounded-r-[var(--radius-control)] border border-[var(--ink-hairline-strong)] text-18 disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
