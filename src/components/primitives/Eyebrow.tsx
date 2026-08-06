import { cn } from "@/lib/cn";

/**
 * Mono utility label that sits above a headline. The only uppercase text in
 * the system — display and body type are sentence case everywhere.
 */
export function Eyebrow({
  children,
  tone = "soft",
  className,
  as: Tag = "p",
}: {
  children: React.ReactNode;
  tone?: "soft" | "gold" | "red" | "teal" | "onDark";
  className?: string;
  as?: "p" | "span" | "div";
}) {
  const TONE = {
    soft: "text-ink-soft",
    gold: "text-muga-gold-ink",
    red: "text-naga-red-ink",
    teal: "text-deep-teal-ink",
    onDark: "text-night-text-soft",
  } as const;

  return <Tag className={cn("u-mono", TONE[tone], className)}>{children}</Tag>;
}
