"use client";

import { useState, useTransition } from "react";

/**
 * The office's own notes on a record.
 *
 * **Saved on an explicit button, not on blur or a debounce.** Autosave is
 * nicer right up to the moment it is not: these notes are what somebody wrote
 * about a phone call, and a debounce that fires mid-sentence while the
 * connection drops loses the half they had typed without ever saying so. A
 * button means the operator knows whether it is saved, and the label says
 * which state it is in.
 */
export function NotesBox({
  id,
  initial,
  onSave,
}: {
  id: string;
  initial: string;
  onSave: (id: string, notes: string) => Promise<void>;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(true);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <label htmlFor={`notes-${id}`} className="u-label block text-ink-faint">
        Office notes
      </label>
      <textarea
        id={`notes-${id}`}
        rows={3}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setSaved(false);
        }}
        className="mt-2 w-full rounded-[var(--radius-input)] border border-[var(--ink-hairline)] bg-paper px-3 py-2 text-16 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          disabled={pending || saved}
          onClick={() =>
            startTransition(async () => {
              await onSave(id, value);
              setSaved(true);
            })
          }
          className="u-label min-h-9 rounded-full border border-[var(--ink-hairline-strong)] px-4 text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
        >
          {pending ? "Saving…" : saved ? "Saved" : "Save notes"}
        </button>
        {!saved && !pending ? (
          <span className="u-label text-clay-ink">Unsaved</span>
        ) : null}
      </div>
    </div>
  );
}
