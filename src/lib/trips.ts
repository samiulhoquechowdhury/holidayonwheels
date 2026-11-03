import "server-only";

import { z } from "zod";
import { db } from "@/lib/supabase";

/**
 * Trip requests: a completed run through the planner, stored.
 *
 * ## What gets stored, and what does not
 *
 * The whole `TripPlan` goes into `plan` as JSON, prices included. That is not
 * laziness about modelling — it is the point. The itinerary is composed from
 * `src/content/*`, which is code that changes: a supplement edited in March
 * would otherwise rewrite what somebody was quoted in November. A business
 * has to be able to say what it actually offered, so the offer is kept as it
 * was made.
 *
 * `selections` is kept alongside it, even though `plan` already reflects the
 * choices, because the two answer different questions. `plan` is "what we
 * quoted"; `selections` is "which options they picked", which survives into a
 * rebuild if the office wants to re-run the same choices against new rates.
 *
 * ## The reference is the key people will actually use
 *
 * `reference` is the string the planner already shows the traveller and the
 * one they will read out on the phone. It is `unique`, so a resubmission of
 * the same plan collides rather than quietly creating a second row — see
 * `saveTrip`, which treats that collision as success.
 */

const travellerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(40),
});

export const tripSchema = z.object({
  reference: z.string().trim().min(3).max(40),
  state: z.string().trim().min(2).max(40),
  stateName: z.string().trim().min(2).max(80),
  party: z.string().trim().min(2).max(40),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nights: z.number().int().positive().max(40),
  adults: z.number().int().positive().max(40),
  children: z.number().int().min(0).max(40),
  childAges: z.array(z.string().max(10)).max(40),
  lead: travellerSchema,
  companions: z.array(z.string().max(120)).max(40),
  notes: z.string().max(4000).optional().default(""),
  selections: z.record(z.string(), z.unknown()),
  plan: z.record(z.string(), z.unknown()),
  total: z.number().int().min(0),
  deposit: z.number().int().min(0),
});

export type TripInput = z.infer<typeof tripSchema>;

export type TripStatus =
  "new" | "in_progress" | "quoted" | "confirmed" | "lost" | "closed";

export type TripRow = {
  id: string;
  created_at: string;
  reference: string;
  state: string;
  state_name: string;
  party: string;
  start_date: string;
  end_date: string;
  nights: number;
  adults: number;
  children: number;
  child_ages: string[];
  lead_name: string;
  lead_email: string;
  lead_phone: string;
  companions: string[];
  traveller_notes: string | null;
  selections: Record<string, unknown>;
  plan: Record<string, unknown>;
  total: number;
  deposit: number;
  status: TripStatus;
  staff_notes: string | null;
  handled_at: string | null;
};

export type SaveTripResult =
  | { ok: true; reference: string }
  | { ok: false; reason: "invalid" | "unconfigured" | "failed" };

/** Store one completed itinerary. */
export async function saveTrip(raw: unknown): Promise<SaveTripResult> {
  const parsed = tripSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("[trips] rejected:", parsed.error.issues[0]?.message);
    return { ok: false, reason: "invalid" };
  }

  const client = db();
  if (!client) return { ok: false, reason: "unconfigured" };

  const v = parsed.data;
  const { error } = await client.from("trip_requests").insert({
    reference: v.reference,
    state: v.state,
    state_name: v.stateName,
    party: v.party,
    start_date: v.startDate,
    end_date: v.endDate,
    nights: v.nights,
    adults: v.adults,
    children: v.children,
    child_ages: v.childAges,
    lead_name: v.lead.name,
    lead_email: v.lead.email,
    lead_phone: v.lead.phone,
    companions: v.companions,
    traveller_notes: v.notes || null,
    selections: v.selections,
    plan: v.plan,
    total: v.total,
    deposit: v.deposit,
  });

  if (error) {
    /*
     * 23505 is unique_violation on `reference`, which means this exact plan
     * is already stored — a double-submit, or a reload of the send. The row
     * the traveller cares about exists, so this is success, not failure.
     */
    if (error.code === "23505") return { ok: true, reference: v.reference };
    console.error("[trips] insert failed:", error.message);
    return { ok: false, reason: "failed" };
  }

  return { ok: true, reference: v.reference };
}

export async function listTrips(limit = 200): Promise<TripRow[]> {
  const client = db();
  if (!client) return [];

  const { data, error } = await client
    .from("trip_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[trips] list failed:", error.message);
    return [];
  }
  return (data ?? []) as TripRow[];
}

export async function setTripStatus(
  id: string,
  status: TripStatus,
): Promise<boolean> {
  const client = db();
  if (!client) return false;

  const { error } = await client
    .from("trip_requests")
    .update({
      status,
      handled_at: status === "new" ? null : new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("[trips] status update failed:", error.message);
    return false;
  }
  return true;
}

export async function setTripNotes(
  id: string,
  notes: string,
): Promise<boolean> {
  const client = db();
  if (!client) return false;

  const { error } = await client
    .from("trip_requests")
    .update({ staff_notes: notes.slice(0, 4000) || null })
    .eq("id", id);

  if (error) {
    console.error("[trips] notes update failed:", error.message);
    return false;
  }
  return true;
}
