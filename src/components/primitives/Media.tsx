import Image from "next/image";
import { cn } from "@/lib/cn";
import { getMotif, type WeaveRegion } from "@/components/layout/weave-motifs";
import { mockFor } from "@/config/showcase";

/**
 * Every photograph on the site renders through this component.
 *
 * No real photography exists yet (open question 2 in the brief — the client is
 * supplying it). Until a file lands at `src`, this draws a deterministic
 * placeholder built from the region's weave motif over a tinted field: it
 * holds the exact aspect ratio the real image will occupy, so swapping the
 * photograph in causes no layout shift and no CLS.
 *
 * `alt` is required and must describe the place, never "image" — see
 * MEDIA.md for the manifest of what the client still owes us.
 */

export type MediaAspect =
  "16/9" | "4/3" | "3/2" | "1/1" | "4/5" | "3/4" | "21/9";

const ASPECT_CLASS: Record<MediaAspect, string> = {
  "16/9": "aspect-[16/9]",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "1/1": "aspect-square",
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "21/9": "aspect-[21/9]",
};

/**
 * Placeholder field colours, drawn from the surface tokens.
 *
 * All six are warm now, and the spread between them is deliberately narrow —
 * a grid of placeholders should read as one material with the light falling
 * differently across it, not as six swatches. The old set ran cool blues and
 * pinks against a warm page and every empty card announced itself.
 */
const FIELDS = [
  ["#EFE7D8", "#D6C6AC"],
  ["#EAE4D7", "#CDBFA6"],
  ["#E6E1D3", "#C6BCA2"],
  ["#EEE5D4", "#D2BFA4"],
  ["#E8E3D8", "#C9C1AC"],
  ["#E3DED1", "#BEB6A1"],
] as const;

/** Stable hash so a given slug always draws the same placeholder. */
function seedIndex(seed: string, buckets: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % buckets;
}

type MediaProps = {
  alt: string;
  /** Path under /public once real photography lands. */
  src?: string;
  aspect?: MediaAspect;
  /** Seeds the placeholder so it stays stable across renders. */
  seed?: string;
  /** Motif used in the placeholder. Match the section's region. */
  region?: WeaveRegion;
  /** Passed to next/image. Set on LCP candidates only. */
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Applied to the image itself — this is what card hover scales. */
  imageClassName?: string;
};

export function Media({
  alt,
  src,
  aspect = "3/2",
  seed = alt,
  region = "neutral",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 620px",
  className,
  imageClassName,
}: MediaProps) {
  /*
   * Three tiers, in order.
   *
   * 1. A real `src`, once the client's photography exists.
   * 2. Failing that, a region-matched mock from `showcase.ts` — this is what
   *    dresses every inner page while the shoot is outstanding. It is keyed
   *    off the `region` these call sites were already passing, so no page had
   *    to change to get one.
   * 3. Failing that, the weave placeholder.
   *
   * Tier 3 is not dead code and must not be deleted with the mocks: it is the
   * guarantee that a missing image is never a broken image, and it is what
   * holds the aspect ratio if `showcase.ts` is ever emptied out ahead of the
   * real files landing.
   */
  const resolved = src ?? mockFor(region, seed);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[#E6E0D4]",
        ASPECT_CLASS[aspect],
        className,
      )}
    >
      {resolved ? (
        <Image
          src={resolved}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <MediaPlaceholder
          alt={alt}
          seed={seed}
          region={region}
          className={imageClassName}
        />
      )}
    </div>
  );
}

function MediaPlaceholder({
  alt,
  seed,
  region,
  className,
}: {
  alt: string;
  seed: string;
  region: WeaveRegion;
  className?: string;
}) {
  const motif = getMotif(region);
  const [from, to] = FIELDS[seedIndex(seed, FIELDS.length)];
  const uid = `ph-${seedIndex(seed, 100000).toString(36)}-${region}`;
  const angle = seedIndex(`${seed}angle`, 4) * 22 - 33;

  return (
    <svg
      role="img"
      aria-label={alt}
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
    >
      <defs>
        <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <pattern
          id={`${uid}-p`}
          width={motif.tile * 3}
          height={motif.tile * 3}
          patternUnits="userSpaceOnUse"
          patternTransform={`rotate(${angle})`}
        >
          <g
            transform="scale(3)"
            opacity="0.14"
            color="#2E2A24"
            dangerouslySetInnerHTML={{ __html: motif.paths }}
          />
        </pattern>
      </defs>
      <rect width="600" height="400" fill={`url(#${uid}-g)`} />
      <rect width="600" height="400" fill={`url(#${uid}-p)`} />
      {/* Horizon line — reads as landscape rather than as a broken image. */}
      <path
        d={`M0 ${250 + seedIndex(seed, 40)} Q 150 ${200 + seedIndex(`${seed}a`, 60)} 300 ${240 + seedIndex(`${seed}b`, 40)} T 600 ${230 + seedIndex(`${seed}c`, 50)} V400 H0 Z`}
        fill="#2E2A24"
        opacity="0.1"
      />
    </svg>
  );
}
