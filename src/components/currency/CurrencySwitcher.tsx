"use client";

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

  if (!available) return null;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <label htmlFor="currency" className="sr-only">
        Show prices in
      </label>
      <select
        id="currency"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        title={
          updated
            ? `Indicative conversion. Rates from ${updated}. All prices are charged in rupees.`
            : "Indicative conversion. All prices are charged in rupees."
        }
        className="u-label min-h-9 cursor-pointer rounded-full border border-[var(--ink-hairline-strong)] bg-transparent px-3 text-ink-soft transition-colors hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
      >
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code}
          </option>
        ))}
      </select>
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
