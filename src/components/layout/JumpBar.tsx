import { cn } from "@/lib/cn";

export type JumpItem = {
  /** The `id` of the section this jumps to. */
  id: string;
  label: string;
  /** Dot colour — a palette *surface* value. Omit for a plain chip. */
  colour?: string;
  /**
   * Label colour. Must be the palette's darkened `-ink` step: the surface
   * values are chosen to be seen, not read, and several of them fail AA as
   * text on paper.
   */
  ink?: string;
  /** Small trailing figure — a count, usually. */
  note?: string;
};

/**
 * A row of chips that jump to the sections below.
 *
 * Long index pages on this site are eight or nine screens deep, and without
 * this the only way to reach the last section is to scroll past every section
 * you have already rejected. Sticking it under the header means the escape
 * hatch exists at every point in that scroll rather than only at the top.
 *
 * It doubles as a colour key wherever the items carry one: the same colour
 * reappears on that section's heading, so the code is learned without being
 * taught.
 *
 * Plain `#id` anchors, deliberately — no scroll-spy, no JavaScript. Native
 * jumps are instant, survive a refresh and are shareable. What makes them
 * land correctly is `scroll-margin-top` on the *targets*, which has to clear
 * both the fixed header and this bar; the sections set it themselves.
 *
 * Generic rather than one per page. The destinations index jumps to states
 * and the events index jumps to months, and two implementations of the same
 * bar would have drifted apart inside a month.
 */
export function JumpBar({
  items,
  label,
  className,
}: {
  items: JumpItem[];
  /** Accessible name for the nav — "Jump to a state", "Jump to a month". */
  label: string;
  className?: string;
}) {
  if (items.length < 2) return null;

  return (
    <nav
      aria-label={label}
      className={cn(
        "sticky top-[var(--header-h)] z-30 border-y border-[var(--ink-hairline)]",
        "bg-paper/92 backdrop-blur-md",
        className,
      )}
    >
      <div className="u-container-wide">
        {/*
         * Scrolls horizontally below `lg` rather than wrapping to three rows:
         * eight chips need about 640px, and wrapping would push the page
         * content down by 100px on every screen under that. From `lg` there
         * is room, and a row that clips its last chip when it does not have
         * to reads as broken.
         */}
        <ul className="-mx-[var(--gutter)] flex scrollbar-none gap-2 overflow-x-auto px-[var(--gutter)] py-3 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
          {items.map((item) => (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                className={cn(
                  "u-label flex min-h-9 items-center gap-2.5 rounded-full border px-4",
                  "border-[var(--ink-hairline)] transition-colors duration-[var(--dur-micro)] ease-brand",
                  "hover:border-[var(--ink-hairline-strong)]",
                )}
                style={item.ink ? { color: item.ink } : undefined}
              >
                {item.colour ? (
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.colour }}
                  />
                ) : null}
                <span className="whitespace-nowrap">{item.label}</span>
                {item.note ? (
                  <span className="u-num shrink-0 text-ink-faint">
                    {item.note}
                  </span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
