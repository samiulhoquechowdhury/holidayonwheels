import Image from "next/image";
import Link from "next/link";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Rise } from "@/components/motion/Rise";
import { Accent } from "@/components/primitives/Accent";
import { ArrowGlyph } from "@/components/primitives/ArrowGlyph";
import { journeyShots } from "@/config/showcase";

/**
 * The four ways in, as a stack of rows rather than a grid of tiles.
 *
 * This is the page's most important navigational moment — it is where a
 * visitor self-selects — and rows beat tiles for it decisively. A row can
 * carry the title, the argument for it, and its three defining specifics on
 * one line at a glance; a tile has to hide two of those behind a click. Four
 * rows also read as a *menu of considered options*, where four photo tiles
 * read as a category grid on a marketplace.
 *
 * The hover is the whole design: the row inverts to the dark ground, and a
 * photograph tilts out of it, breaking the row's own edges. Overlapping its
 * container is what makes it feel like an object being pulled from a drawer
 * rather than an image fading in — and it is the reason the list does not
 * clip its overflow.
 *
 * No JavaScript. Every state here is `group-hover` and `group-focus-within`,
 * which means it works before hydration and it works from the keyboard.
 */
export function JourneyModes() {
  return (
    <section className="relative bg-paper py-[var(--section-pad)]">
      <div className="u-container-wide">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-[var(--ink-hairline)] pb-12">
          <div>
            <Rise className="u-label mb-6 flex items-center gap-4 text-ink-faint">
              <span className="h-px w-12 bg-[var(--ink-hairline-strong)]" />
              Start here
            </Rise>
            <SplitReveal className="max-w-3xl text-48 lg:text-88">
              How are you <Accent>travelling</Accent>?
            </SplitReveal>
          </div>
          <Rise delay={0.15}>
            <p className="max-w-xs text-16 text-ink-soft">
              The same eight states, run four different ways. It changes the
              pace, the group and the vehicle more than it changes the map.
            </p>
          </Rise>
        </div>

        <Rise as="ul" stagger={0.08} className="mt-4">
          {MODES.map((mode) => (
            <li key={mode.href}>
              <Link
                href={mode.href}
                className="group relative isolate flex items-center gap-6 border-b border-[var(--ink-hairline)] py-8 transition-colors duration-[var(--dur)] ease-brand hover:border-transparent focus-visible:border-transparent lg:gap-12 lg:py-11"
              >
                {/* The coloured ground. A scaled layer rather than a
                    background colour change, so it wipes up from the baseline
                    on the same curve as the buttons — one motion vocabulary.
                    Each row has its own colour, so running the cursor down
                    the list is the most colourful thing on the page. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-[-1.5rem] inset-y-0 -z-10 origin-bottom scale-y-0 rounded-[var(--radius-card)] transition-transform duration-[var(--dur)] ease-brand group-hover:scale-y-100 group-focus-visible:scale-y-100 lg:inset-x-[-2.5rem]"
                  style={{ backgroundColor: mode.colour }}
                />

                <span
                  className="u-num u-label w-10 shrink-0 transition-colors duration-[var(--dur)] ease-brand group-hover:text-night-text"
                  style={{ color: mode.ink }}
                >
                  {mode.index}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-display text-28 leading-[var(--leading-display)] tracking-[var(--tracking-display)] transition-colors duration-[var(--dur)] ease-brand group-hover:text-night-text lg:text-48">
                    {mode.title}
                  </span>
                  <span className="mt-2 block max-w-md text-16 text-ink-soft transition-colors duration-[var(--dur)] ease-brand group-hover:text-night-text-soft lg:mt-3">
                    {mode.copy}
                  </span>
                </span>

                {/* The photograph, tilted out of the row.
                    Desktop only — an overlap this aggressive on a phone is a
                    collision. It lands in the empty gutter between the copy
                    column and the tag columns: at 38% it sat on top of the
                    row's own title, which is a photograph interrupting the
                    thing it is illustrating. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-[48%] hidden h-44 w-32 -translate-y-1/2 scale-75 rotate-[-8deg] overflow-hidden rounded-[14px] opacity-0 shadow-[var(--shadow-lift)] transition-all duration-[var(--dur)] ease-brand group-hover:scale-100 group-hover:rotate-[-5deg] group-hover:opacity-100 lg:block"
                >
                  <Image
                    src={mode.image}
                    alt=""
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                </span>

                <span className="hidden shrink-0 gap-x-8 gap-y-2 lg:grid lg:grid-cols-2">
                  {mode.tags.map((tag) => (
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
          ))}
        </Rise>
      </div>
    </section>
  );
}

/**
 * Four rows, four colours.
 *
 * All four fills are dark enough to carry `--night-text` at AA — that is the
 * constraint that picked them, not taste. Marigold and sky are in the palette
 * and are deliberately *not* here: white type on either fails, and a row that
 * has to swap its text colour breaks the one-vocabulary rule.
 */
const MODES = [
  {
    index: "01",
    title: "Guided tours",
    copy: "A private vehicle, a guide from the state, and nothing scheduled before nine.",
    tags: ["For two", "Honeymoons", "Small groups", "Families"],
    href: "/tours",
    image: journeyShots.couple,
    colour: "var(--jade)",
    ink: "var(--jade-ink)",
  },
  {
    index: "02",
    title: "Motorcycle expeditions",
    copy: "Fixed departures with a support truck carrying a mechanic, spares, fuel and oxygen.",
    tags: [
      "Royal Enfield",
      "Support truck",
      "Sag wagon",
      "Oxygen above 4,000m",
    ],
    href: "/motorcycle-tours",
    image: journeyShots.solo,
    colour: "var(--naga)",
    ink: "var(--naga-ink)",
  },
  {
    index: "03",
    title: "Family homestays",
    copy: "Rooms in houses that people live in, at rates the families set themselves.",
    tags: ["Family-run", "Full board", "Village", "No road, sometimes"],
    href: "/homestays",
    image: journeyShots.group,
    colour: "var(--indigo)",
    ink: "var(--indigo-ink)",
  },
  {
    index: "04",
    title: "Festivals and events",
    copy: "Trips timed to Hornbill, Ziro and Bihu, booked around accommodation that sells out a year ahead.",
    tags: ["Hornbill", "Ziro", "Bihu", "Ticketed"],
    href: "/events",
    image: journeyShots.honeymoon,
    colour: "var(--plum)",
    ink: "var(--plum-ink)",
  },
] as const;
