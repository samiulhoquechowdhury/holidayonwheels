import Image from "next/image";
import { Rise } from "@/components/motion/Rise";
import { Counter } from "@/components/motion/Counter";
import { Ember } from "@/components/primitives/Accent";
import { ArrowButton } from "@/components/primitives/LuxeButton";
import { rentalUrl, OUTBOUND_LINK_PROPS } from "@/config/external";
import { editorial, faces } from "@/config/showcase";

/**
 * Four figures and one outbound door.
 *
 * The band is doing two unrelated jobs at once, and that is deliberate rather
 * than lazy. The figures are the page's only quantified claim, and they are
 * placed *after* everything has been shown and *before* the last section that
 * asks for anything — the position where a reader is deciding whether all of
 * it was true. The self-drive tile shares the row because sending traffic to
 * a partner is not worth a section of its own, and burying it would be worse:
 * hiring a car is genuinely how a lot of people travel the region.
 *
 * The figures count up once on entry (`Counter`), and they are rendered at
 * their final value on the server so the claim is correct in the HTML whether
 * or not JavaScript ever runs.
 */
export function ProofBand() {
  return (
    <section className="relative bg-butter py-[calc(var(--section-pad)*0.7)]">
      <div className="u-container-wide">
        <Rise
          as="ul"
          stagger={0.08}
          className="grid gap-10 border-b border-[var(--ink-hairline)] pb-16 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FIGURES.map((figure) => (
            <li key={figure.label}>
              <p
                className="font-display text-64 leading-none lg:text-88"
                style={{ color: figure.ink }}
              >
                <Counter
                  to={figure.value}
                  suffix={figure.suffix}
                  decimals={figure.decimals ?? 0}
                />
              </p>
              <p className="u-label mt-4 text-ink-faint">{figure.label}</p>
              <p className="mt-2 max-w-56 text-14 text-ink-soft">
                {figure.note}
              </p>
            </li>
          ))}
        </Rise>

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-5">
          {/* A named review, with a face. Anonymous praise is wallpaper. */}
          <Rise className="flex flex-col justify-between gap-8 rounded-[var(--radius-card)] bg-paper p-8 lg:p-10">
            <blockquote className="font-display text-28 lg:text-36">
              &ldquo;They talked us <Ember>out</Ember> of the trip we asked for,
              and the one they suggested instead was the best fortnight we have
              had.&rdquo;
            </blockquote>
            <footer className="flex items-center gap-4">
              <span className="relative size-12 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={faces[1].src}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>
              <span>
                <span className="block text-16">Anjali &amp; Dev M.</span>
                <span className="u-label block text-ink-faint">
                  Sikkim and west Arunachal · March 2026
                </span>
              </span>
            </footer>
          </Rise>

          {/* Self-drive. Outbound, and honest about it. */}
          <Rise delay={0.1}>
            <a
              href={rentalUrl()}
              {...OUTBOUND_LINK_PROPS}
              className="group relative isolate flex h-full min-h-64 flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-night p-8 text-night-text lg:p-10"
            >
              <Image
                src={editorial.ridgeRoad}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="u-media-push -z-10 object-cover opacity-70"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(20_18_15/0.92)] to-[rgb(20_18_15/0.25)]"
              />
              <span className="u-label text-clay">Self-drive · Beep Drive</span>
              <span className="mt-4 flex items-end justify-between gap-6">
                <span>
                  <span className="block font-display text-36">
                    Or take the wheel yourself
                  </span>
                  <span className="mt-3 block max-w-md text-14 text-night-text-soft">
                    Car and bike hire is run by our partner rather than booked
                    here. It opens in a new tab and is paid for separately.
                  </span>
                </span>
                <ArrowButton tone="paper" />
              </span>
            </a>
          </Rise>
        </div>
      </div>
    </section>
  );
}

/**
 * Every figure here is specific enough to be checked, which is the only
 * property that makes a statistics band worth having. "Thousands of happy
 * customers" is noise; "1,412 travellers since 2009" is a claim.
 */
const FIGURES: {
  value: number;
  suffix: string;
  label: string;
  note: string;
  /** Only the rating has one. Everything else is a whole number. */
  decimals?: number;
  /** Text-safe step from the state palette. Four figures, four colours. */
  ink: string;
}[] = [
  {
    value: 1412,
    suffix: "",
    label: "Travellers since 2009",
    note: "Guided trips, expeditions and homestay bookings combined.",
    ink: "var(--naga-ink)",
  },
  {
    value: 47,
    suffix: "",
    label: "Routes across eight states",
    note: "From three-day weekends to a nineteen-day traverse.",
    ink: "var(--indigo-ink)",
  },
  {
    value: 100,
    suffix: "%",
    label: "Permits filed in-house",
    note: "Applied within a working day of confirmation, at no charge.",
    ink: "var(--jade-ink)",
  },
  {
    value: 4.9,
    suffix: " / 5",
    decimals: 1,
    label: "Average across 214 stays",
    note: "Collected after the trip, published unedited.",
    ink: "var(--marigold-ink)",
  },
];
