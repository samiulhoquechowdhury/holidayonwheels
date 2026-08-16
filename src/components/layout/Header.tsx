"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { Logo } from "./Logo";
import { MenuDrawer } from "./MenuDrawer";
import { primaryNav } from "@/config/nav";
import { cn } from "@/lib/cn";
import { EASE } from "@/lib/motion";

/**
 * Scrolled sizing, applied to the header element only. Reassigning the two
 * tokens locally means every `top: var(--header-h)` offset elsewhere in the
 * app still resolves against the resting height, so nothing on the page moves
 * when the bar tightens.
 */
const TIGHT_BAR = {
  "--plate-h": "var(--plate-h-tight)",
  "--header-pad": "var(--header-pad-tight)",
} as React.CSSProperties;

/**
 * Site header: one slim paper bar, opaque from the first pixel.
 *
 * The previous version floated three white pills over the page, which solved
 * a real problem — a transparent header cannot put dark navigation over a
 * dark hero — by turning the header into an object. This one solves the same
 * problem by refusing the transparency instead. An opaque bar of the same
 * paper as the rest of the site never has to change colour, never flashes a
 * mid-state, and gets out of the way, which is what the rest of this design
 * is trying to do.
 *
 * Two things respond to the pointer:
 *  - one hairline slides between nav items, springing rather than fading, so
 *    the eye follows a single object instead of watching six labels change;
 *  - each label rolls its own duplicate up from underneath.
 *
 * The trip and menu controls used to take a 3px magnetic pull as well. It is
 * gone deliberately: a control that moves as you aim at it is a control you
 * miss, and the effect stops reading as expensive almost immediately.
 *
 * And two respond to scroll: the bar tightens past 24px, and it lifts away
 * when you scroll down past the first screen, returning the moment you scroll
 * back up. Both stand down under reduced motion.
 */
export function Header() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const [tight, setTight] = useState(false);
  const [lifted, setLifted] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Close on navigation.
  useEffect(() => setOpen(false), [pathname]);

  const { scrollY } = useScroll();
  const lastY = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    setTight(y > 24);

    const delta = y - lastY.current;
    // 6px of slack. Without it, momentum scrolling on a trackpad flips the
    // direction every few frames and the bar flickers.
    if (Math.abs(delta) < 6) return;
    lastY.current = y;
    // Never lift while the drawer is up: the toggle that closes it lives here.
    setLifted(!open && y > 400 && delta > 0);
  });

  // Reopening the drawer must always bring the header back with it.
  useEffect(() => {
    if (open) setLifted(false);
  }, [open]);

  return (
    <>
      <motion.header
        data-motion="header"
        data-tight={tight ? "" : undefined}
        animate={{ y: lifted && !reduced ? "-120%" : "0%" }}
        transition={{ duration: 0.45, ease: EASE }}
        style={tight ? TIGHT_BAR : undefined}
        className={cn(
          "fixed inset-x-0 top-0 z-50 bg-paper",
          // The hairline is the only edge the bar has, and it appears only
          // once you have scrolled. At rest the bar and the page are one
          // surface, and a line across the top would be drawing a box around
          // nothing.
          "border-b transition-colors duration-[var(--dur)] ease-brand",
          tight ? "border-b-[var(--ink-hairline)]" : "border-b-transparent",
        )}
      >
        {/*
         * `1fr auto 1fr` centres the nav against the viewport rather than
         * against the space left over by the logo, so it stays put as the
         * mark or the menu label changes width. No transform involved, which
         * keeps it honest under reduced motion.
         */}
        <div className="u-container grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-[var(--header-pad)] transition-[padding] duration-[var(--dur)] ease-brand">
          <Logo className="justify-self-start" />

          <PrimaryNav pathname={pathname} reduced={Boolean(reduced)} />

          <div className="flex items-center gap-2 justify-self-end md:gap-3">
            <PlanTrip />
            <StairToggle
              ref={toggleRef}
              open={open}
              onClick={() => setOpen((v) => !v)}
            />
          </div>
        </div>
      </motion.header>

      {/*
       * Outside the header, not inside it. The header animates on `y`, and a
       * transformed ancestor becomes the containing block for `position:
       * fixed` descendants — nested, the drawer would be trapped inside the
       * 80px header box instead of spanning the viewport.
       */}
      <MenuDrawer open={open} onClose={close} returnFocusTo={toggleRef} />
    </>
  );
}

/**
 * The centre navigation.
 *
 * Shown from `xl`, not `lg`. Six labels — one of them "Motorcycle tours" —
 * plus the mark, the trip button and the menu measure about 980px, and the
 * content column at 1024px is 864px wide. It fitted in the old header only
 * because that one floated over the page and was allowed to overrun it.
 * Between `lg` and `xl` the drawer carries the navigation, as it does on
 * mobile.
 *
 * One hairline, moved between items with a shared `layoutId`, is deliberately
 * not six independently fading underlines: a single travelling object reads
 * as the cursor being tracked, where six crossfades read as noise. It rests
 * under the current page and follows the pointer while there is one.
 */
function PrimaryNav({
  pathname,
  reduced,
}: {
  pathname: string;
  reduced: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const current =
    primaryNav.find((link) => pathname.startsWith(link.href))?.href ?? null;
  const marked = hovered ?? current;

  return (
    <nav aria-label="Primary" className="hidden justify-self-center xl:block">
      <ul
        onPointerLeave={() => setHovered(null)}
        className="flex items-center gap-1"
      >
        {primaryNav.map((link) => {
          const active = current === link.href;
          return (
            <li key={link.href} className="relative">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                onPointerEnter={() => setHovered(link.href)}
                onFocus={() => setHovered(link.href)}
                className={cn(
                  "group relative inline-flex h-10 items-center overflow-hidden px-3.5 text-14 whitespace-nowrap",
                  "transition-colors duration-[var(--dur-micro)] ease-brand",
                  active ? "text-ink" : "text-ink-soft hover:text-ink",
                )}
              >
                <RollingLabel>{link.label}</RollingLabel>
              </Link>

              {marked === link.href ? (
                <motion.span
                  aria-hidden="true"
                  // Only the travelling rule carries the layoutId. Under
                  // reduced motion it still moves — it just arrives instantly,
                  // which is the honest version of the same feedback.
                  layoutId="nav-rule"
                  data-motion="nav-rule"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 40 }
                  }
                  className={cn(
                    "pointer-events-none absolute inset-x-3.5 bottom-1 block h-px",
                    active ? "bg-ink" : "bg-[var(--ink-hairline-strong)]",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * A label that rolls its own duplicate up from underneath on hover.
 *
 * `motion-safe:` rather than a global transition, because the resting state of
 * the understudy is itself a transform — under reduced motion it has to stay
 * parked below the clip, not be reset to `none` on top of the original.
 */
function RollingLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative block overflow-hidden py-0.5">
      <span className="block transition-transform duration-[var(--dur-micro)] ease-brand motion-safe:group-hover:-translate-y-[130%]">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 block translate-y-[130%] transition-transform duration-[var(--dur-micro)] ease-brand motion-safe:group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}

/**
 * The one conversion action in the header, and the only clay fill above the
 * fold. Hidden below `md`, where the drawer's own "Plan a trip" button covers
 * it and the bar has no room for it.
 */
function PlanTrip() {
  return (
    <div className="hidden md:block">
      <Link
        href="/tours"
        className={cn(
          "group inline-flex h-[var(--plate-h)] items-center gap-2.5 rounded-[var(--radius-control)] px-6",
          "bg-clay text-14 font-medium whitespace-nowrap text-clay-on",
          "transition-[height,background-color] duration-[var(--dur-micro)] ease-brand hover:bg-clay-deep",
        )}
      >
        Plan a trip
        {/* Nudges on hover and stops. No loop — nothing on this site animates
            without being asked to. */}
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 16 10"
          className="h-2.5 w-4 shrink-0 transition-transform duration-[var(--dur-micro)] ease-brand motion-safe:group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M0.5 5h14M10.5 1l4 4-4 4" />
        </svg>
      </Link>
    </div>
  );
}

/**
 * The stair glyph: three right-aligned rules stepping down. On hover they
 * level out to full width, one after another; open, they fold into a cross.
 *
 * The stagger is `transition-delay`, not a keyframe sequence, so the rules
 * unwind in reverse when the pointer leaves rather than snapping back.
 */
function StairToggle({
  open,
  onClick,
  ref,
}: {
  open: boolean;
  onClick: () => void;
  ref: React.Ref<HTMLButtonElement>;
}) {
  return (
    <div>
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className={cn(
          "group inline-flex h-[var(--plate-h)] shrink-0 items-center gap-3 rounded-[var(--radius-control)] px-4 text-ink md:px-5",
          "border border-[var(--ink-hairline)] transition-[height,border-color,background-color] duration-[var(--dur-micro)] ease-brand",
          "hover:border-[var(--ink-hairline-strong)] hover:bg-[rgb(46_42_36/0.035)]",
        )}
      >
        <span className="u-label hidden overflow-hidden sm:block">
          <RollingLabel>{open ? "Close" : "Menu"}</RollingLabel>
        </span>

        <span
          aria-hidden="true"
          className="relative flex h-3 w-5 flex-col items-end justify-between"
        >
          <span
            className={cn(
              "h-px bg-current transition-all duration-[var(--dur-micro)] ease-brand",
              open
                ? "absolute top-1/2 w-full translate-y-[-0.5px] rotate-45"
                : "w-full",
            )}
          />
          <span
            className={cn(
              "h-px bg-current transition-all delay-[40ms] duration-[var(--dur-micro)] ease-brand",
              open
                ? "w-full scale-x-0 opacity-0"
                : "w-[65%] group-hover:w-full",
            )}
          />
          <span
            className={cn(
              "h-px bg-current transition-all delay-[80ms] duration-[var(--dur-micro)] ease-brand",
              open
                ? "absolute top-1/2 w-full translate-y-[-0.5px] -rotate-45"
                : "w-[35%] group-hover:w-full",
            )}
          />
        </span>
      </button>
    </div>
  );
}
