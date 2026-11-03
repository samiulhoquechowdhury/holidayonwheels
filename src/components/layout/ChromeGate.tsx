"use client";

import { usePathname } from "next/navigation";

/** Routes that get none of the public site's chrome. */
export function isInternalRoute(pathname: string | null): boolean {
  return Boolean(pathname && pathname.startsWith("/admin"));
}

/**
 * Hides the public site's furniture on internal routes.
 *
 * `/admin` is a tool, not a page. Rendering the marketing header over it put
 * "Destinations · Activities · Homestays · Account" on top of a screen full
 * of travellers' phone numbers — links that lead *out* of the task, a wordmark
 * that makes a screenshot of the admin look like a screenshot of the site,
 * and an "Account" control meaning something different from the sign-in the
 * operator just used.
 *
 * ## Why a client gate rather than a second root layout
 *
 * Next's proper answer to "two different shells" is two root layouts, each
 * with its own `<html>`. That would mean moving all four existing route
 * groups under a `(site)` folder and duplicating the fonts, the stylesheet,
 * the preconnects and the metadata into a second root — a change touching
 * every route on a site that currently works, to style one internal screen.
 *
 * The alternative that does *not* work is reading the path in the root
 * layout: `headers()` would opt the whole tree into dynamic rendering and
 * cost all 191 static pages their prerendering. `Header` is already a client
 * component calling `usePathname`, so this costs nothing that is not already
 * being paid.
 *
 * The `<main>` element stays in the root layout and the admin deliberately
 * does *not* render its own. Two nested `<main>` elements is invalid HTML and
 * gives a screen-reader user two "main" landmarks to choose between, which is
 * how this was caught.
 */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  return isInternalRoute(usePathname()) ? null : <>{children}</>;
}
