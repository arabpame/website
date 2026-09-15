import Link from "next/link";
import { PageHeader } from "@/components/sections/PageHeader";
import { ArrowLink, ButtonLink, Eyebrow, PhotoFrame, SectionHeading } from "@/components/ui/Primitives";
import { BUILDER, CORE_FUNCTIONS, FOUNDER, PHASES } from "@/lib/constants";
import { JsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "About EARTHLINK",
  description:
    "The vision behind EARTHLINK Philippines, how the platform works end to end, how the build is phased, and what is deliberately not built yet.",
  path: "/about",
});

const CYCLE = [
  { step: "Visit", detail: "Someone arrives, usually because they just saw something wrong." },
  { step: "Learn", detail: "They understand what they are looking at and which law or office covers it." },
  { step: "See a problem", detail: "They notice a concern in their own community." },
  { step: "Report", detail: "Location, photographs, category and urgency. About five minutes on a phone." },
  { step: "Verify", detail: "Neighbours corroborate. The verification team confirms it is real." },
  { step: "Connect", detail: "The case is routed to the office with the mandate for that area and category." },
  { step: "Act", detail: "Volunteers and stakeholders take part in the solution." },
  { step: "Track", detail: "The public follows the status, including how long it has waited." },
  { step: "Resolve", detail: "The result is measured on a return visit, not claimed on the day." },
  { step: "Educate", detail: "The resolved case becomes a case study the next community starts from." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A bridge, not another website"
        lead="Between people who see environmental problems and institutions capable of solving them. Between environmental education and real action. Between this generation and the world it will hand over."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
        ]}
      />

      {/* The advocacy */}
      <section className="section">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow>The advocacy</Eyebrow>
              <h2 className="mt-3 text-display-lg">
                The Earth does not need another generation that knows there is a problem
              </h2>
            </div>

            <div className="lg:col-span-7">
              <p className="text-xl leading-relaxed text-brand-ink/80">
                I want a Philippines where environmental problems are no longer photographed, posted and
                forgotten.
              </p>
              <p className="mt-6 text-base leading-relaxed text-brand-ink/70">
                Through EARTHLINK, any Filipino, and especially any young Filipino, can become an
                environmental observer, educator, reporter, volunteer and changemaker. Protecting the
                Earth should not require power, wealth or position. Sometimes change begins with one
                person who sees a problem and refuses to ignore it.
              </p>
              <p className="mt-6 text-base leading-relaxed text-brand-ink/70">
                You do not need to become a politician, a scientist, a billionaire or a celebrity before
                you can protect the planet. You only need to care enough to act.
              </p>
              <p className="mt-6 text-lg font-semibold leading-relaxed text-brand-deep">
                If one report can save one river. If one lesson can change one child. If one community
                can restore one ecosystem. Then one platform can start a movement.
              </p>

              <div className="mt-10 border-t border-brand-line pt-6">
                <p className="text-sm font-bold text-brand-deep">{FOUNDER.name}</p>
                <p className="mt-0.5 text-sm text-brand-ink/60">{FOUNDER.role}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="on-ink section scroll-mt-28 bg-brand-ink">
        <div className="container">
          <SectionHeading
            onInk
            eyebrow="The full cycle"
            title="Ten steps, and then it starts again"
            lead="The last step is what makes it a cycle rather than a queue. A resolved case becomes a case study, so the next community with the same problem starts from what worked instead of from nothing."
            className="max-w-2xl"
          />

          <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 sm:grid-cols-2 lg:grid-cols-5">
            {CYCLE.map((item, i) => (
              <li key={item.step} className="bg-white/[0.03] p-5">
                <span className="font-data text-[0.6875rem] text-brand-signal/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-bold text-brand-paper">{item.step}</h3>
                <p className="mt-2 text-xs leading-relaxed text-brand-paper/65">{item.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Five functions recap */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="The five core functions"
            title="Each one exists because the others need it"
            className="max-w-2xl"
          />

          <div className="mt-12 space-y-4">
            {CORE_FUNCTIONS.map((fn) => (
              <Link
                key={fn.key}
                href={fn.href}
                className="group grid gap-4 rounded-2xl border border-brand-line bg-brand-surface p-6 transition-colors hover:border-brand-primary/30 lg:grid-cols-12 lg:gap-8"
              >
                <div className="lg:col-span-3">
                  <span className="font-data text-xs font-medium tracking-eyebrow text-brand-primary">
                    {fn.number}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-brand-deep group-hover:text-brand-primary">
                    {fn.name}
                  </h3>
                  <p className="mt-1 text-xs text-brand-ink/55">{fn.title}</p>
                </div>
                <div className="lg:col-span-6">
                  <p className="text-sm leading-relaxed text-brand-ink/70">{fn.summary}</p>
                </div>
                <div className="lg:col-span-3">
                  <p className="text-sm font-semibold text-brand-deep">{fn.promise}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Youth */}
      <section className="section border-t border-brand-line bg-white">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <PhotoFrame aspect="4/3" tone={2} caption="EARTH Ambassadors, to be photographed" />
            <div>
              <SectionHeading
                eyebrow="The most important part"
                title="Young people at the centre, not in the audience"
              />
              <p className="mt-6 text-base leading-relaxed text-brand-ink/75">
                When we educate a child today we are not only changing one child. We may be educating
                the future mayor, engineer, scientist, entrepreneur, policymaker or national leader who
                will someday make decisions for this planet.
              </p>
              <p className="mt-4 text-base leading-relaxed text-brand-ink/70">
                EARTH Ambassadors educate their classmates, report concerns in their own barangays,
                organise local initiatives and bring their communities in. Not as helpers on somebody
                else's campaign. As the people running it.
              </p>
              <ButtonLink href="/ambassadors" className="mt-8">
                The EARTH Ambassador programme
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Phases and honesty */}
      <section id="phases" className="section scroll-mt-28">
        <div className="container">
          <SectionHeading
            eyebrow="The build"
            title="What exists today, and what does not"
            lead="EARTHLINK as described is five separate systems and roughly 130 build days of work. Pretending it is finished would be the fastest way to lose the trust the platform is asking for."
            className="max-w-2xl"
          />

          <ol className="mt-12 space-y-3">
            {PHASES.map((phase) => (
              <li
                key={phase.number}
                className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border p-5 ${
                  phase.status === "in-build"
                    ? "border-brand-signal-600/40 bg-brand-signal/[0.08]"
                    : "border-brand-line bg-brand-surface"
                }`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="font-data text-xs font-medium text-brand-primary">
                    Phase {phase.number}
                  </span>
                  <span className="text-sm font-bold text-brand-deep">{phase.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-data text-xs text-brand-ink/55">
                    {phase.functions} functions · {phase.days} days
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      phase.status === "in-build"
                        ? "bg-brand-signal text-brand-ink"
                        : "bg-brand-paper text-brand-ink/60 ring-1 ring-inset ring-brand-line"
                    }`}
                  >
                    {phase.status === "in-build" ? "This build" : "Planned"}
                  </span>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-brand-line bg-brand-paper p-6">
              <h3 className="text-base font-bold text-brand-deep">What this build is</h3>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-brand-ink/70">
                {[
                  "Every screen of the full platform, designed and built.",
                  "A working national map with real Philippine boundary data.",
                  "The complete report flow, with real validation.",
                  "The public case record, the pipeline and the transparency dashboard.",
                  "The full information architecture, so Phase 2 has somewhere to put a database.",
                ].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-primary" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-status-referred/30 bg-status-referred/[0.06] p-6">
              <h3 className="text-base font-bold text-status-referred-text">What it is not, yet</h3>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-brand-ink/75">
                {[
                  "There is no database. Nothing you submit is stored or sent.",
                  "There are no accounts, and no logins for agencies or partners.",
                  "Photographs and video cannot be uploaded.",
                  "Every case, mission, count and organisation shown is sample data.",
                  "Lesson content is written in Phase 4, with teachers.",
                ].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-status-referred" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ArrowLink href="/track" className="mt-10">
            See how the platform would report on itself
          </ArrowLink>
        </div>
      </section>

      {/* Credits */}
      <section className="on-ink section bg-brand-ink">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow onInk>Credits</Eyebrow>
            <h2 className="mt-4 text-display-md text-brand-paper">Who made this</h2>
            <p className="mt-6 text-base leading-relaxed text-brand-paper/70">
              EARTHLINK Philippines is the advocacy of {FOUNDER.name}. The platform was designed and
              built by{" "}
              <a
                href={BUILDER.url}
                rel="noreferrer noopener"
                target="_blank"
                className="font-medium text-brand-paper underline decoration-brand-signal decoration-2 underline-offset-4 transition-colors hover:text-brand-signal"
              >
                {BUILDER.name}
              </a>{" "}
              of {BUILDER.studio}.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-brand-paper/55">
              Administrative boundary data is from the Philippine Statistics Authority, via the
              philippines-json-maps project, under the MIT licence.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/report" variant="signal">
                Report a concern
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline-ink">
                Get in touch
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
    </>
  );
}
