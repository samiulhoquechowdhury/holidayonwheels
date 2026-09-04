import type { DayOptions } from "./plan";

/**
 * What the traveller added to the plan, and what it costs.
 *
 * Pure, and deliberately client-safe: it imports a type and nothing else, so
 * the running total under the itinerary recalculates on every tap without a
 * round trip. The server recomputes the same figures from the same selections
 * when the enquiry is sent — this is the number on screen, not the number of
 * record.
 *
 * Three units, kept apart on purpose, because collapsing them is how a
 * booking total quietly becomes wrong:
 *
 *  - a **stay** supplement is per person, per night
 *  - an **activity** is per person
 *  - a **transfer** is per party — one vehicle, whoever is in it
 */

export type DaySelection = {
  transferId?: string;
  stayId?: string;
  activityIds: string[];
};

export type Selections = Record<number, DaySelection>;

export type ExtrasLine = {
  key: string;
  label: string;
  /** The arithmetic, spelled out. Never make anyone reverse-engineer a total. */
  detail: string;
  amount: number;
};

export type Extras = {
  stays: ExtrasLine[];
  activities: ExtrasLine[];
  transfers: ExtrasLine[];
  /** Everything above, in one figure. */
  total: number;
  /** How many days have had something chosen on them. */
  daysTouched: number;
};

/**
 * Everything starts on the option the trip price already covers: the first
 * stay at each place, the vehicle already booked, the airport we would have
 * guessed anyway, and no activities.
 *
 * That matters more than it looks. A form that starts empty forces a decision
 * on every day before the total means anything; a form that starts on the
 * included option is already a complete, correct, costed trip, and every
 * touch after that is the traveller *choosing* to spend more.
 */
export function defaultSelections(dayOptions: DayOptions[]): Selections {
  const out: Selections = {};
  for (const day of dayOptions) {
    out[day.day] = {
      transferId: day.transfer?.defaultId,
      stayId: day.stays[0]?.id,
      activityIds: [],
    };
  }
  return out;
}

export function buildExtras(
  dayOptions: DayOptions[],
  selections: Selections,
  heads: number,
): Extras {
  /*
   * Stays are grouped by option rather than listed per day. Six nights at the
   * same upgraded lodge is one line — "×6 nights, ×4 people" — not six
   * identical rows the reader has to add up themselves.
   */
  const stayTally = new Map<
    string,
    { name: string; nights: number; supplement: number }
  >();
  const activities: ExtrasLine[] = [];
  const transfers: ExtrasLine[] = [];
  let daysTouched = 0;

  for (const day of dayOptions) {
    const chosen = selections[day.day];
    if (!chosen) continue;
    let touched = false;

    const stay = day.stays.find((s) => s.id === chosen.stayId);
    if (stay && stay.supplement > 0) {
      const current = stayTally.get(stay.id);
      stayTally.set(stay.id, {
        name: stay.name,
        supplement: stay.supplement,
        nights: (current?.nights ?? 0) + 1,
      });
      touched = true;
    }

    const transfer = day.transfer?.options.find(
      (t) => t.id === chosen.transferId,
    );
    if (transfer && transfer.price > 0) {
      transfers.push({
        key: `t-${day.day}-${transfer.id}`,
        label: transfer.name,
        detail: `Day ${day.day} · one vehicle`,
        amount: transfer.price,
      });
      touched = true;
    }

    for (const id of chosen.activityIds) {
      const activity = day.activities.find((a) => a.id === id);
      if (!activity) continue;
      activities.push({
        key: `a-${day.day}-${activity.id}`,
        label: activity.name,
        detail:
          activity.price === 0
            ? `Day ${day.day} · no charge`
            : `Day ${day.day} · ×${heads} ${heads === 1 ? "person" : "people"}`,
        amount: activity.price * heads,
      });
      touched = true;
    }

    if (touched) daysTouched += 1;
  }

  const stays: ExtrasLine[] = [...stayTally.entries()].map(([id, entry]) => ({
    key: `s-${id}`,
    label: entry.name,
    detail: `×${entry.nights} ${entry.nights === 1 ? "night" : "nights"} · ×${heads} ${heads === 1 ? "person" : "people"}`,
    amount: entry.supplement * entry.nights * heads,
  }));

  const total = [...stays, ...activities, ...transfers].reduce(
    (sum, line) => sum + line.amount,
    0,
  );

  return { stays, activities, transfers, total, daysTouched };
}

/** A one-line summary for a collapsed day, so nothing chosen is ever hidden. */
export function summariseDay(
  day: DayOptions,
  selection: DaySelection | undefined,
): string | null {
  if (!selection) return null;
  const parts: string[] = [];

  const stay = day.stays.find((s) => s.id === selection.stayId);
  if (stay && stay.supplement > 0) parts.push(stay.name);

  const transfer = day.transfer?.options.find(
    (t) => t.id === selection.transferId,
  );
  // The pickup is always worth surfacing even at no charge: it is the one
  // answer on day one that the operator cannot guess.
  if (transfer && (transfer.price > 0 || day.day === 1))
    parts.push(transfer.name);

  const count = selection.activityIds.length;
  if (count > 0) parts.push(`${count} ${count === 1 ? "extra" : "extras"}`);

  return parts.length > 0 ? parts.join(" · ") : null;
}
