"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { getDestinations } from "@/content/destinations";
import { stateShots } from "@/config/showcase";
import { stateColours } from "@/config/palette";
import { cn } from "@/lib/cn";

/**
 * The eight states as an index: eight enormous names drawn hollow, one of
 * which fills in and summons a photograph that rides the cursor.
 *
 * Why an index instead of eight cards. Eight photo cards is 900 pixels of
 * scrolling and eight competing images, and the reader ends up comparing
 * photographs rather than deciding where to go. Set as type, the eight are
 * one object that can be read in a second — and because the names are
 * *outlined*, the section is quiet enough to sit between two heavy ones
 * without the page becoming exhausting. The photograph then arrives only for
 * the one state being considered, which is the only time it is useful.
 *
 * The follow is `gsap.quickTo`, not a state update per pointer event. quickTo
 * writes straight to the transform on the next tick with its own
 * interpolation, so the preview lags the cursor by a fixed, deliberate amount
 * instead of tracking it exactly — that lag is the entire feel of the effect,
 * and re-rendering React sixty times a second would neither produce it nor
 * survive it.
 *
 * Everything here is progressive: with no pointer (touch, keyboard) the
 * preview never mounts and each row carries its own thumbnail instead.
 */
export function StateIndex() {
  const states = getDestinations();
  const [active, setActive] = useState<number | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const follow = useRef<{ x: (v: number) => void; y: (v: number) => void }>(
    null,
  );

  useGSAP(
    () => {
      const el = previewRef.current;
      if (!el || prefersReducedMotion()) return;

      follow.current = {
        x: gsap.quickTo(el, "x", { duration: 0.65, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 0.65, ease: "power3" }),
      };
    },
    { scope: listRef },
  );

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const bounds = listRef.current?.getBoundingClientRect();
    if (!bounds || !follow.current) return;
    // Centred on the cursor, then lifted — a preview whose top-left corner is
    // the cursor reads as a tooltip, and this is not one.
    follow.current.x(event.clientX - bounds.left - 150);
    follow.current.y(event.clientY - bounds.top - 190);
  };

  return (
    <section className="relative overflow-hidden bg-butter py-[var(--section-pad)]">
      <div className="u-container-wide">
        <div className="u-label flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--ink-hairline-strong)] pb-6 text-ink-faint">
          <span>The eight states · west to east</span>
          <span className="flex items-center gap-2">
            {/* The whole palette, once, as a legend. It tells the reader the
                colours mean something before they hover a single row. */}
            {Object.values(stateColours).map((colour) => (
              <span
                key={colour.surface}
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: colour.surface }}
              />
            ))}
            <span className="ml-2">Four need an Inner Line Permit</span>
          </span>
        </div>

        <div
          ref={listRef}
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
          className="relative"
        >
          {/* The travelling preview. `pointer-events-none` is load-bearing:
              without it the image sits under the cursor and eats the hover
              that is keeping it on screen. */}
          <div
            ref={previewRef}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-0 left-0 z-20 hidden h-[380px] w-[300px]",
              "overflow-hidden rounded-[var(--radius-media)] shadow-[var(--shadow-lift)]",
              "transition-opacity duration-[var(--dur-micro)] ease-brand lg:block",
              active === null ? "opacity-0" : "opacity-100",
            )}
          >
            {states.map((state, index) => (
              <Image
                key={state.slug}
                src={stateShots[state.slug] ?? ""}
                alt=""
                fill
                sizes="300px"
                className={cn(
                  "object-cover transition-opacity duration-[var(--dur-micro)] ease-brand",
                  active === index ? "opacity-100" : "opacity-0",
                )}
              />
            ))}
          </div>

          <ul>
            {states.map((state, index) => (
              <li key={state.slug}>
                <Link
                  href={`/destinations/${state.slug}`}
                  onPointerEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  className="group flex items-center gap-5 border-b border-[var(--ink-hairline)] py-6 lg:gap-10 lg:py-7"
                >
                  {/* Thumbnail for everything without a hoverable pointer.
                      Hidden from `lg` up, where the travelling preview takes
                      over the same job far more elegantly. */}
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-[12px] lg:hidden">
                    <Image
                      src={stateShots[state.slug] ?? ""}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </span>

                  <span
                    className="u-num u-label hidden w-8 shrink-0 transition-colors duration-[var(--dur-micro)] ease-brand lg:block"
                    style={{
                      color:
                        active === index
                          ? stateColours[state.slug].ink
                          : "var(--ink-faint)",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* `--row-accent` is what `.u-outline-row` fills with. Set
                      per row, so the list runs the whole palette top to
                      bottom as the cursor moves down it. */}
                  <span
                    className="u-outline-row block flex-1 font-display text-36 leading-[1] tracking-[var(--tracking-statement)] lg:text-88"
                    data-active={active === index}
                    style={
                      {
                        "--row-accent": stateColours[state.slug].surface,
                      } as React.CSSProperties
                    }
                  >
                    {state.name}
                  </span>

                  <span className="hidden max-w-xs text-right text-14 text-ink-soft lg:block">
                    {state.tagline}
                  </span>

                  <span
                    className="u-label shrink-0 rounded-full px-3 py-1.5 transition-colors duration-[var(--dur-micro)] ease-brand"
                    style={{
                      color: stateColours[state.slug].ink,
                      backgroundColor:
                        active === index
                          ? `color-mix(in srgb, ${stateColours[state.slug].surface} 18%, transparent)`
                          : "transparent",
                    }}
                  >
                    {state.requiresILP ? "ILP" : "Open"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
