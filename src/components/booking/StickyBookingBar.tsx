"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { formatINR } from "@/lib/currency";
import { Button } from "@/components/primitives/Button";
import { stickySpring } from "@/lib/motion";

/**
 * The persistent price and CTA bar. Springs in once the primary booking panel
 * has scrolled out of view, and springs out when it comes back — so the
 * traveller never has to scroll to find the price.
 *
 * Mobile-only by default: on desktop the sticky panel is already visible in
 * the sidebar, and two simultaneous CTAs is one too many.
 */
export function StickyBookingBar({
  label,
  amount,
  amountLabel,
  ctaLabel,
  onCta,
  disabled = false,
  /** Element whose visibility governs the bar. */
  watchId,
}: {
  label: string;
  amount: number;
  amountLabel: string;
  ctaLabel: string;
  onCta: () => void;
  disabled?: boolean;
  watchId: string;
}) {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const target = document.getElementById(watchId);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [watchId]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          data-motion="sticky-bar"
          initial={reduced ? { opacity: 0 } : { y: "100%" }}
          animate={reduced ? { opacity: 1 } : { y: 0 }}
          exit={reduced ? { opacity: 0 } : { y: "100%" }}
          transition={reduced ? { duration: 0.2 } : stickySpring}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ink-hairline)] bg-paper lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="u-container flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="u-mono truncate text-ink-soft">{label}</p>
              <p className="mt-0.5 font-mono text-18 tabular-nums">
                {formatINR(amount)}
              </p>
              <p className="u-sr-only">{amountLabel}</p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={onCta}
              disabled={disabled}
              className="shrink-0"
            >
              {ctaLabel}
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
