import { cn } from "@/lib/cn";
import { WeavePattern } from "./WeavePattern";
import type { WeaveRegion } from "./weave-motifs";

/**
 * Owns section surface, background texture and vertical rhythm. Every section
 * on the site renders through this — that is the point. Without it, surface
 * and padding logic gets copy-pasted into thirty files and drifts.
 *
 * Four surfaces, down from seven. The old system cycled five tints so no two
 * adjacent sections matched, which meant the page was always changing colour
 * and never resting. This one keeps most of the site on `paper` and separates
 * sections with space and hairlines instead. `sand` is an event — twice a
 * page at most — and `night` happens once.
 */

export type SectionTint = "paper" | "shell" | "sand" | "night";

const TINT_CLASS: Record<SectionTint, string> = {
  paper: "bg-paper text-ink",
  shell: "bg-shell text-ink",
  sand: "bg-sand text-ink",
  night: "bg-night text-night-text is-dark",
};

type SectionShellProps = {
  children: React.ReactNode;
  tint?: SectionTint;
  /** Region motif for the background texture. Omit for a bare surface. */
  pattern?: WeaveRegion;
  patternScale?: number;
  patternOpacity?: number;
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
  pattern,
  patternScale = 7,
  // A tenth of what it was. The weave is a texture you notice on the second
  // visit, not a pattern you read — at the old 0.045 it competed with the
  // type for a design whose whole argument is empty space.
  patternOpacity = 0.022,
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
      {pattern ? (
        <WeavePattern
          region={pattern}
          scale={patternScale}
          opacity={tint === "night" ? patternOpacity * 2 : patternOpacity}
        />
      ) : null}
      <div className={cn("relative", WIDTH_CLASS[width], innerClassName)}>
        {children}
      </div>
    </Tag>
  );
}
