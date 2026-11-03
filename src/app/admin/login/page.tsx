import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSignedIn, adminConfigured } from "@/lib/admin-session";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Never prerendered.
 *
 * This page reads the session cookie, which ought to make it dynamic on its
 * own — but with `ADMIN_PASSWORD` unset at build time `adminConfigured()`
 * returns false and the redirect below runs *before* `isSignedIn()` is ever
 * called, so Next saw no dynamic API and baked the whole thing to static. A
 * build with the variables set produced a dynamic route and one without them
 * produced a static redirect to `/admin`, which, since `/admin` redirects
 * back here, is the loop this route group exists to prevent.
 *
 * Build output must not depend on which environment variables happened to be
 * present, so this is pinned rather than inferred.
 */
export const dynamic = "force-dynamic";

/**
 * The sign-in screen.
 *
 * It sits *outside* the guard, in `admin/login/` rather than in
 * `admin/(guarded)/`. That is load-bearing and was learned the hard way: with
 * the guard in `app/admin/layout.tsx` it wrapped this page too, and a login
 * page behind a login check redirects to itself forever. The guard in
 * `../(guarded)/layout.tsx` sends people here; this page sends them back once
 * the cookie exists.
 */
export default async function AdminLoginPage() {
  if (!adminConfigured()) redirect("/admin");
  if (await isSignedIn()) redirect("/admin");

  return (
    <div className="grid min-h-dvh place-items-center bg-shell px-5">
      <div className="w-full max-w-sm">
        <p className="u-label text-ink-faint">Holidays on Wheels</p>
        <h1 className="mt-3 text-28">Office</h1>
        <p className="mt-4 text-16 text-ink-soft">
          This area holds travellers&rsquo; names, numbers and itineraries.
        </p>
        <SignInForm />
      </div>
    </div>
  );
}
