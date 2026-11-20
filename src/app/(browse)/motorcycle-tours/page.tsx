import type { Metadata } from "next";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Reveal } from "@/components/layout/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { MotoBanner } from "@/components/moto/MotoBanner";
import { MotoBooking } from "@/components/moto/MotoBooking";
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
        A banner, then the booking flow.

        The hero and the second full-width film that used to open this page
        are gone — two screens of furniture before the first expedition, and
        the film was the heaviest asset on the site after the home page.
        `MotoBanner` is one shallow band instead, so a card is on the
        opening screen rather than below it.

        The grid underneath is no longer a list of links. Clicking a card
        starts a booking: departure, riders, the dated itinerary, then the
        request. `MotoBooking` owns all of it — see that file for why the
        dates are fixed departures rather than a free calendar, and why
        "confirm" goes to `enquiries` rather than to `/checkout`, which does
        not exist in this app.
      */}
      <MotoBanner
        expeditions={tours.length}
        maxAltitude={Math.max(...tours.map((t) => t.maxAltitude))}
        maxGroupSize={Math.max(...tours.map((t) => t.groupSizeMax))}
      />

      {/*
        `flush` with its own top padding, not the shell's default 140px.
        Measured, the default put the first expedition card at y=1019 on a
        1000px laptop — just below the fold, which is the worst place for it:
        the page looks like a banner and a heading with nothing under them.
      */}
      <SectionShell
        id="expeditions"
        tint="paper"
        width="wide"
        spacing="flush"
        className="pt-12 pb-20 lg:pt-14 lg:pb-28"
      >
        <MotoBooking tours={tours} />
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
