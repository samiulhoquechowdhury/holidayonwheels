"use client";

import { useId } from "react";
import { CURRENCIES } from "@/lib/fx";
import { useCurrency } from "./CurrencyProvider";
import { cn } from "@/lib/cn";

/**
 * The currency control.
 *
 * A native `<select>`, deliberately. Thirteen options is past the point where
 * a row of chips is scannable, the control is used once and then forgotten,
 * and on a phone the platform picker is better than anything built here — it
 * is searchable by keystroke and does not need a scroll trap. The custom
 * dropdowns elsewhere on this site exist because they carry images or colour;
 * this one carries thirteen words.
 *
 * It renders nothing at all when rates are unavailable. An empty switcher
 * that cannot convert is a control that does nothing, and the site simply
 * shows rupees — which is the real price, so there is nothing to apologise
 * for and no reason to announce a degraded state to a visitor who never knew
 * the feature existed.
 */
export function CurrencySwitcher({ className }: { className?: string }) {
  const { code, setCode, available, updated } = useCurrency();
  /*
   * A generated id, because this renders twice.
   *
   * The header has one and `MenuDrawer` has another, and a hardcoded
   * `id="currency"` put two of them in the same document: invalid HTML, and
   * the drawer's own `<label for>` then resolved to the *header's* select,
   * which below `sm` is `display: none`. Tapping that label did nothing and
   * a screen reader announced the wrong control.
   */
  const id = useId();

  if (!available) return null;

  return (
    <span className={cn("group relative inline-flex shrink-0", className)}>
      <label htmlFor={id} className="sr-only">
        Show prices in
      </label>
      <select
        id={id}
        data-currency-switcher=""
        value={code}
        onChange={(event) => setCode(event.target.value)}
        title={
          updated
            ? `Indicative conversion. Rates from ${updated}. All prices are charged in rupees.`
            : "Indicative conversion. All prices are charged in rupees."
        }
        className={cn(
          /*
           * `appearance-none` and sized to `--plate-h`, so this is a sibling
           * of the account control beside it rather than a smaller box
           * floating next to one. It was 36px against that control's 58px,
           * centred, which reads as two unequal things rather than a pair.
           */
          "u-label h-[var(--plate-h)] cursor-pointer appearance-none",
          "rounded-[var(--radius-control)] border border-[var(--ink-hairline)]",
          /*
           * The right padding is for the chevron below, which sits in it.
           * At the 12px this had, the glyph crowded the pill's curve — on a
           * `--radius-control` pill the corner eats more of the right edge
           * than it would on a rectangle, so the inset has to clear the
           * curve and not just the text.
           */
          "bg-transparent pr-9 pl-4 text-ink-soft",
          "transition-[border-color,background-color,color] duration-[var(--dur-micro)] ease-brand",
          "hover:border-[var(--ink-hairline-strong)] hover:bg-[rgb(46_42_36/0.035)] hover:text-ink",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
        )}
      >
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code}
          </option>
        ))}
      </select>

      {/*
        Our own chevron, because the browser's is the wrong weight.
        The native arrow is a heavy filled wedge; every other glyph in this
        header — the account bust, the menu rules — is a 1.5-unit open stroke
        with round caps, and the stock one sat among them at roughly twice
        the optical density.

        `pointer-events-none` so the click still reaches the select
        underneath, which remains a real `<select>`: the platform picker on a
        phone is better than anything built here, and keyboard and screen
        reader behaviour come free.
      */}
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-ink-faint transition-colors duration-[var(--dur-micro)] ease-brand group-hover:text-ink"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 9 7 7 7-7" />
      </svg>
    </span>
  );
}

/**
 * The attribution and the caveat, for the footer.
 *
 * Two separate obligations met in one line. The provider's free tier requires
 * a link back — the same condition OpenStreetMap's tiles carry — and the
 * business needs it said in writing that a converted figure is not a quote.
 * Neither belongs in a tooltip only.
 */
export function CurrencyNote({ className }: { className?: string }) {
  const { available, updated, code } = useCurrency();

  if (!available || code === "INR") return null;

  return (
    <p className={cn("text-14 text-ink-faint", className)}>
      Prices are quoted and charged in Indian rupees. Amounts shown in {code}{" "}
      are indicative only, converted at a rate published
      {updated ? ` ${updated}` : ""} by{" "}
      <a
        href="https://www.exchangerate-api.com"
        rel="noopener noreferrer"
        target="_blank"
        className="underline underline-offset-4 hover:text-ink"
      >
        exchangerate-api.com
      </a>
      . The amount your bank charges will differ.
    </p>
  );
}
