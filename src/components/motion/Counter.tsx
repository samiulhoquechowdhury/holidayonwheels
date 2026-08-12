"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";

type CounterProps = {
  to: number;
  /** Rendered after the figure, in the same size. e.g. "+", "%", "k". */
  suffix?: string;
  prefix?: string;
  /** Decimal places. Kept at 0 unless the figure genuinely has them. */
  decimals?: number;
  className?: string;
};

/**
 * A figure that counts up once, when it comes into view.
 *
 * The psychological job is specific: a static "1,400" is a claim, and a
 * number that arrives at 1,400 in front of you is evidence being tallied. It
 * is worth doing for four figures on a page and worth nothing for forty.
 *
 * Server-rendered at its final value, so the number is correct in the HTML
 * for search engines, for reduced motion, and for the moment before hydration.
 * The count is applied on top of a value that is already right — never a zero
 * that JavaScript is responsible for fixing.
 */
export function Counter({
  to,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;

      const state = { value: 0 };
      const format = (n: number) =>
        n.toLocaleString("en-IN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });

      gsap.to(state, {
        value: to,
        duration: 2,
        ease: "power2.out",
        // Snapping to whole steps stops the last frames flickering through
        // sub-pixel decimals on a figure that is supposed to read as counted.
        snap: decimals === 0 ? { value: 1 } : undefined,
        onUpdate: () => {
          el.textContent = format(state.value);
        },
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    },
    { scope: ref, dependencies: [to, decimals] },
  );

  return (
    <span className={cn("u-num", className)}>
      {prefix}
      <span ref={ref}>
        {to.toLocaleString("en-IN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
      </span>
      {suffix}
    </span>
  );
}
