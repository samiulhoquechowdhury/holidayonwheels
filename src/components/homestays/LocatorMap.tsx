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
const REGION = { north: 29.6, south: 21.9, west: 87.9, east: 96.6 };

const VIEW_W = 400;
const VIEW_H = 360;

/**
 * The smallest span the map will zoom to, in degrees — roughly 2km.
 *
 * Only a guard against dividing by zero when every pin is on one spot. The
 * real framing comes from the aspect fit below.
 */
const MIN_SPAN = 0.02;

/**
 * The box to draw, derived from the pins rather than fixed.
 *
 * The map used to be hardcoded to the eight-state bounding box, which was
 * right while it showed twelve houses across all eight. The homestays page
 * now leads on Guwahati alone, and four pins 0.2 degrees apart inside a box
 * 8.7 degrees wide rendered as a single dot in an empty grid.
 *
 * `aspect` is the viewport's width over its height, and it is not optional.
 * Fitting latitude and longitude independently stretches the geography to
 * whatever shape the SVG happens to be: in the 400x120 strip that squashed
 * four houses spread over 0.03 degrees of latitude onto a single horizontal
 * line, with the river drawn through them. So the tighter axis is widened
 * until the box has the viewport's proportions, and north stays north.
 *
 * A set spread across the whole region still produces very nearly the old
 * box, so the twelve-house case is unchanged.
 */
function boundsFor(points: { lat: number; lng: number }[], aspect: number) {
  if (points.length === 0) return REGION;

  const span = (values: number[]) => {
    const low = Math.min(...values);
    const high = Math.max(...values);
    return {
      mid: (low + high) / 2,
      size: Math.max((high - low) * 1.3, MIN_SPAN),
    };
  };

  const vertical = span(points.map((p) => p.lat));
  const horizontal = span(points.map((p) => p.lng));

  /*
   * A degree of longitude is shorter than a degree of latitude everywhere
   * but the equator — about 0.9 of it at Guwahati's 26 degrees north.
   * Without this the city looks stretched east to west.
   */
  const shrink = Math.cos((vertical.mid * Math.PI) / 180);
  const wide = horizontal.size * shrink;

  let height = vertical.size;
  let width = wide;
  if (width / height > aspect) height = width / aspect;
  else width = height * aspect;

  return {
    north: vertical.mid + height / 2,
    south: vertical.mid - height / 2,
    west: horizontal.mid - width / 2 / shrink,
    east: horizontal.mid + width / 2 / shrink,
  };
}

function project(
  lat: number,
  lng: number,
  bounds: ReturnType<typeof boundsFor>,
) {
  const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * VIEW_W;
  const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * VIEW_H;
  return { x, y };
}

export function LocatorMap({
  homestays,
  className,
}: {
  homestays: Homestay[];
  className?: string;
}) {
  const bounds = boundsFor(homestays, VIEW_W / VIEW_H);

  return (
    <div className={cn("rounded-[var(--radius-card)] bg-shell p-7", className)}>
      <Eyebrow>Where they are</Eyebrow>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-5 h-auto w-full"
        role="img"
        aria-label={`Schematic locator showing the approximate position of ${homestays.length} homestays`}
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
          const { x, y } = project(stay.lat, stay.lng, bounds);
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
/** Web-mercator tile coordinates, fractional, at a given zoom. */
function tileFor(lat: number, lng: number, zoom: number) {
  const n = 2 ** zoom;
  const rad = (lat * Math.PI) / 180;
  return {
    x: ((lng + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n,
  };
}

const FADE = [
  "linear-gradient(to right, transparent 0%, #000 16%, #000 84%, transparent 100%)",
  "linear-gradient(to bottom, transparent 0%, #000 20%, #000 80%, transparent 100%)",
].join(", ");

const TILE = 256;
/** ~4km across at this latitude: the neighbourhood, not the street. */
const MINI_ZOOM = 13;
/** Enough to cover the widest column this renders in, and no more. */
const TILE_COLS = [-1, 0, 1];
const TILE_ROWS = [-1, 0];

/**
 * A single house's position on a real map, faded into the page.
 *
 * It sits under each house on the index, after the link into it, and answers
 * the one question the photograph cannot: whereabouts is this? Four houses
 * all described as "Guwahati" are not in the same place at all — one is
 * across the river and one is thirty-two kilometres west — and a locality
 * string only tells you that if you already know the city.
 *
 * ## The tiles
 *
 * Real OpenStreetMap raster tiles, laid out by hand rather than through a
 * map library: this needs to pan to a point and nothing else, and Leaflet or
 * MapLibre would be a large client bundle to do what six positioned images
 * already do. There is no JavaScript in it at all.
 *
 * **Read before launch.** These come from `tile.openstreetmap.org`, whose
 * usage policy covers development and low-volume use, not a commercial site.
 * Before this ships, point `NEXT_PUBLIC_MAP_TILE_URL` at a provider with a
 * key — MapTiler, Thunderforest, Geoapify all serve the same `{z}/{x}/{y}`
 * shape, so it is one environment variable and nothing else moves. The host
 * also has to be added to `remotePatterns` in next.config.ts.
 *
 * Attribution is required by the ODbL and is rendered below the map. It is
 * not optional and must not be removed to tidy the layout.
 *
 * ## The fade
 *
 * Desaturated and dropped in opacity, then masked to nothing at the edges,
 * so it reads as a quiet aside under the booking link rather than a map
 * someone is meant to use for navigation — which it is not, and which the
 * caption says. The pin is the one saturated thing on it.
 */
export function HouseLocator({
  stay,
  within,
  className,
}: {
  stay: Homestay;
  within: Homestay[];
  className?: string;
}) {
  const centre = tileFor(stay.lat, stay.lng, MINI_ZOOM);
  const base = { x: Math.floor(centre.x), y: Math.floor(centre.y) };
  const template =
    process.env.NEXT_PUBLIC_MAP_TILE_URL ??
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  /* Where the other houses fall on this same frame, in pixels from centre. */
  const others = within
    .filter((other) => other.slug !== stay.slug)
    .map((other) => {
      const point = tileFor(other.lat, other.lng, MINI_ZOOM);
      return {
        slug: other.slug,
        dx: (point.x - centre.x) * TILE,
        dy: (point.y - centre.y) * TILE,
      };
    });

  return (
    <figure className={cn("min-w-0", className)}>
      <div
        className="relative h-40 w-full overflow-hidden"
        style={{
          /*
           * Dissolves on all four sides — no border, no box.
           *
           * Two linear gradients intersected rather than one radial. A
           * radial on a strip three times wider than it is tall reaches the
           * short edges long before the long ones, so the top and bottom
           * stayed hard while the corners went soft. Crossed linears fade
           * each axis on its own terms.
           */
          maskImage: FADE,
          WebkitMaskImage: FADE,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-55 saturate-[0.35]"
        >
          {TILE_ROWS.map((row) =>
            TILE_COLS.map((col) => {
              const x = base.x + col;
              const y = base.y + row;
              return (
                /*
                 * A raw <img>, deliberately.
                 *
                 * These are 256px PNG map tiles served at exactly the size
                 * they are drawn at. Routing two dozen of them per page
                 * through Next's optimiser would re-encode images that are
                 * already minimal and bill for the privilege, and the
                 * optimiser cannot improve on a tile that is already the
                 * right dimensions.
                 */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${x}-${y}`}
                  src={template
                    .replace("{z}", String(MINI_ZOOM))
                    .replace("{x}", String(x))
                    .replace("{y}", String(y))}
                  alt=""
                  width={TILE}
                  height={TILE}
                  loading="lazy"
                  decoding="async"
                  className="absolute max-w-none"
                  style={{
                    left: `calc(50% + ${(x - centre.x) * TILE}px)`,
                    top: `calc(50% + ${(y - centre.y) * TILE}px)`,
                  }}
                />
              );
            }),
          )}
        </div>

        {others.map((other) => (
          <span
            key={other.slug}
            aria-hidden="true"
            className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink opacity-30"
            style={{
              left: `calc(50% + ${other.dx}px)`,
              top: `calc(50% + ${other.dy}px)`,
            }}
          />
        ))}

        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-jade ring-4 ring-jade/25"
        />
      </div>

      <figcaption className="u-label mt-2.5 flex flex-wrap gap-x-3 text-ink-faint">
        <span>{stay.locality} · approximate</span>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          © OpenStreetMap
        </a>
      </figcaption>
    </figure>
  );
}
