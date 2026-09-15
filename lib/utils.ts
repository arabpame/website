/**
 * Small shared helpers. Deliberately dependency-free: `cn` here is a plain join
 * rather than clsx plus tailwind-merge, because this build has no conditional
 * class conflicts worth 4 KB of runtime.
 */

export type ClassValue = string | false | null | undefined;

/** Join class names, dropping anything falsy. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/** 1234567 to "1,234,567". Philippine English uses the same grouping. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-PH").format(value);
}

/**
 * Compact form for counters: 1234 to "1.2k". Used only where the exact figure is
 * available elsewhere on the page, never as the only representation of a number.
 */
export function formatCompact(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    const k = value / 1000;
    return `${k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  const m = value / 1_000_000;
  return `${m >= 100 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, "")}m`;
}

/**
 * ISO date to "14 September 2026".
 *
 * Pinned to UTC on purpose. Rendering a date with the server's local timezone
 * produces a different string on the server and in the browser, which React
 * reports as a hydration mismatch and which silently shifts dates by a day for
 * anyone east of UTC. The Philippines is UTC+8, so this matters here.
 */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-PH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** ISO date to "14 Sep 2026", for dense contexts like timelines and tables. */
export function formatDateShort(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-PH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/**
 * Whole days between two ISO dates. Used for "referred 12 days ago", which is the
 * number that makes a transparency dashboard uncomfortable in the right way.
 */
export function daysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(`${fromIso}T00:00:00Z`);
  const b = Date.parse(`${toIso}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/** "3 places left" and "1 place left", without a stray s. */
export function pluralise(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
