import Link from "next/link";
import { PageHeader } from "@/components/sections/PageHeader";
import { MapExplorer } from "@/components/map/MapExplorer";
import { CategoryIcon, SectionHeading } from "@/components/ui/Primitives";
import { getCases, getHotspots } from "@/lib/store";
import { MAP_SOURCE } from "@/lib/map";
import { JsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";

/**
 * Cases can change in the database without a deploy (a report deleted, a status
 * edited), so this page also rebuilds itself every five minutes. A new report
 * still appears at once, through revalidatePath in the Server Action.
 */
export const revalidate = 300;

export const metadata = pageMeta({
  title: "The EARTH Map",
  description:
    "Every environmental case plotted across the Philippines. Filter by seven category layers and six case states, and find where problems keep returning.",
  path: "/map",
});

export default async function MapPage() {
  const [cases, hotspots] = await Promise.all([getCases(), getHotspots()]);

  return (
    <>
      <PageHeader
        eyebrow="The EARTH Map"
        title="Every case, on one map"
        lead="Seven category layers across the whole country. The point is not to display what went wrong. It is to show where the same problem keeps returning, so that intervention can happen before the next one."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "EARTH Map", href: "/map" },
        ]}
      />

      <section className="section">
        <div className="container">
          <MapExplorer cases={cases} />
        </div>
      </section>

      {/* Hotspots */}
      <section className="section border-t border-brand-line bg-white">
        <div className="container">
          <SectionHeading
            eyebrow="Hotspots"
            title="Where it keeps happening"
            lead="Any place with more than one case. This is the view that turns a record of complaints into a case for prevention, and it is the reason the map matters more than the list."
            className="max-w-2xl"
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hotspots.map((spot, i) => (
              <div
                key={`${spot.place}-${spot.municipality}`}
                className="reveal rounded-2xl border border-brand-line bg-brand-paper p-5"
                data-reveal-index={i % 3}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-bold leading-snug text-brand-deep">{spot.place}</p>
                    <p className="mt-0.5 text-xs text-brand-ink/55">
                      {spot.municipality}, {spot.province}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-ink px-2.5 py-1 font-data text-xs font-semibold text-brand-signal">
                    {spot.cases.length}
                  </span>
                </div>

                <ul className="mt-4 space-y-2 border-t border-brand-line pt-4">
                  {spot.cases.map((c) => (
                    <li key={c.caseNumber}>
                      <Link
                        href={`/cases/${c.slug}`}
                        className="group flex items-start gap-2.5 text-xs leading-snug text-brand-ink/70 transition-colors hover:text-brand-deep"
                      >
                        <span className="mt-px shrink-0 text-brand-ink/50">
                          <CategoryIcon category={c.category} className="h-3.5 w-3.5" />
                        </span>
                        <span className="group-hover:underline">{c.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {hotspots.length === 0 ? (
            <p className="mt-12 text-sm text-brand-ink/60">
              No place currently has more than one case.
            </p>
          ) : null}
        </div>
      </section>

      {/* Provenance */}
      <section className="on-ink section bg-brand-ink">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                onInk
                eyebrow="About this map"
                title="Real boundaries, not an illustration"
              />
              <p className="mt-6 text-base leading-relaxed text-brand-paper/70">
                The coastline and the seventeen administrative regions are drawn from Philippine
                Statistics Authority PSGC boundary data, simplified for the web. Case pins are placed
                by latitude and longitude through the same projection, so a pin lands where the
                coordinates actually are.
              </p>
              <p className="mt-4 text-base leading-relaxed text-brand-paper/70">
                An automated check runs before every release. It projects nineteen known Philippine
                cities and every case on the platform and confirms each one falls inside the region it
                claims. A pin in the wrong sea fails the build.
              </p>
            </div>

            <dl className="space-y-6">
              {[
                { term: "Boundary source", detail: MAP_SOURCE.text },
                {
                  term: "Projection",
                  detail:
                    "Equirectangular with a cosine correction at the archipelago's mid-latitude. Accurate enough for a national map and it needs no library.",
                },
                {
                  term: "Why not a tile provider",
                  detail:
                    "No API key to leak, no per-load bill, no content security policy problem, and it works with no network at all. A licensed tile provider can be added later, when clustering at national scale is needed.",
                },
                {
                  term: "Rendering",
                  detail:
                    "Server-rendered SVG, so every pin is in the HTML. A crawler sees the cases, and so does a visitor whose JavaScript never arrives.",
                },
              ].map((item) => (
                <div key={item.term} className="border-l-2 border-brand-signal/30 pl-5">
                  <dt className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-signal">
                    {item.term}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-brand-paper/65">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "EARTH Map", path: "/map" },
        ])}
      />
    </>
  );
}
