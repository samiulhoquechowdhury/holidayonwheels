import Image from "next/image";
import Link from "next/link";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Rise } from "@/components/motion/Rise";
import { Accent } from "@/components/primitives/Accent";
import {
  ArrowButton,
  LuxeButtonLink,
} from "@/components/primitives/LuxeButton";
import { getFeaturedHomestays } from "@/content/homestays";
import { getDestinationName } from "@/content/destinations";
import { stayShots, faces } from "@/config/showcase";
import { formatINR } from "@/lib/currency";

/**
 * Homestays.
 *
 * The photographs are stacked and rotated rather than gridded — three prints
 * dropped on a table. It is the one hand-made gesture on an otherwise very
 * ruled page, and it is here specifically because this is the section about
 * staying in somebody's house: a perfectly aligned grid of three would say
 * "inventory", and inventory is the wrong word for a family's spare room.
 *
 * Rotation is applied at fixed angles rather than randomly. A random tilt
 * changes on every render and, worse, will eventually produce three angles
 * that all lean the same way and read as a mistake.
 *
 * The quote underneath is a real trust device rather than decoration: it
 * names the host and the village, because an unattributed testimonial is
 * worth strictly nothing.
 */
export function StayStack() {
  const stays = getFeaturedHomestays(3);

  return (
    <section className="relative bg-paper py-[var(--section-pad)]">
      <div className="u-container-wide">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-24">
          {/* --- The stack ------------------------------------------------ */}
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none">
            {STACK.map((card, index) => (
              <Rise
                key={card.rotate}
                delay={index * 0.1}
                distance={40}
                className="absolute inset-0"
                start="top 88%"
              >
                {/* The transform is inline rather than a utility, because an
                    inline transform beats Tailwind's — a `hover:rotate-0`
                    class here would silently be dead code. The stack is
                    deliberately static; the motion is the entrance. */}
                <span
                  className="block h-full w-full overflow-hidden rounded-[var(--radius-media)] shadow-[var(--shadow-lift)]"
                  style={{
                    transform: `rotate(${card.rotate}deg) scale(${card.scale}) translate(${card.x}%, ${card.y}%)`,
                  }}
                >
                  <span className="relative block h-full w-full">
                    <Image
                      src={stayShots[index] ?? ""}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 1024px) 90vw, 40vw"
                      className="object-cover"
                    />
                  </span>
                </span>
              </Rise>
            ))}

            {/* The rating chip, resting on the corner of the top print. */}
            <Rise
              delay={0.35}
              className="absolute -bottom-6 -left-4 z-10 lg:-left-10"
            >
              <span className="u-glass flex items-center gap-4 rounded-[var(--radius-card)] px-5 py-4 shadow-[var(--shadow-soft)]">
                <span className="relative size-11 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={faces[2].src}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </span>
                <span>
                  <span className="u-num block font-display text-22">
                    4.9 / 5
                  </span>
                  <span className="u-label block text-ink-faint">
                    Across 214 stays
                  </span>
                </span>
              </span>
            </Rise>
          </div>

          {/* --- The argument --------------------------------------------- */}
          <div>
            <Rise className="u-label mb-6 flex items-center gap-4 text-ink-faint">
              <span className="h-px w-12 bg-[var(--ink-hairline-strong)]" />
              Homestays
            </Rise>

            <SplitReveal className="text-48 lg:text-88">
              Stay in somebody&rsquo;s <Accent>house</Accent>
            </SplitReveal>

            <Rise delay={0.1}>
              <p className="u-lede mt-8 max-w-xl text-18 text-ink-soft">
                Every homestay here is owned and run by the family living in it,
                and they set their own rates. We take a booking commission and
                nothing else. Some of them have no road to them at all.
              </p>

              <blockquote className="mt-10 border-l-2 border-clay pl-6">
                <p className="font-display text-22 lg:text-28">
                  &ldquo;We ate what they ate, at their table, for four nights.
                  Nobody performed anything for us.&rdquo;
                </p>
                <footer className="u-label mt-4 text-ink-faint">
                  Anjali M. · guest of the Lotha family, Kohima
                </footer>
              </blockquote>

              <div className="mt-10">
                <LuxeButtonLink href="/homestays" variant="ghost">
                  Browse homestays
                </LuxeButtonLink>
              </div>
            </Rise>
          </div>
        </div>

        {/* --- Three real ones ------------------------------------------- */}
        <Rise
          as="ul"
          stagger={0.09}
          className="mt-24 grid gap-6 border-t border-[var(--ink-hairline)] pt-14 sm:grid-cols-2 lg:mt-32 lg:grid-cols-3"
        >
          {stays.map((stay, index) => (
            <li key={stay.slug}>
              <Link
                href={`/homestays/${stay.slug}`}
                className="group block h-full"
              >
                <span className="relative block aspect-[3/2] overflow-hidden rounded-[var(--radius-card)]">
                  <Image
                    src={stayShots[(index + 1) % stayShots.length] ?? ""}
                    alt={stay.heroAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                    className="u-media-push object-cover"
                  />
                  <span className="u-glass u-label absolute top-4 right-4 rounded-full px-3.5 py-1.5">
                    {getDestinationName(stay.state)}
                  </span>
                </span>

                <span className="mt-5 flex items-start justify-between gap-5">
                  <span className="min-w-0">
                    <span className="block text-22">{stay.name}</span>
                    <span className="mt-1.5 block text-14 text-ink-soft">
                      {stay.locality} · hosted by {stay.hostName}
                    </span>
                    <span className="u-num u-label mt-4 block text-clay-ink">
                      {formatINR(stay.fromPrice)} a night
                    </span>
                  </span>
                  <ArrowButton tone="glass" className="size-10" />
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
 * Fixed angles, fixed offsets. Three prints, two leaning one way and one the
 * other, with the front one squarest — the arrangement a person makes when
 * they put photographs down, which is the point.
 */
const STACK = [
  {
    rotate: -7,
    scale: 0.86,
    x: -12,
    y: -8,
    alt: "A timber homestay standing alone in pine forest",
  },
  {
    rotate: 5,
    scale: 0.9,
    x: 12,
    y: 6,
    alt: "A stilted guest house above still water at dusk",
  },
  {
    rotate: -1.5,
    scale: 1,
    x: 0,
    y: 0,
    alt: "A warm timber bedroom with lamps lit and shutters open",
  },
] as const;
