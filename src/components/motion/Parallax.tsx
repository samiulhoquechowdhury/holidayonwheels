"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";

type ParallaxProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * Total travel as a percentage of the element's own height, split either
   * side of centre. 12 means it enters 6% low and leaves 6% high.
   *
   * The child must be over-tall by at least this much or the parallax will
   * expose the edge of the frame. `ParallaxMedia` below handles that for you.
   */
  amount?: number;
};

/**
 * Scroll-scrubbed vertical drift.
 *
 * Scrubbed rather than triggered: the element's position is a function of the
 * scroll position, so it tracks the wheel exactly and cannot desync from the
 * content beside it. `scrub: true` — not a number — because Lenis is already
 * smoothing the input, and smoothing a smoothed value is how parallax starts
 * feeling like it is on a delay.
 */
export function Parallax({ children, className, amount = 12 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      gsap.fromTo(
        el,
        { yPercent: amount / 2 },
        {
          yPercent: -amount / 2,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [amount] },
  );

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

/**
 * A framed photograph that drifts inside its own crop.
 *
 * The frame clips and holds the aspect ratio; the layer inside is 118% tall
 * and slides within it. That extra height is what makes the drift legible —
 * moving the frame itself would move the layout, and moving an exactly-sized
 * image would show the paper behind it at both extremes.
 */
export function ParallaxMedia({
  children,
  className,
  amount = 14,
}: ParallaxProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Parallax
        amount={amount}
        className="absolute inset-x-0 -top-[9%] h-[118%]"
      >
        {children}
      </Parallax>
    </div>
  );
}
