import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { WeaveBand } from "@/components/layout/WeaveBand";
import { Reveal } from "@/components/layout/Reveal";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { ButtonLink } from "@/components/primitives/Button";
import { getFaqs } from "@/content/site-content";
import type { FaqItem } from "@/content/types";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Permits, booking, payment, travel and motorcycle tours in Northeast India — the questions people actually ask.",
};

const TOPIC_LABEL: Record<FaqItem["topic"], string> = {
  permits: "Permits",
  booking: "Booking",
  travel: "Travelling there",
  payment: "Payment",
  motorcycle: "Motorcycle tours",
};

const ORDER: FaqItem["topic"][] = [
  "permits",
  "booking",
  "travel",
  "payment",
  "motorcycle",
];

export default function FaqPage() {
  const faqs = getFaqs();

  return (
    <>
      <PageHero
        eyebrow="Questions"
        title="The things people actually ask"
        accent="actually"
        intro="If the answer you need is not here, ask us — we would rather answer it than have you guess."
        tint="shell"
        region="meghalaya"
      />

      <SectionShell tint="paper">
        <div className="grid gap-12 lg:grid-cols-[200px_1fr] lg:gap-20">
          {/* An in-page contents rail rather than JS tabs, so every answer is
              linkable and findable with in-page search. */}
          <nav
            aria-label="Topics"
            className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start"
          >
            <Eyebrow className="mb-4">Topics</Eyebrow>
            <ul className="flex flex-wrap gap-x-6 gap-y-1 lg:flex-col">
              {ORDER.map((topic) => (
                <li key={topic}>
                  <a
                    href={`#${topic}`}
                    className="inline-flex min-h-11 items-center text-16 text-ink-soft transition-colors hover:text-ink"
                  >
                    {TOPIC_LABEL[topic]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-col gap-16">
            {ORDER.map((topic) => (
              <section
                key={topic}
                id={topic}
                className="scroll-mt-[calc(var(--header-h)+2rem)]"
              >
                <h2 className="border-b border-[var(--ink-hairline)] pb-4 text-28">
                  {TOPIC_LABEL[topic]}
                </h2>
                <dl className="mt-8 flex flex-col gap-8">
                  {faqs
                    .filter((faq) => faq.topic === topic)
                    .map((faq) => (
                      <div key={faq.question}>
                        <dt className="text-22">{faq.question}</dt>
                        <dd className="mt-3 max-w-prose text-16 text-ink-soft">
                          {faq.answer}
                        </dd>
                      </div>
                    ))}
                </dl>
              </section>
            ))}
          </div>
        </div>
      </SectionShell>

      <WeaveBand region="manipur" height={28} opacity={0.4} />
      <SectionShell
        tint="shell"
        pattern="manipur"
        patternOpacity={0.03}
        spacing="tight"
      >
        <Reveal className="max-w-2xl">
          <Eyebrow tone="sage">Still stuck</Eyebrow>
          <h2 className="mt-5 text-36">Ask us the awkward one.</h2>
          <p className="mt-5 text-18 text-ink-soft">
            Whether a route is too hard, whether a state is safe right now,
            whether your knees will survive Nongriat. We answer honestly, which
            occasionally costs us the booking.
          </p>
          <ButtonLink
            href="/contact"
            variant="primary"
            size="lg"
            className="mt-8"
          >
            Get in touch
          </ButtonLink>
        </Reveal>
      </SectionShell>
    </>
  );
}
