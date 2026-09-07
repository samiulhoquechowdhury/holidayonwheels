"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The card the planner is chosen with. One component for both the eight
 * states and the five parties, because they are the same decision twice — a
 * picture, a name, one line of argument, and a few facts — and two components
 * would have grown apart by the second round of copy edits.
 *
 * ### The picture is deliberately not the card
 *
 * It was a 4:5 portrait, which on a phone made each card most of a screen and
 * turned "pick one of eight" into eight screens of scrolling. It is 4:3 now:
 * still enough photograph to tell you what the place looks like, small enough
 * that four cards fit where two did. The decision here is between *names*,
 * and the picture is there to support the name rather than to be admired.
 *
 * ### "More" instead of a wall of facts
 *
 * A state has more that matters than fits on a card — the gateway airport,
 * the months worth going in, what it is known for. Putting all of it on every
 * card makes eight cards unreadable; leaving it off makes the choice
 * uninformed. So it is behind a disclosure that is closed by default and open
 * on request, and the facts are real ones rather than a repeat of the copy
 * already above them.
 *
 * That disclosure is why the card is a `<div>` with a stretched `<button>`
 * rather than a `<button>` wrapping everything: a button inside a button is
 * invalid, and browsers resolve it by dropping one of them. The stretched
 * control keeps the whole card as one tap target for choosing, and the
 * disclosure sits above it on its own layer.
 */
export function ChoiceCard({
  label,
  copy,
  meta,
  details,
  image,
  alt,
  colour,
  ink,
  index,
  selected,
  onSelect,
}: {
  label: string;
  copy: string;
  /** Two or three facts. Never more — they are read at a glance or not read. */
  meta: string[];
  /** Behind the "More" disclosure. Omit and no disclosure is rendered. */
  details?: { label: string; value: string }[];
  image: string;
  alt: string;
  colour: string;
  ink: string;
  /** Rendered as `01`, `02`. Omit where the order carries no meaning. */
  index?: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden text-left",
        "rounded-[var(--radius-card)] border bg-paper",
        "transition-[border-color,box-shadow] duration-[var(--dur)] ease-brand",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sage",
        selected
          ? "shadow-[var(--shadow-lift)]"
          : "border-[var(--ink-hairline)] hover:border-[var(--ink-hairline-strong)]",
      )}
      style={selected ? { borderColor: colour } : undefined}
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden">
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
            "absolute inset-x-0 bottom-0 origin-bottom transition-[height] duration-[var(--dur)] ease-brand",
            selected ? "h-2" : "h-1.5 group-hover:h-2",
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

      <div className="flex flex-1 flex-col p-5">
        {/*
         * The stretched control. `after:inset-0` reaches the whole card, so
         * the tap target is the card and not this line of text — and it is
         * `z-0` so the disclosure below can sit above it.
         */}
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className="text-left after:absolute after:inset-0 after:z-0 after:content-[''] focus-visible:outline-none"
        >
          <span className="block font-display text-22 leading-[var(--leading-display)] tracking-[var(--tracking-display)]">
            {label}
          </span>
          <span className="mt-2 block text-14 text-ink-soft">{copy}</span>
        </button>

        <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1.5">
          {meta.map((item) => (
            <span
              key={item}
              className="u-label flex items-center gap-1.5 text-ink-faint"
            >
              <span
                aria-hidden="true"
                className="mt-[0.42em] size-1 shrink-0 rounded-full"
                style={{ backgroundColor: selected ? colour : "currentColor" }}
              />
              {item}
            </span>
          ))}
        </div>

        {details && details.length > 0 ? (
          <div className="relative z-10 mt-4">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={panelId}
              className={cn(
                "u-label inline-flex min-h-11 items-center gap-2 underline underline-offset-4",
                "transition-colors duration-[var(--dur-micro)] ease-brand hover:text-ink",
              )}
              style={{ color: ink }}
            >
              {open ? "Less" : "More"}
              <ChevronGlyph open={open} />
            </button>

            <dl
              id={panelId}
              hidden={!open}
              className="mt-3 flex flex-col gap-2.5"
            >
              {details.map((detail) => (
                <div key={detail.label}>
                  <dt className="u-label text-ink-faint">{detail.label}</dt>
                  <dd className="mt-0.5 text-14 text-ink-soft">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <p
          className={cn(
            "u-label mt-auto pt-5 transition-colors duration-[var(--dur-micro)] ease-brand",
            selected ? "" : "text-ink-faint",
          )}
          style={selected ? { color: ink } : undefined}
        >
          {selected ? "Chosen" : "Choose"}
        </p>
      </div>
    </div>
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

function ChevronGlyph({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "size-3.5 transition-transform duration-[var(--dur-micro)] ease-brand",
        open && "rotate-180",
      )}
    >
      <path d="M3.5 6 8 10.5 12.5 6" />
    </svg>
  );
}
