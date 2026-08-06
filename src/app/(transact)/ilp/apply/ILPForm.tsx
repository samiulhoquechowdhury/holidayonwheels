"use client";

import { useEffect, useState } from "react";
import {
  Field,
  FieldSet,
  TextInput,
  SelectInput,
  TextArea,
} from "@/components/primitives/Field";
import { Button } from "@/components/primitives/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Chip } from "@/components/primitives/Chip";
import { getILPStates } from "@/content/destinations";
import { addDays, formatLong } from "@/lib/date";
import type { Destination } from "@/content/types";

/**
 * Inner Line Permit application.
 *
 * No backend exists yet, so submitting validates, holds the application in
 * component state and shows the reference the traveller would receive. The
 * validation rules are the real ones — particularly the name rule, which is
 * what actually causes refusals — so that when the API lands the only change
 * is where `submit` sends the payload.
 */

type Traveller = {
  id: string;
  fullName: string;
  dob: string;
  nationality: "indian" | "foreign";
  idType: "aadhaar" | "voter" | "passport" | "driving";
  idNumber: string;
};

const ID_LABEL: Record<Traveller["idType"], string> = {
  aadhaar: "Aadhaar",
  voter: "Voter ID",
  passport: "Passport",
  driving: "Driving licence",
};

function emptyTraveller(index: number): Traveller {
  return {
    id: `t${index}`,
    fullName: "",
    dob: "",
    nationality: "indian",
    idType: "aadhaar",
    idNumber: "",
  };
}

export function ILPForm({ today }: { today: string }) {
  const states = getILPStates();

  const [state, setState] = useState<string>(states[0]?.slug ?? "");
  const [from, setFrom] = useState(addDays(today, 45));
  const [to, setTo] = useState(addDays(today, 52));
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [travellers, setTravellers] = useState<Traveller[]>([
    emptyTraveller(0),
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<string | null>(null);

  const selected = states.find((s) => s.slug === state);

  function update(id: string, patch: Partial<Traveller>) {
    setTravellers((current) =>
      current.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};

    if (!email.includes("@"))
      next.email = "We need an email to send the permit to.";
    if (phone.replace(/\D/g, "").length < 10)
      next.phone =
        "A ten-digit mobile number, so the check-post can reach you.";
    if (from < today) next.from = "The start date cannot be in the past.";
    if (to <= from) next.to = "The end date must be after the start date.";

    travellers.forEach((traveller, index) => {
      if (traveller.fullName.trim().length < 3) {
        next[`${traveller.id}-name`] =
          "Enter the full name exactly as printed on the identity document.";
      } else if (!traveller.fullName.trim().includes(" ")) {
        // The single most common cause of refusal.
        next[`${traveller.id}-name`] =
          "Give the full name including surname, exactly as on the document.";
      }
      if (!traveller.dob)
        next[`${traveller.id}-dob`] = "Date of birth is required.";
      if (traveller.idNumber.trim().length < 6)
        next[`${traveller.id}-id`] =
          `Enter the ${ID_LABEL[traveller.idType]} number.`;
      if (
        traveller.nationality === "foreign" &&
        traveller.idType !== "passport"
      )
        next[`${traveller.id}-id`] =
          "Foreign nationals must apply with a passport.";
      if (index > 6) next.count = "Apply in parties of seven or fewer.";
    });

    return next;
  }

  // Focus the first invalid field. This must run *after* React has committed
  // the new `aria-invalid` attributes — querying the DOM inside the submit
  // handler runs before the re-render and finds nothing.
  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) return;

    // Stands in for the API call. The reference format matches the one the
    // account pages display.
    const stateCode = (selected?.slug ?? "xx").slice(0, 2).toUpperCase();
    const year = from.slice(0, 4);
    const serial = String(Math.abs(hash(email + from)) % 100000).padStart(
      5,
      "0",
    );
    setReference(`ILP-${stateCode}-${year}-${serial}`);
  }

  if (reference) {
    return (
      <Submitted reference={reference} state={selected} from={from} to={to} />
    );
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl">
      <FieldSet
        legend="Where and when"
        description="One application covers one state. If your trip crosses two permit states, submit one application for each — we will link them."
      >
        <Field id="state" label="State" required>
          <SelectInput
            id="state"
            value={state}
            onChange={(event) => setState(event.target.value)}
          >
            {states.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.name}
              </option>
            ))}
          </SelectInput>
        </Field>

        <div className="grid gap-6 sm:col-span-2 sm:grid-cols-2">
          <Field
            id="from"
            label="Entering on"
            required
            error={errors.from}
            hint="Permits are usually issued for up to 30 days."
          >
            <TextInput
              id="from"
              type="date"
              min={today}
              value={from}
              error={errors.from}
              hasHint
              onChange={(event) => setFrom(event.target.value)}
            />
          </Field>
          <Field id="to" label="Leaving on" required error={errors.to}>
            <TextInput
              id="to"
              type="date"
              min={from}
              value={to}
              error={errors.to}
              onChange={(event) => setTo(event.target.value)}
            />
          </Field>
        </div>
      </FieldSet>

      {selected?.requiresPAP ? (
        <p className="mt-6 rounded-[var(--radius-control)] border border-[color-mix(in_srgb,var(--muga-gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--muga-gold)_8%,transparent)] p-5 text-16">
          {selected.name} also requires a Protected Area Permit for foreign
          nationals, which takes longer and for some nationalities takes
          considerably longer. Start at least eight weeks ahead and tell us in
          the notes below.
        </p>
      ) : null}

      <div className="mt-14">
        <div className="flex items-baseline justify-between gap-4">
          <Eyebrow>Travellers</Eyebrow>
          <p className="u-mono text-ink-faint">
            {travellers.length} of 7 maximum
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-12">
          {travellers.map((traveller, index) => (
            <FieldSet
              key={traveller.id}
              legend={`Traveller ${index + 1}`}
              description={
                index === 0
                  ? "Names must match the identity document exactly. A mismatched name is the single most common reason a permit is refused."
                  : undefined
              }
            >
              <Field
                id={`${traveller.id}-name`}
                label="Full name"
                required
                error={errors[`${traveller.id}-name`]}
              >
                <TextInput
                  id={`${traveller.id}-name`}
                  autoComplete="name"
                  value={traveller.fullName}
                  error={errors[`${traveller.id}-name`]}
                  onChange={(event) =>
                    update(traveller.id, { fullName: event.target.value })
                  }
                />
              </Field>

              <Field
                id={`${traveller.id}-dob`}
                label="Date of birth"
                required
                error={errors[`${traveller.id}-dob`]}
              >
                <TextInput
                  id={`${traveller.id}-dob`}
                  type="date"
                  max={today}
                  value={traveller.dob}
                  error={errors[`${traveller.id}-dob`]}
                  onChange={(event) =>
                    update(traveller.id, { dob: event.target.value })
                  }
                />
              </Field>

              <Field id={`${traveller.id}-nat`} label="Nationality" required>
                <SelectInput
                  id={`${traveller.id}-nat`}
                  value={traveller.nationality}
                  onChange={(event) =>
                    update(traveller.id, {
                      nationality: event.target
                        .value as Traveller["nationality"],
                      idType:
                        event.target.value === "foreign"
                          ? "passport"
                          : traveller.idType,
                    })
                  }
                >
                  <option value="indian">Indian</option>
                  <option value="foreign">Other</option>
                </SelectInput>
              </Field>

              <Field id={`${traveller.id}-idtype`} label="Document" required>
                <SelectInput
                  id={`${traveller.id}-idtype`}
                  value={traveller.idType}
                  onChange={(event) =>
                    update(traveller.id, {
                      idType: event.target.value as Traveller["idType"],
                    })
                  }
                >
                  {(traveller.nationality === "foreign"
                    ? (["passport"] as const)
                    : (["aadhaar", "voter", "passport", "driving"] as const)
                  ).map((type) => (
                    <option key={type} value={type}>
                      {ID_LABEL[type]}
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Field
                id={`${traveller.id}-id`}
                label={`${ID_LABEL[traveller.idType]} number`}
                required
                error={errors[`${traveller.id}-id`]}
                className="sm:col-span-2"
              >
                <TextInput
                  id={`${traveller.id}-id`}
                  inputMode="text"
                  value={traveller.idNumber}
                  error={errors[`${traveller.id}-id`]}
                  onChange={(event) =>
                    update(traveller.id, { idNumber: event.target.value })
                  }
                  className="font-mono tabular-nums"
                />
              </Field>

              {travellers.length > 1 ? (
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={() =>
                      setTravellers((current) =>
                        current.filter((t) => t.id !== traveller.id),
                      )
                    }
                    className="u-mono min-h-11 text-naga-red-ink underline underline-offset-4"
                  >
                    Remove traveller {index + 1}
                  </button>
                </div>
              ) : null}
            </FieldSet>
          ))}
        </div>

        {travellers.length < 7 ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="mt-10"
            onClick={() =>
              setTravellers((current) => [
                ...current,
                emptyTraveller(current.length),
              ])
            }
          >
            Add another traveller
          </Button>
        ) : null}
      </div>

      <div className="mt-14">
        <FieldSet
          legend="Where to send it"
          description="The permit arrives as a PDF. Carry a printed copy as well — check-posts are not always online."
        >
          <Field id="email" label="Email" required error={errors.email}>
            <TextInput
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              error={errors.email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field id="phone" label="Mobile" required error={errors.phone}>
            <TextInput
              id="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              error={errors.phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </Field>
          <Field
            id="notes"
            label="Anything we should know"
            className="sm:col-span-2"
            hint="Booking reference, unusual routing, or a nationality that may need extra lead time."
          >
            <TextArea
              id="notes"
              hasHint
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Field>
        </FieldSet>
      </div>

      <div className="mt-12 border-t border-[var(--ink-hairline)] pt-8">
        <Button type="submit" variant="primary" size="lg">
          Submit application
        </Button>
        <p className="mt-4 max-w-prose text-14 text-ink-soft">
          We do not charge for processing. Where a state levies a government fee
          it is passed through at cost and shown before you pay. We cannot
          guarantee that a state authority will grant a permit.
        </p>
      </div>
    </form>
  );
}

function Submitted({
  reference,
  state,
  from,
  to,
}: {
  reference: string;
  state?: Destination;
  from: string;
  to: string;
}) {
  return (
    <div className="max-w-2xl">
      <Chip tone="teal">Application received</Chip>
      <h2 className="mt-6 text-36">We have it. Nothing else to do.</h2>
      <p className="mt-5 text-18 text-ink-soft">
        Your application for {state?.name} is with our permits desk and will go
        to the state portal today. Expect a decision in three to seven working
        days.
      </p>

      <dl className="mt-10 grid gap-6 border-y border-[var(--ink-hairline)] py-8 sm:grid-cols-2">
        <div>
          <dt className="u-mono text-ink-soft">Reference</dt>
          <dd className="mt-2 font-mono text-18">{reference}</dd>
        </div>
        <div>
          <dt className="u-mono text-ink-soft">State</dt>
          <dd className="mt-2 text-18">{state?.name}</dd>
        </div>
        <div>
          <dt className="u-mono text-ink-soft">Valid from</dt>
          <dd className="mt-2 text-18">{formatLong(from)}</dd>
        </div>
        <div>
          <dt className="u-mono text-ink-soft">Valid to</dt>
          <dd className="mt-2 text-18">{formatLong(to)}</dd>
        </div>
      </dl>

      <p className="mt-8 text-16 text-ink-soft">
        You can track it under{" "}
        <a
          href="/account/permits"
          className="text-deep-teal-ink underline underline-offset-4"
        >
          My permits
        </a>
        . If anything on the application needs correcting we will email you
        rather than let it be refused.
      </p>
    </div>
  );
}

/** Deterministic reference stand-in. Replaced by the API's own id. */
function hash(input: string): number {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) {
    value = (value * 31 + input.charCodeAt(i)) | 0;
  }
  return value;
}
