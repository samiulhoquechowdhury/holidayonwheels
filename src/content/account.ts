import type { Booking, Permit } from "./types";

/**
 * Signed-in account data.
 *
 * There is no authentication in this phase — these are the bookings and
 * permits of one fictional traveller so the account screens can be designed
 * against realistic states rather than empty ones. When auth lands, these
 * accessors take a user id and everything above them is unchanged.
 */

const bookings: Booking[] = [
  {
    reference: "HOW-4K7M2Q",
    kind: "tour",
    itemSlug: "meghalaya-root-bridges-and-rain",
    title: "Root bridges and the rain country",
    startDate: "2026-11-07",
    endDate: "2026-11-12",
    travellers: 2,
    total: 123000,
    status: "confirmed",
    bookedAt: "2026-07-14",
    region: "meghalaya",
  },
  {
    reference: "HOW-9P3XB1",
    kind: "moto",
    itemSlug: "tawang-run",
    title: "The Tawang run",
    startDate: "2027-03-20",
    endDate: "2027-03-28",
    travellers: 1,
    total: 148000,
    status: "pending-payment",
    bookedAt: "2026-08-02",
    region: "arunachal",
  },
  {
    reference: "HOW-2R8WL5",
    kind: "stay",
    itemSlug: "khasi-cottage-mawphlang",
    title: "The Khasi cottage at Mawphlang",
    startDate: "2026-11-12",
    endDate: "2026-11-14",
    travellers: 2,
    total: 9600,
    status: "confirmed",
    bookedAt: "2026-07-14",
    region: "meghalaya",
  },
  {
    reference: "HOW-6T1ZK9",
    kind: "event",
    itemSlug: "hornbill-festival-2026",
    title: "Hornbill Festival — three-day pass",
    startDate: "2026-12-03",
    endDate: "2026-12-05",
    travellers: 2,
    total: 6400,
    status: "confirmed",
    bookedAt: "2026-06-28",
    region: "nagaland",
  },
  {
    reference: "HOW-5J0NV3",
    kind: "tour",
    itemSlug: "kaziranga-short-escape",
    title: "Kaziranga short escape",
    startDate: "2026-02-13",
    endDate: "2026-02-16",
    travellers: 2,
    total: 77000,
    status: "completed",
    bookedAt: "2025-11-20",
    region: "assam",
  },
  {
    reference: "HOW-8H4CD7",
    kind: "tour",
    itemSlug: "sikkim-west-kanchenjunga",
    title: "West Sikkim and the Kanchenjunga face",
    startDate: "2026-04-03",
    endDate: "2026-04-08",
    travellers: 2,
    total: 142000,
    status: "cancelled",
    bookedAt: "2025-12-11",
    region: "sikkim",
  },
];

const permits: Permit[] = [
  {
    reference: "ILP-NL-2026-88214",
    state: "nagaland",
    kind: "ILP",
    travellerName: "A. Sharma",
    validFrom: "2026-12-01",
    validTo: "2026-12-08",
    status: "approved",
    submittedAt: "2026-07-02",
    bookingReference: "HOW-6T1ZK9",
  },
  {
    reference: "ILP-NL-2026-88215",
    state: "nagaland",
    kind: "ILP",
    travellerName: "R. Sharma",
    validFrom: "2026-12-01",
    validTo: "2026-12-08",
    status: "approved",
    submittedAt: "2026-07-02",
    bookingReference: "HOW-6T1ZK9",
  },
  {
    reference: "ILP-AR-2027-10473",
    state: "arunachal-pradesh",
    kind: "ILP",
    travellerName: "A. Sharma",
    validFrom: "2027-03-20",
    validTo: "2027-03-29",
    status: "submitted",
    submittedAt: "2026-08-02",
    bookingReference: "HOW-9P3XB1",
  },
  {
    reference: "ILP-SK-2026-30918",
    state: "sikkim",
    kind: "ILP",
    travellerName: "A. Sharma",
    validFrom: "2026-04-03",
    validTo: "2026-04-10",
    status: "expired",
    submittedAt: "2025-12-14",
    bookingReference: "HOW-8H4CD7",
  },
  {
    reference: "ILP-MN-2027-00042",
    state: "manipur",
    kind: "ILP",
    travellerName: "A. Sharma",
    validFrom: "2027-01-16",
    validTo: "2027-01-22",
    status: "draft",
  },
];

export function getBookings(): Booking[] {
  return [...bookings].sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function getBookingByReference(reference: string): Booking | undefined {
  return bookings.find((b) => b.reference === reference);
}

export function getUpcomingBookings(): Booking[] {
  return getBookings().filter(
    (b) => b.status === "confirmed" || b.status === "pending-payment",
  );
}

export function getPastBookings(): Booking[] {
  return getBookings().filter(
    (b) => b.status === "completed" || b.status === "cancelled",
  );
}

export function getPermits(): Permit[] {
  return [...permits].sort((a, b) => b.validFrom.localeCompare(a.validFrom));
}

export function getPermitsForBooking(reference: string): Permit[] {
  return permits.filter((p) => p.bookingReference === reference);
}
