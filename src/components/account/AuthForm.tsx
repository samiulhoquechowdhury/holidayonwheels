"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AuthResult } from "@/app/(account)/auth-actions";

/**
 * The sign-in and register forms.
 *
 * One component for both, because they differ only in which fields appear and
 * which action they post to. Two near-identical files would drift on exactly
 * the details that matter here — `autoComplete` values, the error wiring, the
 * disabled state — and the differences would be invisible until a password
 * manager stopped filling the right box.
 *
 * ## It works without JavaScript
 *
 * A plain `<form action={serverAction}>`. `useActionState` adds the inline
 * error on top; it is not what makes the form submit. Somebody on a slow
 * connection can sign in while the bundle is still arriving.
 *
 * ## Why `autoComplete` is set explicitly on every field
 *
 * `current-password` on sign-in and `new-password` on register are what tell
 * a password manager whether to offer a saved entry or to generate one.
 * Omitted, managers guess, and the common failure is a register form
 * autofilled with the password from another site — which the person then
 * cannot reproduce because they never chose it.
 */
export function AuthForm({
  mode,
  action,
  redirectTo,
}: {
  mode: "sign-in" | "register";
  action: (
    prev: AuthResult | null,
    formData: FormData,
  ) => Promise<AuthResult | null>;
  redirectTo?: string;
}) {
  const [state, formAction] = useActionState<AuthResult | null, FormData>(
    action,
    null,
  );

  const isRegister = mode === "register";

  return (
    <form action={formAction} className="mt-8 max-w-md">
      {/*
        Carried in the form rather than read from the URL inside the action.
        A server action does not receive the page's query string, so without
        this, "sign in to continue" would always land on /account and lose
        wherever the person was actually going.
      */}
      {redirectTo ? (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      ) : null}

      {isRegister ? (
        <Field
          id="name"
          name="name"
          label="Your name"
          type="text"
          autoComplete="name"
          required
          autoFocus
          error={state?.field === "name" ? state.error : undefined}
        />
      ) : null}

      <Field
        id="email"
        name="email"
        label="Email address"
        type="email"
        autoComplete="email"
        required
        autoFocus={!isRegister}
        error={state?.field === "email" ? state.error : undefined}
        className={isRegister ? "mt-5" : undefined}
      />

      <Field
        id="password"
        name="password"
        label="Password"
        type="password"
        autoComplete={isRegister ? "new-password" : "current-password"}
        required
        hint={
          isRegister
            ? "At least 12 characters. A short phrase works well."
            : undefined
        }
        error={state?.field === "password" ? state.error : undefined}
        className="mt-5"
      />

      {isRegister ? (
        <Field
          id="phone"
          name="phone"
          label="Phone number"
          type="tel"
          autoComplete="tel"
          hint="Optional. It is how the office reaches you about a trip."
          className="mt-5"
        />
      ) : null}

      {/*
        The general error, shown only when it is not attached to a field —
        otherwise it would appear twice for the same problem.
      */}
      {state?.error && !state.field ? (
        <p role="alert" className="mt-5 text-14 text-clay-ink">
          {state.error}
        </p>
      ) : null}

      <Submit label={isRegister ? "Create account" : "Sign in"} />
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type,
  autoComplete,
  required,
  autoFocus,
  hint,
  error,
  className,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  required?: boolean;
  autoFocus?: boolean;
  hint?: string;
  error?: string;
  className?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="u-label block text-ink-soft">
        {label}
        {required ? null : (
          <span className="text-ink-softer ml-2 normal-case">optional</span>
        )}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        /*
         * Both ids, so a field with a hint and an error reads out both rather
         * than the error replacing the rule it broke.
         */
        aria-describedby={
          [hintId, errorId].filter(Boolean).join(" ") || undefined
        }
        aria-invalid={error ? true : undefined}
        className="mt-2 min-h-12 w-full rounded-[var(--radius-input)] border border-[var(--ink-hairline-strong)] bg-paper px-4 text-16 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
      />

      {hint ? (
        <p id={hintId} className="text-13 text-ink-softer mt-2">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-14 text-clay-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Its own component because `useFormStatus` reads the nearest enclosing
 * form's state and must render *inside* that form — called from `AuthForm`
 * it would always report idle.
 */
function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-7 min-h-12 w-full rounded-full bg-ink px-6 text-night-text transition-opacity disabled:opacity-45"
    >
      {pending ? "One moment…" : label}
    </button>
  );
}
