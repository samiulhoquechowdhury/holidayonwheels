import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { OutboundLink } from "@/components/primitives/OutboundLink";
import { ContactForm } from "./ContactForm";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Ask us about a trip in Northeast India. We reply within one working day.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Tell us what you have in mind"
        accent="mind"
        intro="Most of what we run started as somebody asking for something that was not on the site. Be specific and the reply will be useful."
        tint="sand"
        region="mizoram"
      />

      <SectionShell tint="paper">
        <div className="grid gap-14 lg:grid-cols-[1fr_300px] lg:gap-20">
          <ContactForm />

          <aside className="lg:pt-2">
            <Eyebrow>Or directly</Eyebrow>
            <address className="mt-5 flex flex-col gap-1 text-16 not-italic">
              <a
                href={`mailto:${site.contact.email}`}
                className="inline-flex min-h-11 items-center underline decoration-[var(--ink-hairline-strong)] underline-offset-8 hover:decoration-current"
              >
                {site.contact.email}
              </a>
              <a
                href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                className="u-num inline-flex min-h-11 items-center underline decoration-[var(--ink-hairline-strong)] underline-offset-8 hover:decoration-current"
              >
                {site.contact.phone}
              </a>
              <span className="text-ink-soft">{site.contact.address}</span>
            </address>

            <Eyebrow className="mt-12">Elsewhere</Eyebrow>
            <ul className="mt-5 flex flex-col gap-1">
              {site.social.map((link) => (
                <li key={link.label}>
                  <OutboundLink
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-16 text-ink-soft transition-colors hover:text-ink"
                  >
                    {link.label}
                  </OutboundLink>
                </li>
              ))}
            </ul>

            <div className="mt-12 rounded-[var(--radius-card)] border border-[var(--ink-hairline)] p-5">
              <Eyebrow tone="sage">Permits</Eyebrow>
              <p className="mt-3 text-14 text-ink-soft">
                Permit questions are answered fastest by our permits desk. Put
                &ldquo;permit&rdquo; in the first line of your message and it
                goes straight there.
              </p>
            </div>
          </aside>
        </div>
      </SectionShell>
    </>
  );
}
