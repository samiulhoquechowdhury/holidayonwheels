import { Rise } from "@/components/motion/Rise";
import { cn } from "@/lib/cn";
import type { Destination } from "@/content/types";
import type { StateColour } from "@/config/palette";

/**
 * The eight states, as the page's index.
 *
 * The destinations page is nine screens long, and until now the only way to
 * see what was on it was a row of 36px chips tucked under the hero — so the
 * answer to "which eight?" was smaller than the caption under a photograph,
 * and on a phone five of the eight were off the side of the screen. The names
 * are the whole subject of the page; they should be the largest thing on it
 * after the title.
 *
 * So they are set as an editorial index: display type, one column on a phone,
 * two from `sm`, four from `lg`, each carrying the three facts somebody
 * actually chooses a state on — how many trips run there, whether it needs a
 * permit, and what it is for. That turns nine screens of scrolling into one
 * screen of deciding, and the detail blocks below become the thing you read
 * *after* you have chosen rather than the thing you scroll through to choose.
 *
 * Each name is an in-page anchor rather than a link out to the state's own
 * page. The blocks below are the summary; the article is one more click from
 * there, and sending someone off the page before they have compared the
 * eight is the opposite of what an index is for.
 *
 * The hover is the site's own vocabulary — a rule in the state's colour
 * wiping in from the left, no fade — so this reads as the same object as the
 * journey rows on the home page.
 */
export function StatesHeader({
  destinations,
  colours,
  tripCounts,
}: {
  destinations: Destination[];
  /** Keyed by slug, resolved on the server so the palette stays server-side. */
  colours: Record<string, StateColour>;
  tripCounts: Record<string, number>;
}) {
  return (
    <nav aria-label="The eight states">
      <Rise
        as="ul"
        stagger={0.05}
        className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4"
      >
        {destinations.map((destination, index) => {
          const colour = colours[destination.slug];
          const trips = tripCounts[destination.slug] ?? 0;

          return (
            <li key={destination.slug}>
              <a
                href={`#${destination.slug}`}
                className={cn(
                  // `h-full` so the anchor fills the stretched grid cell and
                  // `mt-auto` on the meta line has something to push against.
                  // Without it "Arunachal Pradesh" — the only two-line name —
                  // dropped its trip count a line below the other seven.
                  "group relative flex h-full min-h-[7.5rem] flex-col border-t pt-5 pb-7",
                  "border-[var(--ink-hairline)] transition-colors duration-[var(--dur-micro)] ease-brand",
                )}
              >
                {/* The rule in the state's colour, wiping in from the left
                    over the hairline it replaces. Scale rather than width, so
                    it stays on the compositor. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-x-0 -top-px h-0.5 origin-left scale-x-0",
                    "transition-transform duration-[var(--dur)] ease-brand",
                    "group-hover:scale-x-100 group-focus-visible:scale-x-100",
                  )}
                  style={{ backgroundColor: colour.surface }}
                />

                <span className="flex items-baseline gap-3">
                  <span className="u-num u-label" style={{ color: colour.ink }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="u-label text-ink-faint">
                    {destination.requiresILP ? "Permit" : "No permit"}
                  </span>
                </span>

                <span
                  className={cn(
                    "mt-3 block font-display text-28 leading-[var(--leading-display)] tracking-[var(--tracking-display)]",
                    "transition-colors duration-[var(--dur-micro)] ease-brand",
                    "lg:text-36",
                  )}
                >
                  {destination.name}
                </span>

                <span className="mt-2 block text-14 text-ink-soft">
                  {destination.tagline}
                </span>

                <span className="u-label mt-auto flex items-center gap-2 pt-4 text-ink-faint">
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: colour.surface }}
                  />
                  {trips} {trips === 1 ? "trip" : "trips"}
                  <span aria-hidden="true">·</span>
                  {destination.bestMonths.length} good months
                </span>
              </a>
            </li>
          );
        })}
      </Rise>
    </nav>
  );
}
