import { BEEPDRIVE_URL } from "./external";

export type NavLink = {
  label: string;
  href: string;
  /** Leaves the site. Renders with the outbound indicator. */
  external?: boolean;
  description?: string;
};

export type NavGroup = {
  label: string;
  links: NavLink[];
};

/**
 * Primary header navigation.
 *
 * "Tours" is deliberately absent. It used to sit beside "Destinations" and
 * ask the same question — which of the eight states — so the two tabs split
 * one decision across two pages, and the trip planner was behind the one
 * whose label sounded like a catalogue. The planner now opens the
 * destinations page, and the individual trips still live at `/tours/[slug]`.
 */
export const primaryNav: NavLink[] = [
  { label: "Destinations", href: "/destinations" },
  { label: "Motorcycle tours", href: "/motorcycle-tours" },
  { label: "Homestays", href: "/homestays" },
  { label: "Events", href: "/events" },
  { label: "Permits", href: "/ilp" },
];

/** Shown in the mobile sheet below the primary items. */
export const secondaryNav: NavLink[] = [
  { label: "Rentals", href: "/rentals" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav: NavGroup[] = [
  {
    label: "Travel",
    links: [
      { label: "Destinations", href: "/destinations" },
      { label: "Plan a trip", href: "/destinations#plan" },
      { label: "Motorcycle tours", href: "/motorcycle-tours" },
      { label: "Homestays", href: "/homestays" },
      { label: "Events", href: "/events" },
    ],
  },
  {
    label: "Plan",
    links: [
      { label: "Inner Line Permits", href: "/ilp" },
      { label: "Apply for a permit", href: "/ilp/apply" },
      {
        label: "Car and bike hire",
        href: BEEPDRIVE_URL,
        external: true,
      },
      { label: "Frequently asked questions", href: "/faq" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Journal", href: "/journal" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    label: "Account",
    links: [
      { label: "My bookings", href: "/account/bookings" },
      { label: "My permits", href: "/account/permits" },
    ],
  },
];

export const legalNav: NavLink[] = [
  { label: "Terms of service", href: "/policies/terms" },
  { label: "Privacy policy", href: "/policies/privacy" },
  { label: "Cancellation and refunds", href: "/policies/cancellation" },
  { label: "Responsible travel", href: "/policies/responsible-travel" },
];
