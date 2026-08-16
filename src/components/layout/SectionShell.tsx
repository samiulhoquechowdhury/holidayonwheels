import { cn } from "@/lib/cn";

/**
 * Owns section surface and vertical rhythm. Every section on the site renders
 * through this — that is the point. Without it, surface and padding logic gets
 * copy-pasted into thirty files and drifts.
 *
 * **The weave texture is gone.** Every section used to be able to draw a
 * regional motif behind its content at 2–5% opacity, with decorated bands
 * between sections. Two problems, and the second is the fatal one: it put a
 * busy field behind photography that is now doing the same job far better,
 * and it dated the design — a patterned background is the single clearest
 * signal that a layout was made to fill space rather than to be read. The
 * page is now separated by surface, colour and air alone.
 *
 * The motifs themselves survive in `weave-motifs.ts`, where `Media` still
 * uses them to draw its no-image placeholder. That is the one place a woven
 * pattern still earns its keep.
 *
 * Eight surfaces: four neutrals and four tints from the state palette. Most
 * of the site stays on `paper`; a tint is an event, and `night` happens once
 * per page at most.
 */

export type SectionTint =
  "paper" | "shell" | "sand" | "night" | "mint" | "blush" | "lilac" | "butter";

const TINT_CLASS: Record<SectionTint, string> = {
  paper: "bg-paper text-ink",
  shell: "bg-shell text-ink",
  sand: "bg-sand text-ink",
  night: "bg-night text-night-text is-dark",
  mint: "bg-mint text-ink",
  blush: "bg-blush text-ink",
  lilac: "bg-lilac text-ink",
  butter: "bg-butter text-ink",
};

type SectionShellProps = {
  children: React.ReactNode;
  tint?: SectionTint;
  /** `normal` is the 104/176px rhythm; `tight` halves it; `flush` removes it. */
  spacing?: "normal" | "tight" | "flush";
  /** Content column width. `wide` is for full-bleed media rows. */
  width?: "content" | "wide" | "full";
  /** Renders as `<section>` by default; pass `div` when nesting. */
  as?: "section" | "div" | "aside";
  id?: string;
  className?: string;
  /** Applied to the inner container rather than the tinted surface. */
  innerClassName?: string;
  "aria-labelledby"?: string;
};

const SPACING_CLASS = {
  normal: "py-[var(--section-pad)]",
  tight: "py-[calc(var(--section-pad)*0.55)]",
  flush: "py-0",
} as const;

const WIDTH_CLASS = {
  content: "u-container",
  wide: "u-container-wide",
  full: "w-full",
} as const;

export function SectionShell({
  children,
  tint = "paper",
  spacing = "normal",
  width = "content",
  as: Tag = "section",
  id,
  className,
  innerClassName,
  ...rest
}: SectionShellProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "relative isolate overflow-hidden",
        TINT_CLASS[tint],
        SPACING_CLASS[spacing],
        className,
      )}
      {...rest}
    >
      <div className={cn("relative", WIDTH_CLASS[width], innerClassName)}>
        {children}
      </div>
    </Tag>
  );
}
