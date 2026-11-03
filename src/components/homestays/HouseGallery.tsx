"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The house, photographed: one large frame and the rest as squares under it.
 *
 * ## Why the big one got smaller
 *
 * It was `aspect-[16/9]` at the full wide container — 1,280 × 720 on a laptop
 * — with the title above it. Measured, that put the booking panel and the
 * nightly rate **1,225px** down the page: the first screen of a listing was a
 * name, a star rating and a photograph, with nothing you could act on and no
 * indication the page continued. The frame is now capped by viewport height,
 * so the content and the price begin inside the first screen on a laptop and
 * the photograph still owns the top of the page.
 *
 * `h-[clamp()]` rather than a different aspect ratio: an aspect ratio is a
 * constant, and the problem was never the shape — it was the height relative
 * to the screen. A tall phone and a short laptop want different crops of the
 * same picture, and `object-cover` centre-crops either without distortion.
 *
 * ## The strip
 *
 * Square, for the reason the room dialog's strip is square: these frames are
 * different subjects — a bedroom, a ferry, a courtyard — and a square is the
 * one crop that treats a tall subject and a wide one alike. Four thumbnails
 * at 16/9 would each lie about their own frame.
 *
 * It is the same control on a phone, scaled down rather than replaced: the
 * thumbnails shrink and the row scrolls if it has to, which keeps one mental
 * model of "tap a small picture to see it big" at every width. No carousel,
 * no dots, no arrows — every frame is visible and directly reachable, so
 * there is nothing for a "next" to mean.
 */
export function HouseGallery({
  images,
  alt,
  className,
}: {
  /** The hero first, then the rest. At least one. */
  images: string[];
  alt: string;
  className?: string;
}) {
  const [frame, setFrame] = useState(0);
  const frames = images.filter(Boolean);
  const current = frames[frame] ?? frames[0];

  return (
    <div className={cn("min-w-0", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-media)] bg-[#E6E0D4]",
          /*
           * Floor, preference, ceiling. The floor keeps it a photograph
           * rather than a letterbox on a short window; the ceiling stops it
           * filling a tall desktop screen on its own, which is the thing
           * this page was doing wrong.
           */
          "h-[clamp(14rem,46vh,30rem)]",
        )}
      >
        <Image
          /* Keyed so each frame is its own element and stays decoded in the
             browser's cache, rather than one element with a mutated `src`. */
          key={current}
          src={current}
          alt={
            frame === 0
              ? alt
              : `${alt} — photograph ${frame + 1} of ${frames.length}`
          }
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1200px"
          className="object-cover"
        />

        {frames.length > 1 ? (
          <p className="u-glass u-num absolute bottom-3 left-3 rounded-full px-3 py-1 text-14 text-ink">
            {frame + 1} / {frames.length}
          </p>
        ) : null}
      </div>

      {frames.length > 1 ? (
        <div
          role="group"
          aria-label={`Photographs of ${alt}`}
          /* Negative gutter margins so the row bleeds to the screen edge on a
             phone and the last thumbnail does not look like the last one. */
          className="-mx-[var(--gutter)] mt-3 flex scrollbar-none gap-2.5 overflow-x-auto px-[var(--gutter)] sm:mx-0 sm:px-0"
        >
          {frames.map((src, index) => {
            const active = index === frame;
            return (
              <button
                key={src}
                type="button"
                onClick={() => setFrame(index)}
                aria-pressed={active}
                aria-label={`Photograph ${index + 1} of ${frames.length}`}
                className={cn(
                  /* 64px on a phone, 80px from `sm`. Below 64 the subject of
                     a thumbnail stops being readable at arm's length. */
                  "relative size-16 shrink-0 overflow-hidden rounded-[var(--radius-input)] bg-shell sm:size-20",
                  "transition-opacity duration-[var(--dur-micro)] ease-brand",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
                  active
                    ? "opacity-100 ring-2 ring-ink ring-offset-2 ring-offset-paper"
                    : "opacity-60 hover:opacity-100",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
