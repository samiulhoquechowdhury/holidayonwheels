import type { Metadata } from "next";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { formatINR } from "@/lib/currency";
import { formatRange } from "@/lib/date";
import {
  PageHeading,
  DataTable,
  Row,
  Cell,
  StatusPill,
  LoadError,
  Tile,
} from "@/components/admin/Shell";

export const metadata: Metadata = {
  title: "Bookings",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

type Booking = {
  id: string;
  reference: string;
  kind: string;
  title: string;
  leadName: string;
  leadEmail: string;
  startDate: string;
  endDate: string;
  travellers: number;
  total: number;
  amountPaid: number;
  status: string;
  bookedAt: string;
};

const STATUSES = [
  "pending-payment",
  "confirmed",
  "completed",
  "cancelled",
] as const;

/**
 * Every booking, with what has been paid against it.
 *
 * ## Why the totals come from the API and not from this page
 *
 * The figures above the table are for the whole filtered set, not the page of
 * fifty being shown. Summing the rows here would give "the total of what you
 * can see", which answers no question anybody has — and would quietly change
 * when somebody turned the page. `/bookings` returns `valueBooked` and
 * `valuePaid` computed over the same `WHERE` clause as the rows.
 *
 * ## Why the filters are links and not a form
 *
 * Each filter is a URL. That makes a filtered view something an operator can
 * bookmark, send to a colleague, or reach from the dashboard tile — all of
 * which a client-side form state cannot do. It also means this page needs no
 * JavaScript at all.
 */
export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; kind?: string }>;
}) {
  const { status, q, kind } = await searchParams;

  const params = new URLSearchParams({ limit: "100" });
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  if (kind) params.set("kind", kind);

  const result = await apiFetch<Booking[]>(`/bookings?${params}`);

  if (!result.ok) {
    return (
      <>
        <PageHeading title="Bookings" />
        <LoadError what="bookings" message={result.error.message} />
      </>
    );
  }

  const rows = result.data;
  const meta = (result.meta ?? {}) as {
    total?: number;
    valueBooked?: number;
    valuePaid?: number;
  };

  return (
    <>
      <PageHeading
        title="Bookings"
        intro="What has been sold, and what has been paid for it."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Tile
          label="Bookings"
          figure={String(meta.total ?? rows.length)}
          note="matching this filter"
        />
        <Tile
          label="Value"
          figure={formatINR(meta.valueBooked ?? 0)}
          note="as quoted"
        />
        <Tile
          label="Outstanding"
          figure={formatINR((meta.valueBooked ?? 0) - (meta.valuePaid ?? 0))}
          note="still to collect"
          tone="attention"
        />
      </div>

      {/* --- Filters ------------------------------------------------------ */}
      <nav
        className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2"
        aria-label="Filter bookings"
      >
        <FilterLink href="/admin/bookings" active={!status}>
          All
        </FilterLink>
        {STATUSES.map((s) => (
          <FilterLink
            key={s}
            href={`/admin/bookings?status=${s}`}
            active={status === s}
          >
            {s.replace(/-/g, " ")}
          </FilterLink>
        ))}

        {/* GET, so the search term lands in the URL like every other filter. */}
        <form
          method="GET"
          action="/admin/bookings"
          className="ml-auto flex items-center gap-2"
        >
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <label htmlFor="q" className="u-label text-ink-faint">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="reference, name, email"
            className="min-h-9 w-56 rounded-[var(--radius-input)] border border-[var(--ink-hairline-strong)] bg-paper px-3 text-14"
          />
          <button
            type="submit"
            className="u-label min-h-9 rounded-full border border-[var(--ink-hairline-strong)] px-3 text-ink-soft hover:border-ink hover:text-ink"
          >
            Go
          </button>
        </form>
      </nav>

      <DataTable
        columns={[
          "Reference",
          "Trip",
          "Traveller",
          "Dates",
          "Total",
          "Paid",
          "Status",
        ]}
        empty={
          q || status
            ? "No bookings match that filter."
            : "No bookings yet. They appear here as soon as somebody books."
        }
      >
        {rows.map((b) => (
          <Row key={b.id}>
            <Cell label="Reference">
              <Link
                href={`/admin/bookings/${b.reference}`}
                className="u-num underline decoration-[var(--ink-hairline-strong)] underline-offset-4 hover:decoration-ink"
              >
                {b.reference}
              </Link>
            </Cell>
            <Cell label="Trip">
              {b.title}
              <span className="text-13 text-ink-softer ml-2">{b.kind}</span>
            </Cell>
            <Cell label="Traveller">
              {b.leadName}
              <span className="text-13 text-ink-softer block">
                {b.leadEmail}
              </span>
            </Cell>
            <Cell label="Dates">{formatRange(b.startDate, b.endDate)}</Cell>
            <Cell label="Total" numeric>
              {formatINR(b.total)}
            </Cell>
            <Cell label="Paid" numeric>
              {/*
                The shortfall is what an operator is looking for, so it is
                shown rather than left as arithmetic between two columns.
              */}
              {formatINR(b.amountPaid)}
              {b.amountPaid < b.total && b.status !== "cancelled" ? (
                <span className="text-13 block text-clay-ink">
                  {formatINR(b.total - b.amountPaid)} due
                </span>
              ) : null}
            </Cell>
            <Cell label="Status">
              <StatusPill status={b.status} />
            </Cell>
          </Row>
        ))}
      </DataTable>
    </>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "u-label rounded-full bg-ink px-3 py-1.5 text-night-text"
          : "u-label rounded-full px-3 py-1.5 text-ink-soft hover:text-ink"
      }
    >
      {children}
    </Link>
  );
}
