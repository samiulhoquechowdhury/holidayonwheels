/**
 * Guwahati cafés.
 *
 * ## What is real here, and what is deliberately absent
 *
 * Every name, locality and photograph on this page came from the client's
 * own folder — these are four actual businesses in Guwahati, photographed by
 * the people who run them or by us. That is the whole of what we were given.
 *
 * So that is the whole of what this file holds. There are **no opening
 * hours, no prices, no menus and no ratings**, because none were supplied,
 * and a café listing is exactly the kind of page where inventing them does
 * real damage: somebody drives across Guwahati on a Tuesday evening because
 * a website said "open till 11", and the business wears the complaint. The
 * page says what we know and offers the way to find out the rest.
 *
 * When the details arrive, add the fields here and the cards will carry
 * them. Nothing else has to change.
 *
 * @see MEDIA.md — the photographs are the client's own, under
 * `public/media/cafes/<slug>/`, three widths each.
 */

export type Cafe = {
  slug: string;
  /** The business's own name, as it is written on the door. */
  name: string;
  /** The neighbourhood, which is how people in Guwahati give directions. */
  locality: string;
  /** One line on what the place is. Observed from the photographs only. */
  note: string;
  /** Hero first, then the rest. All under `public/media/cafes/<slug>/`. */
  images: string[];
  alt: string;
};

const cafes: Cafe[] = [
  {
    slug: "11th-avenue-digholipukhuri",
    name: "11th Avenue",
    locality: "Digholipukhuri",
    note: "A terrace café by the tank, with the seating out under the trees and a kitchen that runs well past coffee.",
    images: [
      "/media/cafes/11th-avenue-digholipukhuri/01.webp",
      "/media/cafes/11th-avenue-digholipukhuri/02.webp",
      "/media/cafes/11th-avenue-digholipukhuri/03.webp",
      "/media/cafes/11th-avenue-digholipukhuri/04.webp",
    ],
    alt: "Terrace seating at 11th Avenue, Digholipukhuri, under green trees",
  },
  {
    slug: "brosco-lounge-uzanbazar",
    name: "Brosco Lounge",
    locality: "Uzan Bazar",
    note: "Lit up on its own corner after dark, with window seats upstairs and a bamboo-ceilinged room behind them.",
    images: [
      "/media/cafes/brosco-lounge-uzanbazar/01.webp",
      "/media/cafes/brosco-lounge-uzanbazar/02.webp",
      "/media/cafes/brosco-lounge-uzanbazar/03.webp",
      "/media/cafes/brosco-lounge-uzanbazar/04.webp",
    ],
    alt: "Brosco Lounge in Uzan Bazar, lit against the evening sky",
  },
  {
    slug: "guwahati-heights-ambari",
    name: "Guwahati Heights",
    locality: "Ambari",
    note: "A proper sit-down room off the street in Ambari — pizza, coffee with the leaf drawn on it, and space for a long table.",
    images: [
      "/media/cafes/guwahati-heights-ambari/01.webp",
      "/media/cafes/guwahati-heights-ambari/02.webp",
      "/media/cafes/guwahati-heights-ambari/03.webp",
      "/media/cafes/guwahati-heights-ambari/04.webp",
    ],
    alt: "The street frontage of Guwahati Heights at Ambari",
  },
  {
    slug: "tholgiri-assamese-kitchen",
    name: "Tholgiri",
    locality: "Guwahati",
    note: "Assamese food, served on the cloth, in a room built out of bamboo. The one on this list to send somebody to for lunch.",
    images: [
      "/media/cafes/tholgiri-assamese-kitchen/01.webp",
      "/media/cafes/tholgiri-assamese-kitchen/02.webp",
      "/media/cafes/tholgiri-assamese-kitchen/03.webp",
      "/media/cafes/tholgiri-assamese-kitchen/04.webp",
    ],
    alt: "The bamboo dining hall at Tholgiri, with long tables laid",
  },
];

export function getCafes(): Cafe[] {
  return cafes;
}

export function getCafeBySlug(slug: string): Cafe | undefined {
  return cafes.find((cafe) => cafe.slug === slug);
}
