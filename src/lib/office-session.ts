import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Who may use the office area, and the one place that decides it.
 *
 * ## What this replaces
 *
 * `src/lib/admin-session.ts` — one shared password in `ADMIN_PASSWORD`, one
 * signed cookie, no idea who was holding it. That was the right amount of
 * machinery when the admin had two read-only screens and one operator. It is
 * the wrong amount now: staff can change live prices and take payments, so
 * the audit log has to be able to name a person, and an individual leaving
 * has to be revocable without telling everybody else a new password.
 *
 * That module is gone, along with `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
 * and the form that used them. `/admin/login` remains as a redirect to
 * `/sign-in`, because the URL is in operators' bookmarks and a 404 for a
 * link that worked last week is an avoidable support call.
 *
 * ## Why `staff` and `admin` and not one `isStaff`
 *
 * The two roles differ in what they may do, not in whether they may enter:
 * staff answer enquiries and record payments, administrators also change
 * content, prices and accounts. Both see the office; only one sees the
 * editing screens. Collapsing them to a boolean here would push that
 * distinction into every page, which is where it gets forgotten.
 *
 * The API enforces the same split independently — see `requireStaff` and
 * `requireAdmin` there. That duplication is deliberate: this guard protects
 * *rendering*, and a server action or a direct API call never renders a page.
 */

export type OfficeRole = "staff" | "admin";

export type OfficeUser = {
  id: string;
  email: string;
  name: string | null;
  role: OfficeRole;
};

/**
 * The signed-in office user, or null.
 *
 * Returns null for a signed-in traveller too. They have an account, but not
 * this one — and the caller decides whether that means "sign in" or "you do
 * not have access", which are different sentences.
 */
export async function officeUser(): Promise<OfficeUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;
  if (user.role !== "staff" && user.role !== "admin") return null;

  return {
    id: user.id,
    email: user.email ?? "",
    name: user.name ?? null,
    role: user.role,
  };
}

/** True only for an administrator. Used to hide editing screens from staff. */
export async function isOfficeAdmin(): Promise<boolean> {
  return (await officeUser())?.role === "admin";
}

/**
 * For server actions: the office user, or stop.
 *
 * ## Why every action calls this and does not rely on the layout
 *
 * `"use server"` publishes each exported function as an HTTP endpoint anybody
 * can post to with a crafted request. The layout guard protects what renders;
 * it does not run for an action invoked directly. A signed-out caller cannot
 * see the buttons and can still call what is behind them.
 *
 * It throws rather than returning null so that forgetting to check the result
 * is not a silent authorisation bypass. A missed `if (!user) return` reads
 * fine in review; a missing `await requireOffice()` does not run at all.
 */
export async function requireOffice(): Promise<OfficeUser> {
  const user = await officeUser();
  if (!user) {
    throw new Error("Not authorised: this action needs an office account.");
  }
  return user;
}

/** As above, for the actions only an administrator may call. */
export async function requireOfficeAdmin(): Promise<OfficeUser> {
  const user = await requireOffice();
  if (user.role !== "admin") {
    throw new Error("Not authorised: this action needs an administrator.");
  }
  return user;
}

/**
 * For pages and layouts: send them somewhere useful instead of erroring.
 *
 * `redirect()` works by throwing a value Next recognises, so this never
 * returns in the signed-out case — hence the `never` on that branch and the
 * non-null guarantee for callers.
 */
export async function requireOfficePage(
  redirectTo = "/admin",
): Promise<OfficeUser> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const role = session.user.role;
  if (role !== "staff" && role !== "admin") {
    /*
     * Signed in, but as a traveller. Not a redirect to sign-in — they are
     * already signed in, and bouncing them to a form they would fill in with
     * the same credentials is a loop from the user's point of view. The
     * layout renders a "no access" screen for this case instead.
     */
    redirect("/account?noAccess=office");
  }

  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    role,
  };
}
