import { getTourBySlug } from "@/content/tours";
import { getMotorcycleTourBySlug } from "@/content/motorcycle-tours";
import { getHomestayBySlug } from "@/content/homestays";
import { getEventBySlug } from "@/content/events";
import { getHomestaysNear } from "@/content/homestays";
import { buildQuote } from "@/lib/quote";
import type { AddOn } from "@/components/booking/AddOnStep";
import type { StateSlug, WeaveRegionLike } from "./types";
import { addDays, nightsBetween } from "@/lib/date";

/**
 * Resolves the query string a booking widget produced into a priced order.
 *
 * This is the single place that knows how a URL becomes an order, so the
 * checkout screens never parse params themselves and the payment step never
 * recalculates a total the traveller has not already been shown.
 */

export type OrderKind = "tour" | "moto" | "stay" | "event";

export type Order = {
  kind: OrderKind;
  slug: string;
  title: string;
  strapline: string;
  region: WeaveRegionLike;
  states: StateSlug[];
  heroAlt: string;
  startDate: string;
  endDate: string;
  travellers: number;
  /** Human line describing what was chosen, e.g. the room or ticket tier. */
  variant?: string;
  lines: { label: string; amount: number; note?: string }[];
  subtotal: number;
  requiresILP: boolean;
  addOns: AddOn[];
};

export type CheckoutParams = {
  kind?: string;
  slug?: string;
  date?: string;
  pax?: string;
  nights?: string;
  room?: string;
  tier?: string;
};

export function resolveOrder(params: CheckoutParams): Order | null {
  const pax = Math.max(1, Number(params.pax ?? 2) || 2);

  if (params.kind === "tour" && params.slug) {
    const tour = getTourBySlug(params.slug);
    if (!tour) return null;
    const departure =
      tour.departures.find((d) => d.date === params.date) ?? tour.departures[0];
    if (!departure) return null;

    const quote = buildQuote({
      departure,
      priceBands: tour.priceBands,
      pax,
      singleSupplement: tour.singleSupplement ?? 0,
    });

    return {
      kind: "tour",
      slug: tour.slug,
      title: tour.title,
      strapline: tour.strapline,
      region: tour.region,
      states: tour.states,
      heroAlt: tour.heroAlt,
      startDate: departure.date,
      endDate: departure.endDate,
      travellers: pax,
      lines: quote.lines,
      subtotal: quote.total,
      requiresILP: tour.requiresILP,
      addOns: buildAddOns(tour.states, tour.requiresILP),
    };
  }

  if (params.kind === "moto" && params.slug) {
    const tour = getMotorcycleTourBySlug(params.slug);
    if (!tour) return null;
    const departure =
      tour.departures.find((d) => d.date === params.date) ?? tour.departures[0];
    if (!departure) return null;

    return {
      kind: "moto",
      slug: tour.slug,
      title: tour.title,
      strapline: tour.strapline,
      region: tour.region,
      states: tour.states,
      heroAlt: tour.heroAlt,
      startDate: departure.date,
      endDate: departure.endDate,
      travellers: pax,
      lines: [
        {
          label: `${pax === 1 ? "1 rider" : `${pax} riders`}`,
          amount: departure.perPerson * pax,
        },
      ],
      subtotal: departure.perPerson * pax,
      requiresILP: tour.requiresILP,
      addOns: [
        {
          id: "gear-hire",
          kind: "gear",
          title: "Riding gear hire",
          description:
            "Helmet, armoured jacket, gloves and boots, sized on arrival. Bring your own if you have it — it will fit better.",
          price: 6500,
          perTraveller: true,
        },
        ...buildAddOns(tour.states, tour.requiresILP),
      ],
    };
  }

  if (params.kind === "stay" && params.slug) {
    const stay = getHomestayBySlug(params.slug);
    if (!stay) return null;
    const room =
      stay.rooms.find((r) => r.name === params.room) ?? stay.rooms[0];
    const nights = Math.max(1, Number(params.nights ?? 2) || 2);
    const startDate = params.date ?? "";
    const total = room.perNight * nights;

    return {
      kind: "stay",
      slug: stay.slug,
      title: stay.name,
      strapline: stay.strapline,
      region: stay.region,
      states: [stay.state],
      heroAlt: stay.heroAlt,
      startDate,
      endDate: addDays(startDate, nights),
      travellers: pax,
      variant: room.name,
      lines: [
        {
          label: `${room.name} × ${nights} ${nights === 1 ? "night" : "nights"}`,
          amount: total,
        },
      ],
      subtotal: total,
      requiresILP: [
        "arunachal-pradesh",
        "nagaland",
        "mizoram",
        "manipur",
        "sikkim",
      ].includes(stay.state),
      addOns: buildAddOns([stay.state], false),
    };
  }

  if (params.kind === "event" && params.slug) {
    const event = getEventBySlug(params.slug);
    if (!event) return null;
    const tier =
      event.tickets.find((t) => t.name === params.tier) ?? event.tickets[0];
    const total = tier.price * pax;

    return {
      kind: "event",
      slug: event.slug,
      title: event.name,
      strapline: event.strapline,
      region: event.region,
      states: [event.state],
      heroAlt: event.heroAlt,
      startDate: event.startDate,
      endDate: event.endDate,
      travellers: pax,
      variant: tier.name,
      lines: [
        {
          label: `${tier.name} × ${pax}`,
          amount: total,
          note: tier.price === 0 ? "Free entry — registration only" : undefined,
        },
      ],
      subtotal: total,
      requiresILP: [
        "arunachal-pradesh",
        "nagaland",
        "mizoram",
        "manipur",
      ].includes(event.state),
      addOns: buildAddOns([event.state], false),
    };
  }

  return null;
}

function buildAddOns(states: StateSlug[], requiresILP: boolean): AddOn[] {
  const stays = getHomestaysNear(states, 2);

  return [
    ...(requiresILP
      ? [
          {
            id: "ilp",
            kind: "permit" as const,
            title: "Inner Line Permit processing",
            description:
              "We apply the day your booking is confirmed rather than close to departure. Government fees, where levied, are passed through at cost.",
            price: 0,
          },
        ]
      : []),
    ...stays.map((stay) => ({
      id: `stay-${stay.slug}`,
      kind: "stay" as const,
      title: `Two nights at ${stay.name}`,
      description: `${stay.locality}. ${stay.strapline}.`,
      price: stay.fromPrice * 2,
      imageAlt: stay.heroAlt,
      imageSrc: stay.image,
      region: stay.region,
    })),
    {
      id: "transfer",
      kind: "transfer" as const,
      title: "Private airport transfers",
      description:
        "A private vehicle on arrival and departure rather than the shared group transfer. Worth it on a late flight.",
      price: 4200,
    },
  ];
}

/** Nights covered by an order, for the confirmation summary. */
export function orderNights(order: Order): number {
  return nightsBetween(order.startDate, order.endDate);
}
