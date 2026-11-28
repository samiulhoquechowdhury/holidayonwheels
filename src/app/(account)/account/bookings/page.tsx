import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { AccountNav } from "@/components/account/AccountNav";
import { Chip } from "@/components/primitives/Chip";
import { Media } from "@/components/primitives/Media";
import { ButtonLink } from "@/components/primitives/Button";
import { formatINR } from "@/lib/currency";
import { formatRange, relativeToNow } from "@/lib/date";
import { apiFetch } from "@/lib/api";
import {
  asWeaveRegion,
  type AccountBooking,
  type AccountPermit,
  type AccountPayload,
} from "@/lib/account";

export const metadata: Metadata = {
  title: "My bookings",
  robots: { index: false, follow: false },
};

const KIND_PATH: Record<AccountBooking["kind"], string> = {
  tour: "/tours",
  moto: "/motorcycle-tours",
  stay: "/homestays",
  event: "/events",
};

const STATUS: Record<
  AccountBooking["status"],
  { label: string; tone: "clay" | "sage" | "ember" | "neutral" }
> = {
  confirmed: { label: "Confirmed", tone: "sage" },
  "pending-payment": { label: "Balance due", tone: "clay" },
  completed: { label: "Completed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "ember" },
};

export const dynamic = "force-dynamic";

/**
 * Every booking this person has, and what is still to pay on each.
 *
 * Reads the signed-in traveller's own records from the API. It used to render
 * six fictional bookings from a `src/content/account.ts` that has since
 * been deleted; they were fine
 * while there was no sign-in, and are indefensible behind one — somebody
 * would ring the office about a reference that belongs to nobody.
 */
export default async function BookingsPage() {
  const result = await apiFetch<AccountPayload>("/account");

  if (!result.ok) {
    return (
      <>
        <PageHero
          eyebrow="Your account"
          title="My bookings"
          intro="Everything you have booked, and everything still to pay."
          tint="shell"
          region="neutral"
        />
        <SectionShell tint="paper">
          <AccountNav current="bookings" />
          <p
            role="alert"
            className="mt-12 rounded-[var(--radius-card)] border border-clay bg-sand p-6 text-16"
          >
            {result.error.message} Nothing is lost — your bookings are safe. Try
            again shortly, or{" "}
            <Link href="/contact" className="u-link">
              ask the office
            </Link>{" "}
            to read them out to you.
          </p>
        </SectionShell>
      </>
    );
  }

  const {
    upcomingBookings: upcoming,
    pastBookings: past,
    permits,
  } = result.data;

  return (
    <>
      <PageHero
        eyebrow="Your account"
        title="My bookings"
        intro="Everything you have booked, and everything still to pay. Permits raised as part of a trip are linked to it."
        tint="shell"
        region="neutral"
      />

      <SectionShell tint="paper">
        <AccountNav current="bookings" />

        <section className="mt-14">
          <h2 className="u-label border-b border-[var(--ink-hairline)] pb-4 text-ink-soft">
            Coming up
          </h2>
          {upcoming.length > 0 ? (
            <ul className="mt-8 flex flex-col gap-6">
              {upcoming.map((booking) => (
                <li key={booking.reference}>
                  <BookingRow booking={booking} permits={permits} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyBookings />
          )}
        </section>

        {past.length > 0 ? (
          <section className="mt-20">
            <h2 className="u-label border-b border-[var(--ink-hairline)] pb-4 text-ink-soft">
              Past and cancelled
            </h2>
            <ul className="mt-8 flex flex-col gap-6">
              {past.map((booking) => (
                <li key={booking.reference}>
                  <BookingRow booking={booking} permits={permits} muted />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </SectionShell>
    </>
  );
}

function BookingRow({
  booking,
  permits: allPermits,
  muted = false,
}: {
  booking: AccountBooking;
  /** Every permit on the account; this row picks out its own. */
  permits: AccountPermit[];
  muted?: boolean;
}) {
  const status = STATUS[booking.status];
  /*
   * Matched on `bookingId`, not on the reference string. Permits are linked
   * by a real foreign key now; comparing references would quietly stop
   * working the day a reference is ever reissued, and it was only a string
   * match because the mock data had nothing better.
   */
  const permits = allPermits.filter(
    (permit) => permit.bookingId === booking.id,
  );

  return (
    <article
      className={`grid gap-8 rounded-[var(--radius-card)] bg-plate p-7 shadow-[var(--shadow-soft)] sm:grid-cols-[180px_1fr] ${
        muted ? "opacity-70" : ""
      }`}
    >
      <div className="overflow-hidden rounded-[2px]">
        <Media
          alt={`${booking.title}, booked for ${formatRange(booking.startDate, booking.endDate)}`}
          seed={booking.reference}
          region={asWeaveRegion(booking.region)}
          aspect="4/3"
          sizes="180px"
        />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
          <div className="min-w-0">
            <p className="u-label text-ink-faint">{booking.reference}</p>
            <h3 className="mt-2 text-22">
              <Link
                href={`${KIND_PATH[booking.kind]}/${booking.itemSlug}`}
                className="underline decoration-transparent underline-offset-8 transition-colors hover:decoration-current"
              >
                {booking.title}
              </Link>
            </h3>
          </div>
          <Chip tone={status.tone}>{status.label}</Chip>
        </div>

        <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
          <div>
            <dt className="u-label text-ink-faint">Dates</dt>
            <dd className="u-num mt-1 text-14">
              {formatRange(booking.startDate, booking.endDate)}
            </dd>
          </div>
          <div>
            <dt className="u-label text-ink-faint">Travellers</dt>
            <dd className="mt-1 text-14">{booking.travellers}</dd>
          </div>
          <div>
            <dt className="u-label text-ink-faint">Total</dt>
            <dd className="u-num mt-1 text-14">{formatINR(booking.total)}</dd>
          </div>
          {!muted ? (
            <div>
              <dt className="u-label text-ink-faint">Departs</dt>
              <dd className="mt-1 text-14">
                {relativeToNow(booking.startDate)}
              </dd>
            </div>
          ) : null}
        </dl>

        {booking.status === "pending-payment" ? (
          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--clay)_40%,transparent)] bg-[color-mix(in_srgb,var(--clay)_8%,transparent)] p-4">
            {/*
              The real outstanding amount, not an assumed fraction.
              This said `total * 0.75` — a made-up 75% balance shown whatever
              the traveller had actually paid. With a deposit of ₹20,000
              against ₹2,36,000 it would have told them ₹1,77,000 was due when
              the true figure is ₹2,16,000. A wrong number about somebody's
              money is the one kind of placeholder that cannot be left in.
            */}
            <p className="flex-1 text-14">
              Your balance of {formatINR(booking.total - booking.amountPaid)} is
              due 60 days before departure.
              {booking.amountPaid > 0
                ? ` ${formatINR(booking.amountPaid)} received so far.`
                : ""}
            </p>
            <ButtonLink href="/contact" variant="primary" size="sm">
              Pay balance
            </ButtonLink>
          </div>
        ) : null}

        {permits.length > 0 ? (
          <p className="mt-4 text-14 text-ink-soft">
            {permits.length} {permits.length === 1 ? "permit" : "permits"}{" "}
            linked to this booking —{" "}
            <Link
              href="/account/permits"
              className="text-sage-ink underline underline-offset-4"
            >
              view under My permits
            </Link>
          </p>
        ) : null}
      </div>
    </article>
  );
}

function EmptyBookings() {
  return (
    <div className="py-14 text-center">
      <p className="text-22">Nothing booked yet.</p>
      <p className="mx-auto mt-4 max-w-md text-16 text-ink-soft">
        When you book a trip, a homestay or an event, it will appear here along
        with any permits we are processing for it.
      </p>
      <ButtonLink href="/destinations" variant="primary" className="mt-8">
        Find a trip
      </ButtonLink>
    </div>
  );
}
