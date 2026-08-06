"use client";

import { useId, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/cn";
import { getMotif, type WeaveRegion } from "./weave-motifs";

type WeaveBandProps = {
  /** Which region's textile geometry to run. Defaults to the composite key. */
  region?: WeaveRegion;
  /** Band height in pixels. Spec range is 28–40. */
  height?: number;
  /** `ink` on light tints, `paper` on the dark band. */
  tone?: "ink" | "paper" | "gold" | "red" | "teal";
  /** Motif opacity. The band is a divider, not a feature — keep it low. */
  opacity?: number;
  className?: string;
};

const TONE_CLASS: Record<NonNullable<WeaveBandProps["tone"]>, string> = {
  ink: "text-ink",
  paper: "text-paper",
  gold: "text-muga-gold",
  red: "text-naga-red",
  teal: "text-deep-teal",
};

/**
 * The signature divider. A thin band of woven geometry that sits between
 * sections and slides horizontally as the page scrolls, like fabric passing.
 *
 * The motif is chosen by region, which is what makes the band structural
 * rather than ornamental: it tells you which part of the Northeast the
 * section below is about.
 *
 * Decorative by ARIA — the region is always also stated in the section's own
 * copy, so nothing is lost to a screen reader.
 */
export function WeaveBand({
  region = "neutral",
  height = 32,
  tone = "ink",
  opacity = 0.5,
  className,
}: WeaveBandProps) {
  const motif = getMotif(region);
  const patternId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // The inner sheet is twice the band's width, so a 0 → -14% slide never
  // exposes an edge. Translating by any amount is seamless because the motif
  // tiles, but keeping it inside the overhang avoids sub-pixel seams.
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("relative w-full overflow-hidden", className)}
      style={{ height }}
    >
      <motion.div
        data-motion="weave"
        className={cn("h-full w-[200%]", TONE_CLASS[tone])}
        style={reduced ? undefined : { x }}
      >
        <svg
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          role="presentation"
          focusable="false"
        >
          <defs>
            <pattern
              id={patternId}
              width={motif.tile}
              height={motif.tile}
              patternUnits="userSpaceOnUse"
            >
              <g
                opacity={opacity}
                dangerouslySetInnerHTML={{ __html: motif.paths }}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      </motion.div>
    </div>
  );
}
