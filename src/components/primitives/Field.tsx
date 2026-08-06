import { cn } from "@/lib/cn";

/**
 * Form field primitives.
 *
 * Every input is labelled by a real `<label>`, errors are wired with
 * `aria-describedby` and `aria-invalid`, and hint text sits above the input
 * rather than below it so it is read before the field is filled rather than
 * after. Keyboard traversal of the booking flow depends on all three.
 */

const CONTROL = cn(
  "min-h-12 w-full rounded-[var(--radius-control)] border bg-paper px-3.5 text-16",
  "border-[var(--ink-hairline-strong)] transition-colors duration-[var(--dur-micro)]",
  "hover:border-ink focus:border-ink outline-none",
  "aria-[invalid=true]:border-naga-red",
  "disabled:opacity-50",
);

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="u-mono block text-ink-soft">
        {label}
        {required ? (
          <>
            {" "}
            <span aria-hidden="true" className="text-naga-red-ink">
              *
            </span>
            <span className="u-sr-only">(required)</span>
          </>
        ) : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mt-2 text-14 text-ink-faint">
          {hint}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-14 text-naga-red-ink"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  id,
  error,
  hasHint,
  className,
  ...props
}: React.ComponentProps<"input"> & {
  id: string;
  error?: string;
  hasHint?: boolean;
}) {
  return (
    <input
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={
        [hasHint ? `${id}-hint` : null, error ? `${id}-error` : null]
          .filter(Boolean)
          .join(" ") || undefined
      }
      className={cn(CONTROL, className)}
      {...props}
    />
  );
}

export function TextArea({
  id,
  error,
  hasHint,
  className,
  ...props
}: React.ComponentProps<"textarea"> & {
  id: string;
  error?: string;
  /** Set when the wrapping `Field` renders hint text, so it can be described. */
  hasHint?: boolean;
}) {
  return (
    <textarea
      id={id}
      rows={5}
      aria-invalid={error ? true : undefined}
      aria-describedby={
        [hasHint ? `${id}-hint` : null, error ? `${id}-error` : null]
          .filter(Boolean)
          .join(" ") || undefined
      }
      className={cn(CONTROL, "min-h-32 py-3 leading-relaxed", className)}
      {...props}
    />
  );
}

export function SelectInput({
  id,
  error,
  hasHint,
  className,
  children,
  ...props
}: React.ComponentProps<"select"> & {
  id: string;
  error?: string;
  /** Set when the wrapping `Field` renders hint text, so it can be described. */
  hasHint?: boolean;
}) {
  return (
    <select
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={
        [hasHint ? `${id}-hint` : null, error ? `${id}-error` : null]
          .filter(Boolean)
          .join(" ") || undefined
      }
      className={cn(CONTROL, className)}
      {...props}
    >
      {children}
    </select>
  );
}

/** Groups related fields with a visible heading, e.g. one traveller. */
export function FieldSet({
  legend,
  description,
  children,
  className,
}: {
  legend: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="text-22">{legend}</legend>
      {description ? (
        <p className="mt-2 max-w-prose text-14 text-ink-soft">{description}</p>
      ) : null}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
