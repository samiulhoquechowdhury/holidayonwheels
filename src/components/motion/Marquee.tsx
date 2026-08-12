import { cn } from "@/lib/cn";

type MarqueeProps = {
  /** One pass of the content. It is rendered twice — do not pre-duplicate. */
  children: React.ReactNode;
  /** Seconds for one full pass. Longer is calmer; 40s+ reads as drift. */
  duration?: number;
  reverse?: boolean;
  className?: string;
};

/**
 * An endless strip.
 *
 * The content is rendered twice inside a track that translates by exactly
 * -50%, which puts the seam precisely where the copy repeats — that is the
 * whole trick, and it is why the duplicate is made here rather than by the
 * caller: one copy or three and the loop visibly jumps.
 *
 * CSS rather than GSAP, on purpose. This animation runs for the entire
 * session; handing it to a JavaScript ticker means holding a frame open
 * forever for something the compositor can do alone. Hovering pauses it,
 * because a strip that carries readable words has to be readable.
 *
 * The second copy is `aria-hidden` — a screen reader should hear the eight
 * states once, not twice.
 */
export function Marquee({
  children,
  duration = 44,
  reverse = false,
  className,
}: MarqueeProps) {
  return (
    <div className={cn("u-marquee u-marquee-mask overflow-hidden", className)}>
      <div
        className="u-marquee-track"
        data-reverse={reverse}
        style={{ "--marquee-dur": `${duration}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div aria-hidden="true" className="flex shrink-0 items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
