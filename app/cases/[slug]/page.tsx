import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { EarthMap } from "@/components/map/EarthMap";
import { StatusChip, StatusRail } from "@/components/ui/CaseChip";
import {
  ArrowLink,
  ButtonLink,
  CategoryChip,
  Eyebrow,
  UrgencyChip,
} from "@/components/ui/Primitives";
import { getCase, getCaseSlugs, getMissionsForCase } from "@/lib/store";
import { STATUS_META, STATUS_ORDER } from "@/lib/taxonomy";
import { JsonLd, MAX_DESCRIPTION, MAX_PAGE_TITLE, breadcrumbJsonLd, pageMeta, trim } from "@/lib/seo";
import { daysBetween, formatDate, formatDateShort } from "@/lib/utils";

/**
 * Cases can change in the database without a deploy (a report deleted, a status
 * edited), so this page also rebuilds itself every five minutes. A new report
 * still appears at once, through revalidatePath in the Server Action.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getCaseSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getCase(slug);
  if (!item) return pageMeta({ title: "Case not found", description: "This case does not exist.", path: "/cases" });

  return pageMeta({
    // Case number first: it is the most useful thing in a tab or a search result.
    title: trim(`${item.caseNumber}. ${item.title}`, MAX_PAGE_TITLE),
    description: trim(item.summary, MAX_DESCRIPTION),
    path: `/cases/${item.slug}`,
  });
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getCase(slug);
  if (!item) notFound();

  const missions = await getMissionsForCase(item.caseNumber);
  const meta = STATUS_META[item.status];
  const lastUpdate = item.timeline[item.timeline.length - 1];
  const today = new Date().toISOString().slice(0, 10);
  const ageDays = daysBetween(item.reportedOn, today);

  /** The referral date, which is the number that makes a dashboard honest. */
  const referredEntry = item.timeline.find((t) => t.status === "referred");
  const daysSinceReferral = referredEntry ? daysBetween(referredEntry.date, today) : null;

  return (
    <>
      <PageHeader
        eyebrow={item.caseNumber}
        title={item.title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Cases", href: "/cases" },
          { label: item.caseNumber, href: `/cases/${item.slug}` },
        ]}
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <CategoryChip category={item.category} />
          <UrgencyChip urgency={item.urgency} />
        </div>

        {/* The pipeline, at full width. This is the page's headline fact. */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className={`h-3 w-3 rounded-full ${meta.dotClass}`} />
              <span className="text-lg font-bold text-brand-paper">{meta.label}</span>
            </div>
            <span className="font-data text-xs text-brand-paper/60">
              Step {meta.step} of 6 · reported {ageDays} days ago
            </span>
          </div>

          {/*
            The bars stay six across at every width, because the rail has to read
            as one left-to-right progression. The LABELS are hidden below sm,
            where six of them truncate to "Under veri..." and "Action in pr...",
            which is worse than not showing them: the current status is already
            named in full directly above, and the full sequence is on /cases.
          */}
          <ol className="mt-5 grid grid-cols-6 gap-1.5">
            {STATUS_ORDER.map((key) => {
              const s = STATUS_META[key];
              const reached = s.step <= meta.step;
              return (
                <li key={key} className="min-w-0">
                  <span
                    aria-hidden="true"
                    className={`block h-1.5 rounded-full ${reached ? s.dotClass : "bg-white/15"}`}
                  />
                  <span
                    className={`mt-2 hidden text-[0.6875rem] leading-tight sm:block ${
                      reached ? "text-brand-paper/80" : "text-brand-paper/60"
                    }`}
                  >
                    {s.label}
                  </span>
                  {/* Always available to a screen reader, at every width. */}
                  <span className="sr-only">
                    {s.label}: {reached ? "reached" : "not yet reached"}
                  </span>
                </li>
              );
            })}
          </ol>

          <p className="mt-5 text-sm leading-relaxed text-brand-paper/70">{meta.meaning}</p>
        </div>
      </PageHeader>

      <section className="section">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Main column */}
            <div className="lg:col-span-7">
              <h2 className="text-display-md">What was reported</h2>
              <p className="mt-5 text-lg leading-relaxed text-brand-ink/80">{item.summary}</p>

              {/* Evidence and sources */}
              <div className="mt-12">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-display-md">Evidence</h2>
                  <span className="font-data text-xs text-brand-ink/65">
                    {item.evidenceCount} {item.evidenceCount === 1 ? "file" : "files"} attached
                  </span>
                </div>
                {item.sources && item.sources.length > 0 ? (
                  <>
                    <p className="mt-3 text-sm leading-relaxed text-brand-ink/65">
                      This case is documented in public reporting. Every fact on this page comes from the
                      sources below, which are kept against the case so the record can be checked.
                    </p>
                    <ul className="mt-6 space-y-3">
                      {item.sources.map((source) => (
                        <li key={source.url} className="rounded-xl border border-brand-line bg-brand-paper p-4">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-sm font-semibold leading-snug text-brand-deep underline decoration-brand-primary/40 underline-offset-2 transition-colors hover:text-brand-primary"
                          >
                            {source.title}
                          </a>
                          <p className="mt-1 font-data text-[0.6875rem] text-brand-ink/65">
                            {source.outlet} · {formatDateShort(source.date)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : item.evidenceCount > 0 ? (
                  <p className="mt-3 text-sm leading-relaxed text-brand-ink/65">
                    Photographs submitted with the report are stored privately against the case and are
                    shared with the verification team and the office the case is referred to. They are not
                    published, so that people who appear in them are protected.
                  </p>
                ) : (
                  <p className="mt-3 text-sm leading-relaxed text-brand-ink/65">
                    No photographs were attached to this report. If you have seen this problem, file your
                    own report with photographs and it will be merged into this case.
                  </p>
                )}
              </div>

              {/* Timeline */}
              <div className="mt-12">
                <h2 className="text-display-md">The full history</h2>
                <p className="mt-3 text-sm leading-relaxed text-brand-ink/65">
                  Every change of state, timestamped, oldest first. Entries are added, never edited or
                  removed, so the record of how long something took cannot be quietly improved later.
                </p>

                <ol className="mt-8 space-y-0">
                  {item.timeline.map((entry, i) => {
                    const entryMeta = STATUS_META[entry.status];
                    const isLast = i === item.timeline.length - 1;
                    return (
                      <li key={`${entry.date}-${i}`} className="relative flex gap-5 pb-8 last:pb-0">
                        {/* The connecting spine. */}
                        {!isLast ? (
                          <span
                            aria-hidden="true"
                            className="absolute left-[7px] top-5 h-full w-px bg-brand-line"
                          />
                        ) : null}
                        <span
                          aria-hidden="true"
                          className={`relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-brand-paper ${entryMeta.dotClass}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <time
                              dateTime={entry.date}
                              className="font-data text-xs font-medium text-brand-deep"
                            >
                              {formatDate(entry.date)}
                            </time>
                            <span className={`text-xs font-semibold ${entryMeta.textClass}`}>
                              {entryMeta.label}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-brand-ink/75">{entry.note}</p>
                          <p className="mt-1.5 text-xs text-brand-ink/65">Recorded by {entry.actor}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Outcome */}
              {item.outcome && item.outcome.length > 0 ? (
                <div className="mt-12 rounded-2xl border border-status-resolved/25 bg-status-resolved/[0.05] p-6">
                  <Eyebrow>The measured result</Eyebrow>
                  <p className="mt-3 text-sm leading-relaxed text-brand-ink/70">
                    Taken on a return visit after the work was done, not estimated on the day.
                  </p>
                  <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                    {item.outcome.map((result) => (
                      <div key={result.label} className="flex flex-col">
                        <dt className="order-2 mt-1 text-xs leading-snug text-brand-ink/70">{result.label}</dt>
                        <dd className="order-1 font-data text-2xl font-bold text-brand-deep">{result.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}

              {/* Missions raised from this case */}
              {missions.length > 0 ? (
                <div className="mt-12">
                  <h2 className="text-display-md">Missions from this case</h2>
                  <ul className="mt-6 space-y-3">
                    {missions.map((mission) => (
                      <li key={mission.slug}>
                        <Link
                          href={`/act/${mission.slug}`}
                          className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-line bg-brand-surface px-5 py-4 transition-colors hover:border-brand-primary/30"
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-brand-deep group-hover:text-brand-primary">
                              {mission.title}
                            </span>
                            <span className="mt-0.5 block font-data text-xs text-brand-ink/65">
                              {formatDateShort(mission.date)} · {mission.organiser}
                            </span>
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                              mission.status === "completed"
                                ? "bg-status-resolved/10 text-status-resolved-text"
                                : "bg-status-progress/10 text-status-progress-text"
                            }`}
                          >
                            {mission.status === "completed"
                              ? "Completed"
                              : mission.status === "full"
                                ? "Full"
                                : `${mission.capacity - mission.registered} places left`}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-5">
              <div className="space-y-5 lg:sticky lg:top-28">
                {/* Location and map */}
                <div className="on-ink overflow-hidden rounded-2xl bg-brand-ink p-5">
                  <Eyebrow onInk>Location</Eyebrow>
                  <p className="mt-3 text-sm font-semibold text-brand-paper">
                    {[item.barangay, item.municipality].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-xs text-brand-paper/60">
                    {item.province} · Region {item.region}
                  </p>
                  <p className="mt-2 font-data text-xs text-brand-signal">
                    {item.lat.toFixed(4)} N, {item.lng.toFixed(4)} E
                  </p>
                  <EarthMap
                    cases={[item]}
                    detail="hero"
                    animate={false}
                    className="mt-4 max-h-64"
                  />
                  <ArrowLink href="/map" onInk className="mt-2">
                    See it on the full map
                  </ArrowLink>
                </div>

                {/* Key facts */}
                <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                  <Eyebrow>Case facts</Eyebrow>
                  <dl className="mt-4 space-y-3">
                    <Fact label="Case number" value={item.caseNumber} mono />
                    <Fact label="Observed" value={formatDate(item.observedOn)} />
                    <Fact label="Reported" value={formatDate(item.reportedOn)} />
                    <Fact
                      label="Separate reports"
                      value={`${item.reportCount} ${item.reportCount === 1 ? "person" : "people"}`}
                    />
                    <Fact label="Community validations" value={String(item.validations)} />
                    <Fact label="Evidence files" value={String(item.evidenceCount)} />
                    {item.referredTo ? <Fact label="Referred to" value={item.referredTo} /> : null}
                    {daysSinceReferral !== null ? (
                      <Fact
                        label="Days since referral"
                        value={String(daysSinceReferral)}
                        mono
                        // Plain, uncomfortable, and the reason this platform exists.
                        highlight={daysSinceReferral > 30 && item.status === "referred"}
                      />
                    ) : null}
                    <Fact label="Last update" value={lastUpdate ? formatDate(lastUpdate.date) : "None"} />
                  </dl>

                  <div className="mt-5 border-t border-brand-line pt-5">
                    <StatusChip status={item.status} showMeaning />
                    <StatusRail status={item.status} className="ml-3 align-middle" />
                  </div>
                </div>

                {/* Actions */}
                <div className="rounded-2xl border border-brand-line bg-brand-paper p-5">
                  <p className="text-sm font-bold text-brand-deep">Seen this too?</p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">
                    File your own report. Duplicates are merged into this case, and the number of
                    separate people who reported it is what makes it hard to ignore.
                  </p>
                  <ButtonLink href="/report" className="mt-4 w-full">
                    Report this problem
                  </ButtonLink>
                </div>

                {item.source === "report" ? (
                  <p className="flex items-start gap-2 text-xs leading-relaxed text-brand-ink/65">
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <circle cx="8" cy="8" r="6.5" />
                      <path d="M8 7.2v4M8 4.9h.01" />
                    </svg>
                    <span>
                      Filed through the EARTHLINK Report page and awaiting verification. Details are as
                      the reporter gave them and have not yet been checked.
                    </span>
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Cases", path: "/cases" },
          { name: item.caseNumber, path: `/cases/${item.slug}` },
        ])}
      />
    </>
  );
}

function Fact({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className="text-xs text-brand-ink/65">{label}</dt>
      <dd
        className={`max-w-[65%] text-right text-xs font-semibold ${mono ? "font-data" : ""} ${
          highlight ? "text-status-reported-text" : "text-brand-deep"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
