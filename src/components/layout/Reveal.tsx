"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ElementType } from "react";
import {
  revealVariants,
  revealVariantsReduced,
  revealViewport,
} from "@/lib/motion";
import { cn } from "@/lib/cn";

type RevealProps = {
  children: React.ReactNode;
  /** Seconds. Use sparingly — no more than two animated things per viewport. */
  delay?: number;
  as?: ElementType;
  className?: string;
};

/**
 * The one scroll-reveal in the system: fade in and rise 24px, triggered at 15%
 * visibility, once only, never re-triggered on scroll up. Under reduced motion
 * the translate is dropped and only opacity remains.
 *
 * Everything that reveals on scroll goes through this. Nothing declares its own
 * `whileInView` — that is how a site ends up with six slightly different fades.
 */
export function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
}: RevealProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      data-motion="reveal"
      className={cn(className)}
      variants={reduced ? revealVariantsReduced : revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      transition={{ delay: reduced ? 0 : delay }}
    >
      {children}
    </MotionTag>
  );
}
