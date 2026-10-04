import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { AccountNav } from "@/components/account/AccountNav";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import {
  getUpcomingBookings,
  getPastBookings,
  getPermits,
} from "@/content/account";
import { formatINR } from "@/lib/currency";
import { formatRange, relativeToNow } from "@/lib/date";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

/**
 * The account dashboard.
 *
 * The header's account control points here, so this is the first screen
 * behind it and it has to answer "what is in here" in one look: what is
 * booked, what is owed, what paperwork is outstanding, and the way into each.
 *
 * **There is no sign-in yet.** The bookings and permits below come from the
 * same mock records the two screens beneath this one use, and the page says
 * so rather than letting somebody believe they are looking at their own data.
 * When auth lands, the banner goes and these figures come from the session —
 * nothing else on the page has to change, because everything it renders is
 * already derived from the accessors in `src/content/account.ts`.
 */

export default function AccountPage() {
  const upcoming = getUpcomingBookings();
  const past = getPastBookings();
  const permits = getPermits();

  const next = upcoming[0];
  const owed = upcoming
    .filter((booking) => booking.status === "pending-payment")
    .reduce((sum, booking) => sum + booking.total, 0);
  const actionable = permits.filter(
    (permit) => permit.status === "draft" || permit.status === "submitted",
  ).length;

  return (
    <>
      <PageHero
        eyebrow="Your account"
        title="Everything in one place"
        accent="one place"
        intro="What you have booked, what is still to pay, and every permit we are carrying for you."
        tint="shell"
        region="neutral"
      />

      <SectionShell tint="paper">
        <AccountNav current="overview" />

        {/*
         * Said plainly and said first. A dashboard that shows somebody else's
         * trips without explaining why is worse than one that is empty.
         */}
        <div className="mt-10 rounded-[var(--radius-panel)] border border-dashed border-[var(--ink-hairline-strong)] bg-shell p-6 sm:p-7">
          <Eyebrow>Signing in is not live yet</Eyebrow>
          <p className="mt-3 max-w-2xl text-16 text-ink-soft">
            Accounts are being built. Until they are, this screen shows sample
            records so the layout can be reviewed — they are not yours. Your
            real booking and permit references are in the confirmation emails we
            send, and{" "}
            <Link href="/contact" className="u-link">
              we will look anything up for you
            </Link>{" "}
            in the meantime.
          </p>
        </div>

        {/* --- The three numbers worth knowing ------------------------- */}
        <dl className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-[var(--ink-hairline)] bg-[var(--ink-hairline)] sm:grid-cols-3">
          <Stat
            label="Trips coming up"
            value={String(upcoming.length)}
            note={
              past.length > 0
                ? `${past.length} ${past.length === 1 ? "trip" : "trips"} behind you`
                : "Nothing in the archive yet"
            }
          />
          <Stat
            label="Still to pay"
            value={owed > 0 ? formatINR(owed) : "Nothing"}
            note={
              owed > 0
                ? "Balances are due six weeks before departure"
                : "Every balance is settled"
            }
          />
          <Stat
            label="Permits in hand"
            value={String(permits.length)}
            note={
              actionable > 0
                ? `${actionable} still moving through`
                : "All approved"
            }
          />
        </dl>

        {/* --- The next departure -------------------------------------- */}
        {next ? (
          <div className="mt-14 border-t border-[var(--ink-hairline)] pt-10">
            <Eyebrow>Next departure</Eyebrow>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
              <div className="min-w-0">
                <h2 className="max-w-2xl text-36 lg:text-48">{next.title}</h2>
                <p className="mt-3 text-18 text-ink-soft">
                  {formatRange(next.startDate, next.endDate)} ·{" "}
                  {next.travellers}{" "}
                  {next.travellers === 1 ? "traveller" : "travellers"} ·{" "}
                  {relativeToNow(next.startDate)}
                </p>
                <p className="u-num u-label mt-4 text-ink-faint">
                  {next.reference}
                </p>
              </div>
              <LuxeButtonLink href="/account/bookings">
                See the booking
              </LuxeButtonLink>
            </div>
          </div>
        ) : null}

        {/* --- Where to go next ---------------------------------------- */}
        <div className="mt-14 grid gap-4 border-t border-[var(--ink-hairline)] pt-10 sm:grid-cols-2 lg:grid-cols-3">
          <Shortcut
            href="/account/bookings"
            title="My bookings"
            copy="Every trip, what is paid and what is due."
          />
          <Shortcut
            href="/account/permits"
            title="My permits"
            copy="Inner Line Permits, their status and their dates."
          />
          <Shortcut
            href="/destinations#plan"
            title="Plan another trip"
            copy="Eight states, built around the dates you have free."
          />
        </div>
      </SectionShell>
    </>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="bg-paper p-7">
      <dt className="u-label text-ink-faint">{label}</dt>
      <dd className="u-num mt-3 font-display text-48 leading-none">{value}</dd>
      <p className="mt-3 text-14 text-ink-soft">{note}</p>
    </div>
  );
}

function Shortcut({
  href,
  title,
  copy,
}: {
  href: string;
  title: string;
  copy: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--ink-hairline)] p-6 transition-colors duration-[var(--dur-micro)] ease-brand hover:border-[var(--ink-hairline-strong)] hover:bg-shell"
    >
      <span className="font-display text-22">{title}</span>
      <span className="mt-3 text-14 text-ink-soft">{copy}</span>
    </Link>
  );
}
