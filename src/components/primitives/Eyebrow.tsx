import { cn } from "@/lib/cn";

/**
 * Utility label above a headline. The only uppercase text in the system —
 * display and body type are sentence case everywhere.
 *
 * `rule` draws a short hairline before the label, anchoring it to the column
 * when it is floating alone above a lot of air. Opt in rather than default:
 * it is right at the top of a section or a page, and wrong inside the cards,
 * panels and callouts that make up most of the eyebrows on the site.
 */
export function Eyebrow({
  children,
  tone = "soft",
  rule = false,
  className,
  as: Tag = "p",
}: {
  children: React.ReactNode;
  tone?: "soft" | "clay" | "ember" | "sage" | "onDark";
  /** Set true at the top of a section or page. Off inside cards and rows. */
  rule?: boolean;
  className?: string;
  as?: "p" | "span" | "div";
}) {
  const TONE = {
    soft: "text-ink-faint",
    clay: "text-clay-ink",
    ember: "text-ember-ink",
    sage: "text-sage-ink",
    onDark: "text-night-text-soft",
  } as const;

  return (
    <Tag
      className={cn("u-label flex items-center gap-3", TONE[tone], className)}
    >
      {rule ? (
        <span
          aria-hidden="true"
          className={cn(
            "block h-px w-6 shrink-0",
            tone === "onDark" ? "bg-[var(--night-hairline)]" : "bg-current",
            tone === "onDark" ? "" : "opacity-45",
          )}
        />
      ) : null}
      {children}
    </Tag>
  );
}
