"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { requireOffice, requireOfficeAdmin } from "@/lib/office-session";

/**
 * The office's mutations.
 *
 * ## Every one of these re-checks the session
 *
 * `"use server"` publishes each export as an HTTP endpoint anybody can post
 * to with a crafted request. The layout's guard protects *rendering*, not
 * these functions — a signed-out caller cannot see the buttons but can still
 * call what is behind them. So each starts with `requireOffice()` or
 * `requireOfficeAdmin()`.
 *
 * That is a check in front of a check: the API validates the same session and
 * the same role independently. Neither is redundant. This one gives a useful
 * error in the UI; the API's is the one that holds when somebody skips the UI
 * entirely.
 *
 * ## Why these return a result instead of throwing
 *
 * Each is called from a form through `useActionState`, and a thrown error in
 * a server action reaches the client as "an error occurred in the Server
 * Components render" with the message stripped in production. Returning the
 * API's own message means the operator sees "The amount paid cannot be more
 * than the total" rather than a generic failure.
 */

export type ActionResult =
  { ok: true } | { ok: false; error: string; field?: string };

/** Turn an API failure into something worth showing an operator. */
function failed(error: {
  message: string;
  details?: Record<string, string>;
}): ActionResult {
  const field = error.details ? Object.keys(error.details)[0] : undefined;
  return {
    ok: false,
    /*
     * Prefer the field-level message. The top-level one is a category
     * ("Some of the values sent were not valid"); the detail says which value
     * and why, which is the part that lets somebody fix it.
     */
    error: (field && error.details?.[field]) || error.message,
    field,
  };
}

/* ===================================================================== */
/* Bookings                                                              */
/* ===================================================================== */

const paymentSchema = z.object({
  bookingId: z.string().uuid(),
  reference: z.string().min(1),
  /*
   * Parsed from a text field by hand rather than with `z.coerce`.
   *
   * An operator types "1,20,000" or "₹1,20,000" — both are numbers to a
   * person and `Number()` gives NaN for both, so the separators go first.
   * `z.coerce.number()` would also happily accept "" as 0, which would record
   * a zero payment from an empty box.
   *
   * (This app is on zod 4 and the API is on zod 3; `.pipe(z.coerce…)` does
   * not typecheck across that difference. One transform avoids depending on
   * which version is installed here.)
   */
  amount: z.string().transform((raw, ctx) => {
    const cleaned = raw.replace(/[,\s₹]/g, "");
    if (!cleaned) {
      ctx.addIssue({ code: "custom", message: "Enter an amount." });
      return z.NEVER;
    }
    const n = Number(cleaned);
    if (!Number.isInteger(n)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a whole number of rupees.",
      });
      return z.NEVER;
    }
    return n;
  }),
  method: z.enum(["bank-transfer", "upi", "card", "cash", "other"]),
  externalReference: z.string().max(200).optional(),
  note: z.string().max(2000).optional(),
});

export async function recordPayment(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireOffice();

  const parsed = paymentSchema.safeParse({
    bookingId: formData.get("bookingId"),
    reference: formData.get("reference"),
    amount: formData.get("amount"),
    method: formData.get("method"),
    externalReference: formData.get("externalReference") || undefined,
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? "Check the amount and try again.",
      field: issue?.path[0] as string | undefined,
    };
  }

  const { bookingId, reference, ...body } = parsed.data;

  if (body.amount === 0) {
    return { ok: false, error: "Enter an amount.", field: "amount" };
  }

  const result = await apiFetch(`/bookings/${bookingId}/payments`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!result.ok) return failed(result.error);

  revalidatePath(`/admin/bookings/${reference}`);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true };
}

const bookingStatusSchema = z.object({
  bookingId: z.string().uuid(),
  reference: z.string().min(1),
  status: z.enum(["pending-payment", "confirmed", "completed", "cancelled"]),
});

export async function setBookingStatus(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireOffice();

  const parsed = bookingStatusSchema.safeParse({
    bookingId: formData.get("bookingId"),
    reference: formData.get("reference"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { ok: false, error: "That status is not valid." };

  const result = await apiFetch(`/bookings/${parsed.data.bookingId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: parsed.data.status }),
  });
  if (!result.ok) return failed(result.error);

  revalidatePath(`/admin/bookings/${parsed.data.reference}`);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true };
}

export async function setBookingNotes(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireOffice();

  const bookingId = String(formData.get("bookingId") ?? "");
  const reference = String(formData.get("reference") ?? "");
  const staffNotes = String(formData.get("staffNotes") ?? "");

  const result = await apiFetch(`/bookings/${bookingId}`, {
    method: "PATCH",
    /* Empty clears the note rather than storing "". */
    body: JSON.stringify({ staffNotes: staffNotes.trim() || null }),
  });
  if (!result.ok) return failed(result.error);

  revalidatePath(`/admin/bookings/${reference}`);
  return { ok: true };
}

/* ===================================================================== */
/* Accounts — administrators only                                        */
/* ===================================================================== */

const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["traveller", "staff", "admin"]),
});

export async function setUserRole(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireOfficeAdmin();

  const parsed = roleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { ok: false, error: "That role is not valid." };

  const result = await apiFetch(`/users/${parsed.data.userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role: parsed.data.role }),
  });
  /*
   * The API refuses to demote the last active administrator and refuses to
   * let somebody demote themselves. Those messages are written for a person,
   * so they are passed through rather than replaced.
   */
  if (!result.ok) return failed(result.error);

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setUserDisabled(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireOfficeAdmin();

  const userId = String(formData.get("userId") ?? "");
  const disabled = formData.get("disabled") === "true";

  const result = await apiFetch(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ disabled }),
  });
  if (!result.ok) return failed(result.error);

  revalidatePath("/admin/users");
  return { ok: true };
}

/* ===================================================================== */
/* Content — administrators only                                         */
/* ===================================================================== */

/**
 * Publish, unpublish or archive one record.
 *
 * `resource` arrives from the form and is checked against a list rather than
 * interpolated into the path as given. Without that, a crafted request could
 * post `resource=../users/<id>` and reach an endpoint this action was never
 * meant to expose.
 */
const RESOURCES = [
  "tours",
  "homestays",
  "motorcycle-tours",
  "events",
  "activities",
  "cafes",
  "journal",
  "destinations",
  "faqs",
  "policies",
] as const;

const publishSchema = z.object({
  resource: z.enum(RESOURCES),
  id: z.string().uuid(),
  action: z.enum(["publish", "unpublish", "archive"]),
});

export async function setPublishState(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireOfficeAdmin();

  const parsed = publishSchema.safeParse({
    resource: formData.get("resource"),
    id: formData.get("id"),
    action: formData.get("action"),
  });
  if (!parsed.success) {
    return { ok: false, error: "That is not something this can change." };
  }

  const { resource, id, action } = parsed.data;
  const result = await apiFetch(`/${resource}/${id}/${action}`, {
    method: "POST",
  });
  if (!result.ok) return failed(result.error);

  revalidatePath(`/admin/content/${resource}`);
  revalidatePath("/admin");
  return { ok: true };
}
