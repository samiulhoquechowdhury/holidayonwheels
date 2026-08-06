import Link from "next/link";
import { Media } from "@/components/primitives/Media";
import { Reveal } from "@/components/layout/Reveal";
import { ArrowGlyph } from "@/components/layout/SectionHeader";
import type { TourType } from "@/content/types";
import type { WeaveRegion } from "@/components/layout/weave-motifs";

/**
 * The four ways into the catalogue. Deliberately large and visual — this is
 * the first decision a traveller makes and it should not look like a filter
 * dropdown.
 */

const TILES: {
  type: TourType;
  title: string;
  copy: string;
  alt: string;
  region: WeaveRegion;
}[] = [
  {
    type: "couple",
    title: "For two",
    copy: "Private vehicles, later starts, and rooms worth staying in.",
    alt: "Two travellers on a terrace looking across cloud-filled valleys in the Khasi hills, Meghalaya",
    region: "meghalaya",
  },
  {
    type: "honeymoon",
    title: "Honeymoons",
    copy: "Unhurried, entirely private, and nothing scheduled before nine.",
    alt: "A heritage lodge terrace at Pelling, west Sikkim, facing the Kanchenjunga massif at dawn",
    region: "sikkim",
  },
  {
    type: "group",
    title: "Small groups",
    copy: "Capped numbers, a guide from the state, and a fixed departure list.",
    alt: "A small group of travellers walking a village path between rice terraces in Nagaland",
    region: "nagaland",
  },
  {
    type: "solo",
    title: "Travelling alone",
    copy: "Single rooms as standard, and the supplement waived.",
    alt: "A single traveller on the forest steps descending towards Nongriat, Meghalaya",
    region: "assam",
  },
];

export function TourTypeTiles() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {TILES.map((tile, index) => (
        <li key={tile.type}>
          <Reveal delay={index * 0.06}>
            <Link
              href={`/tours?type=${tile.type}`}
              className="group relative block overflow-hidden rounded-[var(--radius-media)]"
            >
              <Media
                alt={tile.alt}
                seed={`tour-type-${tile.type}`}
                region={tile.region}
                aspect="4/5"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                imageClassName="transition-transform duration-[var(--dur-image)] ease-brand motion-safe:group-hover:scale-105"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[rgb(13_21_18/0.82)] via-[rgb(13_21_18/0.15)] to-transparent"
              />
              <span className="absolute inset-x-0 bottom-0 p-5 text-paper">
                <span className="block font-[family-name:var(--font-display)] text-28 leading-tight">
                  {tile.title}
                </span>
                <span className="mt-2 block text-14 text-[rgb(255_255_255/0.82)]">
                  {tile.copy}
                </span>
                <span className="mt-4 inline-flex items-center gap-2 text-14">
                  Browse
                  <ArrowGlyph className="transition-transform duration-[var(--dur-micro)] ease-brand motion-safe:group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
