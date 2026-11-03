import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isSignedIn, adminConfigured } from "@/lib/admin-session";
import { dbConfigured } from "@/lib/supabase";
import { signOut } from "../actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The admin, and the gate in front of it.
 *
 * ## The guard is here and not in middleware
 *
 * Middleware runs on the edge runtime, where `node:crypto` does not exist, so
 * it cannot verify the session's HMAC — a middleware guard would have to
 * trust the cookie's shape, which is the thing an attacker controls. This
 * layout is a server component: it runs before any page nested under it
 * renders, on the Node runtime, and can check the signature properly.
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
  if (!adminConfigured()) return <NotConfigured />;
  if (!(await isSignedIn())) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-shell text-ink">
      <header className="sticky top-0 z-10 border-b border-[var(--ink-hairline)] bg-paper">
        <div className="mx-auto flex max-w-[78rem] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5">
          <Link href="/admin" className="u-label text-ink">
            Holidays on Wheels — office
          </Link>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <AdminLink href="/admin/enquiries">Enquiries</AdminLink>
            <AdminLink href="/admin/trips">Trip requests</AdminLink>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            {/* The way back to the real site, which an operator will want
                constantly and would otherwise type by hand. */}
            <Link
              href="/"
              className="u-label text-ink-faint underline underline-offset-4 hover:text-ink"
            >
              View site
            </Link>
            <form action={signOut}>
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

      {!dbConfigured() ? (
        <p
          role="alert"
          className="border-b border-clay bg-sand px-5 py-3 text-center text-16"
        >
          No database is configured, so every screen below is empty. Set
          <code className="mx-1.5">NEXT_PUBLIC_SUPABASE_URL</code> and
          <code className="mx-1.5">SUPABASE_SERVICE_ROLE_KEY</code>. See
          <code className="mx-1.5">.env.example</code>.
        </p>
      ) : null}

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

/**
 * Shown when `ADMIN_PASSWORD` or `ADMIN_SESSION_SECRET` is unset.
 *
 * It renders instead of the sign-in form rather than beside it, because a
 * sign-in form with no configured password is not a locked door — it is a
 * door with no lock, and letting it render would be an invitation to try
 * strings against it.
 */
function NotConfigured() {
  return (
    <div className="grid min-h-dvh place-items-center bg-shell px-5">
      <div className="max-w-xl">
        <p className="u-label text-ink-faint">Admin</p>
        <h1 className="mt-4 text-28">Not configured yet</h1>
        <p className="mt-5 text-16 text-ink-soft">
          This area needs two environment variables before it will open at all:
          <code className="mx-1.5">ADMIN_PASSWORD</code> and
          <code className="mx-1.5">ADMIN_SESSION_SECRET</code>. Until both are
          set there is no sign-in to attempt, which is why there is no form on
          this screen.
        </p>
        <p className="mt-4 text-16 text-ink-soft">
          <code>.env.example</code> has both, with a note on generating the
          secret.
        </p>
      </div>
    </div>
  );
}
