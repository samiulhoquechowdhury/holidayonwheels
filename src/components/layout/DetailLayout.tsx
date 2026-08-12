import { cn } from "@/lib/cn";
import { Media } from "@/components/primitives/Media";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Chip } from "@/components/primitives/Chip";
import type { WeaveRegion } from "./weave-motifs";

/**
 * The shared detail page shell: gallery, title block, sticky booking panel,
 * tabbed body.
 *
 * Tours, motorcycle tours, homestays and events all render through this. It
 * is the reason there are eight layouts across twenty-five routes rather than
 * a new one per module.
 *
 * Server component — the sticky panel is sticky by CSS, and only the widget
 * passed into it is interactive.
 */

export type DetailGalleryImage = {
  alt: string;
  src?: string;
};

export function DetailLayout({
  eyebrow,
  title,
  strapline,
  chips = [],
  region = "neutral",
  gallery,
  /** The booking widget, or anything else that should stick in the sidebar. */
  panel,
  children,
  seed,
}: {
  eyebrow: string;
  title: string;
  strapline?: string;
  chips?: string[];
  region?: WeaveRegion;
  gallery: DetailGalleryImage[];
  panel: React.ReactNode;
  children: React.ReactNode;
  /** Stabilises the placeholder art across renders. */
  seed: string;
}) {
  const [lead, ...rest] = gallery;

  return (
    <article className="pt-[var(--header-h)]">
      {/* Gallery. The lead image is the LCP element on every detail page. */}
      <div className="u-container-wide pt-10 lg:pt-14">
        <div className="grid gap-3 lg:grid-cols-[2fr_1fr] lg:gap-4">
          <div className="overflow-hidden rounded-[var(--radius-media)]">
            <Media
              alt={lead.alt}
              src={lead.src}
              seed={`${seed}-0`}
              region={region}
              aspect="3/2"
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
            />
          </div>
          {rest.length > 0 ? (
            <div className="hidden grid-rows-2 gap-4 lg:grid">
              {rest.slice(0, 2).map((image, index) => (
                <div
                  key={image.alt}
                  className="overflow-hidden rounded-[var(--radius-media)]"
                >
                  <Media
                    alt={image.alt}
                    src={image.src}
                    seed={`${seed}-${index + 1}`}
                    region={region}
                    aspect="4/3"
                    sizes="440px"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="u-container pt-16 pb-28 lg:pt-24 lg:pb-40">
        <div className="grid gap-x-20 gap-y-14 lg:grid-cols-[1fr_400px]">
          {/* Body column */}
          <div className="min-w-0">
            {/* Deliberately not wrapped in `Reveal`. This block is above the
                fold and its h1 is the LCP element — a scroll reveal starts at
                opacity 0 and cannot paint until hydration, which pushed LCP
                past 3s on a throttled connection. */}
            <div>
              <Eyebrow>{eyebrow}</Eyebrow>
              <h1 className="mt-6 text-48 lg:text-64">{title}</h1>
              {strapline ? (
                <p className="u-lede mt-6 max-w-2xl text-22 text-ink-soft">
                  {strapline}
                </p>
              ) : null}
              {chips.length > 0 ? (
                <ul className="mt-8 flex flex-wrap gap-2">
                  {chips.map((chip) => (
                    <li key={chip}>
                      <Chip>{chip}</Chip>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="mt-16 lg:mt-20">{children}</div>
          </div>

          {/* Sticky panel. Ordered first on mobile so the price is above the
              fold, and sticky from the second breakpoint up. */}
          <div className="order-first lg:order-none">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)]">
              {panel}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Tabbed body sections. Rendered as anchored sections with a sticky rail
 * rather than as JS tabs, so every section is linkable, printable and
 * findable with in-page search.
 */
export function DetailSections({
  sections,
  className,
}: {
  sections: { id: string; label: string; content: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <nav
        aria-label="On this page"
        className="sticky top-[var(--header-h)] z-10 -mx-[var(--gutter)] mb-16 overflow-x-auto border-b border-[var(--ink-hairline)] bg-paper px-[var(--gutter)]"
      >
        <ul className="flex gap-8">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="u-label inline-flex min-h-12 items-center whitespace-nowrap text-ink-faint transition-colors duration-[var(--dur-micro)] hover:text-ink"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-20">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            // Offset the anchor so the sticky rail does not cover the heading.
            className="scroll-mt-[calc(var(--header-h)+4rem)]"
          >
            <h2 className="mb-8 text-28 lg:text-36">{section.label}</h2>
            {section.content}
          </section>
        ))}
      </div>
    </div>
  );
}

/** Two-column include/exclude list, used on every bookable detail page. */
export function IncludesGrid({
  includes,
  excludes,
}: {
  includes: string[];
  excludes: string[];
}) {
  return (
    <div className="grid gap-12 sm:grid-cols-2 lg:gap-16">
      <div>
        <Eyebrow tone="sage" className="mb-6">
          What is included
        </Eyebrow>
        <ul className="flex flex-col gap-4">
          {includes.map((item) => (
            <li key={item} className="flex gap-3 text-16">
              <span aria-hidden="true" className="mt-1.5 shrink-0 text-sage">
                <TickGlyph />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <Eyebrow className="mb-6">What is not</Eyebrow>
        <ul className="flex flex-col gap-4">
          {excludes.map((item) => (
            <li key={item} className="flex gap-3 text-16 text-ink-soft">
              <span
                aria-hidden="true"
                className="mt-1.5 shrink-0 text-ink-faint"
              >
                <DashGlyph />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TickGlyph() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none">
      <path
        d="M2 7.5 5.5 11 12 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DashGlyph() {
  return (
    <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none">
      <path d="M2 7h10" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
