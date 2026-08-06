import { cn } from "@/lib/cn";
import { WeavePattern } from "./WeavePattern";
import type { WeaveRegion } from "./weave-motifs";

/**
 * Owns section tint, background pattern and vertical rhythm. Every section on
 * the site renders through this — that is the point. Without it, tint and
 * padding logic gets copy-pasted into thirty files and drifts.
 */

export type SectionTint =
  "paper" | "muga" | "cloud" | "paddy" | "loktak" | "cherry" | "night";

const TINT_CLASS: Record<SectionTint, string> = {
  paper: "bg-paper text-ink",
  muga: "bg-tint-muga text-ink",
  cloud: "bg-tint-cloud text-ink",
  paddy: "bg-tint-paddy text-ink",
  loktak: "bg-tint-loktak text-ink",
  cherry: "bg-tint-cherry text-ink",
  night: "bg-night text-night-text is-dark",
};

/**
 * Tint families, so a page can assert that no two adjacent sections share
 * one. `muga` and `cherry` are warm; `cloud` and `loktak` are cool; `paddy`
 * is green; `paper` and `night` are neutral.
 */
export const TINT_FAMILY: Record<SectionTint, string> = {
  paper: "neutral",
  night: "neutral",
  muga: "warm",
  cherry: "warm",
  cloud: "cool",
  loktak: "cool",
  paddy: "green",
};

type SectionShellProps = {
  children: React.ReactNode;
  tint?: SectionTint;
  /** Region motif for the background wash. Omit for no wash. */
  pattern?: WeaveRegion;
  patternScale?: number;
  patternOpacity?: number;
  /** `normal` is the 96/160px rhythm; `tight` halves it; `flush` removes it. */
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
  patternScale = 6,
  patternOpacity = 0.045,
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
          opacity={tint === "night" ? patternOpacity * 1.6 : patternOpacity}
        />
      ) : null}
      <div className={cn("relative", WIDTH_CLASS[width], innerClassName)}>
        {children}
      </div>
    </Tag>
  );
}
