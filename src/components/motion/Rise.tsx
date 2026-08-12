"use client";

import { useRef, type ElementType } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";

type RiseProps = {
  children: React.ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds before it starts. */
  delay?: number;
  /** Pixels travelled. Keep small — this is a settle, not an entrance. */
  distance?: number;
  /**
   * Animate direct children in sequence instead of the wrapper as a whole.
   * Use on grids and lists; never on a block of prose, which then reveals
   * paragraph by paragraph and reads as a slideshow.
   */
  stagger?: number;
  start?: string;
};

/**
 * The workhorse scroll reveal: fade up and settle, once, never re-triggered
 * on the way back up.
 *
 * This replaces the Framer `Reveal` for everything on the redesigned home
 * page. Not because Framer could not do it, but because the page now has
 * pinned sections and scrubbed parallax that are already ScrollTrigger's
 * problem — running half the reveals through a second scroll observer means
 * two systems disagreeing about where the viewport is during momentum scroll.
 */
export function Rise({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  distance = 26,
  stagger,
  start = "top 86%",
}: RiseProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      const targets = stagger ? Array.from(el.children) : el;
      if (Array.isArray(targets) && targets.length === 0) return;

      gsap.from(targets, {
        y: distance,
        autoAlpha: 0,
        duration: 1,
        delay,
        stagger: stagger ?? 0,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start, once: true },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
