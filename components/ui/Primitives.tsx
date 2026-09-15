import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { CATEGORY_META, URGENCY_META } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import type { CaseCategory, Urgency } from "@/lib/types";

/**
 * The small shared surface. Deliberately hand-assembled and deliberately short:
 * every primitive here is used on at least three pages.
 */

// ---------------------------------------------------------------------------
// Eyebrow, rule, section heading
// ---------------------------------------------------------------------------

export function Eyebrow({
  children,
  onInk = false,
  className,
}: {
  children: ReactNode;
  onInk?: boolean;
  className?: string;
}) {
  return <p className={cn(onInk ? "eyebrow-ink" : "eyebrow", className)}>{children}</p>;
}

export function Rule({ onInk = false, className }: { onInk?: boolean; className?: string }) {
  return <div aria-hidden="true" className={cn(onInk ? "rule-ink" : "rule", className)} />;
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  onInk = false,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  onInk?: boolean;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "mx-auto max-w-2xl text-center", className)}>
      {eyebrow ? <Eyebrow onInk={onInk}>{eyebrow}</Eyebrow> : null}
      <h2
        className={cn(
          "mt-3 text-display-lg",
          onInk && "text-brand-paper",
        )}
      >
        {title}
      </h2>
      <Rule onInk={onInk} className={cn("mt-5", align === "center" && "mx-auto")} />
      {lead ? (
        <p className={cn("mt-5 text-lg leading-relaxed", onInk ? "text-brand-paper/70" : "text-brand-ink/75", align === "center" && "mx-auto")}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buttons and links
// ---------------------------------------------------------------------------

type ButtonVariant = "primary" | "signal" | "outline" | "outline-ink";

const BUTTON_CLASS: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  signal: "btn-signal",
  outline: "btn-outline",
  "outline-ink": "btn-outline-ink",
};

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link href={href} className={cn(BUTTON_CLASS[variant], className)} {...rest}>
      {children}
    </Link>
  );
}

export function ArrowLink({
  href,
  children,
  onInk = false,
  className,
}: {
  href: string;
  children: ReactNode;
  onInk?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      // min-h-[1.75rem] and the vertical padding are not decoration. Without them
      // this link measured 133x19, and WCAG 2.2 (2.5.8) requires a 24 by 24 target
      // for any pointer control that is not inline inside a sentence. These are
      // standalone links, so the exemption does not apply to them.
      className={cn(
        "group inline-flex min-h-[1.75rem] items-center gap-2 py-1 text-sm font-semibold transition-colors duration-300",
        onInk ? "text-brand-signal hover:text-brand-signal-400" : "text-brand-primary hover:text-brand-deep",
        className,
      )}
    >
      {children}
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
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Category and urgency
// ---------------------------------------------------------------------------

/**
 * Each category has its own icon SHAPE as well as its own colour, so the seven
 * layers are still distinguishable to a colour-blind reader and in greyscale.
 */
export function CategoryIcon({ category, className }: { category: CaseCategory; className?: string }) {
  const common = {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: cn("h-4 w-4", className),
  };

  switch (category) {
    case "water":
      return (
        <svg {...common}>
          <path d="M1.5 9.5c1.6-1.4 3.2-1.4 4.8 0s3.2 1.4 4.8 0 3.2-1.4 3.4 0M1.5 12.8c1.6-1.4 3.2-1.4 4.8 0s3.2 1.4 4.8 0 3.2-1.4 3.4 0M8 2v4" />
        </svg>
      );
    case "forest":
      return (
        <svg {...common}>
          <path d="M8 1.5 4 7h2.4L3.2 11.5h9.6L9.6 7H12L8 1.5ZM8 11.5v3" />
        </svg>
      );
    case "waste":
      return (
        <svg {...common}>
          <path d="M5.2 2.6 3 6.4l2.6 1.5M10.8 2.6 13 6.4l-2.6 1.5M8 13.4H4.4l1.3-2.4M8 13.4h3.6l-1.3-2.4M3 6.4l-1 3.5 2.6.7M13 6.4l1 3.5-2.6.7" />
        </svg>
      );
    case "air":
      return (
        <svg {...common}>
          <path d="M1.8 5.5h7.4a2 2 0 1 0-2-2M1.8 8.5h10a2 2 0 1 1-2 2M1.8 11.5h5.4" />
        </svg>
      );
    case "biodiversity":
      return (
        <svg {...common}>
          <path d="M8 13.5c3.3 0 6-2.5 6-5.8 0-1.4-.6-2.7-1.5-3.6-1 1.6-2.6 1.4-4.5 2.2C6 6.6 4.7 8 4.7 9.9M2.2 13.5c.6-2.4 1.6-4.2 3-5.4" />
        </svg>
      );
    case "land":
      return (
        <svg {...common}>
          <path d="M1.5 11.5h13M2.8 11.5 6 6l2.2 3.2L10.4 5l2.8 6.5M1.5 14h13" />
        </svg>
      );
    case "hazard":
      return (
        <svg {...common}>
          <path d="M8 2 1.8 13h12.4L8 2ZM8 6.4v3.1M8 11.4h.01" />
        </svg>
      );
  }
}

export function CategoryChip({
  category,
  className,
  withIcon = true,
}: {
  category: CaseCategory;
  className?: string;
  withIcon?: boolean;
}) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        meta.chipClass,
        className,
      )}
    >
      {withIcon ? <CategoryIcon category={category} className="h-3.5 w-3.5" /> : null}
      {meta.label}
    </span>
  );
}

export function UrgencyChip({ urgency, className }: { urgency: Urgency; className?: string }) {
  const meta = URGENCY_META[urgency];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        meta.ringClass,
        className,
      )}
      title={meta.note}
    >
      {meta.label} urgency
    </span>
  );
}

// ---------------------------------------------------------------------------
// Data display
// ---------------------------------------------------------------------------

/**
 * A single figure with its label and, crucially, the basis on which it is counted.
 *
 * The basis line is not decoration. A dashboard that shows "4,210 kg of waste" and
 * does not say what was counted is making a claim, not a measurement, and the
 * research on environmental dashboards is blunt about this being where public
 * trust is lost.
 */
export function Stat({
  value,
  label,
  basis,
  unit,
  onInk = false,
  className,
}: {
  value: string;
  label: string;
  basis?: string;
  unit?: string;
  onInk?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className={cn("font-data text-3xl font-bold tracking-tight sm:text-4xl", onInk ? "text-brand-signal" : "text-brand-deep")}>
        {value}
        {unit ? <span className="ml-1 text-xl font-medium opacity-70">{unit}</span> : null}
      </p>
      <p className={cn("mt-1.5 text-sm font-semibold", onInk ? "text-brand-paper" : "text-brand-ink")}>{label}</p>
      {basis ? (
        <p className={cn("mt-1 text-xs leading-relaxed", onInk ? "text-brand-paper/55" : "text-brand-ink/60")}>{basis}</p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Photo placeholder
// ---------------------------------------------------------------------------

const PHOTO_TONES = [
  "from-brand-deep to-brand-ink",
  "from-brand-primary-700 to-brand-deep",
  "from-[#123c3a] to-[#07231E]",
  "from-[#0d4a3d] to-[#0a2e28]",
] as const;

/**
 * Photography has not been supplied. The valuation lists twelve photographs as a
 * precondition for a build day, and shipping stock images pretending to be
 * Philippine communities would be worse than an honest gap.
 *
 * So every photo slot renders this: a tone-matched gradient with grain and a
 * visible tag. An empty state that reads as deliberate rather than broken. Tones
 * cycle so two placeholders side by side never look identical.
 */
export function PhotoFrame({
  aspect = "4/3",
  tone = 0,
  caption,
  className,
  src,
  alt,
  priority = false,
  position = "center",
}: {
  aspect?: "4/3" | "4/5" | "3/4" | "square" | "21/9" | "16/9";
  tone?: number;
  caption?: string;
  className?: string;
  /** A real photograph. Without it the frame stays an honest placeholder. */
  src?: string;
  /** Required whenever src is set. Describes the photograph, not the layout. */
  alt?: string;
  priority?: boolean;
  /** object-position, for steering the crop at narrow widths. */
  position?: "center" | "top" | "left" | "right";
}) {
  const aspectClass =
    aspect === "square"
      ? "aspect-square"
      : aspect === "4/5"
        ? "aspect-[4/5]"
        : aspect === "3/4"
          ? "aspect-[3/4]"
          : aspect === "21/9"
            ? "aspect-[21/9]"
            : aspect === "16/9"
              ? "aspect-[16/9]"
              : "aspect-[4/3]";

  const toneClass = PHOTO_TONES[tone % PHOTO_TONES.length];

  const positionClass =
    position === "top"
      ? "object-top"
      : position === "left"
        ? "object-left"
        : position === "right"
          ? "object-right"
          : "object-center";

  // A real photograph. The frame, the radius and the border stay identical to the
  // placeholder, so a page half-photographed does not look half-built.
  if (src) {
    return (
      <div
        className={cn(
          "relative max-w-full overflow-hidden rounded-2xl border border-brand-line/60 bg-brand-ink",
          aspectClass,
          className,
        )}
      >
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={cn("object-cover", positionClass)}
        />
        {caption ? (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-ink/85 to-transparent"
            />
            <span className="absolute inset-x-4 bottom-4 text-sm font-medium text-brand-paper">{caption}</span>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative max-w-full overflow-hidden rounded-2xl border border-brand-line/60 bg-gradient-to-br",
        aspectClass,
        toneClass,
        className,
      )}
    >
      <div aria-hidden="true" className="grain absolute inset-0 opacity-[0.22] mix-blend-overlay" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(7,35,30,0.55)_100%)]"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <span className="font-data text-[0.6875rem] uppercase tracking-eyebrow text-brand-signal/80">
          Photograph to be supplied
        </span>
      </div>
      {caption ? (
        <span className="absolute left-4 top-4 max-w-[80%] text-sm font-medium text-brand-paper/85">{caption}</span>
      ) : null}
    </div>
  );
}
