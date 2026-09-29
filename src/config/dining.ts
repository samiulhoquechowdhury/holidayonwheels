import { shot } from "./showcase";

/**
 * What we put on the table.
 *
 * Four, not ten. A dining list long enough to browse turns into a restaurant
 * directory, which is not what this is: these are arranged as part of a trip,
 * on a night we are already somewhere, and the useful question is "which kind
 * of evening" rather than "which venue".
 *
 * **Prices and menus are placeholders and need the client's sign-off.** The
 * evenings themselves are the kind of thing the region actually supports — a
 * long table on a tea-estate lawn, a chef's table in a heritage bungalow, the
 * Guwahati market followed by the kitchen it feeds — but the per-person
 * figures are invented and a price is a promise.
 *
 * **The photography is the weak part and is logged in MEDIA.md.** The mock
 * pool has no restaurant or café interiors in it at all, so the four frames
 * here are the closest honest stand-ins: two plated dishes, a market, and a
 * group eating outdoors at dusk. None of them is a Northeast Indian dining
 * room, and this is a section whose entire job is to show one.
 */

export type DiningExperience = {
  id: string;
  /** What kind of evening it is, in two or three words. */
  kind: string;
  name: string;
  /** One line. The card carries nothing else. */
  copy: string;
  where: string;
  /** Per person, in rupees. Placeholder. */
  fromPrice: number;
  image: string;
  alt: string;
};

export const diningExperiences: DiningExperience[] = [
  {
    id: "alfresco",
    kind: "The long table",
    name: "The alfresco grand dinner",
    copy: "One table for the whole party on a tea-estate lawn, laid at dusk and lit by lamp. Five courses, and nobody gets up until the last one.",
    where: "Jorhat, Assam",
    fromPrice: 4200,
    image: shot("1478131143081-80f7f84ca84d"),
    alt: "A group gathered around a fire at a long outdoor table at dusk",
  },
  {
    id: "private",
    kind: "Exclusive dinner",
    name: "A chef's table, privately",
    copy: "The dining room of a planter's bungalow, yours for the evening, cooked in front of you.",
    where: "Shillong, Meghalaya",
    fromPrice: 6500,
    image: shot("1601050690597-df0568f70950"),
    alt: "Plated savouries with chutneys on a wooden board",
  },
  {
    id: "market",
    kind: "Café and market",
    name: "The market, then the kitchen",
    copy: "An hour through Fancy Bazaar with the cook, then lunch made from whatever was good that morning.",
    where: "Guwahati, Assam",
    fromPrice: 2400,
    image: shot("1533900298318-6b8da08a523e"),
    alt: "A covered market in full swing, produce stacked in crates",
  },
  {
    id: "thali",
    kind: "The everyday one",
    name: "An Assamese thali, properly",
    copy: "Khar, tenga, a river fish and four things you will not have eaten before. The meal the region eats at home.",
    where: "Across the eight states",
    fromPrice: 900,
    image: shot("1567337710282-00832b415979"),
    alt: "An Assamese thali of curries and bread on a steel platter",
  },
];
