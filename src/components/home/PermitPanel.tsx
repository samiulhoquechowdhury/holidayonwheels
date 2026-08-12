import Image from "next/image";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Rise } from "@/components/motion/Rise";
import { ParallaxMedia } from "@/components/motion/Parallax";
import { Accent } from "@/components/primitives/Accent";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { getILPStates } from "@/content/destinations";
import { editorial } from "@/config/showcase";

/**
 * Inner Line Permits.
 *
 * This section exists to remove an objection, not to sell anything, and it is
 * designed accordingly: no photography competing for attention behind the
 * type, no price, and the four states listed as a plain hairline table
 * because that is genuinely what the information is. Dressing a reference
 * table up as four cards would make it slower to read and no more convincing.
 *
 * The one photograph is pushed to the edge of the frame and parallaxed
 * slowly. It is there to stop the section reading as a form.
 */
export function PermitPanel() {
  const states = getILPStates();

  return (
    <section className="relative bg-paper py-[var(--section-pad)]">
      <div className="u-container-wide">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-24">
          <div>
            <Rise className="u-label mb-6 flex items-center gap-4 text-jade-ink">
              <span className="h-px w-12 bg-jade" />
              Inner Line Permits
            </Rise>

            <SplitReveal className="text-48 lg:text-88">
              Four of the eight need a <Accent>permit</Accent>. We do the
              paperwork.
            </SplitReveal>

            <Rise delay={0.1}>
              <p className="u-lede mt-8 max-w-xl text-18 text-ink-soft">
                An Inner Line Permit lets an Indian citizen enter a protected
                state. They are not difficult, but they are refused for name
                mismatches and they are refused for late applications — so we
                apply the day your booking is confirmed, at no charge.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <LuxeButtonLink href="/ilp/apply" variant="primary">
                  Start an application
                </LuxeButtonLink>
                <LuxeButtonLink href="/ilp" variant="ghost">
                  How permits work
                </LuxeButtonLink>
              </div>
            </Rise>
          </div>

          {/* The table, and one photograph anchoring it. */}
          <div className="relative">
            <ParallaxMedia
              amount={12}
              className="hidden aspect-[3/2] rounded-[var(--radius-media)] lg:block"
            >
              <Image
                src={editorial.forestStream}
                alt="A stream running through deep forest"
                fill
                sizes="(max-width: 1024px) 0px, 46vw"
                className="object-cover"
              />
            </ParallaxMedia>

            <Rise
              as="ul"
              stagger={0.07}
              className="border-t border-[var(--ink-hairline)] lg:mt-10"
            >
              {states.map((state) => (
                <li
                  key={state.slug}
                  className="flex items-baseline justify-between gap-6 border-b border-[var(--ink-hairline)] py-5"
                >
                  <span className="font-display text-22 lg:text-28">
                    {state.name}
                  </span>
                  <span className="u-label shrink-0 text-right text-ink-faint">
                    {state.requiresPAP
                      ? "ILP · PAP for foreign nationals"
                      : "ILP"}
                  </span>
                </li>
              ))}
            </Rise>

            <Rise delay={0.2}>
              <p className="u-label mt-6 text-jade-ink">
                Applied within 24 hours of confirmation · No fee
              </p>
            </Rise>
          </div>
        </div>
      </div>
    </section>
  );
}
