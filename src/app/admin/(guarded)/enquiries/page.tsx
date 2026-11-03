import type { Metadata } from "next";
import { listEnquiries, type EnquiryStatus } from "@/lib/enquiries";
import { getDestinationName } from "@/content/destinations";
import type { StateSlug } from "@/content/types";
import { StatusPicker } from "@/components/admin/StatusPicker";
import { NotesBox } from "@/components/admin/NotesBox";
import { updateEnquiryStatus, updateEnquiryNotes } from "../../actions";

export const metadata: Metadata = {
  title: "Enquiries",
  robots: { index: false, follow: false, nocache: true },
};

/* Read fresh on every load. A cached list of who needs calling back is worse
   than no list: it is a list that is quietly wrong. */
export const dynamic = "force-dynamic";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "Working" },
  { value: "closed", label: "Closed" },
] as const satisfies readonly { value: EnquiryStatus; label: string }[];

/**
 * Every contact-form message.
 *
 * One card per enquiry rather than a table, because the message is the point
 * and a message does not fit in a cell. A table of forty rows with the body
 * truncated to forty characters would make the operator open every one to
 * find out which matter.
 *
 * Sorted newest first and *not* grouped by status: the office works this top
 * to bottom, and a closed enquiry from this morning is still useful context
 * beside a new one from this afternoon.
 */
export default async function EnquiriesPage() {
  const rows = await listEnquiries();
  const open = rows.filter((row) => row.status !== "closed").length;

  return (
    <>
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-28">Enquiries</h1>
        <p className="u-num text-16 text-ink-soft">
          {rows.length} total · {open} open
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="mt-8 max-w-prose text-16 text-ink-soft">
          Nothing yet. Messages from the contact form land here the moment they
          are sent.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-[var(--radius-card)] border border-[var(--ink-hairline)] bg-paper p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h2 className="text-18">{row.name}</h2>
                <p className="u-num text-14 text-ink-faint">
                  {new Date(row.created_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              {/* Contact details as links, because the next thing the operator
                  does after reading this is reply to it. */}
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-16">
                <a
                  href={`mailto:${row.email}`}
                  className="text-ink underline underline-offset-4"
                >
                  {row.email}
                </a>
                {row.phone ? (
                  <a
                    href={`tel:${row.phone.replace(/\s+/g, "")}`}
                    className="u-num text-ink underline underline-offset-4"
                  >
                    {row.phone}
                  </a>
                ) : null}
              </p>

              <p className="u-label mt-3 text-ink-faint">
                {[
                  row.state
                    ? getDestinationName(row.state as StateSlug)
                    : "No state given",
                  row.month || "No month given",
                  row.party_size ? `${row.party_size} travelling` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              {/* `whitespace-pre-line` so the paragraphs somebody typed stay
                  the paragraphs they typed. */}
              <p className="mt-4 max-w-prose text-16 whitespace-pre-line text-ink-soft">
                {row.message}
              </p>

              <div className="mt-5 grid gap-5 border-t border-[var(--ink-hairline)] pt-5 lg:grid-cols-[auto_1fr] lg:gap-8">
                <StatusPicker
                  id={row.id}
                  value={row.status}
                  options={STATUSES}
                  onChange={updateEnquiryStatus}
                />
                <NotesBox
                  id={row.id}
                  initial={row.staff_notes ?? ""}
                  onSave={updateEnquiryNotes}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
