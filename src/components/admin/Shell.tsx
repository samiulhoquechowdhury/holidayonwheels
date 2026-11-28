import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * The office's small set of shared parts.
 *
 * ## Why the admin has its own primitives
 *
 * The marketing site's components carry editorial type, generous spacing and
 * motion — all correct for a page somebody is being persuaded by, all wrong
 * for a table an operator reads forty times a day. These are deliberately
 * plain and dense, and they look unlike the public site so that a screenshot
 * of one is never mistaken for the other.
 *
 * They are also deliberately few. A design system for an internal tool is
 * work that does not reach a customer; four components that compose is enough
 * for every screen here.
 */

export function PageHeading({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-28">{title}</h1>
        {intro ? (
          <p className="mt-3 max-w-prose text-16 text-ink-soft">{intro}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex items-center gap-3">{children}</div>
      ) : null}
    </div>
  );
}

export function Tile({
  href,
  label,
  figure,
  note,
  tone = "plain",
}: {
  href?: string;
  label: string;
  figure: string;
  note?: string;
  /** `attention` for a count that means somebody has to do something. */
  tone?: "plain" | "attention";
}) {
  const body = (
    <>
      <p className="u-label text-ink-faint">{label}</p>
      <p
        className={cn(
          "u-num text-32 mt-3",
          tone === "attention" && figure !== "0" ? "text-clay-ink" : "text-ink",
        )}
      >
        {figure}
      </p>
      {note ? <p className="text-13 text-ink-softer mt-2">{note}</p> : null}
    </>
  );

  const className = cn(
    "block rounded-[var(--radius-input)] border border-[var(--ink-hairline)] bg-paper p-5",
    href && "transition-colors hover:border-ink",
  );

  /*
   * A plain div when there is nowhere to go. A card that looks clickable and
   * is not is worse than one that never looked clickable.
   */
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

/**
 * A table that becomes a list of cards on a narrow screen.
 *
 * ## Why not a horizontally scrolling table
 *
 * That is the usual answer and it is a bad one for this content: the first
 * column is the identifier, so scrolling right to read a status hides *which
 * record it belongs to*. On a phone each row becomes a block with its own
 * labels, which is readable without any scrolling at all.
 *
 * Implemented with one set of markup and CSS, not two rendered trees — a
 * second copy behind `hidden md:block` doubles the DOM and makes every row
 * announce itself twice to a screen reader.
 */
export function DataTable({
  columns,
  children,
  empty,
}: {
  columns: string[];
  children: React.ReactNode;
  /** Shown instead of the table when there are no rows. */
  empty?: string;
}) {
  const isEmpty =
    !children || (Array.isArray(children) && children.length === 0);

  if (isEmpty) {
    return (
      <p className="mt-8 rounded-[var(--radius-input)] border border-dashed border-[var(--ink-hairline-strong)] px-5 py-10 text-center text-16 text-ink-soft">
        {empty ?? "Nothing here yet."}
      </p>
    );
  }

  return (
    <div className="mt-8 overflow-hidden rounded-[var(--radius-input)] border border-[var(--ink-hairline)]">
      <table className="w-full border-collapse text-14">
        <thead className="hidden md:table-header-group">
          <tr className="bg-shell text-left">
            {columns.map((c) => (
              <th
                key={c}
                scope="col"
                className="u-label border-b border-[var(--ink-hairline)] px-4 py-3 font-normal text-ink-faint"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return (
    <tr className="block border-b border-[var(--ink-hairline)] last:border-0 md:table-row">
      {children}
    </tr>
  );
}

export function Cell({
  label,
  children,
  numeric,
}: {
  /** Repeated as the row's own label on a narrow screen. */
  label: string;
  children: React.ReactNode;
  numeric?: boolean;
}) {
  return (
    <td
      className={cn(
        "block px-4 py-2 md:table-cell md:py-3",
        numeric && "md:text-right",
      )}
    >
      {/*
        The column name, shown only where the header row is hidden. `aria-hidden`
        because the header is still in the DOM and associated with the cell —
        without it every value would be read out with its label twice.
      */}
      <span
        aria-hidden="true"
        className="u-label text-ink-softer mr-2 inline-block min-w-28 md:hidden"
      >
        {label}
      </span>
      <span className={cn(numeric && "u-num")}>{children}</span>
    </td>
  );
}

/**
 * A status word, coloured by what it means rather than by its name.
 *
 * Grouped by whether somebody has to act: things waiting are warm, things
 * settled are quiet, things that went wrong are clay. A per-status palette
 * would mean choosing a colour for every new status, and the choice that
 * matters is only ever this one.
 */
export function StatusPill({ status }: { status: string }) {
  const waiting = ["new", "pending-payment", "draft", "submitted"];
  const done = ["closed", "confirmed", "completed", "published", "approved"];
  const bad = ["lost", "cancelled", "rejected", "expired"];

  return (
    <span
      className={cn(
        "u-label inline-block rounded-full px-2.5 py-1",
        waiting.includes(status) && "bg-sand text-ink",
        done.includes(status) && "bg-shell text-ink-soft",
        bad.includes(status) && "bg-clay text-clay-ink",
        !waiting.includes(status) &&
          !done.includes(status) &&
          !bad.includes(status) &&
          "bg-shell text-ink-soft",
      )}
    >
      {status.replace(/-|_/g, " ")}
    </span>
  );
}

/**
 * Shown when an API call fails.
 *
 * It names the failure and does not pretend the screen is empty. "No bookings
 * yet" when the API is simply unreachable is the most expensive wrong message
 * an office tool can show — somebody acts on it.
 */
export function LoadError({
  what,
  message,
}: {
  what: string;
  message: string;
}) {
  return (
    <p
      role="alert"
      className="mt-8 rounded-[var(--radius-input)] border border-clay bg-sand px-5 py-4 text-16"
    >
      <strong className="font-normal">Could not load {what}.</strong>{" "}
      <span className="text-ink-soft">{message}</span>
    </p>
  );
}
