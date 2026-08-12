"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Button } from "@/components/primitives/Button";
import { Eyebrow } from "@/components/primitives/Eyebrow";
import { EASE, DUR_MICRO, stickySpring } from "@/lib/motion";

/**
 * Filters. A sidebar on desktop, a bottom sheet on mobile.
 *
 * The same `FilterGroup` markup renders in both, so a filter added to a page
 * appears in both surfaces automatically. Filter state is owned by the page,
 * not by this component — index pages need it for the result count and the
 * empty state.
 */

export type FilterOption = {
  value: string;
  label: string;
  /** Result count for this option, shown alongside the label. */
  count?: number;
};

export type FilterGroupDef = {
  id: string;
  label: string;
  options: FilterOption[];
  /** Radio behaviour rather than checkbox. */
  single?: boolean;
};

export type FilterState = Record<string, string[]>;

export function FilterRail({
  groups,
  state,
  onChange,
  onClear,
  resultCount,
  className,
}: {
  groups: FilterGroupDef[];
  state: FilterState;
  onChange: (groupId: string, value: string) => void;
  onClear: () => void;
  resultCount: number;
  className?: string;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const reduced = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);

  const activeCount = Object.values(state).reduce(
    (sum, values) => sum + values.length,
    0,
  );

  // Escape closes the sheet, and the page cannot scroll behind it.
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const body = (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <FilterGroup
          key={group.id}
          group={group}
          selected={state[group.id] ?? []}
          onChange={onChange}
        />
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside aria-label="Filters" className={cn("hidden lg:block", className)}>
        <div className="sticky top-[calc(var(--header-h)+2rem)]">
          <div className="mb-6 flex items-baseline justify-between gap-3">
            <Eyebrow>
              {resultCount} {resultCount === 1 ? "result" : "results"}
            </Eyebrow>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={onClear}
                className="u-label min-h-11 text-sage-ink underline underline-offset-4"
              >
                Clear all
              </button>
            ) : null}
          </div>
          {body}
        </div>
      </aside>

      {/* Mobile trigger */}
      <div className="lg:hidden">
        <Button
          variant="secondary"
          size="md"
          block
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
        >
          Filter and sort
          {activeCount > 0 ? (
            <span className="u-num ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-12 text-paper">
              {activeCount}
            </span>
          ) : null}
        </Button>
      </div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {sheetOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR_MICRO, ease: EASE }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-50 bg-[rgb(42_38_33/0.5)] lg:hidden"
            />
            <motion.div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              data-motion="sheet"
              initial={reduced ? { opacity: 0 } : { y: "100%" }}
              animate={reduced ? { opacity: 1 } : { y: 0 }}
              exit={reduced ? { opacity: 0 } : { y: "100%" }}
              transition={reduced ? { duration: DUR_MICRO } : stickySpring}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-[var(--radius-panel)] bg-paper lg:hidden"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[var(--ink-hairline)] px-5 py-4">
                <h2 className="text-22">Filters</h2>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close filters"
                  className="inline-flex h-11 w-11 items-center justify-center"
                >
                  <CloseGlyph />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6">{body}</div>

              <div
                className="flex gap-3 border-t border-[var(--ink-hairline)] px-5 py-4"
                style={{
                  paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
                }}
              >
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onClear}
                  disabled={activeCount === 0}
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  block
                  onClick={() => setSheetOpen(false)}
                >
                  Show {resultCount} {resultCount === 1 ? "result" : "results"}
                </Button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function FilterGroup({
  group,
  selected,
  onChange,
}: {
  group: FilterGroupDef;
  selected: string[];
  onChange: (groupId: string, value: string) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="u-label mb-3 text-ink-soft">{group.label}</legend>
      <ul className="flex flex-col">
        {group.options.map((option) => {
          const checked = selected.includes(option.value);
          const id = `${group.id}-${option.value}`;
          return (
            <li key={option.value}>
              <label
                htmlFor={id}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-3 py-1",
                  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sage",
                )}
              >
                <input
                  id={id}
                  type={group.single ? "radio" : "checkbox"}
                  name={group.id}
                  value={option.value}
                  checked={checked}
                  onChange={() => onChange(group.id, option.value)}
                  className="u-sr-only"
                />
                <Indicator checked={checked} round={group.single} />
                <span className="flex-1 text-16">{option.label}</span>
                {typeof option.count === "number" ? (
                  <span className="u-num text-12 text-ink-faint">
                    {option.count}
                  </span>
                ) : null}
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

function Indicator({ checked, round }: { checked: boolean; round?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center border",
        round ? "rounded-full" : "rounded-[2px]",
        checked
          ? "border-ink bg-ink text-paper"
          : "border-[var(--ink-hairline-strong)]",
      )}
    >
      {checked ? (
        round ? (
          <span className="h-1.5 w-1.5 rounded-full bg-paper" />
        ) : (
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
            <path
              d="M3 8.5 6.5 12 13 4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
            />
          </svg>
        )
      ) : null}
    </span>
  );
}

function CloseGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2 2 14 14M14 2 2 14" />
    </svg>
  );
}
