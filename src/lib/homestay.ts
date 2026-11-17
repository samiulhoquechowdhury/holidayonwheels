import type { Homestay, MealPlan } from "@/content/types";

/**
 * Can this house be quoted, or only enquired about?
 *
 * ## Why this is its own module
 *
 * It started out exported from `StayBookingWidget`, which carries
 * `"use client"`. The detail page is a server component, and a server
 * component cannot call a function that lives in a client module — React
 * rejects it at runtime with "Attempted to call isBookable() from the server
 * but isBookable is on the client", and the whole page fails to render. It
 * typechecked perfectly, which is exactly why it reached a browser.
 *
 * A predicate over plain data belongs on neither side of that boundary, so
 * it lives here and both sides import it.
 *
 * ## What it is for
 *
 * `fromPrice`, `maxGuests` and `mealsIncluded` became optional when the
 * client's four real Guwahati houses arrived with photographs and names but
 * no rates. The booking widget is arithmetic over a nightly rate; with none
 * of that it can only render blankly. Narrowing here rather than scattering
 * `?? 0` through the component is the difference between the compiler
 * enforcing the caller's branch and a comment asking it to.
 */
export type BookableHomestay = Homestay & {
  fromPrice: number;
  maxGuests: number;
  mealsIncluded: MealPlan;
};

export function isBookable(stay: Homestay): stay is BookableHomestay {
  return (
    stay.fromPrice !== undefined &&
    stay.maxGuests !== undefined &&
    stay.mealsIncluded !== undefined &&
    stay.rooms.length > 0
  );
}
