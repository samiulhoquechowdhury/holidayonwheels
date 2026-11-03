"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";
import { roomGalleries } from "@/config/showcase";
import { STAY_AMENITIES } from "@/content/day-options";
import type { StayOption } from "@/content/day-options";

const KIND_LABEL: Record<StayOption["kind"], string> = {
  included: "Included in the trip",
  hotel: "Hotel room",
  heritage: "Heritage property",
  homestay: "Family homestay",
  lodge: "Park lodge",
  camp: "Tented camp",
};

type IconName =
  | "bed"
  | "water"
  | "meal"
  | "power"
  | "wifi"
  | "car"
  | "person"
  | "view"
  | "home"
  | "tent"
  | "check";

/**
 * Which glyph goes beside which amenity, by keyword.
 *
 * Room amenities are written per kind of room and read like sentences —
 * "Hot water, morning and evening", "Wi-fi in the room, not only the lobby",
 * "Staff who know the gate timings". The homestays index already has a
 * keyword classifier and it was the wrong tool here: tested against these
 * forty-one strings it left twenty-five unmatched, because it sorts a *house*
 * into facilities and these describe a *room*.
 *
 * So: its own table, ordered, first match wins. `check` is the fallback and
 * is meant to be hit — a tick beside a line nobody wrote a keyword for is
 * correct, where no icon at all would leave a ragged column.
 */
const ICON_RULES: { icon: IconName; test: RegExp }[] = [
  { icon: "water", test: /hot water|shower|towel/i },
  {
    icon: "meal",
    test: /breakfast|tea|meal|dinner|lunch|room service|kitchen/i,
  },
  { icon: "wifi", test: /wi-?fi|internet|signal/i },
  { icon: "power", test: /power|grid|electric|charg|generator/i },
  { icon: "car", test: /parking|vehicle|transfer|pickup|drive/i },
  { icon: "view", test: /view|outlook|window|balcony|veranda/i },
  { icon: "person", test: /staff|someone|somebody|family|host|service/i },
  { icon: "tent", test: /canvas|camp|tent/i },
  {
    icon: "home",
    test: /house|property|building|bungalow|palace|period|histor/i,
  },
  { icon: "bed", test: /room|bed|sleep/i },
  /*
   * After `bed`, not before `water`. "A private room with an attached
   * bathroom" is a room, and leading with the plumbing put a water droplet
   * on the line that describes the bed.
   */
  { icon: "water", test: /bath|washroom/i },
];

function iconFor(amenity: string): IconName {
  return ICON_RULES.find((rule) => rule.test.test(amenity))?.icon ?? "check";
}

/** Line-drawn, 1.5 units, round caps — the weight used everywhere else. */
function AmenityIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    bed: (
      <>
        <path d="M3 17v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
        <path d="M3 17h18M3 14h18" />
        <circle cx="7.5" cy="11.5" r="1.4" />
      </>
    ),
    water: (
      <path d="M12 3c3 3.6 4.5 6.3 4.5 8.4A4.5 4.5 0 0 1 12 16a4.5 4.5 0 0 1-4.5-4.6C7.5 9.3 9 6.6 12 3Z" />
    ),
    meal: (
      <>
        <path d="M4 10h16a8 8 0 0 1-8 8 8 8 0 0 1-8-8Z" />
        <path d="M12 10V6M9 21h6" />
      </>
    ),
    power: <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />,
    wifi: (
      <>
        <path d="M3 9a16 16 0 0 1 18 0" />
        <path d="M6.5 13a11 11 0 0 1 11 0" />
        <path d="M10 16.6a5 5 0 0 1 4 0" />
        <path d="M12 20h.01" />
      </>
    ),
    car: (
      <>
        <circle cx="6.5" cy="16.5" r="2.4" />
        <circle cx="17.5" cy="16.5" r="2.4" />
        <path d="M8.9 16.5h6.2M5 16.5 7.5 9h9l2.5 7.5" />
      </>
    ),
    person: (
      <>
        <circle cx="12" cy="7" r="2.8" />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      </>
    ),
    view: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="1.5" />
        <path d="M4 12h16M12 4v16" />
      </>
    ),
    home: (
      <>
        <path d="m3 10 9-6 9 6" />
        <path d="M5.5 9.5V20h13V9.5" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
    tent: (
      <>
        <path d="m12 4 8 16H4l8-16Z" />
        <path d="M12 9v11" />
      </>
    ),
    check: <path d="m4.5 12.5 5 5 10-11" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="mt-0.5 size-[1.15rem] shrink-0 text-sage"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

/**
 * A room, in full, without leaving the itinerary.
 *
 * "View details" used to be a link to `/stays/[id]`. That page still exists
 * and is still the canonical, linkable version of a room — but it was the
 * wrong default from inside a half-built itinerary: somebody three days into
 * choosing nights had to leave the flow, read, and then find their place
 * again in an accordion of eight days.
 *
 * ## The shell
 *
 * `<dialog showModal()>` gives the focus trap, Escape, top-layer stacking
 * and restore-focus-on-close for nothing, and hand-rolled modals get all
 * four wrong. Four things it does not give, all handled here:
 *
 *  1. **Centring.** The element is the full viewport — `inset-0`, no size of
 *     its own — and centres the panel with a grid. Relying on the UA's
 *     `margin: auto` made the dialog its own scroll container as well, so a
 *     panel taller than the viewport sat wherever its overflow put it and
 *     read as cropped rather than centred.
 *  2. **Backdrop clicks.** One listener, below. Because the element fills
 *     the viewport, a click that lands on it rather than on the panel is by
 *     definition a click outside the content.
 *  3. **The page behind.** `showModal()` makes the page inert to input, but
 *     Lenis drives scrolling itself from wheel events on the window and does
 *     not know a dialog is open — so the itinerary kept scrolling underneath
 *     while you read. `stop()` on open, `start()` on close.
 *  4. **Scroll chaining.** `overscroll-contain` stops a flick at the end of
 *     the panel handing the rest of the gesture to the document.
 *
 * ## `data-lenis-prevent`, and why the panel would not scroll
 *
 * Point 3 above caused the bug reported against it. Lenis, once stopped,
 * does not merely decline to scroll — it swallows the event. From its
 * `onVirtualScroll`, in order:
 *
 * ```js
 * if (composedPath.find((node) => node.hasAttribute?.('data-lenis-prevent')))
 *   return;                                  // ← the escape hatch, first
 * if (this.isStopped || this.isLocked) {
 *   if (event.cancelable) event.preventDefault();   // ← every wheel event
 *   return;
 * }
 * ```
 *
 * Lenis listens on the window with `passive: false`, and a `<dialog>` in the
 * top layer is still a DOM descendant of `<body>`, so a wheel event over
 * this panel reaches that handler and gets `preventDefault()`d — which is
 * precisely the default action the panel needed in order to scroll. The
 * result was a modal that scrolled by keyboard, by scrollbar drag and by
 * `scrollTop` but not by wheel or trackpad, which is to say: not at all, for
 * anybody actually using it.
 *
 * `data-lenis-prevent` on the scroll container is the documented opt-out,
 * and it is tested *before* the `isStopped` branch, so the attribute and
 * `stop()` are not in conflict — they divide the viewport between them.
 * Wheel over the panel: native scrolling, Lenis never looks at it. Wheel
 * over the backdrop: Lenis eats it and the page stays put. Both are wanted,
 * which is why the fix is to add the attribute rather than to drop `stop()`.
 *
 * It also has to be on the element that scrolls, not on the `<dialog>`:
 * Lenis walks the composed path, so an ancestor would do, but the ancestor
 * here *is* the backdrop, and marking that would hand the page's scroll back
 * to the wheel the moment the pointer left the panel.
 */
export function StayDetailsDialog({ stay }: { stay: StayOption }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [frame, setFrame] = useState(0);
  const amenities = STAY_AMENITIES[stay.kind];

  /*
   * The hero photograph first, then the rest of the set.
   *
   * `stay.gallery` is the per-property override and `roomGalleries` the
   * fallback for the kind of room — the same two-step `stay.image` already
   * uses, so a property that gets real photography gets a real set with one
   * edit and no change here.
   */
  const frames = [stay.image, ...(stay.gallery ?? roomGalleries[stay.kind])];

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const onClick = (event: MouseEvent) => {
      if (event.target === node) node.close();
    };
    const onClose = () => {
      setOpen(false);
      /* Reopening shows the room, not whichever bathroom you left on. */
      setFrame(0);
      window.__lenis?.start?.();
    };

    node.addEventListener("click", onClick);
    node.addEventListener("close", onClose);
    return () => {
      node.removeEventListener("click", onClick);
      node.removeEventListener("close", onClose);
      /* If this unmounts while open, the page must not stay frozen. */
      window.__lenis?.start?.();
    };
  }, []);

  const show = () => {
    setOpen(true);
    window.__lenis?.stop?.();
    ref.current?.showModal();
  };

  return (
    <>
      <button
        type="button"
        onClick={show}
        className={cn(
          "u-label mt-1.5 inline-block text-ink-faint underline underline-offset-4",
          "transition-colors duration-[var(--dur-micro)] ease-brand hover:text-ink",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
        )}
      >
        View details
      </button>

      <dialog
        ref={ref}
        aria-labelledby={`stay-dialog-${stay.id}`}
        className={cn(
          /* The element is the viewport; the panel inside it is the dialog. */
          "fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none",
          "place-items-center overflow-hidden bg-transparent p-4 open:grid",
          "backdrop:bg-[rgb(28_25_21/0.62)] backdrop:backdrop-blur-md",
        )}
      >
        {/* Mounted only while open, so sixty-six room photographs are not all
            in the document at once. */}
        {open ? (
          <div
            /* See the note on `data-lenis-prevent` above. Without it the
               wheel does nothing in here, because Lenis is stopped and a
               stopped Lenis calls preventDefault on every wheel event that
               reaches the window — including the ones over this panel. */
            data-lenis-prevent
            className={cn(
              "u-scrollbar-slim flex max-h-[calc(100dvh_-_2rem)] w-full max-w-[44rem] flex-col",
              "overflow-y-auto overscroll-contain rounded-[var(--radius-card)] bg-paper text-ink",
              "shadow-[0_40px_90px_-30px_rgb(28_25_21/0.55)]",
            )}
          >
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
              <Image
                /* Keyed on the URL so switching frames is a new element
                   rather than a mutated `src`, which is what lets the
                   browser keep each decoded frame in its cache. */
                key={frames[frame]}
                src={frames[frame]}
                alt={
                  frame === 0
                    ? stay.name
                    : `${stay.name} — photograph ${frame + 1} of ${frames.length}`
                }
                fill
                sizes="(max-width: 768px) 100vw, 704px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => ref.current?.close()}
                aria-label="Close"
                className="u-glass absolute top-3 right-3 grid size-9 place-items-center rounded-full text-ink transition-transform duration-[var(--dur-micro)] ease-brand hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>

              {/* Which frame of how many, over the photograph rather than
                  under it — the strip below says the same thing, and this
                  is for the moment before you have noticed the strip. */}
              <p className="u-glass u-num absolute bottom-3 left-3 rounded-full px-3 py-1 text-14 text-ink">
                {frame + 1} / {frames.length}
              </p>
            </div>

            {/*
              The rest of the set, as squares.

              Square because these are four different subjects — a bathroom, a
              lawn, a staircase — and a square is the one crop that treats a
              tall subject and a wide one alike. At 16/9 the staircase would
              lose its top and the lawn would lose its sky, and a row of
              thumbnails that each lie about their own frame is worse than no
              row at all.

              Buttons, not a carousel. Four frames do not need arrows, and a
              strip where every frame is visible and directly reachable needs
              no concept of "next".
            */}
            <div
              role="group"
              aria-label={`Photographs of ${stay.name}`}
              className="flex shrink-0 scrollbar-none gap-2.5 overflow-x-auto px-6 pt-4 lg:px-8"
            >
              {frames.map((src, index) => {
                const current = index === frame;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setFrame(index)}
                    aria-pressed={current}
                    aria-label={`Photograph ${index + 1} of ${frames.length}`}
                    className={cn(
                      /* `--radius-input`, not `--radius-card`: 20px on a
                         72px square is most of the square. */
                      "relative size-16 shrink-0 overflow-hidden rounded-[var(--radius-input)] bg-shell sm:size-[4.5rem]",
                      "transition-opacity duration-[var(--dur-micro)] ease-brand",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
                      current
                        ? "opacity-100 ring-2 ring-ink ring-offset-2 ring-offset-paper"
                        : "opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>

            <div className="p-6 lg:p-8">
              <p className="u-label text-ink-faint">{KIND_LABEL[stay.kind]}</p>
              <h2
                id={`stay-dialog-${stay.id}`}
                className="mt-3 text-28 lg:text-36"
              >
                {stay.name}
              </h2>
              <p className="mt-4 text-16 text-ink-soft">{stay.blurb}</p>

              <p className="mt-6 flex flex-wrap items-baseline gap-x-3 border-y border-[var(--ink-hairline)] py-4">
                <span className="u-label text-ink-faint">
                  {stay.supplement === 0
                    ? "Already in the price"
                    : "Supplement"}
                </span>
                <span className="u-num font-display text-22">
                  {stay.supplement === 0
                    ? "Included"
                    : `+${formatINR(stay.supplement)}`}
                </span>
                {stay.supplement > 0 ? (
                  <span className="u-label text-ink-faint">
                    per person, per night
                  </span>
                ) : null}
              </p>

              <h3 className="mt-7 text-18">{amenities.label}</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {amenities.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-16 text-ink-soft"
                  >
                    <AmenityIcon name={iconFor(item)} />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-14 text-ink-faint">{amenities.note}</p>
              <p className="mt-4 text-14 text-ink-faint">
                These are what this kind of room includes as standard on our
                trips. The property itself is named and confirmed in writing
                before anything is payable.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[var(--ink-hairline)] pt-5">
                <Link
                  href={
                    stay.homestaySlug
                      ? `/homestays/${stay.homestaySlug}`
                      : `/stays/${stay.id}`
                  }
                  className="u-label text-ink-faint underline underline-offset-4 transition-colors hover:text-ink"
                >
                  {stay.homestaySlug
                    ? "The full homestay page"
                    : "Open as its own page"}
                </Link>
                <button
                  type="button"
                  onClick={() => ref.current?.close()}
                  className="u-label ml-auto min-h-10 rounded-full border border-[var(--ink-hairline-strong)] px-5 transition-colors hover:border-ink"
                >
                  Back to the day
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
