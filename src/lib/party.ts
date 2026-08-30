import { journeyShots } from "@/config/showcase";
import type { TourType } from "@/content/types";

/**
 * Who is travelling.
 *
 * This is the planner's vocabulary, and it is deliberately *not* `TourType`.
 * The catalogue's four types are what forty-seven tours were authored as;
 * this is what a visitor says about themselves, and the two disagree on one
 * member — **family**. No tour in the catalogue was written as a family
 * departure, so adding "family" to `TourType` would have meant either editing
 * forty-seven records to assert something nobody checked, or a filter that
 * returns nothing. Neither is honest.
 *
 * Instead `family` is *derived*: a trip suits a family if it was written for
 * a couple or a small group and it is not graded challenging. That is a rule
 * an operator would actually apply, it is computed from data that already
 * exists, and it is one function rather than a content migration.
 *
 * `matchesParty` is the single place that mapping lives. The planner and the
 * catalogue filter both call it, so the two can never drift into disagreeing
 * about what a family trip is.
 */

export type PartyType = "couple" | "honeymoon" | "family" | "group" | "solo";

export type PartyDef = {
  id: PartyType;
  label: string;
  /** The line that decides it for someone hovering between two cards. */
  copy: string;
  /** What the choice actually changes. Three, never four. */
  changes: string[];
  defaultAdults: number;
  defaultChildren: number;
  /** From the state palette, so the row of cards is not monochrome. */
  colour: string;
  ink: string;
  image: string;
  alt: string;
};

export const PARTY_TYPES: PartyDef[] = [
  {
    id: "couple",
    label: "The two of us",
    copy: "A private vehicle, later starts, and rooms worth staying in.",
    changes: ["Private vehicle", "Twin or double", "Nothing before nine"],
    defaultAdults: 2,
    defaultChildren: 0,
    colour: "var(--jade)",
    ink: "var(--jade-ink)",
    image: journeyShots.couple,
    alt: "Two travellers on a terrace above a cloud-filled valley",
  },
  {
    id: "honeymoon",
    label: "Honeymoon",
    copy: "Unhurried and entirely private, with the best room in every house.",
    changes: ["Best room held", "Entirely private", "One night set aside"],
    defaultAdults: 2,
    defaultChildren: 0,
    colour: "var(--plum)",
    ink: "var(--plum-ink)",
    image: journeyShots.honeymoon,
    alt: "A lodge terrace at dawn facing a snow massif",
  },
  {
    id: "family",
    label: "Family",
    copy: "Shorter driving days, rooms that connect, and nothing at altitude.",
    changes: ["Shorter road days", "Connecting rooms", "No high passes"],
    defaultAdults: 2,
    defaultChildren: 2,
    colour: "var(--sky)",
    ink: "var(--sky-ink)",
    image: journeyShots.family,
    alt: "A family walking a village path together",
  },
  {
    id: "group",
    label: "A group of us",
    copy: "Capped numbers, one guide from the state, and the rate spread further.",
    changes: ["Party rate applies", "Guide from the state", "Capped numbers"],
    defaultAdults: 6,
    defaultChildren: 0,
    colour: "var(--naga)",
    ink: "var(--naga-ink)",
    image: journeyShots.group,
    alt: "A small group of travellers walking between rice terraces",
  },
  {
    id: "solo",
    label: "On my own",
    copy: "A single room as standard, and a guide who is genuinely company.",
    changes: ["Single room", "Guide throughout", "Supplement upfront"],
    defaultAdults: 1,
    defaultChildren: 0,
    colour: "var(--marigold)",
    ink: "var(--marigold-ink)",
    image: journeyShots.solo,
    alt: "A single rider on an empty mountain road",
  },
];

export function partyDef(id: PartyType): PartyDef {
  return PARTY_TYPES.find((p) => p.id === id) ?? PARTY_TYPES[0];
}

export function isPartyType(value: string | undefined): value is PartyType {
  return PARTY_TYPES.some((p) => p.id === value);
}

/**
 * Does this trip suit that party?
 *
 * Four of the five map straight onto a `TourType`. `family` is the derived
 * one — see the note at the top of this file.
 */
export function matchesParty(
  tour: { types: TourType[]; difficulty: string },
  party: PartyType,
): boolean {
  if (party === "family") {
    return (
      tour.difficulty !== "challenging" &&
      (tour.types.includes("group") || tour.types.includes("couple"))
    );
  }
  return tour.types.includes(party as TourType);
}
