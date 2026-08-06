"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DUR_ROUTE, EASE } from "@/lib/motion";

/**
 * 240ms crossfade between routes. Opacity only — no transform — so it costs
 * nothing on reduced motion beyond a shorter duration, and never introduces
 * layout shift during navigation.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0.1 : DUR_ROUTE, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
