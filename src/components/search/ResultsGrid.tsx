import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { ButtonLink } from "@/components/primitives/Button";

/** Result grid and the empty state that goes with it. */
export function ResultsGrid({
  children,
  count,
  className,
}: {
  children: React.ReactNode;
  count: number;
  className?: string;
}) {
  if (count === 0) return null;

  return (
    <ul
      className={cn(
        "grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {children}
    </ul>
  );
}

/**
 * The empty state. Deliberately not a shrug — it offers the two things that
 * actually resolve it: clearing the filters, or asking us to build it.
 */
export function EmptyResults({
  onClear,
  what = "trips",
}: {
  onClear?: () => void;
  what?: string;
}) {
  return (
    <div className="border-t border-[var(--ink-hairline)] py-16 text-center">
      <Eyebrow>Nothing matches</Eyebrow>
      <p className="mx-auto mt-5 max-w-md text-22">
        No {what} match every filter you have set.
      </p>
      <p className="mx-auto mt-4 max-w-md text-16 text-ink-soft">
        Loosen one of them, or tell us what you had in mind — most of what we
        run started as somebody asking for something that was not on the site.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-12 items-center rounded-[var(--radius-control)] border border-[var(--ink-hairline-strong)] px-6 text-16 transition-colors hover:border-ink"
          >
            Clear all filters
          </button>
        ) : null}
        <ButtonLink href="/contact" variant="primary">
          Ask us to build it
        </ButtonLink>
      </div>
    </div>
  );
}
