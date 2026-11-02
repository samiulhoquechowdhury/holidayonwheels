"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";
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

/**
 * A room, in full, without leaving the itinerary.
 *
 * "View details" used to be a link to `/stays/[id]`. That page still exists
 * and is still the canonical, linkable, crawlable version of a room — but it
 * was the wrong default from inside a half-built itinerary. Somebody three
 * days into choosing nights, who wants to know whether the lodge has hot
 * water, had to leave the flow, read, and come back; and coming back means
 * finding their place again in an accordion of eight days.
 *
 * So the same content opens over the page instead, and the dialog carries a
 * link to the full page for anyone who wants to send it to the person they
 * are travelling with.
 *
 * ## Why the native element
 *
 * `<dialog showModal()>` gives the focus trap, the Escape key, the inert
 * background, the top-layer stacking and the restore-focus-on-close for
 * nothing. Every one of those is a thing hand-rolled modals get wrong, and
 * the alternative was a dependency or a hundred lines of `useEffect`.
 *
 * Two things it does not give, handled below: clicking the backdrop does not
 * close it, and `close()` does not animate. The first is one listener. The
 * second is why `open` state exists alongside the element's own — the
 * content fades in on open, and on close we let the element go immediately
 * rather than animating out, because an exit animation on a dialog you
 * dismissed is a delay between asking and getting.
 */
export function StayDetailsDialog({ stay }: { stay: StayOption }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const amenities = STAY_AMENITIES[stay.kind];

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    /*
     * The backdrop is part of the dialog's own box, so a click that lands on
     * the element itself — rather than on the panel inside it — is a click
     * outside the content.
     */
    const onClick = (event: MouseEvent) => {
      if (event.target === node) node.close();
    };
    const onClose = () => setOpen(false);

    node.addEventListener("click", onClick);
    node.addEventListener("close", onClose);
    return () => {
      node.removeEventListener("click", onClick);
      node.removeEventListener("close", onClose);
    };
  }, []);

  const show = () => {
    setOpen(true);
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
          "m-auto w-[min(44rem,calc(100vw_-_2rem))] max-w-none bg-transparent p-0",
          "backdrop:bg-[rgb(46_42_36/0.55)] backdrop:backdrop-blur-[2px]",
        )}
      >
        {/* Rendered only while open, so the images of sixty-six rooms are
            not all in the document at once. */}
        {open ? (
          <div className="max-h-[min(42rem,calc(100dvh_-_2rem))] overflow-y-auto overscroll-contain rounded-[var(--radius-card)] bg-paper text-ink">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src={stay.image}
                alt={stay.name}
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
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {amenities.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-16 text-ink-soft"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-clay"
                    />
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
