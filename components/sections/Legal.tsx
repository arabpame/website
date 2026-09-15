import type { ReactNode } from "react";

/**
 * Shared layout for the privacy, terms and accessibility pages.
 *
 * One component rather than three near-identical page bodies, so the reading
 * measure, the heading rhythm and the "last reviewed" line cannot drift apart.
 */

export function LegalBody({ children }: { children: ReactNode }) {
  return (
    <section className="section">
      <div className="container">
        <div className="max-w-prose space-y-10">{children}</div>
      </div>
    </section>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-display-md">{heading}</h2>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-brand-ink/75">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: (string | ReactNode)[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-brand-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LastReviewed({ date }: { date: string }) {
  return (
    <p className="rounded-xl border border-brand-line bg-brand-paper px-4 py-3 font-data text-xs text-brand-ink/60">
      Last reviewed {date}
    </p>
  );
}
