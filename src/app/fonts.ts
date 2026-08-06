import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";

/**
 * The display face sits behind a single token (`--font-display`). Swapping
 * Newsreader for a licensed Canela or PP Editorial New means changing this
 * declaration only — no layout anywhere else depends on the family name.
 *
 * Self-hosted rather than pulled through `next/font/google`, for size.
 * `next/font/google` cannot pin a weight *and* request an axis, so asking for
 * optical sizing forced the entire 200–800 weight range: 132kB on the LCP
 * path. Display type in this design is only ever weight 400, so this is the
 * latin subset at wght 400 with the opsz axis intact — 57kB, same rendering,
 * and it keeps the optical sizing the brief asks for.
 *
 * Browsers apply the opsz axis automatically (`font-optical-sizing: auto` is
 * the default), so headline size drives optical size with no extra CSS.
 *
 * The file is OFL-licensed; the licence ships alongside it in this folder.
 * Re-download with:
 *   https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400
 */
export const newsreader = localFont({
  src: "./fonts/newsreader-latin-opsz.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-newsreader",
  // Metrics of the local fallback, so the swap does not shift layout.
  adjustFontFallback: "Times New Roman",
});

export const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const fontVariables = [
  newsreader.variable,
  geistSans.variable,
  geistMono.variable,
].join(" ");
