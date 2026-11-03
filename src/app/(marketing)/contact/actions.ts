"use server";

import { saveEnquiry, type SaveResult } from "@/lib/enquiries";

/**
 * The contact form's one server call.
 *
 * It does nothing but hand the payload to `saveEnquiry`, which owns the
 * validation and the table. The indirection earns its place by being the
 * boundary: `"use server"` makes this function a public HTTP endpoint, and
 * everything it touches has to be safe against a request that never came from
 * the form. `saveEnquiry` re-validates for exactly that reason.
 */
export async function submitEnquiry(raw: unknown): Promise<SaveResult> {
  return saveEnquiry(raw);
}
