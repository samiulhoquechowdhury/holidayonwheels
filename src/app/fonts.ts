import localFont from "next/font/local";

/**
 * ## All four faces are self-hosted, and that is a build-reliability fix
 *
 * These were `next/font/google` until the Lighthouse workflow failed at
 * `pnpm build` on a commit whose build had just passed in CI — same command,
 * same runner image, same SHA. A clean clone built fine locally, which ruled
 * out the code. What is left is the network, and of the three calls `next
 * build` makes, two (`lib/weather.ts` and `lib/fx.ts`) abort after six
 * seconds and are caught. The third is `next/font/google`, which downloads
 * from `fonts.gstatic.com` at build time, retries three times and then fails
 * the build.
 *
 * This project has already been bitten once by a third party sitting on the
 * critical path of its own build — see the `AbortSignal.timeout` note in
 * `lib/weather.ts`. A font file is not something that should be fetched at
 * build time at all, so now it is not: the woff2s are in this folder and the
 * build has no font dependency to fail on.
 *
 * Three things come free with it: one fewer origin for a visitor to connect
 * to (which is what the Lighthouse budgets in `lighthouse.yml` are mostly
 * waiting on), no request to Google from an EU visitor's browser, and
 * byte-for-byte reproducible builds.
 *
 * **These are the `latin` subsets only**, exactly what `subsets: ["latin"]`
 * fetched before. Adding a language means adding its subset file here.
 * Licences sit beside the files; delete a font and its OFL together.
 *
 * ## Three faces, and each one has a job it does not share.
 *
 * The brand argument is that expense reads as *contrast between two serifs*,
 * not as one serif set large. So the system runs a workhorse display face for
 * every headline, and a second, far more mannered face that appears one word
 * at a time — the single italic word inside an otherwise upright line. That
 * one-word swap is the signature of the identity; it is why there are three
 * families here and not two.
 */

/**
 * Display. Fraunces carries an optical-size axis, so a 160px hero and a 22px
 * card title are two different drawings of the same face rather than one
 * drawing at two scales — the thing that separates a headline that looks
 * commissioned from a headline that looks scaled.
 *
 * `SOFT` and `WONK` are requested and then pinned in CSS: SOFT rounds the
 * terminals off a Didone-sharp default (which goes brittle over photography),
 * and WONK is held at 0 everywhere except the accent word, where the swashed
 * `g` and `y` are exactly the point.
 */
export const fraunces = localFont({
  src: "./fonts/fraunces-latin-var.woff2",
  /*
   * The variable file, carrying `opsz`, `wght`, `SOFT` and `WONK` — the same
   * axes the Google loader was asked for. The weight range has to be stated
   * explicitly here: `next/font/local` cannot read it out of the file, and
   * without it every weight collapses to 400 and the display face loses its
   * range silently.
   */
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-fraunces",
  adjustFontFallback: "Times New Roman",
});

/**
 * The accent. One word per headline, always italic, never a whole sentence.
 *
 * Instrument Serif is a high-contrast face with a genuinely calligraphic
 * italic — set next to Fraunces at the same size it reads as a different
 * *voice* rather than a different weight, which is the effect being bought.
 * Restraint is the whole mechanism: the moment a second word takes it in the
 * same line, neither is special.
 */
export const instrumentSerif = localFont({
  /* Two files, because the italic is a separate drawing and not a slant. */
  src: [
    {
      path: "./fonts/instrument-serif-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/instrument-serif-latin-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-instrument",
  adjustFontFallback: "Times New Roman",
});

/**
 * Body and UI. Humanist rather than grotesque — the open apertures and the
 * slightly calligraphic `a` and `e` keep long-form itinerary copy warm next
 * to two serifs, where a neo-grotesque would fight both.
 *
 * Set at 300/400 almost everywhere; 500 exists for buttons and labels. The
 * 600+ weights are not requested, so they cannot be reached for by accident.
 */
export const figtree = localFont({
  src: "./fonts/figtree-latin-var.woff2",
  /*
   * The variable file covers 300–900. The design uses 300/400/500 and the
   * discipline against reaching for 600+ is now a convention rather than
   * something the request enforced — `.u-label` and the buttons are the
   * only places weight is set at all.
   */
  weight: "300 900",
  style: "normal",
  display: "swap",
  variable: "--font-figtree",
  adjustFontFallback: "Arial",
});

/**
 * Newsreader, the previous display face. Kept declared but no longer loaded:
 * the token `--font-display` now resolves to Fraunces, and nothing references
 * `--font-newsreader`. Left here so the self-hosted subset and its OFL licence
 * do not get orphaned in the folder — delete both together or neither.
 */
export const newsreader = localFont({
  src: "./fonts/newsreader-latin-opsz.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-newsreader",
  adjustFontFallback: "Times New Roman",
});

/**
 * There is no monospace in this system. Utility labels are the body face
 * tracked wide (`.u-label`), and figures use the `.u-num` utility — tabular
 * lining figures from that same family — rather than a whole fourth family.
 * A monospaced price reads like a receipt, and this design is trying not to.
 */
export const fontVariables = [
  fraunces.variable,
  instrumentSerif.variable,
  figtree.variable,
].join(" ");
