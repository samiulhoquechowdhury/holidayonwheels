/**
 * Date helpers. Everything crossing a component boundary is an ISO
 * `YYYY-MM-DD` string; `Date` objects stay local to the calendar internals so
 * server and client never disagree about a timezone.
 */

const LONG = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const MEDIUM = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const SHORT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

const MONTH_YEAR = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
});

const WEEKDAY = new Intl.DateTimeFormat("en-IN", { weekday: "short" });

/** Parses `YYYY-MM-DD` as a UTC instant so no local offset shifts the day. */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

export function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatLong(iso: string): string {
  return LONG.format(parseISO(iso));
}

export function formatMedium(iso: string): string {
  return MEDIUM.format(parseISO(iso));
}

export function formatShort(iso: string): string {
  return SHORT.format(parseISO(iso));
}

export function formatMonthYear(iso: string): string {
  return MONTH_YEAR.format(parseISO(iso));
}

export function formatWeekday(iso: string): string {
  return WEEKDAY.format(parseISO(iso));
}

/** `12 – 21 Oct 2026`, collapsing the month when both ends share one. */
export function formatRange(startISO: string, endISO: string): string {
  const start = parseISO(startISO);
  const end = parseISO(endISO);
  const sameMonth =
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCFullYear() === end.getUTCFullYear();

  if (sameMonth) {
    return `${start.getUTCDate()} – ${MEDIUM.format(end)}`;
  }
  return `${SHORT.format(start)} – ${MEDIUM.format(end)}`;
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISO(d);
}

export function nightsBetween(startISO: string, endISO: string): number {
  const ms = parseISO(endISO).getTime() - parseISO(startISO).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

export function isPast(iso: string, today = new Date()): boolean {
  return parseISO(iso).getTime() < parseISO(toISO(today)).getTime();
}

/** `in 3 weeks` / `next month` — used on departure lists, never for prices. */
export function relativeToNow(iso: string, today = new Date()): string {
  const days = Math.round(
    (parseISO(iso).getTime() - parseISO(toISO(today)).getTime()) / 86_400_000,
  );
  if (days < 0) return "departed";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 21) return `in ${days} days`;
  if (days < 60) return `in ${Math.round(days / 7)} weeks`;
  return `in ${Math.round(days / 30)} months`;
}
