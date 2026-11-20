"use client";

import { useMemo, useRef, useState } from "react";
import { Reveal } from "@/components/layout/Reveal";
import { MotoCard } from "@/components/cards/ResultCard";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Chip } from "@/components/primitives/Chip";
import { LuxeButton } from "@/components/primitives/LuxeButton";
import { Button } from "@/components/primitives/Button";
import { Price } from "@/components/currency/Price";
import { Field, TextInput, TextArea } from "@/components/primitives/Field";
import { cn } from "@/lib/cn";
import { formatMedium, addDays } from "@/lib/date";
import { submitExpeditionBooking } from "@/app/(browse)/motorcycle-tours/booking-actions";
import type { MotorcycleTour } from "@/content/types";

/**
 * Choosing an expedition, and booking it.
 *
 * ## One page, four steps, no new routes
 *
 * Pick an expedition, pick a departure, say how many are coming, read the
 * itinerary those dates produce, then send it. The same shape as the trip
 * planner on `/destinations`, and deliberately so — a visitor who has used
 * one already knows this one, and the site does not need two ideas of what
 * "book something" looks like.
 *
 * It replaces the grid in place rather than navigating. A guided expedition
 * is a considered purchase and people compare two or three before choosing;
 * sending them to a detail page and back loses the comparison every time.
 * `Change expedition` returns to the grid with the choice intact.
 *
 * ## The dates are departures, not a free calendar
 *
 * A "pick your dates" calendar would be a lie here. These run as fixed
 * group departures with a lead rider, a sweep rider and a support truck —
 * the date is the product. `AvailabilityCalendar` shows the real departures
 * with their real seat counts, so the rider picks from what exists instead
 * of asking for a week that was never going to run.
 *
 * The duration follows from the departure rather than being chosen, which is
 * why there is no length control: a five-day expedition is five days.
 *
 * ## The itinerary is dated, not generic
 *
 * Step three maps the tour's own day-by-day onto the chosen departure, so
 * "Day 3 — Dirang to Tawang" also says which Tuesday that is. The content is
 * the expedition's real itinerary from `content/motorcycle-tours.ts`; nothing
 * here invents a day.
 *
 * ## Where "confirm" goes
 *
 * To `enquiries`, which the office reads — not to `/checkout`, which does
 * not exist in this app. See `booking-actions.ts`.
 */

type Step = "pick" | "dates" | "riders" | "itinerary" | "confirm";

const STEPS: { id: Step; label: string }[] = [
  { id: "pick", label: "Expedition" },
  { id: "dates", label: "Departure" },
  { id: "riders", label: "Riders" },
  { id: "itinerary", label: "Itinerary" },
  { id: "confirm", label: "Confirm" },
];

export function MotoBooking({ tours }: { tours: MotorcycleTour[] }) {
  const [step, setStep] = useState<Step>("pick");
  const [slug, setSlug] = useState<string>();
  const [date, setDate] = useState<string>();
  const [riders, setRiders] = useState(1);
  const [pillions, setPillions] = useState(0);
  const [lead, setLead] = useState({ name: "", email: "", phone: "" });
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState<"unconfigured" | "failed" | null>(null);

  /* Focus target when the step changes, so a keyboard user is not left at
     the top of a page whose middle just changed. */
  const headingRef = useRef<HTMLHeadingElement>(null);

  const tour = tours.find((t) => t.slug === slug);
  const departure = tour?.departures.find((d) => d.date === date);

  const total = useMemo(() => {
    if (!tour || !departure) return 0;
    return departure.perPerson * riders + tour.pillionPrice * pillions;
  }, [tour, departure, riders, pillions]);

  /** The tour's own itinerary, with the chosen departure's dates on it. */
  const dated = useMemo(() => {
    if (!tour || !departure) return [];
    return tour.itinerary.map((day) => ({
      ...day,
      date: addDays(departure.date, day.day - 1),
    }));
  }, [tour, departure]);

  function go(next: Step) {
    setStep(next);
    /* After paint, or the heading we want has not rendered yet. */
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  async function submit() {
    const found: Record<string, string> = {};
    if (lead.name.trim().length < 2) found.name = "Tell us what to call you.";
    if (!lead.email.includes("@"))
      found.email = "We need an email to reply to.";
    if (lead.phone.trim().length < 5)
      found.phone = "A number we can reach you on.";
    setErrors(found);
    setFailed(null);
    if (Object.keys(found).length > 0 || !tour || !departure) return;

    setSending(true);
    const result = await submitExpeditionBooking({
      ...lead,
      expedition: tour.title,
      departure: formatMedium(departure.date),
      returns: formatMedium(departure.endDate),
      riders,
      pillions,
      days: tour.days,
      total,
      notes,
    }).catch(() => ({ ok: false, reason: "failed" }) as const);
    setSending(false);

    if (result.ok) {
      setSent(true);
      return;
    }
    if (result.reason === "invalid") {
      setErrors(result.errors);
      return;
    }
    setFailed(result.reason);
  }

  /* ---- Sent ------------------------------------------------------- */
  if (sent && tour && departure) {
    return (
      <div className="max-w-xl">
        <Chip tone="sage">Request sent</Chip>
        <h2 className="mt-6 text-36">We have it.</h2>
        <p className="mt-5 text-18 text-ink-soft">
          {tour.title}, leaving {formatMedium(departure.date)}, for {riders}{" "}
          {riders === 1 ? "rider" : "riders"}
          {pillions > 0 ? ` and ${pillions} pillion` : ""}. We will confirm
          seats and bike allocation in writing, usually the same day.
        </p>
        <p className="mt-4 text-16 text-ink-soft">
          Nothing is payable yet, and nothing is held until we have written
          back.
        </p>
      </div>
    );
  }

  const index = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="min-w-0">
      {/* ---- The rail ------------------------------------------------ */}
      {step !== "pick" ? (
        <ol className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2">
          {STEPS.map((s, i) => {
            const done = i < index;
            const here = i === index;
            return (
              <li key={s.id} className="flex items-center gap-3">
                {i > 0 ? (
                  <span aria-hidden="true" className="text-ink-faint">
                    ·
                  </span>
                ) : null}
                <button
                  type="button"
                  /* Only backwards. Jumping ahead to a step whose inputs
                     are not set yet produces an empty screen. */
                  disabled={!done}
                  onClick={() => done && go(s.id)}
                  aria-current={here ? "step" : undefined}
                  className={cn(
                    "u-label transition-colors",
                    here
                      ? "text-ink"
                      : done
                        ? "text-ink-faint underline underline-offset-4 hover:text-ink"
                        : "text-ink-faint/60",
                  )}
                >
                  {s.label}
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}

      {/* ---- 1. Pick ------------------------------------------------- */}
      {step === "pick" ? (
        <>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-28 outline-none lg:text-36"
          >
            Choose an expedition
          </h2>
          <p className="mt-4 max-w-xl text-16 text-ink-soft">
            {tours.length} routes, each on fixed departures with a support
            vehicle. Pick one and the next step shows when it runs.
          </p>
          <ul className="mt-10 grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
            {tours.map((t, i) => (
              <li key={t.slug}>
                <Reveal delay={Math.min(i, 5) * 0.04}>
                  {/*
                    The card stays a real link to its detail page and the
                    click is intercepted here. `ResultCard` requires an
                    `href` and is shared by five card types; adding a button
                    mode to it for one caller would reshape all of them.

                    The listener sits on the wrapper and the event bubbles
                    from the anchor, so pressing Enter on the focused link
                    is caught too — a keyboard user gets the booking flow,
                    not the detail page. `preventDefault` is what stops the
                    navigation; without it both happen.

                    Middle-click and ⌘-click still open the detail page in a
                    tab, which is the right escape hatch for somebody who
                    wants to read the route before booking it.
                  */}
                  <div
                    /*
                      `onClickCapture`, not `onClick`.

                      Next's `<Link>` handles the click on the anchor itself
                      and calls `router.push` from its own handler. In the
                      bubble phase ours runs *after* that, so navigation had
                      already started and `preventDefault` came too late —
                      clicking a card went to the detail page instead of
                      opening the flow. Capture runs parent-first, so this
                      fires before the anchor's handler and
                      `stopPropagation` stops it running at all.
                    */
                    onClickCapture={(event) => {
                      if (
                        event.metaKey ||
                        event.ctrlKey ||
                        event.button !== 0
                      ) {
                        return;
                      }
                      event.stopPropagation();
                      event.preventDefault();
                      setSlug(t.slug);
                      setDate(undefined);
                      setRiders(1);
                      setPillions(0);
                      go("dates");
                    }}
                  >
                    <MotoCard
                      tour={t}
                      priority={i < 3}
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px"
                    />
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {/* ---- 2. Dates ------------------------------------------------ */}
      {step === "dates" && tour ? (
        <>
          <Eyebrow rule>{tour.title}</Eyebrow>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-6 text-28 outline-none lg:text-36"
          >
            When would you like to ride?
          </h2>
          <p className="mt-4 max-w-xl text-16 text-ink-soft">
            {tour.days} days, {tour.nights} nights, {tour.distanceKm} km. These
            run as fixed group departures, so the dates below are the ones that
            exist — the length is not something to choose.
          </p>

          <AvailabilityCalendar
            departures={tour.departures}
            selected={date}
            onSelect={setDate}
            name={`departure-${tour.slug}`}
            className="mt-8"
          />

          <Actions
            onBack={() => go("pick")}
            backLabel="Change expedition"
            onNext={() => go("riders")}
            nextLabel="Continue"
            disabled={!departure}
            hint={departure ? undefined : "Pick a departure to carry on"}
          />
        </>
      ) : null}

      {/* ---- 3. Riders ----------------------------------------------- */}
      {step === "riders" && tour && departure ? (
        <>
          <Eyebrow rule>
            {tour.title} · {formatMedium(departure.date)}
          </Eyebrow>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-6 text-28 outline-none lg:text-36"
          >
            How many of you?
          </h2>
          <p className="mt-4 max-w-xl text-16 text-ink-soft">
            {departure.seatsLeft} of {tour.groupSizeMax} places left on this
            departure. A pillion rides behind someone rather than taking a bike
            of their own, which is why the rate differs.
          </p>

          <div className="mt-8 grid max-w-xl gap-5 sm:grid-cols-2">
            <Counter
              label="Riders"
              hint="one bike each"
              value={riders}
              min={1}
              max={departure.seatsLeft}
              onChange={setRiders}
            />
            <Counter
              label="Pillions"
              hint="riding behind"
              value={pillions}
              min={0}
              max={Math.max(0, departure.seatsLeft - riders)}
              onChange={setPillions}
            />
          </div>

          <p className="mt-8 flex flex-wrap items-baseline gap-x-4 border-t border-[var(--ink-hairline)] pt-6">
            <span className="u-label text-ink-faint">Total</span>
            <span className="u-num font-display text-28">
              <Price rupees={total} />
            </span>
          </p>

          <Actions
            onBack={() => go("dates")}
            backLabel="Change dates"
            onNext={() => go("itinerary")}
            nextLabel="See the itinerary"
          />
        </>
      ) : null}

      {/* ---- 4. Itinerary -------------------------------------------- */}
      {step === "itinerary" && tour && departure ? (
        <>
          <Eyebrow rule>
            {formatMedium(departure.date)} – {formatMedium(departure.endDate)}
          </Eyebrow>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-6 text-28 outline-none lg:text-36"
          >
            Your {tour.days} days
          </h2>
          <p className="mt-4 max-w-xl text-16 text-ink-soft">
            This is {tour.title} on the dates you picked. The route is fixed —
            it is a group expedition — but the days below are the real ones.
          </p>

          <ol className="mt-10 flex flex-col gap-3">
            {dated.map((day) => (
              <li
                key={day.day}
                className="rounded-[var(--radius-card)] border border-[var(--ink-hairline)] bg-paper p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
                  <h3 className="text-18">
                    <span className="u-num text-ink-faint">Day {day.day}</span>{" "}
                    · {day.title}
                  </h3>
                  <p className="u-num u-label text-ink-faint">
                    {formatMedium(day.date)}
                  </p>
                </div>
                <p className="mt-3 max-w-prose text-16 text-ink-soft">
                  {day.summary}
                </p>
                <p className="u-label mt-3 flex flex-wrap gap-x-4 gap-y-1 text-ink-faint">
                  {day.distanceKm ? <span>{day.distanceKm} km</span> : null}
                  {day.altitude ? <span>{day.altitude} m</span> : null}
                  <span>
                    {day.stay ? `Night: ${day.stay}` : "You fly home"}
                  </span>
                </p>
              </li>
            ))}
          </ol>

          <Actions
            onBack={() => go("riders")}
            backLabel="Change riders"
            onNext={() => go("confirm")}
            nextLabel="Book this"
          />
        </>
      ) : null}

      {/* ---- 5. Confirm ---------------------------------------------- */}
      {step === "confirm" && tour && departure ? (
        <>
          <Eyebrow rule>Confirm</Eyebrow>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mt-6 text-28 outline-none lg:text-36"
          >
            Where do we write back?
          </h2>

          <div className="mt-8 max-w-xl rounded-[var(--radius-card)] bg-shell p-6">
            <p className="text-18">{tour.title}</p>
            <p className="u-label mt-2 text-ink-faint">
              {formatMedium(departure.date)} – {formatMedium(departure.endDate)}{" "}
              · {tour.days} days · {riders} {riders === 1 ? "rider" : "riders"}
              {pillions > 0 ? `, ${pillions} pillion` : ""}
            </p>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-3 border-t border-[var(--ink-hairline)] pt-4">
              <span className="u-label text-ink-faint">Total</span>
              <span className="u-num font-display text-22">
                <Price rupees={total} />
              </span>
            </p>
          </div>

          <div className="mt-8 flex max-w-xl flex-col gap-5">
            <Field id="moto-name" label="Name" required error={errors.name}>
              <TextInput
                id="moto-name"
                autoComplete="name"
                value={lead.name}
                error={errors.name}
                onChange={(e) => setLead({ ...lead, name: e.target.value })}
              />
            </Field>
            <Field id="moto-email" label="Email" required error={errors.email}>
              <TextInput
                id="moto-email"
                type="email"
                autoComplete="email"
                value={lead.email}
                error={errors.email}
                onChange={(e) => setLead({ ...lead, email: e.target.value })}
              />
            </Field>
            <Field id="moto-phone" label="Mobile" required error={errors.phone}>
              <TextInput
                id="moto-phone"
                type="tel"
                autoComplete="tel"
                value={lead.phone}
                error={errors.phone}
                onChange={(e) => setLead({ ...lead, phone: e.target.value })}
              />
            </Field>
            <Field
              id="moto-notes"
              label="Anything we should know"
              hint="Riding experience, bike preference, who you are travelling with."
            >
              <TextArea
                id="moto-notes"
                hasHint
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>
          </div>

          {failed ? (
            <p
              role="alert"
              className="mt-6 max-w-xl rounded-[var(--radius-input)] border border-ember px-4 py-3 text-16 text-ember-ink"
            >
              That did not send, and your request has not reached us. Nothing on
              this page is lost — try again in a moment, or call us.
            </p>
          ) : null}

          <Actions
            onBack={() => go("itinerary")}
            backLabel="Back to the itinerary"
            onNext={submit}
            nextLabel={sending ? "Sending…" : "Send booking request"}
            disabled={sending}
            hint="Nothing is payable now. We confirm seats in writing first."
          />
        </>
      ) : null}
    </div>
  );
}

/** The back/next pair every step after the first shares. */
function Actions({
  onBack,
  backLabel,
  onNext,
  nextLabel,
  disabled,
  hint,
}: {
  onBack: () => void;
  backLabel: string;
  onNext: () => void;
  nextLabel: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="mt-10 flex flex-col gap-4 border-t border-[var(--ink-hairline)] pt-7 sm:flex-row sm:items-center sm:justify-between">
      <Button type="button" variant="ghost" onClick={onBack}>
        {backLabel}
      </Button>
      <span className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-5">
        {hint ? <span className="u-label text-ink-faint">{hint}</span> : null}
        <LuxeButton variant="clay" onClick={onNext} disabled={disabled}>
          {nextLabel}
        </LuxeButton>
      </span>
    </div>
  );
}

/** A stepper, because a number input for "how many riders" invites 40. */
function Counter({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const id = `count-${label.toLowerCase()}`;
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--ink-hairline)] p-5">
      <p className="u-label text-ink-faint" id={`${id}-label`}>
        {label}
      </p>
      <p className="u-label mt-1 text-ink-faint/80">{hint}</p>
      <div className="mt-4 flex items-center gap-4">
        <StepButton
          sign="−"
          label={`One fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        />
        <output
          aria-labelledby={`${id}-label`}
          className="u-num min-w-8 text-center font-display text-22"
        >
          {value}
        </output>
        <StepButton
          sign="+"
          label={`One more ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        />
      </div>
    </div>
  );
}

function StepButton({
  sign,
  label,
  disabled,
  onClick,
}: {
  sign: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "grid size-11 place-items-center rounded-full border text-18",
        "border-[var(--ink-hairline-strong)] text-ink transition-colors",
        "hover:border-ink disabled:opacity-35 disabled:hover:border-[var(--ink-hairline-strong)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
      )}
    >
      <span aria-hidden="true">{sign}</span>
    </button>
  );
}
