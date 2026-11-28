import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { AccountNav } from "@/components/account/AccountNav";
import { LuxeButtonLink } from "@/components/primitives/LuxeButton";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { apiFetch } from "@/lib/api";
import type { AccountPayload } from "@/lib/account";
import { formatINR } from "@/lib/currency";
import { formatRange, relativeToNow } from "@/lib/date";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The account dashboard.
 *
 * The header's account control points here, so this is the first screen
 * behind it and it has to answer "what is in here" in one look: what is
 * booked, what is owed, what paperwork is outstanding, and the way into each.
 *
 * ## This now shows the signed-in person's own records
 *
 * It used to render six fictional bookings from `src/content/account.ts`
 * (now deleted),
 * with a banner explaining that they were samples because sign-in did not
 * exist. Sign-in exists, so both are gone: the banner would now be a false
 * statement, and sample records behind a real login are worse than an empty
 * page — somebody would act on a reference that is not theirs.
 *
 * The layout is unchanged, which was the point of deriving everything from
 * accessors in the first place. Only the source moved.
 *
 * ## Why the empty state gets as much care as the full one
 *
 * Almost everybody arriving here for the first time has booked nothing. A
 * dashboard of three zeroes is a dead end; what a new account needs is the
 * reason it exists and the way to the thing it is for. So the zero case is
 * written deliberately rather than falling out of the arithmetic.
 */
export default async function AccountPage() {
  const result = await apiFetch<AccountPayload>("/account");

  if (!result.ok) {
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
          <div
            role="alert"
            className="mt-10 rounded-[var(--radius-panel)] border border-clay bg-sand p-6 sm:p-7"
          >
            <Eyebrow>We could not load your trips</Eyebrow>
            <p className="mt-3 max-w-2xl text-16 text-ink-soft">
              {result.error.message} Nothing is lost — your bookings are safe.
              Try again in a moment, or{" "}
              <Link href="/contact" className="u-link">
                ask the office
              </Link>{" "}
              and we will read them out to you.
            </p>
          </div>
        </SectionShell>
      </>
    );
  }

  const { profile, upcomingBookings, pastBookings, permits } = result.data;

  const next = upcomingBookings[0];

  /*
   * What is actually still owed, not the total of unpaid bookings. The old
   * version summed `total` for anything `pending-payment`, which told
   * somebody who had already paid a deposit that they owed the whole trip
   * again.
   */
  const owed = upcomingBookings.reduce(
    (sum, b) => sum + Math.max(b.total - b.amountPaid, 0),
    0,
  );

  const actionable = permits.filter(
    (permit) => permit.status === "draft" || permit.status === "submitted",
  ).length;

  const hasAnything =
    upcomingBookings.length > 0 ||
    pastBookings.length > 0 ||
    permits.length > 0;

  return (
    <>
      <PageHero
        eyebrow="Your account"
        title={
          profile.name
            ? `Welcome back, ${firstName(profile.name)}`
            : "Everything in one place"
        }
        accent={profile.name ? firstName(profile.name) : "one place"}
        intro="What you have booked, what is still to pay, and every permit we are carrying for you."
        tint="shell"
        region="neutral"
      />

      <SectionShell tint="paper">
        <AccountNav current="overview" />

        {!hasAnything ? (
          /* --- Nothing booked yet ----------------------------------- */
          <div className="mt-10 rounded-[var(--radius-panel)] border border-[var(--ink-hairline)] bg-shell p-6 sm:p-8">
            <Eyebrow>Your account is ready</Eyebrow>
            <h2 className="mt-3 max-w-2xl text-28 lg:text-36">
              Nothing booked yet
            </h2>
            <p className="mt-4 max-w-2xl text-16 text-ink-soft">
              When you book a trip, it appears here with its dates, what is paid
              and what is due — and any Inner Line Permit we are carrying for
              you alongside it. You do not need to keep the confirmation email.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <LuxeButtonLink href="/destinations#plan">
                Plan a trip
              </LuxeButtonLink>
              <LuxeButtonLink href="/tours" variant="ghost">
                Browse the tours
              </LuxeButtonLink>
            </div>
            <p className="mt-6 text-14 text-ink-soft">
              Already travelling with us and expecting to see something?{" "}
              <Link href="/contact" className="u-link">
                Tell us the reference
              </Link>{" "}
              and we will attach it to {profile.email}.
            </p>
          </div>
        ) : (
          <>
            {/* --- The three numbers worth knowing ------------------- */}
            <dl className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-[var(--ink-hairline)] bg-[var(--ink-hairline)] sm:grid-cols-3">
              <Stat
                label="Trips coming up"
                value={String(upcomingBookings.length)}
                note={
                  pastBookings.length > 0
                    ? `${pastBookings.length} ${pastBookings.length === 1 ? "trip" : "trips"} behind you`
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
                  permits.length === 0
                    ? "None needed so far"
                    : actionable > 0
                      ? `${actionable} still moving through`
                      : "All approved"
                }
              />
            </dl>

            {/* --- The next departure ------------------------------- */}
            {next ? (
              <div className="mt-14 border-t border-[var(--ink-hairline)] pt-10">
                <Eyebrow>Next departure</Eyebrow>
                <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
                  <div className="min-w-0">
                    <h2 className="max-w-2xl text-36 lg:text-48">
                      {next.title}
                    </h2>
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
          </>
        )}

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

/**
 * The part of a name to greet somebody by.
 *
 * Splitting on whitespace and taking the first token is wrong for plenty of
 * naming conventions, so it is only ever used for a greeting — never in a
 * booking, a permit or anything that reaches a government form, where the
 * name the person gave is used whole.
 */
function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
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
