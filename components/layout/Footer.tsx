import Link from "next/link";
import { BUILDER, CONTACT, FOOTER_NAV, SITE } from "@/lib/constants";
import { MAP_SOURCE } from "@/lib/map";
import { Mark } from "@/components/layout/Header";

export function Footer() {
  /**
   * Computed at render, never hardcoded. A literal year in a footer is wrong from
   * the first of January and nobody notices for months. This is a real bug that
   * exists in another project in this studio's portfolio.
   */
  const year = new Date().getFullYear();

  return (
    <footer className="on-ink border-t border-white/10 bg-brand-ink">
      <div className="container py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5" aria-label="EARTHLINK PH, home">
              <Mark />
              <span className="font-display text-base font-extrabold tracking-tight text-brand-paper">
                EARTHLINK
                <span className="ml-1.5 font-data text-[0.6875rem] font-medium uppercase tracking-eyebrow text-brand-signal">
                  PH
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-paper/70">{SITE.tagline}</p>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-brand-paper/55">
              A platform for reporting environmental problems in Philippine communities, routing them to the
              people who can act, and showing publicly whether anything was done.
            </p>

            <div className="mt-8 space-y-1.5">
              <p className="text-xs uppercase tracking-eyebrow text-brand-paper/40">Get in touch</p>
              <p>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="font-data text-sm text-brand-signal transition-colors hover:text-brand-signal-400"
                >
                  {CONTACT.email}
                </a>
              </p>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_NAV.map((group) => (
              <div key={group.heading}>
                <h2 className="font-data text-[0.6875rem] font-medium uppercase tracking-eyebrow text-brand-signal">
                  {group.heading}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-brand-paper/70 transition-colors duration-200 hover:text-brand-paper"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>


        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs text-brand-paper/50">
              {year} {SITE.name}. All rights reserved.
            </p>
            <p className="text-xs leading-relaxed text-brand-paper/40">
              Map boundaries from{" "}
              <a
                href={MAP_SOURCE.url}
                className="underline decoration-brand-signal/40 underline-offset-2 transition-colors hover:text-brand-paper/70"
                rel="noreferrer noopener"
                target="_blank"
              >
                philippines-json-maps
              </a>{" "}
              (MIT), derived from Philippine Statistics Authority PSGC data.
            </p>
          </div>

          <p className="text-xs text-brand-paper/50">
            Built with care by{" "}
            <a
              href={BUILDER.url}
              className="font-medium text-brand-paper underline decoration-brand-signal decoration-2 underline-offset-4 transition-colors hover:text-brand-signal"
              rel="noreferrer noopener"
              target="_blank"
            >
              {BUILDER.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
