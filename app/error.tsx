"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * The route error boundary.
 *
 * Deliberately says nothing about what went wrong. A stack trace or a database
 * message on a public error page is an information leak, and this platform will
 * eventually hold citizen reports.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side monitoring is wired up in Phase 2. Until then the console is
    // the only place this goes, and it never carries user data.
    console.error("Route error", error.digest ?? "no digest");
  }, [error]);

  return (
    <section className="on-ink bg-brand-ink">
      <div className="container flex min-h-[70vh] flex-col justify-center py-20">
        <p className="eyebrow-ink">Something went wrong</p>
        <h1 className="mt-4 max-w-2xl text-display-lg text-brand-paper">
          This page did not load properly
        </h1>
        <div aria-hidden="true" className="rule-ink mt-7 w-16" />
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-brand-paper/70">
          The problem is on our side, not yours. Trying again usually works. If it keeps happening,
          please tell us so it gets fixed rather than sitting there.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn-signal">
            Try again
          </button>
          <Link href="/" className="btn-outline-ink">
            Back to the home page
          </Link>
          <Link href="/contact" className="btn-outline-ink">
            Tell us about it
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-10 font-data text-xs text-brand-paper/60">
            Reference {error.digest}
          </p>
        ) : null}
      </div>
    </section>
  );
}
