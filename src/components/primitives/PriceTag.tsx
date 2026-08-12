import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";

/**
 * Price display.
 *
 * The figure is set in the display serif, not in a monospace. That is the
 * single biggest tell in this redesign: a mono price reads as a line item on
 * an invoice, and the same number in a light serif reads as a considered
 * amount. It stays tabular (`.u-num`) so a column of prices still aligns.
 *
 * The qualifier ("per person", "from") is always present, so a price is never
 * ambiguous about what it covers.
 */
export function PriceTag({
  amount,
  /** Struck-through original, for a discounted departure. */
  wasAmount,
  unit = "per person",
  prefix,
  size = "md",
  tone = "ink",
  className,
}: {
  amount: number;
  wasAmount?: number;
  unit?: string;
  prefix?: string;
  size?: "sm" | "md" | "lg";
  tone?: "ink" | "clay" | "onDark";
  className?: string;
}) {
  const SIZE = {
    sm: "text-18",
    md: "text-28",
    lg: "text-36",
  } as const;

  const TONE = {
    ink: "text-ink",
    clay: "text-clay-ink",
    onDark: "text-night-text",
  } as const;

  const soft = tone === "onDark" ? "text-night-text-soft" : "text-ink-faint";

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2.5", className)}>
      {prefix ? <span className={cn("u-label", soft)}>{prefix}</span> : null}
      {wasAmount ? (
        <span className={cn("u-num text-14 line-through", soft)}>
          {formatINR(wasAmount)}
        </span>
      ) : null}
      <span
        className={cn(
          "u-num font-display leading-none",
          SIZE[size],
          TONE[tone],
        )}
      >
        {formatINR(amount)}
      </span>
      <span className={cn("u-label", soft)}>{unit}</span>
    </p>
  );
}
