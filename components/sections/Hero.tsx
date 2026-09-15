import Link from "next/link";
import { EarthMap, MapLegend } from "@/components/map/EarthMap";
import { CaseChip } from "@/components/ui/CaseChip";
import { ButtonLink, Eyebrow, Rule } from "@/components/ui/Primitives";
import { formatNumber } from "@/lib/utils";
import type { EarthCase, ImpactMetric } from "@/lib/types";

/**
 * The hero.
 *
 * The hero is not a photograph, and that is the central design decision on this
 * site. A photograph of a clean beach is a promise. A map with every tracked case
 * on it is evidence, and evidence is the entire argument EARTHLINK is making.
 *
 * Structure follows the house skeleton: eyebrow, h1, sub, hairline rule, exactly
 * two CTAs. The proof strip is welded to the lower edge rather than floated below,
 * because the counters are the payoff for the headline and separating them would
 * weaken both.
 *
 * Height stops at 92vh so a sliver of the next section shows, signalling there is
 * more to scroll.
 */

export function Hero({
  cases,
  impact,
  categoryCounts,
  latest,
}: {
  cases: EarthCase[];
  impact: ImpactMetric[];
  categoryCounts: Record<string, number>;
  latest: EarthCase;
}) {
  return (
    <section className="on-ink relative isolate overflow-hidden bg-brand-ink">
      {/* The map field. Decorative here: the real case data is linked below and
          lives in full on /map and /cases. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="field-grid absolute inset-0 opacity-60" />

        {/* The archipelago sits to the right on desktop and behind the copy on
            mobile, where it is dimmed so the headline stays legible. */}
        <div className="absolute inset-y-0 right-0 w-full opacity-[0.55] sm:opacity-70 lg:w-[56%]">
          <div className="relative h-full w-full">
            <EarthMap
              cases={cases}
              detail="hero"
              className="absolute inset-0 flex items-center justify-center py-8 lg:py-12"
            />
          </div>
        </div>

        {/* Left-to-right wash so the headline never fights the map behind it. */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-ink via-brand-ink/92 to-brand-ink/40 lg:via-brand-ink/80 lg:to-transparent" />
        {/* Bottom wash, welding the hero into the proof strip. */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-brand-ink to-transparent" />
      </div>

      <div className="container relative flex min-h-[92vh] flex-col justify-end pb-0 pt-16 sm:pt-20">
        <div className="max-w-2xl pb-12 lg:pb-16">
          <Eyebrow onInk>A national environmental action platform</Eyebrow>

          <h1 className="mt-5 text-display-2xl text-brand-paper">
            See the problem.
            <br />
            Connect the people.
            <br />
            <span className="text-brand-signal">Create the solution.</span>
          </h1>

          <Rule onInk className="mt-8 w-16" />

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-brand-paper/75">
            Report an environmental problem in your community and it becomes a numbered case, not a post
            that scrolls away. The community verifies it. The right office receives it. And anyone can
            check, in public, whether something was actually done.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="/report" variant="signal">
              Report a concern
            </ButtonLink>
            <ButtonLink href="/map" variant="outline-ink">
              Explore the EARTH Map
            </ButtonLink>
          </div>

          {/* The most recent case. This is the single most persuasive element on
              the page: a real-looking, timestamped, tracked object. */}
          <Link
            href={`/cases/${latest.slug}`}
            className="group mt-12 block max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors duration-300 hover:border-brand-signal/40 hover:bg-white/[0.07]"
          >
            <p className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-paper/45">
              Most recent case
            </p>
            <p className="mt-2 text-sm font-semibold leading-snug text-brand-paper">{latest.title}</p>
            <p className="mt-1 text-xs text-brand-paper/55">
              {latest.barangay}, {latest.municipality}, {latest.province}
            </p>
            <CaseChip caseNumber={latest.caseNumber} status={latest.status} onInk className="mt-3" />
          </Link>
        </div>

        {/* The proof strip, welded to the hero's lower edge. */}
        <div className="border-t border-white/10 py-7">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <dl className="flex flex-wrap gap-x-10 gap-y-6">
              {impact.map((metric) => (
                <div key={metric.key}>
                  <dd className="font-data text-2xl font-bold tracking-tight text-brand-signal sm:text-3xl">
                    {formatNumber(metric.value)}
                    {metric.unit ? (
                      <span className="ml-1 text-base font-medium opacity-70">{metric.unit}</span>
                    ) : null}
                  </dd>
                  <dt className="mt-1 text-xs font-medium text-brand-paper/60">{metric.label}</dt>
                </div>
              ))}
            </dl>

            <MapLegend counts={categoryCounts} className="max-w-md" />
          </div>
        </div>
      </div>
    </section>
  );
}
