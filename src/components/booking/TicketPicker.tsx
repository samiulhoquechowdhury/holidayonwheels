"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";
import { formatRange } from "@/lib/date";
import { Button } from "@/components/primitives/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { PaxStepper } from "./BookingWidget";
import { StickyBookingBar } from "./StickyBookingBar";
import type { NEEvent } from "@/content/types";

/**
 * Event ticket selection. One tier at a time with a quantity, rather than a
 * cart — every event we sell is a single decision, and a cart would invite
 * people to build orders we cannot actually fulfil across tiers.
 */
export function TicketPicker({
  event,
  className,
}: {
  event: NEEvent;
  className?: string;
}) {
  const router = useRouter();
  const [tierName, setTierName] = useState(event.tickets[0]?.name ?? "");
  const [quantity, setQuantity] = useState(2);

  const tier =
    event.tickets.find((t) => t.name === tierName) ?? event.tickets[0];
  const maxQuantity = Math.min(10, tier.remaining ?? 10);
  const total = useMemo(() => tier.price * quantity, [tier, quantity]);
  const free = tier.price === 0;

  function goToCheckout() {
    const params = new URLSearchParams({
      kind: "event",
      slug: event.slug,
      tier: tier.name,
      pax: String(quantity),
      date: event.startDate,
    });
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <>
      <section
        aria-labelledby="ticket-heading"
        className={cn(
          "rounded-[var(--radius-media)] border border-[var(--ink-hairline)] bg-paper p-6 lg:p-7",
          className,
        )}
      >
        <h2 id="ticket-heading" className="u-sr-only">
          Tickets for {event.name}
        </h2>

        <Eyebrow>{formatRange(event.startDate, event.endDate)}</Eyebrow>
        <p className="mt-2 text-18">{event.venue}</p>

        <div className="mt-7">
          <Eyebrow className="mb-3">Ticket type</Eyebrow>
          <fieldset>
            <legend className="u-sr-only">Choose a ticket tier</legend>
            <ul className="flex flex-col gap-2">
              {event.tickets.map((option) => {
                const id = `tier-${option.name.replace(/\s+/g, "-")}`;
                const isSelected = option.name === tier.name;
                const soldOut = option.remaining === 0;

                return (
                  <li key={option.name}>
                    <label
                      htmlFor={id}
                      className={cn(
                        "flex cursor-pointer flex-col gap-2 border px-4 py-4",
                        "rounded-[var(--radius-control)] transition-colors duration-[var(--dur-micro)] ease-brand",
                        soldOut && "cursor-not-allowed opacity-50",
                        isSelected
                          ? "border-ink bg-[rgb(20_32_27/0.04)]"
                          : "border-[var(--ink-hairline)] hover:border-[var(--ink-hairline-strong)]",
                        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-deep-teal",
                      )}
                    >
                      <input
                        id={id}
                        type="radio"
                        name="tier"
                        value={option.name}
                        checked={isSelected}
                        disabled={soldOut}
                        onChange={() => {
                          setTierName(option.name);
                          setQuantity((q) =>
                            Math.min(q, option.remaining ?? 10),
                          );
                        }}
                        className="u-sr-only"
                      />
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-16">{option.name}</span>
                        <span className="shrink-0 font-mono text-16 tabular-nums">
                          {option.price === 0
                            ? "Free"
                            : formatINR(option.price)}
                        </span>
                      </span>
                      <span className="text-14 text-ink-soft">
                        {option.description}
                      </span>
                      {option.remaining !== null ? (
                        <span
                          className={cn(
                            "u-mono",
                            option.remaining <= 50
                              ? "text-naga-red-ink"
                              : "text-ink-faint",
                          )}
                        >
                          {option.remaining === 0
                            ? "Sold out"
                            : `${option.remaining} remaining`}
                        </span>
                      ) : null}
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        </div>

        {tier.perks.length > 0 ? (
          <div className="mt-7">
            <Eyebrow className="mb-3">This ticket includes</Eyebrow>
            <ul className="flex flex-col gap-2">
              {tier.perks.map((perk) => (
                <li key={perk} className="flex gap-3 text-14 text-ink-soft">
                  <span aria-hidden="true" className="text-deep-teal">
                    —
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-7">
          <Eyebrow className="mb-3">How many</Eyebrow>
          <PaxStepper
            value={quantity}
            onChange={setQuantity}
            max={maxQuantity}
            label="Tickets"
          />
        </div>

        <div className="mt-7 flex items-baseline justify-between gap-4 border-t border-[var(--ink-hairline)] pt-5">
          <p className="u-mono">Total</p>
          <p className="font-mono text-22 tabular-nums">
            {free ? "Free" : formatINR(total)}
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          block
          className="mt-6"
          disabled={tier.remaining === 0}
          onClick={goToCheckout}
        >
          {free ? "Register attendance" : "Continue to booking"}
        </Button>

        <p className="mt-4 text-14 text-ink-soft">
          Event tickets are non-refundable once issued, because the organisers
          do not refund us.
        </p>
      </section>

      <StickyBookingBar
        label={`${quantity} × ${tier.name}`}
        amount={total}
        amountLabel="Total for your tickets"
        ctaLabel={free ? "Register" : "Book"}
        onCta={goToCheckout}
        disabled={tier.remaining === 0}
        watchId="ticket-heading"
      />
    </>
  );
}
