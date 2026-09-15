import Link from "next/link";
import { PageHeader } from "@/components/sections/PageHeader";
import { CaseCard } from "@/components/sections/CaseCard";
import { StatusRail } from "@/components/ui/CaseChip";
import { ArrowLink, Eyebrow, SectionHeading, Stat } from "@/components/ui/Primitives";
import { PARTNER_TYPE_LABELS, STATUS_META, STATUS_ORDER } from "@/lib/taxonomy";
import {
  getCases,
  getImpact,
  getPartners,
  getProvenCases,
  getReferralStats,
  getStatusCounts,
} from "@/lib/store";
import { JsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { daysBetween, formatNumber } from "@/lib/utils";

/**
 * Cases can change in the database without a deploy (a report deleted, a status
 * edited), so this page also rebuilds itself every five minutes. A new report
 * still appears at once, through revalidatePath in the Server Action.
 */
export const revalidate = 300;

export const metadata = pageMeta({
  title: "Transparency dashboard",
  description:
    "The platform's own numbers, including the uncomfortable ones. Cases reported and resolved, how long referrals wait, and which offices respond.",
  path: "/track",
});

export default async function TrackPage() {
  const [impact, statusCounts, referral, partners, cases, proven] = await Promise.all([
    getImpact(),
    getStatusCounts(),
    getReferralStats(),
    getPartners(),
    getCases(),
    getProvenCases(3),
  ]);

  const total = cases.length;
  const today = new Date().toISOString().slice(0, 10);

  /**
   * Cases sitting at "referred" the longest. This is the single most important
   * table on the platform, and it is the one an LGU would least like to see.
   * Publishing it is the entire argument for EARTHLINK existing.
   */
  const waiting = cases
    .filter((c) => c.status === "referred")
    .map((c) => {
      const referredOn = c.timeline.find((t) => t.status === "referred")?.date ?? c.reportedOn;
      return { item: c, days: daysBetween(referredOn, today), referredOn };
    })
    .sort((a, b) => b.days - a.days);

  /** Median days from report to resolved, across cases that got there. */
  const resolutionTimes = cases
    .filter((c) => c.outcome && c.outcome.length > 0)
    .map((c) => {
      const resolvedOn = c.timeline.find((t) => t.status === "resolved")?.date;
      return resolvedOn ? daysBetween(c.reportedOn, resolvedOn) : null;
    })
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);

  const medianResolution =
    resolutionTimes.length === 0
      ? null
      : resolutionTimes.length % 2 === 1
        ? resolutionTimes[(resolutionTimes.length - 1) / 2]!
        : Math.round(
            (resolutionTimes[resolutionTimes.length / 2 - 1]! +
              resolutionTimes[resolutionTimes.length / 2]!) /
              2,
          );

  return (
    <>
      <PageHeader
        eyebrow="Track"
        title="The numbers, including the ones we would rather not publish"
        lead="Advocacy is usually measured by reach. This page measures outcomes instead, which means it also has to show what is stuck, how long it has been stuck, and who it is stuck with."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Track", href: "/track" },
        ]}
      />

      {/* Headline counters */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Impact"
            title="What has actually happened"
            lead="Every figure states what it counts. A number without a stated basis is a claim, not a measurement."
            className="max-w-2xl"
          />

          <dl className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {impact.map((metric) =>
              metric.href ? (
                <Link key={metric.key} href={metric.href} className="group block">
                  <Stat
                    value={formatNumber(metric.value)}
                    unit={metric.unit}
                    label={metric.label}
                    basis={metric.basis}
                    className="transition-opacity group-hover:opacity-80"
                  />
                </Link>
              ) : (
                <Stat
                  key={metric.key}
                  value={formatNumber(metric.value)}
                  unit={metric.unit}
                  label={metric.label}
                  basis={metric.basis}
                />
              ),
            )}
          </dl>

        </div>
      </section>

      {/* The pipeline */}
      <section className="on-ink section bg-brand-ink">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionHeading
                onInk
                eyebrow="The pipeline"
                title="Where every case currently sits"
                lead="A healthy platform has cases at every stage. A platform with nothing in the middle is either brand new or quietly abandoning things."
              />
            </div>

            <div className="lg:col-span-8">
              <ol className="overflow-hidden rounded-2xl border border-white/10">
                {STATUS_ORDER.map((key) => {
                  const meta = STATUS_META[key];
                  const count = statusCounts[key];
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <li key={key} className="relative border-b border-white/10 px-5 py-5 last:border-b-0">
                      <div
                        aria-hidden="true"
                        className={`absolute inset-y-0 left-0 opacity-[0.12] ${meta.dotClass}`}
                        style={{ width: `${Math.max(pct, 1.5)}%` }}
                      />
                      <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                        <div className="flex items-center gap-3">
                          <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`} />
                          <span className="text-sm font-semibold text-brand-paper">{meta.label}</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <StatusRail status={key} onInk />
                          <span className="font-data text-sm text-brand-paper/60">{pct}%</span>
                          <span className="font-data text-lg font-bold text-brand-signal">{count}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-data text-2xl font-bold text-brand-signal">
                    {medianResolution ?? "n/a"}
                  </p>
                  <p className="mt-1 text-xs text-brand-paper/65">
                    Median days, report to resolved
                  </p>
                  <p className="mt-1 text-[0.6875rem] leading-relaxed text-brand-paper/45">
                    Across the {resolutionTimes.length} cases that reached a measured result.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-data text-2xl font-bold text-brand-signal">{referral.acknowledgedRate}%</p>
                  <p className="mt-1 text-xs text-brand-paper/65">Referrals acknowledged</p>
                  <p className="mt-1 text-[0.6875rem] leading-relaxed text-brand-paper/45">
                    {referral.acknowledged} of {referral.received} referrals confirmed received.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-data text-2xl font-bold text-brand-signal">{referral.resolvedRate}%</p>
                  <p className="mt-1 text-xs text-brand-paper/65">Referrals resolved</p>
                  <p className="mt-1 text-[0.6875rem] leading-relaxed text-brand-paper/45">
                    {referral.resolved} of {referral.received}. The gap is the work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waiting on someone */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Waiting"
            title="Cases referred and still waiting"
            lead="Sorted by how long they have been waiting, longest first. This table is published on purpose. A transparency dashboard that only reports successes is marketing."
            className="max-w-2xl"
          />

          <div className="mt-12 overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem] text-left">
                <caption className="sr-only">
                  Cases that have been referred to an office and are still waiting for action, sorted
                  by days waiting.
                </caption>
                <thead>
                  <tr className="border-b border-brand-line bg-brand-paper">
                    <th scope="col" className="px-5 py-3 font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-ink/70">
                      Case
                    </th>
                    <th scope="col" className="px-5 py-3 font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-ink/70">
                      Referred to
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-ink/70">
                      Days waiting
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-line">
                  {waiting.map(({ item, days }) => (
                    <tr key={item.caseNumber} className="transition-colors hover:bg-brand-paper">
                      <td className="px-5 py-4">
                        <Link href={`/cases/${item.slug}`} className="group block">
                          <span className="block font-data text-xs text-brand-primary">
                            {item.caseNumber}
                          </span>
                          <span className="mt-0.5 block text-sm font-semibold text-brand-deep group-hover:underline">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-brand-ink/65">
                            {item.municipality}, {item.province}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm text-brand-ink/70">
                        {item.referredTo ?? "Not recorded"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`font-data text-lg font-bold ${
                            days > 45
                              ? "text-status-reported-text"
                              : days > 21
                                ? "text-status-verifying-text"
                                : "text-brand-deep"
                          }`}
                        >
                          {days}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {waiting.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-10 text-center text-sm text-brand-ink/70">
                        Nothing is currently waiting on a referral.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-brand-ink/65">
            Counted from the date the referral was sent. Colour marks longer waits, and the number is
            always shown, so the table is readable without relying on colour.
          </p>
        </div>
      </section>

      {/* Partner responsiveness */}
      <section className="section border-t border-brand-line bg-white">
        <div className="container">
          <SectionHeading
            eyebrow="Connect"
            title="Which offices respond"
            lead="Acknowledgement is not resolution, and both are counted separately. An office that acknowledges everything and resolves nothing shows up clearly here."
            className="max-w-2xl"
          />

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {partners
              .slice()
              .sort((a, b) => b.casesReceived - a.casesReceived)
              .map((partner) => {
                const ackPct = partner.casesReceived
                  ? Math.round((partner.casesAcknowledged / partner.casesReceived) * 100)
                  : 0;
                const resPct = partner.casesReceived
                  ? Math.round((partner.casesResolved / partner.casesReceived) * 100)
                  : 0;
                return (
                  <div
                    key={partner.slug}
                    className="reveal rounded-2xl border border-brand-line bg-brand-paper p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-snug text-brand-deep">{partner.name}</p>
                        <p className="mt-0.5 text-xs text-brand-ink/65">
                          {PARTNER_TYPE_LABELS[partner.type]} · {partner.coverage}
                        </p>
                      </div>
                      <span className="shrink-0 font-data text-xs text-brand-ink/65">
                        {partner.casesReceived} received
                      </span>
                    </div>

                    <dl className="mt-5 space-y-3">
                      <Bar label="Acknowledged" pct={ackPct} count={partner.casesAcknowledged} tone="progress" />
                      <Bar label="Resolved" pct={resPct} count={partner.casesResolved} tone="resolved" />
                    </dl>
                  </div>
                );
              })}
          </div>

        </div>
      </section>

      {/* Proven */}
      <section className="section">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Closed with a measured result"
              title="What resolution looks like"
              className="max-w-xl"
            />
            <ArrowLink href="/cases">The full register</ArrowLink>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {proven.map((item, i) => (
              <CaseCard key={item.caseNumber} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* How the numbers are produced */}
      <section className="on-ink section bg-brand-ink">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <Eyebrow onInk>Method</Eyebrow>
            <h2 className="mt-4 text-display-lg text-brand-paper">How these numbers are produced</h2>

            <dl className="mt-10 space-y-7">
              {[
                {
                  term: "Counted, not estimated",
                  detail:
                    "Volunteer numbers come from attendance recorded on the day, not from sign-ups. Waste is weighed. Trees are counted at sixty or ninety days after planting, which is always a smaller number than trees planted, and it is the only one that means anything.",
                },
                {
                  term: "Open cases are counted too",
                  detail:
                    "Reported, under verification, referred and in progress all appear on this page. A dashboard showing only resolved cases would make the platform look better and tell you less.",
                },
                {
                  term: "Every figure states its basis",
                  detail:
                    "Under each number is a line saying exactly what is included and what is excluded. Where a figure has a known gap, the gap is named rather than smoothed over.",
                },
                {
                  term: "The record is append-only",
                  detail:
                    "Case history entries are added, never edited or deleted. That is what makes a date on this page worth anything, and it is what makes a referral that sat for sixty days impossible to tidy away later.",
                },
              ].map((item) => (
                <div key={item.term} className="border-l-2 border-brand-signal/30 pl-6">
                  <dt className="text-sm font-bold text-brand-signal">{item.term}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-brand-paper/70">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Track", path: "/track" },
        ])}
      />
    </>
  );
}

function Bar({
  label,
  pct,
  count,
  tone,
}: {
  label: string;
  pct: number;
  count: number;
  tone: "progress" | "resolved";
}) {
  const fill = tone === "resolved" ? "bg-status-resolved" : "bg-status-progress";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <dt className="text-xs text-brand-ink/70">{label}</dt>
        <dd className="font-data text-xs font-semibold text-brand-deep">
          {count} <span className="text-brand-ink/65">({pct}%)</span>
        </dd>
      </div>
      <div aria-hidden="true" className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brand-line">
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
