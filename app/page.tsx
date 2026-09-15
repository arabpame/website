import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { CaseCard } from "@/components/sections/CaseCard";
import { EarthMap, MapLegend } from "@/components/map/EarthMap";
import { CaseChip, StatusRail } from "@/components/ui/CaseChip";
import {
  ArrowLink,
  ButtonLink,
  CategoryIcon,
  Eyebrow,
  PhotoFrame,
  Rule,
  SectionHeading,
  Stat,
} from "@/components/ui/Primitives";
import { DemoNote } from "@/components/layout/DemoBanner";
import { CORE_FUNCTIONS } from "@/lib/constants";
import { STATUS_META, STATUS_ORDER } from "@/lib/taxonomy";
import {
  getCases,
  getCategoryCounts,
  getHeroImpact,
  getHotspots,
  getImpact,
  getOpenMissions,
  getProvenCases,
  getRecentCases,
  getStatusCounts,
} from "@/lib/store";
import { pageMeta } from "@/lib/seo";
import { formatDate, formatNumber } from "@/lib/utils";

export const metadata = pageMeta({
  title: "See the problem. Connect the people.",
  description:
    "Report an environmental problem in your community and watch it become a tracked case. Verified, referred to the right office, and followed in public.",
  path: "/",
});

export default async function HomePage() {
  const [cases, heroImpact, impact, categoryCounts, statusCounts, recent, proven, missions, hotspots] =
    await Promise.all([
      getCases(),
      getHeroImpact(),
      getImpact(),
      getCategoryCounts(),
      getStatusCounts(),
      getRecentCases(3),
      getProvenCases(2),
      getOpenMissions(3),
      getHotspots(),
    ]);

  const latest = recent[0]!;
  const totalCases = cases.length;

  return (
    <>
      <Hero cases={cases} impact={heroImpact} categoryCounts={categoryCounts} latest={latest} />

      {/* ---------------------------------------------------------------- */}
      {/* The problem this exists to fix                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="section">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow>Why this exists</Eyebrow>
              <h2 className="mt-3 text-display-lg">
                A photograph on social media is not a report.
              </h2>
              <Rule className="mt-5" />
            </div>

            <div className="lg:col-span-7">
              <p className="text-xl leading-relaxed text-brand-ink/80">
                Someone sees a river choked with plastic. They photograph it. They post it. It gets
                shared, it gets angry comments, and in three days it is gone.
              </p>
              <p className="mt-6 text-base leading-relaxed text-brand-ink/70">
                Nothing about that process produces a record. No office receives it. No one checks
                whether it was fixed. The next person who notices the same river starts again from
                nothing, and the problem outlives everyone who cared about it.
              </p>
              <p className="mt-6 text-base leading-relaxed text-brand-ink/70">
                EARTHLINK turns that moment into something durable: a numbered case with evidence
                attached, a verification step, a named office it was sent to, a date it was sent, and a
                public status that anyone can check. The difference is not the photograph. The
                difference is that the photograph now belongs to something that remembers.
              </p>

              <div className="mt-10 rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-soft">
                <p className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-primary">
                  What a case looks like
                </p>
                <p className="mt-3 text-sm leading-relaxed text-brand-ink/70">
                  Every report on this platform gets one of these. It is the same object on the map, in
                  the list, on the public page, and in the office that receives it.
                </p>
                <div className="mt-5 rounded-xl bg-brand-paper p-4">
                  <CaseChip caseNumber={latest.caseNumber} status={latest.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The five core functions                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="section border-t border-brand-line bg-white">
        <div className="container">
          <SectionHeading
            eyebrow="The five core functions"
            title="One cycle, five parts, and none of them work alone"
            lead="Education without a way to act is a lecture. Reporting without routing is a complaint box. Action without measurement is a photo opportunity. The five only mean anything together."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_FUNCTIONS.map((fn, i) => (
              <Link
                key={fn.key}
                href={fn.href}
                data-reveal-index={i % 3}
                className="reveal group flex flex-col rounded-2xl border border-brand-line bg-brand-paper p-6 transition-all duration-300 ease-expo hover:-translate-y-0.5 hover:border-brand-primary/30 hover:bg-white hover:shadow-lift"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-data text-xs font-medium tracking-eyebrow text-brand-primary">
                    {fn.number}
                  </span>
                  <span className="font-display text-xs font-bold uppercase tracking-eyebrow text-brand-ink/35">
                    {fn.name}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold leading-tight text-brand-deep transition-colors group-hover:text-brand-primary">
                  {fn.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-ink/70">{fn.summary}</p>

                <p className="mt-5 border-t border-brand-line pt-4 text-sm font-semibold text-brand-deep">
                  {fn.promise}
                </p>
              </Link>
            ))}

            {/* The sixth tile is the cycle itself, which is the actual product. */}
            <div className="reveal flex flex-col justify-between rounded-2xl bg-brand-ink p-6 text-brand-paper">
              <div>
                <p className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-signal">
                  And then it repeats
                </p>
                <p className="mt-6 text-sm leading-relaxed text-brand-paper/75">
                  A resolved case becomes a case study. The next community with the same problem starts
                  from what worked here instead of from nothing.
                </p>
              </div>
              <ol className="mt-6 space-y-2 border-t border-white/10 pt-5">
                {["Learn", "Report", "Verify", "Connect", "Act", "Track", "Resolve", "Educate"].map(
                  (step, i) => (
                    <li key={step} className="flex items-center gap-3">
                      <span className="font-data text-[0.6875rem] text-brand-signal/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xs font-medium text-brand-paper/80">{step}</span>
                    </li>
                  ),
                )}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The status pipeline                                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="on-ink section bg-brand-ink">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                onInk
                eyebrow="Track"
                title="Six states. All of them public."
                lead="A case cannot move backwards quietly. Every change of state is timestamped and stays on the record, including the ones that make us look slow."
              />
              <ButtonLink href="/track" variant="signal" className="mt-8">
                Open the transparency dashboard
              </ButtonLink>
            </div>

            <div className="lg:col-span-7">
              <ol className="space-y-px overflow-hidden rounded-2xl border border-white/10">
                {STATUS_ORDER.map((key) => {
                  const meta = STATUS_META[key];
                  const count = statusCounts[key];
                  const pct = totalCases ? Math.round((count / totalCases) * 100) : 0;
                  return (
                    <li key={key} className="relative bg-white/[0.03] px-5 py-4">
                      {/* The fill bar is the share of cases at this state. */}
                      <div
                        aria-hidden="true"
                        className={`absolute inset-y-0 left-0 origin-left opacity-[0.10] ${meta.dotClass}`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                      <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-data text-[0.6875rem] text-brand-paper/35">
                            {String(meta.step).padStart(2, "0")}
                          </span>
                          <span
                            aria-hidden="true"
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dotClass}`}
                          />
                          <span className="text-sm font-semibold text-brand-paper">{meta.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <StatusRail status={key} onInk />
                          <span className="font-data text-sm font-medium text-brand-signal">
                            {count}
                          </span>
                        </div>
                      </div>
                      <p className="relative mt-2 pl-[3.25rem] text-xs leading-relaxed text-brand-paper/55">
                        {meta.meaning}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The map                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="section border-t border-brand-line">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="The EARTH Map"
                title="Where the same problem keeps coming back"
                lead="Every case appears on the map by category. Over time the map stops being a record of what went wrong and starts showing where to intervene before it goes wrong again."
              />

              <div className="mt-10 space-y-3">
                {hotspots.slice(0, 3).map((spot) => (
                  <div
                    key={`${spot.place}-${spot.municipality}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-brand-line bg-brand-surface px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-brand-deep">
                        {spot.place}, {spot.municipality}
                      </p>
                      <p className="text-xs text-brand-ink/55">{spot.province}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {spot.cases.slice(0, 4).map((c) => (
                        <span key={c.caseNumber} className="text-brand-ink/50">
                          <CategoryIcon category={c.category} />
                        </span>
                      ))}
                      <span className="font-data text-sm font-medium text-brand-primary">
                        {spot.cases.length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-brand-ink/55">
                Recurring sites, meaning more than one case at the same barangay. This is the view that
                turns reporting into prevention.
              </p>

              <ArrowLink href="/map" className="mt-8">
                Open the full map
              </ArrowLink>
            </div>

            <div className="on-ink relative overflow-hidden rounded-3xl bg-brand-ink p-6 shadow-lift">
              <div aria-hidden="true" className="field-grid absolute inset-0 opacity-50" />
              {/*
                detail="hero" here, not "full".

                This map is a preview at max-w-sm, roughly 384px wide. At that
                size the 300 smallest islands each render at under two pixels and
                contribute nothing but bytes and main-thread parse time. With both
                maps at full detail the homepage was 715 KB of HTML and 547 inline
                SVG paths, which is a real cost on the mobile data this audience is
                actually on. The full 457 shapes belong on /map, where the map IS
                the page.
              */}
              <EarthMap cases={cases} detail="hero" className="relative mx-auto max-h-[34rem] w-full max-w-sm" />
              <MapLegend counts={categoryCounts} className="relative mt-4 justify-center" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Proof: cases that were measured                                   */}
      {/* ---------------------------------------------------------------- */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading
            eyebrow="Measured, not claimed"
            title="What a resolved case actually produced"
            lead="A case is only closed when the result has been measured on a return visit. Trees are counted at ninety days, not on planting day, because that is the number that tells the truth."
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {proven.map((item, i) => (
              <article
                key={item.caseNumber}
                className="reveal flex flex-col rounded-2xl border border-brand-line bg-brand-paper p-6"
                data-reveal-index={i}
              >
                <CaseChip caseNumber={item.caseNumber} status={item.status} />
                <h3 className="mt-4 text-lg font-bold leading-snug text-brand-deep">{item.title}</h3>
                <p className="mt-1 text-xs text-brand-ink/55">
                  {item.barangay}, {item.municipality}, {item.province}
                </p>

                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-brand-line pt-6">
                  {item.outcome?.map((result) => (
                    <div key={result.label}>
                      <dd className="font-data text-xl font-bold text-brand-deep">{result.value}</dd>
                      <dt className="mt-1 text-xs leading-snug text-brand-ink/60">{result.label}</dt>
                    </div>
                  ))}
                </dl>

                <div className="mt-6">
                  <ArrowLink href={`/cases/${item.slug}`}>Read the full case</ArrowLink>
                </div>
              </article>
            ))}
          </div>

          <DemoNote />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Recent cases                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section className="section border-t border-brand-line">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="The register"
              title="Filed most recently"
              className="max-w-xl"
            />
            <ArrowLink href="/cases">All {totalCases} cases</ArrowLink>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((item, i) => (
              <CaseCard key={item.caseNumber} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Missions                                                          */}
      {/* ---------------------------------------------------------------- */}
      <section className="section bg-white">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Act"
              title="Missions open for volunteers"
              lead="A verified case becomes a mission with a date, a place and a target. Attendance is recorded on the day, and the result is measured afterwards."
              className="max-w-xl"
            />
            <ArrowLink href="/act">All missions</ArrowLink>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {missions.map((mission, i) => {
              const remaining = mission.capacity - mission.registered;
              return (
                <Link
                  key={mission.slug}
                  href={`/act/${mission.slug}`}
                  data-reveal-index={i % 3}
                  className="reveal group flex flex-col rounded-2xl border border-brand-line bg-brand-paper p-5 transition-all duration-300 ease-expo hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-lift"
                >
                  <p className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-primary">
                    {formatDate(mission.date)}
                  </p>
                  <h3 className="mt-3 text-base font-bold leading-snug text-brand-deep transition-colors group-hover:text-brand-primary">
                    {mission.title}
                  </h3>
                  <p className="mt-2 text-xs text-brand-ink/55">
                    {mission.barangay}, {mission.municipality}, {mission.province}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-ink/70">
                    {mission.summary}
                  </p>

                  <div className="mt-5 border-t border-brand-line pt-4">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-data text-brand-ink/60">
                        {mission.registered} of {mission.capacity} places
                      </span>
                      <span
                        className={
                          remaining > 0
                            ? "font-semibold text-status-resolved-text"
                            : "font-semibold text-status-referred-text"
                        }
                      >
                        {remaining > 0 ? `${remaining} left` : "Full, waitlist open"}
                      </span>
                    </div>
                    <div
                      aria-hidden="true"
                      className="mt-2 h-1 overflow-hidden rounded-full bg-brand-line"
                    >
                      <div
                        className="h-full rounded-full bg-brand-primary"
                        style={{
                          width: `${Math.min(100, Math.round((mission.registered / mission.capacity) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Learn and EARTH Kids                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="section border-t border-brand-line">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
              <PhotoFrame
                aspect="4/3"
                tone={1}
                caption="EARTH Kids session, to be photographed"
              />
            </div>

            <div className="order-1 lg:order-2">
              <SectionHeading
                eyebrow="Learn and EARTH Kids"
                title="Teach a child what to do, not only what is wrong"
                lead="Ten topic tracks from climate change to environmental law. Plus EARTH Kids, a separate simplified area with its own reading level, built around one question: what can I actually do about it?"
              />

              <div className="mt-10 flex flex-wrap gap-3">
                <ButtonLink href="/learn">Open the learning hub</ButtonLink>
                <ButtonLink href="/learn/earth-kids" variant="outline">
                  EARTH Kids
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Closing: the dashboard, which is the real closing argument        */}
      {/* ---------------------------------------------------------------- */}
      <section className="on-ink section bg-brand-ink">
        <div className="container">
          <SectionHeading
            onInk
            align="center"
            eyebrow="The whole point"
            title="Advocacy should be measured by what changed, not by who heard it"
          />

          <dl className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {impact.slice(0, 8).map((metric) => (
              <Stat
                key={metric.key}
                onInk
                value={formatNumber(metric.value)}
                unit={metric.unit}
                label={metric.label}
                basis={metric.basis}
              />
            ))}
          </dl>

          <div className="mt-14 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/report" variant="signal">
              Report a concern
            </ButtonLink>
            <ButtonLink href="/get-involved" variant="outline-ink">
              Volunteer or partner with us
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
