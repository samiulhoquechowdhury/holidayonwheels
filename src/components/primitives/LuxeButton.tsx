import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { ArrowGlyph } from "./ArrowGlyph";

/**
 * The luxury control.
 *
 * Explicitly **not magnetic**. A control that chases the cursor is a trick
 * that reads as expensive for about two visits and as a gimmick after that,
 * and it is actively hostile on a booking flow — a target that moves while
 * you aim at it is a target you miss. Everything here happens *inside* the
 * button's own bounds, which is the difference between a control with
 * presence and a control showing off.
 *
 * Four things move, all on the same 700ms curve, none of them a colour fade:
 *
 *  1. a fill rises from the bottom edge (`.u-fill`, a scaled pseudo-element,
 *     so it stays on the compositor);
 *  2. the label rolls up and a second copy of it arrives from below;
 *  3. the arrow travels its own chip, leaves the right edge and re-enters
 *     from the left — a loop rather than a nudge;
 *  4. the chip itself inverts against the fill.
 *
 * They are staged, not simultaneous: the fill leads and the label follows it
 * up. Simultaneous is what "animated" looks like; staged is what "considered"
 * looks like.
 *
 * Server component. There is no JavaScript in this button at all — every one
 * of those four is a CSS transition on a hover or focus-visible state, which
 * also means the whole thing works before hydration and under `prefers-
 * reduced-motion` degrades to the fill alone.
 */

export type LuxeVariant = "primary" | "ghost" | "onDark" | "clay";
export type LuxeSize = "md" | "lg";

/**
 * Each variant declares three things: the resting surface, the colour the
 * fill rises in, and the label colour once it has risen. The fill is a
 * pseudo-element behind the content (`-z-10` against the button's own
 * `isolate`), which is why every variant needs `relative isolate`.
 */
const VARIANT: Record<LuxeVariant, string> = {
  // Ink on paper, filling clay. The default and the one that should stay it.
  primary: cn(
    "bg-ink text-paper border-transparent",
    "after:bg-clay hover:text-clay-on focus-visible:text-clay-on",
  ),
  // A hairline on paper, filling ink. For the second action in a pair.
  ghost: cn(
    "bg-transparent text-ink border-[var(--ink-hairline-strong)]",
    "after:bg-ink hover:text-paper hover:border-ink",
    "focus-visible:text-paper focus-visible:border-ink",
  ),
  // Paper on the dark band, filling clay.
  onDark: cn(
    "bg-paper text-ink border-transparent",
    "after:bg-clay hover:text-clay-on focus-visible:text-clay-on",
  ),
  // Muga silk. One per page, for the action that is actually the point.
  clay: cn(
    "bg-clay text-clay-on border-transparent",
    "after:bg-ink hover:text-paper focus-visible:text-paper",
  ),
};

/**
 * Asymmetric padding: generous on the label side, tight on the chip side, so
 * the circle sits inset by the same optical margin it has above and below.
 * Symmetric padding around a pill containing a circle always looks wrong on
 * the right.
 */
const SIZE: Record<LuxeSize, string> = {
  md: "min-h-13 py-1.5 pl-7 pr-1.5 text-16 gap-5",
  lg: "min-h-16 py-2 pl-9 pr-2 text-18 gap-7",
};

const CHIP_SIZE: Record<LuxeSize, string> = {
  md: "size-10",
  lg: "size-12",
};

const CHIP_TONE: Record<LuxeVariant, string> = {
  primary:
    "bg-paper text-ink group-hover/roll:bg-ink group-hover/roll:text-clay",
  ghost:
    "bg-ink text-paper group-hover/roll:bg-paper group-hover/roll:text-ink",
  onDark:
    "bg-ink text-paper group-hover/roll:bg-ink group-hover/roll:text-clay",
  clay: "bg-ink text-paper group-hover/roll:bg-paper group-hover/roll:text-ink",
};

const BASE = cn(
  "group/roll relative isolate inline-flex select-none items-center justify-between",
  "u-fill overflow-hidden rounded-[var(--radius-control)] border font-sans font-medium",
  "transition-[color,border-color] duration-[var(--dur)] ease-brand",
);

type LuxeProps = {
  children: React.ReactNode;
  variant?: LuxeVariant;
  size?: LuxeSize;
  /** Fills its container. Used inside panels and mobile sheets. */
  block?: boolean;
  className?: string;
};

/**
 * The two stacked copies of the label. The wrapper is exactly two lines tall
 * and translates by half of itself, so the outgoing and incoming copies are
 * always in register. The second copy is hidden from assistive tech.
 */
function RollingLabel({ children }: { children: React.ReactNode }) {
  return (
    // The clip is exactly one line tall. Without an explicit height it sizes
    // to both copies and the button shows the label twice, stacked — which is
    // the failure mode this pattern always has, and it is silent.
    <span className="relative block h-[1.5em] overflow-hidden">
      <span className="u-roll">
        <span className="flex h-[1.5em] items-center whitespace-nowrap">
          {children}
        </span>
        <span
          aria-hidden="true"
          className="flex h-[1.5em] items-center whitespace-nowrap"
        >
          {children}
        </span>
      </span>
    </span>
  );
}

/**
 * Which ancestor's hover drives the rail. Written out in full rather than
 * interpolated: Tailwind scans source text for complete class names, and a
 * template literal produces a class that exists in the DOM and not in the
 * stylesheet.
 */
const RAIL_HOVER = {
  /** Inside a LuxeButton — the button itself is `group/roll`. */
  roll: "motion-safe:group-hover/roll:translate-x-1/4 motion-safe:group-focus-visible/roll:translate-x-1/4",
  /** Inside a card — the whole card is the `group`. */
  card: "motion-safe:group-hover:translate-x-1/4",
} as const;

/**
 * The travelling arrow.
 *
 * Two glyphs on one rail inside a clipped circle. At rest the rail is pushed
 * left so the *second* arrow is the one centred; on hover it slides right,
 * carrying that arrow out of the clip and bringing the first one into the
 * centre it vacated. The result reads as one arrow travelling and looping
 * rather than as two arrows crossfading.
 *
 * This replaced a pair of independently-translated glyphs, one absolutely
 * positioned, offset by fixed pixel amounts. Those amounts only cleared a
 * 40px chip; at 48px both arrows sat inside the circle and the button
 * rendered a double-headed arrow. Sizing the rail as a *percentage of the
 * chip* makes the geometry correct at any size by construction.
 */
function TravellingArrow({
  scope = "roll",
}: {
  scope?: keyof typeof RAIL_HOVER;
}) {
  return (
    <span
      className={cn(
        // The rail is exactly twice the chip and holds two half-width slots,
        // so one arrow is always outside the circle whatever size the chip
        // is. Fixed pixel offsets were the previous attempt and they only
        // cleared a 40px chip — at 48px both arrows sat inside it and the
        // button rendered a double-headed arrow.
        "flex w-[200%] -translate-x-1/4 transition-transform duration-[var(--dur)] ease-brand",
        RAIL_HOVER[scope],
      )}
    >
      <span className="grid w-1/2 shrink-0 place-items-center">
        <ArrowGlyph />
      </span>
      <span className="grid w-1/2 shrink-0 place-items-center">
        <ArrowGlyph />
      </span>
    </span>
  );
}

/** The circle the arrow travels inside. Clips it — that is its whole job. */
function ArrowChip({
  size,
  variant,
}: {
  size: LuxeSize;
  variant: LuxeVariant;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full",
        "transition-colors duration-[var(--dur)] ease-brand",
        CHIP_SIZE[size],
        CHIP_TONE[variant],
      )}
    >
      <TravellingArrow />
    </span>
  );
}

export type LuxeButtonLinkProps = LuxeProps &
  Omit<ComponentProps<typeof Link>, "className" | "children">;

/** Navigation. The form used almost everywhere on the home page. */
export function LuxeButtonLink({
  children,
  variant = "primary",
  size = "md",
  block,
  className,
  ...props
}: LuxeButtonLinkProps) {
  return (
    <Link
      className={cn(
        BASE,
        VARIANT[variant],
        SIZE[size],
        block && "w-full",
        className,
      )}
      {...props}
    >
      <RollingLabel>{children}</RollingLabel>
      <ArrowChip size={size} variant={variant} />
    </Link>
  );
}

export type LuxeButtonProps = LuxeProps &
  Omit<ComponentProps<"button">, "className" | "children">;

/** Same surface, rendered as a button. Use for actions, not navigation. */
export function LuxeButton({
  children,
  variant = "primary",
  size = "md",
  block,
  className,
  ...props
}: LuxeButtonProps) {
  return (
    <button
      className={cn(
        BASE,
        VARIANT[variant],
        SIZE[size],
        block && "w-full",
        "disabled:pointer-events-none disabled:opacity-45",
        className,
      )}
      {...props}
    >
      <RollingLabel>{children}</RollingLabel>
      <ArrowChip size={size} variant={variant} />
    </button>
  );
}

/**
 * A bare circular arrow, for the corner of a card or the end of a rail.
 *
 * The same loop as the chip above without the label beside it. Cards use it
 * as the affordance that says the whole tile is a link — it is not itself
 * interactive when it sits inside one, hence `aria-hidden` and no tab stop.
 */
export function ArrowButton({
  tone = "ink",
  className,
}: {
  tone?: "ink" | "paper" | "glass";
  className?: string;
}) {
  const TONE = {
    ink: "bg-ink text-paper",
    paper: "bg-paper text-ink",
    glass: "u-glass text-ink",
  } as const;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-12 shrink-0 place-items-center overflow-hidden rounded-full",
        "transition-transform duration-[var(--dur)] ease-brand",
        "motion-safe:group-hover:scale-105",
        TONE[tone],
        className,
      )}
    >
      {/* Same rail as the button chip, driven by the card's `group` instead
          of the button's `group/roll`. */}
      <TravellingArrow scope="card" />
    </span>
  );
}
