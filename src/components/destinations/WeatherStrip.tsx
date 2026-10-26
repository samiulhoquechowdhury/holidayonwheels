import { cn } from "@/lib/cn";
import type { StateWeather } from "@/lib/weather";

const WEEKDAY = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
});

/**
 * Today and the next three days, for the place a trip to this state starts.
 *
 * Built on the `MonthStrip` idiom directly below it on the page — a small
 * caps label over a row of equal cells — because the two answer halves of the
 * same question. The month strip says when the state is worth coming to at
 * all; this says what to pack if you are coming this week. Same shape so the
 * eye reads them as a pair rather than as two unrelated widgets.
 *
 * The place is named, not implied. "Weather in Arunachal Pradesh" is a
 * meaningless number across a state that runs from a hundred metres to seven
 * thousand; "Itanagar" is a number somebody can act on.
 *
 * Today's cell carries the live reading and the rest carry a high and a low,
 * which is the only honest way to show them: a single number for a day three
 * days out implies a precision the forecast does not have.
 */
export function WeatherStrip({
  weather,
  colour,
  className,
}: {
  weather: StateWeather;
  /**
   * The state's darkened `-ink` step, not its `surface`.
   *
   * Today's cell carries white text at label size, which needs 4.5:1. Five of
   * the eight state surfaces fail that against `--night-text` — Sikkim's
   * marigold worst at 2.02 — for the same reason the eight-state index on the
   * home page fills with ink rather than surface.
   */
  colour: string;
  className?: string;
}) {
  const [today, ...rest] = weather.days;

  return (
    <div className={cn(className)}>
      <p className="u-label flex flex-wrap items-baseline gap-x-3 text-ink-faint">
        <span>Weather in {weather.place}</span>
        <span aria-hidden="true">·</span>
        <span>Live</span>
      </p>

      <ul className="mt-3 flex gap-1.5">
        <li
          className="flex min-w-0 flex-1 flex-col justify-between rounded-[8px] p-2 text-night-text sm:flex-[1.4] sm:p-2.5"
          style={{ backgroundColor: colour }}
        >
          <span className="u-label opacity-90">Now</span>
          <span className="u-num mt-2 block font-display text-28 leading-none">
            {weather.temperature}°
          </span>
          <span className="u-label mt-1.5 block truncate opacity-90">
            {weather.summary}
          </span>
        </li>

        {rest.map((day) => (
          <li
            key={day.date}
            className="flex min-w-0 flex-1 flex-col justify-between rounded-[8px] bg-[rgb(46_42_36/0.05)] p-2 sm:p-2.5"
          >
            <span className="u-label text-ink-faint">
              {WEEKDAY.format(new Date(`${day.date}T06:00:00+05:30`))}
            </span>
            <span className="u-num mt-2 block text-18 leading-none">
              {day.high}°
            </span>
            <span className="u-label mt-1 block text-ink-faint">
              {day.low}°
            </span>
            <span className="u-label mt-1.5 block truncate text-ink-faint">
              {day.summary}
            </span>
          </li>
        ))}
      </ul>

      {today ? (
        <p className="u-sr-only">
          Today in {weather.place}: {weather.summary}, currently{" "}
          {weather.temperature} degrees, high {today.high}, low {today.low}.
        </p>
      ) : null}
    </div>
  );
}
