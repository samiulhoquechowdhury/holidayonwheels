import Image from "next/image";
import { cn } from "@/lib/cn";
import { getMotif, type WeaveRegion } from "@/components/layout/weave-motifs";

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

/** Placeholder field colours, drawn from the tint tokens. */
const FIELDS = [
  ["#E9E2D2", "#CFC4AC"],
  ["#DCE5E8", "#B9C8CE"],
  ["#DFE8D4", "#BFCEAC"],
  ["#D8E4E5", "#B2C6C8"],
  ["#EBDADA", "#D2B3B3"],
  ["#D5DBD6", "#AFB9B2"],
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
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[#DCD8CF]",
        ASPECT_CLASS[aspect],
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
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
            color="#14201B"
            dangerouslySetInnerHTML={{ __html: motif.paths }}
          />
        </pattern>
      </defs>
      <rect width="600" height="400" fill={`url(#${uid}-g)`} />
      <rect width="600" height="400" fill={`url(#${uid}-p)`} />
      {/* Horizon line — reads as landscape rather than as a broken image. */}
      <path
        d={`M0 ${250 + seedIndex(seed, 40)} Q 150 ${200 + seedIndex(`${seed}a`, 60)} 300 ${240 + seedIndex(`${seed}b`, 40)} T 600 ${230 + seedIndex(`${seed}c`, 50)} V400 H0 Z`}
        fill="#14201B"
        opacity="0.1"
      />
    </svg>
  );
}
