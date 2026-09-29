import Link from "next/link";
import { formatShort } from "@/lib/date";
import { formatINR } from "@/lib/currency";
import type { TripPlan } from "@/lib/plan";

/**
 * While you are there.
 *
 * Three cards under the itinerary: anything on during the dates, somewhere
 * for coffee, somewhere for dinner. It is the only block in the planner that
 * sells nothing — none of these is bookable through us — and that is what
 * makes it worth having. A planner that only ever points at its own inventory
 * reads as a brochure; one that tells you where the good thali is reads as
 * somebody who lives there.
 *
 * It sits *after* the accordion and before the confirm bar, because it is
 * reading rather than deciding. Putting it between the days and the button
 * would be putting a distraction in the path of the one action on the page,
 * so it goes below the point where the trip has already been specified.
 *
 * **It renders nothing when there is nothing to say.** No guide for the state
 * and no events in the window means no section — an empty "no events found"
 * card is a worse answer than silence, and the six states without a
 * researched guide would otherwise all show one. See `local-guide.ts` for
 * what is verified and what still needs the client's check.
 */
export function LocalPicks({
  picks,
  stateName,
}: {
  picks: TripPlan["localPicks"];
  stateName: string;
}) {
  const hasEvents = picks.events.length > 0;
  const hasFood = picks.cafes.length > 0 || picks.dinners.length > 0;
  if (!hasEvents && !hasFood) return null;

  return (
    <section
      aria-labelledby="plan-local"
      className="mt-16 border-t border-[var(--ink-hairline)] pt-12 lg:mt-20 lg:pt-14"
    >
      <p className="u-label flex items-center gap-4 text-ink-faint">
        <span
          aria-hidden="true"
          className="h-0.5 w-12 shrink-0 rounded-full bg-clay"
        />
        While you are there
      </p>
      <h3 id="plan-local" className="mt-5 max-w-2xl text-28 lg:text-36">
        {picks.city
          ? `Worth knowing about ${picks.city}`
          : `Worth knowing about ${stateName}`}
      </h3>
      <p className="mt-3 max-w-xl text-16 text-ink-soft">
        None of this is booked through us. It is where we would go on the
        evenings the itinerary leaves open.
      </p>

      <div className="mt-9 grid gap-4 md:grid-cols-3 lg:gap-5">
        {hasEvents ? (
          <Card title="On while you are here" accent>
            <ul className="flex flex-col gap-4">
              {picks.events.map((event) => (
                <li key={event.slug}>
                  <Link
                    href={`/events/${event.slug}`}
                    className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                  >
                    <p className="text-16 font-medium group-hover:underline">
                      {event.name}
                    </p>
                    <p className="mt-1 text-14 text-ink-soft">{event.venue}</p>
                    <p className="u-label u-num mt-2 text-ink-faint">
                      {formatShort(event.startDate)} –{" "}
                      {formatShort(event.endDate)} · from{" "}
                      {formatINR(event.fromPrice)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {picks.cafes.length > 0 ? (
          <Card title="Coffee and a sit down">
            <Places places={picks.cafes} />
          </Card>
        ) : null}

        {picks.dinners.length > 0 ? (
          <Card title="Dinner worth booking">
            <Places places={picks.dinners} />
          </Card>
        ) : null}
      </div>

      <p className="mt-5 text-14 text-ink-faint">
        Hours change and places close. Tell us which of these you fancy and we
        will ring ahead and book the table.
      </p>
    </section>
  );
}

function Card({
  title,
  accent = false,
  children,
}: {
  title: string;
  /** The events card, when there is one. It is the time-bound one. */
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article
      className={
        accent
          ? "rounded-[var(--radius-panel)] border border-[var(--ink-hairline-strong)] bg-shell p-6"
          : "rounded-[var(--radius-panel)] border border-[var(--ink-hairline)] p-6"
      }
    >
      <h4 className="u-label text-ink-faint">{title}</h4>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function Places({ places }: { places: TripPlan["localPicks"]["cafes"] }) {
  return (
    <ul className="flex flex-col gap-4">
      {places.map((place) => (
        <li key={place.name}>
          <p className="text-16 font-medium">{place.name}</p>
          <p className="mt-1 text-14 text-ink-soft">{place.note}</p>
          {place.fromPrice ? (
            <p className="u-label u-num mt-2 text-ink-faint">
              About {formatINR(place.fromPrice)} a head
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
