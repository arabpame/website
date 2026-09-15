import { PageHeader } from "@/components/sections/PageHeader";
import { ButtonLink, Eyebrow, PhotoFrame, SectionHeading } from "@/components/ui/Primitives";
import { JsonLd, breadcrumbJsonLd, faqJsonLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "EARTH Ambassadors",
  description:
    "A programme for young Filipinos who want to educate their classmates, report concerns in their own barangay and organise action in their own community.",
  path: "/ambassadors",
});

const DOES = [
  {
    title: "Educate their own classmates",
    detail:
      "Running a LEARN track or an EARTH Kids session with a class, which is far more effective coming from a peer than from a visiting adult.",
  },
  {
    title: "Report what they see",
    detail:
      "Filing verified reports from their own barangay, with the documentation quality that makes a case actually usable by an agency.",
  },
  {
    title: "Organise locally",
    detail:
      "Raising a mission from a verified case, recruiting volunteers, and recording the result afterwards so it counts.",
  },
  {
    title: "Bring their community in",
    detail:
      "Getting the barangay council, the school and local organisations onto the platform, which is the part nobody else can do for them.",
  },
];

const STAGES = [
  { stage: "Apply", detail: "A short application with your school, your barangay, and one environmental problem in your own area you would start with." },
  { stage: "Guardian consent", detail: "Required for anyone under 18, before anything else happens. No exceptions and no shortcuts." },
  { stage: "Orientation", detail: "Two sessions covering safe reporting, evidence quality, and what to do when an adult tells you to stop." },
  { stage: "First mission", detail: "You run one, with support. Most people find this is the part that changes how they see their own barangay." },
  { stage: "Toolkit and dashboard", detail: "Your own page showing your reports, missions, materials to share, and your own impact numbers." },
];

const FAQ = [
  {
    question: "How old do I have to be to become an EARTH Ambassador?",
    answer:
      "There is no minimum age, but anyone under 18 needs written guardian consent before they can be accepted, and under-16 ambassadors are not assigned to field reporting on illegal activity of any kind.",
  },
  {
    question: "Is being an EARTH Ambassador safe?",
    answer:
      "Ambassadors are trained never to confront anyone and never to gather evidence at personal risk. Reports on illegal logging, wildlife trade or dumping by organised operations are handled by the verification team, not by the ambassador who raised them, and identity can always be withheld.",
  },
  {
    question: "How much time does it take?",
    answer:
      "Realistically a few hours a month. One classroom session, one or two reports, and one mission a quarter is a full contribution. The programme is designed around students who also have to pass their subjects.",
  },
  {
    question: "Do ambassadors get paid?",
    answer:
      "No. This is a volunteer programme. Ambassadors get training, materials, a record of what they achieved that can support a scholarship or university application, and recognition through the annual Young Environmental Champion award.",
  },
];

export default function AmbassadorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="EARTH Ambassadors"
        title="You do not need a position to start"
        lead="A programme for young Filipinos who would rather do something about an environmental problem than post about it. Training, materials, a community, and a record of what you actually achieved."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Ambassadors", href: "/ambassadors" },
        ]}
      />

      {/* What they do */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="The role"
            title="Four things an ambassador actually does"
            lead="Not a title and a certificate. These are the four activities the programme exists to support, and the fourth is the one that decides whether a barangay ever uses this platform."
            className="max-w-2xl"
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {DOES.map((item, i) => (
              <div
                key={item.title}
                className="reveal rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-soft"
                data-reveal-index={i % 2}
              >
                <span className="font-data text-xs font-medium tracking-eyebrow text-brand-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-bold leading-snug text-brand-deep">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to join */}
      <section className="on-ink section bg-brand-ink">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                onInk
                eyebrow="How to join"
                title="Five stages, and one of them is not optional"
                lead="Guardian consent for anyone under 18 comes before anything else. That is a structural rule, not a form to work around."
              />
              <ButtonLink href="/get-involved" variant="signal" className="mt-8">
                Start an application
              </ButtonLink>
              <p className="mt-4 text-xs leading-relaxed text-brand-paper/50">
                The application form is Phase 5 of the build. For now this goes to the general
                involvement page.
              </p>
            </div>

            <ol className="space-y-px overflow-hidden rounded-2xl border border-white/10 lg:col-span-7">
              {STAGES.map((item, i) => (
                <li key={item.stage} className="bg-white/[0.03] px-5 py-5">
                  <div className="flex items-baseline gap-4">
                    <span className="font-data text-[0.6875rem] text-brand-signal/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-brand-paper">{item.stage}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-brand-paper/65">{item.detail}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* The toolkit */}
      <section className="section">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="The toolkit"
                title="Your own dashboard, with your own numbers"
              />
              <p className="mt-6 text-base leading-relaxed text-brand-ink/75">
                Every ambassador gets a page showing the reports they filed, the missions they ran, the
                students they reached, and the cases that were resolved because of them.
              </p>
              <p className="mt-4 text-base leading-relaxed text-brand-ink/70">
                It exists for a practical reason as much as a motivational one. A seventeen year old
                applying for a scholarship, a university place or a local government youth position can
                point to a verifiable public record of environmental work, with dates and measured
                results, rather than to a description of their own enthusiasm.
              </p>

              <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-brand-line pt-8">
                {[
                  { label: "Reports filed", value: "Tracked" },
                  { label: "Missions run", value: "Tracked" },
                  { label: "Students reached", value: "Tracked" },
                  { label: "Cases resolved", value: "Tracked" },
                ].map((item) => (
                  <div key={item.label}>
                    <dd className="font-data text-lg font-bold text-brand-deep">{item.value}</dd>
                    <dt className="mt-0.5 text-xs text-brand-ink/60">{item.label}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <PhotoFrame aspect="4/5" tone={1} caption="Ambassador orientation, to be photographed" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section border-t border-brand-line bg-white">
        <div className="container">
          <SectionHeading eyebrow="Questions" title="Before you apply" className="max-w-2xl" />

          <dl className="mt-12 grid gap-x-12 gap-y-8 lg:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.question} className="reveal">
                <dt className="text-base font-bold text-brand-deep">{item.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-brand-ink/70">{item.answer}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-14 rounded-2xl border border-brand-line bg-brand-paper p-6">
            <Eyebrow>Safety comes first, every time</Eyebrow>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-ink/75">
              Environmental defenders in the Philippines face real risk, and that is not something a
              youth programme should treat lightly. No ambassador is ever asked to confront anyone,
              enter private land, or document illegal activity at close range. If a situation feels
              wrong, the instruction is to leave and report it from somewhere safe. A report filed from
              a distance is worth more than any photograph that costs someone their safety.
            </p>
          </div>
        </div>
      </section>

      <JsonLd
        data={[
          faqJsonLd(FAQ),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ambassadors", path: "/ambassadors" },
          ]),
        ]}
      />
    </>
  );
}
