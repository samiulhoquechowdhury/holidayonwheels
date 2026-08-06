"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";
import { addDays, formatMedium } from "@/lib/date";
import { Button } from "@/components/primitives/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { NightSelector } from "./AvailabilityCalendar";
import { PaxStepper } from "./BookingWidget";
import { StickyBookingBar } from "./StickyBookingBar";
import type { Homestay } from "@/content/types";

/**
 * Homestay booking. Same shape and same rules as `BookingWidget`, but the
 * unit is a room-night rather than a departure seat, so the room type is the
 * primary choice and the date is secondary.
 */
export function StayBookingWidget({
  stay,
  /** Today, passed from the server so the default date is stable. */
  today,
  className,
}: {
  stay: Homestay;
  today: string;
  className?: string;
}) {
  const router = useRouter();
  const [roomName, setRoomName] = useState(stay.rooms[0]?.name ?? "");
  const [checkIn, setCheckIn] = useState(addDays(today, 30));
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);

  const room = stay.rooms.find((r) => r.name === roomName) ?? stay.rooms[0];

  const quote = useMemo(() => {
    const roomTotal = room.perNight * nights;
    // Above the room's own capacity we add a per-head charge rather than
    // silently allowing an overbooking.
    const extraGuests = Math.max(0, guests - room.sleeps);
    const extraCharge = extraGuests * 900 * nights;
    return {
      roomTotal,
      extraGuests,
      extraCharge,
      total: roomTotal + extraCharge,
    };
  }, [room, nights, guests]);

  function goToCheckout() {
    const params = new URLSearchParams({
      kind: "stay",
      slug: stay.slug,
      date: checkIn,
      nights: String(nights),
      pax: String(guests),
      room: room.name,
    });
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <>
      <section
        aria-labelledby="stay-booking-heading"
        className={cn(
          "rounded-[var(--radius-media)] border border-[var(--ink-hairline)] bg-paper p-6 lg:p-7",
          className,
        )}
      >
        <h2 id="stay-booking-heading" className="u-sr-only">
          Book {stay.name}
        </h2>

        <div className="flex items-baseline justify-between gap-3">
          <Eyebrow>From</Eyebrow>
          <p className="font-mono text-28 tabular-nums">
            {formatINR(stay.fromPrice)}
          </p>
        </div>
        <p className="u-mono mt-1 text-right text-ink-soft">per night</p>

        <div className="mt-7">
          <Eyebrow className="mb-3">Room</Eyebrow>
          <fieldset>
            <legend className="u-sr-only">Choose a room</legend>
            <ul className="flex flex-col gap-2">
              {stay.rooms.map((option) => {
                const id = `room-${option.name.replace(/\s+/g, "-")}`;
                const isSelected = option.name === room.name;
                return (
                  <li key={option.name}>
                    <label
                      htmlFor={id}
                      className={cn(
                        "flex min-h-14 cursor-pointer items-center justify-between gap-3 border px-4 py-3",
                        "rounded-[var(--radius-control)] transition-colors duration-[var(--dur-micro)] ease-brand",
                        isSelected
                          ? "border-ink bg-[rgb(20_32_27/0.04)]"
                          : "border-[var(--ink-hairline)] hover:border-[var(--ink-hairline-strong)]",
                        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-deep-teal",
                      )}
                    >
                      <input
                        id={id}
                        type="radio"
                        name="room"
                        value={option.name}
                        checked={isSelected}
                        onChange={() => setRoomName(option.name)}
                        className="u-sr-only"
                      />
                      <span className="min-w-0">
                        <span className="block text-16">{option.name}</span>
                        <span className="u-mono mt-1 block text-ink-faint">
                          Sleeps {option.sleeps}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-16 tabular-nums">
                        {formatINR(option.perNight)}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        </div>

        <div className="mt-7">
          <Eyebrow className="mb-3">Dates</Eyebrow>
          <NightSelector
            checkIn={checkIn}
            nights={nights}
            onCheckInChange={setCheckIn}
            onNightsChange={setNights}
            minDate={today}
          />
        </div>

        <div className="mt-7">
          <Eyebrow className="mb-3">Guests</Eyebrow>
          <PaxStepper
            value={guests}
            onChange={setGuests}
            max={stay.maxGuests}
            label="Guests"
          />
          {quote.extraGuests > 0 ? (
            <p className="mt-2 text-14 text-ink-soft">
              {quote.extraGuests} more{" "}
              {quote.extraGuests === 1 ? "guest" : "guests"} than this room
              sleeps. An extra bed is charged at {formatINR(900)} per person per
              night, subject to your host confirming space.
            </p>
          ) : null}
        </div>

        <div className="mt-7 border-t border-[var(--ink-hairline)] pt-5">
          <Eyebrow className="mb-3">Price breakdown</Eyebrow>
          <dl className="flex flex-col gap-3">
            <div className="flex justify-between gap-4">
              <dt className="text-14 text-ink-soft">
                {formatINR(room.perNight)} × {nights}{" "}
                {nights === 1 ? "night" : "nights"}
              </dt>
              <dd className="shrink-0 font-mono text-14 tabular-nums">
                {formatINR(quote.roomTotal)}
              </dd>
            </div>
            {quote.extraCharge > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-14 text-ink-soft">
                  Extra bed × {quote.extraGuests}
                </dt>
                <dd className="shrink-0 font-mono text-14 tabular-nums">
                  {formatINR(quote.extraCharge)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-14 text-ink-soft">
                Meals — {MEAL_COPY[stay.mealsIncluded]}
              </dt>
              <dd className="shrink-0 font-mono text-14 text-deep-teal-ink">
                Included
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-[var(--ink-hairline)] pt-4">
            <p className="u-mono">Total</p>
            <p className="font-mono text-22 tabular-nums">
              {formatINR(quote.total)}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          block
          className="mt-6"
          onClick={goToCheckout}
        >
          Continue to booking
        </Button>

        <p className="mt-4 text-14 text-ink-soft">
          Free cancellation up to 14 days before check-in, less a 10%
          administration fee. Inside 14 days one night is retained.
        </p>
      </section>

      <StickyBookingBar
        label={`${formatMedium(checkIn)} · ${nights} ${nights === 1 ? "night" : "nights"}`}
        amount={quote.total}
        amountLabel="Total for your stay"
        ctaLabel="Book"
        onCta={goToCheckout}
        watchId="stay-booking-heading"
      />
    </>
  );
}

const MEAL_COPY = {
  breakfast: "breakfast",
  "half-board": "breakfast and dinner",
  "full-board": "all meals",
  none: "no meals",
} as const;
