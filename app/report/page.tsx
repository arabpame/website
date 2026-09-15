import { PageHeader } from "@/components/sections/PageHeader";
import { ReportForm } from "@/components/forms/ReportForm";
import { ArrowLink, Eyebrow, SectionHeading } from "@/components/ui/Primitives";
import { StatusRail } from "@/components/ui/CaseChip";
import { JsonLd, breadcrumbJsonLd, faqJsonLd, pageMeta } from "@/lib/seo";
import { STATUS_META, STATUS_ORDER } from "@/lib/taxonomy";

export const metadata = pageMeta({
  title: "Report an environmental concern",
  description:
    "Report an environmental problem in your community. Add a location, photographs and a description, and it becomes a numbered EARTH case.",
  path: "/report",
});

const FAQ = [
  {
    question: "Do I have to give my name to file a report?",
    answer:
      "No. A report can be filed without a name. You will not be able to receive updates directly, but the case still gets a number, and you can follow it on the public case page like anyone else.",
  },
  {
    question: "What happens after I submit a report?",
    answer:
      "It is given an EARTH case number immediately. The verification team checks it, usually within a week, and looks for other reports of the same problem to merge. Once verified it is referred to the office responsible for that area and that category, with your evidence attached.",
  },
  {
    question: "What if someone has already reported the same problem?",
    answer:
      "Report it anyway. Duplicate reports are merged into one case, and the number of separate people who reported it is shown on the case. More reports of the same problem make the case stronger, not redundant.",
  },
  {
    question: "Is it safe to report illegal activity?",
    answer:
      "You can request that your identity is withheld, and that request is honoured in everything published and in what is sent to an agency. Never put yourself at risk to gather evidence. A report from a safe distance is worth more than a photograph that gets you hurt.",
  },
  {
    question: "What should I photograph?",
    answer:
      "Something in frame for scale, the surroundings so the location is recognisable, and the problem itself. If it is recurring, photographs from different dates at the same spot are the single most useful evidence you can provide.",
  },
];

export default function ReportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Report"
        title="Report an environmental concern"
        lead="Four steps, about five minutes, and it works on a phone on mobile data. What you file becomes a numbered case with a permanent record, not a post that disappears."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Report", href: "/report" },
        ]}
      >
        <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { label: "Time to file", value: "About 5 minutes" },
            { label: "Account needed", value: "No" },
            { label: "Anonymous option", value: "Yes" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-paper/60">
                {item.label}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-brand-signal">{item.value}</p>
            </div>
          ))}
        </div>
      </PageHeader>

      <section className="section">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <ReportForm />
            </div>

            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <div className="rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-soft">
                  <Eyebrow>What happens next</Eyebrow>
                  <p className="mt-3 text-sm leading-relaxed text-brand-ink/70">
                    Your report enters the pipeline at step one and moves through it in public. Every
                    change of state is timestamped and cannot be quietly edited later.
                  </p>

                  <ol className="mt-6 space-y-4">
                    {STATUS_ORDER.map((key) => {
                      const meta = STATUS_META[key];
                      return (
                        <li key={key} className="flex gap-3">
                          <span className="mt-1 font-data text-[0.6875rem] text-brand-ink/40">
                            {String(meta.step).padStart(2, "0")}
                          </span>
                          <span
                            aria-hidden="true"
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${meta.dotClass}`}
                          />
                          <span>
                            <span className={`block text-sm font-semibold ${meta.textClass}`}>
                              {meta.label}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-brand-ink/70">
                              {meta.meaning}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>

                  <div className="mt-6 border-t border-brand-line pt-5">
                    <StatusRail status="referred" />
                    <p className="mt-2 text-xs leading-relaxed text-brand-ink/65">
                      This rail appears on every case, so you can see at a glance how far along it is.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-status-reported/25 bg-status-reported/[0.05] p-5">
                  <p className="text-sm font-bold text-status-reported-text">
                    If there is immediate danger to people, call first
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">
                    EARTHLINK is not an emergency service. For a fire, a chemical spill, a collapse or
                    anything threatening life, contact your barangay, the local disaster office or 911
                    first. File the report afterwards so the incident still enters the record.
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-brand-line bg-brand-paper p-5">
                  <p className="text-sm font-bold text-brand-deep">Your privacy</p>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">
                    Reports are handled under the Data Privacy Act of 2012 (RA 10173). You can report
                    without giving a name, and you can ask for your identity to be withheld from
                    anything published and from anything sent to an agency.
                  </p>
                  <ArrowLink href="/privacy" className="mt-4">
                    Read the privacy notice
                  </ArrowLink>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section border-t border-brand-line bg-white">
        <div className="container">
          <SectionHeading eyebrow="Questions" title="Before you file" className="max-w-2xl" />

          <dl className="mt-12 grid gap-x-12 gap-y-8 lg:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.question} className="reveal">
                <dt className="text-base font-bold text-brand-deep">{item.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-brand-ink/70">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <JsonLd
        data={[
          faqJsonLd(FAQ),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Report", path: "/report" },
          ]),
        ]}
      />
    </>
  );
}
