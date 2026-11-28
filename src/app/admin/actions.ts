"use server";

import { revalidatePath } from "next/cache";
import { requireOffice } from "@/lib/office-session";
import { setEnquiryStatus, setEnquiryNotes } from "@/lib/enquiries";
import type { EnquiryStatus } from "@/lib/enquiries";
import { setTripStatus, setTripNotes } from "@/lib/trips";
import type { TripStatus } from "@/lib/trips";

/**
 * Everything the admin can do, as server actions.
 *
 * ## Every one of these re-checks the session
 *
 * `"use server"` publishes each export as an HTTP endpoint that anybody can
 * call with a crafted request. The layout's guard protects *rendering*, not
 * these functions — a signed-out caller cannot see the buttons but can still
 * post to the action behind them. So each mutation starts with `guard()`.
 * That is not belt-and-braces, it is the only check that applies to a request
 * which never rendered a page.
 *
 * `signIn` is the exception and must be: it is the one that runs before there
 * is a session.
 */

/**
 * Every mutation below starts here.
 *
 * `requireOffice` throws unless the caller holds a `staff` or `admin`
 * account. It replaces a check against one shared password, which could not
 * say *who* was making the change — and these actions write to the audit
 * trail, which has to name somebody.
 */
async function guard(): Promise<void> {
  await requireOffice();
}

export type SignInResult = { ok: false; error: string };

/*
 * `signIn` and `signOut` used to live here, built on one shared password.
 * They are gone: the office now signs in at `/sign-in` with a real account,
 * and signs out through `signOutAction` in `(account)/auth-actions.ts`. One
 * sign-in for the whole site means one session format, one cookie, and one
 * place where "who is this" is answered.
 *
 * `SignInResult` is still exported above because the old `/admin/login`
 * route's form imports the type; that route is now a redirect and both go
 * when it is deleted.
 */

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus,
): Promise<void> {
  await guard();
  await setEnquiryStatus(id, status);
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

export async function updateEnquiryNotes(
  id: string,
  notes: string,
): Promise<void> {
  await guard();
  await setEnquiryNotes(id, notes);
  revalidatePath("/admin/enquiries");
}

export async function updateTripStatus(
  id: string,
  status: TripStatus,
): Promise<void> {
  await guard();
  await setTripStatus(id, status);
  revalidatePath("/admin/trips");
  revalidatePath("/admin");
}

export async function updateTripNotes(
  id: string,
  notes: string,
): Promise<void> {
  await guard();
  await setTripNotes(id, notes);
  revalidatePath("/admin/trips");
}
