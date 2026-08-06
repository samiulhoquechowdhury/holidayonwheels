import { Media } from "@/components/primitives/Media";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { OutboundGlyph } from "@/components/primitives/OutboundLink";
import { Reveal } from "@/components/layout/Reveal";
import { rentalUrl, OUTBOUND_LINK_PROPS } from "@/config/external";

/**
 * Self-drive car and bike hire.
 *
 * These are not sold here — they are operated by Beep Drive, and this section
 * sends people there. It is built to the same standard as everything around
 * it deliberately: an outbound link that looks like an advert gets ignored,
 * and this is a real part of how travellers use the region.
 *
 * The URL comes from src/config/external.ts and is not written anywhere else.
 */

const CARDS = [
  {
    kind: "car" as const,
    title: "Hire a car",
    copy: "Self-drive and chauffeur-driven, across Guwahati, Shillong, Dimapur and Imphal. Useful for the days either side of a guided trip.",
    alt: "A four-wheel-drive vehicle parked on a hill road above a valley in Meghalaya",
    region: "meghalaya" as const,
  },
  {
    kind: "bike" as const,
    title: "Hire a motorcycle",
    copy: "Day and week hire on Himalayans and Classics. If you want a guided route with a support truck, that is our motorcycle expeditions instead.",
    alt: "A row of Royal Enfield motorcycles lined up outside a hire garage in Guwahati, Assam",
    region: "assam" as const,
  },
];

export function RentalsOutbound() {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {CARDS.map((card, index) => (
        <li key={card.kind}>
          <Reveal delay={index * 0.08}>
            <a
              href={rentalUrl({ kind: card.kind })}
              {...OUTBOUND_LINK_PROPS}
              className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-media)] border border-[var(--ink-hairline)] bg-paper"
            >
              <div className="overflow-hidden">
                <Media
                  alt={card.alt}
                  seed={`rental-${card.kind}`}
                  region={card.region}
                  aspect="16/9"
                  sizes="(max-width: 768px) 100vw, 600px"
                  imageClassName="transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-105"
                />
              </div>

              <div className="flex flex-1 flex-col p-6 lg:p-8">
                <div className="flex items-start justify-between gap-4">
                  <Eyebrow tone="soft" as="span">
                    Beep Drive
                  </Eyebrow>
                  <span className="mt-0.5 text-ink-faint">
                    <OutboundGlyph className="h-3 w-3" />
                  </span>
                </div>

                <h3 className="mt-4 text-28">{card.title}</h3>
                <p className="mt-3 flex-1 text-16 text-ink-soft">{card.copy}</p>

                <p className="mt-6 inline-flex items-center gap-2 text-16 underline decoration-[var(--ink-hairline-strong)] underline-offset-8 group-hover:decoration-current">
                  Continue on beepdrive.com
                  <OutboundGlyph />
                </p>
                <span className="u-sr-only">(opens in a new tab)</span>
              </div>
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
