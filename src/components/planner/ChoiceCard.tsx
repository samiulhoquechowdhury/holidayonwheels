"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The card the planner is chosen with. One component for both the eight
 * states and the five parties, because they are the same decision twice — a
 * picture, a name, one line of argument, and three facts — and two components
 * would have grown apart by the second round of copy edits.
 *
 * The hover is the same grammar as the rest of the site: nothing fades, the
 * photograph scales inside a frame that does not move, and a bar in the
 * subject's own colour wipes up from the baseline. Selection is not a hover
 * state left switched on — a selected card carries a filled tick and a solid
 * rule, so it still reads as chosen on a touch screen where nothing hovers at
 * all.
 *
 * It is a real `<button>` with `aria-pressed`, so the choice reaches assistive
 * tech as a state rather than as a colour, and the whole row is traversable
 * with a keyboard before any of the motion matters.
 */
export function ChoiceCard({
  label,
  copy,
  meta,
  image,
  alt,
  colour,
  ink,
  index,
  selected,
  onSelect,
  aspect = "4/5",
}: {
  label: string;
  copy: string;
  /** Two or three facts. Never more — they are read at a glance or not read. */
  meta: string[];
  image: string;
  alt: string;
  colour: string;
  ink: string;
  /** Rendered as `01`, `02`. Omit where the order carries no meaning. */
  index?: number;
  selected: boolean;
  onSelect: () => void;
  aspect?: "4/5" | "3/4";
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden text-left",
        "rounded-[var(--radius-card)] border bg-paper",
        "transition-[border-color,box-shadow] duration-[var(--dur)] ease-brand",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
        selected
          ? "shadow-[var(--shadow-lift)]"
          : "border-[var(--ink-hairline)] hover:border-[var(--ink-hairline-strong)]",
      )}
      style={selected ? { borderColor: colour } : undefined}
    >
      <span
        className={cn(
          "relative block w-full overflow-hidden",
          aspect === "4/5" ? "aspect-[4/5]" : "aspect-[3/4]",
        )}
      >
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
          className={cn(
            "object-cover transition-transform duration-[var(--dur-image)] ease-brand",
            "motion-safe:group-hover:scale-[1.05]",
            selected && "motion-safe:scale-[1.05]",
          )}
        />

        {/* The colour, as a bar across the foot of the frame — the same
            device the result cards use, so a state is the same colour here
            as it is everywhere else on the site. */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 bottom-0 origin-bottom transition-transform duration-[var(--dur)] ease-brand",
            "h-1.5 group-hover:h-2",
            selected ? "h-2" : "",
          )}
          style={{ backgroundColor: colour }}
        />

        {index !== undefined ? (
          <span
            aria-hidden="true"
            // A halo rather than `mix-blend-difference`: difference blending
            // vanishes against a mid-grey sky, which is exactly what half of
            // these photographs have in the top-left corner.
            className="u-num absolute top-3 left-4 font-display text-22 text-paper [text-shadow:0_1px_10px_rgb(0_0_0/0.55)]"
          >
            {String(index).padStart(2, "0")}
          </span>
        ) : null}

        {/* The tick. Present only when chosen, because a row of empty
            checkboxes reads as a form and this is meant to read as a choice. */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-3 right-3 grid size-8 place-items-center rounded-full",
            "transition-[transform,opacity] duration-[var(--dur-micro)] ease-brand",
            selected ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
          style={{ backgroundColor: colour }}
        >
          <TickGlyph />
        </span>
      </span>

      <span className="flex flex-1 flex-col p-5">
        <span className="block font-display text-22 leading-[var(--leading-display)] tracking-[var(--tracking-display)]">
          {label}
        </span>
        <span className="mt-2 block text-14 text-ink-soft">{copy}</span>

        <span className="mt-4 flex flex-1 flex-wrap items-end gap-x-3 gap-y-1.5">
          {meta.map((item) => (
            <span
              key={item}
              className="u-label flex items-start gap-1.5 text-ink-faint"
            >
              <span
                aria-hidden="true"
                // Nudged onto the first line's baseline rather than centred,
                // so a meta item that wraps to two lines keeps its dot beside
                // the first word instead of floating between the two.
                className="mt-[0.42em] size-1 shrink-0 rounded-full"
                style={{ backgroundColor: selected ? colour : "currentColor" }}
              />
              {item}
            </span>
          ))}
        </span>

        <span
          className={cn(
            "u-label mt-5 block transition-colors duration-[var(--dur-micro)] ease-brand",
            selected ? "" : "text-ink-faint",
          )}
          style={selected ? { color: ink } : undefined}
        >
          {selected ? "Chosen" : "Choose"}
        </span>
      </span>
    </button>
  );
}

function TickGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 text-night-text"
    >
      <path d="M3 8.5 6.5 12 13 4.5" />
    </svg>
  );
}
