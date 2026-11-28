import type { Metadata } from "next";
import Link from "next/link";
import { requireOfficePage } from "@/lib/office-session";
import { signOutAction } from "@/app/(account)/auth-actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The admin, and the gate in front of it.
 *
 * ## The guard is here and not in middleware
 *
 * The session now has to be resolved against Postgres — the role is read
 * from the user row so a demotion takes effect at once rather than at the
 * next sign-in — and middleware runs on the edge runtime, which has no
 * database connection. A middleware guard would have to trust the cookie's
 * contents, which is the thing an attacker controls. This layout is a server
 * component on the Node runtime, so it can do the real check.
 *
 * ## Who gets in
 *
 * `staff` and `admin`, decided by `requireOfficePage`. This used to be one
 * shared password from `ADMIN_PASSWORD`, which could not say who was holding
 * it — and the audit log now has to name a person, because staff can change
 * prices and record payments.
 *
 * ## Why this is `(guarded)` and not `admin/layout.tsx`
 *
 * It was the latter first, and that was a redirect loop. A layout at
 * `app/admin/` wraps *everything* under `/admin` — including `/admin/login`,
 * which it then redirected to `/admin/login`, forever. The sign-in page
 * cannot live behind the sign-in check.
 *
 * The route group fixes it without changing a single URL: `(guarded)` is
 * parentheses, so it contributes nothing to the path, and `/admin/login`
 * simply sits outside it. **Anything new that must be protected goes inside
 * this folder.** A page added at `app/admin/whatever/` would be as public as
 * the login screen, and would look identical in the browser until somebody
 * noticed.
 *
 * ## Why the admin is its own route group and not `(account)`
 *
 * `(account)` is the traveller's own screens — their bookings, their permits.
 * This is the business looking at everybody's. They share no navigation, no
 * header and no audience, and putting them together would mean one careless
 * `<Link>` from a customer page into an internal one.
 *
 * The admin also deliberately does not use `SectionShell`, `PageHero` or the
 * marketing type scale. It is a tool, not a page: dense, plain, and visually
 * unlike the site so nobody confuses a screenshot of one for the other.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* Redirects on its own if there is no office session. Never returns null. */
  const user = await requireOfficePage();

  return (
    <div className="min-h-dvh bg-shell text-ink">
      {/*
        Hides the fallback submit buttons next to auto-submitting selects.
        Inline and before the controls so it applies on first paint rather
        than flashing a button that is about to disappear.

        A stylesheet cannot express "only when script runs", and `<noscript>`
        is the wrong way round — it would leave the button in the DOM for
        assistive technology whenever script *is* available. A one-line style
        injected by script is the only version that removes the control
        exactly when it is redundant. See `SubmitSelect`.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: "",
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html:
            "document.documentElement.insertAdjacentHTML('beforeend'," +
            "'<style>.js-hide{display:none}</style>')",
        }}
      />
      <header className="sticky top-0 z-10 border-b border-[var(--ink-hairline)] bg-paper">
        <div className="mx-auto flex max-w-[78rem] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5">
          <Link href="/admin" className="u-label text-ink">
            Holidays on Wheels — office
          </Link>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <AdminLink href="/admin/enquiries">Enquiries</AdminLink>
            <AdminLink href="/admin/trips">Trip requests</AdminLink>
            <AdminLink href="/admin/bookings">Bookings</AdminLink>
            {/* Content and accounts are an administrator's, not staff's —
                hidden rather than shown-and-refused, so the nav does not
                offer a door that does not open. The API refuses them for
                staff regardless of what is rendered here. */}
            {user.role === "admin" ? (
              <>
                <AdminLink href="/admin/content">Content</AdminLink>
                <AdminLink href="/admin/users">Accounts</AdminLink>
              </>
            ) : null}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            {/* Who is signed in. With a shared password there was nothing to
                show here; now that actions are attributed, an operator
                should be able to see which account they are acting as. */}
            <span className="u-label text-ink-faint">
              {user.name ?? user.email}
              <span className="text-ink-softer ml-2">{user.role}</span>
            </span>
            {/* The way back to the real site, which an operator will want
                constantly and would otherwise type by hand. */}
            <Link
              href="/"
              className="u-label text-ink-faint underline underline-offset-4 hover:text-ink"
            >
              View site
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="u-label min-h-9 rounded-full border border-[var(--ink-hairline-strong)] px-4 text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* A div, not a `<main>`. The root layout already renders
          `<main id="main">` around every route, and nesting a second one is
          invalid HTML and gives a screen reader two landmarks called "main".
          See `ChromeGate`. */}
      <div className="mx-auto max-w-[78rem] px-5 py-10">{children}</div>
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="u-label text-ink-soft transition-colors hover:text-ink"
    >
      {children}
    </Link>
  );
}
