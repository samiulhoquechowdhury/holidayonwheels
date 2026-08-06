/**
 * Weave motifs — the signature element.
 *
 * Each entry is a geometric abstraction of a real Northeast Indian textile
 * tradition, authored as an SVG `<pattern>` tile rather than an image so it
 * stays crisp at any size, recolours from tokens, and costs a few hundred
 * bytes. The same tile does two jobs: a 28–40px divider band between
 * sections, and a large 3–6% opacity background wash inside them.
 *
 * The motif is structural, not decorative — it tells the reader which region
 * a section is about. Adding a region means adding a tile here and nothing
 * else.
 *
 * These are respectful abstractions of traditional geometry, not reproductions
 * of any specific clan or community pattern, which in several of these
 * traditions carry restricted meaning.
 */

export type WeaveRegion =
  | "assam"
  | "meghalaya"
  | "arunachal"
  | "nagaland"
  | "manipur"
  | "mizoram"
  | "tripura"
  | "sikkim"
  | "neutral";

export type WeaveMotif = {
  region: WeaveRegion;
  /** Human label, used in the /dev sandbox and in `aria` descriptions. */
  label: string;
  /** Textile tradition the geometry is drawn from. */
  tradition: string;
  /** Tile size in user units. The tile is always square. */
  tile: number;
  /**
   * Tile geometry. `currentColor` throughout so a single `color` on the
   * wrapping SVG recolours the whole motif.
   */
  paths: string;
};

/* Mishing/Assamese loom work: fine warp stripes broken by stepped lozenges. */
const assam: WeaveMotif = {
  region: "assam",
  label: "Assam",
  tradition: "Mishing loom weave",
  tile: 40,
  paths: `
    <path d="M0 20 H40" stroke="currentColor" stroke-width="1.25" fill="none"/>
    <path d="M0 4 H40 M0 36 H40" stroke="currentColor" stroke-width="0.6" opacity="0.55" fill="none"/>
    <path d="M20 8 L28 20 L20 32 L12 20 Z" fill="currentColor"/>
    <path d="M0 20 L6 14 L6 26 Z" fill="currentColor"/>
    <path d="M40 20 L34 14 L34 26 Z" fill="currentColor"/>
  `,
};

/* Khasi/Jaintia: the stepped diamond of Meghalaya's dhara and shawl borders. */
const meghalaya: WeaveMotif = {
  region: "meghalaya",
  label: "Meghalaya",
  tradition: "Khasi stepped diamond",
  tile: 40,
  paths: `
    <path d="M20 4 L36 20 L20 36 L4 20 Z" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <path d="M20 12 L28 20 L20 28 L12 20 Z" fill="currentColor"/>
    <path d="M0 20 L4 16 L4 24 Z M40 20 L36 16 L36 24 Z" fill="currentColor"/>
    <path d="M0 0 H8 M32 0 H40 M0 40 H8 M32 40 H40" stroke="currentColor" stroke-width="1" fill="none"/>
  `,
};

/* Apatani/Adi: vertical bands with counter-facing triangles. */
const arunachal: WeaveMotif = {
  region: "arunachal",
  label: "Arunachal Pradesh",
  tradition: "Apatani band weave",
  tile: 40,
  paths: `
    <path d="M4 0 V40 M36 0 V40" stroke="currentColor" stroke-width="1.1" fill="none"/>
    <path d="M10 6 L20 20 L10 34 Z" fill="currentColor"/>
    <path d="M30 6 L20 20 L30 34 Z" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <path d="M18 0 H22 M18 40 H22" stroke="currentColor" stroke-width="2" fill="none"/>
  `,
};

/* Naga shawl: the bold horizontal bar with opposed chevrons. */
const nagaland: WeaveMotif = {
  region: "nagaland",
  label: "Nagaland",
  tradition: "Naga shawl geometry",
  tile: 40,
  paths: `
    <path d="M0 19 H40 V21 H0 Z" fill="currentColor"/>
    <path d="M2 12 L10 4 L18 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="miter"/>
    <path d="M22 12 L30 4 L38 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="miter"/>
    <path d="M2 28 L10 36 L18 28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="miter"/>
    <path d="M22 28 L30 36 L38 28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="miter"/>
  `,
};

/* Meitei phanek: interlocking hooked key, the Manipuri temple border. */
const manipur: WeaveMotif = {
  region: "manipur",
  label: "Manipur",
  tradition: "Meitei phanek border",
  tile: 40,
  paths: `
    <path d="M4 36 V12 H20 V24 H12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/>
    <path d="M36 4 V28 H20 V16 H28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/>
    <path d="M0 0 H40" stroke="currentColor" stroke-width="0.8" opacity="0.6" fill="none"/>
  `,
};

/* Puanchei: the Mizo diamond-and-bar sequence. */
const mizoram: WeaveMotif = {
  region: "mizoram",
  label: "Mizoram",
  tradition: "Puanchei diamond run",
  tile: 40,
  paths: `
    <path d="M20 2 L38 20 L20 38 L2 20 Z" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <circle cx="20" cy="20" r="3.4" fill="currentColor"/>
    <path d="M0 20 H2 M38 20 H40 M20 0 V2 M20 38 V40" stroke="currentColor" stroke-width="1.6" fill="none"/>
    <path d="M8 8 L12 12 M32 8 L28 12 M8 32 L12 28 M32 32 L28 28" stroke="currentColor" stroke-width="1.2" fill="none"/>
  `,
};

/* Risa: the Tripuri chest-cloth stripe with paired dots. */
const tripura: WeaveMotif = {
  region: "tripura",
  label: "Tripura",
  tradition: "Risa stripe",
  tile: 40,
  paths: `
    <path d="M0 10 H40 M0 30 H40" stroke="currentColor" stroke-width="1.3" fill="none"/>
    <circle cx="10" cy="20" r="2.6" fill="currentColor"/>
    <circle cx="30" cy="20" r="2.6" fill="currentColor"/>
    <path d="M20 14 L24 20 L20 26 L16 20 Z" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <path d="M0 20 H4 M36 20 H40" stroke="currentColor" stroke-width="1.3" fill="none"/>
  `,
};

/* Lepcha thara: fine crosshatch under a running eight-point star. */
const sikkim: WeaveMotif = {
  region: "sikkim",
  label: "Sikkim",
  tradition: "Lepcha thara weave",
  tile: 40,
  paths: `
    <path d="M20 6 V34 M6 20 H34" stroke="currentColor" stroke-width="1.2" fill="none"/>
    <path d="M10 10 L30 30 M30 10 L10 30" stroke="currentColor" stroke-width="1.2" fill="none"/>
    <circle cx="20" cy="20" r="4" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <path d="M0 0 H4 V4 H0 Z M36 0 H40 V4 H36 Z M0 36 H4 V40 H0 Z M36 36 H40 V40 H36 Z" fill="currentColor"/>
  `,
};

/* Used where a section is not about one region — a quiet running key. */
const neutral: WeaveMotif = {
  region: "neutral",
  label: "Northeast India",
  tradition: "Composite running key",
  tile: 40,
  paths: `
    <path d="M0 20 H40" stroke="currentColor" stroke-width="1" opacity="0.7" fill="none"/>
    <path d="M4 26 V14 H16 V26 H28 V14 H40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/>
    <path d="M10 20 L14 20" stroke="currentColor" stroke-width="2" fill="none"/>
  `,
};

export const weaveMotifs: Record<WeaveRegion, WeaveMotif> = {
  assam,
  meghalaya,
  arunachal,
  nagaland,
  manipur,
  mizoram,
  tripura,
  sikkim,
  neutral,
};

export const weaveRegions = Object.keys(weaveMotifs) as WeaveRegion[];

export function getMotif(region: WeaveRegion = "neutral"): WeaveMotif {
  return weaveMotifs[region] ?? neutral;
}
