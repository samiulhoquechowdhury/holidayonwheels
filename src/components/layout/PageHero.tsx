import { SectionShell, type SectionTint } from "./SectionShell";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { WeaveBand } from "./WeaveBand";
import type { WeaveRegion } from "./weave-motifs";

/**
 * The opening block of every non-home page. Owns the offset for the fixed
 * header so no page has to remember it, and closes with a weave band so the
 * region is stated before the content starts.
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
    <>
      <SectionShell
        tint={tint}
        pattern={region}
        patternOpacity={0.035}
        spacing="flush"
        className="pt-[calc(var(--header-h)+3.5rem)] pb-14 lg:pt-[calc(var(--header-h)+6rem)] lg:pb-20"
      >
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl text-48 lg:text-64">{title}</h1>
        {intro ? (
          <p className="mt-6 max-w-2xl text-18 text-ink-soft lg:text-22">
            {intro}
          </p>
        ) : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </SectionShell>
      <WeaveBand region={region} height={28} opacity={0.4} />
    </>
  );
}
