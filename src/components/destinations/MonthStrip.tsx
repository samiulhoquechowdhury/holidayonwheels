import { cn } from "@/lib/cn";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/**
 * Twelve cells, one per month, with the good ones filled in the state's own
 * colour.
 *
 * This replaced a line of prose reading "Best March · April · May · October ·
 * November", and it is the single most useful thing on the destinations page.
 * "When can I actually go?" is the first real question a traveller has, and a
 * sentence makes them parse five month names and hold them in their head to
 * compare two states. A filled bar answers it at a glance and — because every
 * state draws the same twelve cells in the same place — makes eight states
 * comparable by *shape* as you scroll, which no amount of prose can do.
 *
 * The initial letters alone would be ambiguous (three months start with J and
 * two with M), so the cell carries the letter and the accessible name carries
 * the month in full.
 */
export function MonthStrip({
  months,
  colour,
  className,
}: {
  /** Full month names, as held in the content files. */
  months: readonly string[];
  /** CSS colour for the filled cells. */
  colour: string;
  className?: string;
}) {
  const good = new Set(months);

  return (
    <div className={cn(className)}>
      <p className="u-label text-ink-faint">Best months to travel</p>
      <ul className="mt-3 flex gap-1" aria-label="Best months to travel">
        {MONTHS.map((month) => {
          const on = good.has(month);
          return (
            <li
              key={month}
              className={cn(
                "u-label grid h-9 flex-1 place-items-center rounded-[6px] text-[10px] transition-colors",
                on ? "text-night-text" : "text-ink-faint",
              )}
              style={{
                backgroundColor: on ? colour : "rgb(46 42 36 / 0.05)",
              }}
            >
              <span aria-hidden="true">{month.charAt(0)}</span>
              <span className="u-sr-only">
                {month}
                {on ? " — good time to travel" : " — not recommended"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
