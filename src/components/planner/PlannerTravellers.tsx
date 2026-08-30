"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import {
  Field,
  TextInput,
  TextArea,
  SelectInput,
} from "@/components/primitives/Field";
import { partyDef, type PartyType } from "@/lib/party";

/**
 * Who, exactly, and how to reach you.
 *
 * The one decision worth defending here is what this form does **not** ask
 * for. It takes the lead traveller's name and contact and the head count, and
 * it stops. It does not ask eight people for the surname on their passport,
 * because at this point in the flow nothing has been quoted, nothing has been
 * agreed, and a form that demands a party's identity documents before it will
 * show them an itinerary is a form most parties abandon.
 *
 * Full legal names are collected at checkout, where they are actually needed
 * — permits, and the checkout copy already explains why a mismatch there gets
 * an application refused. Asking twice, once too early, would get the same
 * data less accurately.
 *
 * Companion names are offered and optional. Some people want to type them and
 * it costs nothing to let them; nobody is stopped for leaving them blank.
 *
 * Children's ages are asked because they change the plan rather than the
 * paperwork: a party with a child under twelve is priced differently and has
 * the high-altitude days withheld from its itinerary. A field that changes
 * nothing should not be on the form; this one changes two things.
 */

/**
 * Every field on this step overrides its own ground.
 *
 * `Field`'s controls are recessed rather than outlined — a filled `--shell`
 * shell with no border at rest — which is exactly right on the paper the rest
 * of the site's forms sit on, and invisible here, because the planner sits on
 * `--shell` itself. Lifting the fields to paper keeps the primitive's design
 * intact and inverts the relationship: on this section the input is the
 * *lighter* surface. The alternative was giving every control on the site a
 * resting border to survive one section, which is a worse trade.
 */
const ON_SHELL = "bg-paper";

export type TravellerDraft = {
  adults: number;
  children: number;
  /** One entry per child, as a string so an empty select is representable. */
  childAges: string[];
  lead: { name: string; email: string; phone: string };
  /** Optional names for everyone who is not the lead. */
  companions: string[];
  notes: string;
};

export function emptyTravellerDraft(party: PartyType): TravellerDraft {
  const def = partyDef(party);
  return {
    adults: def.defaultAdults,
    children: def.defaultChildren,
    childAges: Array.from({ length: def.defaultChildren }, () => ""),
    lead: { name: "", email: "", phone: "" },
    companions: [],
    notes: "",
  };
}

export function PlannerTravellers({
  value,
  onChange,
  errors,
}: {
  value: TravellerDraft;
  onChange: (next: TravellerDraft) => void;
  errors: Record<string, string>;
}) {
  const [namesOpen, setNamesOpen] = useState(false);
  const companionCount = Math.max(0, value.adults + value.children - 1);

  function set(patch: Partial<TravellerDraft>) {
    onChange({ ...value, ...patch });
  }

  function setChildren(next: number) {
    set({
      children: next,
      // Keep the ages array in step with the count rather than leaving a
      // stale age behind when a child is removed.
      childAges: Array.from(
        { length: next },
        (_, i) => value.childAges[i] ?? "",
      ),
    });
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
      <div className="flex min-w-0 flex-col gap-12">
        <fieldset>
          <legend className="text-22">How many of you</legend>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Stepper
              id="plan-adults"
              label="Adults"
              hint="Twelve and over"
              value={value.adults}
              min={1}
              max={16}
              onChange={(next) => set({ adults: next })}
            />
            <Stepper
              id="plan-children"
              label="Children"
              hint="Under twelve, sharing with an adult"
              value={value.children}
              min={0}
              max={8}
              onChange={setChildren}
            />
          </div>

          {value.children > 0 ? (
            <div className="mt-8">
              <p className="u-label text-ink-soft">
                How old will they be when you travel?
              </p>
              <p className="mt-2 max-w-prose text-14 text-ink-faint">
                It changes the itinerary, not the paperwork — we hold the high
                passes and the long climbs back for parties with young children,
                and price under-twelves lower.
              </p>
              <ul className="mt-4 flex flex-wrap gap-3">
                {value.childAges.map((age, index) => (
                  <li key={index}>
                    <label
                      htmlFor={`plan-child-${index}`}
                      className="u-label block text-ink-faint"
                    >
                      Child {index + 1}
                    </label>
                    <SelectInput
                      id={`plan-child-${index}`}
                      value={age}
                      onChange={(event) =>
                        set({
                          childAges: value.childAges.map((current, i) =>
                            i === index ? event.target.value : current,
                          ),
                        })
                      }
                      className={cn("mt-2 w-28", ON_SHELL)}
                    >
                      <option value="">Age</option>
                      {Array.from({ length: 18 }, (_, i) => (
                        <option key={i} value={String(i)}>
                          {i === 0 ? "Under 1" : i}
                        </option>
                      ))}
                    </SelectInput>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </fieldset>

        <fieldset>
          <legend className="text-22">Where to send it</legend>
          <p className="mt-2 max-w-prose text-14 text-ink-soft">
            The itinerary appears on the next screen either way. This is so we
            can pick the conversation up — and so you are not retyping it if you
            come back to us in a week.
          </p>

          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <Field
              id="plan-name"
              label="Your name"
              required
              error={errors["plan-name"]}
              className="sm:col-span-2"
            >
              <TextInput
                id="plan-name"
                className={ON_SHELL}
                autoComplete="name"
                value={value.lead.name}
                error={errors["plan-name"]}
                onChange={(event) =>
                  set({ lead: { ...value.lead, name: event.target.value } })
                }
              />
            </Field>

            {/* Both fields in this row carry a hint, and the second one is
                only half needed — but `Field` puts hints above the input, so
                a row where one field has one and the other does not sits its
                two inputs 30px out of line. */}
            <Field
              id="plan-email"
              label="Email"
              hint="Where the itinerary goes"
              required
              error={errors["plan-email"]}
            >
              <TextInput
                id="plan-email"
                className={ON_SHELL}
                hasHint
                type="email"
                inputMode="email"
                autoComplete="email"
                value={value.lead.email}
                error={errors["plan-email"]}
                onChange={(event) =>
                  set({ lead: { ...value.lead, email: event.target.value } })
                }
              />
            </Field>

            <Field
              id="plan-phone"
              label="Mobile"
              hint="With the country code if you are outside India"
              required
              error={errors["plan-phone"]}
            >
              <TextInput
                id="plan-phone"
                className={ON_SHELL}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                hasHint
                value={value.lead.phone}
                error={errors["plan-phone"]}
                onChange={(event) =>
                  set({ lead: { ...value.lead, phone: event.target.value } })
                }
              />
            </Field>
          </div>

          {companionCount > 0 ? (
            <div className="mt-8 border-t border-[var(--ink-hairline)] pt-6">
              <button
                type="button"
                onClick={() => setNamesOpen((open) => !open)}
                aria-expanded={namesOpen}
                aria-controls="plan-companions"
                className="u-label flex min-h-11 items-center gap-3 text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                {namesOpen ? "Hide" : "Add"} the other{" "}
                {companionCount === 1
                  ? "traveller"
                  : `${companionCount} travellers`}
                <span className="text-ink-faint no-underline">optional</span>
              </button>

              <div id="plan-companions" hidden={!namesOpen} className="mt-6">
                <p className="max-w-prose text-14 text-ink-faint">
                  Only useful to us as a rooming list at this stage. Full names
                  as they appear on identity documents are collected when you
                  book, because that is what the permits are raised against.
                </p>
                <ul className="mt-5 grid gap-5 sm:grid-cols-2">
                  {Array.from({ length: companionCount }, (_, index) => (
                    <li key={index}>
                      <Field
                        id={`plan-companion-${index}`}
                        label={`Traveller ${index + 2}`}
                      >
                        <TextInput
                          id={`plan-companion-${index}`}
                          className={ON_SHELL}
                          value={value.companions[index] ?? ""}
                          onChange={(event) => {
                            const next = Array.from(
                              { length: companionCount },
                              (_, i) => value.companions[i] ?? "",
                            );
                            next[index] = event.target.value;
                            set({ companions: next });
                          }}
                        />
                      </Field>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </fieldset>

        <Field
          id="plan-notes"
          label="Anything we should build around"
          hint="A festival you want to be there for, a birthday, a knee that does not do steps, food you cannot eat."
        >
          <TextArea
            id="plan-notes"
            className={ON_SHELL}
            hasHint
            value={value.notes}
            onChange={(event) => set({ notes: event.target.value })}
          />
        </Field>
      </div>

      <aside className="lg:pt-1">
        <div className="rounded-[var(--radius-panel)] border border-[var(--ink-hairline)] p-7">
          <p className="u-label text-ink-faint">Party</p>
          <p className="u-num mt-3 font-display text-48 leading-none">
            {value.adults + value.children}
          </p>
          <p className="mt-2 text-16 text-ink-soft">
            {value.adults} {value.adults === 1 ? "adult" : "adults"}
            {value.children > 0
              ? `, ${value.children} ${value.children === 1 ? "child" : "children"}`
              : ""}
          </p>
          {value.adults + value.children >= 4 ? (
            <p className="mt-5 border-t border-[var(--ink-hairline)] pt-5 text-14 text-ink-soft">
              A party this size clears our first group band, so the per-person
              rate on the next screen is already below the two-person price.
            </p>
          ) : null}
          {value.children > 0 ? (
            <p className="mt-5 border-t border-[var(--ink-hairline)] pt-5 text-14 text-ink-soft">
              Travelling with children changes the route as well as the price.
              The itinerary will say exactly what it held back.
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

/**
 * A number field that can be operated with a thumb.
 *
 * A `<select>` of 1–16 is faster to build and worse to use on a phone; two
 * 48px targets and a live figure between them is the pattern the homestay
 * night-count already uses on this site, so it is the one this uses too.
 */
function Stepper({
  id,
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="u-label block text-ink-soft">
        {label}
      </label>
      <p className="mt-2 text-14 text-ink-faint">{hint}</p>
      <div className="mt-3 flex items-stretch">
        <StepButton
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          label={`One fewer ${label.toLowerCase()}`}
          side="left"
        >
          –
        </StepButton>
        <output
          id={id}
          htmlFor={id}
          className="u-num flex min-h-12 flex-1 items-center justify-center border-y border-[var(--ink-hairline-strong)] text-18"
        >
          {value}
        </output>
        <StepButton
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          label={`One more ${label.toLowerCase()}`}
          side="right"
        >
          +
        </StepButton>
      </div>
    </div>
  );
}

function StepButton({
  children,
  onClick,
  disabled,
  label,
  side,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
  side: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "min-h-12 w-12 shrink-0 border border-[var(--ink-hairline-strong)] text-18",
        "transition-colors duration-[var(--dur-micro)] ease-brand",
        "hover:bg-[rgb(46_42_36/0.05)] disabled:opacity-40 disabled:hover:bg-transparent",
        side === "left"
          ? "rounded-l-[var(--radius-control)]"
          : "rounded-r-[var(--radius-control)]",
      )}
    >
      {children}
    </button>
  );
}
