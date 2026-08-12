import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { Reveal } from "@/components/layout/Reveal";
import { StayCard } from "@/components/cards/ResultCard";
import { LocatorMap } from "@/components/homestays/LocatorMap";
import { getHomestays } from "@/content/homestays";

export const metadata: Metadata = {
  title: "Homestays",
  description:
    "Family-run homestays across Northeast India — stilt houses on Majuli, Apatani farmhouses at Ziro, a hut on a floating island on Loktak.",
};

export default function HomestaysPage() {
  const homestays = getHomestays();

  return (
    <>
      <PageHero
        eyebrow={`${homestays.length} places to stay`}
        title="Stay in somebody's house"
        intro="Every homestay here is owned and run by the family living in it, and they set their own rates. We take a booking commission and nothing else. Two of them have no road to them at all."
        tint="shell"
        region="arunachal"
      />

      <SectionShell tint="paper">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div className="min-w-0">
            <h2 className="u-label mb-8 text-ink-soft">
              {homestays.length} homestays across eight states
            </h2>
            <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2">
              {homestays.map((stay, index) => (
                <li key={stay.slug}>
                  <Reveal delay={Math.min(index, 5) * 0.04}>
                    <StayCard
                      stay={stay}
                      priority={index < 2}
                      sizes="(max-width: 640px) 100vw, 420px"
                    />
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          {/* The locator sticks alongside the list on desktop and sits above
              it on mobile, where a sticky panel would eat the viewport. */}
          <div className="order-first lg:order-none">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <LocatorMap homestays={homestays} />
            </div>
          </div>
        </div>
      </SectionShell>
    </>
  );
}
