"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/**
 * The single place GSAP is configured. Every component imports `gsap` from
 * here rather than from the package, so plugin registration cannot be
 * forgotten in one file and silently no-op in production.
 *
 * `registerPlugin` is idempotent and cheap, but it must not run during SSR —
 * ScrollTrigger touches `window` on registration. The module is `"use client"`
 * and the call is guarded, so importing it from a server component fails loudly
 * rather than at hydration.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

  /**
   * One global default, matching `--ease` and `--dur` in tokens.css. Any
   * timeline that wants something else states it — that way the exceptions are
   * visible in the diff instead of being the norm.
   */
  gsap.defaults({ ease: "power3.out", duration: 0.9 });

  /**
   * Mobile browsers resize the viewport as the URL bar collapses, which
   * re-fires every ScrollTrigger's start/end calculation mid-scroll and makes
   * pinned sections jump. Ignoring resize events that only change height on
   * touch is the documented fix.
   */
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** Mirrors `--ease` (cubic-bezier(.16,1,.3,1)) for timelines that need it. */
export const EASE_BRAND = "power3.out";

/**
 * Split-and-mask is used by four different components and gets the line
 * breaks wrong in all of them if it runs before the webfonts are swapped in:
 * Fraunces and the fallback have different metrics, so lines split against
 * Times break in different places than lines split against Fraunces, and the
 * mask ends up clipping a word that has moved to the next line.
 *
 * Everything that splits text awaits this first.
 */
export function fontsReady(): Promise<unknown> {
  if (typeof document === "undefined") return Promise.resolve();
  return document.fonts?.ready ?? Promise.resolve();
}

/** True when the visitor has asked for less movement. Checked at call time. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
