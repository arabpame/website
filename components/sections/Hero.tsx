import Image from "next/image";
import Link from "next/link";
import { EarthMap, MapLegend } from "@/components/map/EarthMap";
import { CaseChip } from "@/components/ui/CaseChip";
import { ButtonLink, Eyebrow, Rule, SectionHeading } from "@/components/ui/Primitives";
import { FOUNDER } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import type { EarthCase, ImpactMetric } from "@/lib/types";

/**
 * The hero.
 *
 * This is a photographic hero, chosen by the client so that a competition panel
 * opening the site sees the advocacy and the person behind it immediately.
 *
 * The evidence argument is not lost, only moved: the live EARTH Map, the counters
 * and the most recent tracked case sit directly beneath, above the fold on a
 * desktop scroll of one notch. A visitor still reaches proof within a second.
 *
 * Every word here is live text in the DOM. Nothing is baked into the photograph,
 * because flattened type cannot be selected, read aloud by a screen reader,
 * reflowed at 375px, or translated into Filipino.
 */

const PILLARS = [
  {
    title: "Environmental reporting",
    detail: "See an issue? Report it.",
    href: "/report",
    icon: (
      <>
        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
  },
  {
    title: "Community verification",
    detail: "Real people. Real checks.",
    href: "/about#how-it-works",
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <path d="M16 6.2a3 3 0 0 1 0 5.6" />
        <path d="M17.5 19a5.5 5.5 0 0 0-2-4.3" />
      </>
    ),
  },
  {
    title: "Government action",
    detail: "The right office gets it.",
    href: "/connect",
    icon: (
      <>
        <path d="M4 10h16" />
        <path d="M12 3 4 7.5h16L12 3Z" />
        <path d="M6.5 10v7M12 10v7M17.5 10v7" />
        <path d="M3.5 20.5h17" />
      </>
    ),
  },
  {
    title: "Public transparency",
    detail: "Track progress. See results.",
    href: "/track",
    icon: (
      <>
        <path d="M12 3.2 5 6v5.4c0 4 2.9 7.6 7 8.6 4.1-1 7-4.6 7-8.6V6l-7-2.8Z" />
        <path d="m9 12 2.2 2.2L15.2 10" />
      </>
    ),
  },
];

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
    <>
      {/* ------------------------------------------------------------------ */}
      {/* 1. The photographic hero                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="on-ink relative isolate overflow-hidden bg-brand-ink">
        <Image
          src={FOUNDER.photo.hero}
          alt={`${FOUNDER.name}, environmental advocate and founder of EARTHLINK Philippines, on a forested ridge above a Philippine coastline`}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[72%_center] lg:object-[60%_center]"
        />

        {/* Washes, with explicit stops rather than Tailwind's default thirds.
            The default from/via/to spread put 90 percent ink across most of the
            frame and buried the photograph entirely.

            Vertical first, so the copy at the bottom always has a dark ground no
            matter how bright the sky in the picture is. Horizontal second, and
            only from sm upward: on a phone the photograph is the backdrop and the
            vertical wash alone carries legibility. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,35,30,0.40)_0%,rgba(7,35,30,0.34)_18%,rgba(7,35,30,0.86)_44%,rgba(7,35,30,0.96)_70%,#07231E_100%)] sm:bg-[linear-gradient(to_bottom,rgba(7,35,30,0.45)_0%,rgba(7,35,30,0.20)_30%,rgba(7,35,30,0.88)_72%,#07231E_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 sm:bg-[linear-gradient(to_right,#07231E_0%,rgba(7,35,30,0.90)_26%,rgba(7,35,30,0.45)_55%,rgba(7,35,30,0)_82%)]"
        />

        <div className="container relative flex min-h-[86vh] flex-col justify-end py-16 sm:py-20">
          <div className="max-w-xl">
            <Eyebrow onInk>A national environmental action platform</Eyebrow>

            <h1 className="mt-5 text-display-2xl text-brand-paper">
              See the problem.
              <br />
              Connect the people.
              <br />
              <span className="text-brand-signal">Create the solution.</span>
            </h1>

            <Rule onInk className="mt-8 w-16" />

            <p className="mt-8 text-lg leading-relaxed text-brand-paper/80">
              Report an environmental problem in your community and it becomes a numbered case, not a
              post that scrolls away. The community verifies it. The right office receives it. And
              anyone can check, in public, whether something was actually done.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <ButtonLink href="/report" variant="signal">
                Report an environmental problem
              </ButtonLink>
              <ButtonLink href="/map" variant="outline-ink">
                Explore the EARTH Map
              </ButtonLink>
            </div>
          </div>

          {/* The advocate's mark. Live text, not a flattened signature graphic. */}
          <div className="mt-14 self-start lg:absolute lg:bottom-20 lg:right-8 lg:mt-0 lg:self-auto lg:text-right xl:right-16">
            <p className="font-display text-3xl italic leading-none text-brand-paper">
              {FOUNDER.shortName}
            </p>
            <span
              aria-hidden="true"
              className="mt-2 block h-px w-24 bg-brand-signal lg:ml-auto"
            />
            <p className="mt-3 font-data text-[0.6875rem] uppercase leading-relaxed tracking-eyebrow text-brand-paper/70">
              Environmental advocate
              <br />
              <span className="text-brand-signal">EARTHLINK PH</span>
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 2. The four pillars                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="on-ink border-t border-white/10 bg-brand-deep">
        <div className="container py-12 sm:py-14">
          <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar, i) => (
              <li
                key={pillar.title}
                className={
                  i > 0
                    ? "lg:border-l lg:border-white/10 lg:pl-8"
                    : undefined
                }
              >
                <Link href={pillar.href} className="group block text-center lg:text-left">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto h-8 w-8 text-brand-signal transition-transform duration-300 ease-expo group-hover:-translate-y-0.5 lg:mx-0"
                  >
                    {pillar.icon}
                  </svg>

                  {/* Fixed height so the captions stay on one baseline when a
                      title wraps to two lines, which "Community verification"
                      does at most widths. */}
                  <p className="mt-4 font-display text-sm font-bold uppercase leading-snug tracking-eyebrow text-brand-paper transition-colors group-hover:text-brand-signal sm:min-h-[2.5rem]">
                    {pillar.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-paper/60">{pillar.detail}</p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex items-center gap-5">
            <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
            <p className="text-center font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-signal/80">
              Cleaner environment
              <span className="mx-2 text-brand-paper/30">/</span>
              Stronger communities
              <span className="mx-2 text-brand-paper/30">/</span>
              A brighter future
            </p>
            <span aria-hidden="true" className="h-px flex-1 bg-white/10" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. The live record                                                  */}
      {/*                                                                     */}
      {/* This used to be welded into the hero. The photograph took that       */}
      {/* position, so the evidence moved here rather than off the page. It is */}
      {/* one scroll notch down and it is still the first thing after the      */}
      {/* introduction, because it is what the platform is actually arguing.   */}
      {/* ------------------------------------------------------------------ */}
      <section className="on-ink relative isolate overflow-hidden border-t border-white/10 bg-brand-ink">
        <div aria-hidden="true" className="field-grid pointer-events-none absolute inset-0 opacity-60" />

        <div className="container relative py-16 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                onInk
                eyebrow="The live record"
                title="Not a promise. A record."
                lead="Every case on this platform has a number, a status and a clock. This is the whole argument, and it is on the page rather than in a brochure."
              />

              <Link
                href={`/cases/${latest.slug}`}
                className="group mt-10 block rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors duration-300 hover:border-brand-signal/40 hover:bg-white/[0.07]"
              >
                <p className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-paper/60">
                  Most recent case
                </p>
                <p className="mt-2 text-sm font-semibold leading-snug text-brand-paper">
                  {latest.title}
                </p>
                <p className="mt-1 text-xs text-brand-paper/60">
                  {[latest.barangay, latest.municipality, latest.province].filter(Boolean).join(", ")}
                </p>
                <CaseChip caseNumber={latest.caseNumber} status={latest.status} onInk className="mt-3" />
              </Link>
            </div>

            <div className="lg:col-span-7">
              <div className="relative">
                <EarthMap cases={cases} detail="hero" className="flex items-center justify-center" />
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-white/10 pt-8">
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
    </>
  );
}
