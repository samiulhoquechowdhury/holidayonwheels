"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  convert,
  currencyMeta,
  isSupportedCurrency,
  type FxRates,
} from "@/lib/fx";

/**
 * Which currency prices are shown in, for the whole site.
 *
 * ## Why a client context and not a cookie read on the server
 *
 * Reading a cookie in a server component opts that route — and anything above
 * it — out of static rendering. Prices appear on nearly every page, so doing
 * this server-side would cost all 191 prerendered pages their prerendering to
 * change the symbol in front of a number. The rates are fetched on the server
 * once and handed down as a prop; the *choice* lives in the browser.
 *
 * The consequence is honest and worth stating: the first paint is always
 * rupees, and a visitor who chose dollars sees them a moment later. Rupees is
 * the correct thing to show while we do not yet know, because rupees is what
 * the price actually is.
 *
 * ## Why `localStorage` and not a cookie
 *
 * Nothing on the server needs to know this. A cookie would be sent on every
 * request — including every image — to be read by nobody.
 */

const STORAGE_KEY = "how:currency";

type CurrencyContextValue = {
  /** The selected code, e.g. `USD`. Always `INR` until hydrated. */
  code: string;
  setCode: (code: string) => void;
  /** Null when rates could not be fetched, or when the choice is INR. */
  rate: number | null;
  /** Formats an approximate converted amount, or null when not applicable. */
  format: (rupees: number) => string | null;
  updated: string | null;
  available: boolean;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  rates,
  children,
}: {
  rates: FxRates | null;
  children: React.ReactNode;
}) {
  const [code, setCodeState] = useState("INR");

  /*
   * Read the stored choice after mount, never during render.
   *
   * Reading `localStorage` while rendering would make the server's HTML and
   * the client's first render disagree, which React reports as a hydration
   * mismatch and resolves by throwing the server's markup away. Every read is
   * wrapped: in a private window, or with site data blocked, the accessor
   * itself throws rather than returning null.
   */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && isSupportedCurrency(stored)) setCodeState(stored);
    } catch {
      /* No storage. The default stands. */
    }
  }, []);

  const setCode = useCallback((next: string) => {
    if (!isSupportedCurrency(next)) return;
    setCodeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* The choice still applies to this visit. */
    }
  }, []);

  const value = useMemo<CurrencyContextValue>(() => {
    const rate = code === "INR" ? null : (rates?.perRupee[code] ?? null);

    const formatter =
      rate === null
        ? null
        : new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: code,
            /*
             * Whole units. `convert` has already rounded, and showing cents
             * on a figure rounded to the nearest hundred rupees would be
             * precision the number does not have.
             */
            maximumFractionDigits: 0,
          });

    return {
      code,
      setCode,
      rate,
      updated: rates?.updated ?? null,
      available: Boolean(rates),
      format: (rupees: number) => {
        if (rate === null || !formatter) return null;
        return formatter.format(convert(rupees, rate));
      },
    };
  }, [code, rates, setCode]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Prices render in components that are not always inside the provider —
 * `StayDetailsDialog` is reachable from a page that mounts it directly in
 * tests, for one. A missing provider returns a working no-op rather than
 * throwing, because the fallback is the real price in rupees and a crashed
 * price is worse than an unconverted one.
 */
export function useCurrency(): CurrencyContextValue {
  return (
    useContext(CurrencyContext) ?? {
      code: "INR",
      setCode: () => {},
      rate: null,
      updated: null,
      available: false,
      format: () => null,
    }
  );
}

export { currencyMeta };
