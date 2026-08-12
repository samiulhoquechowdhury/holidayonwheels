"use client";

import { useRef, type ElementType } from "react";
import {
  gsap,
  useGSAP,
  SplitText,
  fontsReady,
  prefersReducedMotion,
} from "@/lib/gsap";
import { cn } from "@/lib/cn";

type SplitRevealProps = {
  children: React.ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds before the first line moves. */
  delay?: number;
  /** Seconds between lines. Below 0.06 the stagger stops being legible. */
  stagger?: number;
  /** ScrollTrigger start. Default fires a little before the heading is level. */
  start?: string;
};

/**
 * A headline that rises out of its own baseline, line by line.
 *
 * This is the site's one text reveal and every section headline uses it. The
 * effect is deliberately plain — no character-by-character scramble, no blur,
 * no rotation beyond a degree and a half. Expensive motion is slow and simple;
 * per-letter animation is the tell of a template.
 *
 * Three things about the implementation matter:
 *
 * 1. **It waits for fonts.** Lines are split by measuring where the browser
 *    broke them, so splitting against Times and then swapping in Fraunces
 *    leaves a mask clipping a word that has since moved to the next line.
 *    `fontsReady()` is not optional.
 * 2. **The element is hidden synchronously, in the layout phase.** `useGSAP`
 *    runs before paint, so the from-state is applied without a flash of the
 *    unsplit heading — but only because `gsap.set` is called outside the
 *    promise. Move it inside and it flashes.
 * 3. **It reverts.** `SplitText` rewrites the DOM into per-line wrappers.
 *    Without the revert on cleanup, a client-side navigation back to the page
 *    re-splits text that is already split, and the second pass nests.
 */
export function SplitReveal({
  children,
  as: Tag = "h2",
  className,
  delay = 0,
  stagger = 0.085,
  start = "top 84%",
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      // Reduced motion gets the headline, immediately, with no split at all.
      if (prefersReducedMotion()) return;

      gsap.set(el, { autoAlpha: 0 });

      let split: SplitText | undefined;
      let cancelled = false;

      void fontsReady().then(() => {
        if (cancelled || !ref.current) return;

        split = SplitText.create(el, { type: "lines", mask: "lines" });
        gsap.set(el, { autoAlpha: 1 });

        gsap.from(split.lines, {
          yPercent: 120,
          // A degree and a half. Enough that the line reads as a physical
          // object settling rather than as a value being interpolated.
          rotate: 1.4,
          duration: 1.2,
          ease: "power4.out",
          stagger,
          delay,
          scrollTrigger: { trigger: el, start, once: true },
        });
      });

      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
