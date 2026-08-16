import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Reveal } from "@/components/layout/Reveal";
import { RentalsOutbound } from "@/components/home/RentalsOutbound";
import { MotoCard } from "@/components/cards/ResultCard";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { OutboundLink } from "@/components/primitives/OutboundLink";
import { BEEPDRIVE_URL } from "@/config/external";
import { getFeaturedMotorcycleTours } from "@/content/motorcycle-tours";
import { journeyShots } from "@/config/showcase";

export const metadata: Metadata = {
  title: "Car and bike hire",
  description:
    "Self-drive car and motorcycle hire across Northeast India, operated by our partner Beep Drive.",
};

/**
 * The outbound landing page.
 *
 * Rentals are not sold here. This page exists to send people to Beep Drive
 * well, and — just as importantly — to stop riders who actually want a guided
 * expedition from clicking out by mistake. That distinction is the reason the
 * page is longer than a single link.
 */
export default function RentalsPage() {
  const motos = getFeaturedMotorcycleTours(3);

  return (
    <>
      <PageHero
        eyebrow="Operated by Beep Drive"
        title="Take the wheel yourself"
        accent="wheel"
        image={journeyShots.solo}
        intro="Self-drive car and motorcycle hire across the region is run by our partner Beep Drive rather than booked here. It opens in a new tab and is paid for separately."
        tint="shell"
        region="tripura"
      />

      <SectionShell tint="paper">
        <h2 className="u-sr-only">Hire options on Beep Drive</h2>
        <RentalsOutbound />

        <Reveal className="mt-16 max-w-2xl">
          <Eyebrow>Why it is not booked here</Eyebrow>
          <p className="mt-5 text-18 text-ink-soft">
            Hire needs a licence check, a security deposit and a damage
            assessment at handover — a different operation from the guided trips
            we run, and one Beep Drive already does properly across Guwahati,
            Shillong, Dimapur and Imphal. Rather than build a worse version of
            it, we send you to them.
          </p>
          <p className="mt-5 text-16 text-ink-soft">
            Your hire agreement is with Beep Drive, not with us, and their terms
            and insurance apply.
          </p>
          <OutboundLink
            href={BEEPDRIVE_URL}
            className="mt-8 inline-flex min-h-11 items-center gap-2 text-16 font-medium text-sage-ink underline underline-offset-8"
          >
            Go to beepdrive.com
          </OutboundLink>
        </Reveal>
      </SectionShell>

      {/* The disambiguation. Riders looking for a guided route land here more
          often than not, and this stops them clicking out by mistake. */}
      <SectionShell tint="night">
        <SectionHeader
          tone="onDark"
          eyebrow="Looking for something else?"
          title="Guided motorcycle expeditions are ours"
          intro="If you want a route, a lead rider, a mechanic and a support truck rather than a bike and a map, that is a motorcycle expedition — and it is booked here, not on Beep Drive."
          link={{ href: "/motorcycle-tours", label: "All expeditions" }}
          align="split"
        />
        <ul className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {motos.map((tour, index) => (
            <li key={tour.slug}>
              <Reveal delay={index * 0.06}>
                <MotoCard
                  tour={tour}
                  tone="onDark"
                  sizes="(max-width: 640px) 100vw, 400px"
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </SectionShell>
    </>
  );
}
