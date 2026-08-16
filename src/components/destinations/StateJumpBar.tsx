import { stateColours } from "@/config/palette";
import type { Destination } from "@/content/types";

/**
 * Eight coloured chips that jump to the eight blocks below.
 *
 * The page is nine screens long on a laptop and eighteen on a phone, and
 * before this the only way to reach Tripura was to scroll past seven states
 * you had already decided against. Anchors are the fix, and putting them in a
 * bar that sticks under the header means the escape hatch is available at
 * every point in that scroll rather than only at the top.
 *
 * It doubles as the page's colour key: each chip carries the state's own
 * colour, and the same colour reappears on that state's block, its index
 * number and its month strip. By the second block the reader has learned the
 * code without being told there is one.
 *
 * A plain list of `#slug` links, deliberately — no scroll-spy, no JavaScript.
 * Native anchor jumps are instant, survive a page refresh, and are shareable;
 * `scroll-margin-top` on the targets is what stops the fixed header covering
 * the heading you just jumped to.
 */
export function StateJumpBar({
  destinations,
}: {
  destinations: Destination[];
}) {
  return (
    <nav
      aria-label="Jump to a state"
      className="sticky top-[var(--header-h)] z-30 border-y border-[var(--ink-hairline)] bg-paper/92 backdrop-blur-md"
    >
      <div className="u-container-wide">
        {/*
         * Scrolls horizontally on a phone rather than wrapping to three rows.
         * Eight chips need about 640px; wrapping would push the page content
         * down by 100px on every screen under that, which is a poor trade for
         * a navigation aid.
         */}
        <ul className="-mx-[var(--gutter)] flex scrollbar-none gap-2 overflow-x-auto px-[var(--gutter)] py-3 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
          {destinations.map((destination) => {
            const colour = stateColours[destination.slug];
            return (
              <li key={destination.slug} className="shrink-0">
                <a
                  href={`#${destination.slug}`}
                  className="u-label group flex min-h-9 items-center gap-2.5 rounded-full border border-[var(--ink-hairline)] px-4 transition-colors duration-[var(--dur-micro)] ease-brand hover:border-transparent"
                  style={{ "--chip": colour.surface } as React.CSSProperties}
                >
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: colour.surface }}
                  />
                  <span
                    className="whitespace-nowrap transition-colors duration-[var(--dur-micro)]"
                    style={{ color: colour.ink }}
                  >
                    {destination.name}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
