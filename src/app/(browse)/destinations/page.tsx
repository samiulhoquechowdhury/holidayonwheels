import Link from "next/link";
import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { WeaveBand } from "@/components/layout/WeaveBand";
import { Reveal } from "@/components/layout/Reveal";
import { Media } from "@/components/primitives/Media";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Chip } from "@/components/primitives/Chip";
import { ArrowGlyph } from "@/components/layout/SectionHeader";
import { getDestinations } from "@/content/destinations";
import { getTours } from "@/content/tours";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura and Sikkim — what each one is for, and when to go.",
};

export default function DestinationsPage() {
  const destinations = getDestinations();
  const tours = getTours();

  return (
    <>
      <PageHero
        eyebrow="Eight states"
        title="Where you could go"
        accent="could"
        intro="Roughly west to east. Each of these is a different country in every way that matters to a traveller — language, food, altitude, religion and road quality."
        tint="shell"
        region="meghalaya"
      />

      {/* One alternating editorial row per state, each on its own tint, with
          the state's own weave between them. */}
      {destinations.map((destination, index) => {
        const count = tours.filter((t) =>
          t.states.includes(destination.slug),
        ).length;
        const flip = index % 2 === 1;

        return (
          <div key={destination.slug}>
            {index > 0 ? (
              <WeaveBand
                region={destination.region}
                height={30}
                opacity={0.45}
              />
            ) : null}
            <SectionShell
              tint={destination.tint}
              pattern={destination.region}
              patternOpacity={0.035}
              spacing="tight"
            >
              <Reveal
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${
                  flip ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* The heading below links to the same place, so this image
                    link is removed from the tab order and the a11y tree
                    rather than becoming a second, differently-named stop for
                    the same destination. */}
                <Link
                  href={`/destinations/${destination.slug}`}
                  aria-hidden="true"
                  tabIndex={-1}
                  className="group block overflow-hidden rounded-[var(--radius-media)]"
                >
                  <Media
                    alt={destination.heroAlt}
                    src={destination.image}
                    seed={`destination-page-${destination.slug}`}
                    region={destination.region}
                    aspect="4/3"
                    priority={index < 2}
                    sizes="(max-width: 1024px) 100vw, 600px"
                    imageClassName="transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-105"
                  />
                </Link>

                <div>
                  <Eyebrow>
                    {count} {count === 1 ? "trip" : "trips"} · gateway{" "}
                    {destination.gateway}
                  </Eyebrow>
                  <h2 className="mt-4 text-36 lg:text-48">
                    <Link href={`/destinations/${destination.slug}`}>
                      {destination.name}
                    </Link>
                  </h2>
                  <p className="mt-4 text-22 text-ink-soft">
                    {destination.tagline}
                  </p>
                  <p className="mt-5 max-w-xl text-16 text-ink-soft">
                    {destination.intro}
                  </p>

                  <ul className="mt-6 flex flex-wrap gap-1.5">
                    {destination.requiresILP ? (
                      <li>
                        <Chip tone="sage">Inner Line Permit</Chip>
                      </li>
                    ) : (
                      <li>
                        <Chip>No permit needed</Chip>
                      </li>
                    )}
                    {destination.knownFor.slice(0, 3).map((thing) => (
                      <li key={thing}>
                        <Chip>{thing}</Chip>
                      </li>
                    ))}
                  </ul>

                  <p className="u-label mt-6 text-ink-soft">
                    Best {destination.bestMonths.join(" · ")}
                  </p>

                  <Link
                    href={`/destinations/${destination.slug}`}
                    className="mt-8 inline-flex min-h-11 items-center gap-2 text-16 underline decoration-[var(--ink-hairline-strong)] underline-offset-8 hover:decoration-current"
                  >
                    Read about {destination.name}
                    <ArrowGlyph />
                  </Link>
                </div>
              </Reveal>
            </SectionShell>
          </div>
        );
      })}
    </>
  );
}
