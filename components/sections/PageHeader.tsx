import Link from "next/link";
import { Eyebrow, Rule } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";

/**
 * The band every inner page opens with.
 *
 * Dark ink, the hairline grid, an eyebrow, an h1 and a lead. It gives the site one
 * recognisable opening gesture without repeating the homepage's map hero, which is
 * reserved for the homepage because the map is the argument there.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  breadcrumb,
  children,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  breadcrumb?: { label: string; href: string }[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("on-ink relative isolate overflow-hidden bg-brand-ink", className)}>
      <div aria-hidden="true" className="field-grid absolute inset-0 opacity-50" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-ink to-transparent"
      />

      <div className="container relative py-14 sm:py-16 lg:py-20">
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-data text-[0.6875rem] text-brand-paper/60">
              {breadcrumb.map((crumb, i) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  {i > 0 ? <span aria-hidden="true">/</span> : null}
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-brand-signal"
                  >
                    {crumb.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <Eyebrow onInk>{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-4xl text-display-xl text-brand-paper">{title}</h1>
        <Rule onInk className="mt-7 w-16" />
        {lead ? (
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-brand-paper/70">{lead}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
