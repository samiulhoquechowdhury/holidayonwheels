import { redirect } from "next/navigation";

/**
 * The old office sign-in, kept only as a redirect.
 *
 * The office used to sign in here with a shared password. It now uses the
 * same `/sign-in` as everybody else, with a real account and a role.
 *
 * This route stays rather than being deleted because the URL is in operators'
 * browser history and bookmarks, and quite possibly written down somewhere.
 * A 404 for a bookmark that worked last week is an avoidable support call,
 * and the redirect costs one file.
 *
 * `redirectTo` sends them to `/admin` after signing in, which is where they
 * were trying to go.
 */
export default function AdminLoginRedirect() {
  redirect(`/sign-in?redirectTo=${encodeURIComponent("/admin")}`);
}
