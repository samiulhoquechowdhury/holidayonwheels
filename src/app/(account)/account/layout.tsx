import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * The gate in front of every account screen.
 *
 * ## Why the guard is a layout
 *
 * A layout runs before any page nested under it renders, so one file protects
 * `/account`, `/account/bookings`, `/account/permits` and anything added
 * later. Putting the check in each page means the next page added is public,
 * and it looks identical in the browser until somebody signs out and tries.
 *
 * This is the same reasoning as the admin's `(guarded)` group, with one
 * difference: there is no login page nested under `/account`, so no route
 * group is needed to keep it out of the guard. Sign-in lives at `/sign-in`,
 * a sibling.
 *
 * ## Why it redirects rather than showing a sign-in form
 *
 * Somebody who follows a link to their booking should land on sign-in and
 * then be returned to the booking, not dropped on a generic account page
 * having forgotten where they were going. `redirectTo` carries the original
 * path; `safeRedirect` in `auth-actions.ts` is what stops it being used to
 * bounce people off-site.
 *
 * ## Why this does not also check a role
 *
 * Every signed-in person may see their own account, including staff and
 * administrators — they are also travellers. Role only decides what the
 * *admin* area allows, which is checked there.
 */
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    /*
     * The path is hardcoded rather than read from headers. A layout cannot
     * see the matched route of the page below it, and the `x-invoke-path`
     * style headers Next once exposed are internal and have moved before.
     * `/account` is the right landing place for all three screens; getting
     * the person back to the exact sub-page is not worth depending on an
     * undocumented header for.
     */
    redirect(`/sign-in?redirectTo=${encodeURIComponent("/account")}`);
  }

  return <>{children}</>;
}
