import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { Reveal } from "@/components/layout/Reveal";
import { EventCard } from "@/components/cards/ResultCard";
import { getEvents } from "@/content/events";
import { formatMonthYear } from "@/lib/date";

export const metadata: Metadata = {
  title: "Festivals and events",
  description:
    "Hornbill, Ziro, Bihu, Wangala, Chapchar Kut and more — festival and event tickets across Northeast India, with permits handled.",
};

export default function EventsPage() {
  const events = getEvents();

  // Grouped by month, because timing is the whole reason someone is on this
  // page — nobody browses festivals alphabetically.
  const byMonth = events.reduce<Record<string, typeof events>>((acc, event) => {
    const key = event.startDate.slice(0, 7);
    (acc[key] ??= []).push(event);
    return acc;
  }, {});

  const months = Object.keys(byMonth).sort();

  return (
    <>
      <PageHero
        eyebrow={`${events.length} events`}
        title="Time it right"
        intro="The region's festivals are its best argument, and most of them are fixed to a season rather than a date. Several sell their accommodation out a year ahead."
        tint="sand"
        region="mizoram"
      />

      <SectionShell tint="paper">
        <div className="flex flex-col gap-20">
          {months.map((month) => (
            <section key={month}>
              <h2 className="u-label mb-8 border-b border-[var(--ink-hairline)] pb-4 text-ink-soft">
                {formatMonthYear(`${month}-01`)}
              </h2>
              <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
                {byMonth[month].map((event, index) => (
                  <li key={event.slug}>
                    <Reveal delay={Math.min(index, 3) * 0.05}>
                      <EventCard
                        event={event}
                        priority={month === months[0] && index < 3}
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px"
                      />
                    </Reveal>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </SectionShell>
    </>
  );
}
