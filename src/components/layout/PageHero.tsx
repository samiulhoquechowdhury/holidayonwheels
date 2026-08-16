import Image from "next/image";
import { SectionShell, type SectionTint } from "./SectionShell";
import { AccentedTitle } from "@/components/primitives/AccentedTitle";
import { ParallaxMedia } from "@/components/motion/Parallax";
import { mockFor } from "@/config/showcase";
import { regionColour } from "@/config/palette";
import type { WeaveRegion } from "./weave-motifs";
import { cn } from "@/lib/cn";

/**
 * The opening block of every non-home page. Owns the offset for the fixed
 * header so no page has to remember it.
 *
 * Brought into line with the redesigned home page, and the three changes are
 * the whole of it:
 *
 *  - **One word of the title is set in the accent italic.** Pass `accent` and
 *    the first occurrence of that word is swapped. It is a prop rather than
 *    letting callers pass a `ReactNode` because the rule is "exactly one word"
 *    — a signature that only accepts one word cannot be used to italicise a
 *    whole clause, which is how this device dies everywhere it is tried.
 *  - **It carries a photograph.** Keyed off the `region` these pages already
 *    pass, so every inner page gained a hero image without a single call site
 *    changing. Text left, framed image right, stacked on a phone.
 *  - **A coloured rule under the eyebrow**, from the state palette, so the
 *    page announces which of the eight it belongs to before it is read.
 *
 * The photograph is opt-out (`media={false}`) for pages whose `children` are
 * heavy — the tours index puts a whole search bar here, and an image beside
 * it pushes the results below two full screens on a laptop.
 */
export function PageHero({
  eyebrow,
  title,
  accent,
  intro,
  tint = "paper",
  region = "neutral",
  media = true,
  image: imageOverride,
  accentColour,
  children,
}: {
  eyebrow: string;
  title: string;
  /**
   * A single word from `title` to set in the accent italic. Must appear in
   * the title verbatim; if it does not, the title renders unchanged rather
   * than throwing — a missing accent is a missed flourish, not a broken page.
   */
  accent?: string;
  intro?: string;
  tint?: SectionTint;
  region?: WeaveRegion;
  /** Set false where `children` already fills the block. */
  media?: boolean;
  /**
   * Overrides the region-derived photograph.
   *
   * Needed wherever the page's subject is not its region. The expeditions
   * index is regioned `nagaland` for its palette, and deriving the image from
   * that put a festival crowd at the top of a page about motorcycles. Region
   * decides the colour; the subject decides the picture.
   */
  image?: string;
  /** Overrides the eyebrow rule colour. Defaults to the region's own. */
  accentColour?: string;
  /** Search bar, filters summary, or anything else below the intro. */
  children?: React.ReactNode;
}) {
  const dark = tint === "night";
  const image = media ? (imageOverride ?? mockFor(region, title)) : undefined;
  // Defaulted from the region rather than required as a prop: every call site
  // already declares its region, so the eyebrow rule picks up the right state
  // colour with no page needing to know the palette exists.
  const rule = accentColour ?? regionColour(region).surface;

  return (
    <SectionShell
      tint={tint}
      spacing="flush"
      className={cn(
        // No bottom padding: the closing rule *is* the boundary, and the
        // next section brings its own top padding. With padding here as well
        // every inner page opened with ~176px of dead space under the rule.
        "pt-[calc(var(--header-h)+3.5rem)] pb-0",
        "lg:pt-[calc(var(--header-h)+7rem)]",
      )}
    >
      <div
        className={cn(
          "grid gap-12",
          image && "lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-20",
        )}
      >
        <div>
          <p
            className={cn(
              "u-label flex items-center gap-4",
              dark ? "text-night-text-soft" : "text-ink-faint",
            )}
          >
            <span
              aria-hidden="true"
              className="h-0.5 w-12 shrink-0 rounded-full"
              style={{ backgroundColor: rule }}
            />
            {eyebrow}
          </p>

          {/* One very large size per page, and this is it. */}
          <h1 className="mt-7 max-w-4xl text-48 sm:text-64 lg:text-88">
            <AccentedTitle title={title} accent={accent} />
          </h1>

          {intro ? (
            <p
              className={cn(
                "u-lede mt-7 max-w-2xl text-18 lg:text-22",
                dark ? "text-night-text-soft" : "text-ink-soft",
              )}
            >
              {intro}
            </p>
          ) : null}
        </div>

        {image ? (
          <ParallaxMedia
            amount={10}
            className="aspect-[4/3] w-full rounded-[var(--radius-media)] lg:aspect-[4/5]"
          >
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
          </ParallaxMedia>
        ) : null}
      </div>

      {children ? <div className="mt-12">{children}</div> : null}

      {/* Closes the block. Full-bleed to the container edges, not to the
          viewport — it belongs to the column, not to the page. */}
      <hr
        className={cn(
          "mt-14 border-0 border-t lg:mt-20",
          dark
            ? "border-t-[var(--night-hairline)]"
            : "border-t-[var(--ink-hairline)]",
        )}
      />
    </SectionShell>
  );
}
