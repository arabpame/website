"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Sticky header with a mobile drawer.
 *
 * "use client" sits here, at the leaf, and never on the layout. The header needs
 * scroll state and a menu toggle; nothing else in the tree does, and hoisting this
 * to the layout would drag every page into the client bundle.
 *
 * The header is STICKY, not fixed, so it sits in normal flow above the hero and
 * its ground is always the paper body colour. Type is therefore always dark, and
 * it stays readable at every scroll position.
 *
 * This is worth stating because the obvious alternative is tempting and wrong: a
 * transparent header overlaying a full-bleed dark hero looks better in a mockup,
 * but it forces the type to change colour on scroll, and it means every page has
 * to open on a dark band forever or the navigation disappears. The sample-data
 * banner already sits above the header, so a hero that bleeds to the top of the
 * window is not achievable here in any case.
 *
 * Scrolling only adds the blur, the border and the background opacity, so the
 * header separates from content passing beneath it. Nothing changes colour.
 */

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  /**
   * The drawer stores the path it was opened on, and `open` is derived from
   * whether that still matches the current path.
   *
   * This looks indirect, and it replaces the obvious version, which was an effect
   * on `pathname` calling `setOpen(false)`. That version worked but caused a
   * cascading render on every navigation, and React's own guidance is not to
   * synchronise state with an effect when it can be derived. Deriving it also
   * closes the drawer on browser back and forward, which the effect did too but
   * only after an extra render.
   */
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (next: boolean) => setOpenedAt(next ? pathname : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the drawer, and the body must not scroll behind it.
  useEffect(() => {
    if (!open) return;
    // setOpenedAt directly rather than the setOpen wrapper, which is recreated on
    // every render and would have to be a dependency of this effect.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenedAt(null);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-brand-paper transition-all duration-300 ease-expo",
        scrolled
          ? "border-b border-brand-line bg-brand-paper/92 shadow-soft backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="container flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="EARTHLINK PH, home">
          <Mark />
          <span className="font-display text-base font-extrabold tracking-tight text-brand-deep">
            EARTHLINK
            <span className="ml-1.5 font-data text-[0.6875rem] font-medium uppercase tracking-eyebrow text-brand-primary">
              PH
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-200",
                      active ? "text-brand-deep" : "text-brand-ink/70 hover:text-brand-deep",
                    )}
                  >
                    {item.label}
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-4 bottom-1.5 h-px bg-brand-signal-600"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/report" className="btn-primary hidden px-5 py-2.5 text-sm sm:inline-flex">
            Report a concern
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-line text-brand-deep lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-brand-line bg-brand-paper lg:hidden"
      >
        <nav aria-label="Main, mobile" className="container py-5">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold transition-colors",
                    isActive(item.href)
                      ? "bg-white text-brand-deep shadow-soft"
                      : "text-brand-ink/80 hover:bg-white",
                  )}
                >
                  {item.label}
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 opacity-40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3l5 5-5 5" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/report" className="btn-primary mt-4 w-full">
            Report a concern
          </Link>
        </nav>
      </div>
    </header>
  );
}

/**
 * The EARTHLINK mark. A pin whose head is the planet, drawn as inline SVG.
 *
 * Inline rather than a glyph on purpose: a decorative character would be an
 * encoding surface, and this project is edited on both Windows and macOS.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={cn("h-7 w-7", className)} fill="none">
      <path
        d="M12 22s7.2-6.6 7.2-12A7.2 7.2 0 0 0 4.8 10c0 5.4 7.2 12 7.2 12Z"
        className="fill-brand-deep"
      />
      <circle cx="12" cy="9.7" r="4.2" className="fill-brand-signal" />
      <path
        d="M7.9 9.1c1.5.6 2.6.3 3.4-.5.9-.9.4-2 1.4-2.6.7-.4 1.7-.3 2.8.3M8.3 11.9c1.3-.5 2.4-.2 3.2.6.6.6.6 1.4.3 2.2"
        className="stroke-brand-deep"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
