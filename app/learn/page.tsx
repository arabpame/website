import Link from "next/link";
import { PageHeader } from "@/components/sections/PageHeader";
import { ArrowLink, ButtonLink, CategoryIcon, SectionHeading } from "@/components/ui/Primitives";
import { CATEGORY_META } from "@/lib/taxonomy";
import { getKidsTracks, getTracks } from "@/lib/store";
import { LESSON_COUNT, QUIZ_COUNT } from "@/data/tracks";
import { JsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { pluralise } from "@/lib/utils";

export const metadata = pageMeta({
  title: "The learning hub",
  description:
    "Ten environmental topic tracks for the Philippines, from climate change to environmental law, taught through video, infographics and activities.",
  path: "/learn",
});

const LEVEL_LABEL = {
  foundation: "Foundation",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

export default async function LearnPage() {
  const [tracks, kids] = await Promise.all([getTracks(), getKidsTracks()]);
  const totalMinutes = tracks.reduce(
    (n, t) => n + t.lessons.reduce((m, l) => m + l.duration, 0),
    0,
  );

  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Understand the problem before anyone asks you to solve it"
        lead="Ten topic tracks written for Filipino learners, about Philippine conditions, with Philippine law. Short lessons, honest about what individual action achieves and what it does not."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Learn", href: "/learn" },
        ]}
      >
        <dl className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-4">
          {[
            { label: "Topic tracks", value: String(tracks.length) },
            { label: "Lessons", value: String(LESSON_COUNT) },
            { label: "With a quiz", value: String(QUIZ_COUNT) },
            { label: "Total time", value: `${Math.round(totalMinutes / 60)} hrs` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <dd className="font-data text-xl font-bold text-brand-signal">{item.value}</dd>
              <dt className="mt-1 text-[0.6875rem] text-brand-paper/60">{item.label}</dt>
            </div>
          ))}
        </dl>
      </PageHeader>

      {/* Tracks */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="The ten tracks"
            title="Start anywhere. Most people start with waste."
            lead="Each track stands alone. Nothing requires anything before it, because the person who needs this most is the one who just watched a truck empty into a creek."
            className="max-w-2xl"
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track, i) => {
              const meta = CATEGORY_META[track.category];
              const minutes = track.lessons.reduce((m, l) => m + l.duration, 0);
              return (
                <Link
                  key={track.slug}
                  href={`/learn/${track.slug}`}
                  data-reveal-index={i % 3}
                  className="reveal group flex flex-col rounded-2xl border border-brand-line bg-brand-surface p-5 shadow-soft transition-all duration-300 ease-expo hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-lift"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={meta.textClass}>
                      <CategoryIcon category={track.category} className="h-5 w-5" />
                    </span>
                    <span className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-ink/40">
                      {LEVEL_LABEL[track.level]}
                    </span>
                  </div>

                  <h2 className="mt-5 text-lg font-bold leading-snug text-brand-deep transition-colors group-hover:text-brand-primary">
                    {track.title}
                  </h2>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-ink/70">
                    {track.summary}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-brand-line pt-4">
                    <span className="font-data text-xs text-brand-ink/55">
                      {track.lessons.length} {pluralise(track.lessons.length, "lesson")}
                    </span>
                    <span className="font-data text-xs text-brand-ink/55">{minutes} min</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* EARTH Kids */}
      <section className="on-ink section bg-brand-ink">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                onInk
                eyebrow="EARTH Kids"
                title="For children, the question is different"
                lead="The goal is not to teach a child what climate change is. The goal is to answer the only question they will actually act on: what can I do about it?"
              />
              <ButtonLink href="/learn/earth-kids" variant="signal" className="mt-8">
                Open EARTH Kids
              </ButtonLink>
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-4 sm:grid-cols-3">
                {kids.map((track) => (
                  <Link
                    key={track.slug}
                    href={`/learn/${track.slug}`}
                    className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-brand-signal/40 hover:bg-white/[0.07]"
                  >
                    <span className="text-brand-signal">
                      <CategoryIcon category={track.category} className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-base font-bold leading-snug text-brand-paper">
                      {track.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-brand-paper/60">
                      {track.audience}
                    </p>
                    <p className="mt-4 font-data text-[0.6875rem] text-brand-signal/70">
                      {track.lessons.length} {pluralise(track.lessons.length, "lesson")}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Honesty about curriculum */}
      <section className="section border-t border-brand-line bg-white">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-display-md">About this curriculum</h2>
            <p className="mt-5 text-base leading-relaxed text-brand-ink/75">
              The structure, sequencing and lesson design shown here are complete. The lesson content
              itself is being written with teachers and reviewed against the DepEd curriculum before
              any school uses it.
            </p>
            <p className="mt-4 text-base leading-relaxed text-brand-ink/75">
              That order is deliberate. Environmental education that is factually shaky does more harm
              than none at all, because a student who is corrected once stops trusting the whole
              subject. The platform can wait for the content to be right.
            </p>
            <ArrowLink href="/about#phases" className="mt-8">
              How the build is phased
            </ArrowLink>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
        ])}
      />
    </>
  );
}
