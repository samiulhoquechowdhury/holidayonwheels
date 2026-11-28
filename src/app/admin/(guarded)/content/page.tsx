import type { Metadata } from "next";
import Link from "next/link";
import { RESOURCES } from "@/lib/admin-resources";
import { PageHeading } from "@/components/admin/Shell";

export const metadata: Metadata = {
  title: "Content",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Everything on the site that can be edited, listed once.
 *
 * Static on purpose: it is a menu, not a report. Putting counts on each card
 * would mean fifteen aggregate queries to render a list of links, and the
 * count is on the list behind each one anyway.
 */
export default function AdminContentIndexPage() {
  return (
    <>
      <PageHeading
        title="Content"
        intro="Everything the public site shows. Changes go live when you publish."
      />

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RESOURCES.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/admin/content/${r.slug}`}
              className="block h-full rounded-[var(--radius-input)] border border-[var(--ink-hairline)] bg-paper p-5 transition-colors hover:border-ink"
            >
              <p className="text-16 text-ink">{r.title}</p>
              <p className="text-13 text-ink-softer mt-2">{r.blurb}</p>
              {!r.publishable ? (
                <p className="u-label text-ink-softer mt-3">
                  always live — no draft state
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-13 text-ink-softer mt-10 max-w-prose">
        A new record starts as a draft and is invisible to the public until you
        publish it. Archiving takes something off the site while keeping it for
        the bookings that point at it — which is why a tour somebody has booked
        cannot be deleted.
      </p>
    </>
  );
}
