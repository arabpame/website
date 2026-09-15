import { STATUS_META, STATUS_ORDER } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import type { CaseStatus } from "@/lib/types";

/**
 * The signature element of this design.
 *
 * A monospaced EARTH case number, a status dot, and a six-segment pipeline rail:
 *
 *   EARTH-2026-0417  [#][#][#][ ][ ][ ]  Action in progress
 *
 * It is the visual proof of the platform's only real promise, that a report
 * becomes a tracked object rather than a post that scrolls away. It appears on
 * cards, on map pins, on the case page, in the dashboard and in the admin queue,
 * and it is the reason those screens read as one system.
 *
 * Colour is never the only carrier of meaning here. The rail shows position, the
 * dot shows colour, and the label shows words. It still works in greyscale.
 */

export function StatusRail({
  status,
  className,
  onInk = false,
}: {
  status: CaseStatus;
  className?: string;
  onInk?: boolean;
}) {
  const current = STATUS_META[status].step;

  return (
    <span
      className={cn("inline-flex items-center gap-[3px]", className)}
      role="img"
      aria-label={`Step ${current} of 6: ${STATUS_META[status].label}`}
    >
      {STATUS_ORDER.map((key) => {
        const step = STATUS_META[key].step;
        const reached = step <= current;
        return (
          <span
            key={key}
            aria-hidden="true"
            className={cn(
              "h-[3px] w-3 rounded-full transition-colors duration-300",
              reached
                ? STATUS_META[status].dotClass
                : onInk
                  ? "bg-white/20"
                  : "bg-brand-line",
            )}
          />
        );
      })}
    </span>
  );
}

export function StatusDot({ status, className }: { status: CaseStatus; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full", STATUS_META[status].dotClass, className)}
    />
  );
}

export function StatusChip({
  status,
  className,
  showMeaning = false,
}: {
  status: CaseStatus;
  className?: string;
  showMeaning?: boolean;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        meta.chipClass,
        className,
      )}
      title={showMeaning ? meta.meaning : undefined}
    >
      <StatusDot status={status} />
      {meta.label}
    </span>
  );
}

export function CaseNumber({
  caseNumber,
  className,
  onInk = false,
}: {
  caseNumber: string;
  className?: string;
  onInk?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-data text-xs font-medium tracking-tight",
        onInk ? "text-brand-signal" : "text-brand-primary",
        className,
      )}
    >
      {caseNumber}
    </span>
  );
}

/**
 * The full chip. Case number, rail, status label.
 */
export function CaseChip({
  caseNumber,
  status,
  className,
  onInk = false,
}: {
  caseNumber: string;
  status: CaseStatus;
  className?: string;
  onInk?: boolean;
}) {
  const meta = STATUS_META[status];
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-3 gap-y-1.5", className)}>
      <CaseNumber caseNumber={caseNumber} onInk={onInk} />
      <StatusRail status={status} onInk={onInk} />
      <span className={cn("text-xs font-semibold", onInk ? "text-brand-paper/80" : meta.textClass)}>
        {meta.label}
      </span>
    </span>
  );
}
