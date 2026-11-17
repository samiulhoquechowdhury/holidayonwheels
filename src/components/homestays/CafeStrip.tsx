"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Cafe } from "@/content/cafes";

/**
 * The cafés, as cards with their own small galleries.
 *
 * ## Why no price, no hours, no rating
 *
 * Because we were not given any. The client's folder held names, localities
 * and photographs, and that is what these cards carry. A café card is the
 * easy place to pad with plausible furniture — "₹₹ · Opens 10am · 4.5★" —
 * and every one of those would be a specific claim about somebody else's
 * business that nobody has checked. The cost of getting it wrong is paid by
 * the café, not by us, when a visitor turns up on a day it is shut.
 *
 * `content/cafes.ts` has the fields ready for when the details arrive.
 *
 * ## Why a gallery per card and not one photograph
 *
 * Four photographs each were supplied and they do different jobs — the room,
 * the frontage, the food. A single still of a café interior says almost
 * nothing; the four together say what kind of place it is, which is the only
 * question this section exists to answer.
 */
export function CafeStrip({ cafes }: { cafes: Cafe[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {cafes.map((cafe) => (
        <li key={cafe.slug}>
          <CafeCard cafe={cafe} />
        </li>
      ))}
    </ul>
  );
}

function CafeCard({ cafe }: { cafe: Cafe }) {
  const [frame, setFrame] = useState(0);

  return (
    <div className="min-w-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card)] bg-shell">
        <Image
          key={cafe.images[frame]}
          src={cafe.images[frame]}
          alt={frame === 0 ? cafe.alt : `${cafe.name}, photograph ${frame + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
      </div>

      {/*
        Dots rather than thumbnails. At a quarter of the grid the card is
        about 300px wide and four 64px squares under it would take a third of
        its height for pictures too small to read — the thumbnail strip
        earns its room on the homestay page, where the frame is five times
        the size, and does not here.
      */}
      <div
        role="group"
        aria-label={`Photographs of ${cafe.name}`}
        className="mt-3 flex gap-1.5"
      >
        {cafe.images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setFrame(index)}
            aria-pressed={index === frame}
            aria-label={`Photograph ${index + 1} of ${cafe.images.length}`}
            /* The hit area is 44px tall; only the 4px bar inside it is
               painted, so the control is thumb-sized without looking it. */
            className="group flex h-11 flex-1 items-center"
          >
            <span
              className={cn(
                "block h-1 w-full rounded-full transition-colors duration-[var(--dur-micro)] ease-brand",
                index === frame
                  ? "bg-ink"
                  : "bg-[var(--ink-hairline-strong)] group-hover:bg-ink-faint",
              )}
            />
          </button>
        ))}
      </div>

      <h3 className="text-18">{cafe.name}</h3>
      <p className="u-label mt-1.5 text-ink-faint">{cafe.locality}</p>
      <p className="mt-3 text-16 text-ink-soft">{cafe.note}</p>
    </div>
  );
}
