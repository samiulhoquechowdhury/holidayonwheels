import localFont from "next/font/local";
import { Figtree, Fraunces, Instrument_Serif } from "next/font/google";

/**
 * Three faces, and each one has a job it does not share.
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
export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
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
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument",
});

/**
 * Body and UI. Humanist rather than grotesque — the open apertures and the
 * slightly calligraphic `a` and `e` keep long-form itinerary copy warm next
 * to two serifs, where a neo-grotesque would fight both.
 *
 * Set at 300/400 almost everywhere; 500 exists for buttons and labels. The
 * 600+ weights are not requested, so they cannot be reached for by accident.
 */
export const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-figtree",
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
