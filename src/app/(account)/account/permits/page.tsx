import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { AccountNav } from "@/components/account/AccountNav";
import { Chip } from "@/components/primitives/Chip";
import { ButtonLink } from "@/components/primitives/Button";
import { formatLong, formatRange } from "@/lib/date";
import { apiFetch } from "@/lib/api";
import type { AccountPayload, AccountPermit } from "@/lib/account";
import { getDestinationName } from "@/content/destinations";
import type { StateSlug } from "@/content/types";

export const metadata: Metadata = {
  title: "My permits",
  robots: { index: false, follow: false },
};

const STATUS: Record<
  AccountPermit["status"],
  { label: string; tone: "clay" | "sage" | "ember" | "neutral"; note: string }
> = {
  draft: {
    label: "Draft",
    tone: "neutral",
    note: "Not submitted yet. Finish it and we will file it the same day.",
  },
  submitted: {
    label: "With the state",
    tone: "clay",
    note: "Filed and awaiting a decision. Three to seven working days is typical.",
  },
  approved: {
    label: "Approved",
    tone: "sage",
    note: "Download the PDF and carry a printed copy — check-posts are not always online.",
  },
  rejected: {
    label: "Refused",
    tone: "ember",
    note: "We will have emailed you why, and we will refile at no charge.",
  },
  expired: {
    label: "Expired",
    tone: "neutral",
    note: "Past its validity window. Kept here for your records.",
  },
};

export const dynamic = "force-dynamic";

/**
 * The permits the office is carrying for this traveller.
 *
 * Their own, from the API. These used to be five fictional records; a permit
 * is a government document and showing somebody a reference that is not
 * theirs is the worst case of placeholder data on the site.
 */
export default async function PermitsPage() {
  const result = await apiFetch<AccountPayload>("/account");

  if (!result.ok) {
    return (
      <>
        <PageHero
          eyebrow="Your account"
          title="My permits"
          intro="Inner Line Permits and Protected Area Permits we are handling for you."
          tint="shell"
          region="manipur"
        />
        <SectionShell tint="paper">
          <AccountNav current="permits" />
          <p
            role="alert"
            className="mt-12 rounded-[var(--radius-card)] border border-clay bg-sand p-6 text-16"
          >
            {result.error.message} Your permits are unaffected —{" "}
            <Link href="/contact" className="u-link">
              ask the office
            </Link>{" "}
            for their status in the meantime.
          </p>
        </SectionShell>
      </>
    );
  }

  const { permits, upcomingBookings, pastBookings } = result.data;

  /*
   * A permit stores `bookingId`; the traveller reads references. The lookup
   * is built from the bookings in the same payload rather than by asking the
   * API again per permit.
   */
  const referenceById = new Map(
    [...upcomingBookings, ...pastBookings].map((b) => [b.id, b.reference]),
  );

  const active = permits.filter(
    (p) => p.status !== "expired" && p.status !== "rejected",
  );
  const archived = permits.filter(
    (p) => p.status === "expired" || p.status === "rejected",
  );

  return (
    <>
      <PageHero
        eyebrow="Your account"
        title="My permits"
        intro="Inner Line Permits and Protected Area Permits we are handling for you. We do not charge for processing."
        tint="shell"
        region="manipur"
      />

      <SectionShell tint="paper">
        <AccountNav current="permits" />

        <section className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--ink-hairline)] pb-4">
            <h2 className="u-label text-ink-soft">Current</h2>
            <ButtonLink href="/ilp/apply" variant="secondary" size="sm">
              Apply for another
            </ButtonLink>
          </div>

          {active.length > 0 ? (
            <ul className="mt-8 flex flex-col gap-4">
              {active.map((permit) => (
                <li key={permit.reference}>
                  <PermitRow permit={permit} referenceById={referenceById} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-14 text-center">
              <p className="text-22">No permits in progress.</p>
              <p className="mx-auto mt-4 max-w-md text-16 text-ink-soft">
                Four of the eight states need one. If you book a trip through
                any of them, we raise the application automatically.
              </p>
              <ButtonLink href="/ilp" variant="primary" className="mt-8">
                How permits work
              </ButtonLink>
            </div>
          )}
        </section>

        {archived.length > 0 ? (
          <section className="mt-20">
            <h2 className="u-label border-b border-[var(--ink-hairline)] pb-4 text-ink-soft">
              Expired and refused
            </h2>
            <ul className="mt-8 flex flex-col gap-4">
              {archived.map((permit) => (
                <li key={permit.reference}>
                  <PermitRow
                    permit={permit}
                    referenceById={referenceById}
                    muted
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </SectionShell>
    </>
  );
}

function PermitRow({
  referenceById,
  permit,
  muted = false,
}: {
  permit: AccountPermit;
  /** Booking id -> the reference a traveller reads. */
  referenceById: Map<string, string>;
  muted?: boolean;
}) {
  const status = STATUS[permit.status];
  const bookingReference = permit.bookingId
    ? referenceById.get(permit.bookingId)
    : undefined;

  return (
    <article
      className={`rounded-[var(--radius-card)] bg-plate p-7 shadow-[var(--shadow-soft)] ${
        muted ? "opacity-70" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          {/* Permit codes are utility text — always mono, always selectable. */}
          <p className="u-num text-14 tracking-[0.06em]">{permit.reference}</p>
          <h3 className="mt-2 text-22">
            {getDestinationName(permit.state as StateSlug)} · {permit.kind}
          </h3>
        </div>
        <Chip tone={status.tone}>{status.label}</Chip>
      </div>

      <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
        <div>
          <dt className="u-label text-ink-faint">Traveller</dt>
          <dd className="mt-1 text-14">{permit.travellerName}</dd>
        </div>
        <div>
          <dt className="u-label text-ink-faint">Valid</dt>
          <dd className="u-num mt-1 text-14">
            {formatRange(permit.validFrom, permit.validTo)}
          </dd>
        </div>
        {permit.submittedAt ? (
          <div>
            <dt className="u-label text-ink-faint">Submitted</dt>
            <dd className="mt-1 text-14">{formatLong(permit.submittedAt)}</dd>
          </div>
        ) : null}
        {bookingReference ? (
          <div>
            <dt className="u-label text-ink-faint">Booking</dt>
            <dd className="mt-1 text-14">
              <Link
                href="/account/bookings"
                className="u-num text-sage-ink underline underline-offset-4"
              >
                {bookingReference}
              </Link>
            </dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-5 text-14 text-ink-soft">{status.note}</p>

      {/*
        There was a "Download PDF" button here whose href was
        `/account/permits` — the page it sits on. There is no PDF endpoint and
        no stored document, so the button went nowhere and did nothing while
        looking like the one thing a traveller with an approved permit wants.
        A sentence that is true beats a control that is not; it comes back the
        day permits are actually stored as files.
      */}
      {permit.status === "approved" ? (
        <p className="mt-5 text-14 text-ink-soft">
          We have emailed the permit to you. Carry a printed copy — check-posts
          are not always online. Need it again?{" "}
          <Link href="/contact" className="u-link">
            Ask and we will resend it
          </Link>
          .
        </p>
      ) : null}
      {permit.status === "draft" ? (
        <ButtonLink
          href="/ilp/apply"
          variant="primary"
          size="sm"
          className="mt-5"
        >
          Finish this application
        </ButtonLink>
      ) : null}
    </article>
  );
}
