"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { MenuDrawer } from "./MenuDrawer";
import { primaryNav } from "@/config/nav";
import { cn } from "@/lib/cn";

/**
 * Site header: three floating white plates over whatever the page is doing —
 * mark on the left, primary navigation centred, menu on the right.
 *
 * The plates carry their own ground, so the header never has to switch
 * between transparent and solid as the hero scrolls past. That removes a
 * colour transition, a scroll listener, and the flash of mid-state that came
 * with them.
 *
 * The centre plate is the shortlist. Everything else — secondary pages,
 * account, rentals, legal — lives in the drawer, which is also the only
 * navigation below `lg`.
 */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Close on navigation.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/*
       * `1fr auto 1fr` centres the nav plate against the viewport rather than
       * against the space left over by the logo, so it stays put as the mark
       * or the menu label changes width. No transform involved, which keeps
       * it honest under reduced motion.
       */}
      <div className="u-container grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-[var(--header-pad)]">
        <Logo className="justify-self-start" />

        <nav
          aria-label="Primary"
          className="hidden justify-self-center lg:block"
        >
          <ul className="u-plate flex h-[var(--plate-h)] items-center gap-0.5 px-2">
            {primaryNav.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-10 items-center rounded-[var(--radius-plate)] px-3 text-14 whitespace-nowrap",
                      "transition-colors duration-[var(--dur-micro)] ease-brand",
                      active
                        ? "bg-[rgb(20_32_27/0.06)] text-ink"
                        : "text-ink-soft hover:text-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <StairToggle
          ref={toggleRef}
          open={open}
          onClick={() => setOpen((v) => !v)}
          className="justify-self-end"
        />
      </div>

      <MenuDrawer open={open} onClose={close} returnFocusTo={toggleRef} />
    </header>
  );
}

/**
 * The stair glyph: three right-aligned rules stepping down. On hover they
 * level out to full width. Both are width transitions, so reduced motion —
 * which restricts transitions to `opacity` — drops them without any JS.
 */
function StairToggle({
  open,
  onClick,
  className,
  ref,
}: {
  open: boolean;
  onClick: () => void;
  className?: string;
  ref: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls="site-menu"
      aria-label="Open menu"
      className={cn(
        "u-plate group inline-flex h-[var(--plate-h)] shrink-0 items-center gap-2.5 px-4 text-ink md:px-5",
        className,
      )}
    >
      <span className="u-mono hidden sm:inline">Menu</span>
      <span
        aria-hidden="true"
        className="flex h-3.5 w-6 flex-col items-end justify-between"
      >
        <span className="h-px w-full bg-current transition-[width] duration-[var(--dur-micro)] ease-brand" />
        <span className="h-px w-[70%] bg-current transition-[width] duration-[var(--dur-micro)] ease-brand group-hover:w-full" />
        <span className="h-px w-[40%] bg-current transition-[width] duration-[var(--dur-micro)] ease-brand group-hover:w-full" />
      </span>
    </button>
  );
}
