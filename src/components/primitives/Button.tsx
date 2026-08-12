"use client";

import Link from "next/link";
import { useRef, useState, type ComponentProps } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { microTransition } from "@/lib/motion";
import { ArrowGlyph } from "./ArrowGlyph";

/**
 * Buttons are full pills, and every one of them is quiet.
 *
 * The old set led with a large muga-gold fill. In this language the gold is a
 * signal rather than a surface: `primary` is ink — the calmest thing a
 * confident button can be — and `clay` exists for the one action per page
 * that genuinely wants warmth. A page with three gold buttons has no primary
 * action at all.
 */

export type ButtonVariant =
  "primary" | "clay" | "secondary" | "ghost" | "moto" | "onDark";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  // Warm ink on paper. The default, and it should stay the default.
  primary:
    "bg-ink text-paper border border-transparent hover:bg-[color-mix(in_srgb,var(--ink)_88%,var(--paper))]",
  // Muga silk. One per page, for the action that is actually the point.
  clay: "bg-clay text-clay-on border border-transparent hover:bg-clay-deep",
  // A hairline that fills in on hover rather than changing colour.
  secondary:
    "bg-transparent text-ink border border-[var(--ink-hairline-strong)] hover:border-ink hover:bg-[rgb(46_42_36/0.045)]",
  ghost:
    "bg-transparent text-ink border border-transparent hover:bg-[rgb(46_42_36/0.06)]",
  // Motorcycle tours and anything with a deadline on it.
  moto: "bg-ember text-paper border border-transparent hover:bg-ember-hover",
  onDark:
    "bg-paper text-ink border border-transparent hover:bg-[color-mix(in_srgb,var(--paper)_86%,var(--clay))]",
};

const SIZE: Record<ButtonSize, string> = {
  // 44px minimum tap target at every size — mobile is the primary surface.
  // Wider than the old set: a pill needs horizontal room, or the label ends
  // up jammed against the curve.
  sm: "min-h-11 px-5 text-14",
  md: "min-h-12 px-7 text-16",
  lg: "min-h-14 px-9 text-18",
};

const BASE = cn(
  "inline-flex items-center justify-center gap-2 select-none",
  "rounded-[var(--radius-control)] font-sans font-medium text-center",
  "transition-colors duration-[var(--dur-micro)] ease-brand",
  "disabled:pointer-events-none disabled:opacity-45",
);

type SurfaceProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Fills its container. Used inside the booking panel and mobile sheets. */
  block?: boolean;
};

function surface({ variant = "primary", size = "md", block }: SurfaceProps) {
  return cn(BASE, VARIANT[variant], SIZE[size], block && "w-full");
}

/**
 * Magnetic pull, capped at `limit` px, desktop pointer only. Touch never
 * triggers it (there is no hover to trigger from) and reduced motion switches
 * it off entirely rather than shortening it.
 *
 * Exported because the header's menu and CTA plates use the same pull — the
 * cap is the whole character of the effect, and two implementations of it
 * would drift apart.
 */
export function useMagnetic(enabled: boolean, limit = 4) {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handlers = enabled
    ? {
        onPointerMove: (event: React.PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          const el = ref.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const dx = event.clientX - (rect.left + rect.width / 2);
          const dy = event.clientY - (rect.top + rect.height / 2);
          setOffset({
            x: Math.max(-limit, Math.min(limit, (dx / rect.width) * limit * 2)),
            y: Math.max(
              -limit,
              Math.min(limit, (dy / rect.height) * limit * 2),
            ),
          });
        },
        onPointerLeave: () => setOffset({ x: 0, y: 0 }),
      }
    : {};

  return { ref, offset: enabled ? offset : { x: 0, y: 0 }, handlers };
}

export type ButtonProps = SurfaceProps & HTMLMotionProps<"button">;

export function Button({
  variant,
  size,
  block,
  className,
  children,
  ...props
}: ButtonProps) {
  const reduced = useReducedMotion();
  const { ref, offset, handlers } = useMagnetic(!reduced);

  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      data-motion="magnetic"
      className={cn(surface({ variant, size, block }), className)}
      animate={offset}
      transition={microTransition}
      {...handlers}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Created once at module scope. Building it inside the component would make a
// new component type on every render and remount the link.
const MotionLink = motion.create(Link);

export type ButtonLinkProps = SurfaceProps &
  ComponentProps<typeof MotionLink> & {
    href: ComponentProps<typeof Link>["href"];
  };

/** Same surface as `Button`, rendered as a link. Use for navigation. */
export function ButtonLink({
  variant,
  size,
  block,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  const reduced = useReducedMotion();
  const { ref, offset, handlers } = useMagnetic(!reduced);

  return (
    <MotionLink
      ref={ref as React.Ref<HTMLAnchorElement>}
      data-motion="magnetic"
      className={cn(surface({ variant, size, block }), className)}
      animate={offset}
      transition={microTransition}
      {...handlers}
      {...props}
    >
      {children}
    </MotionLink>
  );
}

/**
 * A text link that reads as an action: the label, and a rule that draws
 * itself in from the left on hover. This replaces the permanent underline the
 * old system used on every index link — thirty standing underlines is thirty
 * lines of visual noise in a design whose argument is empty space.
 *
 * The rule is a `scaleX` on a child rather than a `text-decoration`
 * transition: text-decoration cannot be animated, and a border-bottom cannot
 * be made to grow from one end.
 */
export function TextLink({
  href,
  children,
  tone = "ink",
  className,
  ...props
}: {
  href: ComponentProps<typeof Link>["href"];
  children: React.ReactNode;
  tone?: "ink" | "onDark";
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link
      href={href}
      className={cn(
        "group/link inline-flex min-h-11 items-center gap-2.5 text-16",
        tone === "onDark" ? "text-night-text" : "text-ink",
        className,
      )}
      {...props}
    >
      <span className="relative">
        {children}
        <span
          aria-hidden="true"
          className={cn(
            "absolute -bottom-0.5 left-0 block h-px w-full origin-right scale-x-0",
            "transition-transform duration-[var(--dur-micro)] ease-brand",
            "group-hover/link:origin-left group-hover/link:scale-x-100",
            "group-focus-visible/link:origin-left group-focus-visible/link:scale-x-100",
            tone === "onDark" ? "bg-night-text" : "bg-ink",
          )}
        />
      </span>
      <ArrowGlyph className="transition-transform duration-[var(--dur-micro)] ease-brand motion-safe:group-hover/link:translate-x-1" />
    </Link>
  );
}

/**
 * The one arrow in the system now lives in its own module so server
 * components can draw it without pulling Framer Motion in with it. Re-exported
 * here because thirty call sites already import it from this file.
 */
export { ArrowGlyph } from "./ArrowGlyph";
