"use client";

import { useEffect, useState } from "react";
import {
  Field,
  FieldSet,
  TextInput,
  TextArea,
  SelectInput,
} from "@/components/primitives/Field";
import { Button } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { getDestinations } from "@/content/destinations";

/**
 * Enquiry form. No backend in this phase — it validates and acknowledges.
 * When the API lands, only `submit` changes.
 */
export function ContactForm() {
  const destinations = getDestinations();
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    month: "",
    party: "2",
    message: "",
  });

  function set(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
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
    const found: Record<string, string> = {};
    if (values.name.trim().length < 2) found.name = "Tell us what to call you.";
    if (!values.email.includes("@"))
      found.email = "We need an email to reply to.";
    if (values.message.trim().length < 20)
      found.message =
        "A couple of sentences at least — the more specific you are, the more useful our reply.";
    setErrors(found);

    if (Object.keys(found).length > 0) return;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="max-w-xl">
        <Chip tone="teal">Message sent</Chip>
        <h2 className="mt-6 text-36">We have it.</h2>
        <p className="mt-5 text-18 text-ink-soft">
          Someone will reply within one working day, usually the same day. If
          your dates are tight, say so in a follow-up and we will move it up the
          queue.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl">
      <FieldSet legend="About you">
        <Field id="name" label="Name" required error={errors.name}>
          <TextInput
            id="name"
            autoComplete="name"
            value={values.name}
            error={errors.name}
            onChange={(event) => set("name", event.target.value)}
          />
        </Field>
        <Field id="email" label="Email" required error={errors.email}>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            error={errors.email}
            onChange={(event) => set("email", event.target.value)}
          />
        </Field>
        <Field id="phone" label="Mobile" hint="Optional, but faster.">
          <TextInput
            id="phone"
            type="tel"
            autoComplete="tel"
            hasHint
            value={values.phone}
            onChange={(event) => set("phone", event.target.value)}
          />
        </Field>
        <Field id="party" label="How many travelling">
          <SelectInput
            id="party"
            value={values.party}
            onChange={(event) => set("party", event.target.value)}
          >
            <option value="1">Just me</option>
            <option value="2">Two of us</option>
            <option value="4">Three or four</option>
            <option value="8">Five to eight</option>
            <option value="12">More than eight</option>
          </SelectInput>
        </Field>
      </FieldSet>

      <FieldSet legend="About the trip" className="mt-14">
        <Field id="state" label="Where, if you know">
          <SelectInput
            id="state"
            value={values.state}
            onChange={(event) => set("state", event.target.value)}
          >
            <option value="">Not sure yet</option>
            {destinations.map((destination) => (
              <option key={destination.slug} value={destination.slug}>
                {destination.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field id="month" label="Roughly when">
          <TextInput
            id="month"
            type="month"
            value={values.month}
            onChange={(event) => set("month", event.target.value)}
            className="tabular-nums"
          />
        </Field>
        <Field
          id="message"
          label="What you have in mind"
          required
          error={errors.message}
          hint="What you want out of it, what you definitely do not want, and anything that would make a trip wrong for you."
          className="sm:col-span-2"
        >
          <TextArea
            id="message"
            hasHint
            value={values.message}
            error={errors.message}
            onChange={(event) => set("message", event.target.value)}
          />
        </Field>
      </FieldSet>

      <div className="mt-12 border-t border-[var(--ink-hairline)] pt-8">
        <Button type="submit" variant="primary" size="lg">
          Send enquiry
        </Button>
        <p className="mt-4 max-w-prose text-14 text-ink-soft">
          We reply within one working day. We do not add you to a mailing list
          for asking a question.
        </p>
      </div>
    </form>
  );
}
