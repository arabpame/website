import Link from "next/link";
import { CaseChip } from "@/components/ui/CaseChip";
import { CategoryChip } from "@/components/ui/Primitives";
import { formatDateShort } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { EarthCase } from "@/lib/types";

/**
 * A case, as it appears in any list.
 *
 * Every card carries the case chip, which is what makes a list of cases read as a
 * register rather than as a feed of posts.
 */
export function CaseCard({
  item,
  index = 0,
  className,
}: {
  item: EarthCase;
  index?: number;
  className?: string;
}) {
  return (
    <article
      className={cn("reveal group h-full", className)}
      data-reveal-index={index % 3}
    >
      <Link
        href={`/cases/${item.slug}`}
        className="flex h-full flex-col rounded-2xl border border-brand-line bg-brand-surface p-5 shadow-soft transition-all duration-300 ease-expo hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-lift"
      >
        <div className="flex flex-wrap items-center gap-2">
          <CategoryChip category={item.category} />
          {item.reportCount > 1 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-paper px-2.5 py-1 font-data text-[0.6875rem] font-medium text-brand-ink/65 ring-1 ring-inset ring-brand-line">
              {item.reportCount} reports merged
            </span>
          ) : null}
        </div>

        <h3 className="mt-4 text-base font-bold leading-snug text-brand-deep transition-colors group-hover:text-brand-primary">
          {item.title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">{item.summary}</p>

        <div className="mt-auto pt-5">
          <p className="text-xs text-brand-ink/65">
            {[item.barangay, item.municipality, item.province].filter(Boolean).join(", ")}
          </p>
          <div className="mt-3 border-t border-brand-line pt-3">
            <CaseChip caseNumber={item.caseNumber} status={item.status} />
            <p className="mt-2 font-data text-[0.6875rem] text-brand-ink/65">
              Reported {formatDateShort(item.reportedOn)}
              {item.evidenceCount > 0 ? ` · ${item.evidenceCount} ${item.evidenceCount === 1 ? "file" : "files"} of evidence` : ""}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
