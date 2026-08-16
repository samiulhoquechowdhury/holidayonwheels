import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { ArrowGlyph } from "./ArrowGlyph";

/**
 * Buttons are full pills, and every one of them is quiet.
 *
 * The gold is a signal rather than a surface: `primary` is ink — the calmest
 * thing a confident button can be — and `clay` exists for the one action per
 * page that genuinely wants warmth. A page with three gold buttons has no
 * primary action at all.
 *
 * **Nothing here is magnetic.** These used to chase the cursor by up to 4px.
 * A control that moves while you aim at it is a control you miss, and on a
 * booking flow that is a real cost for a trick that stops reading as
 * expensive after the second visit. The pull is gone from the buttons and
 * from the header, and it should not come back.
 *
 * What replaced it is the same fill the `LuxeButton` uses: a pseudo-element
 * that rises from the bottom edge on hover (`.u-fill` in globals.css). It
 * stays inside the control's own bounds, it runs on the compositor, and it is
 * the one hover vocabulary shared by every control on the site.
 *
 * No client JavaScript at all now — this was a Framer Motion component purely
 * to drive the magnetism, and dropping it takes the animation library off the
 * critical path of every page that renders a button.
 */

export type ButtonVariant =
  "primary" | "clay" | "secondary" | "ghost" | "moto" | "onDark";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Each variant declares the resting surface, the colour the fill rises in
 * (`after:`), and the label colour once it has risen.
 */
const VARIANT: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-ink text-paper border-transparent",
    "after:bg-clay hover:text-clay-on focus-visible:text-clay-on",
  ),
  clay: cn(
    "bg-clay text-clay-on border-transparent",
    "after:bg-ink hover:text-paper focus-visible:text-paper",
  ),
  secondary: cn(
    "bg-transparent text-ink border-[var(--ink-hairline-strong)]",
    "after:bg-ink hover:border-ink hover:text-paper",
    "focus-visible:border-ink focus-visible:text-paper",
  ),
  ghost: cn(
    "bg-transparent text-ink border-transparent",
    "after:bg-[rgb(46_42_36/0.07)]",
  ),
  // Motorcycle tours and anything with a deadline on it.
  moto: cn(
    "bg-ember text-paper border-transparent",
    "after:bg-ink hover:text-paper focus-visible:text-paper",
  ),
  onDark: cn(
    "bg-paper text-ink border-transparent",
    "after:bg-clay hover:text-clay-on focus-visible:text-clay-on",
  ),
};

const SIZE: Record<ButtonSize, string> = {
  // 44px minimum tap target at every size — mobile is the primary surface.
  // Wider than a square button needs: a pill needs horizontal room, or the
  // label ends up jammed against the curve.
  sm: "min-h-11 px-5 text-14",
  md: "min-h-12 px-7 text-16",
  lg: "min-h-14 px-9 text-18",
};

const BASE = cn(
  "group/btn relative isolate inline-flex select-none items-center justify-center gap-2",
  "u-fill overflow-hidden rounded-[var(--radius-control)] border text-center",
  "font-sans font-medium transition-[color,border-color] duration-[var(--dur)] ease-brand",
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

export type ButtonProps = SurfaceProps & ComponentProps<"button">;

export function Button({
  variant,
  size,
  block,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(surface({ variant, size, block }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

export type ButtonLinkProps = SurfaceProps &
  Omit<ComponentProps<typeof Link>, "className"> & {
    className?: string;
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
  return (
    <Link
      className={cn(surface({ variant, size, block }), className)}
      {...props}
    >
      {children}
    </Link>
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
 * The one arrow in the system lives in its own module so server components
 * can draw it without pulling an animation library in with it. Re-exported
 * here because thirty call sites already import it from this file.
 */
export { ArrowGlyph } from "./ArrowGlyph";
