"use client";

import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";
import { primaryNav, secondaryNav, legalNav } from "@/config/nav";
import { ButtonLink } from "@/components/primitives/Button";
import { OutboundLink } from "@/components/primitives/OutboundLink";
import { BEEPDRIVE_URL } from "@/config/external";
import { site } from "@/config/site";
import { EASE, DUR_MICRO } from "@/lib/motion";

/** Everything focusable inside the panel, in document order. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The full menu, opened by the stair button in the header.
 *
 * A white sheet over a dimmed page, with the navigation set large in the
 * display face. This is the only navigation on mobile, and the overflow menu
 * on desktop — the header's centre plate carries just the six primary links.
 *
 * Two animated elements, matching the motion budget: the panel slides and the
 * backdrop fades. The links themselves do not stagger.
 */
export function MenuDrawer({
  open,
  onClose,
  returnFocusTo,
}: {
  open: boolean;
  onClose: () => void;
  /** Focus goes back here on close, so the tab order is never lost. */
  returnFocusTo: RefObject<HTMLButtonElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        returnFocusTo.current?.focus();
        return;
      }

      // Trap: Tab cycles within the panel rather than escaping to the page
      // behind it, which is inert to sighted users but not to the keyboard.
      if (event.key !== "Tab") return;
      const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!items || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (
        event.shiftKey &&
        (active === first || !panelRef.current?.contains(active))
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);

    // The page behind must not scroll while the sheet is up.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus in, but to the panel itself rather than the first link, so a
    // screen reader hears the dialog label before the navigation.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, returnFocusTo]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          {/*
           * Click-outside-to-close, and nothing more. Hidden from assistive
           * tech and out of the tab order: the close button and Escape
           * already expose the same action, and a second "Close menu" in the
           * accessibility tree is just noise.
           */}
          <motion.button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR_MICRO, ease: EASE }}
            className="fixed inset-0 z-[60] cursor-default bg-[rgb(42_38_33/0.42)] backdrop-blur-[3px]"
          />

          <motion.div
            ref={panelRef}
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            tabIndex={-1}
            data-motion="drawer"
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{ boxShadow: "var(--shadow-drawer)" }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-[520px] flex-col overflow-y-auto bg-paper text-ink outline-none sm:rounded-l-[var(--radius-panel)]"
          >
            {/*
             * Closing on `pathname` alone is not enough: navigating to the
             * route you are already on does not change it, so the sheet would
             * sit there over the page you just asked for. One delegated
             * handler beats an onClick on every one of the ~18 links.
             */}
            <div
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a")) onClose();
              }}
              className="contents"
            >
              <div className="flex items-center justify-between gap-3 px-[var(--gutter)] py-[var(--header-pad)]">
                <Logo />
                <CloseButton onClick={onClose} />
              </div>

              <nav
                aria-label="All pages"
                className="flex flex-1 flex-col px-[var(--gutter)] pt-6 pb-10"
              >
                <ul className="flex flex-col">
                  {primaryNav.map((link, index) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex items-baseline gap-5 border-t border-[var(--ink-hairline)] py-4 sm:py-5"
                      >
                        <span
                          aria-hidden="true"
                          className="u-label w-7 shrink-0 pt-2 text-ink-faint"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="font-display text-28 leading-[var(--leading-display)] tracking-[var(--tracking-display)] text-ink transition-[opacity,transform] duration-[var(--dur-micro)] ease-brand group-hover:opacity-55 motion-safe:group-hover:translate-x-1.5 sm:text-36">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <ul className="mt-8 grid grid-cols-2 gap-x-6 border-t border-[var(--ink-hairline)] pt-6">
                  {secondaryNav.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex min-h-11 items-center text-16 text-ink-soft transition-colors duration-[var(--dur-micro)] hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/account/bookings"
                      className="flex min-h-11 items-center text-16 text-ink-soft transition-colors duration-[var(--dur-micro)] hover:text-ink"
                    >
                      My bookings
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/account/permits"
                      className="flex min-h-11 items-center text-16 text-ink-soft transition-colors duration-[var(--dur-micro)] hover:text-ink"
                    >
                      My permits
                    </Link>
                  </li>
                </ul>

                {/* Rentals live on beepdrive.com. Given a real card rather than a
                  text link, because it is a whole product line leaving the
                  site — not a footnote. */}
                <OutboundLink
                  href={BEEPDRIVE_URL}
                  showIndicator={false}
                  className="mt-10 flex-col items-stretch gap-1 rounded-[var(--radius-card)] bg-shell p-6 transition-colors duration-[var(--dur-micro)] ease-brand hover:bg-[rgb(46_42_36/0.06)]"
                >
                  <span className="u-label flex items-center justify-between gap-2 text-ink-faint">
                    Self-drive
                    <OutboundArrow />
                  </span>
                  <span className="mt-1.5 font-display text-22 tracking-[-0.02em]">
                    Car and bike hire
                  </span>
                  <span className="mt-1 text-14 text-ink-soft">
                    Rentals are handled by beepdrive.com
                  </span>
                </OutboundLink>

                <div className="mt-8">
                  <ButtonLink href="/tours" size="lg" block>
                    Plan a trip
                  </ButtonLink>
                </div>

                {/* The two links here are the only ones in the sheet a thumb
                    can miss, so they get the full 44px row rather than the
                    18px their type would give them. */}
                <address className="mt-10 text-14 text-ink-soft not-italic">
                  <p className="flex min-h-11 items-center">
                    {site.contact.address}
                  </p>
                  <p>
                    <a
                      href={`mailto:${site.contact.email}`}
                      className="flex min-h-11 items-center underline decoration-[var(--ink-hairline-strong)] underline-offset-4 hover:decoration-current"
                    >
                      {site.contact.email}
                    </a>
                  </p>
                  <p>
                    <a
                      href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                      className="flex min-h-11 items-center underline decoration-[var(--ink-hairline-strong)] underline-offset-4 hover:decoration-current"
                    >
                      {site.contact.phone}
                    </a>
                  </p>
                </address>

                <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1">
                  {legalNav.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-11 items-center text-12 text-ink-faint hover:text-ink-soft"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close menu"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--ink-hairline)] text-ink transition-colors duration-[var(--dur-micro)] hover:bg-[rgb(46_42_36/0.06)]"
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 16 16"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M2.5 2.5l11 11M13.5 2.5l-11 11" />
      </svg>
    </button>
  );
}

function OutboundArrow() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 12 12"
      className="h-3 w-3 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
    >
      <path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" />
    </svg>
  );
}
