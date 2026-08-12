import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { WeaveBand } from "@/components/layout/WeaveBand";
import { Reveal } from "@/components/layout/Reveal";
import { Media } from "@/components/primitives/Media";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { ButtonLink } from "@/components/primitives/Button";
import { getDestinations } from "@/content/destinations";
import { getTours } from "@/content/tours";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Who we are, how we run trips in Northeast India, and where the money goes.",
};

const PRINCIPLES = [
  {
    title: "Guides from the state they guide in",
    copy: "We do not send a Guwahati guide to Nagaland. A Naga shawl means something specific and the person explaining it should be able to tell you what.",
  },
  {
    title: "Homestays set their own rates",
    copy: "Every homestay on this site is owned and run by the family living in it. They price it. We take a booking commission and nothing else.",
  },
  {
    title: "Permits are not a revenue line",
    copy: "We process Inner Line Permits for every traveller on every booking at no charge, and we apply the day a booking is confirmed rather than close to departure.",
  },
  {
    title: "We will talk you out of the wrong trip",
    copy: "The eighteen-day traverse is not a relaxing holiday and Ziro in July is genuinely wet. If a route is wrong for you we would rather say so before you pay than have you find out in the second week.",
  },
];

export default function AboutPage() {
  const destinations = getDestinations();
  const tours = getTours();

  return (
    <>
      <PageHero
        eyebrow="About"
        title="We only do the Northeast"
        intro="Eight states, one region, and no attempt to also sell you Rajasthan. Everything on this site is somewhere we run trips ourselves."
        tint="sand"
        region="assam"
      />

      <SectionShell tint="paper" pattern="assam" patternOpacity={0.025}>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <p className="text-22 text-ink-soft">
              Northeast India gets a fraction of the country&rsquo;s visitors
              and almost none of its travel writing. That is partly geography
              and partly a permit regime designed in 1873 for reasons that had
              nothing to do with tourism.
            </p>
            <p className="mt-6 max-w-prose text-16 text-ink-soft">
              We think the region is the most interesting part of India to
              travel in, and that the reason most people never go is friction
              rather than interest — the permits, the distances, the
              accommodation you cannot book from a search engine, the roads that
              do not do what the map says.
            </p>
            <p className="mt-5 max-w-prose text-16 text-ink-soft">
              Removing that friction is the entire business. Everything else —
              the itineraries, the support trucks, the permits desk — follows
              from it.
            </p>

            <dl className="mt-12 grid grid-cols-2 gap-8 border-t border-[var(--ink-hairline)] pt-10 sm:grid-cols-4">
              <Stat value={String(destinations.length)} label="States" />
              <Stat value={String(tours.length)} label="Guided trips" />
              <Stat value="4" label="Permit states handled" />
              <Stat value="0" label="Charged for permits" />
            </dl>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-[var(--radius-media)]">
              <Media
                alt="A guide and travellers looking out over terraced hillsides in the Naga hills at the end of the afternoon"
                seed="about-hero"
                region="nagaland"
                aspect="4/5"
                priority
                sizes="(max-width: 1024px) 100vw, 520px"
              />
            </div>
          </Reveal>
        </div>
      </SectionShell>

      <WeaveBand region="meghalaya" height={32} opacity={0.45} />
      <SectionShell tint="shell" pattern="meghalaya" patternOpacity={0.035}>
        <SectionHeader
          eyebrow="How we work"
          title="Four things we will not compromise on"
        />
        <ul className="grid gap-x-16 gap-y-12 lg:grid-cols-2">
          {PRINCIPLES.map((principle, index) => (
            <li key={principle.title}>
              <Reveal delay={index * 0.05}>
                <Eyebrow as="p">{String(index + 1).padStart(2, "0")}</Eyebrow>
                <h3 className="mt-4 text-28">{principle.title}</h3>
                <p className="mt-3 text-16 text-ink-soft">{principle.copy}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </SectionShell>

      <WeaveBand region="sikkim" height={32} opacity={0.45} />
      <SectionShell tint="shell" pattern="sikkim" patternOpacity={0.035}>
        <Reveal className="max-w-2xl">
          <Eyebrow>Talk to us</Eyebrow>
          <h2 className="mt-5 text-36">
            Most of what we run started as somebody asking for something that
            was not on the site.
          </h2>
          <p className="mt-5 text-18 text-ink-soft">
            If you have a shape of trip in mind that does not match anything
            here, say so. We are based in {site.contact.address} and we answer
            our own email.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/contact" variant="primary" size="lg">
              Get in touch
            </ButtonLink>
            <ButtonLink href="/journal" variant="secondary" size="lg">
              Read the journal
            </ButtonLink>
          </div>
        </Reveal>
      </SectionShell>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="u-label order-2 mt-2 text-ink-soft">{label}</dt>
      <dd className="font-display text-48 leading-none">{value}</dd>
    </div>
  );
}
