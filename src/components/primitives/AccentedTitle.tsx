import { Accent } from "./Accent";

/**
 * Splits a title once around a single word and sets that word in the accent
 * italic.
 *
 * This exists so `PageHero` and `SectionHeader` cannot drift: the one-word
 * swap is the brand's signature, and two implementations of it would end up
 * accenting differently within a month.
 *
 * Word-boundary matched, so accenting "river" does not italicise the middle of
 * "riverbank". Falls through to the plain title when the word is absent, which
 * keeps a typo in a content file from taking a page down — a missing accent is
 * a missed flourish, not a broken heading.
 *
 * Only the *first* occurrence is swapped, and deliberately so. Accenting every
 * "eight" in a sentence is how the device stops meaning anything.
 */
export function AccentedTitle({
  title,
  accent,
}: {
  title: string;
  accent?: string;
}) {
  if (!accent) return <>{title}</>;

  const escaped = accent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`\\b${escaped}\\b`).exec(title);
  if (!match) return <>{title}</>;

  return (
    <>
      {title.slice(0, match.index)}
      <Accent>{match[0]}</Accent>
      {title.slice(match.index + match[0].length)}
    </>
  );
}
