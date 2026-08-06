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
import {
  getUpcomingBookings,
  getPastBookings,
  getPermitsForBooking,
} from "@/content/account";
import type { Booking } from "@/content/types";

export const metadata: Metadata = {
  title: "My bookings",
  robots: { index: false, follow: false },
};

const KIND_PATH: Record<Booking["kind"], string> = {
  tour: "/tours",
  moto: "/motorcycle-tours",
  stay: "/homestays",
  event: "/events",
};

const STATUS: Record<
  Booking["status"],
  { label: string; tone: "gold" | "teal" | "red" | "neutral" }
> = {
  confirmed: { label: "Confirmed", tone: "teal" },
  "pending-payment": { label: "Balance due", tone: "gold" },
  completed: { label: "Completed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "red" },
};

export default function BookingsPage() {
  const upcoming = getUpcomingBookings();
  const past = getPastBookings();

  return (
    <>
      <PageHero
        eyebrow="Your account"
        title="My bookings"
        intro="Everything you have booked, and everything still to pay. Permits raised as part of a trip are linked to it."
        tint="cloud"
        region="neutral"
      />

      <SectionShell tint="paper">
        <AccountNav current="bookings" />

        <section className="mt-14">
          <h2 className="u-mono border-b border-[var(--ink-hairline)] pb-4 text-ink-soft">
            Coming up
          </h2>
          {upcoming.length > 0 ? (
            <ul className="mt-8 flex flex-col gap-6">
              {upcoming.map((booking) => (
                <li key={booking.reference}>
                  <BookingRow booking={booking} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyBookings />
          )}
        </section>

        {past.length > 0 ? (
          <section className="mt-20">
            <h2 className="u-mono border-b border-[var(--ink-hairline)] pb-4 text-ink-soft">
              Past and cancelled
            </h2>
            <ul className="mt-8 flex flex-col gap-6">
              {past.map((booking) => (
                <li key={booking.reference}>
                  <BookingRow booking={booking} muted />
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
  muted = false,
}: {
  booking: Booking;
  muted?: boolean;
}) {
  const status = STATUS[booking.status];
  const permits = getPermitsForBooking(booking.reference);

  return (
    <article
      className={`grid gap-6 rounded-[var(--radius-media)] border border-[var(--ink-hairline)] p-5 sm:grid-cols-[180px_1fr] ${
        muted ? "opacity-70" : ""
      }`}
    >
      <div className="overflow-hidden rounded-[2px]">
        <Media
          alt={`${booking.title}, booked for ${formatRange(booking.startDate, booking.endDate)}`}
          seed={booking.reference}
          region={booking.region}
          aspect="4/3"
          sizes="180px"
        />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
          <div className="min-w-0">
            <p className="u-mono text-ink-faint">{booking.reference}</p>
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
            <dt className="u-mono text-ink-faint">Dates</dt>
            <dd className="mt-1 font-mono text-14 tabular-nums">
              {formatRange(booking.startDate, booking.endDate)}
            </dd>
          </div>
          <div>
            <dt className="u-mono text-ink-faint">Travellers</dt>
            <dd className="mt-1 text-14">{booking.travellers}</dd>
          </div>
          <div>
            <dt className="u-mono text-ink-faint">Total</dt>
            <dd className="mt-1 font-mono text-14 tabular-nums">
              {formatINR(booking.total)}
            </dd>
          </div>
          {!muted ? (
            <div>
              <dt className="u-mono text-ink-faint">Departs</dt>
              <dd className="mt-1 text-14">
                {relativeToNow(booking.startDate)}
              </dd>
            </div>
          ) : null}
        </dl>

        {booking.status === "pending-payment" ? (
          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-[var(--radius-control)] border border-[color-mix(in_srgb,var(--muga-gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--muga-gold)_8%,transparent)] p-4">
            <p className="flex-1 text-14">
              Your balance of {formatINR(Math.round(booking.total * 0.75))} is
              due 60 days before departure.
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
              className="text-deep-teal-ink underline underline-offset-4"
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
      <ButtonLink href="/tours" variant="primary" className="mt-8">
        Find a trip
      </ButtonLink>
    </div>
  );
}
