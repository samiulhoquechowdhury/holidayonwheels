import type { FaqItem, Policy } from "./types";

/** FAQ, policies and the small amount of static marketing copy. */

const faqs: FaqItem[] = [
  {
    topic: "permits",
    question: "Which states need an Inner Line Permit?",
    answer:
      "Four of the eight require one from Indian nationals: Arunachal Pradesh, Nagaland, Mizoram and Manipur. Sikkim requires permits for specific protected areas — north Sikkim, Nathu La and Tsomgo — rather than for the state as a whole. Assam, Meghalaya and Tripura require none.",
  },
  {
    topic: "permits",
    question: "Do you charge for permit processing?",
    answer:
      "No. We process Inner Line Permits for every traveller on every booking at no additional charge. Government fees, where a state levies one, are passed through at cost and shown separately.",
  },
  {
    topic: "permits",
    question: "I hold a foreign passport. Is it different?",
    answer:
      "Yes. Foreign nationals need a Protected Area Permit rather than an Inner Line Permit for Arunachal Pradesh and parts of Sikkim, and it takes longer to obtain — for some nationalities, considerably longer. Start the conversation with us at least eight weeks before you travel.",
  },
  {
    topic: "permits",
    question: "How long does a permit take?",
    answer:
      "Arunachal Pradesh, Nagaland and Mizoram now issue electronically and typically turn around within three to seven working days. Manipur is more variable. We apply as soon as your booking is confirmed rather than close to departure.",
  },
  {
    topic: "booking",
    question: "How far ahead should I book?",
    answer:
      "For the Hornbill Festival, a year — accommodation in Kohima genuinely sells out that far out. For high-altitude departures in the April–May and September–October windows, three to four months. For Assam and Meghalaya outside peak season, six weeks is usually comfortable.",
  },
  {
    topic: "booking",
    question: "What is the deposit?",
    answer:
      "Twenty-five per cent of the total at the time of booking, with the balance due sixty days before departure. Bookings made inside sixty days are payable in full.",
  },
  {
    topic: "booking",
    question: "Do you run private departures?",
    answer:
      "Yes. Any tour in the catalogue can be run privately on dates of your choosing, and the honeymoon and couple itineraries are private by default. Private departures are priced per party rather than per seat.",
  },
  {
    topic: "booking",
    question: "I am travelling alone. Do I pay a single supplement?",
    answer:
      "On most departures, yes — it covers the room we cannot fill. On every tour tagged for solo travellers the supplement is waived and a single room is the default. Those are marked clearly on the tour page.",
  },
  {
    topic: "travel",
    question: "How do I get to the region?",
    answer:
      "Guwahati is the main gateway with direct flights from most Indian metros. Dimapur serves Nagaland, Imphal serves Manipur, Agartala serves Tripura, Aizawl serves Mizoram, and Bagdogra serves Sikkim. Every itinerary lists its start and end airport.",
  },
  {
    topic: "travel",
    question: "Is the region safe?",
    answer:
      "Assam, Meghalaya, Sikkim, Arunachal Pradesh, Nagaland, Mizoram and Tripura are straightforward for travellers and have been for years. Manipur has seen periods of unrest; we monitor advisories continuously and will tell you plainly if a departure should not run, and refund in full if we cancel.",
  },
  {
    topic: "travel",
    question: "What should I pack for the high-altitude routes?",
    answer:
      "More warm layers than the temperature chart suggests. Sela and Gurudongmar are cold, windy and exposed even in what the plains consider summer. We send a route-specific kit list once your booking is confirmed.",
  },
  {
    topic: "travel",
    question: "Can you cater for dietary requirements?",
    answer:
      "Vegetarian, vegan and Jain food can be arranged everywhere, but tell us at booking rather than on arrival — several of our homestays are a long way from a shop, and in Naga and Mizo households the default is emphatically not vegetarian.",
  },
  {
    topic: "payment",
    question: "What payment methods do you accept?",
    answer:
      "UPI, net banking, all major credit and debit cards, and international bank transfer. Prices are quoted and charged in Indian rupees.",
  },
  {
    topic: "payment",
    question: "Are prices per person?",
    answer:
      "Tour and motorcycle prices are per person on a twin-share basis unless stated otherwise. Homestay prices are per room per night. Event prices are per ticket. Every price on the site says which it is.",
  },
  {
    topic: "motorcycle",
    question: "What experience do I need for a motorcycle tour?",
    answer:
      "It varies by route and each one states its requirement explicitly. The Meghalaya loop is suitable for a first guided tour. The north Sikkim high road requires previous experience above four thousand metres and we do decline riders for it.",
  },
  {
    topic: "motorcycle",
    question: "Can I ride pillion instead of taking a bike?",
    answer:
      "Yes, on every motorcycle departure, at roughly seventy per cent of the rider price. Pillion places are limited by the number of bikes in the group, so book them early.",
  },
  {
    topic: "motorcycle",
    question: "Is riding gear included?",
    answer:
      "No — helmet, jacket, gloves and boots are yours to bring. We can hire a full set locally if you ask at least two weeks before departure, and we would rather you told us than turned up in trainers.",
  },
  {
    topic: "motorcycle",
    question: "What happens if my bike breaks down?",
    answer:
      "The support truck carries a mechanic, common spares and a spare front wheel, and travels with the group throughout. If a bike cannot be fixed at the roadside it goes in the truck and you ride the spare.",
  },
];

const policies: Policy[] = [
  {
    slug: "terms",
    title: "Terms of service",
    updatedAt: "2026-07-01",
    sections: [
      {
        heading: "About these terms",
        body: [
          "These terms govern bookings made through this site. They are written to be read, and if anything here is unclear we would rather you asked before booking than after.",
          "A booking is a contract between you and us. Where a third party — an airline, a homestay, a festival organiser — supplies part of your trip, their own terms may also apply and we will tell you when that is the case.",
        ],
      },
      {
        heading: "Making a booking",
        body: [
          "A booking is confirmed when we have received your deposit and issued a written confirmation. Until both have happened, no place is held.",
          "You are responsible for the accuracy of the traveller details you give us, particularly names as they appear on identity documents. Permit applications are rejected for name mismatches and re-application takes time we may not have.",
        ],
      },
      {
        heading: "Prices and payment",
        body: [
          "Prices are quoted in Indian rupees and are per person on a twin-share basis unless the product page states otherwise.",
          "A deposit of twenty-five per cent is due at booking. The balance is due sixty days before departure. Bookings made inside sixty days are payable in full at the time of booking.",
        ],
      },
      {
        heading: "Permits",
        body: [
          "We process Inner Line Permits at no charge for travellers on our bookings. Government fees are passed through at cost.",
          "We cannot guarantee that a state authority will grant a permit. Where a permit is refused for reasons outside our control, our cancellation terms apply, and we will always try to move you to an alternative departure first.",
        ],
      },
      {
        heading: "Your responsibilities",
        body: [
          "You must hold valid travel and medical insurance for the duration of your trip, and we may ask to see it.",
          "You must tell us at booking about any medical condition, dietary requirement or mobility limitation that could affect your trip or the group. Several of our routes are remote and some are at altitude.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    updatedAt: "2026-07-01",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Contact details, traveller names and dates of birth, identity document numbers where a permit requires them, payment records, and the content of your correspondence with us.",
          "We collect identity document details only where a state permit authority requires them, and only for the travellers on that permit.",
        ],
      },
      {
        heading: "Why we hold it",
        body: [
          "To take and fulfil your booking, to apply for permits on your behalf, to meet our legal and tax obligations, and to contact you about a trip you have booked.",
          "We do not sell personal data, and we do not share it with anyone other than the suppliers and authorities directly involved in delivering your trip.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Booking and financial records are kept for eight years to meet Indian tax requirements. Permit records are kept for three years. Marketing contact details are kept until you ask us to remove them.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You may ask for a copy of the personal data we hold about you, ask us to correct it, or ask us to delete anything we are not legally required to keep. Write to us and we will respond within thirty days.",
        ],
      },
    ],
  },
  {
    slug: "cancellation",
    title: "Cancellation and refunds",
    updatedAt: "2026-07-01",
    sections: [
      {
        heading: "If you cancel",
        body: [
          "More than 60 days before departure: your deposit is retained, everything else is refunded.",
          "Between 60 and 30 days: fifty per cent of the total is retained.",
          "Between 30 and 15 days: seventy-five per cent of the total is retained.",
          "Inside 15 days, or no-show: no refund is due. This is not us being difficult — by that point the rooms, permits and vehicles are paid for.",
        ],
      },
      {
        heading: "If we cancel",
        body: [
          "If we cancel a departure for any reason within our control, you receive a full refund or a transfer to another departure, whichever you prefer.",
          "If we cancel because of a security advisory, a natural event or a government restriction, you receive a full refund of everything we have not already paid to a supplier on your behalf, and we will work to recover the rest.",
        ],
      },
      {
        heading: "Weather, roads and altitude",
        body: [
          "High-altitude routes are subject to weather and to road closures we do not control. Sela Pass and the north Sikkim roads can close at short notice.",
          "Where a specific viewpoint or pass cannot be reached, we substitute the best available alternative. No refund is due for a viewpoint the weather did not allow — this is stated on every high-altitude itinerary before you book.",
        ],
      },
      {
        heading: "Homestays and events",
        body: [
          "Homestay bookings cancelled more than 14 days ahead are refunded in full less a ten per cent administration fee. Inside 14 days, one night is retained.",
          "Event tickets are non-refundable once issued, because the organisers do not refund us.",
        ],
      },
    ],
  },
  {
    slug: "responsible-travel",
    title: "Responsible travel",
    updatedAt: "2026-07-01",
    sections: [
      {
        heading: "Where the money goes",
        body: [
          "Every homestay on this site is owned and run by the family living in it, and they set their own rates. We take a booking commission and nothing else.",
          "Guides are hired from the state they guide in. We do not send a Guwahati guide to Nagaland.",
        ],
      },
      {
        heading: "Photography",
        body: [
          "Ask before photographing anyone, and accept a refusal without negotiating. This matters particularly in Konyak and Apatani villages, where visitors have historically taken a great many photographs and given very little back.",
          "Several monasteries and sacred groves prohibit photography entirely. Your guide will tell you where.",
        ],
      },
      {
        heading: "What not to take",
        body: [
          "Nothing may be removed from a Khasi sacred grove — not a stone, not a fallen leaf. This is not a guideline.",
          "Sikkim has banned single-use plastics statewide. Bring a refillable bottle; we carry filtered water in every vehicle.",
        ],
      },
      {
        heading: "Wildlife",
        body: [
          "Park speed limits and distance rules exist because rhino and elephant are killed by vehicles every year. Our drivers keep to them and will not be persuaded otherwise for a photograph.",
          "We do not offer elephant-back safaris anywhere in the region.",
        ],
      },
    ],
  },
];

const policyBySlug = new Map(policies.map((p) => [p.slug, p]));

export function getFaqs(): FaqItem[] {
  return faqs;
}

export function getFaqTopics(): FaqItem["topic"][] {
  return Array.from(new Set(faqs.map((f) => f.topic)));
}

export function getPolicies(): Policy[] {
  return policies;
}

export function getPolicyBySlug(slug: string): Policy | undefined {
  return policyBySlug.get(slug);
}
