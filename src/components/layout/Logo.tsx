import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * The wordmark, and the single place the brand mark is decided.
 *
 * Save the supplied logo at `public/brand/logo.svg`, set `site.logo.enabled`
 * to true, and it replaces the typographic fallback everywhere at once. No
 * other file references the logo.
 */
export function Logo({
  tone = "ink",
  className,
}: {
  tone?: "ink" | "paper";
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} — home`}
      className={cn(
        "inline-flex items-center gap-2.5",
        tone === "paper" ? "text-paper" : "text-ink",
        className,
      )}
    >
      {site.logo.enabled ? (
        <Image
          src={site.logo.src}
          alt={site.logo.alt}
          width={site.logo.width}
          height={site.logo.height}
          priority
          className="h-7 w-auto"
        />
      ) : (
        <>
          <WheelGlyph />
          <span className="font-display text-22 leading-none tracking-[-0.02em]">
            Holidays{" "}
            {/* Roman, not italic — the italic Newsreader is a whole extra
                font file and this was the only thing using it. */}
            <span className="opacity-55">on</span> Wheels
          </span>
        </>
      )}
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
      strokeWidth="1.4"
    >
      <circle cx="16" cy="16" r="12.5" />
      <circle cx="16" cy="16" r="4" />
      <path d="M16 3.5v8M16 20.5v8M3.5 16h8M20.5 16h8" />
      <path
        d="M7.2 7.2 12 12M20 20l4.8 4.8M24.8 7.2 20 12M12 20l-4.8 4.8"
        opacity="0.5"
      />
    </svg>
  );
}
