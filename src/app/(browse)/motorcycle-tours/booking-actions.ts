"use server";

import { saveEnquiry, type SaveResult } from "@/lib/enquiries";

/**
 * A completed expedition booking request.
 *
 * ## Why this ends in `enquiries` and not `/checkout`
 *
 * `/checkout` does not exist. `BookingWidget` has been pushing to it for
 * months — `router.push("/checkout?…")` — and that route is not in the app,
 * so every "Book" button on a motorcycle or stay detail page lands on a 404.
 * Pointing a new flow at the same hole would have made two broken paths
 * instead of one.
 *
 * `enquiries` is real: the table exists, the admin reads it, and the office
 * already works from it. A guided expedition is confirmed by a human anyway
 * — seats, bike allocation and the ILP for Arunachal are not things a form
 * can settle — so "we will confirm within a day" is what actually happens
 * rather than a euphemism for an unfinished checkout.
 *
 * Everything crossing this boundary is re-validated in `saveEnquiry`, for
 * the reason stated in `plan-actions.ts`: the client produced these values,
 * which is exactly why they are not trusted with them.
 */
export async function submitExpeditionBooking(input: {
  name: string;
  email: string;
  phone: string;
  expedition: string;
  departure: string;
  returns: string;
  riders: number;
  pillions: number;
  days: number;
  total: number;
  notes: string;
}): Promise<SaveResult> {
  /*
   * The structured facts are written into the message rather than into new
   * columns. `enquiries` is a free-text table by design and the office reads
   * it as prose; a schema migration per booking field would be four columns
   * that only this one form ever writes.
   */
  const lines = [
    `EXPEDITION BOOKING REQUEST`,
    ``,
    `Expedition : ${input.expedition}`,
    `Departs    : ${input.departure}`,
    `Returns    : ${input.returns}`,
    `Duration   : ${input.days} days`,
    `Riders     : ${input.riders}`,
    `Pillions   : ${input.pillions}`,
    `Quoted     : ₹${input.total.toLocaleString("en-IN")} total, as shown to the rider`,
    ``,
    input.notes.trim() ? `Their note : ${input.notes.trim()}` : `No note left.`,
  ];

  return saveEnquiry({
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: lines.join("\n"),
  });
}
