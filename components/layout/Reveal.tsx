"use client";

import { useEffect } from "react";

/**
 * Scroll reveal, CSS-first with a failsafe.
 *
 * The architecture matters more than the effect. Content is visible by default in
 * globals.css, and only hides once this component adds `js` to <html>, confirming
 * that JavaScript is running and can bring it back. No JavaScript, no problem.
 * A crawler, no problem. A thrown error before the observer attaches, no problem.
 *
 * The failsafe covers the remaining case, where the observer attaches but never
 * fires: after 1200ms everything is revealed regardless. Content must never stay
 * invisible, and a clever reveal that occasionally blanks a page is a worse
 * outcome than no reveal at all.
 */
export function RevealProvider() {
  useEffect(() => {
    const root = document.documentElement;

    // Respect the user's setting. If they have asked for reduced motion, never
    // hide anything in the first place.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    root.classList.add("js");

    const targets = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (targets.length === 0) {
      root.classList.remove("js");
      return;
    }

    const revealAll = () => {
      for (const el of targets) el.classList.add("is-visible");
    };

    if (!("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          // Stagger within a group, capped so a long list never waits seconds.
          const index = Number(el.dataset.revealIndex ?? 0);
          el.style.transitionDelay = `${Math.min(index * 80, 400)}ms`;
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    for (const el of targets) observer.observe(el);

    // Failsafe. Content must never stay invisible.
    const failsafe = window.setTimeout(revealAll, 1200);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return null;
}
