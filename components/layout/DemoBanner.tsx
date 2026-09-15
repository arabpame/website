import { DEMO_NOTICE, IS_DEMO } from "@/lib/constants";

/**
 * The sample-data notice.
 *
 * This is not a nicety. Every case, count and organisation on this site is
 * invented for the design build, and an environmental transparency dashboard
 * showing fabricated resolved-case figures is exactly the kind of thing that
 * destroys credibility if anyone mistakes it for a real record. Judges, sponsors
 * and LGU staff will all see these screens.
 *
 * It is driven by IS_DEMO in lib/constants.ts, which is a constant rather than an
 * environment variable on purpose: turning it off should require an intentional
 * code change when real data arrives, not a setting anyone can flip.
 *
 * scripts/qa-check.mjs fails the build if IS_DEMO is true and this banner is not
 * mounted in the root layout.
 */
export function DemoBanner() {
  if (!IS_DEMO) return null;

  return (
    <div className="border-b border-brand-signal-600/30 bg-brand-signal/[0.18]">
      <div className="container flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 py-2 text-center">
        <span className="inline-flex items-center gap-1.5 font-data text-[0.6875rem] font-semibold uppercase tracking-eyebrow text-brand-deep">
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M8 1.5 1.5 13.5h13L8 1.5ZM8 6v3.2M8 11.4h.01" />
          </svg>
          {DEMO_NOTICE.short}
        </span>
        <span className="text-xs leading-snug text-brand-deep/85">{DEMO_NOTICE.long}</span>
      </div>
    </div>
  );
}

/**
 * The inline version, for a specific figure or table that is especially likely to
 * be read as real. Used on the transparency dashboard and the case pages.
 */
export function DemoNote({ children }: { children?: React.ReactNode }) {
  if (!IS_DEMO) return null;

  return (
    <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-brand-ink/55">
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 7.2v4M8 4.9h.01" />
      </svg>
      <span>{children ?? DEMO_NOTICE.long}</span>
    </p>
  );
}
