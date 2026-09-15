import type { Partner, ScoreEntry, ImpactMetric } from "@/lib/types";
import { CASES } from "@/data/cases";
import { MISSIONS } from "@/data/missions";

/**
 * SAMPLE DATA.
 *
 * The agency TYPES here are real (a CENRO, a PENRO, a barangay environment
 * committee and so on all exist and do roughly this work), but every organisation
 * below is written for the demonstration. Response figures in particular are
 * invented, and it would be unfair as well as inaccurate to present them as a real
 * office's record.
 */

export const PARTNERS: Partner[] = [
  {
    slug: "denr-region-iv-a",
    name: "DENR Region IV-A",
    type: "national-agency",
    coverage: "CALABARZON, all five provinces",
    region: "IV-A",
    handles: ["forest", "water", "biodiversity", "land", "air"],
    casesReceived: 34,
    casesAcknowledged: 31,
    casesResolved: 19,
  },
  {
    slug: "denr-barmm-penro",
    name: "DENR BARMM, Provincial Environment and Natural Resources Office",
    type: "national-agency",
    coverage: "Bangsamoro provinces",
    region: "BARMM",
    handles: ["biodiversity", "forest", "water"],
    casesReceived: 12,
    casesAcknowledged: 12,
    casesResolved: 7,
  },
  {
    slug: "bfar-region-iv-a",
    name: "Bureau of Fisheries and Aquatic Resources, Region IV-A",
    type: "national-agency",
    coverage: "Laguna Lake and the CALABARZON coast",
    region: "IV-A",
    handles: ["water", "biodiversity"],
    casesReceived: 9,
    casesAcknowledged: 9,
    casesResolved: 6,
  },
  {
    slug: "laguna-lake-development-authority",
    name: "Laguna Lake Development Authority",
    type: "national-agency",
    coverage: "The Laguna de Bay basin",
    region: "IV-A",
    handles: ["water", "hazard"],
    casesReceived: 15,
    casesAcknowledged: 13,
    casesResolved: 8,
  },
  {
    slug: "philippine-coast-guard-surigao",
    name: "Philippine Coast Guard, Surigao Station",
    type: "national-agency",
    coverage: "Surigao del Norte waters",
    region: "XIII",
    handles: ["hazard", "water"],
    casesReceived: 6,
    casesAcknowledged: 6,
    casesResolved: 4,
  },
  {
    slug: "bacoor-cenro",
    name: "Bacoor City Environment and Natural Resources Office",
    type: "lgu",
    coverage: "Bacoor City, Cavite",
    region: "IV-A",
    handles: ["waste", "water", "air", "land"],
    casesReceived: 21,
    casesAcknowledged: 21,
    casesResolved: 16,
  },
  {
    slug: "cebu-city-cenro",
    name: "Cebu City Environment and Natural Resources Office",
    type: "lgu",
    coverage: "Cebu City",
    region: "VII",
    handles: ["waste", "air", "water", "land"],
    casesReceived: 28,
    casesAcknowledged: 25,
    casesResolved: 17,
  },
  {
    slug: "navotas-cenro",
    name: "Navotas City Environment and Natural Resources Office",
    type: "lgu",
    coverage: "Navotas City",
    region: "NCR",
    handles: ["water", "waste", "hazard"],
    casesReceived: 17,
    casesAcknowledged: 16,
    casesResolved: 9,
  },
  {
    slug: "kalibo-menro",
    name: "Kalibo Municipal Environment and Natural Resources Office",
    type: "lgu",
    coverage: "Kalibo, Aklan",
    region: "VI",
    handles: ["waste", "air", "water"],
    casesReceived: 11,
    casesAcknowledged: 11,
    casesResolved: 8,
  },
  {
    slug: "barangay-san-isidro-environment-committee",
    name: "Barangay San Isidro Environment Committee",
    type: "barangay",
    coverage: "One barangay in Bacoor, Cavite",
    region: "IV-A",
    handles: ["waste", "water"],
    casesReceived: 9,
    casesAcknowledged: 9,
    casesResolved: 7,
  },
  {
    slug: "bongao-fisherfolk-association",
    name: "Bongao Fisherfolk Association",
    type: "ngo",
    coverage: "Bongao and nearby island barangays",
    region: "BARMM",
    handles: ["biodiversity", "water"],
    casesReceived: 5,
    casesAcknowledged: 5,
    casesResolved: 4,
  },
  {
    slug: "navotas-coastal-youth-network",
    name: "Navotas Coastal Youth Network",
    type: "youth",
    coverage: "Coastal barangays in Navotas",
    region: "NCR",
    handles: ["water", "waste"],
    casesReceived: 8,
    casesAcknowledged: 8,
    casesResolved: 3,
  },
  {
    slug: "mati-bantay-kalikasan",
    name: "Mati Bantay Kalikasan Volunteers",
    type: "ngo",
    coverage: "Mati and the Davao Oriental coast",
    region: "XI",
    handles: ["biodiversity", "waste"],
    casesReceived: 7,
    casesAcknowledged: 7,
    casesResolved: 4,
  },
  {
    slug: "marine-science-institute-partner",
    name: "Partner marine scientists panel",
    type: "expert",
    coverage: "National, advisory on marine and coastal cases",
    region: "NCR",
    handles: ["biodiversity", "water"],
    casesReceived: 14,
    casesAcknowledged: 14,
    casesResolved: 0,
  },
  {
    slug: "school-division-partner-network",
    name: "Partner school division network",
    type: "school",
    coverage: "Twelve divisions running the LEARN tracks",
    region: "IV-A",
    handles: ["waste", "water", "biodiversity"],
    casesReceived: 4,
    casesAcknowledged: 4,
    casesResolved: 2,
  },
];

/**
 * EARTH Score leaderboard. Points are computed from the rules in the concept:
 * missions completed, cases resolved, waste diverted, trees surviving, students
 * educated. The breakdown is shown on the page so nobody has to take the total
 * on trust.
 */
export const SCORES: ScoreEntry[] = [
  {
    rank: 1,
    name: "Barangay San Isidro",
    kind: "barangay",
    municipality: "Bacoor",
    province: "Cavite",
    points: 4820,
    movement: 2,
    breakdown: { missions: 9, casesResolved: 7, wasteDivertedKg: 3960, treesSurviving: 210, studentsEducated: 640 },
  },
  {
    rank: 2,
    name: "Bongao Fisherfolk Association",
    kind: "organisation",
    municipality: "Bongao",
    province: "Tawi-Tawi",
    points: 4610,
    movement: 5,
    breakdown: { missions: 6, casesResolved: 4, wasteDivertedKg: 890, treesSurviving: 3780, studentsEducated: 310 },
  },
  {
    rank: 3,
    name: "Dipolog City National High School",
    kind: "school",
    municipality: "Dipolog",
    province: "Zamboanga del Norte",
    points: 4185,
    movement: -1,
    breakdown: { missions: 11, casesResolved: 3, wasteDivertedKg: 2140, treesSurviving: 420, studentsEducated: 1480 },
  },
  {
    rank: 4,
    name: "Barangay Poblacion",
    kind: "barangay",
    municipality: "Kalibo",
    province: "Aklan",
    points: 3970,
    movement: 1,
    breakdown: { missions: 7, casesResolved: 5, wasteDivertedKg: 3310, treesSurviving: 180, studentsEducated: 520 },
  },
  {
    rank: 5,
    name: "Lucena Youth for the Environment",
    kind: "organisation",
    municipality: "Lucena",
    province: "Quezon",
    points: 3640,
    movement: 3,
    breakdown: { missions: 8, casesResolved: 2, wasteDivertedKg: 1120, treesSurviving: 318, studentsEducated: 980 },
  },
  {
    rank: 6,
    name: "Barangay Bagong Silang",
    kind: "barangay",
    municipality: "Cebu City",
    province: "Cebu",
    points: 3380,
    movement: -2,
    breakdown: { missions: 6, casesResolved: 4, wasteDivertedKg: 2470, treesSurviving: 95, studentsEducated: 410 },
  },
  {
    rank: 7,
    name: "Los Banos Integrated School",
    kind: "school",
    municipality: "Los Banos",
    province: "Laguna",
    points: 3120,
    movement: 4,
    breakdown: { missions: 5, casesResolved: 1, wasteDivertedKg: 760, treesSurviving: 240, studentsEducated: 1340 },
  },
  {
    rank: 8,
    name: "Navotas Coastal Youth Network",
    kind: "organisation",
    municipality: "Navotas",
    province: "Metro Manila",
    points: 2955,
    movement: 0,
    breakdown: { missions: 7, casesResolved: 3, wasteDivertedKg: 2890, treesSurviving: 40, studentsEducated: 360 },
  },
  {
    rank: 9,
    name: "Barangay San Antonio",
    kind: "barangay",
    municipality: "Calamba",
    province: "Laguna",
    points: 2610,
    movement: -3,
    breakdown: { missions: 4, casesResolved: 2, wasteDivertedKg: 1480, treesSurviving: 160, studentsEducated: 480 },
  },
  {
    rank: 10,
    name: "Mati Bantay Kalikasan Volunteers",
    kind: "organisation",
    municipality: "Mati",
    province: "Davao Oriental",
    points: 2480,
    movement: 6,
    breakdown: { missions: 5, casesResolved: 4, wasteDivertedKg: 640, treesSurviving: 120, studentsEducated: 290 },
  },
];

/**
 * The transparency dashboard counters.
 *
 * Several of these are DERIVED from the case and mission data rather than typed in,
 * so the dashboard can never quietly disagree with the pages it summarises. That is
 * the whole point of a transparency dashboard, and getting it wrong on a demo would
 * be a bad joke.
 *
 * Every metric carries a `basis` line saying exactly what is counted. A number
 * without a stated basis is a claim, not a measurement.
 */

const resolvedCases = CASES.filter((c) => c.status === "resolved" || c.status === "monitoring");
const completedMissions = MISSIONS.filter((m) => m.status === "completed");

/** Pull a numeric value out of a result label such as "2,340 kg" or "4,200". */
function numberFrom(value: string | undefined): number {
  if (!value) return 0;
  const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function sumMissionResult(label: string): number {
  return completedMissions.reduce(
    (total, mission) => total + numberFrom(mission.results?.find((r) => r.label === label)?.value),
    0,
  );
}

export const IMPACT: ImpactMetric[] = [
  {
    key: "cases-reported",
    label: "Cases reported",
    value: CASES.length,
    basis: "Every case filed on the platform, at any status, including those not yet verified.",
    href: "/cases",
  },
  {
    key: "cases-resolved",
    label: "Cases resolved",
    value: resolvedCases.length,
    basis: "Cases confirmed fixed by a return visit. Includes those now under monitoring.",
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
    value: sumMissionResult("Volunteers") + sumMissionResult("Volunteers across four cleanups"),
    basis: "Attendance recorded on the day at completed missions, not sign-ups.",
    href: "/act",
  },
  {
    key: "waste",
    label: "Waste collected",
    value: sumMissionResult("Waste collected"),
    unit: "kg",
    basis: "Weighed at completed missions. Excludes anything cleared by an agency without a weight recorded.",
    href: "/act",
  },
  {
    key: "trees",
    label: "Trees and mangroves surviving",
    value: sumMissionResult("Surviving at 90 days") + sumMissionResult("Surviving at 60 days"),
    basis: "Counted at 60 or 90 days after planting, not on planting day. This is a much smaller number than trees planted, and it is the honest one.",
    href: "/act",
  },
  {
    key: "communities",
    label: "Communities reached",
    value: new Set(CASES.map((c) => `${c.barangay}, ${c.municipality}`)).size,
    basis: "Distinct barangays with at least one case on the platform.",
    href: "/map",
  },
  {
    key: "partners",
    label: "Partner organisations",
    value: PARTNERS.length,
    basis: "LGUs, national agencies, barangays, schools, organisations and experts currently receiving referrals.",
    href: "/connect",
  },
];

/** The four counters that sit under the hero. Kept short on purpose. */
export const HERO_IMPACT = IMPACT.filter((m) =>
  ["cases-reported", "cases-resolved", "volunteers", "waste"].includes(m.key),
);
