"use client";

import { usePathname } from "next/navigation";

/**
 * Leaves the footer off the trip planner.
 *
 * `/tours` is a form from top to bottom — where, who, when, who exactly, then
 * an itinerary to specify day by day — and a full site footer under it is a
 * second page of links and a second call to action at the one moment the
 * visitor is meant to be finishing the first. So it is simply not rendered
 * there. Every other route, including each trip's own page under `/tours/`,
 * keeps it.
 *
 * A client wrapper around the server-rendered footer rather than making
 * `Footer` itself a client component: the footer's markup still renders on
 * the server and ships as HTML, and only this pathname check runs in the
 * browser.
 */
const WITHOUT_FOOTER = new Set(["/tours"]);

export function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (WITHOUT_FOOTER.has(pathname)) return null;
  return <>{children}</>;
}
