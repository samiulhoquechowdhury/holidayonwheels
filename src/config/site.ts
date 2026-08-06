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
     * Flip to `true` once the supplied logo is saved at `src`. Until then the
     * header renders a typographic wordmark, so no broken image ever ships.
     */
    enabled: false,
    src: "/brand/logo.svg",
    /** Intrinsic dimensions of the supplied file. Update when the logo lands. */
    width: 180,
    height: 32,
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
