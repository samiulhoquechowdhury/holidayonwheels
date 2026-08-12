import { SectionShell, type SectionTint } from "./SectionShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import type { WeaveRegion } from "./weave-motifs";
import { cn } from "@/lib/cn";

/**
 * The opening block of every non-home page. Owns the offset for the fixed
 * header so no page has to remember it.
 *
 * Deliberately mostly empty. The old version closed with a weave band, which
 * put a decorated edge under every page title; here the page simply opens
 * with a lot of air, one line of display type, and a hairline that marks
 * where the title ends and the content begins. That hairline is the only
 * ornament, and it is doing structural work.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  tint = "paper",
  region = "neutral",
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  tint?: SectionTint;
  region?: WeaveRegion;
  /** Search bar, filters summary, or anything else below the intro. */
  children?: React.ReactNode;
}) {
  return (
    <SectionShell
      tint={tint}
      pattern={region}
      spacing="flush"
      className={cn(
        "pt-[calc(var(--header-h)+5rem)] pb-16",
        "lg:pt-[calc(var(--header-h)+9rem)] lg:pb-24",
      )}
    >
      <Eyebrow tone={tint === "night" ? "onDark" : "soft"} rule>
        {eyebrow}
      </Eyebrow>

      {/* One very large size per page, and this is it. */}
      <h1 className="mt-8 max-w-4xl text-64 lg:text-88">{title}</h1>

      {intro ? (
        <p
          className={cn(
            "u-lede mt-8 max-w-2xl text-18 lg:text-22",
            tint === "night" ? "text-night-text-soft" : "text-ink-soft",
          )}
        >
          {intro}
        </p>
      ) : null}

      {children ? <div className="mt-12">{children}</div> : null}

      {/* Closes the block. Full-bleed to the container edges, not to the
          viewport — it belongs to the column, not to the page. */}
      <hr
        className={cn(
          "mt-16 border-0 border-t lg:mt-24",
          tint === "night"
            ? "border-t-[var(--night-hairline)]"
            : "border-t-[var(--ink-hairline)]",
        )}
      />
    </SectionShell>
  );
}
