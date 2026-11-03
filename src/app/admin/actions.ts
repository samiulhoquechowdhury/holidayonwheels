"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  checkPassword,
  startSession,
  endSession,
  adminConfigured,
} from "@/lib/admin-session";
import { setEnquiryStatus, setEnquiryNotes } from "@/lib/enquiries";
import type { EnquiryStatus } from "@/lib/enquiries";
import { setTripStatus, setTripNotes } from "@/lib/trips";
import type { TripStatus } from "@/lib/trips";
import { isSignedIn } from "@/lib/admin-session";

/**
 * Everything the admin can do, as server actions.
 *
 * ## Every one of these re-checks the session
 *
 * `"use server"` publishes each export as an HTTP endpoint that anybody can
 * call with a crafted request. The layout's guard protects *rendering*, not
 * these functions — a signed-out caller cannot see the buttons but can still
 * post to the action behind them. So each mutation starts with `isSignedIn()`.
 * That is not belt-and-braces, it is the only check that applies to a request
 * which never rendered a page.
 *
 * `signIn` is the exception and must be: it is the one that runs before there
 * is a session.
 */

async function guard(): Promise<void> {
  if (!(await isSignedIn())) {
    throw new Error("Not signed in.");
  }
}

export type SignInResult = { ok: false; error: string };

/**
 * Sign in with the shared password.
 *
 * Returns only a failure: success redirects, which throws, so there is no
 * success value to return. The error copy is deliberately identical whatever
 * went wrong — a message that distinguished "wrong password" from anything
 * else would be a hint to somebody guessing.
 */
export async function signIn(
  _previous: SignInResult | null,
  formData: FormData,
): Promise<SignInResult> {
  if (!adminConfigured()) {
    return { ok: false, error: "Admin access is not configured." };
  }

  const password = String(formData.get("password") ?? "");
  if (!password || !checkPassword(password)) {
    /*
     * A deliberate pause on failure. It is not a defence on its own — a real
     * attacker parallelises — but it takes a careless online guessing attempt
     * from thousands of attempts a minute to a few, and costs a legitimate
     * operator who mistyped half a second once.
     */
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ok: false, error: "That password is not right." };
  }

  await startSession();
  redirect("/admin");
}

export async function signOut(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

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
