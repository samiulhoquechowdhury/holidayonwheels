import Link from "next/link";
import { site } from "@/config/site";
import { footerNav, legalNav } from "@/config/nav";
import { Logo } from "./Logo";
import { OutboundLink } from "@/components/primitives/OutboundLink";
import { ButtonLink } from "@/components/primitives/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";

/**
 * The footer opens with a statement rather than with a sitemap.
 *
 * The old one led straight into four columns of links, which is what a footer
 * does when nobody has decided what it is for. This one gives the tagline a
 * full display line and a real call to action first, then drops to the
 * navigation underneath a hairline — so the last thing on every page is an
 * invitation, and the directory is where you go if you declined it.
 *
 * `u-container-wide`, matching the header. Both are the page's frame rather
 * than a column of prose inside it, so both take the frame's width: the
 * wordmark at the top of the page and the wordmark at the bottom have to
 * start at the same x, and on `u-container` they did not. Below 1280 the two
 * containers are identical — only the gutter applies — so this was invisible
 * on every phone and laptop and 190px out on a 1728px display.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="is-dark bg-night text-night-text">
      <div className="u-container-wide py-24 lg:py-36">
        {/* ---- The invitation ------------------------------------------- */}
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-20">
          <div>
            <Eyebrow tone="onDark">Northeast India</Eyebrow>
            <p className="mt-8 max-w-2xl font-display text-36 leading-[var(--leading-display)] tracking-[var(--tracking-display)] lg:text-48">
              {site.tagline}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end lg:pb-2">
            <ButtonLink href="/tours" variant="onDark" size="lg">
              Plan a trip
            </ButtonLink>
            <ButtonLink
              href="/contact"
              size="lg"
              variant="ghost"
              className="border-[var(--night-hairline)] text-night-text hover:bg-[rgb(242_237_229/0.08)]"
            >
              Talk to someone
            </ButtonLink>
          </div>
        </div>

        {/* ---- The directory -------------------------------------------- */}
        <div className="mt-20 grid gap-14 border-t border-[var(--night-hairline)] pt-16 lg:mt-28 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <div>
            {/*
             * `surface="plate"` is not decoration — it is the only thing that
             * makes the mark legible here. The supplied artwork is black
             * letterforms with white detail *inside* them, so on the night
             * ground the letters went to near-black on near-black and only
             * the orange hub of the wheel survived. `tone` does not help:
             * it colours the typographic fallback, and this build ships the
             * PNG. `Logo`'s own documentation says the dark ground needs the
             * opaque sheet; the footer just never passed it.
             */}
            <Logo tone="paper" surface="plate" />
            <address className="mt-8 space-y-2 text-14 text-night-text-soft not-italic">
              <p>{site.contact.address}</p>
              <p>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="inline-flex min-h-9 items-center transition-colors duration-[var(--dur-micro)] hover:text-night-text"
                >
                  {site.contact.email}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                  className="u-num inline-flex min-h-9 items-center transition-colors duration-[var(--dur-micro)] hover:text-night-text"
                >
                  {site.contact.phone}
                </a>
              </p>
            </address>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4"
          >
            {footerNav.map((group) => (
              <div key={group.label}>
                <Eyebrow tone="onDark" as="p" rule={false}>
                  {group.label}
                </Eyebrow>
                <ul className="mt-3 space-y-1">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <OutboundLink
                          href={link.href}
                          className="inline-flex min-h-9 items-center text-14 text-night-text-soft transition-colors duration-[var(--dur-micro)] hover:text-night-text"
                        >
                          {link.label}
                        </OutboundLink>
                      ) : (
                        <Link
                          href={link.href}
                          className="inline-flex min-h-9 items-center text-14 text-night-text-soft transition-colors duration-[var(--dur-micro)] hover:text-night-text"
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

        {/* ---- Legal ----------------------------------------------------- */}
        <div className="mt-20 flex flex-col gap-6 border-t border-[var(--night-hairline)] pt-10 lg:flex-row lg:items-center lg:justify-between">
          <p className="u-label text-night-text-soft">
            © {year} {site.name}
          </p>
          <ul className="flex flex-wrap gap-x-7 gap-y-2">
            {legalNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-9 items-center text-14 text-night-text-soft transition-colors duration-[var(--dur-micro)] hover:text-night-text"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex gap-x-7">
            {site.social.map((link) => (
              <li key={link.label}>
                <OutboundLink
                  href={link.href}
                  showIndicator={false}
                  className="inline-flex min-h-9 items-center text-14 text-night-text-soft transition-colors duration-[var(--dur-micro)] hover:text-night-text"
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
