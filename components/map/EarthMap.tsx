import { useId } from "react";
import { getShapes, project, VIEW_BOX, VIEW_WIDTH, VIEW_HEIGHT } from "@/lib/map";
import { CATEGORY_META } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import type { EarthCase } from "@/lib/types";

/**
 * The EARTH Map.
 *
 * A server-rendered SVG of the Philippines with a pin per case. No map library, no
 * tile provider, no API key, no per-load cost, and nothing to break on a machine
 * with no network. The geometry is real PSA administrative boundary data, built
 * once by scripts/build-map.mjs and committed.
 *
 * This is a deliberate Phase 1 choice, recorded in STACK_DECISION.md. Mapbox
 * belongs in Phase 2, when there is real geodata, real clustering at scale and a
 * reason to pay for tiles. For a design build, a licensed tile provider would add
 * a bill, a key to leak, a content security policy problem and a network
 * dependency, in exchange for detail nobody needs to evaluate the design.
 *
 * Because it renders on the server, the pins are in the HTML. A crawler sees them,
 * and so does a visitor whose JavaScript never arrives.
 */

export interface EarthMapProps {
  cases: EarthCase[];
  /** "hero" drops the 300 smallest islands. See lib/map.ts. */
  detail?: "full" | "hero";
  /** Pins pulse gently to signal that this is live data, not an illustration. */
  animate?: boolean;
  className?: string;
  /** Rendered above the pins, for a legend or label placed by the parent. */
  children?: React.ReactNode;
}

export function EarthMap({ cases, detail = "full", animate = true, className, children }: EarthMapProps) {
  const shapes = getShapes(detail);

  /**
   * The gradient id must be unique per instance.
   *
   * The homepage renders this component twice, once in the hero and once in the
   * map section, and a fixed id produced two elements with the same id in one
   * document. That is invalid HTML, and an SVG `url(#id)` reference resolves to
   * whichever one the browser saw first, so the second map's pin glow silently
   * took its colour from the first map.
   */
  const glowId = `earthmap-pin-glow-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={VIEW_BOX}
        className="h-full w-full"
        role="img"
        aria-label={`Map of the Philippines showing ${cases.length} environmental cases.`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* A soft glow so pins read against the dark landmass without a hard ring. */}
          <radialGradient id={glowId}>
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.45" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* The archipelago. Decorative as far as assistive technology is concerned:
            the accessible content is the case list rendered by the parent page. */}
        <g aria-hidden="true">
          {shapes.map((d, i) => (
            <path
              key={i}
              d={d}
              className="fill-brand-deep/70 stroke-brand-signal/20"
              strokeWidth={0.5}
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* Pins. Drawn after the landmass so they always sit on top. */}
        <g aria-hidden="true">
          {cases.map((c, i) => {
            const { x, y } = project(c.lat, c.lng);
            const meta = CATEGORY_META[c.category];
            const isUrgent = c.urgency === "critical" || c.urgency === "high";
            return (
              <g
                key={c.caseNumber}
                style={
                  animate
                    ? { color: meta.hex, animationDelay: `${Math.min(i * 80, 1600)}ms` }
                    : { color: meta.hex }
                }
                className={animate ? "animate-pin-drop" : undefined}
              >
                <circle cx={x} cy={y} r={14} fill={`url(#${glowId})`} />
                {/* A critical or high case gets a slow ping. Urgency is carried by
                    motion as well as by colour and by the label in the list. */}
                {isUrgent && animate ? (
                  <circle
                    cx={x}
                    cy={y}
                    r={4.5}
                    fill="none"
                    stroke={meta.hex}
                    strokeWidth={1.2}
                    className="origin-center animate-ping"
                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  />
                ) : null}
                <circle cx={x} cy={y} r={4.5} fill={meta.hex} stroke="#07231E" strokeWidth={1.4} />
              </g>
            );
          })}
        </g>
      </svg>
      {children}
    </div>
  );
}

/**
 * The seven category layers, with counts. Used beside the map on the map page and
 * in the footer of the hero.
 */
export function MapLegend({
  counts,
  onInk = true,
  className,
}: {
  counts: Record<string, number>;
  onInk?: boolean;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-2", className)}>
      {Object.values(CATEGORY_META).map((meta) => (
        <li key={meta.key} className="flex items-center gap-2">
          <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", meta.dotClass)} />
          <span className={cn("text-xs font-medium", onInk ? "text-brand-paper/75" : "text-brand-ink/75")}>
            {meta.label}
          </span>
          <span className={cn("font-data text-xs", onInk ? "text-brand-signal" : "text-brand-primary")}>
            {counts[meta.key] ?? 0}
          </span>
        </li>
      ))}
    </ul>
  );
}

export { VIEW_WIDTH, VIEW_HEIGHT };
