import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { ArrowLink, ButtonLink, CategoryChip, Eyebrow } from "@/components/ui/Primitives";
import { getTrack, getTrackSlugs, getTracks } from "@/lib/store";
import { JsonLd, MAX_DESCRIPTION, MAX_PAGE_TITLE, breadcrumbJsonLd, courseJsonLd, pageMeta, trim } from "@/lib/seo";
import { pluralise } from "@/lib/utils";
import type { Lesson } from "@/lib/types";

export async function generateStaticParams() {
  const slugs = await getTrackSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const track = await getTrack(slug);
  if (!track)
    return pageMeta({ title: "Track not found", description: "This track does not exist.", path: "/learn" });

  return pageMeta({
    title: trim(track.title, MAX_PAGE_TITLE),
    description: trim(track.summary, MAX_DESCRIPTION),
    path: `/learn/${track.slug}`,
  });
}

const FORMAT_LABEL: Record<Lesson["format"], string> = {
  video: "Video",
  infographic: "Infographic",
  reading: "Reading",
  activity: "Activity",
};

function FormatIcon({ format }: { format: Lesson["format"] }) {
  const common = {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "h-4 w-4",
  };
  switch (format) {
    case "video":
      return (
        <svg {...common}>
          <rect x="1.5" y="3.5" width="13" height="9" rx="2" />
          <path d="M6.5 6.5 10 8l-3.5 1.5V6.5Z" />
        </svg>
      );
    case "infographic":
      return (
        <svg {...common}>
          <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
          <path d="M5 11V7M8 11V4.5M11 11V8.5" />
        </svg>
      );
    case "reading":
      return (
        <svg {...common}>
          <path d="M8 3.5c-1.6-1.2-3.2-1.2-4.8-.7v9c1.6-.5 3.2-.5 4.8.7 1.6-1.2 3.2-1.2 4.8-.7v-9c-1.6-.5-3.2-.5-4.8.7ZM8 3.5v9.5" />
        </svg>
      );
    case "activity":
      return (
        <svg {...common}>
          <path d="M8 1.8 9.9 5.7l4.3.6-3.1 3L11.8 14 8 11.9 4.2 14l.7-4.7-3.1-3 4.3-.6L8 1.8Z" />
        </svg>
      );
  }
}

export default async function TrackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const track = await getTrack(slug);
  if (!track) notFound();

  const allTracks = await getTracks();
  const related = allTracks.filter((t) => t.slug !== track.slug).slice(0, 3);
  const minutes = track.lessons.reduce((m, l) => m + l.duration, 0);
  const quizzes = track.lessons.filter((l) => l.hasQuiz).length;

  return (
    <>
      <PageHeader
        eyebrow={track.kids ? "EARTH Kids" : track.topic}
        title={track.title}
        lead={track.summary}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Learn", href: "/learn" },
          ...(track.kids ? [{ label: "EARTH Kids", href: "/learn/earth-kids" }] : []),
          { label: track.title, href: `/learn/${track.slug}` },
        ]}
      >
        <dl className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-4">
          {[
            { label: "Lessons", value: String(track.lessons.length) },
            { label: "Total time", value: `${minutes} min` },
            { label: "Quizzes", value: String(quizzes) },
            { label: "Level", value: track.level === "foundation" ? "Foundation" : track.level === "intermediate" ? "Intermediate" : "Advanced" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <dd className="font-data text-lg font-bold text-brand-signal">{item.value}</dd>
              <dt className="mt-1 text-[0.6875rem] text-brand-paper/60">{item.label}</dt>
            </div>
          ))}
        </dl>
      </PageHeader>

      <section className="section">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h2 className="text-display-md">The lessons</h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-ink/65">
                In order, though nothing stops you starting where you need to.
              </p>

              <ol className="mt-8 space-y-3">
                {track.lessons.map((lesson, i) => (
                  <li
                    key={lesson.slug}
                    className="rounded-2xl border border-brand-line bg-brand-surface p-5 shadow-soft"
                  >
                    <div className="flex items-start gap-4">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-paper font-data text-xs font-bold text-brand-primary">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold leading-snug text-brand-deep">
                          {lesson.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-brand-ink/70">
                          {lesson.summary}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                          <span className="inline-flex items-center gap-1.5 font-data text-[0.6875rem] text-brand-ink/55">
                            <FormatIcon format={lesson.format} />
                            {FORMAT_LABEL[lesson.format]}
                          </span>
                          <span className="font-data text-[0.6875rem] text-brand-ink/55">
                            {lesson.duration} min
                          </span>
                          {lesson.hasQuiz ? (
                            <span className="rounded-full bg-brand-signal/20 px-2 py-0.5 font-data text-[0.6875rem] font-semibold uppercase tracking-eyebrow text-brand-deep">
                              Quiz
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-8 rounded-2xl border border-status-referred/30 bg-status-referred/[0.07] p-5">
                <p className="text-sm font-bold text-status-referred-text">
                  Lesson content is Phase 4
                </p>
                <p className="mt-2 text-sm leading-relaxed text-brand-ink/75">
                  The structure, sequencing, formats and assessment design are complete and shown here
                  in full. The teaching material itself is written with teachers and reviewed against
                  the DepEd curriculum before any school uses it.
                </p>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="space-y-5 lg:sticky lg:top-28">
                <div className="rounded-2xl border border-brand-line bg-brand-surface p-5">
                  <Eyebrow>Who this is for</Eyebrow>
                  <p className="mt-3 text-sm leading-relaxed text-brand-ink/75">{track.audience}</p>
                  <div className="mt-5 border-t border-brand-line pt-4">
                    <CategoryChip category={track.category} />
                    <p className="mt-3 text-xs leading-relaxed text-brand-ink/60">
                      Reports in this category go to the same offices this track teaches you about.
                    </p>
                  </div>
                </div>

                <div className="on-ink rounded-2xl bg-brand-ink p-5">
                  <Eyebrow onInk>Then do something with it</Eyebrow>
                  <p className="mt-3 text-sm leading-relaxed text-brand-paper/70">
                    Education that stops at understanding is a lecture. When you next see this problem
                    in your own community, the platform is the other half of the lesson.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    <ButtonLink href="/report" variant="signal" className="px-5 py-2.5 text-xs">
                      Report a concern
                    </ButtonLink>
                    <ButtonLink href="/act" variant="outline-ink" className="px-5 py-2.5 text-xs">
                      Join a mission
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section border-t border-brand-line bg-white">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-display-md">Other tracks</h2>
            <ArrowLink href="/learn">All tracks</ArrowLink>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {related.map((other) => (
              <Link
                key={other.slug}
                href={`/learn/${other.slug}`}
                className="group rounded-2xl border border-brand-line bg-brand-paper p-5 transition-all duration-300 hover:border-brand-primary/30 hover:bg-white"
              >
                <h3 className="text-base font-bold leading-snug text-brand-deep group-hover:text-brand-primary">
                  {other.title}
                </h3>
                <p className="mt-2 font-data text-xs text-brand-ink/55">
                  {other.lessons.length} {pluralise(other.lessons.length, "lesson")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        data={[
          courseJsonLd(track),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Learn", path: "/learn" },
            { name: track.title, path: `/learn/${track.slug}` },
          ]),
        ]}
      />
    </>
  );
}
