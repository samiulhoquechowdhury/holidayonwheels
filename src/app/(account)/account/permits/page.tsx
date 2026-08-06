import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { SectionShell } from "@/components/layout/SectionShell";
import { AccountNav } from "@/components/account/AccountNav";
import { Chip } from "@/components/primitives/Chip";
import { ButtonLink } from "@/components/primitives/Button";
import { formatLong, formatRange } from "@/lib/date";
import { getPermits } from "@/content/account";
import { getDestinationName } from "@/content/destinations";
import type { Permit } from "@/content/types";

export const metadata: Metadata = {
  title: "My permits",
  robots: { index: false, follow: false },
};

const STATUS: Record<
  Permit["status"],
  { label: string; tone: "gold" | "teal" | "red" | "neutral"; note: string }
> = {
  draft: {
    label: "Draft",
    tone: "neutral",
    note: "Not submitted yet. Finish it and we will file it the same day.",
  },
  submitted: {
    label: "With the state",
    tone: "gold",
    note: "Filed and awaiting a decision. Three to seven working days is typical.",
  },
  approved: {
    label: "Approved",
    tone: "teal",
    note: "Download the PDF and carry a printed copy — check-posts are not always online.",
  },
  rejected: {
    label: "Refused",
    tone: "red",
    note: "We will have emailed you why, and we will refile at no charge.",
  },
  expired: {
    label: "Expired",
    tone: "neutral",
    note: "Past its validity window. Kept here for your records.",
  },
};

export default function PermitsPage() {
  const permits = getPermits();
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
        tint="loktak"
        region="manipur"
      />

      <SectionShell tint="paper">
        <AccountNav current="permits" />

        <section className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--ink-hairline)] pb-4">
            <h2 className="u-mono text-ink-soft">Current</h2>
            <ButtonLink href="/ilp/apply" variant="secondary" size="sm">
              Apply for another
            </ButtonLink>
          </div>

          {active.length > 0 ? (
            <ul className="mt-8 flex flex-col gap-4">
              {active.map((permit) => (
                <li key={permit.reference}>
                  <PermitRow permit={permit} />
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
            <h2 className="u-mono border-b border-[var(--ink-hairline)] pb-4 text-ink-soft">
              Expired and refused
            </h2>
            <ul className="mt-8 flex flex-col gap-4">
              {archived.map((permit) => (
                <li key={permit.reference}>
                  <PermitRow permit={permit} muted />
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
  permit,
  muted = false,
}: {
  permit: Permit;
  muted?: boolean;
}) {
  const status = STATUS[permit.status];

  return (
    <article
      className={`rounded-[var(--radius-media)] border border-[var(--ink-hairline)] p-5 ${
        muted ? "opacity-70" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          {/* Permit codes are utility text — always mono, always selectable. */}
          <p className="font-mono text-14 tracking-[0.06em] tabular-nums">
            {permit.reference}
          </p>
          <h3 className="mt-2 text-22">
            {getDestinationName(permit.state)} · {permit.kind}
          </h3>
        </div>
        <Chip tone={status.tone}>{status.label}</Chip>
      </div>

      <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
        <div>
          <dt className="u-mono text-ink-faint">Traveller</dt>
          <dd className="mt-1 text-14">{permit.travellerName}</dd>
        </div>
        <div>
          <dt className="u-mono text-ink-faint">Valid</dt>
          <dd className="mt-1 font-mono text-14 tabular-nums">
            {formatRange(permit.validFrom, permit.validTo)}
          </dd>
        </div>
        {permit.submittedAt ? (
          <div>
            <dt className="u-mono text-ink-faint">Submitted</dt>
            <dd className="mt-1 text-14">{formatLong(permit.submittedAt)}</dd>
          </div>
        ) : null}
        {permit.bookingReference ? (
          <div>
            <dt className="u-mono text-ink-faint">Booking</dt>
            <dd className="mt-1 text-14">
              <Link
                href="/account/bookings"
                className="font-mono text-deep-teal-ink underline underline-offset-4"
              >
                {permit.bookingReference}
              </Link>
            </dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-5 text-14 text-ink-soft">{status.note}</p>

      {permit.status === "approved" ? (
        <ButtonLink
          href="/account/permits"
          variant="secondary"
          size="sm"
          className="mt-5"
        >
          Download PDF
        </ButtonLink>
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
