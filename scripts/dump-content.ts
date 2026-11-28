/**
 * Freeze `src/content/*` into one JSON document for the API to import.
 *
 * ## Why a dump and not a direct insert
 *
 * The content modules resolve `@/*`, which only works with this project's
 * tsconfig as the entry point. The API is a separate package with its own
 * tsconfig and its own `pg`. Rather than teach either one about the other's
 * module resolution — or add `pg` to the Next.js app, which then ships to
 * Vercel for no reason — this step runs here, where the imports work, and
 * writes a file the API can read with nothing but `JSON.parse`.
 *
 * The file is also what you look at when a price arrives in the database
 * wrong — a direct insert leaves nothing to inspect. It is **not** committed,
 * though: it is generated from `src/content/*.ts`, which is in version
 * control, so committing it would hold the same content twice and let the
 * copy drift from its source. Regenerate it rather than reading an old one.
 *
 * Run with the API's tsx, from the repository root:
 *   ./api/node_modules/.bin/tsx scripts/dump-content.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { getDestinations } from "@/content/destinations";
import { getTours } from "@/content/tours";
import { getMotorcycleTours } from "@/content/motorcycle-tours";
import { getHomestays } from "@/content/homestays";
import { getEvents } from "@/content/events";
import { getActivities } from "@/content/activities";
import { getCafes } from "@/content/cafes";
import { getJournalPosts } from "@/content/journal";
import { getFaqs, getPolicies } from "@/content/site-content";
import {
  PLACE_OPTIONS,
  GATEWAY_POINTS,
  STAY_AMENITIES,
} from "@/content/day-options";
import { days as dayTemplates } from "@/content/day-library";
import { getRoute, maxDaysFor } from "@/content/routes";
import { localGuideFor } from "@/content/local-guide";
import { STANDARD_INCLUDES, STANDARD_EXCLUDES } from "@/content/inclusions";

const STATES = [
  "assam",
  "meghalaya",
  "arunachal-pradesh",
  "nagaland",
  "manipur",
  "mizoram",
  "tripura",
  "sikkim",
] as const;

const payload = {
  /*
   * Stamped so a database can be traced back to the commit its content came
   * from. The importer prints it.
   */
  dumpedAt: new Date().toISOString(),

  destinations: getDestinations(),
  tours: getTours(),
  motorcycleTours: getMotorcycleTours(),
  homestays: getHomestays(),
  events: getEvents(),
  activities: getActivities(),
  cafes: getCafes(),
  journalPosts: getJournalPosts(),
  faqs: getFaqs(),
  policies: getPolicies(),

  /*
   * `demoBookings` and `demoPermits` used to be dumped here, from a
   * `src/content/account.ts` of fictional records. They are gone: the account
   * screens read the signed-in traveller's own bookings from the API, and the
   * importer never read these anyway — it dumped them and dropped them.
   *
   * Seeding sample bookings would also have been actively harmful now that
   * bookings consume seats and carry money: a fabricated one would show up in
   * the office's figures as real revenue.
   */

  /* --- The planner ---------------------------------------------------- */
  placeOptions: PLACE_OPTIONS,
  gatewayPoints: GATEWAY_POINTS,
  dayTemplates,
  stayAmenities: STAY_AMENITIES,

  /*
   * `getRoute` and `localGuideFor` are per-state accessors, so they are
   * walked rather than exported wholesale. `localGuideFor` returns null where
   * nothing is written, which is preserved — the panel renders nothing for
   * those states and an empty object would be a different claim.
   */
  routes: Object.fromEntries(
    STATES.map((s) => [s, { legs: getRoute(s).legs, maxDays: maxDaysFor(s) }]),
  ),
  localGuides: Object.fromEntries(STATES.map((s) => [s, localGuideFor(s)])),

  quoteTerms: {
    includes: STANDARD_INCLUDES,
    excludes: STANDARD_EXCLUDES,
  },
};

const out = resolve(process.cwd(), "api/seed/content.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(payload, null, 2) + "\n", "utf8");

const counts = Object.entries(payload)
  .filter(([, v]) => v && typeof v === "object")
  .map(
    ([k, v]) =>
      `  ${k}: ${Array.isArray(v) ? v.length : Object.keys(v).length}`,
  )
  .join("\n");

console.log(`wrote ${out}\n${counts}`);
