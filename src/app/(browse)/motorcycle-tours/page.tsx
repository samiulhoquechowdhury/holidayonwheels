import type { Metadata } from "next";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Reveal } from "@/components/layout/Reveal";
import { MotoCard } from "@/components/cards/ResultCard";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Accent } from "@/components/primitives/Accent";
import { getMotorcycleTours } from "@/content/motorcycle-tours";

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
      {/*
        No hero, no film.

        This page used to open with a full `PageHero` and then a second
        full-width film under it — two screens of furniture before the first
        expedition. The film was the only second video on the site and it
        was the heaviest asset on the page; what somebody arrives here for
        is the list of rides and what each one costs.

        So it opens on the rides. The headline keeps the one sentence that
        actually sells the product — the support vehicle — because that is
        the difference between an expedition and a group of people on bikes
        hoping for the best, and it is the thing a photograph could not say
        anyway.
      */}
      <SectionShell
        tint="paper"
        width="wide"
        spacing="flush"
        className="pt-[calc(var(--header-h)+2rem)] pb-10 lg:pt-[calc(var(--header-h)+2.5rem)] lg:pb-12"
      >
        <Eyebrow rule>{tours.length} expeditions</Eyebrow>
        <h1 className="lg:text-56 mt-6 max-w-3xl text-36">
          Guided rides, with a <Accent>truck</Accent> behind you
        </h1>
        <p className="mt-6 max-w-2xl text-18 text-ink-soft">
          Group motorcycle expeditions across the Northeast. Every departure
          runs with a lead rider, a sweep rider and a support pickup — which is
          the difference between an expedition and a group of people on bikes
          hoping for the best.
        </p>
      </SectionShell>

      {/* The count is in the eyebrow above now; repeating it here was the
          same two words twice on one screen. */}
      <SectionShell tint="paper" spacing="flush" className="pb-20 lg:pb-28">
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

      <SectionShell tint="night">
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
