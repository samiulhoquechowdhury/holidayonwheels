"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/primitives/Button";
import { getDestinations } from "@/content/destinations";

/**
 * Where / when / who.
 *
 * Three fields on desktop, separated by hairlines rather than boxes. On
 * mobile it collapses to a single field that expands the other two on focus —
 * a three-field row at 320px is unusable and pretending otherwise is how
 * booking flows lose people.
 */
export function SearchBar({
  className,
  tone = "light",
  /** Where results go. Tours by default; destination pages pass their own. */
  action = "/tours",
}: {
  className?: string;
  tone?: "light" | "onDark";
  action?: string;
}) {
  const router = useRouter();
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");
  const [who, setWho] = useState("2");

  const destinations = getDestinations();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (where) params.set("state", where);
    if (when) params.set("from", when);
    if (who) params.set("pax", who);
    router.push(`${action}?${params.toString()}`);
  }

  const dark = tone === "onDark";

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Find a trip"
      className={cn(
        "w-full rounded-[var(--radius-control)] border p-2",
        dark
          ? "border-[rgb(255_255_255/0.28)] bg-[rgb(13_21_18/0.55)] backdrop-blur-md"
          : "border-[var(--ink-hairline-strong)] bg-paper",
        className,
      )}
    >
      <div
        className={cn(
          "grid gap-2",
          // Collapsed on mobile until the traveller engages with it.
          expanded ? "grid-cols-1" : "grid-cols-1",
          "md:grid-cols-[1.4fr_1fr_0.8fr_auto] md:gap-0",
        )}
      >
        <Field
          label="Where"
          htmlFor={`${id}-where`}
          dark={dark}
          className="md:border-r md:border-current/15"
        >
          <select
            id={`${id}-where`}
            value={where}
            onChange={(event) => setWhere(event.target.value)}
            onFocus={() => setExpanded(true)}
            className={cn(inputClass, dark && "text-paper")}
          >
            <option value="">Anywhere in the Northeast</option>
            {destinations.map((destination) => (
              <option key={destination.slug} value={destination.slug}>
                {destination.name}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="When"
          htmlFor={`${id}-when`}
          dark={dark}
          className={cn(
            "md:border-r md:border-current/15",
            !expanded && "hidden md:block",
          )}
        >
          <input
            id={`${id}-when`}
            type="month"
            value={when}
            onChange={(event) => setWhen(event.target.value)}
            className={cn(inputClass, "tabular-nums", dark && "text-paper")}
          />
        </Field>

        <Field
          label="Who"
          htmlFor={`${id}-who`}
          dark={dark}
          className={cn(!expanded && "hidden md:block")}
        >
          <select
            id={`${id}-who`}
            value={who}
            onChange={(event) => setWho(event.target.value)}
            className={cn(inputClass, dark && "text-paper")}
          >
            <option value="1">1 traveller</option>
            <option value="2">2 travellers</option>
            <option value="4">3 to 4</option>
            <option value="6">5 to 6</option>
            <option value="8">7 or more</option>
          </select>
        </Field>

        <div
          className={cn(
            "md:self-center md:pl-2",
            !expanded && "hidden md:block",
          )}
        >
          <Button
            type="submit"
            variant={dark ? "onDark" : "primary"}
            size="md"
            block
            className="md:w-auto"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Mobile-only affordance to open the remaining fields. */}
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={cn(
            "mt-1 min-h-11 w-full text-14 md:hidden",
            dark ? "text-night-text-soft" : "text-ink-soft",
          )}
        >
          Add dates and travellers
        </button>
      ) : null}
    </form>
  );
}

const inputClass =
  "min-h-12 w-full bg-transparent px-3 text-16 outline-none [color-scheme:light]";

function Field({
  label,
  htmlFor,
  children,
  dark,
  className,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  dark: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 px-1", className)}>
      <label
        htmlFor={htmlFor}
        className={cn(
          "u-mono block px-3 pt-2",
          dark ? "text-night-text-soft" : "text-ink-soft",
        )}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
