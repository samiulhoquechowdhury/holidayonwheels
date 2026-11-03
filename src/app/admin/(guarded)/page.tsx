import type { Metadata } from "next";
import Link from "next/link";
import { listEnquiries } from "@/lib/enquiries";
import { listTrips } from "@/lib/trips";
import { formatINR } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Office",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * What is waiting, in one screen.
 *
 * Deliberately only counts and the two ways in. An overview that tried to
 * summarise every record would be a worse version of the two lists it links
 * to; what an operator opening this at nine in the morning needs is the
 * number of things nobody has touched yet, and one click to them.
 */
export default async function AdminHomePage() {
  const [enquiries, trips] = await Promise.all([listEnquiries(), listTrips()]);

  const newEnquiries = enquiries.filter((row) => row.status === "new").length;
  const newTrips = trips.filter((row) => row.status === "new").length;
  /* Only what is still live: a lost trip's value is not pipeline. */
  const pipeline = trips
    .filter((row) => row.status !== "lost" && row.status !== "closed")
    .reduce((sum, row) => sum + row.total, 0);

  return (
    <>
      <h1 className="text-28">Office</h1>
      <p className="mt-3 max-w-prose text-16 text-ink-soft">
        Everything travellers have sent, and what has been done about it.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile
          href="/admin/enquiries"
          label="Enquiries"
          figure={String(newEnquiries)}
          note={`${newEnquiries === 1 ? "message" : "messages"} nobody has opened · ${enquiries.length} in all`}
        />
        <Tile
          href="/admin/trips"
          label="Trip requests"
          figure={String(newTrips)}
          note={`${newTrips === 1 ? "itinerary" : "itineraries"} nobody has opened · ${trips.length} in all`}
        />
        <Tile
          href="/admin/trips"
          label="Live pipeline"
          figure={formatINR(pipeline)}
          note="quoted across every trip not yet lost or closed"
        />
      </div>
    </>
  );
}

function Tile({
  href,
  label,
  figure,
  note,
}: {
  href: string;
  label: string;
  figure: string;
  note: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-[var(--radius-card)] border border-[var(--ink-hairline)] bg-paper p-5 transition-colors hover:border-ink"
    >
      <p className="u-label text-ink-faint">{label}</p>
      <p className="u-num mt-3 font-display text-36 group-hover:underline">
        {figure}
      </p>
      <p className="mt-2 text-14 text-ink-soft">{note}</p>
    </Link>
  );
}
