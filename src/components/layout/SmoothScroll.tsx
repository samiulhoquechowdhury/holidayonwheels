"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Lenis smooth scroll, driven by GSAP's ticker.
 *
 * Two things share the scroll position on this site: Lenis interpolates it,
 * and ScrollTrigger reads it. Left alone they run on separate rAF loops and
 * disagree by a frame, which shows up as pinned sections trailing the content
 * around them by a few pixels — the classic "smooth scroll makes my parallax
 * jitter" bug. The fix is to have exactly one loop: GSAP's ticker advances
 * Lenis, Lenis tells ScrollTrigger it moved, and lag smoothing is off so the
 * ticker never batches two frames into one and skips the interpolation.
 *
 * No scroll-jacking: the wheel still maps 1:1 to distance, only the
 * interpolation is softened. Under `prefers-reduced-motion: reduce` Lenis is
 * never instantiated — the browser's native scrolling is untouched and
 * ScrollTrigger falls back to reading the real scroll position.
 *
 * Rendered once from the root layout. Renders nothing.
 */
export function SmoothScroll() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (query.matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Touch devices keep their native momentum — it is better than ours.
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", ScrollTrigger.update);

    // GSAP's ticker reports seconds; Lenis wants milliseconds.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return null;
}
