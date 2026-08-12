import { cn } from "@/lib/cn";

/**
 * The one arrow in the system. Round caps and a light stroke.
 *
 * Lives in its own module rather than beside the buttons because both the
 * server-rendered controls (`LuxeButton`) and the client ones (`Button`) draw
 * it, and importing it from the client module would pull Framer Motion into
 * the bundle of every server component that only wanted an arrow.
 */
export function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 10"
      className={cn("h-2.5 w-4 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M0.5 5h14M10.5 1l4 4-4 4" />
    </svg>
  );
}
