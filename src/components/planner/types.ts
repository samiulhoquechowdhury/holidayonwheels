import type { WeaveRegion } from "@/components/layout/weave-motifs";
import type { StateSlug } from "@/content/types";

/**
 * What the planner needs to know about a state, and nothing else.
 *
 * The same rule the tours index already follows for `TourSummary`: anything
 * handed to a client component is serialised into the payload and shipped, so
 * a `Destination` — three paragraphs of body copy each, eight of them —
 * cannot cross the boundary just because two fields on it are wanted.
 *
 * `minDays` and `maxDays` come from the route spine rather than the
 * destination record. They are what let the dates step say "Meghalaya works
 * from four days and this road holds eight" before anything is submitted,
 * instead of finding out after the plan comes back.
 */
export type PlannerState = {
  slug: StateSlug;
  name: string;
  tagline: string;
  gateway: string;
  bestMonths: string[];
  knownFor: string[];
  requiresILP: boolean;
  region: WeaveRegion;
  /** Catalogue trips that visit this state, for the card's meta line. */
  tripCount: number;
  minDays: number;
  maxDays: number;
  /** One line on what the state's road network is good for. From the route. */
  routeNote: string;
  image: string;
  colour: string;
  ink: string;
};
