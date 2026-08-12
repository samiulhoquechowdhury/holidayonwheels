import Image from "next/image";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Rise } from "@/components/motion/Rise";
import { ParallaxMedia } from "@/components/motion/Parallax";
import { Accent, Ember } from "@/components/primitives/Accent";
import { editorial } from "@/config/showcase";

/**
 * The statement section — the page's one paragraph of argument, set as
 * display type with a photograph pushed through the middle of it.
 *
 * The overlap is the whole idea. A picture *beside* a headline is a layout; a
 * picture that interrupts the second line, with type running behind and in
 * front of it, is a composition, and the reader registers the difference
 * instantly without being able to say why. It costs one absolutely-positioned
 * element and a `z-index`.
 *
 * It is also where the brand actually argues its case, which is why it sits
 * this high on the page: after the hero has said *what* and before anything
 * has tried to sell. Everything below it is inventory.
 */
export function Manifesto() {
  return (
    <section className="relative isolate overflow-hidden bg-paper py-[var(--section-pad)]">
      <div aria-hidden="true" className="u-grid-lines" />

      <div className="u-container-wide relative">
        <Rise className="u-label mb-12 flex items-center gap-4 text-ink-faint lg:mb-16">
          <span className="h-px w-12 bg-[var(--ink-hairline-strong)]" />
          Why this, and not a package
        </Rise>

        {/* The three lines and the photograph share one relative box. The
            photograph is positioned against it, not against the section, so
            the overlap holds at every breakpoint instead of drifting. */}
        <div className="relative">
          {/*
            The type is held to 74% of the column on desktop and the
            photograph takes the remaining quarter. The two overlap as
            *blocks* — the picture crosses the headline's bounding box and
            sits above it — but no glyph ever runs underneath it. That
            distinction is the whole difference between a layered composition
            and a word you cannot read: the first version of this indented
            line two into the picture and lost the word "states".
          */}
          <SplitReveal
            as="h2"
            className="u-statement relative z-10 text-48 sm:text-64 lg:w-[74%] lg:text-120"
          >
            <span className="block">We do not sell</span>
            <span className="block lg:pl-[14%]">
              the <Accent>eight</Accent> states.
            </span>
            <span className="block">
              We sell the <Ember>week</Ember>
            </span>
            <span className="block lg:pl-[8%]">you spend in them.</span>
          </SplitReveal>

          {/* Drops out of the type entirely below `lg` — an overlap on a
              390px screen is not a composition, it is a collision. */}
          <ParallaxMedia
            amount={18}
            className="mt-10 aspect-[3/2] w-full rounded-[var(--radius-media)] lg:absolute lg:top-[8%] lg:right-0 lg:z-20 lg:mt-0 lg:aspect-[4/5] lg:w-[23%]"
          >
            <Image
              src={editorial.summit}
              alt="Late light on a high snow ridge above the treeline"
              fill
              sizes="(max-width: 1024px) 100vw, 400px"
              className="object-cover"
            />
          </ParallaxMedia>
        </div>

        <Rise
          stagger={0.09}
          className="mt-16 grid gap-10 border-t border-[var(--ink-hairline)] pt-12 sm:grid-cols-3 lg:mt-24 lg:gap-16"
        >
          {POINTS.map((point) => (
            <div key={point.title}>
              {/* A coloured rule above each figure. Three points, three
                  colours from the state palette — the cheapest possible way
                  to make a column of prose feel like part of a joyful system
                  rather than three paragraphs of grey. */}
              <span
                aria-hidden="true"
                className="mb-6 block h-1 w-14 rounded-full"
                style={{ backgroundColor: point.colour }}
              />
              <p
                className="u-num font-display text-36"
                style={{ color: point.ink }}
              >
                {point.figure}
              </p>
              <h3 className="mt-4 text-22">{point.title}</h3>
              <p className="mt-3 text-16 text-ink-soft">{point.copy}</p>
            </div>
          ))}
        </Rise>
      </div>
    </section>
  );
}

/**
 * Three claims, each with a number in front of it.
 *
 * Every one is falsifiable and specific. "Expert local guides" is worth
 * nothing; "a guide who lives in the state you are in" is a promise someone
 * can be held to, and the reader can tell the difference.
 */
const POINTS = [
  {
    figure: "01",
    title: "A guide from the state you are in",
    copy: "Not a driver from Guwahati with a printout. Someone who grew up on the road you are on and can get you into a house for lunch.",
    colour: "var(--marigold)",
    ink: "var(--marigold-ink)",
  },
  {
    figure: "02",
    title: "Permits applied for the day you book",
    copy: "Four of the eight states need an Inner Line Permit. They are refused for late applications, so we do not leave them late.",
    colour: "var(--jade)",
    ink: "var(--jade-ink)",
  },
  {
    figure: "03",
    title: "Twelve travellers, maximum",
    copy: "Above twelve a group stops being a group. Most of our departures run with six or seven, and we cap every one of them.",
    colour: "var(--magenta)",
    ink: "var(--magenta-ink)",
  },
] as const;
