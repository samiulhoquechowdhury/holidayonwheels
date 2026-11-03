import type { Metadata } from "next";
import { listTrips, type TripStatus } from "@/lib/trips";
import { formatINR } from "@/lib/currency";
import { formatRange } from "@/lib/date";
import { StatusPicker } from "@/components/admin/StatusPicker";
import { NotesBox } from "@/components/admin/NotesBox";
import { updateTripStatus, updateTripNotes } from "../../actions";

export const metadata: Metadata = {
  title: "Trip requests",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "Working" },
  { value: "quoted", label: "Quoted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "lost", label: "Lost" },
] as const satisfies readonly { value: TripStatus; label: string }[];

/**
 * Itineraries somebody completed and sent.
 *
 * The reference is the heading because it is the string the traveller has in
 * front of them and will read out on the phone — the operator's first job is
 * to find the row somebody is calling about, and sorting by date does not help
 * with that.
 *
 * The full day-by-day plan is deliberately *not* rendered here. It is stored
 * in `plan`, it is twenty days of prose on a long trip, and forty of them on
 * one screen would bury the thing this page is for: who is waiting, for when,
 * and for how much. The per-trip page is the next increment.
 */
export default async function TripsPage() {
  const rows = await listTrips();
  const open = rows.filter(
    (row) => row.status !== "confirmed" && row.status !== "lost",
  ).length;

  return (
    <>
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-28">Trip requests</h1>
        <p className="u-num text-16 text-ink-soft">
          {rows.length} total · {open} open
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="mt-8 max-w-prose text-16 text-ink-soft">
          Nothing yet. A completed run through the planner lands here with the
          traveller&rsquo;s details, their dates and the quote as it was quoted.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-[var(--radius-card)] border border-[var(--ink-hairline)] bg-paper p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h2 className="u-num text-18">{row.reference}</h2>
                <p className="u-num text-14 text-ink-faint">
                  {new Date(row.created_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <p className="mt-1 text-16">
                {row.state_name} · {formatRange(row.start_date, row.end_date)} ·{" "}
                {row.nights} {row.nights === 1 ? "night" : "nights"}
              </p>

              <p className="u-label mt-2 text-ink-faint">
                {row.adults} {row.adults === 1 ? "adult" : "adults"}
                {row.children > 0
                  ? `, ${row.children} ${row.children === 1 ? "child" : "children"}${
                      row.child_ages.filter(Boolean).length > 0
                        ? ` (${row.child_ages.filter(Boolean).join(", ")})`
                        : ""
                    }`
                  : ""}{" "}
                · {row.party}
              </p>

              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-16">
                <span>{row.lead_name}</span>
                <a
                  href={`mailto:${row.lead_email}`}
                  className="text-ink underline underline-offset-4"
                >
                  {row.lead_email}
                </a>
                <a
                  href={`tel:${row.lead_phone.replace(/\s+/g, "")}`}
                  className="u-num text-ink underline underline-offset-4"
                >
                  {row.lead_phone}
                </a>
              </p>

              {row.companions.filter(Boolean).length > 0 ? (
                <p className="u-label mt-2 text-ink-faint">
                  With: {row.companions.filter(Boolean).join(", ")}
                </p>
              ) : null}

              {row.traveller_notes ? (
                <p className="mt-4 max-w-prose text-16 whitespace-pre-line text-ink-soft">
                  “{row.traveller_notes}”
                </p>
              ) : null}

              {/* The money, as quoted. `total` is stored, not recomputed —
                  see the note at the top of lib/trips.ts. */}
              <p className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-y border-[var(--ink-hairline)] py-3">
                <span className="u-num font-display text-22">
                  {formatINR(row.total)}
                </span>
                <span className="u-label text-ink-faint">
                  quoted total
                  {row.deposit > 0
                    ? ` · ${formatINR(row.deposit)} deposit`
                    : ""}
                </span>
              </p>

              <div className="mt-5 grid gap-5 lg:grid-cols-[auto_1fr] lg:gap-8">
                <StatusPicker
                  id={row.id}
                  value={row.status}
                  options={STATUSES}
                  onChange={updateTripStatus}
                />
                <NotesBox
                  id={row.id}
                  initial={row.staff_notes ?? ""}
                  onSave={updateTripNotes}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
