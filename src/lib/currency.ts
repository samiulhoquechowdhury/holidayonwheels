/**
 * Money formatting. Prices are held as integer rupees throughout — never
 * floats, never paise — so arithmetic in the booking widget stays exact.
 */

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const INR_PLAIN = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

/** `₹1,24,500` — Indian lakh grouping. */
export function formatINR(rupees: number): string {
  return INR.format(rupees);
}

/** `1,24,500` without the symbol, for when the symbol is set separately. */
export function formatAmount(rupees: number): string {
  return INR_PLAIN.format(rupees);
}

/**
 * `₹1.25 L` / `₹94,000` — compact form for cards where the full figure
 * would crowd the layout. Only used above one lakh.
 */
export function formatCompactINR(rupees: number): string {
  if (rupees >= 100_000) {
    const lakhs = rupees / 100_000;
    const rounded = lakhs >= 10 ? lakhs.toFixed(1) : lakhs.toFixed(2);
    return `₹${rounded.replace(/\.?0+$/, "")} L`;
  }
  return INR.format(rupees);
}

/** Per-person price line, e.g. `₹64,500 per person`. */
export function perPerson(rupees: number): string {
  return `${formatINR(rupees)} per person`;
}
