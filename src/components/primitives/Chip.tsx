import { cn } from "@/lib/cn";

export type ChipTone = "neutral" | "gold" | "red" | "teal" | "onDark";

const TONE: Record<ChipTone, string> = {
  neutral:
    "border-[var(--ink-hairline-strong)] text-ink-soft bg-[rgb(255_255_255/0.5)]",
  gold: "border-[color-mix(in_srgb,var(--muga-gold)_45%,transparent)] text-muga-gold-ink bg-[color-mix(in_srgb,var(--muga-gold)_10%,transparent)]",
  red: "border-[color-mix(in_srgb,var(--naga-red)_45%,transparent)] text-naga-red-ink bg-[color-mix(in_srgb,var(--naga-red)_9%,transparent)]",
  teal: "border-[color-mix(in_srgb,var(--deep-teal)_45%,transparent)] text-deep-teal-ink bg-[color-mix(in_srgb,var(--deep-teal)_9%,transparent)]",
  onDark: "border-[rgb(255_255_255/0.22)] text-night-text-soft bg-transparent",
};

/**
 * Small metadata pill: durations, difficulty, meal plans, altitude, seat
 * counts. Never interactive — for interactive filters use `FilterChip`.
 */
export function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: ChipTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border px-2.5 py-1",
        "font-sans text-12 leading-none whitespace-nowrap",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * The interactive variant, used in filter rails and the tour-type switcher.
 * Renders a real `<button>` with `aria-pressed` so state reaches assistive
 * tech rather than being conveyed by colour alone.
 */
export function FilterChip({
  children,
  active = false,
  onClick,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border px-4",
        "font-sans text-14 transition-colors duration-[var(--dur-micro)] ease-brand",
        active
          ? "border-ink bg-ink text-paper"
          : "border-[var(--ink-hairline-strong)] text-ink-soft hover:border-ink hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}
