import Link from "next/link";
import { site } from "@/config/site";
import { footerNav, legalNav } from "@/config/nav";
import { Logo } from "./Logo";
import { WeaveBand } from "./WeaveBand";
import { OutboundLink } from "@/components/primitives/OutboundLink";
import { Eyebrow } from "@/components/primitives/Eyebrow";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="is-dark bg-night text-night-text">
      <WeaveBand region="neutral" tone="paper" opacity={0.35} height={36} />

      <div className="u-container py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo tone="paper" />
            <p className="mt-5 max-w-xs text-16 text-night-text-soft">
              {site.tagline}
            </p>
            <address className="mt-8 space-y-1 text-14 text-night-text-soft not-italic">
              <p>{site.contact.address}</p>
              <p>
                <a href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              </p>
              <p>
                <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`}>
                  {site.contact.phone}
                </a>
              </p>
            </address>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            {footerNav.map((group) => (
              <div key={group.label}>
                <Eyebrow tone="onDark" as="p">
                  {group.label}
                </Eyebrow>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <OutboundLink
                          href={link.href}
                          className="text-14 text-night-text-soft transition-colors hover:text-night-text"
                        >
                          {link.label}
                        </OutboundLink>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-14 text-night-text-soft transition-colors hover:text-night-text"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-[rgb(255_255_255/0.12)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="u-mono text-night-text-soft">
            © {year} {site.name}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-14 text-night-text-soft transition-colors hover:text-night-text"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex gap-x-6">
            {site.social.map((link) => (
              <li key={link.label}>
                <OutboundLink
                  href={link.href}
                  showIndicator={false}
                  className="text-14 text-night-text-soft transition-colors hover:text-night-text"
                >
                  {link.label}
                </OutboundLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
