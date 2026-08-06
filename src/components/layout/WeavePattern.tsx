import { getMotif, type WeaveRegion } from "./weave-motifs";

/**
 * The large, very low-opacity background wash of a region's motif, used
 * inside sections. Same geometry as the divider band, blown up 5–8× and held
 * at 3–6% so it never touches text contrast.
 *
 * Server component with no scroll behaviour — the moving version is the band.
 * Pattern ids are derived from region + scale so two washes of the same motif
 * on one page share a single definition instead of colliding.
 */
export function WeavePattern({
  region = "neutral",
  scale = 6,
  opacity = 0.045,
}: {
  region?: WeaveRegion;
  /** Multiplier on the tile size. 5–8 reads as texture, not as a pattern. */
  scale?: number;
  /** Spec range is 0.03–0.06. Anything higher starts to fight the text. */
  opacity?: number;
}) {
  const motif = getMotif(region);
  const tile = motif.tile * scale;
  const patternId = `weave-wash-${region}-${scale}`;

  // Colour is inherited via currentColor: the wash is always the section's own
  // text colour, so it works on light tints and on the dark band unchanged.
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={patternId}
          width={tile}
          height={tile}
          patternUnits="userSpaceOnUse"
        >
          <g
            transform={`scale(${scale})`}
            dangerouslySetInnerHTML={{ __html: motif.paths }}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
