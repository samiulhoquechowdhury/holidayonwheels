import Image from "next/image";
import { Rise } from "@/components/motion/Rise";
import { Accent } from "@/components/primitives/Accent";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { creatorReels } from "@/config/creators";

/**
 * The creator programme, on the home page.
 *
 * Pictures on one side, the ask on the other, and the pictures are the
 * argument: this is a band aimed at somebody who makes things for a living,
 * and the fastest way to interest them is to show what the last person came
 * back with rather than to describe a partnership.
 *
 * Three frames stacked as an overlapping fan rather than a neat row of
 * thumbnails. A reel is a vertical object and a fan of them reads as a feed
 * at a glance — a grid of three equal tiles would read as a gallery, which is
 * what every other section on this page already is. The middle one stands
 * proud and carries the play glyph; the outer two are tilted and dimmed, so
 * the group has a front and a back instead of being three peers.
 *
 * Placed late on the page on purpose. This is the only band addressed to
 * somebody who is not buying a holiday, and putting a second audience's ask
 * in the middle of the first audience's argument costs more than the position
 * gains. It sits after the journal, where the page has already stopped
 * selling and started talking.
 */
export function CreatorBand() {
  const frames = creatorReels.slice(0, 3);

  return (
    /*
     * `mb`, not `pb`.
     *
     * `ClosingCard` below carries no top padding at all — it never needed any,
     * because everything that used to precede it was a paper section with its
     * own bottom padding. This band is full-bleed night, so its bottom edge
     * met the closing card's dark panel with nothing between them and the two
     * read as one shapeless dark mass. More bottom *padding* would only have
     * made that mass taller; a margin lets the page's paper through, which is
     * the gap that was missing.
     */
    <section className="relative mb-16 overflow-hidden bg-night py-[var(--section-pad)] text-night-text lg:mb-24">
      <div className="u-container-wide">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          {/* --- The fan ------------------------------------------------ */}
          <Rise>
            {/*
             * The fan *closes* when you point at it: the two behind slide in
             * and straighten until the front card covers them, and the front
             * card lifts as they go. A stack collapsing into one object is a
             * gesture the phone already taught everybody, and it keeps the
             * whole thing inside the same footprint — the fan opening outwards
             * pushed its edges towards the copy beside it and, at the widths
             * where this column is narrowest, towards the edge of the section.
             *
             * They tuck behind rather than fading. The middle card is 36% of
             * the row and the outer two are 30%, so 85% of their own width is
             * the shift that puts each one fully inside the front card's
             * footprint — enough that no sliver shows past the rounded corner,
             * not so much that they overshoot and reappear on the far side.
             *
             * `group/fan` is on the list rather than the middle card, so the
             * whole stack responds wherever the pointer lands on it — chasing
             * the front card to trigger it would be a worse interaction than
             * none. `motion-safe` stands the whole thing down under reduced
             * motion, where the fan simply stays as it is.
             */}
            <ul className="group/fan relative mx-auto flex max-w-lg items-center justify-center lg:mx-0 lg:max-w-none">
              {frames.map((reel, index) => {
                const middle = index === 1;
                return (
                  <li
                    key={reel.id}
                    className={[
                      "relative aspect-[9/16] w-[30%] shrink-0 overflow-hidden rounded-[var(--radius-card)]",
                      "border border-[rgb(250_247_242/0.16)] shadow-[0_24px_60px_-24px_rgb(0_0_0/0.8)]",
                      // Tailwind v4 writes rotate/scale/translate as their own CSS
                      // properties rather than composing a `transform`, so a
                      // transition list naming `transform` animates nothing:
                      // the cards snapped to their hover position while only
                      // the opacity faded. Name the three that actually move.
                      "transition-[translate,rotate,scale,opacity] duration-[var(--dur)] ease-brand",
                      // At rest the outer two lean away from centre. On hover
                      // they slide inward and straighten until the front card
                      // hides them; the front card lifts to meet them.
                      middle
                        ? "z-10 w-[36%] scale-[1.06] motion-safe:group-hover/fan:-translate-y-2 motion-safe:group-hover/fan:scale-[1.1]"
                        : "opacity-70 motion-safe:group-hover/fan:rotate-0 " +
                          (index === 0
                            ? "-mr-[5%] origin-bottom-right -rotate-6 motion-safe:group-hover/fan:translate-x-[85%]"
                            : "-ml-[5%] origin-bottom-left rotate-6 motion-safe:group-hover/fan:-translate-x-[85%]"),
                    ].join(" ")}
                  >
                    <Image
                      src={reel.image}
                      alt={reel.alt}
                      fill
                      sizes="(max-width: 1024px) 34vw, 210px"
                      className="object-cover"
                    />
                    {middle ? (
                      <>
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-t from-[rgb(20_18_15/0.7)] to-transparent"
                        />
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 grid place-items-center"
                        >
                          <span className="grid size-12 place-items-center rounded-full border border-[rgb(250_247_242/0.55)] bg-[rgb(20_18_15/0.3)] backdrop-blur-sm">
                            <svg
                              viewBox="0 0 12 12"
                              className="size-3.5 translate-x-[1px] fill-current"
                              focusable="false"
                            >
                              <path d="M3 1.5v9l7-4.5z" />
                            </svg>
                          </span>
                        </span>
                        {/* Truncated: at 390 the middle tile is about 140px wide and a
                            longer handle was being cut mid-glyph rather than
                            ending cleanly. */}
                        <span className="u-label absolute inset-x-0 bottom-0 truncate p-3 text-night-text sm:p-4">
                          {reel.handle}
                        </span>
                      </>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Rise>

          {/* --- The ask ------------------------------------------------ */}
          <Rise delay={0.12}>
            <Eyebrow tone="onDark">Creator programme</Eyebrow>
            <h2 className="mt-6 max-w-xl text-36 lg:text-64">
              {/* `Accent` is an inline-block, so a question mark set straight
                  after it is a separate breakable token — at 1440 it wrapped
                  to the next line on its own, four characters from the word
                  it belongs to. Bound to it here rather than reworded. */}
              Are you a{" "}
              <span className="whitespace-nowrap">
                <Accent>creator</Accent>?
              </span>{" "}
              Come and shoot the road.
            </h2>
            <p className="mt-6 max-w-lg text-18 text-night-text-soft lg:text-22">
              A seat on a scheduled departure across the eight states — vehicle,
              guide, rooms and permits on us — in exchange for the work you were
              going to make anyway. The footage stays yours.
            </p>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {[
                "Trip fully covered",
                "You keep the rights",
                "A code for your audience",
              ].map((point) => (
                <li
                  key={point}
                  className="u-label flex items-center gap-2.5 text-night-text-soft"
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-clay"
                  />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <LuxeButtonLink
                href="/influencers#apply"
                variant="clay"
                size="lg"
              >
                Register as a creator
              </LuxeButtonLink>
              <LuxeButtonLink href="/influencers" variant="onDark" size="lg">
                See their work
              </LuxeButtonLink>
            </div>
          </Rise>
        </div>
      </div>
    </section>
  );
}
