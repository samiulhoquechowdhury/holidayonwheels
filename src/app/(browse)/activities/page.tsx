import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { JumpBar } from "@/components/layout/JumpBar";
import { Rise } from "@/components/motion/Rise";
import { Accent } from "@/components/primitives/Accent";
import { ActivityCard } from "@/components/cards/ResultCard";
import {
  ACTIVITY_CATEGORIES,
  getActivities,
  getActivitiesByCategory,
} from "@/content/activities";
import { paletteCycle } from "@/config/palette";

export const metadata: Metadata = {
  title: "Things to do around Guwahati",
  description:
    "Half-days and evenings within reach of Guwahati — a sunset cruise on the Brahmaputra, rhino at Pobitora, the silk village at Sualkuchi, and the market food walk.",
};

/**
 * Day activities, grouped by what they are.
 *
 * Everything here is reachable and back from Guwahati inside a day, which is
 * the one thing that makes the list coherent: almost every visitor to the
 * region lands in Guwahati, and almost every itinerary has a spare morning at
 * one end of it or the other.
 *
 * Grouped by category rather than listed flat, because the question people
 * arrive with is a mood — "something on the river", "something with animals"
 * — rather than a name. Five groups, each small enough to read whole.
 */
export default function ActivitiesPage() {
  const total = getActivities().length;
  const groups = ACTIVITY_CATEGORIES.map((category, index) => ({
    ...category,
    colour: paletteCycle[index % paletteCycle.length],
    items: getActivitiesByCategory(category.id),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <PageHero
        eyebrow={`${total} things to do`}
        title="Half a day in Guwahati, well spent"
        accent="well"
        intro="Everything here leaves the city and is back the same day. Add one to a trip you are planning, or take it on its own the morning before you fly."
        tint="paper"
        region="assam"
      />

      <JumpBar
        label="Jump to"
        items={groups.map((group) => ({
          id: group.id,
          label: group.label,
          colour: group.colour.surface,
          ink: group.colour.ink,
        }))}
      />

      {groups.map((group, index) => (
        <SectionShell
          key={group.id}
          id={group.id}
          tint={index % 2 === 0 ? "paper" : "shell"}
          className="scroll-mt-[calc(var(--header-h)+4rem)]"
        >
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--ink-hairline)] pb-8">
            <h2 className="text-36 lg:text-48">
              <span
                aria-hidden="true"
                className="mr-4 inline-block size-2.5 rounded-full align-middle"
                style={{ backgroundColor: group.colour.surface }}
              />
              {group.label}
            </h2>
            <p className="u-label text-ink-faint">
              {group.items.length}{" "}
              {group.items.length === 1 ? "thing to do" : "things to do"}
            </p>
          </div>

          <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {group.items.map((activity, cardIndex) => (
              <li key={activity.slug}>
                <Rise delay={Math.min(cardIndex, 3) * 0.05} distance={20}>
                  <ActivityCard
                    activity={activity}
                    priority={index === 0 && cardIndex < 3}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                  />
                </Rise>
              </li>
            ))}
          </ul>
        </SectionShell>
      ))}

      <SectionShell tint="night" spacing="tight">
        <p className="max-w-2xl text-22 text-night-text lg:text-28">
          Any of these can be <Accent>built into</Accent> a trip — plan the days
          and tell us which mornings are free.
        </p>
      </SectionShell>
    </>
  );
}
