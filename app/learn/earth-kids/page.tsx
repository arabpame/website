import Link from "next/link";
import { PageHeader } from "@/components/sections/PageHeader";
import { ArrowLink, ButtonLink, CategoryIcon, PhotoFrame, SectionHeading } from "@/components/ui/Primitives";
import { CATEGORY_META } from "@/lib/taxonomy";
import { getKidsTracks } from "@/lib/store";
import { JsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { pluralise } from "@/lib/utils";

export const metadata = pageMeta({
  title: "EARTH Kids",
  description:
    "A simplified, child-safe environmental learning area for Filipino children, built around one question: what can I actually do about it?",
  path: "/learn/earth-kids",
});

const SAFEGUARDS = [
  {
    title: "No accounts for children",
    detail:
      "A child never creates an account, and no personal information about a child is collected. A teacher or a parent runs a session from their own device.",
  },
  {
    title: "No open comments",
    detail:
      "There is no comment field, no messaging and no way for an adult stranger to contact a child through this platform. That is a design decision, not a setting.",
  },
  {
    title: "No frightening imagery",
    detail:
      "Climate education for children fails when it produces fear without agency. Every lesson here ends with something the child can actually do this week.",
  },
  {
    title: "Reading level held deliberately low",
    detail:
      "Written for ages seven to eleven, in short sentences, and usable in Filipino or English. A child who cannot read the lesson has not been taught anything.",
  },
];

export default async function EarthKidsPage() {
  const tracks = await getKidsTracks();
  const lessons = tracks.reduce((n, t) => n + t.lessons.length, 0);

  return (
    <>
      <PageHeader
        eyebrow="EARTH Kids"
        title="What can I actually do about it?"
        lead="Every child in a Philippine classroom has been told the planet is in trouble. Very few have been told what their own hands can do about it this week. That gap is what EARTH Kids exists to close."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Learn", href: "/learn" },
          { label: "EARTH Kids", href: "/learn/earth-kids" },
        ]}
      >
        <dl className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
          {[
            { label: "Lesson sets", value: String(tracks.length) },
            { label: "Lessons", value: String(lessons) },
            { label: "Built for ages", value: "7 to 11" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <dd className="font-data text-xl font-bold text-brand-signal">{item.value}</dd>
              <dt className="mt-1 text-[0.6875rem] text-brand-paper/60">{item.label}</dt>
            </div>
          ))}
        </dl>
      </PageHeader>

      {/* Why */}
      <section className="section">
        <div className="container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="The argument"
                title="Teach a child today and you are not only teaching one child"
              />
              <p className="mt-6 text-lg leading-relaxed text-brand-ink/80">
                The ten year old in a classroom in Cavite this morning may be the mayor, the engineer,
                the marine biologist or the barangay captain who decides what happens to that coastline
                in 2050.
              </p>
              <p className="mt-5 text-base leading-relaxed text-brand-ink/70">
                Environmental education should begin well before environmental damage becomes
                irreversible. Not as a warning, which produces anxious children who feel powerless, but
                as a set of things a person can actually do, starting with things small enough for a
                child to own completely.
              </p>
              <ButtonLink href="/learn" variant="outline" className="mt-8">
                The full learning hub
              </ButtonLink>
            </div>

            <PhotoFrame aspect="4/3" tone={3} caption="EARTH Kids session, to be photographed" />
          </div>
        </div>
      </section>

      {/* Lesson sets */}
      <section className="on-ink section bg-brand-ink">
        <div className="container">
          <SectionHeading onInk eyebrow="The lesson sets" title="Three to start with" className="max-w-2xl" />

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {tracks.map((track) => {
              const meta = CATEGORY_META[track.category];
              const minutes = track.lessons.reduce((m, l) => m + l.duration, 0);
              return (
                <Link
                  key={track.slug}
                  href={`/learn/${track.slug}`}
                  className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-signal/40 hover:bg-white/[0.07]"
                >
                  <span className="text-brand-signal">
                    <CategoryIcon category={track.category} className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-xl font-bold leading-snug text-brand-paper">{track.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-paper/70">
                    {track.summary}
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-white/10 pt-4">
                    {track.lessons.map((lesson) => (
                      <li key={lesson.slug} className="flex items-baseline gap-2.5">
                        <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-brand-signal/60" />
                        <span className="text-xs leading-snug text-brand-paper/65">{lesson.title}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-5 font-data text-[0.6875rem] text-brand-signal/70">
                    {track.lessons.length} {pluralise(track.lessons.length, "lesson")} · {minutes} min ·{" "}
                    {meta.label}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Safeguards */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Child safety"
            title="What is deliberately not here"
            lead="A children's area on a public platform that collects citizen reports needs its safeguards stated plainly, not buried in a policy. These are structural, not settings."
            className="max-w-2xl"
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {SAFEGUARDS.map((item, i) => (
              <div
                key={item.title}
                className="reveal rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-soft"
                data-reveal-index={i % 2}
              >
                <div className="flex items-start gap-3">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 2.5 3.5 5v5c0 4 2.8 6.7 6.5 7.5 3.7-.8 6.5-3.5 6.5-7.5V5L10 2.5Z" />
                    <path d="M7.3 10.2 9.2 12l3.5-3.6" />
                  </svg>
                  <div>
                    <h3 className="text-base font-bold text-brand-deep">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <ArrowLink href="/privacy" className="mt-10">
            Read the full privacy notice
          </ArrowLink>
        </div>
      </section>

      {/* For teachers */}
      <section className="section border-t border-brand-line bg-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-display-lg">For teachers and school divisions</h2>
            <p className="mt-6 text-lg leading-relaxed text-brand-ink/75">
              EARTH Kids is built to be run by a teacher in a classroom with no preparation and no
              equipment beyond what is already in the room. Each lesson set includes a facilitator note,
              a printable activity and a way to record that the session happened, so a school can count
              it towards its own EARTH Score.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/contact">Talk to us about your school</ButtonLink>
              <ButtonLink href="/score" variant="outline">
                How EARTH Score works
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
          { name: "EARTH Kids", path: "/learn/earth-kids" },
        ])}
      />
    </>
  );
}
