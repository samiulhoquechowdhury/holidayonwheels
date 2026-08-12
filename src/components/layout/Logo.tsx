import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * The wordmark, and the single place the brand mark is decided.
 *
 * The supplied artwork is black letterforms with white detail *inside* them.
 * On a light ground it needs nothing; on a dark one it needs an opaque light
 * sheet under it or the internal detail vanishes and the letterforms go with
 * it. That is what `surface` decides, and it is why the footer looks
 * different from the header.
 *
 * `tone` only affects the typographic fallback, which is drawn in
 * `currentColor`.
 *
 * To swap the mark: replace `public/brand/logo.png` and update the intrinsic
 * dimensions in `config/site.ts`. No other file references it.
 */
export function Logo({
  tone = "ink",
  surface = "bare",
  className,
}: {
  tone?: "ink" | "paper";
  /** `plate` mounts the mark on an opaque sheet. Required on dark grounds. */
  surface?: "bare" | "plate";
  className?: string;
}) {
  if (site.logo.enabled) {
    return (
      <Link
        href="/"
        aria-label={`${site.name} — home`}
        className={cn(
          "inline-flex shrink-0 items-center",
          "h-[var(--plate-h)] transition-[height] duration-[var(--dur)] ease-brand",
          surface === "plate" ? "u-plate px-4 md:px-5" : "pr-2",
          className,
        )}
      >
        <Image
          src={site.logo.src}
          alt={site.logo.alt}
          width={site.logo.width}
          height={site.logo.height}
          // The header mark is in the first viewport on every route, so it is
          // fetched eagerly. It is small enough not to compete with the hero
          // poster for the LCP slot.
          priority
          sizes="140px"
          className="h-7 w-auto md:h-8"
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={cn(
        "inline-flex shrink-0 items-center gap-3",
        tone === "paper" ? "text-night-text" : "text-ink",
        className,
      )}
    >
      <WheelGlyph />
      <span className="font-display text-22 leading-none tracking-[-0.015em]">
        Holidays <span className="opacity-50">on</span> Wheels
      </span>
    </Link>
  );
}

/**
 * Placeholder mark: a wheel drawn as a woven rosette, so the fallback still
 * belongs to the design language rather than looking like missing art.
 */
function WheelGlyph() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 32 32"
      className="h-7 w-7 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
    >
      <circle cx="16" cy="16" r="12.5" />
      <circle cx="16" cy="16" r="4" />
      <path d="M16 3.5v8M16 20.5v8M3.5 16h8M20.5 16h8" />
      <path
        d="M7.2 7.2 12 12M20 20l4.8 4.8M24.8 7.2 20 12M12 20l-4.8 4.8"
        opacity="0.45"
      />
    </svg>
  );
}
