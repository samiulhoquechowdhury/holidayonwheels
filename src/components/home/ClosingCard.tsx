import Image from "next/image";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Rise } from "@/components/motion/Rise";
import { ParallaxMedia } from "@/components/motion/Parallax";
import { Accent } from "@/components/primitives/Accent";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { editorial } from "@/config/showcase";
import { site } from "@/config/site";

/**
 * The last thing on the page.
 *
 * An inset card rather than a full-bleed band: it floats inside the paper
 * with a margin all the way round, which closes the document instead of
 * running it off the bottom of the screen. The hero opens with a framed
 * object and the page ends with one — the composition is a bracket.
 *
 * The ask is deliberately the smallest one available. Everything above this
 * has offered "book" four times; a reader who has come this far and not
 * booked does not want a fifth booking button, they want a person. So the
 * primary action is a question, the secondary is the catalogue, and the
 * phone number is in plain text underneath because some people would simply
 * rather ring.
 */
export function ClosingCard() {
  return (
    <section className="bg-paper pb-[var(--section-pad)]">
      <div className="u-container-wide">
        <div className="is-dark relative isolate overflow-hidden rounded-[var(--radius-frame)] bg-night px-6 py-20 text-center text-night-text sm:px-12 lg:px-16 lg:py-32">
          <ParallaxMedia
            amount={20}
            className="pointer-events-none absolute inset-0 -z-10 opacity-30"
          >
            <Image
              src={editorial.nightRange}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
          </ParallaxMedia>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_50%_0%,rgb(42_38_33/0.35),rgb(28_25_21/0.92))]"
          />
          {/* Three coloured glows bled into the corners of the dark card.
              They cost one gradient each and they are the difference between
              a black panel and a black panel that feels lit from somewhere. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_60%_at_12%_15%,var(--magenta),transparent_70%),radial-gradient(45%_60%_at_88%_20%,var(--indigo),transparent_70%),radial-gradient(60%_70%_at_50%_115%,var(--marigold),transparent_70%)] opacity-55 mix-blend-screen"
          />
          <div aria-hidden="true" className="u-grid-lines -z-10" />

          <Rise className="u-label mx-auto mb-10 inline-flex items-center gap-3 rounded-full border border-[var(--night-hairline)] px-5 py-2.5 text-night-text-soft">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-ember"
            />
            Replies within a working day
          </Rise>

          <SplitReveal
            as="h2"
            className="u-statement mx-auto max-w-5xl text-48 sm:text-64 lg:text-120"
          >
            Not sure which of the <Accent>eight</Accent> you want yet?
          </SplitReveal>

          <Rise delay={0.1}>
            <p className="u-lede mx-auto mt-8 max-w-xl text-18 text-night-text-soft">
              Tell us roughly when you can travel and what you are hoping for.
              Someone who has actually been will write back — not a form
              response, and not a brochure.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <LuxeButtonLink href="/contact" variant="onDark" size="lg">
                Ask us a question
              </LuxeButtonLink>
              <LuxeButtonLink href="/tours" variant="clay" size="lg">
                Browse the catalogue
              </LuxeButtonLink>
            </div>

            <p className="u-label mt-10 text-night-text-soft">
              Or call {site.contact.phone} · {site.contact.address}
            </p>
          </Rise>
        </div>
      </div>
    </section>
  );
}
