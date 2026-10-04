"use client";

import { useEffect, useState } from "react";

/**
 * The time in Guwahati, running.
 *
 * The masthead line used to end in the year, which is the kind of detail a
 * print masthead carries because a printed page cannot know anything more
 * recent. A page can. The clock says the same thing the year was there to say
 * — this is current, somebody is running it — and says it in a way you can
 * watch, which is the difference between a date and a pulse.
 *
 * It is the office clock, not the reader's: `Asia/Kolkata`, because the
 * people who answer the phone are in Assam and a visitor deciding whether it
 * is a reasonable hour to call should be told their time, not their own.
 *
 * Two things matter in how it is built:
 *
 *  - **It renders a placeholder until it has mounted.** The server has no
 *    idea what second it is in the browser, so rendering a real time on the
 *    server guarantees a hydration mismatch — and React would replace it
 *    silently and log an error. The dashes hold the exact width the digits
 *    will take, so nothing on the line moves when they arrive.
 *  - **It ticks on the second boundary**, not every 1000ms from whenever it
 *    mounted. A naive interval drifts and lands mid-second, so the display
 *    skips a value every minute or so.
 *  - **The date comes from the same `Date` as the tick.** It only changes at
 *    midnight, but recomputing it alongside the seconds costs nothing and
 *    avoids a second timer that would have to be scheduled against a
 *    different boundary — and would be the thing that breaks on the one night
 *    of the year anyone would notice.
 *  - **Twelve-hour, with the meridiem set apart.** Read through
 *    `formatToParts` rather than taking the formatted string whole, so the
 *    AM/PM can carry the label style beside digits that keep the numeric one.
 *    `hour: "2-digit"` matters here: without it twelve-hour time drops the
 *    leading zero and the whole masthead line shifts a character wide at one
 *    o'clock.
 */

const FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

/** Guwahati's date, not the reader's — the same clock the office runs on. */
const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "short",
});

type Now = { date: string; clock: string; period: string };

function readNow(at: Date): Now {
  const parts = FORMAT.formatToParts(at);
  const part = (type: string) =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";
  return {
    // "Wed, 30 Sep" in en-GB; the comma is noise beside a running clock.
    date: DATE_FORMAT.format(at).replace(",", ""),
    clock: `${part("hour")}:${part("minute")}:${part("second")}`,
    period: part("dayPeriod").toUpperCase(),
  };
}

export function LocalClock() {
  const [time, setTime] = useState<Now | null>(null);

  useEffect(() => {
    let frame: number;
    const tick = () => {
      setTime(readNow(new Date()));
      // Land on the next whole second rather than drifting by however long
      // this mount happened to be past one.
      frame = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
    return () => window.clearTimeout(frame);
  }, []);

  return (
    <span className="u-num flex items-baseline gap-2 whitespace-nowrap">
      <span className="max-lg:hidden">Guwahati</span>
      <span aria-hidden="true" className="text-ink-faint max-lg:hidden">
        ·
      </span>
      {/*
       * Reserved width, like the clock's dashes. The masthead is
       * `justify-between`, so a right-hand item that grows on hydration drags
       * the centred middle item with it — the whole line would settle
       * sideways a beat after paint.
       *
       * Hidden below `sm`, where the line is already down to the mark and the
       * time and a third item would wrap.
       */}
      <span
        suppressHydrationWarning
        className="hidden min-w-[4.5rem] sm:inline-block"
      >
        {time?.date ?? ""}
      </span>
      {/*
       * `min-w` on the clock, not just the dashes.
       *
       * `u-num` is `tabular-nums`, so every real time is exactly the same
       * width — 51px at the masthead's fixed 12px — but "--:--:--" is only
       * 35px, because a hyphen is not a digit and tabular figures do not
       * cover it. The line therefore grew 18px the moment the first tick
       * landed, and `justify-between` split that as ±9px, dragging the
       * centred middle item sideways a beat after paint. Reserving the digit
       * width holds the line still.
       */}
      <time
        className="inline-block min-w-[3.3rem]"
        suppressHydrationWarning
        aria-label={
          time
            ? `Guwahati, ${time.date}, ${time.clock} ${time.period}`
            : undefined
        }
      >
        {time?.clock ?? "--:--:--"}
      </time>
      {/* Holds its width before the first tick, so the masthead line does not
          shift when AM arrives. */}
      <span
        suppressHydrationWarning
        className="u-label inline-block min-w-[2.2ch] text-ink-faint"
      >
        {time?.period ?? ""}
      </span>
    </span>
  );
}
