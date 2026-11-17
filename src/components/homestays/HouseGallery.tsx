import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The house, photographed — the listing-site mosaic.
 *
 * One large frame on the left and the rest beside it in a block, hairline
 * gaps, rounded on the outside corners only so the whole thing reads as one
 * object rather than four cards. It is the arrangement the reference uses
 * and it answers two questions in the space a single hero answers one: what
 * the place looks like, and how much more there is to see.
 *
 * ## Every photograph is on screen, which is the point
 *
 * This went through two worse versions first. A wide frame with
 * `object-cover` cropped the client's portrait phone photographs down to a
 * band across the middle of a wall. `object-contain` then showed each one
 * whole but small, stranded between bars that no amount of blurred fill
 * made look deliberate.
 *
 * Both were attempts to show *one* picture at a time well. The mosaic does
 * not have the problem: all four are visible at once, so none of them has to
 * carry the page alone and a modest crop on each is no longer a loss. Cells
 * are near-square, which is the shape that treats 3:4 portrait and 4:3
 * landscape sources — this set has both — about equally.
 *
 * ## The four-cell arrangement
 *
 * Four is what the client supplies per house, and a 2×2 grid of equals has
 * no focal point while a big-plus-three column leaves a wide short cell that
 * suits nothing. So: big left across both rows, two square cells top right,
 * one wide cell beneath them. It is balanced, it uses every photograph, and
 * it degrades — three images drop the wide cell, five fill a 2×2.
 *
 * No lightbox and nothing to click. With every photograph already visible
 * there is nothing a viewer would open, and a second viewer is a focus trap,
 * an escape key and a scroll lock to get right for no gain.
 */
export function HouseGallery({
  images,
  alt,
  className,
}: {
  /** The hero first, then the rest. At least one. */
  images: string[];
  alt: string;
  className?: string;
}) {
  const frames = images.filter(Boolean);
  if (frames.length === 0) return null;

  const [hero, ...rest] = frames;

  /* One photograph is a photograph, not a mosaic. */
  if (rest.length === 0) {
    return (
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden rounded-[var(--radius-media)] bg-shell",
          className,
        )}
      >
        <Image
          src={hero}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        /*
         * 2 columns on a phone, 4 at `md`. The container owns the aspect so
         * the cells cannot drift: at 2:1 the left cell comes out near-square
         * and the right-hand ones a little under, which is the proportion
         * the reference uses.
         */
        "grid aspect-[4/3] grid-cols-2 grid-rows-3 gap-2",
        "overflow-hidden rounded-[var(--radius-media)]",
        "md:aspect-[2/1] md:grid-cols-4 md:grid-rows-2",
        className,
      )}
    >
      {/* --- The large one, left -------------------------------------- */}
      <Cell
        src={hero}
        alt={alt}
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="col-span-2 row-span-2 md:row-span-2"
      />

      {/* --- The rest ------------------------------------------------- */}
      {rest.slice(0, 3).map((src, i) => (
        <Cell
          key={src}
          src={src}
          alt=""
          sizes="(max-width: 768px) 50vw, 25vw"
          className={cn(
            /*
             * The third of them takes both right-hand columns, which is what
             * turns an awkward empty cell into a deliberate wide one. With
             * only two photographs beside the hero it simply does not exist.
             */
            i === 2 && "col-span-2",
          )}
        />
      ))}
    </div>
  );
}

/**
 * One cell. No rounding of its own — the grid clips the outer corners, so
 * the inner edges stay square and the four read as a single block.
 */
function Cell({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-shell", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}
