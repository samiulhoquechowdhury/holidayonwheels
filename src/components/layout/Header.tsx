"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";
import { primaryNav, secondaryNav } from "@/config/nav";
import { ButtonLink } from "@/components/primitives/Button";
import { OutboundLink } from "@/components/primitives/OutboundLink";
import { BEEPDRIVE_URL } from "@/config/external";
import { cn } from "@/lib/cn";
import { EASE, DUR_MICRO } from "@/lib/motion";

/**
 * Site header.
 *
 * Transparent over the home hero and solid everywhere else, flipping to solid
 * once the hero is behind us. Mobile opens a full-height sheet with focus
 * trapped inside it and Escape wired up.
 */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Only the home page has a dark full-bleed hero to sit over.
  const overHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the sheet on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes, and the body cannot scroll behind the sheet.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    sheetRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-[var(--dur)] ease-brand",
        overHero
          ? "is-dark bg-transparent text-paper"
          : "border-b border-[var(--ink-hairline)] bg-[color-mix(in_srgb,var(--paper)_86%,transparent)] text-ink backdrop-blur-md",
      )}
    >
      <div className="u-container flex h-[var(--header-h)] items-center justify-between gap-6">
        <Logo tone={overHero ? "paper" : "ink"} />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex min-h-11 items-center px-3 text-14 transition-opacity duration-[var(--dur-micro)]",
                      active ? "opacity-100" : "opacity-70 hover:opacity-100",
                    )}
                  >
                    {link.label}
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 bottom-2.5 h-px bg-current"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <OutboundLink
            href={BEEPDRIVE_URL}
            className="hidden text-14 opacity-70 transition-opacity hover:opacity-100 xl:inline-flex"
          >
            Car &amp; bike hire
          </OutboundLink>
          <ButtonLink
            href="/tours"
            size="sm"
            variant={overHero ? "onDark" : "primary"}
            className="hidden sm:inline-flex"
          >
            Plan a trip
          </ButtonLink>
          <MenuToggle
            ref={toggleRef}
            open={open}
            onClick={() => setOpen((v) => !v)}
          />
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={sheetRef}
            id="mobile-nav"
            data-motion="sheet"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: DUR_MICRO, ease: EASE }}
            className="is-dark fixed inset-0 top-[var(--header-h)] overflow-y-auto bg-night text-night-text lg:hidden"
          >
            <nav aria-label="All pages" className="u-container py-10">
              <ul className="flex flex-col">
                {primaryNav.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex min-h-14 items-center border-b border-[rgb(255_255_255/0.1)] font-display text-28"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="mt-8 flex flex-col gap-1">
                {secondaryNav.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex min-h-11 items-center text-16 text-night-text-soft"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <OutboundLink
                    href={BEEPDRIVE_URL}
                    className="flex min-h-11 items-center text-16 text-night-text-soft"
                  >
                    Car &amp; bike hire
                  </OutboundLink>
                </li>
              </ul>
              <div className="mt-10 flex flex-col gap-3">
                <ButtonLink href="/tours" variant="onDark" size="lg" block>
                  Plan a trip
                </ButtonLink>
                <ButtonLink
                  href="/account/bookings"
                  variant="ghost"
                  size="lg"
                  block
                  className="border-[rgb(255_255_255/0.24)] text-night-text hover:bg-[rgb(255_255_255/0.08)]"
                >
                  My bookings
                </ButtonLink>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function MenuToggle({
  open,
  onClick,
  ref,
}: {
  open: boolean;
  onClick: () => void;
  ref: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls="mobile-nav"
      aria-label={open ? "Close menu" : "Open menu"}
      className="inline-flex h-11 w-11 items-center justify-center lg:hidden"
    >
      <span aria-hidden="true" className="relative block h-3.5 w-6">
        <span
          className={cn(
            "absolute left-0 h-px w-full bg-current transition-transform duration-[var(--dur-micro)] ease-brand",
            open ? "top-1/2 rotate-45" : "top-0",
          )}
        />
        <span
          className={cn(
            "absolute left-0 h-px w-full bg-current transition-transform duration-[var(--dur-micro)] ease-brand",
            open ? "top-1/2 -rotate-45" : "bottom-0",
          )}
        />
      </span>
    </button>
  );
}
