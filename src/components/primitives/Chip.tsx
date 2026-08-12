import { cn } from "@/lib/cn";

export type ChipTone = "neutral" | "clay" | "ember" | "sage" | "onDark";

/**
 * Metadata pills: durations, difficulty, meal plans, altitude, seat counts.
 *
 * Tinted grounds with no border. The old set drew a coloured hairline *and* a
 * tinted fill, which at 12px is two signals doing one job — and eight of them
 * in a row under a card turned into a fence. A soft ground alone is enough to
 * separate a chip from body copy.
 */
const TONE: Record<ChipTone, string> = {
  neutral: "bg-[rgb(46_42_36/0.055)] text-ink-soft",
  clay: "bg-[color-mix(in_srgb,var(--clay)_22%,transparent)] text-clay-ink",
  ember: "bg-[color-mix(in_srgb,var(--ember)_13%,transparent)] text-ember-ink",
  sage: "bg-[color-mix(in_srgb,var(--sage)_20%,transparent)] text-sage-ink",
  onDark: "bg-[rgb(242_237_229/0.1)] text-night-text-soft",
};

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
        "inline-flex items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-1.5",
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
        "inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] px-5",
        "font-sans text-14 transition-colors duration-[var(--dur-micro)] ease-brand",
        active
          ? "bg-ink text-paper"
          : "bg-[rgb(46_42_36/0.05)] text-ink-soft hover:bg-[rgb(46_42_36/0.09)] hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}
