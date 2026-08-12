import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The type scale, exactly as exposed to Tailwind in globals.css.
 *
 * tailwind-merge has to be told about it, and the consequence of not telling
 * it is not cosmetic. `text-18` is not a font size tailwind-merge recognises,
 * so it files it under *text colour* — and then, resolving what it believes
 * is a conflict, it silently deletes the real colour class that came before
 * it. `cn("text-paper", "text-18")` returned `"text-18"`, which is how the
 * primary button ended up rendering ink type on an ink fill: the label was
 * there, at full opacity, in exactly the colour of the thing behind it.
 *
 * Any size added to `@theme` in globals.css must be added here in the same
 * commit. That coupling is the cost of a custom scale, and it is cheaper than
 * the class of bug above, which is invisible in code review and only shows up
 * as "why is that button empty".
 */
const TEXT_SIZES = [
  "12",
  "14",
  "16",
  "18",
  "22",
  "28",
  "36",
  "48",
  "64",
  "88",
  "120",
  "160",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...TEXT_SIZES] }],
    },
  },
});

/** Conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
