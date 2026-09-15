#!/usr/bin/env node
/**
 * Contrast check for the EARTHLINK palette.
 *
 * WCAG 2.1 relative luminance and contrast ratio, computed from the same hex
 * values that land in tailwind.config.ts. Run this before committing a palette
 * change, not after. Writes docs/CONTRAST.md so the result is a committed fact
 * rather than a claim in a design document.
 *
 * Zero dependencies. Runs on any machine with Node, before npm install.
 *
 *   node scripts/contrast-check.mjs          check and rewrite docs/CONTRAST.md
 *   node scripts/contrast-check.mjs --check  check only, non-zero exit on failure
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// ---------------------------------------------------------------------------
// The palette. Keep in step with tailwind.config.ts.
// ---------------------------------------------------------------------------

const BRAND = {
  ink: "#07231E",
  deep: "#0B3B32",
  primary: "#0E6B55",
  signal: "#C2F24D",
  paper: "#F1F5F1",
  surface: "#FFFFFF",
  line: "#D4DED8",
};

/**
 * Every status and category carries two tones, and the split is not cosmetic.
 *
 *   pin   the saturated tone. Dots, map pins, rails, fills. Graphic, sits on the
 *         dark map, so it needs 3:1.
 *   text  the darkened tone. Labels on the light ground. Carries meaning as text,
 *         so it needs 4.5:1.
 *
 * The first pass of this palette used one tone for both and twelve of the pairs
 * failed. The tones below were solved for, not picked by eye, and each clears its
 * target with headroom so a later nudge does not silently break it.
 */

const STATUS = {
  reported: { pin: "#DF3023", text: "#C3281D" },
  verifying: { pin: "#F79009", text: "#965705" },
  referred: { pin: "#CA8A04", text: "#895E03" },
  progress: { pin: "#2E90FA", text: "#0563C9" },
  resolved: { pin: "#12B76A", text: "#0C7544" },
  monitoring: { pin: "#98A2B3", text: "#5A667A" },
};

const CATEGORY = {
  water: { pin: "#0EA5E9", text: "#096D9A" },
  forest: { pin: "#168740", text: "#137538" },
  waste: { pin: "#8C52EF", text: "#7B39ED" },
  air: { pin: "#67778F", text: "#59677C" },
  biodiversity: { pin: "#0D9488", text: "#0A7269" },
  land: { pin: "#A86607", text: "#925906" },
  hazard: { pin: "#DE3030", text: "#C72020" },
};

// ---------------------------------------------------------------------------
// WCAG maths
// ---------------------------------------------------------------------------

function srgbToLinear(channel) {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Flatten a colour at a given alpha over an opaque background. */
function over(hex, alpha, bgHex) {
  const h = hex.replace("#", "");
  const b = bgHex.replace("#", "");
  const mix = (i) => {
    const fg = parseInt(h.slice(i, i + 2), 16);
    const bg = parseInt(b.slice(i, i + 2), 16);
    return Math.round(fg * alpha + bg * (1 - alpha));
  };
  return (
    "#" +
    [0, 2, 4]
      .map((i) => mix(i).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

// ---------------------------------------------------------------------------
// The pairs that actually appear in the interface
// ---------------------------------------------------------------------------

/** need: 4.5 for body text, 3.0 for large text and UI boundaries. */
const PAIRS = [
  // Light ground
  ["Body ink on paper", BRAND.ink, BRAND.paper, 4.5, "Default body text"],
  ["Body ink at 75% on paper", over(BRAND.ink, 0.75, BRAND.paper), BRAND.paper, 4.5, "The house body-copy opacity"],
  ["Heading deep on paper", BRAND.deep, BRAND.paper, 4.5, "h1 to h4 on the light ground"],
  ["Body ink on surface", BRAND.ink, BRAND.surface, 4.5, "Card interiors"],
  ["Body ink at 75% on surface", over(BRAND.ink, 0.75, BRAND.surface), BRAND.surface, 4.5, "Card body copy"],
  ["Primary link on paper", BRAND.primary, BRAND.paper, 4.5, "Inline links and muted labels"],

  // Buttons
  ["White on primary", BRAND.surface, BRAND.primary, 4.5, "Primary button label"],
  ["Ink on signal", BRAND.ink, BRAND.signal, 4.5, "Chartreuse button label"],

  // Dark ground
  ["Signal on ink", BRAND.signal, BRAND.ink, 4.5, "Accent type on the dark data band"],
  ["Paper on ink", BRAND.paper, BRAND.ink, 4.5, "Body text on the dark band"],
  ["Paper at 70% on ink", over(BRAND.paper, 0.7, BRAND.ink), BRAND.ink, 4.5, "Muted body on the dark band"],
  ["Paper at 70% on deep", over(BRAND.paper, 0.7, BRAND.deep), BRAND.deep, 4.5, "Muted body on mid mangrove"],

  // Boundaries
  ["Line on paper", BRAND.line, BRAND.paper, 1.0, "Hairline divider, decorative only"],
  ["Primary on paper, UI boundary", BRAND.primary, BRAND.paper, 3.0, "Focusable control borders"],

  // Status labels on the light ground. These carry meaning as text, so 4.5.
  ...Object.entries(STATUS).map(([name, tones]) => [
    `Status ${name} text on paper`,
    tones.text,
    BRAND.paper,
    4.5,
    "Status label text",
  ]),
  ...Object.entries(STATUS).map(([name, tones]) => [
    `Status ${name} text on surface`,
    tones.text,
    BRAND.surface,
    4.5,
    "Status label inside a card",
  ]),

  // Status dots and rails. Graphic, so 3.0 against both grounds.
  ...Object.entries(STATUS).map(([name, tones]) => [
    `Status ${name} pin on ink`,
    tones.pin,
    BRAND.ink,
    3.0,
    "Status dot on the dark band",
  ]),

  // Category labels on the light ground.
  ...Object.entries(CATEGORY).map(([name, tones]) => [
    `Category ${name} text on paper`,
    tones.text,
    BRAND.paper,
    4.5,
    "Category label text",
  ]),
  ...Object.entries(CATEGORY).map(([name, tones]) => [
    `Category ${name} text on surface`,
    tones.text,
    BRAND.surface,
    4.5,
    "Category label inside a card",
  ]),

  // Category pins on the dark map. Graphic, so 3.0.
  ...Object.entries(CATEGORY).map(([name, tones]) => [
    `Category ${name} pin on ink map`,
    tones.pin,
    BRAND.ink,
    3.0,
    "Map pin against the dark map",
  ]),
];

/** Pairs that are expected to fail, recorded so they are never used that way. */
const FORBIDDEN = [["Signal on paper", BRAND.signal, BRAND.paper, "Chartreuse is never small text on the light ground"]];

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const results = PAIRS.map(([label, fg, bg, need, use]) => {
  const r = ratio(fg, bg);
  return { label, fg, bg, need, use, r, pass: r >= need };
});

const forbidden = FORBIDDEN.map(([label, fg, bg, note]) => ({
  label,
  fg,
  bg,
  note,
  r: ratio(fg, bg),
}));

const failures = results.filter((x) => !x.pass);

const fmt = (n) => n.toFixed(2);

let md = `# Contrast results

Generated by \`npm run contrast\` (\`scripts/contrast-check.mjs\`). Do not edit by hand.

WCAG 2.1 relative luminance. Body text needs 4.5:1. Large text (18.66px bold or 24px and
above) and UI component boundaries need 3:1. Translucent values are flattened over their
real background before measuring, because that is what the eye actually sees.

Last run: ${new Date().toISOString().slice(0, 10)}

## Pairs in use

| Pair | Foreground | Background | Ratio | Needs | Result | Where |
|---|---|---|---|---|---|---|
`;

for (const x of results) {
  md += `| ${x.label} | \`${x.fg}\` | \`${x.bg}\` | ${fmt(x.r)}:1 | ${x.need.toFixed(1)} | ${x.pass ? "Pass" : "**FAIL**"} | ${x.use} |\n`;
}

md += `
## Pairs that must never be used

Recorded so they are not rediscovered as bugs.

| Pair | Ratio | Why it is forbidden |
|---|---|---|
`;
for (const x of forbidden) {
  md += `| ${x.label} | ${fmt(x.r)}:1 | ${x.note} |\n`;
}

md += `
## Result

${failures.length === 0 ? `All ${results.length} pairs in use pass.` : `${failures.length} of ${results.length} pairs FAIL:\n\n${failures.map((f) => `- ${f.label}: ${fmt(f.r)}:1, needs ${f.need}`).join("\n")}`}

---

Built with care by Erick Cabal. https://erickcabal.com
`;

mkdirSync(join(root, "docs"), { recursive: true });
writeFileSync(join(root, "docs", "CONTRAST.md"), md, "utf8");

for (const x of results) {
  const mark = x.pass ? "  OK  " : " FAIL ";
  console.log(`${mark} ${fmt(x.r).padStart(6)}:1  (needs ${x.need.toFixed(1)})  ${x.label}`);
}
for (const x of forbidden) {
  console.log(`  --   ${fmt(x.r).padStart(6)}:1  forbidden pair recorded: ${x.label}`);
}

console.log("");
if (failures.length) {
  console.error(`${failures.length} contrast failure(s). Darken the token, do not ship it.`);
  process.exit(1);
}
console.log(`All ${results.length} pairs pass. Written to docs/CONTRAST.md`);
