import Link from "next/link";
import { PageHeader } from "@/components/sections/PageHeader";
import { ArrowLink, SectionHeading, Stat } from "@/components/ui/Primitives";
import { CaseNumber } from "@/components/ui/CaseChip";
import { DemoNote } from "@/components/layout/DemoBanner";
import { MISSION_TYPE_LABELS } from "@/lib/taxonomy";
import { getCompletedMissions, getOpenMissions } from "@/lib/store";
import { JsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { formatDate, formatDateShort, pluralise } from "@/lib/utils";
import type { Mission } from "@/lib/types";

export const metadata = pageMeta({
  title: "EARTH Missions",
  description:
    "Volunteer for an EARTH Mission. A verified case becomes a mission with a date, a place and a target, and the result is measured afterwards.",
  path: "/act",
});

export default async function ActPage() {
  const [open, completed] = await Promise.all([getOpenMissions(), getCompletedMissions()]);

  const totals = completed.reduce(
    (acc, m) => {
      for (const r of m.results ?? []) {
        const n = Number(r.value.replace(/,/g, "").match(/-?\d+(\.\d+)?/)?.[0] ?? 0);
        if (r.label.startsWith("Volunteers")) acc.volunteers += n;
        if (r.label === "Waste collected") acc.waste += n;
        if (r.label.startsWith("Surviving")) acc.surviving += n;
      }
      return acc;
    },
    { volunteers: 0, waste: 0, surviving: 0 },
  );

  return (
    <>
      <PageHeader
        eyebrow="Act"
        title="EARTH Missions"
        lead="A verified case becomes a mission with a date, a place and a target. Attendance is recorded on the day. The result is measured on a return visit. That is what separates a mission from a photo opportunity."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Missions", href: "/act" },
        ]}
      >
        <dl className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-4">
          {[
            { label: "Open now", value: String(open.length) },
            { label: "Completed", value: String(completed.length) },
            { label: "Volunteers recorded", value: String(totals.volunteers) },
            { label: "Waste collected", value: `${(totals.waste / 1000).toFixed(1)} t` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <dd className="font-data text-xl font-bold text-brand-signal">{item.value}</dd>
              <dt className="mt-1 text-[0.6875rem] leading-tight text-brand-paper/60">{item.label}</dt>
            </div>
          ))}
        </dl>
      </PageHeader>

      {/* Open missions */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Open for volunteers"
            title="Missions you can join"
            lead="Read the requirements before signing up. They are specific because the organisers have run these before and know what goes wrong."
            className="max-w-2xl"
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {open.map((mission, i) => (
              <MissionCard key={mission.slug} mission={mission} index={i} />
            ))}
          </div>

          <DemoNote />
        </div>
      </section>

      {/* Completed */}
      <section className="on-ink section bg-brand-ink">
        <div className="container">
          <SectionHeading
            onInk
            eyebrow="Completed"
            title="What was actually produced"
            lead="Every completed mission publishes its numbers. Where planting is involved the count is taken at sixty or ninety days, not on the day, because survival is the only figure worth reporting."
            className="max-w-2xl"
          />

          <div className="mt-12 space-y-4">
            {completed.map((mission) => (
              <Link
                key={mission.slug}
                href={`/act/${mission.slug}`}
                className="group block rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:border-brand-signal/30 hover:bg-white/[0.07]"
              >
                <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
                  <div className="lg:col-span-5">
                    <p className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-signal/70">
                      {formatDate(mission.date)}
                    </p>
                    <h3 className="mt-2 text-lg font-bold leading-snug text-brand-paper">
                      {mission.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-brand-paper/55">
                      {[mission.barangay, mission.municipality, mission.province].filter(Boolean).join(", ")}
                    </p>
                    {mission.caseNumber ? (
                      <p className="mt-3">
                        <CaseNumber caseNumber={mission.caseNumber} onInk />
                      </p>
                    ) : null}
                  </div>

                  <dl className="grid grid-cols-2 gap-x-6 gap-y-4 lg:col-span-7 lg:grid-cols-4">
                    {mission.results?.map((result) => (
                      <div key={result.label}>
                        <dd className="font-data text-xl font-bold text-brand-signal">{result.value}</dd>
                        <dt className="mt-1 text-[0.6875rem] leading-snug text-brand-paper/60">
                          {result.label}
                        </dt>
                      </div>
                    ))}
                  </dl>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="How a mission happens"
            title="From a report to a measured result"
            className="max-w-2xl"
          />

          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "A case is verified",
                detail:
                  "Someone reports a problem, the community corroborates it, and the verification team confirms it is real.",
              },
              {
                step: "02",
                title: "A mission is raised",
                detail:
                  "An organiser, often a barangay or a partner organisation, sets a date, a place, a target and the requirements.",
              },
              {
                step: "03",
                title: "Volunteers sign up and show up",
                detail:
                  "Places are limited and a waitlist opens when full. Attendance is recorded on the day, because sign-ups are not a result.",
              },
              {
                step: "04",
                title: "The result is measured",
                detail:
                  "Waste is weighed. Planting is counted again at sixty or ninety days. The numbers go on the case and on the dashboard.",
              },
            ].map((item, i) => (
              <li
                key={item.step}
                className="reveal rounded-2xl border border-brand-line bg-brand-surface p-5 shadow-soft"
                data-reveal-index={i}
              >
                <p className="font-data text-xs font-medium tracking-eyebrow text-brand-primary">
                  {item.step}
                </p>
                <h3 className="mt-4 text-base font-bold leading-snug text-brand-deep">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">{item.detail}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 grid gap-8 border-t border-brand-line pt-12 sm:grid-cols-3">
            <Stat
              value={String(totals.volunteers)}
              label="Volunteers recorded"
              basis="Attendance taken on the day at completed missions, not sign-ups."
            />
            <Stat
              value={totals.waste.toLocaleString("en-PH")}
              unit="kg"
              label="Waste collected"
              basis="Weighed at completed missions. Excludes anything cleared by an agency without a weight recorded."
            />
            <Stat
              value={String(totals.surviving)}
              label="Trees and mangroves surviving"
              basis="Counted at 60 or 90 days after planting, not on planting day."
            />
          </div>

          <ArrowLink href="/track" className="mt-10">
            The full transparency dashboard
          </ArrowLink>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Missions", path: "/act" },
        ])}
      />
    </>
  );
}

function MissionCard({ mission, index }: { mission: Mission; index: number }) {
  const remaining = mission.capacity - mission.registered;
  const pct = Math.min(100, Math.round((mission.registered / mission.capacity) * 100));

  return (
    <article className="reveal h-full" data-reveal-index={index % 2}>
      <Link
        href={`/act/${mission.slug}`}
        className="group flex h-full flex-col rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-soft transition-all duration-300 ease-expo hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-lift"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-brand-paper px-2.5 py-1 font-data text-[0.6875rem] font-medium uppercase tracking-eyebrow text-brand-ink/60 ring-1 ring-inset ring-brand-line">
            {MISSION_TYPE_LABELS[mission.type]}
          </span>
          <span className="font-data text-xs font-semibold text-brand-primary">
            {formatDateShort(mission.date)}
          </span>
        </div>

        <h3 className="mt-4 text-lg font-bold leading-snug text-brand-deep transition-colors group-hover:text-brand-primary">
          {mission.title}
        </h3>
        <p className="mt-1.5 text-xs text-brand-ink/55">
          {[mission.barangay, mission.municipality, mission.province].filter(Boolean).join(", ")}
        </p>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-brand-ink/70">{mission.summary}</p>

        {mission.requirements.length > 0 ? (
          <ul className="mt-5 space-y-1.5">
            {mission.requirements.slice(0, 2).map((req) => (
              <li key={req} className="flex gap-2.5 text-xs leading-relaxed text-brand-ink/65">
                <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-primary" />
                {req}
              </li>
            ))}
            {mission.requirements.length > 2 ? (
              <li className="pl-[0.875rem] text-xs text-brand-ink/45">
                and {mission.requirements.length - 2} more
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="mt-6 border-t border-brand-line pt-4">
          {mission.capacity === 0 ? (
            <p className="text-xs text-brand-ink/60">
              <span className="font-semibold text-brand-deep">{mission.organiser}</span>
              {mission.status === "completed" ? " · completed" : " · places managed by the organiser"}
            </p>
          ) : (
          <>
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
              {remaining > 0
                ? `${remaining} ${pluralise(remaining, "place")} left`
                : "Full, waitlist open"}
            </span>
          </div>
          <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-line">
            <div className="h-full rounded-full bg-brand-primary" style={{ width: `${pct}%` }} />
          </div>
          </>
          )}
          {mission.caseNumber ? (
            <p className="mt-3">
              <CaseNumber caseNumber={mission.caseNumber} />
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
