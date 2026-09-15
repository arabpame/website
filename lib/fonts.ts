import { Bricolage_Grotesque, Public_Sans, JetBrains_Mono } from "next/font/google";

/**
 * Three faces, and the third one is justified.
 *
 * The playbook allows a third font only with a reason. The reason: EARTH case
 * numbers, coordinates, timestamps and counters are tabular data, and setting them
 * in a proportional face is precisely what makes a civic platform read as a
 * brochure. The mono face is restricted to data and never used for prose. The QA
 * script checks that font-data does not appear on a paragraph.
 *
 * Loaded through next/font so they are self-hosted, preloaded, and produce no
 * layout shift and no render-blocking request to Google.
 */

export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  // Variable font. 800 for the hero, 600 for section headings, 500 for small caps.
  weight: ["500", "600", "700", "800"],
});

export const body = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const data = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-data",
  display: "swap",
  weight: ["400", "500", "700"],
});

/** Everything the <html> element needs. Applied once, in app/layout.tsx. */
export const fontVariables = `${display.variable} ${body.variable} ${data.variable}`;
