import Link from "next/link";
import { PageHeader } from "@/components/sections/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { ArrowLink, PhotoFrame, SectionHeading } from "@/components/ui/Primitives";
import { FOUNDER } from "@/lib/constants";
import { getOpenMissions } from "@/lib/store";
import { JsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { formatDateShort, pluralise } from "@/lib/utils";

export const metadata = pageMeta({
  title: "Get involved",
  description:
    "Volunteer for a mission, apply as an EARTH Ambassador, or bring your barangay, school or organisation onto the platform.",
  path: "/get-involved",
});

const ROUTES = [
  {
    title: "Report something",
    detail:
      "The most useful thing most people can do, and it takes about five minutes. You do not need an account and you can stay anonymous.",
    href: "/report",
    action: "File a report",
  },
  {
    title: "Volunteer on a mission",
    detail:
      "Cleanups, planting, mangrove rehabilitation, education sessions. Places are limited and attendance is recorded, because a volunteer who shows up is the entire point.",
    href: "/act",
    action: "See open missions",
  },
  {
    title: "Become an EARTH Ambassador",
    detail:
      "For young Filipinos who want to educate their classmates, report in their own barangay and organise locally. Training and materials provided.",
    href: "/ambassadors",
    action: "Read the programme",
  },
  {
    title: "Bring your institution in",
    detail:
      "Barangays, LGUs, schools, agencies, NGOs and companies. A partner account means you see and respond to cases in your own area.",
    href: "/connect",
    action: "How partnering works",
  },
];

export default async function GetInvolvedPage() {
  const missions = await getOpenMissions(4);

  return (
    <>
      <PageHeader
        eyebrow="Get involved"
        title="Four ways in, and one of them takes five minutes"
        lead="You do not have to commit to a programme to be useful here. Most of what this platform needs is people who notice things and take the trouble to write them down properly."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Get involved", href: "/get-involved" },
        ]}
      />

      {/* Key art. Commissioned portraiture, not documentation of a case. */}
      <section className="pb-4">
        <div className="container">
          <PhotoFrame
            aspect="21/9"
            src={FOUNDER.photo.hero}
            alt={`${FOUNDER.name} on a forested ridge above a Philippine coastline`}
            position="right"
            priority
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid gap-5 sm:grid-cols-2">
            {ROUTES.map((route, i) => (
              <Link
                key={route.href}
                href={route.href}
                data-reveal-index={i % 2}
                className="reveal group flex flex-col rounded-2xl border border-brand-line bg-brand-surface p-6 shadow-soft transition-all duration-300 ease-expo hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-lift"
              >
                <h2 className="text-xl font-bold leading-snug text-brand-deep transition-colors group-hover:text-brand-primary">
                  {route.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-ink/70">{route.detail}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
                  {route.action}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5 transition-transform duration-300 ease-expo group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Open missions shortcut */}
      <section className="on-ink section bg-brand-ink">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              onInk
              eyebrow="Open now"
              title="Missions looking for volunteers"
              className="max-w-xl"
            />
            <ArrowLink href="/act" onInk>
              All missions
            </ArrowLink>
          </div>

          <ul className="mt-12 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
            {missions.map((mission) => {
              const remaining = mission.capacity - mission.registered;
              return (
                <li key={mission.slug}>
                  <Link
                    href={`/act/${mission.slug}`}
                    className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.07]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-paper">{mission.title}</p>
                      <p className="mt-0.5 font-data text-xs text-brand-paper/60">
                        {formatDateShort(mission.date)} · {mission.municipality}, {mission.province}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold ${
                        remaining > 0 ? "text-brand-signal" : "text-status-referred"
                      }`}
                    >
                      {remaining > 0
                        ? `${remaining} ${pluralise(remaining, "place")} left`
                        : "Waitlist open"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Form */}
      <section className="section">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="Or just tell us"
                title="Say what you would like to do"
                lead="If none of the four routes fits, write to us. Teachers, barangay officials, scientists, photographers and people who just want to help all end up here, and all of them are useful."
              />
            </div>
            <div className="lg:col-span-7">
              <ContactForm defaultTopic="volunteer" />
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Get involved", path: "/get-involved" },
        ])}
      />
    </>
  );
}
