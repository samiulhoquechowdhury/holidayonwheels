import type { Transition, Variants } from "framer-motion";

/**
 * Motion constants, mirrored from tokens.css so JS and CSS never drift.
 * The rule this file exists to protect: at most two animated elements per
 * viewport, one easing curve, three durations.
 */

export const EASE = [0.16, 1, 0.3, 1] as const;
export const DUR = 0.6;
export const DUR_MICRO = 0.2;
export const DUR_IMAGE = 0.7;
export const DUR_ROUTE = 0.24;

export const transition: Transition = { duration: DUR, ease: EASE };
export const microTransition: Transition = { duration: DUR_MICRO, ease: EASE };

/** Sticky booking bar. Spec'd spring, used nowhere else. */
export const stickySpring: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 30,
};

/** Section reveal: fade up, once only, never re-triggered on scroll up. */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition },
};

/** Reduced-motion equivalent: opacity only, no transform. */
export const revealVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DUR_MICRO } },
};

/*
 * The hero headline reveal lives in CSS (`.u-hero-line` in globals.css), not
 * here. A Framer variant cannot run until hydration, which pushes the largest
 * text paint past the LCP budget — see the note in globals.css.
 */

/** Shared viewport config for reveals — 15% visibility, fires once. */
export const revealViewport = { once: true, amount: 0.15 } as const;
