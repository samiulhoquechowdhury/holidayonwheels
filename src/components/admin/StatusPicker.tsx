"use client";

import { useTransition, useOptimistic } from "react";
import { cn } from "@/lib/cn";

/**
 * The status of one record, changed in place.
 *
 * Optimistic, because the operator is working down a list and a 300ms wait
 * per row is how a queue of forty becomes unusable. `useOptimistic` shows the
 * new status immediately and React reverts it on its own if the action
 * throws — which it will, loudly, if the session has expired mid-shift.
 *
 * Buttons rather than a `<select>`: there are three to six values, the
 * operator picks them constantly, and a select costs two interactions and
 * hides the options until the first one.
 */
export function StatusPicker<T extends string>({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (id: string, status: T) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(value);

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 transition-opacity",
        pending && "opacity-60",
      )}
    >
      {options.map((option) => {
        const active = option.value === shown;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() =>
              startTransition(async () => {
                setShown(option.value);
                await onChange(id, option.value);
              })
            }
            className={cn(
              "u-label min-h-8 rounded-full border px-3 text-14 transition-colors",
              active
                ? "border-ink bg-ink text-night-text"
                : "border-[var(--ink-hairline-strong)] text-ink-soft hover:border-ink hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
