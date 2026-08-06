"use client";

import Link from "next/link";
import { useRef, useState, type ComponentProps } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { microTransition } from "@/lib/motion";

export type ButtonVariant =
  "primary" | "secondary" | "ghost" | "moto" | "onDark";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  // Muga gold on near-black: the only large gold fill on the site.
  primary:
    "bg-muga-gold text-muga-gold-on hover:bg-muga-gold-hover border border-transparent",
  secondary:
    "bg-transparent text-ink border border-[var(--ink-hairline-strong)] hover:border-ink hover:bg-[rgb(20_32_27/0.04)]",
  ghost:
    "bg-transparent text-ink border border-transparent hover:bg-[rgb(20_32_27/0.06)]",
  // Motorcycle tours and anything urgent.
  moto: "bg-naga-red text-paper hover:bg-naga-red-hover border border-transparent",
  onDark:
    "bg-paper text-ink border border-transparent hover:bg-[color-mix(in_srgb,var(--paper)_88%,var(--muga-gold))]",
};

const SIZE: Record<ButtonSize, string> = {
  // 44px minimum tap target at every size — mobile is the primary surface.
  sm: "min-h-11 px-4 text-14",
  md: "min-h-12 px-6 text-16",
  lg: "min-h-14 px-8 text-18",
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
 * Magnetic pull, capped at 4px, desktop pointer only. Touch never triggers it
 * (there is no hover to trigger from) and reduced motion switches it off
 * entirely rather than shortening it.
 */
function useMagnetic(enabled: boolean) {
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
            x: Math.max(-4, Math.min(4, (dx / rect.width) * 8)),
            y: Math.max(-4, Math.min(4, (dy / rect.height) * 8)),
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
