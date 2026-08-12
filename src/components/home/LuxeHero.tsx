import Image from "next/image";
import { HeroFilm } from "./HeroFilm";
import { Accent } from "@/components/primitives/Accent";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { headlineChips, faces } from "@/config/showcase";
import { formatINR } from "@/lib/currency";
import { cn } from "@/lib/cn";

/**
 * The first screen.
 *
 * Composition, and why it is this way round:
 *
 * The headline sits on paper *above* the film rather than over it. Three
 * reasons, in order of how much they cost to get wrong. It is the LCP element
 * and text on a flat ground paints at first contentful paint, which no
 * overlaid treatment can match. It never has to be legible against footage,
 * so the film can be graded for the film rather than for a scrim. And an
 * enormous line of serif standing alone on paper is simply the more expensive
 * of the two looks — putting type over a photograph is what a template does
 * because it has nothing else.
 *
 * Two photographs are set *inside* the sentence as pill-shaped chips. That is
 * the one flourish in the hero, and it does real work: it puts the product —
 * mountains, a pass, a road — into the first line the eye lands on, without
 * asking the reader to look at a picture separately.
 *
 * The line reveal is CSS keyframes (`.u-hero-line`), not GSAP. A JS reveal
 * cannot start until hydration, which pushes the largest text paint past the
 * LCP budget on a throttled connection. Everything below the fold is GSAP;
 * this is the one place it must not be.
 */
export function LuxeHero({ fromPrice }: { fromPrice: number }) {
  return (
    <section className="relative overflow-hidden bg-paper pt-[calc(var(--header-h)+2.5rem)] pb-0 lg:pt-[calc(var(--header-h)+5rem)]">
      {/* Four faint verticals. They make the headline read as placed on a
          system rather than as centred in a box. */}
      <div aria-hidden="true" className="u-grid-lines" />

      <div className="u-container-wide relative">
        {/* --- Masthead line ------------------------------------------- */}
        <div className="u-label flex items-baseline justify-between gap-6 border-b border-[var(--ink-hairline)] pb-5 text-ink-faint">
          <span>Northeast India · Est. Guwahati</span>
          <span className="hidden sm:block">
            Eight states · Permits handled
          </span>
          <span className="u-num">{new Date().getFullYear()}</span>
        </div>

        {/* --- The statement -------------------------------------------- */}
        <h1 className="u-statement mt-10 text-64 sm:text-88 lg:mt-14 lg:text-160">
          <span className="u-line-mask">
            <span className="u-hero-line" style={{ animationDelay: "40ms" }}>
              Eight states
              <HeroChip chip={headlineChips[0]} />
            </span>
          </span>
          <span className="u-line-mask">
            <span className="u-hero-line" style={{ animationDelay: "160ms" }}>
              most people never
            </span>
          </span>
          <span className="u-line-mask">
            <span className="u-hero-line" style={{ animationDelay: "280ms" }}>
              <HeroChip chip={headlineChips[1]} className="mr-[0.18em] ml-0" />
              <Accent>think</Accent> to visit.
            </span>
          </span>
        </h1>

        {/* --- Lede, actions, and the proof that they are real ---------- */}
        <div className="mt-12 grid gap-10 border-t border-[var(--ink-hairline)] pt-10 lg:mt-16 lg:grid-cols-[1.1fr_auto] lg:items-start lg:gap-20">
          <div className="max-w-2xl">
            <p className="u-lede text-18 text-ink-soft lg:text-22">
              Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram,
              Tripura and Sikkim — run as guided tours, motorcycle expeditions
              and family homestays, with the Inner Line Permits handled for you.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <LuxeButtonLink href="/tours" variant="primary" size="lg">
                Plan a trip
              </LuxeButtonLink>
              <LuxeButtonLink href="/destinations" variant="ghost" size="lg">
                See the eight states
              </LuxeButtonLink>
            </div>
          </div>

          <SocialProof />
        </div>
      </div>

      {/* --- The film -------------------------------------------------- */}
      <div className="u-container-wide relative mt-14 lg:mt-20">
        <HeroFilm className="aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9]">
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-5 sm:p-7 lg:p-9">
            <span className="u-glass u-label inline-flex items-center gap-3 rounded-full px-5 py-3 text-ink">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-ember"
              />
              Khasi Hills, Meghalaya
            </span>

            {/* The qualifier drops below `sm`. At 390px the two columns fight
                for about 90px each and both wrap to three lines, which turns
                a price into a paragraph. */}
            <span className="u-glass flex items-center gap-5 rounded-[var(--radius-card)] px-5 py-3.5 sm:px-6 sm:py-4">
              <span>
                <span className="u-label block text-ink-faint">
                  Seven nights, from
                </span>
                <span className="u-num mt-1 block font-display text-28">
                  {formatINR(fromPrice)}
                </span>
              </span>
              <span className="u-label hidden max-w-28 text-right leading-relaxed text-ink-faint sm:block">
                per person, all in
              </span>
            </span>
          </div>
        </HeroFilm>
      </div>
    </section>
  );
}

/**
 * A photograph set into a line of type.
 *
 * Sized in `em` so it scales with the headline across every breakpoint — a
 * chip fixed in pixels is a chip that swallows a phone's line and disappears
 * on a desktop. `align-middle` on a pill this tall sits fractionally low
 * against a serif's x-height, hence the nudge.
 */
function HeroChip({
  chip,
  className,
}: {
  chip: (typeof headlineChips)[number];
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative ml-[0.18em] inline-block h-[0.62em] w-[1.32em] translate-y-[-0.04em]",
        "overflow-hidden rounded-full align-middle",
        className,
      )}
    >
      <Image
        src={chip.src}
        alt={chip.alt}
        fill
        sizes="160px"
        className="object-cover"
      />
    </span>
  );
}

/**
 * The credibility block: a rating, three faces, a count.
 *
 * It is here, in the first screen, rather than in a testimonials section
 * two-thirds down the page, because that is where the decision to keep
 * reading is made. Faces are photographs at 44px — an illustrated avatar
 * signals "placeholder", which is the opposite of what this element is for.
 */
function SocialProof() {
  return (
    <div className="flex items-center gap-5 lg:flex-col lg:items-end lg:gap-4 lg:text-right">
      <div className="flex -space-x-3">
        {faces.map((face) => (
          <span
            key={face.alt}
            className="relative size-11 overflow-hidden rounded-full border-2 border-paper"
          >
            <Image
              src={face.src}
              alt={face.alt}
              fill
              sizes="88px"
              className="object-cover"
            />
          </span>
        ))}
      </div>
      <div>
        <span className="flex items-center gap-1.5 text-clay-ink lg:justify-end">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} />
          ))}
          <span className="u-num ml-1.5 text-14 text-ink">4.9</span>
        </span>
        <p className="u-label mt-2 text-ink-faint">
          1,400 travellers since 2009
        </p>
      </div>
    </div>
  );
}

function Star() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className="size-3 fill-current"
      focusable="false"
    >
      <path d="M6 0l1.6 3.9L12 4.3 8.7 7l1 4.3L6 9l-3.7 2.3 1-4.3L0 4.3l4.4-.4z" />
    </svg>
  );
}
