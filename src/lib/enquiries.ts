import "server-only";

import { z } from "zod";
import { db } from "@/lib/supabase";
import { getDestinationBySlug } from "@/content/destinations";
import type { StateSlug } from "@/content/types";

/**
 * Writing and reading enquiries. The only module that names these tables.
 *
 * Validation is here rather than in the form because the form is a
 * convenience and this is the boundary. A hand-made POST does not run
 * `ContactForm`'s checks, so anything that must be true about a row is
 * asserted on this side of the wire — the same rule `plan-actions.ts` already
 * states for the planner.
 */

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Tell us what to call you.").max(120),
  email: z.string().trim().email("We need an email to reply to.").max(254),
  phone: z.string().trim().max(40).optional().default(""),
  state: z.string().trim().max(40).optional().default(""),
  month: z.string().trim().max(40).optional().default(""),
  party: z.string().trim().max(10).optional().default(""),
  message: z
    .string()
    .trim()
    .min(
      20,
      "A couple of sentences at least — the more specific you are, the more useful our reply.",
    )
    .max(4000),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export type EnquiryStatus = "new" | "in_progress" | "closed";

export type EnquiryRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  state: string | null;
  month: string | null;
  party_size: number | null;
  message: string;
  source: string;
  status: EnquiryStatus;
  staff_notes: string | null;
  handled_at: string | null;
};

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; errors: Record<string, string> }
  | { ok: false; reason: "unconfigured" | "failed" };

/**
 * Store one enquiry.
 *
 * Returns a discriminated reason rather than throwing, because the three
 * failures mean different things to the person at the form: their input is
 * wrong and they can fix it, the site is misconfigured and they cannot, or
 * the database refused and they should try again. A single `false` would
 * force the form to guess.
 */
export async function saveEnquiry(raw: unknown): Promise<SaveResult> {
  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "message");
      errors[key] ??= issue.message;
    }
    return { ok: false, reason: "invalid", errors };
  }

  const client = db();
  if (!client) return { ok: false, reason: "unconfigured" };

  const value = parsed.data;
  /*
   * An unknown state slug is dropped rather than rejected. It is an optional
   * qualifier on a message somebody has already written — refusing the whole
   * enquiry because a select was tampered with would lose a real customer to
   * stop a field that nothing depends on.
   */
  const state = getDestinationBySlug(value.state as StateSlug)
    ? value.state
    : null;

  const party = Number.parseInt(value.party, 10);

  const { error } = await client.from("enquiries").insert({
    name: value.name,
    email: value.email,
    phone: value.phone || null,
    state,
    month: value.month || null,
    party_size: Number.isFinite(party) && party > 0 ? party : null,
    message: value.message,
    source: "contact",
  });

  if (error) {
    console.error("[enquiries] insert failed:", error.message);
    return { ok: false, reason: "failed" };
  }

  return { ok: true };
}

/** Every enquiry, newest first. Admin only — this is unfiltered customer data. */
export async function listEnquiries(limit = 200): Promise<EnquiryRow[]> {
  const client = db();
  if (!client) return [];

  const { data, error } = await client
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[enquiries] list failed:", error.message);
    return [];
  }
  return (data ?? []) as EnquiryRow[];
}

export async function setEnquiryStatus(
  id: string,
  status: EnquiryStatus,
): Promise<boolean> {
  const client = db();
  if (!client) return false;

  const { error } = await client
    .from("enquiries")
    .update({
      status,
      /* Stamped when it leaves 'new', cleared if it is reopened. */
      handled_at: status === "new" ? null : new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("[enquiries] status update failed:", error.message);
    return false;
  }
  return true;
}

export async function setEnquiryNotes(
  id: string,
  notes: string,
): Promise<boolean> {
  const client = db();
  if (!client) return false;

  const { error } = await client
    .from("enquiries")
    .update({ staff_notes: notes.slice(0, 4000) || null })
    .eq("id", id);

  if (error) {
    console.error("[enquiries] notes update failed:", error.message);
    return false;
  }
  return true;
}

/** Counts for the admin's own landing screen. */
export async function enquiryCounts(): Promise<Record<EnquiryStatus, number>> {
  const rows = await listEnquiries(1000);
  const counts: Record<EnquiryStatus, number> = {
    new: 0,
    in_progress: 0,
    closed: 0,
  };
  for (const row of rows) counts[row.status] += 1;
  return counts;
}
