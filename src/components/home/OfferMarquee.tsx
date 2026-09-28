import Link from "next/link";
import { Marquee } from "@/components/motion/Marquee";
import { offers } from "@/config/offers";
import { paletteCycle } from "@/config/palette";

/**
 * What is on offer, running.
 *
 * This band used to carry the eight state names, which was the right content
 * for it when the page had to establish that the map was bigger than anybody
 * expected — but the hero now says "eight states" in 160px type directly
 * above it, and the destinations index says it again directly below. Three
 * statements of the same fact in one screen is one statement and two echoes.
 *
 * So it carries the offers instead. A moving band is the one place on a page
 * where a discount is legible without being shrill: it is short, it is
 * peripheral, and it is gone in a second — which is the opposite of the
 * full-width red sale bar that does the same job on every other travel site.
 *
 * The entries deliberately alternate between coupons and standing terms —
 * free permits, the child rate, the deposit split. A band of nothing but
 * percentages reads as a clearance; one that mixes them reads as a company
 * with terms, which is what actually persuades somebody spending two lakh.
 *
 * Each is a link to where the offer is claimed, so the strip is navigation.
 * A marquee of live links has to be pausable or it is a cruel joke — hovering
 * the strip stops it (`.u-marquee` in globals.css).
 */
export function OfferMarquee() {
  return (
    <section
      aria-label="Current offers"
      className="relative border-y border-[var(--ink-hairline)] bg-shell py-5 lg:py-6"
    >
      <Marquee duration={64}>
        {offers.map((offer, index) => {
          const colour = paletteCycle[index % paletteCycle.length];
          return (
            <Link
              key={offer.id}
              href={offer.href}
              className="group/offer flex shrink-0 items-center gap-4 px-6 lg:gap-5 lg:px-8"
            >
              {offer.code ? (
                /*
                 * The coupon, drawn as a ticket rather than as bold text: a
                 * dashed edge in the offer's own colour is the one visual
                 * shorthand everybody already reads as "something to type in".
                 */
                <span
                  className="u-label shrink-0 rounded-[6px] border border-dashed px-2.5 py-1.5 whitespace-nowrap"
                  style={{
                    color: colour.ink,
                    borderColor: colour.surface,
                    backgroundColor: `color-mix(in srgb, ${colour.surface} 10%, transparent)`,
                  }}
                >
                  {offer.code}
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: colour.surface }}
                />
              )}

              <span className="flex items-baseline gap-3 whitespace-nowrap">
                <span
                  className="font-display text-22 text-ink transition-colors duration-[var(--dur-micro)] ease-brand lg:text-28"
                  style={{ ["--hover-colour" as string]: colour.ink }}
                >
                  <span className="group-hover/offer:[color:var(--hover-colour)]">
                    {offer.headline}
                  </span>
                </span>
                <span className="u-label hidden text-ink-faint sm:inline">
                  {offer.terms}
                </span>
              </span>

              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rotate-45"
                style={{ backgroundColor: colour.surface }}
              />
            </Link>
          );
        })}
      </Marquee>
    </section>
  );
}
