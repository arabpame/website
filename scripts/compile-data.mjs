#!/usr/bin/env node
/**
 * Compile the documented 2026 cases and missions into the data files the site
 * reads.
 *
 *   data/source/cases-*.json   ->  data/cases.ts
 *   data/source/missions.json  ->  data/missions.ts
 *
 * The source files are the research record: every case and mission was taken
 * from published news reports or official releases in 2026, and each carries the
 * URLs it came from. This script does the mechanical part so nobody types a
 * coordinate by hand:
 *
 *   - places each case with the gazetteer (data/ph-places.json), so the pin
 *     lands where the city or municipality actually is
 *   - checks the stated region against the gazetteer and corrects it
 *   - numbers the cases in the order they were first reported
 *   - sorts timelines, and normalises punctuation the house style forbids
 *
 * THE OUTPUT IS COMMITTED. Run this only after editing a source file:
 *
 *   npm run data:build
 *
 * Zero dependencies.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(root, "data", "source");
const places = JSON.parse(readFileSync(join(root, "data", "ph-places.json"), "utf8"));

const CATEGORIES = new Set(["water", "forest", "waste", "air", "biodiversity", "land", "hazard"]);
const STATUSES = new Set(["reported", "verifying", "referred", "progress", "resolved", "monitoring"]);
const URGENCIES = new Set(["low", "moderate", "high", "critical"]);
const MISSION_TYPES = new Set(["cleanup", "planting", "mangrove", "recycling", "education", "gardening", "wildlife", "segregation"]);
const REGIONS = new Set(["CAR", "I", "II", "III", "NCR", "IV-A", "MIMAROPA", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "BARMM"]);

let problems = 0;
const problem = (msg) => {
  problems += 1;
  console.error(`  PROBLEM  ${msg}`);
};

// ---------------------------------------------------------------------------
// Text and place helpers. Same normalisation as lib/places.ts.
// ---------------------------------------------------------------------------

/** No em dashes, no en dashes, no curly quotes. The grammar check fails on them. */
function tidy(text) {
  return String(text)
    .replace(/\s*—\s*/g, ", ")
    .replace(/–/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function norm(input) {
  return String(input)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(city of|municipality of|province of|city|municipality|province|mun|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findPlace(municipality, province) {
  const n = norm(municipality);
  const p = norm(province);
  const byName = places.filter((e) => norm(e.n) === n);
  if (byName.length === 0) return undefined;
  if (byName.length === 1) return byName[0];
  return byName.find((e) => norm(e.p) === p) ?? undefined;
}

function slugify(text) {
  return norm(text).replace(/\s+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

// ---------------------------------------------------------------------------
// A small TypeScript serialiser: unquoted keys, two-space indent, so the output
// reads like the hand-written file it replaces and scripts/verify-cases.mjs can
// still pull caseNumber, region, lat and lng out of it with a regex.
// ---------------------------------------------------------------------------

function ts(value, indent = "") {
  const inner = indent + "  ";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[\n${value.map((v) => `${inner}${ts(v, inner)}`).join(",\n")},\n${indent}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    return `{\n${entries.map(([k, v]) => `${inner}${k}: ${ts(v, inner)}`).join(",\n")},\n${indent}}`;
  }
  if (typeof value === "string") return JSON.stringify(value);
  return String(value);
}

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

const rawCases = readdirSync(sourceDir)
  .filter((f) => f.startsWith("cases-") && f.endsWith(".json"))
  .sort()
  .flatMap((f) => {
    const list = JSON.parse(readFileSync(join(sourceDir, f), "utf8"));
    return list.map((c) => ({ ...c, _file: f }));
  });

// The same incident can be researched twice under two themes. Same title, or
// same place and observed date, means the same case: keep the first.
const seen = new Set();
const uniqueCases = rawCases.filter((c) => {
  const key = `${norm(c.title)}|${norm(c.municipality)}|${c.observedOn}`;
  const key2 = `${norm(c.municipality)}|${c.observedOn}|${c.category}`;
  if (seen.has(key) || seen.has(key2)) {
    console.log(`  skipped duplicate: ${c.title} (${c._file})`);
    return false;
  }
  seen.add(key);
  seen.add(key2);
  return true;
});

uniqueCases.sort((a, b) => a.reportedOn.localeCompare(b.reportedOn) || a.observedOn.localeCompare(b.observedOn));

const counters = new Map();
const cases = uniqueCases.map((c) => {
  const where = `${c.title} (${c.municipality}, ${c.province})`;

  if (!CATEGORIES.has(c.category)) problem(`${where}: unknown category ${c.category}`);
  if (!STATUSES.has(c.status)) problem(`${where}: unknown status ${c.status}`);
  if (!URGENCIES.has(c.urgency)) problem(`${where}: unknown urgency ${c.urgency}`);
  if (!REGIONS.has(c.region)) problem(`${where}: unknown region ${c.region}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.observedOn) || !/^\d{4}-\d{2}-\d{2}$/.test(c.reportedOn)) {
    problem(`${where}: dates must be YYYY-MM-DD`);
  }
  if (!Array.isArray(c.sources) || c.sources.length === 0) problem(`${where}: no sources`);

  const place = findPlace(c.municipality, c.province);
  if (!place) {
    problem(`${where}: not in the gazetteer. Check the spelling of the city or municipality and the province.`);
  }
  let region = c.region;
  if (place && place.r !== c.region) {
    console.log(`  corrected region for ${c.title}: ${c.region} -> ${place.r}`);
    region = place.r;
  }

  const year = c.reportedOn.slice(0, 4);
  const n = (counters.get(year) ?? 0) + 1;
  counters.set(year, n);
  const caseNumber = `EARTH-${year}-${String(n).padStart(4, "0")}`;

  const timeline = [...(c.timeline ?? [])]
    .map((t) => ({ date: t.date, status: t.status, actor: tidy(t.actor), note: tidy(t.note) }))
    .sort((a, b) => a.date.localeCompare(b.date));
  for (const t of timeline) {
    if (!STATUSES.has(t.status)) problem(`${where}: timeline status ${t.status}`);
  }

  const sources = (c.sources ?? []).map((s) => ({
    outlet: tidy(s.outlet),
    title: tidy(s.title),
    url: s.url,
    date: s.date,
  }));

  return {
    caseNumber,
    slug: caseNumber.toLowerCase(),
    title: tidy(c.title),
    category: c.category,
    status: c.status,
    urgency: c.urgency,
    observedOn: c.observedOn,
    reportedOn: c.reportedOn,
    barangay: tidy(c.barangay || ""),
    municipality: place ? place.n : tidy(c.municipality),
    province: place ? place.p : tidy(c.province),
    region,
    lat: place ? place.lat : 0,
    lng: place ? place.lng : 0,
    summary: tidy(c.summary),
    reportCount: 1,
    validations: 0,
    referredTo: c.referredTo ? tidy(c.referredTo) : undefined,
    evidenceCount: sources.length,
    timeline,
    outcome: c.outcome && c.outcome.length > 0 ? c.outcome.map((o) => ({ label: tidy(o.label), value: tidy(o.value) })) : undefined,
    source: "news",
    sources,
  };
});

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------

const rawMissions = JSON.parse(readFileSync(join(sourceDir, "missions.json"), "utf8"));
const slugs = new Set();
const missions = rawMissions.map((m) => {
  const where = `${m.title} (${m.municipality})`;
  if (!MISSION_TYPES.has(m.type)) problem(`${where}: unknown mission type ${m.type}`);
  if (!["open", "completed"].includes(m.status)) problem(`${where}: status must be open or completed`);
  if (!REGIONS.has(m.region)) problem(`${where}: unknown region ${m.region}`);
  if (!Array.isArray(m.sources) || m.sources.length === 0) problem(`${where}: no sources`);

  const place = findPlace(m.municipality, m.province);
  if (!place) problem(`${where}: not in the gazetteer.`);
  let region = m.region;
  if (place && place.r !== m.region) region = place.r;

  let slug = slugify(m.title);
  if (slugs.has(slug)) slug = `${slug}-${m.date}`;
  slugs.add(slug);

  return {
    slug,
    title: tidy(m.title),
    type: m.type,
    date: m.date,
    barangay: tidy(m.barangay || ""),
    municipality: place ? place.n : tidy(m.municipality),
    province: place ? place.p : tidy(m.province),
    region,
    organiser: tidy(m.organiser),
    // Places are managed by the organiser, not on this site, so nothing is
    // invented here. Zero means "not tracked on EARTHLINK".
    capacity: 0,
    registered: 0,
    status: m.status,
    summary: tidy(m.summary),
    requirements: (m.requirements ?? []).map(tidy),
    results: m.results && m.results.length > 0 ? m.results.map((r) => ({ label: tidy(r.label), value: tidy(r.value) })) : undefined,
    registration: m.registration ? tidy(m.registration) : undefined,
    sources: (m.sources ?? []).map((s) => ({ outlet: tidy(s.outlet), title: tidy(s.title), url: s.url, date: s.date })),
  };
});

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

if (problems > 0) {
  console.error(`\n  ${problems} problem(s). Nothing written.`);
  process.exit(1);
}

const casesHeader = `import type { EarthCase } from "@/lib/types";

/**
 * GENERATED FILE. Do not edit by hand.
 *
 * Built by scripts/compile-data.mjs from data/source/cases-*.json, which hold
 * every documented case with the published reports it was taken from. To add or
 * correct a case, edit the source file and run:
 *
 *   npm run data:build
 *
 * Every case here is a real incident reported in the Philippines in 2026 (one
 * from late 2025 that was still developing in 2026). Coordinates are the centre
 * of the city or municipality named in the reporting, from data/ph-places.json,
 * so a pin shows where the case is, not the exact spot. Report counts and
 * validations are what the platform has actually recorded, which for documented
 * cases is one public record and no community validations yet.
 */

export const CASES: EarthCase[] = ${ts(cases)};

/** Newest first. */
export const CASES_BY_DATE: EarthCase[] = [...CASES].sort((a, b) => b.reportedOn.localeCompare(a.reportedOn));
`;

const missionsHeader = `import type { Mission } from "@/lib/types";

/**
 * GENERATED FILE. Do not edit by hand.
 *
 * Built by scripts/compile-data.mjs from data/source/missions.json, which holds
 * real, publicly announced volunteer events in 2026 with the announcements they
 * were taken from. To add or correct one, edit the source file and run:
 *
 *   npm run data:build
 *
 * Capacity and registrations are managed by each organiser, not on this site,
 * so both are zero here and the pages point to the organiser instead.
 */

export const MISSIONS: Mission[] = ${ts(missions)};

export const MISSIONS_OPEN: Mission[] = MISSIONS.filter((m) => m.status === "open").sort((a, b) =>
  a.date.localeCompare(b.date),
);

export const MISSIONS_COMPLETED: Mission[] = MISSIONS.filter((m) => m.status === "completed").sort((a, b) =>
  b.date.localeCompare(a.date),
);
`;

writeFileSync(join(root, "data", "cases.ts"), casesHeader, "utf8");
writeFileSync(join(root, "data", "missions.ts"), missionsHeader, "utf8");

const byStatus = {};
for (const c of cases) byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
console.log(`\n  ${cases.length} cases -> data/cases.ts   ${JSON.stringify(byStatus)}`);
console.log(`  ${missions.length} missions -> data/missions.ts   (${missions.filter((m) => m.status === "open").length} open)`);
