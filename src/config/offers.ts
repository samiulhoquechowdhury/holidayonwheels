/**
 * What is on offer, for the band under the hero.
 *
 * **Every figure and every code here is a placeholder and needs the client's
 * sign-off before launch.** They are written as real offers rather than
 * lorem so the band can be judged at the right density and length, but a
 * discount is a promise: shipping an invented one is the kind of mistake that
 * gets honoured at the counter or argued about in public. Confirm or replace
 * the lot.
 *
 * Two shapes, deliberately mixed. A `code` is a coupon somebody types at
 * checkout; without one the entry is a standing term — free permits, the
 * child rate — which is not a discount so much as a reason to trust the
 * price. A band of nothing but percentages reads as a sale; a band that
 * alternates reads as a company with terms.
 *
 * `href` is where the offer is actually claimed, so the band is navigation
 * rather than decoration.
 */

export type Offer = {
  id: string;
  /** The coupon, where there is one. Shown as a chip, in caps. */
  code?: string;
  /** The offer itself, in as few words as it can be said. */
  headline: string;
  /** The condition. Small, but never absent where one exists. */
  terms: string;
  href: string;
};

export const offers: Offer[] = [
  {
    id: "permits",
    headline: "Inner Line Permits handled free",
    terms: "On every booking, for every traveller",
    href: "/ilp",
  },
  {
    id: "early",
    code: "EARLY60",
    headline: "₹5,000 off per person",
    terms: "Booking 60 days or more before departure",
    href: "/destinations#plan",
  },
  {
    id: "monsoon",
    code: "MONSOON10",
    headline: "10% off June to September",
    terms: "Green season departures, excluding festivals",
    href: "/destinations#plan",
  },
  {
    id: "deposit",
    headline: "25% confirms your trip",
    terms: "Balance due six weeks before you fly",
    href: "/destinations#plan",
  },
  {
    id: "solo",
    code: "SOLO0",
    headline: "Single supplement waived",
    terms: "On fixed group departures with seats left",
    href: "/destinations#plan",
  },
  {
    id: "family",
    headline: "Under-12s at 65%",
    terms: "Sharing with an adult, on every route",
    href: "/destinations#plan",
  },
  {
    id: "hornbill",
    code: "HORNBILL26",
    headline: "5% off December in Nagaland",
    terms: "Hornbill departures, booked by 30 September",
    href: "/destinations?state=nagaland#plan",
  },
];
