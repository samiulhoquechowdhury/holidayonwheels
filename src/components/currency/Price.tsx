"use client";

import { cn } from "@/lib/cn";
import { formatINR, formatCompactINR } from "@/lib/currency";
import { useCurrency } from "./CurrencyProvider";

/**
 * A price, in rupees, with the visitor's currency beside it.
 *
 * **The rupee figure never moves and never disappears.** That is the whole
 * design rule. Prices here are quoted, invoiced and charged in rupees; the
 * converted figure is an indication to help somebody decide, and a site that
 * replaced the real price with an approximation would be quoting in a
 * currency it does not transact in. So the conversion is additive, marked
 * approximate, and in quieter type than the thing it approximates.
 *
 * With `INR` selected, or when the rate fetch failed, this renders exactly
 * what `formatINR` rendered before and nothing else changes.
 *
 * `variant`:
 *  - `inline` — "₹64,500 (≈ $770)". For body copy and card meta lines.
 *  - `stacked` — the rupees, then the approximation underneath. For the big
 *    figure in a booking widget, where an inline parenthesis would wrap.
 */
export function Price({
  rupees,
  compact = false,
  variant = "inline",
  className,
  approxClassName,
}: {
  rupees: number;
  /** Use the `₹1.25 L` form for the rupee figure. */
  compact?: boolean;
  variant?: "inline" | "stacked";
  className?: string;
  approxClassName?: string;
}) {
  const { format, code } = useCurrency();
  const converted = format(rupees);
  const rupeeText = compact ? formatCompactINR(rupees) : formatINR(rupees);

  if (!converted) return <span className={className}>{rupeeText}</span>;

  /*
   * `≈` rather than "about", and a `title` that says it in words.
   *
   * The symbol is compact enough to sit inside a card's meta line, which is
   * where most of these are, but it is not self-explanatory to everybody —
   * so the long form is available on hover and to assistive technology,
   * where "approximately" is read out rather than a character that many
   * screen readers skip.
   */
  if (variant === "stacked") {
    return (
      <span className={cn("block", className)}>
        {rupeeText}
        <span
          className={cn("u-label mt-1 block text-ink-faint", approxClassName)}
          title={`Approximately ${converted}. Charged in rupees.`}
        >
          <span aria-hidden="true">≈ {converted}</span>
          <span className="sr-only">
            approximately {converted}, charged in rupees
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={className}>
      {rupeeText}{" "}
      <span
        className={cn("text-ink-faint", approxClassName)}
        title={`Approximately ${converted} at today's rate. Charged in rupees.`}
      >
        <span aria-hidden="true">(≈ {converted})</span>
        <span className="sr-only">
          approximately {converted} {code}, charged in rupees
        </span>
      </span>
    </span>
  );
}
