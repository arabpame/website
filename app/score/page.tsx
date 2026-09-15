import { PageHeader } from "@/components/sections/PageHeader";
import { ButtonLink, SectionHeading } from "@/components/ui/Primitives";
import { DemoNote } from "@/components/layout/DemoBanner";
import { getScores } from "@/lib/store";
import { JsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { formatNumber } from "@/lib/utils";

export const metadata = pageMeta({
  title: "EARTH Score",
  description:
    "Points for barangays, schools and organisations, earned from missions completed, cases resolved, waste diverted, trees surviving and students educated.",
  path: "/score",
});

const RULES = [
  { action: "A mission completed with a recorded result", points: "120 points", note: "Attendance must be recorded on the day." },
  { action: "A case resolved and confirmed on a return visit", points: "200 points", note: "Not awarded when a case is merely closed." },
  { action: "Waste diverted from landfill", points: "1 point per 5 kg", note: "Weighed, not estimated." },
  { action: "A tree or mangrove still alive at 90 days", points: "2 points each", note: "Counted at 90 days, never on planting day." },
  { action: "A student who completed a learning track", points: "3 points each", note: "Completion, not attendance." },
  { action: "A verified report that led to a referral", points: "40 points", note: "Awarded to the reporter's barangay." },
];

const AWARDS = [
  {
    title: "Greenest Barangay of the Year",
    detail: "The highest scoring barangay over a full calendar year, weighted by population so a small barangay can win.",
  },
  {
    title: "EARTH School of the Year",
    detail: "The school that combined the most learning completions with the most missions actually attended.",
  },
  {
    title: "Young Environmental Champion",
    detail: "An individual EARTH Ambassador under 25, nominated by their own community rather than by the platform.",
  },
  {
    title: "Most Sustainable Community",
    detail: "Awarded on year-over-year improvement rather than on absolute score, so a community starting from nothing can win it.",
  },
];

const KIND_LABEL = {
  barangay: "Barangay",
  school: "School",
  organisation: "Organisation",
} as const;

export default async function ScorePage() {
  const scores = await getScores();
  const top = scores[0];

  return (
    <>
      <PageHeader
        eyebrow="EARTH Score"
        title="Make environmental responsibility something to compete for"
        lead="Barangays, schools and organisations earn points for work that was measured. The leaderboard is public, the rules are published, and every total can be broken down into the actions that produced it."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "EARTH Score", href: "/score" },
        ]}
      >
        {top ? (
          <div className="mt-10 max-w-lg rounded-2xl border border-brand-signal/25 bg-brand-signal/[0.07] p-5">
            <p className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-signal">
              Currently leading
            </p>
            <p className="mt-2 text-xl font-bold text-brand-paper">{top.name}</p>
            <p className="mt-0.5 text-sm text-brand-paper/60">
              {top.municipality}, {top.province}
            </p>
            <p className="mt-3 font-data text-2xl font-bold text-brand-signal">
              {formatNumber(top.points)} <span className="text-sm font-medium opacity-70">points</span>
            </p>
          </div>
        ) : null}
      </PageHeader>

      {/* Leaderboard */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="The leaderboard"
            title="Every total, broken down"
            lead="A score you cannot audit is a score nobody trusts. Each row expands into the five things that produced it."
            className="max-w-2xl"
          />

          <div className="mt-12 overflow-hidden rounded-2xl border border-brand-line bg-brand-surface">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[54rem] text-left">
                <caption className="sr-only">
                  EARTH Score leaderboard, with the breakdown of each total.
                </caption>
                <thead>
                  <tr className="border-b border-brand-line bg-brand-paper">
                    {["Rank", "Name", "Missions", "Cases resolved", "Waste (kg)", "Trees alive", "Students", "Points"].map(
                      (h, i) => (
                        <th
                          key={h}
                          scope="col"
                          className={`px-4 py-3 font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-ink/60 ${
                            i >= 2 ? "text-right" : ""
                          }`}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-line">
                  {scores.map((entry) => (
                    <tr key={entry.name} className="transition-colors hover:bg-brand-paper">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-data text-sm font-bold text-brand-deep">
                            {entry.rank}
                          </span>
                          {entry.movement !== 0 ? (
                            <span
                              className={`font-data text-[0.6875rem] ${
                                entry.movement > 0 ? "text-status-resolved-text" : "text-status-reported-text"
                              }`}
                              title={
                                entry.movement > 0
                                  ? `Up ${entry.movement} since last period`
                                  : `Down ${Math.abs(entry.movement)} since last period`
                              }
                            >
                              {entry.movement > 0 ? `+${entry.movement}` : entry.movement}
                            </span>
                          ) : (
                            <span className="font-data text-[0.6875rem] text-brand-ink/35" title="No change">
                              0
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="block text-sm font-semibold text-brand-deep">{entry.name}</span>
                        <span className="block text-xs text-brand-ink/55">
                          {KIND_LABEL[entry.kind]} · {entry.municipality}, {entry.province}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-data text-sm text-brand-ink/70">
                        {entry.breakdown.missions}
                      </td>
                      <td className="px-4 py-4 text-right font-data text-sm text-brand-ink/70">
                        {entry.breakdown.casesResolved}
                      </td>
                      <td className="px-4 py-4 text-right font-data text-sm text-brand-ink/70">
                        {formatNumber(entry.breakdown.wasteDivertedKg)}
                      </td>
                      <td className="px-4 py-4 text-right font-data text-sm text-brand-ink/70">
                        {formatNumber(entry.breakdown.treesSurviving)}
                      </td>
                      <td className="px-4 py-4 text-right font-data text-sm text-brand-ink/70">
                        {formatNumber(entry.breakdown.studentsEducated)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-data text-base font-bold text-brand-deep">
                          {formatNumber(entry.points)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-brand-ink/55">
            Movement is the change in rank since the previous period. A positive number means the
            community climbed.
          </p>

          <DemoNote />
        </div>
      </section>

      {/* Rules */}
      <section className="on-ink section bg-brand-ink">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                onInk
                eyebrow="The rulebook"
                title="Published, so nobody has to trust us"
                lead="Every rule rewards something that was measured after the fact, not something announced on the day. That is deliberate, and it is the only thing stopping a leaderboard from rewarding publicity."
              />
            </div>

            <div className="lg:col-span-7">
              <ul className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
                {RULES.map((rule) => (
                  <li key={rule.action} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 bg-white/[0.03] px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-brand-paper">{rule.action}</p>
                      <p className="mt-1 text-xs leading-relaxed text-brand-paper/55">{rule.note}</p>
                    </div>
                    <span className="shrink-0 font-data text-sm font-bold text-brand-signal">
                      {rule.points}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-xs leading-relaxed text-brand-paper/55">
                Points are never awarded for filing a report alone. If they were, the fastest way to the
                top of this table would be to file a hundred reports nobody verified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="section border-t border-brand-line bg-white">
        <div className="container">
          <SectionHeading
            eyebrow="Annual awards"
            title="Four titles worth wanting"
            lead="Two of the four are weighted so that a small or a late-starting community can win, because a leaderboard that only the largest barangay can ever top stops motivating anyone else by March."
            className="max-w-2xl"
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {AWARDS.map((award, i) => (
              <div
                key={award.title}
                className="reveal rounded-2xl border border-brand-line bg-brand-paper p-6"
                data-reveal-index={i % 2}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="h-6 w-6 text-brand-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="10" cy="7.5" r="4.5" />
                  <path d="M6.6 11.4 5.2 18l4.8-2.4 4.8 2.4-1.4-6.6" />
                </svg>
                <h3 className="mt-5 text-lg font-bold leading-snug text-brand-deep">{award.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">{award.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <ButtonLink href="/act">Join a mission</ButtonLink>
            <ButtonLink href="/ambassadors" variant="outline">
              Become an EARTH Ambassador
            </ButtonLink>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "EARTH Score", path: "/score" },
        ])}
      />
    </>
  );
}
