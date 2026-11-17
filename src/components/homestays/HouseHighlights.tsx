import { Glyph, iconFor } from "./amenity-icons";
import { cn } from "@/lib/cn";
import type { Homestay } from "@/content/types";

/**
 * The three things worth knowing before the description.
 *
 * Every hotel and listing site puts a short block like this between the
 * photographs and the prose, and the reason is structural rather than
 * decorative: the description is written to be *read*, and most people do
 * not read it — they scan for the two or three facts that decide it. Without
 * somewhere for those to live they end up buried in a paragraph, or padded
 * into a specs line the house has not given us the numbers for.
 *
 * ## It is the house's own words, not a template
 *
 * The rows come from `amenities`, which is free text written per house. No
 * sentence is generated here and nothing is inferred: if a row says there is
 * a kitchen, "Kitchen in the house" is in the content. That matters more
 * than usual on these four, where the rooms, rates and occupancy are still
 * unknown — this block is the only place the page can be specific, so it had
 * better be specific about true things.
 *
 * The icons come from `Amenities`' own table rather than a second one, so a
 * kitchen cannot be drawn one way here and another six inches below.
 *
 * Renders nothing for a house with no amenities listed.
 */
export function HouseHighlights({
  stay,
  className,
}: {
  stay: Homestay;
  className?: string;
}) {
  /*
   * Three, from the top of the list.
   *
   * The order in `content/homestays.ts` is editorial — whoever wrote the
   * entry put the thing that makes the house worth staying in first — so
   * this takes the top of that list rather than scoring the strings and
   * second-guessing them.
   */
  const highlights = stay.amenities.slice(0, 3);
  if (highlights.length === 0) return null;

  return (
    <ul
      className={cn(
        "flex flex-col gap-5 border-y border-[var(--ink-hairline)] py-7",
        className,
      )}
    >
      {highlights.map((item) => (
        <li key={item} className="flex items-start gap-4">
          <Glyph name={iconFor(item)} className="mt-0 size-6" />
          <span className="min-w-0 text-16 text-ink">{item}</span>
        </li>
      ))}
    </ul>
  );
}
