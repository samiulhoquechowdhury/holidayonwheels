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
 *
 * ### Two tones, and why the dark one does not use the state colour
 *
 * On paper the filled cells take the state's own colour, which is what makes
 * eight strips comparable by shape *and* keeps the palette doing its job.
 * Over a photograph that breaks: the cell letter is 10px, so it needs 4.5:1,
 * and measured against `--night-text` the state surfaces give 2.02 for
 * Sikkim's marigold and 3.04 for Assam's sky — both fail, and badly. The dark
 * tone fills with clay instead, which is this site's accent on every dark
 * ground already and pairs with `--clay-on` at 7.08:1.
 */
export function MonthStrip({
  months,
  colour,
  tone = "light",
  className,
}: {
  /** Full month names, as held in the content files. */
  months: readonly string[];
  /** CSS colour for the filled cells. Ignored when `tone` is `onDark`. */
  colour: string;
  /** `onDark` for a strip sitting over a photograph. */
  tone?: "light" | "onDark";
  className?: string;
}) {
  const good = new Set(months);
  const dark = tone === "onDark";

  return (
    <div className={cn(className)}>
      <p
        className={cn(
          "u-label",
          dark ? "text-night-text-soft" : "text-ink-faint",
        )}
      >
        Best months to travel
      </p>
      <ul
        className={cn("flex gap-1", dark ? "mt-2.5" : "mt-3")}
        aria-label="Best months to travel"
      >
        {MONTHS.map((month) => {
          const on = good.has(month);
          return (
            <li
              key={month}
              className={cn(
                "u-label grid flex-1 place-items-center rounded-[6px] text-[10px] transition-colors",
                dark ? "h-7" : "h-9",
                on
                  ? dark
                    ? "text-clay-on"
                    : "text-night-text"
                  : dark
                    ? "text-night-text-soft"
                    : "text-ink-faint",
              )}
              style={{
                backgroundColor: on
                  ? dark
                    ? "var(--clay)"
                    : colour
                  : dark
                    ? "rgb(242 237 229 / 0.14)"
                    : "rgb(46 42 36 / 0.05)",
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
