import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { JumpBar } from "@/components/layout/JumpBar";
import { Rise } from "@/components/motion/Rise";
import { EventCard } from "@/components/cards/ResultCard";
import { getEvents } from "@/content/events";
import { formatMonthYear } from "@/lib/date";
import { eventShots } from "@/config/showcase";
import { colourFor } from "@/config/palette";

export const metadata: Metadata = {
  title: "Festivals and events",
  description:
    "Hornbill, Ziro, Bihu, Wangala, Chapchar Kut and more — festival and event tickets across Northeast India, with permits handled.",
};

/**
 * Festivals, by month.
 *
 * Grouped by month because timing is the entire reason anyone is on this page
 * — nobody browses festivals alphabetically, and nobody browses them by
 * state either: you go to Hornbill because it is December, not because it is
 * Nagaland.
 *
 * Three things carry that, and each is a real answer to "can I actually go?":
 *
 *  - **A month jump bar** with the count in each, so the shape of the year is
 *    visible before any scrolling happens. The same shared `JumpBar` the
 *    destinations index uses for states.
 *  - **Month headings set as display type**, with how far off they are stated
 *    in plain words. "March 2027" means nothing at a glance; "in 7 months"
 *    is the number someone is actually doing arithmetic on.
 *  - **A booking-window warning** on anything close enough that the
 *    accommodation is the constraint rather than the ticket. That is a fact
 *    about Kohima in December, not a pressure tactic, and it is the single
 *    most useful thing this page can tell someone.
 */
export default function EventsPage() {
  const events = getEvents();

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
        accent="right"
        image={eventShots[0]}
        intro="The region's festivals are its best argument, and most of them are fixed to a season rather than a date. Several sell their accommodation out a year ahead."
        tint="paper"
        region="mizoram"
      />

      <JumpBar
        label="Jump to a month"
        items={months.map((month) => ({
          id: `m-${month}`,
          label: formatMonthYear(`${month}-01`),
          note: String(byMonth[month].length),
        }))}
      />

      <SectionShell tint="paper" spacing="tight">
        <div className="flex flex-col gap-24">
          {months.map((month, monthIndex) => {
            const monthEvents = byMonth[month];
            const away = monthsAway(`${month}-01`);
            // Colour the month by its first event's state. Arbitrary on a
            // month with two states in it, but it is decoration keyed to real
            // content rather than a rotation, and it keeps the page from
            // being twelve identical grey headings.
            const colour = colourFor(monthEvents[0]?.state);

            return (
              <section
                key={month}
                id={`m-${month}`}
                className="scroll-mt-[calc(var(--header-h)+5rem)]"
              >
                <Rise className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-[var(--ink-hairline)] pb-5">
                  <div className="flex items-baseline gap-5">
                    <span
                      aria-hidden="true"
                      className="h-0.5 w-10 shrink-0 translate-y-[-0.4em] rounded-full"
                      style={{ backgroundColor: colour.surface }}
                    />
                    <h2 className="font-display text-36 lg:text-48">
                      {formatMonthYear(`${month}-01`)}
                    </h2>
                  </div>

                  <p className="u-label flex items-center gap-3 text-ink-faint">
                    <span>
                      {monthEvents.length}{" "}
                      {monthEvents.length === 1 ? "event" : "events"}
                    </span>
                    {away !== null ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{away}</span>
                      </>
                    ) : null}
                    {/* Stated only where it is true and actionable. A warning
                        on all twelve months is wallpaper. */}
                    {isTight(`${month}-01`) ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span style={{ color: "var(--naga-ink)" }}>
                          Book accommodation now
                        </span>
                      </>
                    ) : null}
                  </p>
                </Rise>

                <ul className="grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
                  {monthEvents.map((event, index) => (
                    <li key={event.slug}>
                      <Rise delay={Math.min(index, 3) * 0.05} distance={20}>
                        <EventCard
                          event={event}
                          priority={monthIndex === 0 && index < 3}
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px"
                        />
                      </Rise>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </SectionShell>
    </>
  );
}

/**
 * "in 7 months", "next month", "this month".
 *
 * Returns null for anything in the past rather than "8 months ago" — a
 * festival that has been is not a product, and the page should not draw the
 * eye to it.
 */
function monthsAway(iso: string): string | null {
  const now = new Date();
  const target = new Date(iso);
  const diff =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth());

  if (diff < 0) return null;
  if (diff === 0) return "this month";
  if (diff === 1) return "next month";
  if (diff < 12) return `in ${diff} months`;
  const years = Math.floor(diff / 12);
  return years === 1 ? "in about a year" : `in about ${years} years`;
}

/**
 * True when the event is close enough that beds, not tickets, are the
 * constraint. Six months is the honest threshold for Kohima in December.
 */
function isTight(iso: string): boolean {
  const now = new Date();
  const target = new Date(iso);
  const diff =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth());
  return diff >= 0 && diff <= 6;
}
