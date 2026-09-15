/**
 * The root loading state.
 *
 * The playbook calls the absence of loading.tsx the least-developed part of the
 * craft across the whole portfolio and the easiest win available. This is a
 * skeleton that matches the shape of a real page header, so the transition does
 * not jump when content arrives.
 */
export default function Loading() {
  return (
    <div className="on-ink bg-brand-ink" role="status" aria-label="Loading">
      <div className="container py-14 sm:py-16 lg:py-20">
        <div className="h-3 w-32 animate-pulse rounded-full bg-white/10" />
        <div className="mt-6 h-12 w-full max-w-2xl animate-pulse rounded-lg bg-white/10" />
        <div className="mt-3 h-12 w-full max-w-lg animate-pulse rounded-lg bg-white/10" />
        <div className="mt-7 h-px w-16 bg-brand-signal/30" />
        <div className="mt-7 space-y-2.5">
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/[0.07]" />
          <div className="h-4 w-full max-w-lg animate-pulse rounded bg-white/[0.07]" />
        </div>
        <span className="sr-only">Loading the page</span>
      </div>
    </div>
  );
}
