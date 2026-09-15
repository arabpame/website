/**
 * The data access layer.
 *
 * Every page reads through this module and never imports from data/ directly.
 * That is the whole point: in Phase 2 the sample files are deleted, these functions
 * query Supabase instead, and not one page component changes.
 *
 * The functions are async even though nothing here awaits anything, for the same
 * reason. A synchronous call site would have to be rewritten later.
 */

import { CASES, CASES_BY_DATE } from "@/data/cases";
import { MISSIONS, MISSIONS_COMPLETED, MISSIONS_OPEN } from "@/data/missions";
import { TRACKS, TRACKS_KIDS, TRACKS_MAIN } from "@/data/tracks";
import { IMPACT, HERO_IMPACT, PARTNERS, SCORES } from "@/data/partners";
import type {
  CaseCategory,
  CaseStatus,
  EarthCase,
  ImpactMetric,
  Mission,
  Partner,
  ScoreEntry,
  Track,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

export async function getCases(): Promise<EarthCase[]> {
  return CASES_BY_DATE;
}

export async function getCase(slug: string): Promise<EarthCase | undefined> {
  return CASES.find((c) => c.slug === slug);
}

/** Look a case up by its EARTH case number rather than its slug. */
export async function getCaseByNumber(caseNumber: string): Promise<EarthCase | undefined> {
  return CASES.find((c) => c.caseNumber === caseNumber);
}

export async function getCaseSlugs(): Promise<string[]> {
  return CASES.map((c) => c.slug);
}

export interface CaseFilter {
  status?: CaseStatus;
  category?: CaseCategory;
  region?: string;
}

export async function getFilteredCases(filter: CaseFilter): Promise<EarthCase[]> {
  return CASES_BY_DATE.filter(
    (c) =>
      (!filter.status || c.status === filter.status) &&
      (!filter.category || c.category === filter.category) &&
      (!filter.region || c.region === filter.region),
  );
}

/** The most recent cases, for the homepage. */
export async function getRecentCases(limit = 3): Promise<EarthCase[]> {
  return CASES_BY_DATE.slice(0, limit);
}

/**
 * Cases whose result was measured, for the homepage and the Track page. A resolved
 * case with no measured outcome is not proof of anything, so those are excluded.
 */
export async function getProvenCases(limit = 3): Promise<EarthCase[]> {
  return CASES.filter((c) => c.outcome && c.outcome.length > 0)
    .sort((a, b) => b.reportedOn.localeCompare(a.reportedOn))
    .slice(0, limit);
}

/** Counts per status, for the dashboard pipeline bar. */
export async function getStatusCounts(): Promise<Record<CaseStatus, number>> {
  const counts = {
    reported: 0,
    verifying: 0,
    referred: 0,
    progress: 0,
    resolved: 0,
    monitoring: 0,
  } satisfies Record<CaseStatus, number>;
  for (const c of CASES) counts[c.status] += 1;
  return counts;
}

/** Counts per category, for the map legend and filters. */
export async function getCategoryCounts(): Promise<Record<CaseCategory, number>> {
  const counts = {
    water: 0,
    forest: 0,
    waste: 0,
    air: 0,
    biodiversity: 0,
    land: 0,
    hazard: 0,
  } satisfies Record<CaseCategory, number>;
  for (const c of CASES) counts[c.category] += 1;
  return counts;
}

/**
 * Barangays with more than one case. This is the hotspot view from the concept:
 * the point of the map is to find where a problem keeps coming back, so that
 * intervention can happen before the next one.
 */
export async function getHotspots(): Promise<
  { place: string; municipality: string; province: string; cases: EarthCase[] }[]
> {
  const byPlace = new Map<string, EarthCase[]>();
  for (const c of CASES) {
    const key = `${c.barangay}|${c.municipality}|${c.province}`;
    const list = byPlace.get(key);
    if (list) list.push(c);
    else byPlace.set(key, [c]);
  }
  return [...byPlace.entries()]
    .filter(([, cases]) => cases.length > 1)
    .map(([key, cases]) => {
      const [place = "", municipality = "", province = ""] = key.split("|");
      return { place, municipality, province, cases };
    })
    .sort((a, b) => b.cases.length - a.cases.length);
}

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------

export async function getMissions(): Promise<Mission[]> {
  return MISSIONS;
}

export async function getOpenMissions(limit?: number): Promise<Mission[]> {
  return limit ? MISSIONS_OPEN.slice(0, limit) : MISSIONS_OPEN;
}

export async function getCompletedMissions(limit?: number): Promise<Mission[]> {
  return limit ? MISSIONS_COMPLETED.slice(0, limit) : MISSIONS_COMPLETED;
}

export async function getMission(slug: string): Promise<Mission | undefined> {
  return MISSIONS.find((m) => m.slug === slug);
}

export async function getMissionSlugs(): Promise<string[]> {
  return MISSIONS.map((m) => m.slug);
}

/** Missions raised from a given case, shown on the case page. */
export async function getMissionsForCase(caseNumber: string): Promise<Mission[]> {
  return MISSIONS.filter((m) => m.caseNumber === caseNumber).sort((a, b) => a.date.localeCompare(b.date));
}

// ---------------------------------------------------------------------------
// Learning
// ---------------------------------------------------------------------------

export async function getTracks(): Promise<Track[]> {
  return TRACKS_MAIN;
}

export async function getKidsTracks(): Promise<Track[]> {
  return TRACKS_KIDS;
}

export async function getTrack(slug: string): Promise<Track | undefined> {
  return TRACKS.find((t) => t.slug === slug);
}

export async function getTrackSlugs(): Promise<string[]> {
  return TRACKS.map((t) => t.slug);
}

// ---------------------------------------------------------------------------
// Partners, scores, impact
// ---------------------------------------------------------------------------

export async function getPartners(): Promise<Partner[]> {
  return PARTNERS;
}

export async function getScores(limit?: number): Promise<ScoreEntry[]> {
  return limit ? SCORES.slice(0, limit) : SCORES;
}

export async function getImpact(): Promise<ImpactMetric[]> {
  return IMPACT;
}

export async function getHeroImpact(): Promise<ImpactMetric[]> {
  return HERO_IMPACT;
}

/**
 * Referral responsiveness across all partners. This is the uncomfortable number
 * and it belongs on the transparency dashboard precisely because it is.
 */
export async function getReferralStats(): Promise<{
  received: number;
  acknowledged: number;
  resolved: number;
  acknowledgedRate: number;
  resolvedRate: number;
}> {
  const received = PARTNERS.reduce((n, p) => n + p.casesReceived, 0);
  const acknowledged = PARTNERS.reduce((n, p) => n + p.casesAcknowledged, 0);
  const resolved = PARTNERS.reduce((n, p) => n + p.casesResolved, 0);
  return {
    received,
    acknowledged,
    resolved,
    acknowledgedRate: received ? Math.round((acknowledged / received) * 100) : 0,
    resolvedRate: received ? Math.round((resolved / received) * 100) : 0,
  };
}
