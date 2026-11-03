/**
 * Brand and site-wide constants.
 *
 * The wordmark renders from `logo.src` when that file exists and falls back to
 * type set in the display face otherwise — see components/layout/Logo.tsx.
 * Drop the supplied logo at public/brand/logo.svg to switch it on.
 */

export const site = {
  name: "Holidays on Wheels",
  /** Short form for tight spaces (mobile header, footer meta). */
  shortName: "HOW",
  tagline: "The eight states of Northeast India, properly travelled.",
  description:
    "Guided tours, motorcycle expeditions, homestays and events across Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura and Sikkim — with Inner Line Permits handled for you.",
  /** TODO: replace with the final production domain before launch. */
  url: "https://holidaysonwheels.example",
  locale: "en-IN",
  currency: "INR",
  logo: {
    /**
     * Set `false` to fall back to the typographic wordmark — the header keeps
     * working either way, so no broken image can ever ship.
     */
    enabled: true,
    /**
     * Derived from the supplied `public/HOH Logo.png`: outer white flood-
     * filled to transparent from the corners (so the white icons *inside* the
     * letterforms survive), trimmed of its padding, and resized to 240px tall.
     * The source file is kept for re-export, as is the full-size PNG at
     * `public/brand/logo.png` — regenerate this WebP from that, never from
     * this file.
     *
     * **WebP at 320px, not the 621px PNG.** The mark renders 28-32px tall in
     * the header of every route, and the PNG was 92KB of which Lighthouse
     * called 90KB waste on every page of the site. This is 12KB and still
     * nearly twice the pixels a 2x display asks for. It cannot be resized at
     * request time: the custom loader in `lib/image-loader.ts` passes local
     * files through untouched, which is why `Logo.tsx` declares
     * `unoptimized` — so the file in `public/` has to be the right size
     * already.
     *
     *     magick public/brand/logo.png -resize 320x -strip \
     *       -define webp:method=6 -quality 90 public/brand/logo.webp
     *
     * NOTE: the supplied artwork reads "Holiday on Hill — Northeast India",
     * which is not `site.name`. Confirm which wordmark is correct before
     * launch; `alt` below follows `name`, so today they disagree.
     */
    src: "/brand/logo.webp",
    width: 320,
    height: 124,
    alt: "Holidays on Wheels",
  },
  contact: {
    email: "hello@holidaysonwheels.example",
    phone: "+91 98640 00000",
    address: "Guwahati, Assam, India",
  },
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "Facebook", href: "https://facebook.com" },
  ],
} as const;

export type Site = typeof site;
