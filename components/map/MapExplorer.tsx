"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getShapes, project, VIEW_BOX } from "@/lib/map";
import { CATEGORY_META, CATEGORY_ORDER, STATUS_META, STATUS_ORDER } from "@/lib/taxonomy";
import { CaseChip } from "@/components/ui/CaseChip";
import { CategoryIcon } from "@/components/ui/Primitives";
import { cn, formatDateShort } from "@/lib/utils";
import type { CaseCategory, CaseStatus, EarthCase } from "@/lib/types";

/**
 * The interactive EARTH Map.
 *
 * Filtering by the seven category layers and the six case states, with a selected
 * case detail card. All client-side over data the server already sent, so a filter
 * change costs nothing and works offline.
 *
 * The shapes are computed once with useMemo. There are 457 of them, and rebuilding
 * that array on every filter toggle would be the one thing in this component
 * capable of feeling slow.
 */

export function MapExplorer({ cases }: { cases: EarthCase[] }) {
  const shapes = useMemo(() => getShapes("full"), []);

  const [categories, setCategories] = useState<Set<CaseCategory>>(new Set(CATEGORY_ORDER));
  const [statuses, setStatuses] = useState<Set<CaseStatus>>(new Set(STATUS_ORDER));
  const [selected, setSelected] = useState<string | null>(null);

  const visible = useMemo(
    () => cases.filter((c) => categories.has(c.category) && statuses.has(c.status)),
    [cases, categories, statuses],
  );

  const selectedCase = visible.find((c) => c.caseNumber === selected) ?? null;

  function toggleCategory(key: CaseCategory) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      // Never allow an empty map with no explanation. An empty selection reads as
      // a broken page, so clearing the last one restores all of them.
      return next.size === 0 ? new Set(CATEGORY_ORDER) : next;
    });
  }

  function toggleStatus(key: CaseStatus) {
    setStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next.size === 0 ? new Set(STATUS_ORDER) : next;
    });
  }

  const allOn = categories.size === CATEGORY_ORDER.length && statuses.size === STATUS_ORDER.length;

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      {/* Filters */}
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <div className="rounded-2xl border border-brand-line bg-brand-surface p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <p className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-primary">
                Category layers
              </p>
              {!allOn ? (
                <button
                  type="button"
                  onClick={() => {
                    setCategories(new Set(CATEGORY_ORDER));
                    setStatuses(new Set(STATUS_ORDER));
                  }}
                  className="text-xs font-semibold text-brand-primary underline underline-offset-2"
                >
                  Reset
                </button>
              ) : null}
            </div>

            <ul className="mt-4 space-y-1.5">
              {CATEGORY_ORDER.map((key) => {
                const meta = CATEGORY_META[key];
                const count = cases.filter((c) => c.category === key).length;
                const on = categories.has(key);
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => toggleCategory(key)}
                      aria-pressed={on}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-200",
                        on
                          ? "border-brand-line bg-brand-paper"
                          : "border-transparent bg-transparent opacity-45 hover:opacity-70",
                      )}
                    >
                      <span aria-hidden="true" className={cn("h-2.5 w-2.5 shrink-0 rounded-full", meta.dotClass)} />
                      <span className={meta.textClass}>
                        <CategoryIcon category={key} className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-sm font-medium text-brand-ink">{meta.label}</span>
                      <span className="font-data text-xs text-brand-ink/65">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mt-6 font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-primary">
              Case status
            </p>
            <ul className="mt-4 space-y-1.5">
              {STATUS_ORDER.map((key) => {
                const meta = STATUS_META[key];
                const count = cases.filter((c) => c.status === key).length;
                const on = statuses.has(key);
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => toggleStatus(key)}
                      aria-pressed={on}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-200",
                        on
                          ? "border-brand-line bg-brand-paper"
                          : "border-transparent bg-transparent opacity-45 hover:opacity-70",
                      )}
                    >
                      <span aria-hidden="true" className={cn("h-2.5 w-2.5 shrink-0 rounded-full", meta.dotClass)} />
                      <span className="flex-1 text-sm font-medium text-brand-ink">{meta.label}</span>
                      <span className="font-data text-xs text-brand-ink/65">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <p aria-live="polite" className="mt-4 text-sm text-brand-ink/65">
            Showing <span className="font-data font-semibold text-brand-deep">{visible.length}</span> of{" "}
            {cases.length} cases.
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="lg:col-span-8">
        <div className="on-ink relative overflow-hidden rounded-3xl bg-brand-ink p-4 shadow-lift sm:p-6">
          <div aria-hidden="true" className="field-grid absolute inset-0 opacity-50" />

          <svg
            viewBox={VIEW_BOX}
            className="relative mx-auto h-auto w-full max-w-md"
            role="img"
            aria-label={`Map of the Philippines showing ${visible.length} environmental cases matching the current filters.`}
          >
            <g aria-hidden="true">
              {shapes.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  className="fill-brand-deep/70 stroke-brand-signal/20"
                  strokeWidth={0.5}
                  strokeLinejoin="round"
                />
              ))}
            </g>

            <g>
              {visible.map((c) => {
                const { x, y } = project(c.lat, c.lng);
                const meta = CATEGORY_META[c.category];
                const isSelected = selected === c.caseNumber;
                return (
                  <g key={c.caseNumber}>
                    {/* A generous invisible hit area. The visible pin is 4.5 units,
                        which is far below any reasonable touch target. */}
                    <circle
                      cx={x}
                      cy={y}
                      r={13}
                      fill="transparent"
                      className="cursor-pointer"
                      onClick={() => setSelected(isSelected ? null : c.caseNumber)}
                    />
                    {isSelected ? (
                      <circle cx={x} cy={y} r={9} fill="none" stroke="#C2F24D" strokeWidth={1.6} />
                    ) : null}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 6 : 4.5}
                      fill={meta.hex}
                      stroke="#07231E"
                      strokeWidth={1.4}
                      className="pointer-events-none transition-all duration-200"
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          {/* The case detail card for the selected pin. */}
          {selectedCase ? (
            <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-snug text-brand-paper">{selectedCase.title}</p>
                  <p className="mt-1 text-xs text-brand-paper/60">
                    {[selectedCase.barangay, selectedCase.municipality, selectedCase.province].filter(Boolean).join(", ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-paper/60 transition-colors hover:bg-white/10 hover:text-brand-paper"
                >
                  <span className="sr-only">Close case detail</span>
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>
              <CaseChip caseNumber={selectedCase.caseNumber} status={selectedCase.status} onInk className="mt-3" />
              <p className="mt-3 text-xs leading-relaxed text-brand-paper/70">{selectedCase.summary}</p>
              <Link
                href={`/cases/${selectedCase.slug}`}
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-signal hover:text-brand-signal-400"
              >
                Open the full case
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </div>
          ) : (
            <p className="relative mt-4 text-center text-xs text-brand-paper/60">
              Select a pin to see the case. Every pin is a real, numbered, trackable case.
            </p>
          )}
        </div>

        {/*
          The accessible equivalent of the map. Pins inside an SVG are effectively
          unreachable by keyboard and screen reader, so the same data is published
          here as a real list. This is not a fallback, it is the primary
          representation for anyone not using a mouse.
        */}
        <div className="mt-6">
          <h2 className="text-sm font-bold text-brand-deep">
            The {visible.length} cases currently shown
          </h2>
          <p className="mt-1 text-xs text-brand-ink/70">
            The same data as the map above, as a list, so it is reachable by keyboard and by screen
            reader.
          </p>
          <ul className="mt-4 divide-y divide-brand-line overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
            {visible.map((c) => (
              <li key={c.caseNumber}>
                <Link
                  href={`/cases/${c.slug}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-brand-paper"
                >
                  <span className={CATEGORY_META[c.category].textClass}>
                    <CategoryIcon category={c.category} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-brand-deep">{c.title}</span>
                    <span className="block text-xs text-brand-ink/65">
                      {c.municipality}, {c.province} · {formatDateShort(c.reportedOn)}
                    </span>
                  </span>
                  <CaseChip caseNumber={c.caseNumber} status={c.status} />
                </Link>
              </li>
            ))}
            {visible.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-brand-ink/70">
                No cases match these filters.
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
