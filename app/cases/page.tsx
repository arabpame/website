import { PageHeader } from "@/components/sections/PageHeader";
import { CaseCard } from "@/components/sections/CaseCard";
import { StatusRail } from "@/components/ui/CaseChip";
import { getCases, getStatusCounts } from "@/lib/store";
import { STATUS_META, STATUS_ORDER } from "@/lib/taxonomy";
import { JsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";

/**
 * Cases can change in the database without a deploy (a report deleted, a status
 * edited), so this page also rebuilds itself every five minutes. A new report
 * still appears at once, through revalidatePath in the Server Action.
 */
export const revalidate = 300;

export const metadata = pageMeta({
  title: "The case register",
  description:
    "Every environmental case filed on EARTHLINK Philippines, at every stage from reported to monitoring. Open, searchable and public.",
  path: "/cases",
});

export default async function CasesPage() {
  const [cases, statusCounts] = await Promise.all([getCases(), getStatusCounts()]);

  return (
    <>
      <PageHeader
        eyebrow="The register"
        title="Every case, at every stage"
        lead="Including the ones still waiting on someone. A register that only showed resolved cases would not be a register, it would be a brochure."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Cases", href: "/cases" },
        ]}
      >
        <dl className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {STATUS_ORDER.map((key) => {
            const meta = STATUS_META[key];
            return (
              <div key={key} className="flex flex-col rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                <dt className="order-2 mt-1 flex items-center gap-1.5 text-[0.6875rem] leading-tight text-brand-paper/65">
                  <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dotClass}`} />
                  {meta.label}
                </dt>
                <dd className="order-1 font-data text-xl font-bold text-brand-signal">{statusCounts[key]}</dd>
              </div>
            );
          })}
        </dl>
      </PageHeader>

      <section className="section">
        <div className="container">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((item, i) => (
              <CaseCard key={item.caseNumber} item={item} index={i} />
            ))}
          </div>

        </div>
      </section>

      <section className="section border-t border-brand-line bg-white">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-display-md">Reading a case</h2>
            <p className="mt-4 text-base leading-relaxed text-brand-ink/75">
              Every case carries the same three things: a permanent number, a six-segment rail showing
              how far through the pipeline it is, and a status label. The rail means you can judge a
              case at a glance without reading anything.
            </p>

            <ul className="mt-8 space-y-4">
              {STATUS_ORDER.map((key) => {
                const meta = STATUS_META[key];
                return (
                  <li
                    key={key}
                    className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-brand-line bg-brand-paper px-4 py-3"
                  >
                    <StatusRail status={key} />
                    <span className={`text-sm font-semibold ${meta.textClass}`}>{meta.label}</span>
                    <span className="w-full text-xs leading-relaxed text-brand-ink/70 sm:w-auto sm:flex-1">
                      {meta.meaning}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Cases", path: "/cases" },
        ])}
      />
    </>
  );
}
