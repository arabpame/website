import type { Partner, ScoreEntry, ImpactMetric, EarthCase, Mission } from "@/lib/types";
import { CASES } from "@/data/cases";
import { MISSIONS } from "@/data/missions";

/**
 * Partners, scores and the transparency counters.
 *
 * Nothing on this page is typed in as a number. The partner directory is a
 * curated list of the real offices that appear in the documented cases, and
 * every count beside a partner, every score and every dashboard counter is
 * DERIVED from data/cases.ts and data/missions.ts at build time. When a case
 * changes, these change with it, so the dashboard can never quietly disagree
 * with the pages it summarises.
 */

// ---------------------------------------------------------------------------
// Partners: the offices the documented cases were actually referred to
// ---------------------------------------------------------------------------

interface PartnerSeed extends Omit<Partner, "casesReceived" | "casesAcknowledged" | "casesResolved"> {
  /** Matches the referredTo field and timeline actors of a case. */
  match: RegExp;
}

const PARTNER_SEEDS: PartnerSeed[] = [
  {
    slug: "denr-emb",
    name: "DENR Environmental Management Bureau",
    type: "national-agency",
    coverage: "Pollution, waste facilities, water quality and environmental compliance, through its regional offices",
    region: "PH",
    handles: ["waste", "water", "air", "hazard"],
    match: /\bEMB\b|Environmental Management Bureau|Pollution Adjudication/i,
  },
  {
    slug: "denr-mgb",
    name: "DENR Mines and Geosciences Bureau",
    type: "national-agency",
    coverage: "Mining, quarrying, landslides, sinkholes and ground hazards, through its regional offices",
    region: "PH",
    handles: ["land", "hazard"],
    match: /\bMGB\b|Mines and Geosciences/i,
  },
  {
    slug: "denr-bmb",
    name: "DENR Biodiversity Management Bureau",
    type: "national-agency",
    coverage: "Wildlife, protected areas and threatened species nationwide",
    region: "PH",
    handles: ["biodiversity", "forest"],
    match: /\bBMB\b|Biodiversity Management|Wildlife Resources|Protected Area Management|PAMO/i,
  },
  {
    slug: "denr-field-offices",
    name: "DENR regional, PENRO and CENRO offices",
    type: "national-agency",
    coverage: "Forestry, timber, protected areas and field enforcement in every region",
    region: "PH",
    handles: ["forest", "biodiversity", "land", "waste"],
    match: /\bDENR\b|\bCENRO\b|\bPENRO\b/i,
  },
  {
    slug: "bfar",
    name: "Bureau of Fisheries and Aquatic Resources",
    type: "national-agency",
    coverage: "Fish kills, red tide, illegal fishing and marine strandings, through its regional offices",
    region: "PH",
    handles: ["water", "biodiversity"],
    match: /\bBFAR\b|Fisheries and Aquatic|Fishery Office|Bantay Dagat/i,
  },
  {
    slug: "philippine-coast-guard",
    name: "Philippine Coast Guard",
    type: "national-agency",
    coverage: "Oil spills, groundings, maritime enforcement and marine wildlife response",
    region: "PH",
    handles: ["water", "biodiversity", "forest"],
    match: /Coast Guard|\bPCG\b/i,
  },
  {
    slug: "llda",
    name: "Laguna Lake Development Authority",
    type: "national-agency",
    coverage: "Laguna de Bay and its tributaries across Rizal, Laguna and Metro Manila",
    region: "IV-A",
    handles: ["water"],
    match: /\bLLDA\b|Laguna Lake Development/i,
  },
  {
    slug: "mmda",
    name: "Metropolitan Manila Development Authority",
    type: "national-agency",
    coverage: "Waterway clearing and flood control across the seventeen Metro Manila LGUs",
    region: "NCR",
    handles: ["waste", "water", "hazard"],
    match: /\bMMDA\b|Metropolitan Manila Development/i,
  },
  {
    slug: "bureau-of-customs",
    name: "Bureau of Customs",
    type: "national-agency",
    coverage: "Wildlife trafficking and waste imports at ports and airports",
    region: "PH",
    handles: ["biodiversity", "hazard", "waste"],
    match: /Customs/i,
  },
  {
    slug: "pnp-maritime",
    name: "PNP Maritime Group and local police",
    type: "national-agency",
    coverage: "Blast fishing, timber and mining enforcement with the environment agencies",
    region: "PH",
    handles: ["biodiversity", "forest", "land"],
    match: /Maritime|Police|\bPNP\b/i,
  },
  {
    slug: "tubbataha-management-office",
    name: "Tubbataha Management Office",
    type: "national-agency",
    coverage: "Tubbataha Reefs Natural Park, Sulu Sea",
    region: "MIMAROPA",
    handles: ["biodiversity"],
    match: /Tubbataha/i,
  },
  {
    slug: "pra-dpwh",
    name: "Philippine Reclamation Authority and DPWH",
    type: "national-agency",
    coverage: "Reclamation, shoreline works and flood control infrastructure",
    region: "PH",
    handles: ["land", "water", "hazard"],
    match: /Reclamation Authority|\bDPWH\b/i,
  },
  {
    slug: "city-municipal-environment-offices",
    name: "City and municipal environment offices",
    type: "lgu",
    coverage: "CENRO, MENRO, health and disaster offices of the cities and municipalities on the map",
    region: "PH",
    handles: ["waste", "water", "hazard", "land", "air"],
    match: /\bENRO\b|City Health|General Services|Disaster Risk|CDRRMO|MDRRMO|municipal government|city government|LGU|Sangguniang/i,
  },
  {
    slug: "environmental-courts",
    name: "Regional Trial Courts, environmental cases",
    type: "expert",
    coverage: "Temporary environmental protection orders and writs under the Rules of Procedure for Environmental Cases",
    region: "PH",
    handles: ["land", "hazard", "water"],
    match: /Regional Trial Court|\bRTC\b/i,
  },
];

const RESOLVED = new Set(["resolved", "monitoring"]);
const REFERRED_OR_LATER = new Set(["referred", "progress", "resolved", "monitoring"]);

function involves(partner: PartnerSeed, c: EarthCase): boolean {
  return partner.match.test(c.referredTo ?? "") || c.timeline.some((t) => partner.match.test(t.actor));
}

export const PARTNERS: Partner[] = PARTNER_SEEDS.map(({ match, ...seed }) => {
  const received = CASES.filter((c) => match.test(c.referredTo ?? ""));
  // Acknowledged means the office itself appears as an actor on the case
  // timeline, which is the only evidence of a response the public record holds.
  const acknowledged = received.filter((c) => c.timeline.some((t) => match.test(t.actor)));
  const resolved = received.filter((c) => RESOLVED.has(c.status));
  return {
    ...seed,
    casesReceived: received.length,
    casesAcknowledged: acknowledged.length,
    casesResolved: resolved.length,
  };
}).filter((p) => p.casesReceived > 0 || CASES.some((c) => involves({ ...p, match: PARTNER_SEEDS.find((s) => s.slug === p.slug)!.match }, c)));

// ---------------------------------------------------------------------------
// Measured quantities pulled out of outcomes and results
// ---------------------------------------------------------------------------

/** "748.87 metric tons" -> 748870. "1,103.56 kg" -> 1103.56. Anything without a mass unit -> 0. */
function kilograms(value: string | undefined): number {
  if (!value) return 0;
  const m = value.replace(/,/g, "").match(/(-?\d+(?:\.\d+)?)\s*(kg|kilograms?|metric tons?|tons?|tonnes?)\b/i);
  if (!m) return 0;
  const n = Number(m[1]);
  return /kg|kilogram/i.test(m[2] ?? "") ? n : n * 1000;
}

/** "608" -> 608, "About 1,225" -> 1225, "over 20,000 kg" -> 20000. */
function count(value: string | undefined): number {
  if (!value) return 0;
  const m = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

/** Only quantities that were physically taken out: not waste received, dumped or spilled. */
const WASTE_LABEL = /(waste|garbage|debris|trash|litter).*(removed|collected|recovered|hauled|cleared|diverted)|(removed|collected|recovered|hauled|cleared|diverted).*(waste|garbage|debris|trash|litter)/i;
const VOLUNTEER_LABEL = /^volunteers/i;
const PLANTED_LABEL = /seedlings planted|trees planted|hatchlings released/i;

function caseWasteKg(c: EarthCase): number {
  return (c.outcome ?? []).filter((o) => WASTE_LABEL.test(o.label)).reduce((n, o) => n + kilograms(o.value), 0);
}
function missionWasteKg(m: Mission): number {
  return (m.results ?? []).filter((r) => WASTE_LABEL.test(r.label) && !/recyclables|residuals/i.test(r.label)).reduce((n, r) => n + kilograms(r.value), 0);
}
function caseVolunteers(c: EarthCase): number {
  return (c.outcome ?? []).filter((o) => VOLUNTEER_LABEL.test(o.label)).reduce((n, o) => n + count(o.value), 0);
}
function missionVolunteers(m: Mission): number {
  return (m.results ?? []).filter((r) => VOLUNTEER_LABEL.test(r.label)).reduce((n, r) => n + count(r.value), 0);
}
function casePlanted(c: EarthCase): number {
  return (c.outcome ?? []).filter((o) => /seedlings planted|trees planted/i.test(o.label)).reduce((n, o) => n + count(o.value), 0);
}
function missionPlanted(m: Mission): number {
  return (m.results ?? []).filter((r) => PLANTED_LABEL.test(r.label) && !/hatchlings/i.test(r.label)).reduce((n, r) => n + count(r.value), 0);
}

// ---------------------------------------------------------------------------
// EARTH Score: cities and municipalities, from the published rules
// ---------------------------------------------------------------------------

/**
 * The rules on /score, applied to what is actually documented:
 *   200  a case resolved (or under monitoring after resolution)
 *    40  a case that reached a referral
 *   120  a completed mission with a recorded result
 *     1  per 5 kg of waste weighed at a completed mission
 * Trees are scored only when counted alive at 90 days, and no such count exists
 * yet, so that column is zero. Student completions are Phase 4.
 */
const completedMissions = MISSIONS.filter((m) => m.status === "completed");

const byPlace = new Map<string, { municipality: string; province: string; cases: EarthCase[]; missions: Mission[] }>();
for (const c of CASES) {
  const key = `${c.municipality}|${c.province}`;
  const entry = byPlace.get(key) ?? { municipality: c.municipality, province: c.province, cases: [], missions: [] };
  entry.cases.push(c);
  byPlace.set(key, entry);
}
for (const m of completedMissions) {
  const key = `${m.municipality}|${m.province}`;
  const entry = byPlace.get(key) ?? { municipality: m.municipality, province: m.province, cases: [], missions: [] };
  entry.missions.push(m);
  byPlace.set(key, entry);
}

export const SCORES: ScoreEntry[] = [...byPlace.values()]
  .map((place) => {
    const casesResolved = place.cases.filter((c) => RESOLVED.has(c.status)).length;
    const referrals = place.cases.filter((c) => REFERRED_OR_LATER.has(c.status)).length;
    const missionsWithResults = place.missions.filter((m) => (m.results?.length ?? 0) > 0).length;
    // Only weights from volunteer missions count towards a score. An agency
    // hauling a channel clear is on the dashboard, not on a community leaderboard.
    const wasteKg = place.missions.reduce((n, m) => n + missionWasteKg(m), 0);
    const points =
      casesResolved * 200 + referrals * 40 + missionsWithResults * 120 + Math.floor(wasteKg / 5);
    return {
      rank: 0,
      name: place.municipality,
      kind: "municipality" as const,
      municipality: place.municipality,
      province: place.province,
      points,
      // No previous scoring period exists yet, so nothing has moved.
      movement: 0,
      breakdown: {
        missions: missionsWithResults,
        casesResolved,
        wasteDivertedKg: Math.round(wasteKg),
        treesSurviving: 0,
        studentsEducated: 0,
      },
    };
  })
  .filter((s) => s.points > 0)
  .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
  .slice(0, 10)
  .map((s, i) => ({ ...s, rank: i + 1 }));

// ---------------------------------------------------------------------------
// The transparency dashboard counters
// ---------------------------------------------------------------------------

const resolvedCases = CASES.filter((c) => RESOLVED.has(c.status));

const totalWasteKg =
  CASES.reduce((n, c) => n + caseWasteKg(c), 0) + completedMissions.reduce((n, m) => n + missionWasteKg(m), 0);
const totalVolunteers =
  CASES.reduce((n, c) => n + caseVolunteers(c), 0) + completedMissions.reduce((n, m) => n + missionVolunteers(m), 0);
const totalPlanted =
  CASES.reduce((n, c) => n + casePlanted(c), 0) + completedMissions.reduce((n, m) => n + missionPlanted(m), 0);

/**
 * Every metric carries a `basis` line saying exactly what is counted. A number
 * without a stated basis is a claim, not a measurement.
 */
export const IMPACT: ImpactMetric[] = [
  {
    key: "cases-reported",
    label: "Cases on record",
    value: CASES.length,
    basis: "Every case on the platform at any status: documented 2026 incidents and reports filed here, including those not yet verified.",
    href: "/cases",
  },
  {
    key: "cases-resolved",
    label: "Cases resolved",
    value: resolvedCases.length,
    basis: "Cases whose public record shows the problem fixed or contained, including those now under monitoring.",
    href: "/cases?status=resolved",
  },
  {
    key: "cases-open",
    label: "Still open",
    value: CASES.length - resolvedCases.length,
    basis: "Reported, under verification, referred or in progress. Counted deliberately, because a dashboard that only shows wins is not transparency.",
    href: "/cases",
  },
  {
    key: "volunteers",
    label: "Volunteers mobilised",
    value: totalVolunteers,
    basis: "Attendance reported by organisers at completed missions and documented clean-ups, not sign-ups.",
    href: "/act",
  },
  {
    key: "waste",
    label: "Waste removed",
    value: Math.round(totalWasteKg),
    unit: "kg",
    basis: "Weights reported by the agency or organiser, converted to kilograms. Anything reported only as sacks or truckloads is not counted.",
    href: "/act",
  },
  {
    key: "trees",
    label: "Trees and mangroves planted",
    value: totalPlanted,
    basis: "Seedlings planted at documented 2026 events. Survival is counted separately at 90 days, and no survival count exists yet.",
    href: "/act",
  },
  {
    key: "communities",
    label: "Cities and municipalities",
    value: new Set(CASES.map((c) => `${c.municipality}, ${c.province}`)).size,
    basis: "Distinct cities and municipalities with at least one case on the platform.",
    href: "/map",
  },
  {
    key: "partners",
    label: "Offices in the routing network",
    value: PARTNERS.length,
    basis: "National agencies, local offices and courts that appear on the record of at least one case.",
    href: "/connect",
  },
];

/** The four counters that sit under the hero. Kept short on purpose. */
export const HERO_IMPACT = IMPACT.filter((m) =>
  ["cases-reported", "cases-resolved", "volunteers", "waste"].includes(m.key),
);
