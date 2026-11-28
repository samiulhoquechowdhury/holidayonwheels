import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { officeUser } from "@/lib/office-session";
import { formatINR } from "@/lib/currency";
import { PageHeading, Tile, LoadError } from "@/components/admin/Shell";

export const metadata: Metadata = {
  title: "Office",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

/**
 * What is waiting, in one screen.
 *
 * ## Where the numbers come from
 *
 * One call to the API's `/dashboard`, which runs the dozen aggregates
 * concurrently in Postgres. This page used to read every enquiry and every
 * trip request into memory and count them in JavaScript — fine at thirty
 * rows, quadratically less fine later, and it could not answer anything about
 * bookings or money because that data did not exist yet.
 *
 * ## What is deliberately not here
 *
 * Rows. Only counts, money, and a link to the filtered list behind each one.
 * An overview that tried to summarise individual records would be a worse
 * version of the lists it links to, and it would grow a panel every time
 * somebody wanted one. What an operator opening this at nine in the morning
 * needs is the number of things nobody has touched, and one click to them.
 */
type Dashboard = {
  enquiries: Record<string, number>;
  tripRequests: Record<string, number>;
  bookings: Record<string, number>;
  money: {
    booked: number;
    paid: number;
    outstanding: number;
    receivedLast30Days: number;
  };
  attention: {
    departingWithin30Days: number;
    departuresNearlyFull: number;
    newEnquiries: number;
    newTripRequests: number;
  };
  content: Record<string, number>;
  recentActivity: {
    action: string;
    entity: string;
    entityLabel: string | null;
    actorEmail: string | null;
    createdAt: string;
  }[];
};

export default async function AdminHomePage() {
  const [user, result] = await Promise.all([
    officeUser(),
    apiFetch<Dashboard>("/dashboard"),
  ]);

  if (!result.ok) {
    return (
      <>
        <PageHeading
          title="Office"
          intro="Everything travellers have sent, and what has been done about it."
        />
        <LoadError what="the dashboard" message={result.error.message} />
      </>
    );
  }

  const d = result.data;
  const plural = (n: number, one: string, many: string) =>
    n === 1 ? one : many;

  return (
    <>
      <PageHeading
        title={user?.name ? `Good day, ${user.name.split(" ")[0]}` : "Office"}
        intro="Everything travellers have sent, and what has been done about it."
      />

      {/* --- What needs somebody ----------------------------------------- */}
      <h2 className="u-label mt-10 text-ink-faint">Waiting for someone</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          href="/admin/enquiries?status=new"
          label="New enquiries"
          figure={String(d.attention.newEnquiries)}
          note={`${plural(d.attention.newEnquiries, "message", "messages")} nobody has opened`}
          tone="attention"
        />
        <Tile
          href="/admin/trips?status=new"
          label="New trip requests"
          figure={String(d.attention.newTripRequests)}
          note={`${plural(d.attention.newTripRequests, "itinerary", "itineraries")} nobody has opened`}
          tone="attention"
        />
        <Tile
          href="/admin/bookings?status=pending-payment"
          label="Awaiting payment"
          figure={String(d.bookings["pending-payment"] ?? 0)}
          note="booked but not yet paid in full"
          tone="attention"
        />
        <Tile
          href="/admin/bookings"
          label="Departing in 30 days"
          figure={String(d.attention.departingWithin30Days)}
          note={`${plural(d.attention.departuresNearlyFull, "departure", "departures")} nearly full: ${d.attention.departuresNearlyFull}`}
        />
      </div>

      {/* --- Money -------------------------------------------------------- */}
      <h2 className="u-label mt-12 text-ink-faint">Money</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          label="Booked"
          figure={formatINR(d.money.booked)}
          note="every booking not cancelled"
        />
        <Tile
          label="Received"
          figure={formatINR(d.money.paid)}
          note="paid against those bookings"
        />
        <Tile
          label="Outstanding"
          figure={formatINR(d.money.outstanding)}
          note="still to collect"
          tone="attention"
        />
        <Tile
          label="Last 30 days"
          figure={formatINR(d.money.receivedLast30Days)}
          note="payments recorded, refunds netted off"
        />
      </div>

      {/* --- The catalogue ----------------------------------------------- */}
      <h2 className="u-label mt-12 text-ink-faint">Published</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Tile
          href="/admin/content/tours"
          label="Tours"
          figure={String(d.content.tours ?? 0)}
          note={
            d.content.tourDrafts
              ? `${d.content.tourDrafts} in draft`
              : "none in draft"
          }
        />
        <Tile
          href="/admin/content/homestays"
          label="Homestays"
          figure={String(d.content.homestays ?? 0)}
        />
        <Tile
          href="/admin/content/motorcycle-tours"
          label="Expeditions"
          figure={String(d.content.expeditions ?? 0)}
        />
        <Tile
          href="/admin/content/events"
          label="Events"
          figure={String(d.content.events ?? 0)}
        />
        <Tile
          href="/admin/content/activities"
          label="Activities"
          figure={String(d.content.activities ?? 0)}
        />
      </div>

      {/* --- Who changed what -------------------------------------------- */}
      <h2 className="u-label mt-12 text-ink-faint">Recent changes</h2>
      {d.recentActivity.length === 0 ? (
        <p className="mt-4 text-16 text-ink-soft">
          Nothing has been changed yet.
        </p>
      ) : (
        <ol className="mt-4 divide-y divide-[var(--ink-hairline)] overflow-hidden rounded-[var(--radius-input)] border border-[var(--ink-hairline)] bg-paper">
          {d.recentActivity.map((entry, i) => (
            <li
              key={`${entry.createdAt}-${i}`}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-14"
            >
              <span className="u-label text-ink-faint">{entry.action}</span>
              <span className="text-ink">
                {entry.entityLabel ?? entry.entity}
              </span>
              <span className="text-ink-softer">
                {entry.entity.replace(/_/g, " ")}
              </span>
              <span className="text-13 text-ink-softer ml-auto">
                {entry.actorEmail ?? "system"} ·{" "}
                {new Date(entry.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </li>
          ))}
        </ol>
      )}

      <p className="text-13 text-ink-softer mt-10">
        Looking for something older?{" "}
        <Link href="/admin/enquiries" className="underline underline-offset-4">
          Enquiries
        </Link>{" "}
        and{" "}
        <Link href="/admin/trips" className="underline underline-offset-4">
          trip requests
        </Link>{" "}
        both search and filter.
      </p>
    </>
  );
}
