import { PageHeader } from "@/components/sections/PageHeader";
import { ButtonLink, SectionHeading } from "@/components/ui/Primitives";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Page not found",
  description: "That page does not exist on EARTHLINK Philippines.",
  path: "/404",
  noIndex: true,
});

const ROUTES = [
  { href: "/report", label: "Report a concern", detail: "The main thing this platform is for." },
  { href: "/map", label: "The EARTH Map", detail: "Every case, plotted across the country." },
  { href: "/cases", label: "The case register", detail: "Every case at every stage." },
  { href: "/track", label: "Transparency dashboard", detail: "The platform's own numbers." },
  { href: "/learn", label: "The learning hub", detail: "Ten topic tracks, plus EARTH Kids." },
  { href: "/act", label: "EARTH Missions", detail: "Volunteer on something happening now." },
];

export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title="That page does not exist"
        lead="The link may be old, or the address may have a typo in it. Nothing has been lost: every case ever filed is still in the register."
      />

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Try one of these" title="Where you probably meant to go" className="max-w-2xl" />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROUTES.map((route) => (
              <ButtonLink
                key={route.href}
                href={route.href}
                variant="outline"
                className="h-auto flex-col items-start gap-1.5 rounded-2xl px-5 py-5 text-left"
              >
                <span className="text-base font-bold text-brand-deep">{route.label}</span>
                <span className="text-xs font-normal leading-relaxed text-brand-ink/65">
                  {route.detail}
                </span>
              </ButtonLink>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
