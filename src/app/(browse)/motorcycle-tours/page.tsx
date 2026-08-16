import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { WeaveBand } from "@/components/layout/WeaveBand";
import { Reveal } from "@/components/layout/Reveal";
import { MotoCard } from "@/components/cards/ResultCard";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { getMotorcycleTours } from "@/content/motorcycle-tours";
import { motoShots } from "@/config/showcase";

export const metadata: Metadata = {
  title: "Motorcycle expeditions",
  description:
    "Guided motorcycle tours across Northeast India, with a support truck carrying a mechanic, spares, fuel and luggage on every departure.",
};

const SUPPORT_FACTS = [
  {
    title: "A mechanic, not a driver who is handy",
    copy: "Someone who has worked on these specific bikes and can replace a clutch cable at the roadside at four thousand metres.",
  },
  {
    title: "The spares that actually break",
    copy: "Levers, cables, tubes, chains, sprockets, bulbs and a spare front wheel. On the Mon road we use several of them.",
  },
  {
    title: "Fuel, because the gaps are real",
    copy: "There are stretches in Arunachal with a hundred and fifty kilometres between working pumps.",
  },
  {
    title: "Oxygen above four thousand metres",
    copy: "Plus a pulse oximeter, which we use far more often — it tells us to turn someone around before it becomes the other kind of problem.",
  },
];

export default function MotorcycleToursPage() {
  const tours = getMotorcycleTours();

  return (
    <>
      <PageHero
        eyebrow={`${tours.length} expeditions`}
        title="Guided rides, with a truck behind you"
        accent="truck"
        image={motoShots[0]}
        intro="Group motorcycle expeditions across the Northeast. Every departure runs with a lead rider, a sweep rider and a support pickup — which is the difference between an expedition and a group of people on bikes hoping for the best."
        tint="sand"
        region="nagaland"
      />

      <SectionShell tint="paper">
        <h2 className="u-label mb-8 border-b border-[var(--ink-hairline)] pb-4 text-ink-soft">
          {tours.length} expeditions
        </h2>
        <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
          {tours.map((tour, index) => (
            <li key={tour.slug}>
              <Reveal delay={Math.min(index, 5) * 0.04}>
                <MotoCard
                  tour={tour}
                  priority={index < 3}
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px"
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </SectionShell>

      <WeaveBand region="nagaland" height={36} opacity={0.5} />
      <SectionShell tint="night" pattern="nagaland" patternOpacity={0.05}>
        <SectionHeader
          tone="onDark"
          eyebrow="The support vehicle"
          title="What is actually in the truck"
          intro="People assume it is for luggage. Luggage is the least important thing in it."
        />
        <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {SUPPORT_FACTS.map((fact, index) => (
            <li key={fact.title}>
              <Reveal delay={index * 0.05}>
                <Eyebrow tone="onDark" as="p">
                  {String(index + 1).padStart(2, "0")}
                </Eyebrow>
                <h3 className="mt-4 text-22 text-night-text">{fact.title}</h3>
                <p className="mt-3 text-16 text-night-text-soft">{fact.copy}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </SectionShell>
    </>
  );
}
