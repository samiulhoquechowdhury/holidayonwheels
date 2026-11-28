"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";
import type { ActionResult } from "@/app/admin/(guarded)/office-actions";

/**
 * A form that posts to a server action and shows what came back.
 *
 * ## Why one component for all of them
 *
 * Changing a status, disabling an account and recording a payment are the
 * same interaction: hidden identifiers, one control, a pending state, and an
 * error that has to appear next to the thing that failed. Written out per
 * screen, the fourth copy forgets the pending state and an operator
 * double-submits a payment.
 *
 * ## It works without JavaScript
 *
 * A plain `<form action={serverAction}>`. `useActionState` adds the inline
 * message; it is not what makes the form submit. The office works on patchy
 * connections and a tool that needs a loaded bundle before a payment can be
 * recorded is a tool that stops working at the wrong moment.
 */
export function ActionForm({
  action,
  hidden,
  children,
  className,
  /** Shown briefly after a successful submit, where that is not obvious. */
  successMessage,
}: {
  action: (
    prev: ActionResult | null,
    formData: FormData,
  ) => Promise<ActionResult>;
  hidden?: Record<string, string>;
  children: React.ReactNode;
  className?: string;
  successMessage?: string;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className={className}>
      {Object.entries(hidden ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      {children}

      {state && !state.ok ? (
        <p role="alert" className="text-13 mt-2 text-clay-ink">
          {state.error}
        </p>
      ) : null}

      {state?.ok && successMessage ? (
        <p role="status" className="text-13 mt-2 text-ink-soft">
          {successMessage}
        </p>
      ) : null}
    </form>
  );
}

/**
 * A submit button that disables itself while the action runs.
 *
 * Separate from `ActionForm` because `useFormStatus` reads the nearest
 * enclosing form and must be rendered *inside* it — called one level up it
 * would always report idle, and the button would stay clickable through the
 * request. For a form that records money, that is a duplicate payment.
 */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "quiet",
  name,
  value,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "quiet" | "solid" | "danger";
  /** For several buttons in one form, e.g. publish / unpublish / archive. */
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={cn(
        "u-label min-h-9 rounded-full px-3.5 transition-colors disabled:opacity-45",
        variant === "quiet" &&
          "border border-[var(--ink-hairline-strong)] text-ink-soft hover:border-ink hover:text-ink",
        variant === "solid" && "bg-ink text-night-text",
        variant === "danger" &&
          "border border-clay text-clay-ink hover:bg-clay",
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

/**
 * A `<select>` that submits on change.
 *
 * ## Why there is still a button
 *
 * Auto-submitting on change is what an operator expects from a status
 * dropdown, but it only works once JavaScript has loaded. The button is
 * rendered and then hidden by script, so the control works either way: with
 * JS it submits on change, without it there is something to press. A
 * `<select>` that silently does nothing is the worst of the three.
 */
export function SubmitSelect({
  name,
  defaultValue,
  options,
  label,
}: {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <label className="sr-only" htmlFor={`${name}-select`}>
        {label}
      </label>
      <select
        id={`${name}-select`}
        name={name}
        defaultValue={defaultValue}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="min-h-9 rounded-[var(--radius-input)] border border-[var(--ink-hairline-strong)] bg-paper px-2.5 text-14"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <NoScriptSubmit />
    </span>
  );
}

/**
 * The fallback button for `SubmitSelect`.
 *
 * `<noscript>` cannot be used: React renders this tree on the client too, and
 * a `noscript` body is inert once script is running — but the button would
 * still be in the DOM for assistive technology. Hiding it from script instead
 * means it is gone entirely when it is redundant.
 */
function NoScriptSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      /* `js-hide` is set to display:none by a tiny inline script in the admin
         layout; without script it never matches and the button stays. */
      className="js-hide u-label min-h-9 rounded-full border border-[var(--ink-hairline-strong)] px-3 text-ink-soft"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}
