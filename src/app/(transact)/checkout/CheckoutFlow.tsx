"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";
import { formatRange, formatLong } from "@/lib/date";
import { Button } from "@/components/primitives/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Chip } from "@/components/primitives/Chip";
import { Media } from "@/components/primitives/Media";
import {
  Field,
  FieldSet,
  TextInput,
  SelectInput,
} from "@/components/primitives/Field";
import { AddOnStep } from "@/components/booking/AddOnStep";
import { depositFor } from "@/lib/quote";
import type { Order } from "./order";

/**
 * Checkout: travellers → extras → payment → confirmation.
 *
 * Payment is mocked — there is no gateway in this phase. Everything else is
 * real: the validation, the running total, the deposit split and the
 * confirmation. When a gateway lands, only `payStep` changes.
 *
 * The steps are one component rather than four routes so the order cannot be
 * lost by a refresh mid-flow, and so the running total is always the same
 * object rather than four recalculations that might disagree.
 */

type Step = "travellers" | "extras" | "payment" | "done";

const STEPS: { id: Step; label: string }[] = [
  { id: "travellers", label: "Travellers" },
  { id: "extras", label: "Extras" },
  { id: "payment", label: "Payment" },
];

type TravellerDetails = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
};

export function CheckoutFlow({ order }: { order: Order }) {
  const [step, setStep] = useState<Step>("travellers");
  const [travellers, setTravellers] = useState<TravellerDetails[]>(() =>
    Array.from({ length: order.travellers }, (_, index) => ({
      id: `t${index}`,
      fullName: "",
      ...(index === 0 ? { email: "", phone: "" } : {}),
    })),
  );
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(
    // The free permit add-on is the one thing pre-selected, because on a
    // permit route it is not optional in any meaningful sense.
    order.addOns.filter((a) => a.kind === "permit").map((a) => a.id),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const addOnTotal = useMemo(
    () =>
      order.addOns
        .filter((a) => selectedAddOns.includes(a.id))
        .reduce(
          (sum, a) =>
            sum + (a.perTraveller ? a.price * order.travellers : a.price),
          0,
        ),
    [order, selectedAddOns],
  );

  const total = order.subtotal + addOnTotal;
  const dueToday = depositFor(total, order.kind);

  function goTo(next: Step) {
    setStep(next);
    // Announce the new step to a screen reader and put focus somewhere useful.
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }

  function validateTravellers(): boolean {
    const found: Record<string, string> = {};
    travellers.forEach((traveller, index) => {
      if (traveller.fullName.trim().split(" ").filter(Boolean).length < 2) {
        found[`${traveller.id}-name`] =
          "Full name including surname, exactly as on the identity document.";
      }
      if (index === 0) {
        if (!traveller.email?.includes("@"))
          found[`${traveller.id}-email`] =
            "We need an email for your confirmation.";
        if ((traveller.phone ?? "").replace(/\D/g, "").length < 10)
          found[`${traveller.id}-phone`] = "A ten-digit mobile number.";
      }
    });
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  // Focus the first invalid field. This must run *after* React has committed
  // the new `aria-invalid` attributes — querying the DOM inside the submit
  // handler runs before the re-render and finds nothing.
  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);

  function pay() {
    const serial = String(
      Math.abs(hash(order.slug + (travellers[0]?.email ?? ""))) % 1000000,
    )
      .toString()
      .padStart(6, "0");
    setReference(
      `HOW-${serial.slice(0, 2)}${order.kind.slice(0, 1).toUpperCase()}${serial.slice(2)}`,
    );
    goTo("done");
  }

  if (step === "done" && reference) {
    return (
      <Confirmation
        order={order}
        reference={reference}
        total={total}
        dueToday={dueToday}
        email={travellers[0]?.email ?? ""}
      />
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">
      <div className="min-w-0">
        <StepIndicator current={step} />

        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-10 text-36 outline-none"
        >
          {step === "travellers"
            ? "Who is travelling"
            : step === "extras"
              ? "Anything else"
              : "Payment"}
        </h2>

        {step === "travellers" ? (
          <div className="mt-10 flex flex-col gap-12">
            <p className="max-w-prose text-16 text-ink-soft">
              Names must match the identity documents you will travel with.
              {order.requiresILP
                ? " A mismatch is the single most common reason a permit application is refused, and we cannot fix it at the check-post."
                : ""}
            </p>

            {travellers.map((traveller, index) => (
              <FieldSet
                key={traveller.id}
                legend={
                  index === 0 ? "Lead traveller" : `Traveller ${index + 1}`
                }
                description={
                  index === 0
                    ? "Everything to do with this booking goes to this person."
                    : undefined
                }
              >
                <Field
                  id={`${traveller.id}-name`}
                  label="Full name"
                  required
                  error={errors[`${traveller.id}-name`]}
                  className={index === 0 ? "sm:col-span-2" : "sm:col-span-2"}
                >
                  <TextInput
                    id={`${traveller.id}-name`}
                    autoComplete={index === 0 ? "name" : "off"}
                    value={traveller.fullName}
                    error={errors[`${traveller.id}-name`]}
                    onChange={(event) =>
                      setTravellers((current) =>
                        current.map((t) =>
                          t.id === traveller.id
                            ? { ...t, fullName: event.target.value }
                            : t,
                        ),
                      )
                    }
                  />
                </Field>

                {index === 0 ? (
                  <>
                    <Field
                      id={`${traveller.id}-email`}
                      label="Email"
                      required
                      error={errors[`${traveller.id}-email`]}
                    >
                      <TextInput
                        id={`${traveller.id}-email`}
                        type="email"
                        autoComplete="email"
                        value={traveller.email ?? ""}
                        error={errors[`${traveller.id}-email`]}
                        onChange={(event) =>
                          setTravellers((current) =>
                            current.map((t) =>
                              t.id === traveller.id
                                ? { ...t, email: event.target.value }
                                : t,
                            ),
                          )
                        }
                      />
                    </Field>
                    <Field
                      id={`${traveller.id}-phone`}
                      label="Mobile"
                      required
                      error={errors[`${traveller.id}-phone`]}
                    >
                      <TextInput
                        id={`${traveller.id}-phone`}
                        type="tel"
                        autoComplete="tel"
                        value={traveller.phone ?? ""}
                        error={errors[`${traveller.id}-phone`]}
                        onChange={(event) =>
                          setTravellers((current) =>
                            current.map((t) =>
                              t.id === traveller.id
                                ? { ...t, phone: event.target.value }
                                : t,
                            ),
                          )
                        }
                      />
                    </Field>
                  </>
                ) : null}
              </FieldSet>
            ))}

            <div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  if (validateTravellers()) goTo("extras");
                }}
              >
                Continue to extras
              </Button>
            </div>
          </div>
        ) : null}

        {step === "extras" ? (
          <div className="mt-10">
            <p className="mb-8 max-w-prose text-16 text-ink-soft">
              Nothing here is pre-ticked except permit processing, which is free
              and which you need. Everything else is optional and priced before
              you add it.
            </p>

            <AddOnStep
              addOns={order.addOns}
              selected={selectedAddOns}
              onToggle={(id) =>
                setSelectedAddOns((current) =>
                  current.includes(id)
                    ? current.filter((v) => v !== id)
                    : [...current, id],
                )
              }
              travellers={order.travellers}
            />

            <div className="mt-12 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => goTo("travellers")}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => goTo("payment")}
              >
                Continue to payment
              </Button>
            </div>
          </div>
        ) : null}

        {step === "payment" ? (
          <PaymentStep
            dueToday={dueToday}
            total={total}
            isEvent={order.kind === "event"}
            onBack={() => goTo("extras")}
            onPay={pay}
          />
        ) : null}
      </div>

      <OrderSummary
        order={order}
        addOnTotal={addOnTotal}
        selectedAddOns={selectedAddOns}
        total={total}
        dueToday={dueToday}
      />
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Checkout progress">
      <ol className="flex flex-wrap gap-x-8 gap-y-2">
        {STEPS.map((s, index) => {
          const state =
            index < currentIndex
              ? "done"
              : index === currentIndex
                ? "current"
                : "todo";
          return (
            <li key={s.id} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full font-mono text-12",
                  state === "current"
                    ? "bg-ink text-paper"
                    : state === "done"
                      ? "bg-deep-teal text-paper"
                      : "border border-[var(--ink-hairline-strong)] text-ink-faint",
                )}
              >
                {state === "done" ? "✓" : index + 1}
              </span>
              <span
                className={cn(
                  "u-mono",
                  state === "todo" ? "text-ink-faint" : "text-ink",
                )}
                aria-current={state === "current" ? "step" : undefined}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function PaymentStep({
  dueToday,
  total,
  isEvent,
  onBack,
  onPay,
}: {
  dueToday: number;
  total: number;
  isEvent: boolean;
  onBack: () => void;
  onPay: () => void;
}) {
  const [method, setMethod] = useState("upi");

  return (
    <div className="mt-10">
      <div className="rounded-[var(--radius-control)] border border-[color-mix(in_srgb,var(--muga-gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--muga-gold)_8%,transparent)] p-5">
        <Eyebrow tone="gold">Demonstration only</Eyebrow>
        <p className="mt-3 text-16">
          No payment gateway is connected in this build. Submitting takes no
          money and charges no card — it produces the confirmation you would
          receive.
        </p>
      </div>

      <div className="mt-10">
        <Eyebrow className="mb-4">How you would like to pay</Eyebrow>
        <fieldset>
          <legend className="u-sr-only">Payment method</legend>
          <ul className="flex flex-col gap-2">
            {[
              { id: "upi", label: "UPI", note: "Instant, no fee" },
              {
                id: "card",
                label: "Credit or debit card",
                note: "Visa, Mastercard, RuPay",
              },
              {
                id: "netbanking",
                label: "Net banking",
                note: "All major Indian banks",
              },
              {
                id: "transfer",
                label: "International transfer",
                note: "Allow three working days",
              },
            ].map((option) => (
              <li key={option.id}>
                <label
                  htmlFor={`pay-${option.id}`}
                  className={cn(
                    "flex min-h-14 cursor-pointer items-center justify-between gap-3 border px-4 py-3",
                    "rounded-[var(--radius-control)] transition-colors duration-[var(--dur-micro)]",
                    method === option.id
                      ? "border-ink bg-[rgb(20_32_27/0.04)]"
                      : "border-[var(--ink-hairline)] hover:border-[var(--ink-hairline-strong)]",
                    "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-deep-teal",
                  )}
                >
                  <input
                    id={`pay-${option.id}`}
                    type="radio"
                    name="payment"
                    value={option.id}
                    checked={method === option.id}
                    onChange={() => setMethod(option.id)}
                    className="u-sr-only"
                  />
                  <span>
                    <span className="block text-16">{option.label}</span>
                    <span className="u-mono mt-1 block text-ink-faint">
                      {option.note}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      </div>

      <div className="mt-10">
        <FieldSet legend="Billing address">
          <Field
            id="bill-line1"
            label="Address"
            required
            className="sm:col-span-2"
          >
            <TextInput id="bill-line1" autoComplete="address-line1" />
          </Field>
          <Field id="bill-city" label="City" required>
            <TextInput id="bill-city" autoComplete="address-level2" />
          </Field>
          <Field id="bill-pin" label="PIN or postcode" required>
            <TextInput
              id="bill-pin"
              autoComplete="postal-code"
              className="font-mono"
            />
          </Field>
          <Field
            id="bill-country"
            label="Country"
            required
            className="sm:col-span-2"
          >
            <SelectInput id="bill-country" defaultValue="IN">
              <option value="IN">India</option>
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
              <option value="other">Somewhere else</option>
            </SelectInput>
          </Field>
        </FieldSet>
      </div>

      <div className="mt-12 border-t border-[var(--ink-hairline)] pt-8">
        <p className="mb-6 max-w-prose text-16">
          {isEvent
            ? `You will be charged ${formatINR(dueToday)} in full. Event tickets are non-refundable once issued.`
            : `You will be charged a 25% deposit of ${formatINR(dueToday)} today. The remaining ${formatINR(total - dueToday)} is due 60 days before departure.`}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button variant="primary" size="lg" onClick={onPay}>
            Pay {formatINR(dueToday)}
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({
  order,
  addOnTotal,
  selectedAddOns,
  total,
  dueToday,
}: {
  order: Order;
  addOnTotal: number;
  selectedAddOns: string[];
  total: number;
  dueToday: number;
}) {
  const chosen = order.addOns.filter((a) => selectedAddOns.includes(a.id));

  return (
    <aside aria-label="Order summary" className="order-first lg:order-none">
      <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
        <div className="overflow-hidden rounded-[var(--radius-media)] border border-[var(--ink-hairline)] bg-paper">
          <Media
            alt={order.heroAlt}
            seed={order.slug}
            region={order.region}
            aspect="16/9"
            sizes="400px"
          />
          <div className="p-6">
            <Eyebrow>{formatRange(order.startDate, order.endDate)}</Eyebrow>
            <h2 className="mt-3 text-22">{order.title}</h2>
            {order.variant ? (
              <p className="mt-2 text-14 text-ink-soft">{order.variant}</p>
            ) : null}

            <ul className="mt-4 flex flex-wrap gap-1.5">
              <li>
                <Chip>
                  {order.travellers}{" "}
                  {order.travellers === 1 ? "traveller" : "travellers"}
                </Chip>
              </li>
              {order.requiresILP ? (
                <li>
                  <Chip tone="teal">Permit included</Chip>
                </li>
              ) : null}
            </ul>

            <dl className="mt-6 flex flex-col gap-3 border-t border-[var(--ink-hairline)] pt-5">
              {order.lines.map((line) => (
                <div key={line.label} className="flex justify-between gap-4">
                  <dt className="text-14 text-ink-soft">{line.label}</dt>
                  <dd className="shrink-0 font-mono text-14 tabular-nums">
                    {line.amount < 0 ? "−" : ""}
                    {formatINR(Math.abs(line.amount))}
                  </dd>
                </div>
              ))}

              {chosen.map((addOn) => (
                <div key={addOn.id} className="flex justify-between gap-4">
                  <dt className="text-14 text-ink-soft">{addOn.title}</dt>
                  <dd className="shrink-0 font-mono text-14 tabular-nums">
                    {addOn.price === 0
                      ? "Included"
                      : formatINR(
                          addOn.perTraveller
                            ? addOn.price * order.travellers
                            : addOn.price,
                        )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-[var(--ink-hairline)] pt-5">
              <p className="u-mono">Total</p>
              <p className="font-mono text-22 tabular-nums">
                {formatINR(total)}
              </p>
            </div>
            <p className="u-mono mt-2 text-right text-ink-faint">
              Due today {formatINR(dueToday)}
            </p>

            {addOnTotal > 0 ? (
              <p className="u-mono mt-1 text-right text-deep-teal-ink">
                Extras {formatINR(addOnTotal)}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}

function Confirmation({
  order,
  reference,
  total,
  dueToday,
  email,
}: {
  order: Order;
  reference: string;
  total: number;
  dueToday: number;
  email: string;
}) {
  return (
    <div className="max-w-2xl">
      <Chip tone="teal">Booking confirmed</Chip>
      <h2 className="mt-6 text-48">You are going.</h2>
      <p className="mt-6 text-18 text-ink-soft">
        {order.title}, departing {formatLong(order.startDate)}. A confirmation
        is on its way to {email || "your email"}, and everything lives under My
        bookings from now on.
      </p>

      <dl className="mt-12 grid gap-6 border-y border-[var(--ink-hairline)] py-8 sm:grid-cols-2">
        <div>
          <dt className="u-mono text-ink-soft">Reference</dt>
          <dd className="mt-2 font-mono text-18">{reference}</dd>
        </div>
        <div>
          <dt className="u-mono text-ink-soft">Dates</dt>
          <dd className="mt-2 text-18">
            {formatRange(order.startDate, order.endDate)}
          </dd>
        </div>
        <div>
          <dt className="u-mono text-ink-soft">Paid today</dt>
          <dd className="mt-2 font-mono text-18">{formatINR(dueToday)}</dd>
        </div>
        <div>
          <dt className="u-mono text-ink-soft">Balance</dt>
          <dd className="mt-2 font-mono text-18">
            {formatINR(total - dueToday)}
            {total - dueToday > 0 ? (
              <span className="u-mono ml-2 text-ink-faint">
                due 60 days before
              </span>
            ) : null}
          </dd>
        </div>
      </dl>

      {order.requiresILP ? (
        <div className="mt-10 rounded-[var(--radius-control)] border border-[color-mix(in_srgb,var(--deep-teal)_35%,transparent)] bg-[color-mix(in_srgb,var(--deep-teal)_6%,transparent)] p-6">
          <Eyebrow tone="teal">What happens next</Eyebrow>
          <p className="mt-3 text-16">
            Your Inner Line Permit application goes to the state portal today.
            Expect a decision in three to seven working days — you will get an
            email, and it will appear under{" "}
            <Link
              href="/account/permits"
              className="text-deep-teal-ink underline underline-offset-4"
            >
              My permits
            </Link>
            .
          </p>
        </div>
      ) : null}

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/account/bookings"
          className="inline-flex min-h-12 items-center rounded-[var(--radius-control)] bg-muga-gold px-6 text-16 font-medium text-muga-gold-on"
        >
          Go to my bookings
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-[var(--radius-control)] border border-[var(--ink-hairline-strong)] px-6 text-16"
        >
          Back to the start
        </Link>
      </div>
    </div>
  );
}

/** Deterministic reference stand-in, replaced by the API's own id. */
function hash(input: string): number {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) {
    value = (value * 31 + input.charCodeAt(i)) | 0;
  }
  return value;
}
