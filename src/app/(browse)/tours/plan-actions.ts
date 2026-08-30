"use server";

import { planTrip, type PlanInput, type TripPlan } from "@/lib/plan";
import { isPartyType } from "@/lib/party";
import { getDestinationBySlug } from "@/content/destinations";
import { nightsBetween, toISO } from "@/lib/date";
import type { StateSlug } from "@/content/types";

/**
 * The planner's one server call.
 *
 * The itinerary is composed on the server rather than in the browser, and the
 * reason is weight rather than secrecy: `day-library.ts` is twenty-five
 * kilobytes of hand-written prose about sixty places, and the catalogue it
 * matches against is another two hundred. Planning here means the tours page
 * ships the *plan* — a few kilobytes of the traveller's own trip — instead of
 * every day of every route they did not ask for.
 *
 * It also puts the shape of the thing in the right place. When a real
 * reservations API lands, this file calls it and returns the same `TripPlan`;
 * nothing in the browser has to know that anything changed.
 *
 * Everything crossing this boundary is re-validated. The client is the thing
 * that produced these values, which is exactly why it is not trusted with
 * them — a hand-edited request must fail cleanly rather than plan a fourteen-
 * month trip to a state that does not exist.
 */

export type PlanResponse =
  { ok: true; plan: TripPlan } | { ok: false; error: string };

/** As far ahead as a trip can sensibly be planned against live content. */
const MAX_LEAD_DAYS = 540;
/** The longest single-state trip the planner will attempt. */
const MAX_TRIP_DAYS = 21;

export async function planTripAction(raw: PlanInput): Promise<PlanResponse> {
  const destination = getDestinationBySlug(raw.state as StateSlug);
  if (!destination) {
    return { ok: false, error: "We do not run trips in that state." };
  }
  if (!isPartyType(raw.party)) {
    return { ok: false, error: "Tell us who is travelling." };
  }
  if (!isISODate(raw.startDate) || !isISODate(raw.endDate)) {
    return { ok: false, error: "Those dates did not come through. Try again." };
  }

  const nights = nightsBetween(raw.startDate, raw.endDate);
  if (nights < 2) {
    return {
      ok: false,
      error:
        "Two nights is the shortest trip we will plan. Anything less is spent on the road.",
    };
  }
  if (nights + 1 > MAX_TRIP_DAYS) {
    return {
      ok: false,
      error: `${MAX_TRIP_DAYS} days is as long as we plan in one state. Beyond that we would be combining two or three, which is a conversation rather than a form.`,
    };
  }

  const today = toISO(new Date());
  if (raw.startDate < today) {
    return { ok: false, error: "That start date has already passed." };
  }
  if (nightsBetween(today, raw.startDate) > MAX_LEAD_DAYS) {
    return {
      ok: false,
      error:
        "That is further ahead than our published season runs. Write to us and we will plan it by hand.",
    };
  }

  const adults = clamp(Math.round(raw.adults), 1, 16);
  const children = clamp(Math.round(raw.children), 0, 8);

  return {
    ok: true,
    plan: planTrip({
      state: destination.slug,
      party: raw.party,
      startDate: raw.startDate,
      endDate: raw.endDate,
      adults,
      children,
    }),
  };
}

function isISODate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
