import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";

/**
 * Price display. The figure is always mono — it is utility text, not editorial
 * type — and the qualifier ("per person", "from") is always present so a price
 * is never ambiguous about what it covers.
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
  tone?: "ink" | "gold" | "onDark";
  className?: string;
}) {
  const SIZE = {
    sm: "text-16",
    md: "text-22",
    lg: "text-28",
  } as const;

  const TONE = {
    ink: "text-ink",
    gold: "text-muga-gold-ink",
    onDark: "text-night-text",
  } as const;

  return (
    <p
      className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}
    >
      {prefix ? <span className="u-mono text-ink-soft">{prefix}</span> : null}
      {wasAmount ? (
        <span className="font-mono text-14 text-ink-faint line-through">
          {formatINR(wasAmount)}
        </span>
      ) : null}
      <span
        className={cn(
          "font-mono tracking-tight tabular-nums",
          SIZE[size],
          TONE[tone],
        )}
      >
        {formatINR(amount)}
      </span>
      <span
        className={cn(
          "u-mono",
          tone === "onDark" ? "text-night-text-soft" : "text-ink-soft",
        )}
      >
        {unit}
      </span>
    </p>
  );
}
