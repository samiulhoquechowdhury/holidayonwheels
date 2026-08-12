import { cn } from "@/lib/cn";

/**
 * The one-word swap.
 *
 * A headline on this site is set in Fraunces, upright, and exactly one word
 * in it is set in Instrument Serif italic. That single substitution is the
 * whole identity: it is what a reader registers as "this was designed" before
 * they have read the sentence, and it costs nothing but restraint.
 *
 * Rules, and they are rules rather than preferences:
 *
 *  - **One per headline.** Two accents in a line cancel each other out and
 *    the sentence starts reading as a ransom note.
 *  - **Never the first or last word.** The swap has to be surrounded by the
 *    upright face to register as a swap rather than as a different headline.
 *  - **Never a function word.** Accent the noun the sentence is about — the
 *    place, the thing being sold. "Eight *states*", not "*Eight* states".
 *  - **Never on a label, a button or a price.** It is display only; at 14px
 *    the contrast collapses and it just looks like a font failed to load.
 */
export function Accent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <em className={cn("u-accent", className)}>{children}</em>;
}

/**
 * The other half of the same idea: one word in fired terracotta, upright, in
 * the display face.
 *
 * Used where a line already carries an italic accent and needs a second point
 * of emphasis, or where the emphasised word is a figure — italic numerals in
 * a high-contrast serif are close to unreadable at a glance, and a price is
 * the one thing on the page that must never be squinted at.
 *
 * `--ember-ink` on paper and `--ember-glow` on the dark band; both are the
 * darkened/lifted steps that clear AA, not the raw accent.
 */
export function Ember({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("u-ember-word", className)}>{children}</span>;
}
