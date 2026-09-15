import Link from "next/link";
import { PageHeader } from "@/components/sections/PageHeader";
import { ArrowLink, ButtonLink, Eyebrow, PhotoFrame, SectionHeading } from "@/components/ui/Primitives";
import { BUILDER, CORE_FUNCTIONS, FOUNDER } from "@/lib/constants";
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
                <p className="mt-0.5 text-sm text-brand-ink/70">{FOUNDER.role}</p>
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
                  <p className="mt-1 text-xs text-brand-ink/65">{fn.title}</p>
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
                else&apos;s campaign. As the people running it.
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
            eyebrow="How it works"
            title="What the platform does today, and where it goes next"
            lead="EARTHLINK is built in stages, in the open. Every number on the site says what it counts, and every case says where its record came from."
            className="max-w-2xl"
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-brand-line bg-brand-paper p-6">
              <h3 className="text-base font-bold text-brand-deep">Live now</h3>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-brand-ink/70">
                {[
                  "Report an environmental concern in four steps, with photographs, from a phone. Every report gets a permanent EARTH case number.",
                  "A national map drawn from Philippine Statistics Authority boundary data, with every case pinned to its city or municipality.",
                  "A public case register: documented 2026 incidents from published reporting, with their sources, alongside reports filed here.",
                  "A six-step status pipeline on every case, from Reported to Monitoring, so anyone can see where it stands.",
                  "The transparency dashboard, where every counter is computed from the cases and missions on the site.",
                ].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-primary" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-brand-line bg-brand-surface p-6">
              <h3 className="text-base font-bold text-brand-deep">Coming next</h3>
              <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-brand-ink/75">
                {[
                  "Verification workflow: filed reports checked, merged with duplicates and referred to the responsible office from inside the platform.",
                  "Agency and partner logins, so an office can acknowledge and update the cases referred to it.",
                  "Case updates by email and text to reporters who asked for them.",
                  "SMS and offline reporting for barangays with poor mobile data.",
                  "Learning tracks written with teachers, and the EARTH Score counted from missions logged on the platform.",
                ].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-signal-600" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ArrowLink href="/track" className="mt-10">
            See how the platform reports on itself
          </ArrowLink>
        </div>
      </section>

      {/* The advocate */}
      <section id="advocate" className="section scroll-mt-28 border-t border-brand-line bg-white">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <PhotoFrame
              aspect="4/3"
              src={FOUNDER.photo.field}
              alt={`${FOUNDER.name} on a littered mangrove shoreline, holding a filled collection sack`}
              position="right"
            />

            <div>
              <SectionHeading eyebrow="The advocate" title="Somebody's name is on this" />

              <p className="mt-6 text-base leading-relaxed text-brand-ink/75">
                EARTHLINK Philippines is the advocacy of {FOUNDER.name}. A platform that asks public
                offices to be accountable in the open cannot itself be anonymous. So it is not run
                by a logo. There is a person attached to it, and he can be contacted.
              </p>

              <p className="mt-4 text-base leading-relaxed text-brand-ink/75">
                That is the same standard the platform applies to everyone else on it. Every case
                carries a number, a named responsible office and a visible clock. The person who
                started it does not get an exemption from that.
              </p>

              <div className="mt-8 border-l-2 border-brand-signal pl-5">
                <p className="text-lg font-medium text-brand-deep">{FOUNDER.name}</p>
                <p className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-ink/65">
                  {FOUNDER.role}
                </p>
              </div>

              <ArrowLink href="/contact" className="mt-8">
                Contact the team
              </ArrowLink>
            </div>
          </div>
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
            <p className="mt-4 text-sm leading-relaxed text-brand-paper/60">
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
