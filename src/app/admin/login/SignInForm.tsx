"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type SignInResult } from "../actions";

/**
 * The password field.
 *
 * A plain `<form action={...}>` posting to a server action, so it works
 * before hydration — an operator on a bad connection in Guwahati can sign in
 * while the JavaScript is still arriving. `useActionState` only adds the
 * error message on top of that; it is not what makes the form work.
 */
export function SignInForm() {
  const [state, formAction] = useActionState<SignInResult | null, FormData>(
    signIn,
    null,
  );

  return (
    <form action={formAction} className="mt-8">
      <label htmlFor="password" className="u-label block text-ink-soft">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        aria-describedby={state?.error ? "signin-error" : undefined}
        aria-invalid={state?.error ? true : undefined}
        className="mt-2 min-h-12 w-full rounded-[var(--radius-input)] border border-[var(--ink-hairline-strong)] bg-paper px-4 text-16 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
      />

      {state?.error ? (
        <p
          id="signin-error"
          role="alert"
          className="mt-3 text-14 text-clay-ink"
        >
          {state.error}
        </p>
      ) : null}

      <Submit />
    </form>
  );
}

/**
 * Its own component because `useFormStatus` reads the nearest enclosing
 * form's state and must be rendered *inside* that form — called from
 * `SignInForm` it would always report idle.
 */
function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 min-h-12 w-full rounded-full bg-ink px-6 text-night-text transition-opacity disabled:opacity-45"
    >
      {pending ? "Checking…" : "Sign in"}
    </button>
  );
}
