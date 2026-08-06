/**
 * Outbound destinations that are not part of this application.
 *
 * Standalone car hire and standalone bike hire are operated on Beep Drive.
 * Motorcycle *tours* are built in this repo — only *rentals* leave. Every
 * outbound URL is declared here so a domain change is a one-file edit.
 */

export const BEEPDRIVE_URL = "https://beepdrive.com";

/**
 * Beep Drive's deep-link contract is unconfirmed (open question 5 in the
 * brief). Until it is, every rental link resolves to the homepage and any
 * context we hold is dropped rather than guessed at. When the contract is
 * known, change only this function.
 */
export type RentalIntent = {
  kind: "car" | "bike";
  /** City the traveller is browsing from, if we know it. */
  city?: string;
  /** ISO date strings, if the traveller has picked dates. */
  from?: string;
  to?: string;
};

export function rentalUrl(_intent?: RentalIntent): string {
  return BEEPDRIVE_URL;
}

/** Attributes every outbound link must carry. */
export const OUTBOUND_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;
