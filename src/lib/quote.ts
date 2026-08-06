import { formatINR } from "./currency";
import type { Departure, PriceBand } from "@/content/types";

/**
 * Booking price calculation.
 *
 * Deliberately a pure function in `lib/` rather than a helper inside
 * `BookingWidget` — the checkout resolves an order on the server and must
 * arrive at exactly the same total the widget showed on the client. A shared
 * module is the only way to guarantee that; a client-only export cannot be
 * called from a server component at all.
 */

export type BookingLine = {
  label: string;
  amount: number;
  /** Rendered smaller, under the line it qualifies. */
  note?: string;
};

export type Quote = {
  perPerson: number;
  lines: BookingLine[];
  total: number;
};

export function buildQuote({
  departure,
  priceBands,
  pax,
  singleSupplement,
}: {
  departure?: Departure;
  priceBands: PriceBand[];
  pax: number;
  singleSupplement: number;
}): Quote {
  const headline = priceBands[0]?.perPerson ?? 0;
  const base = departure?.perPerson ?? headline;

  // Find the best band the party qualifies for, and express it as a ratio so
  // it composes with a discounted departure rate rather than overriding it.
  const band = [...priceBands]
    .filter((b) => pax >= b.fromPax)
    .sort((a, b) => b.fromPax - a.fromPax)[0];
  const ratio = band && headline > 0 ? band.perPerson / headline : 1;
  const perPerson = Math.round((base * ratio) / 100) * 100;

  const lines: BookingLine[] = [
    {
      label: `${formatINR(perPerson)} × ${pax} ${pax === 1 ? "traveller" : "travellers"}`,
      amount: perPerson * pax,
      note:
        ratio < 1
          ? `Party rate applied, ${Math.round((1 - ratio) * 100)}% below the headline price`
          : undefined,
    },
  ];

  if (pax === 1 && singleSupplement > 0) {
    lines.push({
      label: "Single supplement",
      amount: singleSupplement,
      note: "Covers the room we cannot twin-share",
    });
  }

  if (departure?.wasPerPerson) {
    lines.push({
      label: "Early departure discount",
      amount: -(departure.wasPerPerson - departure.perPerson) * pax,
    });
  }

  const total = lines.reduce((sum, line) => sum + line.amount, 0);
  return { perPerson, lines, total };
}

/** The deposit that confirms a booking. Events are charged in full. */
export function depositFor(total: number, kind: string): number {
  return kind === "event" ? total : Math.round(total * 0.25);
}
