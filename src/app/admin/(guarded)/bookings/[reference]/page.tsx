import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { formatINR } from "@/lib/currency";
import { formatRange } from "@/lib/date";
import { PageHeading, StatusPill, LoadError } from "@/components/admin/Shell";
import {
  ActionForm,
  SubmitButton,
  SubmitSelect,
} from "@/components/admin/ActionForm";
import {
  recordPayment,
  setBookingStatus,
  setBookingNotes,
} from "../../office-actions";

export const metadata: Metadata = {
  title: "Booking",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

type Payment = {
  id: string;
  amount: number;
  method: string;
  externalReference: string | null;
  note: string | null;
  receivedAt: string;
};

type Booking = {
  id: string;
  reference: string;
  kind: string;
  title: string;
  itemSlug: string;
  startDate: string;
  endDate: string;
  travellers: number;
  total: number;
  deposit: number;
  amountPaid: number;
  status: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  companions: { name: string; age?: number }[];
  travellerNotes: string | null;
  staffNotes: string | null;
  bookedAt: string;
  cancelledAt: string | null;
  payments: Payment[];
};

/**
 * One booking, everything about it, and the three things the office does to
 * it: take money, change its status, write a note.
 *
 * ## Why the ledger is shown and not just the total
 *
 * `amount_paid` is a cached sum of `payments`. Showing only the total means a
 * disagreement between the two is invisible — and the whole reason the ledger
 * exists is so that "we received ₹50,000 by UPI on the 3rd" is answerable
 * when a traveller says they paid. Every entry, with its method and
 * reference, is on the page.
 *
 * ## Cancelling returns the seats, and the page says so
 *
 * The API puts the travellers back on the departure when a booking moves to
 * cancelled. That is not obvious from a dropdown, so it is written next to
 * the control — an operator changing a status to tidy up a list should know
 * it frees seats somebody else can then buy.
 */
export default async function AdminBookingPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const result = await apiFetch<Booking>(
    `/bookings/${encodeURIComponent(reference)}`,
  );

  if (!result.ok) {
    if (result.status === 404) notFound();
    return (
      <>
        <PageHeading title={reference} />
        <LoadError what="this booking" message={result.error.message} />
      </>
    );
  }

  const b = result.data;
  const due = b.total - b.amountPaid;
  const ledger = b.payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <p className="u-label">
        <Link href="/admin/bookings" className="text-ink-faint hover:text-ink">
          ← Bookings
        </Link>
      </p>

      <div className="mt-4">
        <PageHeading title={b.reference} intro={b.title}>
          <StatusPill status={b.status} />
        </PageHeading>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {/* --- Facts -------------------------------------------------- */}
          <h2 className="u-label text-ink-faint">The trip</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-14">
            <Fact label="Dates">{formatRange(b.startDate, b.endDate)}</Fact>
            <Fact label="Travellers">{b.travellers}</Fact>
            <Fact label="Kind">{b.kind}</Fact>
            <Fact label="Booked">
              {new Date(b.bookedAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Fact>
            <Fact label="Total">{formatINR(b.total)}</Fact>
            <Fact label="Paid">
              {formatINR(b.amountPaid)}
              {due > 0 && b.status !== "cancelled" ? (
                <span className="ml-2 text-clay-ink">{formatINR(due)} due</span>
              ) : null}
            </Fact>
          </dl>

          {/*
            Shown only when the cached total and the ledger disagree. It
            should never happen — the API recomputes the sum on every payment
            — which is exactly why it is worth saying loudly if it does,
            rather than letting the office reconcile from a number that is
            quietly wrong.
          */}
          {ledger !== b.amountPaid ? (
            <p
              role="alert"
              className="mt-4 rounded-[var(--radius-input)] border border-clay bg-sand px-4 py-3 text-14"
            >
              The recorded total ({formatINR(b.amountPaid)}) does not match the
              payments listed below ({formatINR(ledger)}). Do not act on either
              figure until this is looked at.
            </p>
          ) : null}

          <h2 className="u-label mt-10 text-ink-faint">Who is travelling</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-14">
            <Fact label="Lead">{b.leadName}</Fact>
            <Fact label="Email">
              <a
                href={`mailto:${b.leadEmail}`}
                className="underline underline-offset-4"
              >
                {b.leadEmail}
              </a>
            </Fact>
            <Fact label="Phone">
              <a
                href={`tel:${b.leadPhone}`}
                className="underline underline-offset-4"
              >
                {b.leadPhone}
              </a>
            </Fact>
            <Fact label="Others">
              {b.companions.length
                ? b.companions
                    .map((c) => (c.age ? `${c.name} (${c.age})` : c.name))
                    .join(", ")
                : "—"}
            </Fact>
          </dl>

          {b.travellerNotes ? (
            <>
              <h2 className="u-label mt-10 text-ink-faint">
                What they told us
              </h2>
              <p className="mt-3 text-14 whitespace-pre-wrap text-ink-soft">
                {b.travellerNotes}
              </p>
            </>
          ) : null}

          {/* --- Payments ---------------------------------------------- */}
          <h2 className="u-label mt-12 text-ink-faint">Payments</h2>
          {b.payments.length === 0 ? (
            <p className="mt-3 text-14 text-ink-soft">Nothing received yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--ink-hairline)] rounded-[var(--radius-input)] border border-[var(--ink-hairline)] bg-paper">
              {b.payments.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-baseline gap-x-3 px-4 py-3 text-14"
                >
                  <span className="u-num">
                    {p.amount < 0 ? "−" : ""}
                    {formatINR(Math.abs(p.amount))}
                  </span>
                  {p.amount < 0 ? (
                    <span className="u-label text-clay-ink">refund</span>
                  ) : null}
                  <span className="text-ink-softer">{p.method}</span>
                  {p.externalReference ? (
                    <span className="text-13 text-ink-softer">
                      {p.externalReference}
                    </span>
                  ) : null}
                  <span className="text-13 text-ink-softer ml-auto">
                    {new Date(p.receivedAt).toLocaleDateString("en-IN", {
                      dateStyle: "medium",
                    })}
                  </span>
                  {p.note ? (
                    <span className="text-13 w-full text-ink-soft">
                      {p.note}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- Actions ------------------------------------------------- */}
        <div className="space-y-10">
          <section>
            <h2 className="u-label text-ink-faint">Record a payment</h2>
            <ActionForm
              action={recordPayment}
              hidden={{ bookingId: b.id, reference: b.reference }}
              className="mt-4 rounded-[var(--radius-input)] border border-[var(--ink-hairline)] bg-paper p-4"
              successMessage="Recorded."
            >
              <label htmlFor="amount" className="u-label block text-ink-soft">
                Amount in rupees
              </label>
              <input
                id="amount"
                name="amount"
                inputMode="numeric"
                required
                placeholder={due > 0 ? String(due) : "0"}
                className="mt-2 min-h-10 w-full rounded-[var(--radius-input)] border border-[var(--ink-hairline-strong)] bg-paper px-3 text-16"
              />
              <p className="text-13 text-ink-softer mt-2">
                Negative for a refund.{" "}
                {due > 0 ? `${formatINR(due)} outstanding.` : "Paid in full."}
              </p>

              <label
                htmlFor="method"
                className="u-label mt-4 block text-ink-soft"
              >
                How
              </label>
              <select
                id="method"
                name="method"
                defaultValue="bank-transfer"
                className="mt-2 min-h-10 w-full rounded-[var(--radius-input)] border border-[var(--ink-hairline-strong)] bg-paper px-3 text-16"
              >
                <option value="bank-transfer">Bank transfer</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>

              <label
                htmlFor="externalReference"
                className="u-label mt-4 block text-ink-soft"
              >
                Their reference
                <span className="text-ink-softer ml-2 normal-case">
                  optional
                </span>
              </label>
              <input
                id="externalReference"
                name="externalReference"
                className="mt-2 min-h-10 w-full rounded-[var(--radius-input)] border border-[var(--ink-hairline-strong)] bg-paper px-3 text-16"
              />

              <div className="mt-5">
                <SubmitButton variant="solid" pendingLabel="Recording…">
                  Record payment
                </SubmitButton>
              </div>
            </ActionForm>
          </section>

          <section>
            <h2 className="u-label text-ink-faint">Status</h2>
            <ActionForm
              action={setBookingStatus}
              hidden={{ bookingId: b.id, reference: b.reference }}
              className="mt-4"
            >
              <SubmitSelect
                name="status"
                label="Booking status"
                defaultValue={b.status}
                options={[
                  { value: "pending-payment", label: "Awaiting payment" },
                  { value: "confirmed", label: "Confirmed" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
              />
            </ActionForm>
            <p className="text-13 text-ink-softer mt-3">
              Cancelling puts {b.travellers}{" "}
              {b.travellers === 1 ? "seat" : "seats"} back on the departure for
              somebody else to book. It does not refund anything — record a
              negative payment for that.
            </p>
          </section>

          <section>
            <h2 className="u-label text-ink-faint">Office notes</h2>
            <ActionForm
              action={setBookingNotes}
              hidden={{ bookingId: b.id, reference: b.reference }}
              className="mt-4"
              successMessage="Saved."
            >
              <label htmlFor="staffNotes" className="sr-only">
                Office notes
              </label>
              <textarea
                id="staffNotes"
                name="staffNotes"
                rows={5}
                defaultValue={b.staffNotes ?? ""}
                className="w-full rounded-[var(--radius-input)] border border-[var(--ink-hairline-strong)] bg-paper px-3 py-2 text-14"
              />
              <p className="text-13 text-ink-softer mt-2">
                Never shown to the traveller.
              </p>
              <div className="mt-3">
                <SubmitButton>Save notes</SubmitButton>
              </div>
            </ActionForm>
          </section>
        </div>
      </div>
    </>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="u-label text-ink-softer">{label}</dt>
      <dd className="mt-1 text-ink">{children}</dd>
    </div>
  );
}
