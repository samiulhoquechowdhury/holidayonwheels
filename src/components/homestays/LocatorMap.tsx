import Link from "next/link";
import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import type { Homestay } from "@/content/types";

/**
 * A schematic locator for the homestay index.
 *
 * Deliberately not a tile map. A real basemap means an external tile request,
 * which the performance budget and the self-contained-asset rule both argue
 * against, and at this zoom a tile map tells a traveller nothing a schematic
 * does not. It plots each property against the region's bounding box so the
 * spread across the eight states is legible at a glance.
 *
 * If the client later wants a real map, this component is the only thing that
 * changes — the index page passes it homestays and nothing else.
 */

/** Approximate bounding box of the eight states, in degrees. */
const BOUNDS = { north: 29.6, south: 21.9, west: 87.9, east: 96.6 };

const VIEW_W = 400;
const VIEW_H = 360;

function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * VIEW_W;
  const y = ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * VIEW_H;
  return { x, y };
}

export function LocatorMap({
  homestays,
  className,
}: {
  homestays: Homestay[];
  className?: string;
}) {
  return (
    <div className={cn("rounded-[var(--radius-card)] bg-shell p-7", className)}>
      <Eyebrow>Where they are</Eyebrow>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-5 h-auto w-full"
        role="img"
        aria-label={`Schematic locator showing the approximate position of ${homestays.length} homestays across Northeast India`}
      >
        {/* Reference graticule — this is a diagram, and should read as one. */}
        <g stroke="currentColor" strokeWidth="0.5" opacity="0.15">
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={(VIEW_H / 4) * i}
              x2={VIEW_W}
              y2={(VIEW_H / 4) * i}
            />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`v${i}`}
              x1={(VIEW_W / 4) * i}
              y1="0"
              x2={(VIEW_W / 4) * i}
              y2={VIEW_H}
            />
          ))}
        </g>

        {homestays.map((stay) => {
          const { x, y } = project(stay.lat, stay.lng);
          return (
            <g key={stay.slug}>
              <circle
                cx={x}
                cy={y}
                r="5"
                className="fill-jade"
                opacity="0.85"
              />
              <circle
                cx={x}
                cy={y}
                r="11"
                className="fill-jade"
                opacity="0.12"
              />
            </g>
          );
        })}
      </svg>

      {/* The list is the accessible equivalent of the diagram, not a caption
          for it — every marker is reachable and named here. */}
      <ul className="mt-6 flex flex-col gap-2 border-t border-[var(--ink-hairline)] pt-5">
        {homestays.map((stay) => (
          <li key={stay.slug}>
            {/*
              Stacked, not two columns.
              Side by side, the name and the locality were fighting over a
              320px rail and the name lost: nine of the twelve rendered as
              "The Mishing stilt …", "Riv…", "T…". A locator whose list you
              cannot read is not a locator. The name now gets the full width
              and the locality sits under it as the caption it always was.
            */}
            <Link
              href={`/homestays/${stay.slug}`}
              className="flex min-h-11 flex-col justify-center py-1 text-14 transition-colors hover:text-jade-ink"
            >
              <span className="leading-snug">{stay.name}</span>
              <span className="u-label mt-0.5 text-ink-faint">
                {stay.locality}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-12 text-ink-faint">
        Positions are approximate and shown for orientation. Exact directions
        come with your booking confirmation.
      </p>
    </div>
  );
}
