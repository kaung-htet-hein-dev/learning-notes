"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import type { EntrySummary } from "@/lib/entries";
import { formatDate, formatMonth } from "@/lib/format";
import { notePath } from "@/lib/site";

/** Case-insensitive match on title or any tag; an empty query matches everything. */
function filterEntries(entries: EntrySummary[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter(
    (e) => e.title.toLowerCase().includes(q) || e.tags.some((tag) => tag.toLowerCase().includes(q)),
  );
}

function groupByMonth(entries: EntrySummary[]) {
  const groups: { label: string; entries: EntrySummary[] }[] = [];
  for (const entry of entries) {
    const label = formatMonth(entry.read_at);
    const last = groups.at(-1);
    if (last?.label === label) last.entries.push(entry);
    else groups.push({ label, entries: [entry] });
  }
  return groups;
}

// Native <dialog> + showModal(): focus trap, Esc to close and inert background come free.
export function NotesDrawer({ entries, currentSlug }: { entries: EntrySummary[]; currentSlug: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const titleId = useId();

  const groups = useMemo(() => groupByMonth(filterEntries(entries, query)), [entries, query]);

  function open() {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    dialog.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "center" });
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2.5 text-base text-muted transition-colors duration-150 hover:text-fg"
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 4h14M2 9h14M2 14h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        All notes
        <span className="tabular-nums text-muted/70">{entries.length}</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        // Clicking the backdrop lands on the <dialog> itself, not its panel.
        onClick={(e) => e.target === e.currentTarget && close()}
        onClose={() => setQuery("")}
        className="notes-drawer"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-6 py-5">
            <h2 id={titleId} className="font-serif text-2xl font-bold tracking-tight">
              All notes
            </h2>
            <button
              type="button"
              onClick={close}
              className="-mr-2 rounded p-2 text-muted transition-colors duration-150 hover:text-fg"
            >
              <span className="sr-only">Close</span>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="border-b px-6 py-4">
            <label htmlFor={`${titleId}-filter`} className="sr-only">
              Filter notes by title or tag
            </label>
            <input
              id={`${titleId}-filter`}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by title or tag"
              autoComplete="off"
              className="w-full rounded-md border bg-bg px-3.5 py-2.5 text-base text-fg placeholder:text-muted/70 focus:border-muted focus:outline-none"
            />
          </div>

          <nav aria-label="All notes" className="flex-1 overflow-y-auto overscroll-contain px-6 pb-10">
            {groups.length === 0 ? (
              <p className="pt-8 text-base text-muted">No notes match “{query.trim()}”.</p>
            ) : (
              groups.map((group) => (
                <section key={group.label} className="pt-7">
                  <h3 className="text-sm font-medium text-muted">{group.label}</h3>
                  <ul className="mt-2">
                    {group.entries.map((entry) => {
                      const current = entry.slug === currentSlug;
                      return (
                        <li key={entry.slug}>
                          <Link
                            href={notePath(entry.slug)}
                            onClick={close}
                            aria-current={current ? "page" : undefined}
                            className={`-mx-3 block rounded-md border-l-2 px-3 py-2.5 transition-colors duration-150 ${
                              current
                                ? "border-l-fg bg-surface"
                                : "border-l-transparent hover:bg-surface"
                            }`}
                          >
                            <span className="block text-[17px] font-semibold leading-snug">
                              {entry.title}
                            </span>
                            <time dateTime={entry.read_at} className="mt-1 block text-sm text-muted">
                              {formatDate(entry.read_at)}
                            </time>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))
            )}
          </nav>
        </div>
      </dialog>
    </>
  );
}
