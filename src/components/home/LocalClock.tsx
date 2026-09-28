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
 */

const FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function LocalClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    let frame: number;
    const tick = () => {
      setTime(FORMAT.format(new Date()));
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
      <time
        suppressHydrationWarning
        aria-label={time ? `Local time in Guwahati, ${time}` : undefined}
      >
        {time ?? "--:--:--"}
      </time>
    </span>
  );
}
