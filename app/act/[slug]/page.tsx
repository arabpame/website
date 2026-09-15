import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { EarthMap } from "@/components/map/EarthMap";
import { CaseChip } from "@/components/ui/CaseChip";
import { ArrowLink, ButtonLink, Eyebrow, PhotoFrame } from "@/components/ui/Primitives";
import { MISSION_TYPE_LABELS } from "@/lib/taxonomy";
import { getCaseByNumber, getMission, getMissionSlugs } from "@/lib/store";
import { JsonLd, MAX_DESCRIPTION, MAX_PAGE_TITLE, breadcrumbJsonLd, pageMeta, trim } from "@/lib/seo";
import { formatDate, pluralise } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await getMissionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mission = await getMission(slug);
  if (!mission)
    return pageMeta({ title: "Mission not found", description: "This mission does not exist.", path: "/act" });

  return pageMeta({
    title: trim(mission.title, MAX_PAGE_TITLE),
    description: trim(mission.summary, MAX_DESCRIPTION),
    path: `/act/${mission.slug}`,
  });
}

export default async function MissionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mission = await getMission(slug);
  if (!mission) notFound();

  const linkedCase = mission.caseNumber ? await getCaseByNumber(mission.caseNumber) : undefined;

  const remaining = mission.capacity - mission.registered;
  const pct = Math.min(100, Math.round((mission.registered / mission.capacity) * 100));
  const isCompleted = mission.status === "completed";

  return (
    <>
      <PageHeader
        eyebrow={MISSION_TYPE_LABELS[mission.type] ?? "EARTH Mission"}
        title={mission.title}
        lead={mission.summary}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Missions", href: "/act" },
          { label: mission.title, href: `/act/${mission.slug}` },
        ]}
      >
        <dl className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-4">
          <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <dt className="order-2 mt-1 text-[0.6875rem] text-brand-paper/60">Date</dt>
            <dd className="order-1 text-sm font-bold text-brand-signal">{formatDate(mission.date)}</dd>
          </div>
          <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <dt className="order-2 mt-1 text-[0.6875rem] text-brand-paper/60">{mission.province}</dt>
            <dd className="order-1 text-sm font-bold text-brand-signal">{mission.municipality}</dd>
          </div>
          <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.04] p-4">
            {mission.capacity === 0 ? (
              <>
                <dt className="order-2 mt-1 text-[0.6875rem] text-brand-paper/60">Organiser</dt>
                <dd className="order-1 text-sm font-bold leading-snug text-brand-signal">{mission.organiser}</dd>
              </>
            ) : (
              <>
                <dt className="order-2 mt-1 text-[0.6875rem] text-brand-paper/60">Places filled</dt>
                <dd className="order-1 font-data text-sm font-bold text-brand-signal">
                  {mission.registered} / {mission.capacity}
                </dd>
              </>
            )}
          </div>
          <div className="flex flex-col rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <dt className="order-2 mt-1 text-[0.6875rem] text-brand-paper/60">Status</dt>
            <dd className="order-1 text-sm font-bold text-brand-signal">
              {isCompleted ? "Completed" : mission.capacity === 0 || remaining > 0 ? "Open" : "Waitlist"}
            </dd>
          </div>
        </dl>
      </PageHeader>

      <section className="section">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              {/* Results first if completed. The outcome is the point. */}
              {isCompleted && mission.results ? (
                <div className="rounded-2xl border border-status-resolved/25 bg-status-resolved/[0.05] p-6">
                  <Eyebrow>The measured result</Eyebrow>
                  <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
                    {mission.results.map((result) => (
                      <div key={result.label} className="flex flex-col">
                        <dt className="order-2 mt-1 text-xs leading-snug text-brand-ink/60">{result.label}</dt>
                        <dd className="order-1 font-data text-2xl font-bold text-brand-deep">{result.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-6 border-t border-status-resolved/20 pt-5 text-sm leading-relaxed text-brand-ink/70">
                    Attendance was recorded on the day. Where planting is involved the survival count is
                    taken again at sixty or ninety days, which is always a smaller number than the one
                    announced on the day, and the only one worth publishing.
                  </p>
                </div>
              ) : null}

              <div className={isCompleted ? "mt-12" : ""}>
                <h2 className="text-display-md">About this mission</h2>
                <p className="mt-5 text-base leading-relaxed text-brand-ink/75">{mission.summary}</p>
                <p className="mt-4 text-sm leading-relaxed text-brand-ink/65">
                  Organised by {mission.organiser}.
                </p>
              </div>

              {mission.requirements.length > 0 ? (
                <div className="mt-12">
                  <h2 className="text-display-md">What you need to bring and know</h2>
                  <p className="mt-3 text-sm leading-relaxed text-brand-ink/65">
                    These are specific because the organiser has run this before and knows exactly what
                    goes wrong.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {mission.requirements.map((req) => (
                      <li
                        key={req}
                        className="flex gap-3 rounded-xl border border-brand-line bg-brand-surface px-4 py-3.5"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 16 16"
                          className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 8.4 6.4 12 13 4.8" />
                        </svg>
                        <span className="text-sm leading-relaxed text-brand-ink/75">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-12">
                <h2 className="text-display-md">On the day</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <PhotoFrame aspect="4/3" tone={isCompleted ? 1 : 2} />
                  <PhotoFrame aspect="4/3" tone={isCompleted ? 3 : 0} />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-brand-ink/55">
                  Mission photography is supplied by the organiser and published against the case.
                </p>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="space-y-5 lg:sticky lg:top-28">
                {/* Sign up */}
                <div className="rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-soft">
                  {isCompleted ? (
                    <>
                      <p className="text-base font-bold text-brand-deep">This mission is complete</p>
                      <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">
                        Its results are recorded above and counted on the transparency dashboard.
                      </p>
                      <ButtonLink href="/act" className="mt-5 w-full">
                        See open missions
                      </ButtonLink>
                    </>
                  ) : mission.capacity === 0 ? (
                    <>
                      <p className="text-base font-bold text-brand-deep">Open to volunteers</p>
                      <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">
                        Places are managed by the organiser, {mission.organiser}.
                        {mission.registration && !/^https?:\/\//.test(mission.registration)
                          ? ` ${mission.registration}`
                          : ""}
                      </p>
                      {mission.registration && /^https?:\/\//.test(mission.registration) ? (
                        <a
                          href={mission.registration}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="btn-primary mt-6 w-full"
                        >
                          Join through the organiser
                        </a>
                      ) : (
                        <ButtonLink href="/get-involved" className="mt-6 w-full">
                          Volunteer with EARTHLINK
                        </ButtonLink>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-base font-bold text-brand-deep">
                          {remaining > 0
                            ? `${remaining} ${pluralise(remaining, "place")} left`
                            : "Full, waitlist open"}
                        </p>
                        <span className="font-data text-xs text-brand-ink/55">{pct}%</span>
                      </div>
                      <div aria-hidden="true" className="mt-3 h-2 overflow-hidden rounded-full bg-brand-line">
                        <div className="h-full rounded-full bg-brand-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-3 font-data text-xs text-brand-ink/55">
                        {mission.registered} of {mission.capacity} volunteers registered
                      </p>

                      <ButtonLink href="/get-involved" className="mt-6 w-full">
                        {remaining > 0 ? "Register as a volunteer" : "Join the waitlist"}
                      </ButtonLink>
                    </>
                  )}
                </div>

                {/* The case behind it */}
                {mission.caseNumber ? (
                  <div className="rounded-2xl border border-brand-line bg-brand-paper p-5">
                    <Eyebrow>Why this mission exists</Eyebrow>
                    {linkedCase ? (
                      <>
                        <Link href={`/cases/${linkedCase.slug}`} className="group mt-3 block">
                          <p className="text-sm font-semibold leading-snug text-brand-deep group-hover:text-brand-primary group-hover:underline">
                            {linkedCase.title}
                          </p>
                        </Link>
                        <CaseChip
                          caseNumber={linkedCase.caseNumber}
                          status={linkedCase.status}
                          className="mt-3"
                        />
                        <p className="mt-3 text-xs leading-relaxed text-brand-ink/60">
                          A mission raised from a verified case, rather than an activity looking for a
                          location. That is the whole difference.
                        </p>
                      </>
                    ) : (
                      <p className="mt-3 font-data text-xs text-brand-primary">{mission.caseNumber}</p>
                    )}
                  </div>
                ) : null}

                {/* Location */}
                <div className="on-ink overflow-hidden rounded-2xl bg-brand-ink p-5">
                  <Eyebrow onInk>Where</Eyebrow>
                  <p className="mt-3 text-sm font-semibold text-brand-paper">
                    {[mission.barangay, mission.municipality].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-xs text-brand-paper/60">
                    {mission.province} · Region {mission.region}
                  </p>
                  {linkedCase ? (
                    <EarthMap cases={[linkedCase]} detail="hero" animate={false} className="mt-4 max-h-64" />
                  ) : null}
                  <ArrowLink href="/map" onInk className="mt-3">
                    Open the EARTH Map
                  </ArrowLink>
                </div>

                {mission.sources && mission.sources.length > 0 ? (
                  <div className="rounded-2xl border border-brand-line bg-brand-paper p-5">
                    <Eyebrow>Announced by</Eyebrow>
                    <ul className="mt-3 space-y-2">
                      {mission.sources.map((source) => (
                        <li key={source.url}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-sm font-semibold leading-snug text-brand-deep underline decoration-brand-primary/40 underline-offset-2 hover:text-brand-primary"
                          >
                            {source.title}
                          </a>
                          <p className="mt-0.5 font-data text-[0.6875rem] text-brand-ink/55">
                            {source.outlet} · {formatDate(source.date)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Missions", path: "/act" },
          { name: mission.title, path: `/act/${mission.slug}` },
        ])}
      />
    </>
  );
}
