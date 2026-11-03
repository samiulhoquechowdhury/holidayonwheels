/**
 * Exchange rates, for showing rupee prices in a visitor's own currency.
 *
 * ## What this is not
 *
 * It is not a pricing engine. Every price on this site is quoted, invoiced and
 * charged in **rupees**; the converted figure is a reading aid for somebody
 * deciding whether a trip is in their budget at all. That distinction is not
 * pedantry — it is the difference between an indication and an offer, and a
 * tour operator that appears to quote in dollars has to honour dollars. So
 * every converted amount is rendered as approximate, beside the rupee figure,
 * never instead of it.
 *
 * ## The source
 *
 * `open.er-api.com`, the keyless tier of exchangerate-api.com. Chosen for the
 * same reason as Open-Meteo: it answers without an account, so the site works
 * on a fresh clone. It publishes `time_next_update_unix`, so the cache window
 * is the provider's own rather than a number invented here.
 *
 * **Attribution is a condition of the free tier** and is rendered in the
 * currency switcher. See README § Open questions for the commercial-use
 * question, which is the same shape as the Open-Meteo and OSM ones.
 *
 * ## Failure is normal and must be survivable
 *
 * `rates()` returns `null` rather than throwing, and every caller treats null
 * as "show rupees only". The hard lesson is already in this repository: a
 * build-time `fetch` with no timeout put a third party's latency on the
 * critical path of our own build and failed CI intermittently for an hour.
 * This one aborts after six seconds and the site renders rupees.
 */

/** Rupees to one unit of each supported currency. */
export type FxRates = {
  /** How many of this currency one rupee buys. */
  perRupee: Record<string, number>;
  /** When the provider last refreshed, ISO. Shown to the visitor. */
  updated: string;
};

export type SupportedCurrency = (typeof CURRENCIES)[number];

/**
 * The currencies offered, and why these.
 *
 * Inbound tourism to the Northeast comes overwhelmingly from a short list:
 * the Anglosphere, western Europe, the Gulf (a large Indian diaspora
 * travelling home), and the nearer Asian markets. A dropdown of 160
 * currencies would be a worse version of this one — the provider returns them
 * all and the choice of which to show is ours.
 *
 * `INR` is first and is the default. It is not a conversion; it is the real
 * price, and selecting it turns the feature off.
 */
export const CURRENCIES = [
  { code: "INR", label: "Indian rupee", symbol: "₹" },
  { code: "USD", label: "US dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "Pound sterling", symbol: "£" },
  { code: "AUD", label: "Australian dollar", symbol: "A$" },
  { code: "CAD", label: "Canadian dollar", symbol: "C$" },
  { code: "SGD", label: "Singapore dollar", symbol: "S$" },
  { code: "AED", label: "UAE dirham", symbol: "AED" },
  { code: "CHF", label: "Swiss franc", symbol: "CHF" },
  { code: "JPY", label: "Japanese yen", symbol: "¥" },
  { code: "NZD", label: "New Zealand dollar", symbol: "NZ$" },
  { code: "THB", label: "Thai baht", symbol: "฿" },
  { code: "MYR", label: "Malaysian ringgit", symbol: "RM" },
] as const;

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

export function isSupportedCurrency(value: unknown): value is string {
  return typeof value === "string" && CURRENCY_CODES.includes(value as "INR");
}

export function currencyMeta(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

type ProviderResponse = {
  result?: string;
  time_last_update_utc?: string;
  rates?: Record<string, number>;
};

/**
 * Today's rates, or null.
 *
 * Cached for six hours. The provider refreshes once a day on this tier, so a
 * shorter window would be requests spent re-fetching an unchanged number; a
 * longer one risks a visibly stale figure beside a price.
 */
export async function getRates(): Promise<FxRates | null> {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/INR", {
      next: { revalidate: 21_600 },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) return null;

    const body = (await response.json()) as ProviderResponse;
    if (body.result !== "success" || !body.rates) return null;

    /*
     * Only the currencies on offer are kept. The response carries 160-odd,
     * and all of them would be serialised into the HTML of every page that
     * renders a price — the payload is the reason to filter, not tidiness.
     */
    const perRupee: Record<string, number> = {};
    for (const { code } of CURRENCIES) {
      const rate = body.rates[code];
      if (typeof rate === "number" && rate > 0) perRupee[code] = rate;
    }

    /* Without the rupee itself there is nothing to convert from. */
    if (!perRupee.INR) return null;

    return {
      perRupee,
      updated: body.time_last_update_utc ?? new Date().toUTCString(),
    };
  } catch {
    /* Timed out, offline, or the provider changed shape. Rupees it is. */
    return null;
  }
}

/**
 * Convert and round for display.
 *
 * Rounding is deliberately coarse and gets coarser with size: nobody
 * comparing a ₹64,500 trip needs to see `$771.43`, and the false precision of
 * two decimal places on an approximation invites exactly the misreading this
 * module's header warns about. Small amounts keep more resolution because a
 * ₹400 entry fee rounded to the nearest ten dollars would be zero.
 */
export function convert(rupees: number, rate: number): number {
  const raw = rupees * rate;
  if (raw < 10) return Math.round(raw * 10) / 10;
  if (raw < 1000) return Math.round(raw);
  if (raw < 10_000) return Math.round(raw / 10) * 10;
  return Math.round(raw / 100) * 100;
}
