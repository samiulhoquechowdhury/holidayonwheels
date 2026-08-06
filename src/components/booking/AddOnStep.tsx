"use client";

import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/currency";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { Media } from "@/components/primitives/Media";
import {
  OutboundLink,
  OutboundGlyph,
} from "@/components/primitives/OutboundLink";
import { rentalUrl } from "@/config/external";
import type { WeaveRegion } from "@/components/layout/weave-motifs";

/**
 * Cross-sell step. Homestays to extend the trip, permit handling, transfers,
 * and the outbound rental link.
 *
 * Selections are lifted to the parent — the checkout owns the order, this
 * component only presents the choices. Everything shows its price before it
 * is selected; nothing is pre-ticked.
 */

export type AddOn = {
  id: string;
  kind: "stay" | "permit" | "transfer" | "gear";
  title: string;
  description: string;
  /** Per-booking price. Zero renders as "included". */
  price: number;
  /** Multiplied by traveller count rather than charged once. */
  perTraveller?: boolean;
  imageAlt?: string;
  imageSrc?: string;
  region?: WeaveRegion;
};

export function AddOnStep({
  addOns,
  selected,
  onToggle,
  travellers,
  className,
}: {
  addOns: AddOn[];
  selected: string[];
  onToggle: (id: string) => void;
  travellers: number;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <ul className="flex flex-col gap-3">
        {addOns.map((addOn) => {
          const isSelected = selected.includes(addOn.id);
          const price = addOn.perTraveller
            ? addOn.price * travellers
            : addOn.price;

          return (
            <li key={addOn.id}>
              <label
                className={cn(
                  "flex cursor-pointer gap-4 border p-4",
                  "rounded-[var(--radius-control)] transition-colors duration-[var(--dur-micro)] ease-brand",
                  isSelected
                    ? "border-ink bg-[rgb(20_32_27/0.04)]"
                    : "border-[var(--ink-hairline)] hover:border-[var(--ink-hairline-strong)]",
                  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-deep-teal",
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(addOn.id)}
                  className="u-sr-only"
                />

                {addOn.imageAlt ? (
                  <div className="hidden w-28 shrink-0 overflow-hidden rounded-[2px] sm:block">
                    <Media
                      alt={addOn.imageAlt}
                      src={addOn.imageSrc}
                      seed={addOn.id}
                      region={addOn.region}
                      aspect="4/3"
                      sizes="112px"
                    />
                  </div>
                ) : null}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Eyebrow
                        tone={addOn.kind === "permit" ? "teal" : "soft"}
                        as="span"
                      >
                        {LABEL[addOn.kind]}
                      </Eyebrow>
                      <p className="mt-1.5 text-18">{addOn.title}</p>
                    </div>
                    <Checkbox checked={isSelected} />
                  </div>

                  <p className="mt-2 text-14 text-ink-soft">
                    {addOn.description}
                  </p>

                  <p className="mt-3 font-mono text-14 tabular-nums">
                    {price === 0 ? (
                      <span className="text-deep-teal-ink">
                        Included at no charge
                      </span>
                    ) : (
                      <>
                        {formatINR(price)}
                        {addOn.perTraveller ? (
                          <span className="u-mono ml-2 text-ink-faint">
                            {formatINR(addOn.price)} × {travellers}
                          </span>
                        ) : null}
                      </>
                    )}
                  </p>
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      <RentalOutboundCard />
    </div>
  );
}

const LABEL = {
  stay: "Extend your trip",
  permit: "Permits",
  transfer: "Transfers",
  gear: "Equipment",
} as const;

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] border",
        checked
          ? "border-ink bg-ink text-paper"
          : "border-[var(--ink-hairline-strong)]",
      )}
    >
      {checked ? (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
          <path
            d="M3 8.5 6.5 12 13 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
          />
        </svg>
      ) : null}
    </span>
  );
}

/**
 * Car and bike hire are not sold here — they are operated on Beep Drive. This
 * card is deliberately built to the same standard as everything around it and
 * marked clearly as leaving the site, rather than being buried as a footnote.
 */
function RentalOutboundCard() {
  return (
    <div className="mt-6 rounded-[var(--radius-control)] border border-dashed border-[var(--ink-hairline-strong)] p-4">
      <Eyebrow tone="soft" as="p">
        Also worth having
      </Eyebrow>
      <p className="mt-1.5 text-18">A car or a bike of your own</p>
      <p className="mt-2 max-w-prose text-14 text-ink-soft">
        Self-drive hire is run by our partner Beep Drive rather than booked
        here, so it opens in a new tab and is paid for separately. Useful for
        the days either side of a guided trip.
      </p>
      <OutboundLink
        href={rentalUrl()}
        showIndicator={false}
        className="mt-4 inline-flex min-h-11 items-center gap-2 text-14 font-medium text-deep-teal-ink underline underline-offset-4"
      >
        Browse hire on Beep Drive
        <OutboundGlyph />
      </OutboundLink>
    </div>
  );
}
