import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { WeaveBand } from "@/components/layout/WeaveBand";
import { Reveal } from "@/components/layout/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { ButtonLink } from "@/components/primitives/Button";
import { Chip } from "@/components/primitives/Chip";
import { getDestinations } from "@/content/destinations";
import { getFaqs } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Inner Line Permits",
  description:
    "Which Northeast states need an Inner Line Permit, how long they take, and how we process them for every traveller at no charge.",
};

const STEPS = [
  {
    title: "You book",
    copy: "We take your traveller details at checkout, including names exactly as they appear on your identity documents. Name mismatches are the single most common reason a permit is refused.",
  },
  {
    title: "We apply, the same day",
    copy: "Not close to departure. Arunachal Pradesh, Nagaland and Mizoram issue electronically and usually turn around in three to seven working days. Manipur is more variable.",
  },
  {
    title: "You get the permit before you fly",
    copy: "It arrives by email as a PDF and appears in your account under My permits. Carry a printed copy as well — check-posts are not always online.",
  },
  {
    title: "We handle the check-posts",
    copy: "Your guide carries the group's paperwork and deals with the check-post. You will still need to show identity documents in person.",
  },
];

export default function ILPPage() {
  const destinations = getDestinations();
  const permitFaqs = getFaqs().filter((f) => f.topic === "permits");

  return (
    <>
      <PageHero
        eyebrow="Permits"
        title="Inner Line Permits, without the panic"
        intro="Four of the eight states need one. They are not difficult, they are refused for predictable reasons, and we process them for every traveller on every booking at no charge."
        tint="shell"
        region="manipur"
      />

      {/* Which states, at a glance — the question everyone actually arrives
          with, answered before anything else. */}
      <SectionShell tint="paper" pattern="manipur" patternOpacity={0.025}>
        <SectionHeader
          eyebrow="At a glance"
          title="Which states need what"
          intro="Indian nationals need an Inner Line Permit for four states. Foreign nationals need a Protected Area Permit for two, and it takes considerably longer."
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <caption className="u-sr-only">
              Permit requirements by state for Indian and foreign nationals
            </caption>
            <thead>
              <tr className="border-b border-[var(--ink-hairline-strong)]">
                <th scope="col" className="u-label py-4 pr-4 text-ink-soft">
                  State
                </th>
                <th scope="col" className="u-label py-4 pr-4 text-ink-soft">
                  Indian nationals
                </th>
                <th scope="col" className="u-label py-4 text-ink-soft">
                  Foreign nationals
                </th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((destination) => (
                <tr
                  key={destination.slug}
                  className="border-b border-[var(--ink-hairline)]"
                >
                  <th scope="row" className="py-5 pr-4 text-18 font-normal">
                    {destination.name}
                  </th>
                  <td className="py-5 pr-4">
                    {destination.requiresILP ? (
                      <Chip tone="sage">Inner Line Permit</Chip>
                    ) : (
                      <Chip>Not required</Chip>
                    )}
                  </td>
                  <td className="py-5">
                    {destination.requiresPAP ? (
                      <Chip tone="clay">Protected Area Permit</Chip>
                    ) : (
                      <Chip>Not required</Chip>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 max-w-prose text-14 text-ink-soft">
          Sikkim is the exception to the pattern: the state itself is open, but
          north Sikkim, Nathu La and Tsomgo each need their own protected-area
          permission, which we arrange from Gangtok.
        </p>
      </SectionShell>

      <WeaveBand region="manipur" height={32} opacity={0.45} />
      <SectionShell tint="shell" pattern="manipur" patternOpacity={0.03}>
        <SectionHeader
          eyebrow="How we handle it"
          title="Four steps, none of them yours"
        />
        <ol className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Reveal delay={index * 0.05}>
                <Eyebrow tone="sage" as="p">
                  Step {index + 1}
                </Eyebrow>
                <h3 className="mt-4 text-22">{step.title}</h3>
                <p className="mt-3 text-16 text-ink-soft">{step.copy}</p>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-16">
          <ButtonLink href="/ilp/apply" variant="primary" size="lg">
            Start an application
          </ButtonLink>
        </Reveal>
      </SectionShell>

      <WeaveBand region="nagaland" height={28} opacity={0.4} />
      <SectionShell tint="sand" pattern="nagaland" patternOpacity={0.03}>
        <SectionHeader
          eyebrow="Questions"
          title="What people usually ask"
          link={{ href: "/faq", label: "All questions" }}
          align="split"
        />
        <dl className="grid gap-x-16 gap-y-10 lg:grid-cols-2">
          {permitFaqs.map((faq) => (
            <div key={faq.question}>
              <dt className="text-22">{faq.question}</dt>
              <dd className="mt-3 text-16 text-ink-soft">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </SectionShell>
    </>
  );
}
