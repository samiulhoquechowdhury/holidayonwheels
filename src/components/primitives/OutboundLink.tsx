import { cn } from "@/lib/cn";
import { OUTBOUND_LINK_PROPS } from "@/config/external";

/**
 * A link that leaves the site. Always carries `target="_blank"` with
 * `rel="noopener noreferrer"`, always shows the outbound glyph, and always
 * announces the new tab to screen readers.
 *
 * Used for rentals (beepdrive.com) and social links. Never used for internal
 * navigation — that is `next/link`.
 */
export function OutboundLink({
  href,
  children,
  className,
  showIndicator = true,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  showIndicator?: boolean;
}) {
  return (
    <a
      href={href}
      {...OUTBOUND_LINK_PROPS}
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      {children}
      {showIndicator ? <OutboundGlyph /> : null}
      <span className="u-sr-only">(opens in a new tab)</span>
    </a>
  );
}

export function OutboundGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 12 12"
      className={cn("inline-block h-[0.7em] w-[0.7em] shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
    >
      <path d="M4 1.5h6.5V8" />
      <path d="M10.5 1.5 4.2 7.8" />
      <path d="M8 10.5H1.5V4" />
    </svg>
  );
}
