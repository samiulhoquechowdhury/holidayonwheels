import Image from "next/image";
import Link from "next/link";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Rise } from "@/components/motion/Rise";
import { Accent } from "@/components/primitives/Accent";
import { ArrowGlyph } from "@/components/primitives/ArrowGlyph";
import { getDestinations } from "@/content/destinations";
import { stateShots } from "@/config/showcase";
import { stateColours } from "@/config/palette";

/**
 * The eight states, as a stack of rows.
 *
 * Rebuilt on the journey-modes device, which is the strongest row pattern on
 * this site and was sitting unused: the row inverts to the state's own colour
 * on hover, its photograph tilts out of the row breaking its own edges, and
 * four specifics sit on the line where a tile would have hidden them behind a
 * click.
 *
 * Two things changed on the way across, and both are improvements rather than
 * ports.
 *
 * **The fill is the `-ink` step, not `surface`.** Journey modes could use its
 * surface colours because all four were picked to carry `--night-text` at AA
 * — the comment there says so, and names the two palette colours excluded for
 * failing. The eight state surfaces were picked for something else entirely:
 * they are map keys, read as dots and rules, never as a ground under text.
 * Measured against `--night-text`, five of the eight fail as a text ground —
 * Sikkim's marigold worst at 2.02:1, with Assam, Meghalaya, Nagaland and
 * Mizoram between 3.0 and 4.2. The darkened `-ink` step passes on all eight,
 * 4.98:1 to 8.88:1, so one text colour works across the whole list and the
 * one-vocabulary rule survives. `surface` keeps its job on the legend dots
 * and the row number, where it is a mark on paper rather than a ground.
 *
 * **It is no longer a client component.** The old version ran a GSAP
 * quickTo follower that tracked the cursor with a 300×380 preview, which
 * meant `useState`, `useRef`, a pointer handler and the whole GSAP bundle for
 * one section. Every state here is `group-hover` and `group-focus-visible`,
 * so it works before hydration, works from the keyboard, and ships no
 * JavaScript at all.
 */
export function StateIndex() {
  const states = getDestinations();

  return (
    <section className="relative bg-butter py-[var(--section-pad)]">
      <div className="u-container-wide">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[var(--ink-hairline-strong)] pb-12">
          <div>
            <Rise className="u-label mb-6 flex items-center gap-4 text-ink-faint">
              <span className="h-px w-12 bg-[var(--ink-hairline-strong)]" />
              The eight states · west to east
            </Rise>
            <SplitReveal className="max-w-3xl text-48 lg:text-88">
              Which one are you <Accent>drawn</Accent> to?
            </SplitReveal>
          </div>
          <Rise delay={0.15}>
            <p className="max-w-xs text-16 text-ink-soft">
              Less alike than the map makes them look — different languages,
              different food, different altitudes. Four of the eight need an
              Inner Line Permit, and we raise it for you.
            </p>
          </Rise>
        </div>

        <Rise as="ul" stagger={0.06} className="mt-4">
          {states.map((state, index) => {
            const colour = stateColours[state.slug];
            const tags = [
              state.knownFor[0],
              state.knownFor[1],
              state.requiresILP ? "Inner Line Permit" : "No permit needed",
              `Best in ${state.bestMonths.length} months`,
            ].filter(Boolean);

            return (
              <li key={state.slug}>
                <Link
                  href={`/destinations/${state.slug}`}
                  className="group relative isolate flex items-center gap-5 border-b border-[var(--ink-hairline)] py-7 transition-colors duration-[var(--dur)] ease-brand hover:border-transparent focus-visible:border-transparent lg:gap-12 lg:py-10"
                >
                  {/* The coloured ground, wiping up from the baseline on the
                      same curve as the buttons. Flush with the container on a
                      phone: at 390px the gutter is narrower than the bleed,
                      and a fill wider than the viewport is horizontal scroll. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 origin-bottom scale-y-0 rounded-[var(--radius-card)] transition-transform duration-[var(--dur)] ease-brand group-hover:scale-y-100 group-focus-visible:scale-y-100 sm:inset-x-[-1.5rem] lg:inset-x-[-2.5rem]"
                    style={{ backgroundColor: colour.ink }}
                  />

                  <span
                    className="u-num u-label w-8 shrink-0 transition-colors duration-[var(--dur)] ease-brand group-hover:text-night-text"
                    style={{ color: colour.ink }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-28 leading-[var(--leading-display)] tracking-[var(--tracking-display)] transition-colors duration-[var(--dur)] ease-brand group-hover:text-night-text lg:text-48">
                      {state.name}
                    </span>
                    <span className="mt-2 block max-w-md text-16 text-ink-soft transition-colors duration-[var(--dur)] ease-brand group-hover:text-night-text-soft lg:mt-3">
                      {state.tagline}
                    </span>
                  </span>

                  {/* The photograph, tilted out of the row. Desktop only — an
                      overlap this aggressive on a phone is a collision. It
                      lands in the gutter between the copy and the tags. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-[48%] hidden h-44 w-32 -translate-y-1/2 scale-75 rotate-[-8deg] overflow-hidden rounded-[14px] opacity-0 shadow-[var(--shadow-lift)] transition-all duration-[var(--dur)] ease-brand group-hover:scale-100 group-hover:rotate-[-5deg] group-hover:opacity-100 lg:block"
                  >
                    <Image
                      src={stateShots[state.slug] ?? ""}
                      alt=""
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                  </span>

                  <span className="hidden shrink-0 gap-x-8 gap-y-2 lg:grid lg:grid-cols-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="u-label flex items-center gap-2 text-ink-faint transition-colors duration-[var(--dur)] ease-brand group-hover:text-night-text-soft"
                      >
                        <span
                          aria-hidden="true"
                          className="size-1 shrink-0 bg-current"
                        />
                        {tag}
                      </span>
                    ))}
                  </span>

                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--ink-hairline-strong)] transition-colors duration-[var(--dur)] ease-brand group-hover:border-clay group-hover:bg-clay group-hover:text-clay-on">
                    <ArrowGlyph className="transition-transform duration-[var(--dur)] ease-brand motion-safe:group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </Rise>
      </div>
    </section>
  );
}
