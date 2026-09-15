/**
 * The EARTHLINK domain model.
 *
 * These types describe the Phase 2 platform, not just the Phase 1 design build, so
 * that the data layer does not have to be reshaped when a real database arrives.
 * Everything here is read today from data/*.ts. In Phase 2 the same shapes are
 * served from Supabase and only lib/store.ts changes.
 */

// ---------------------------------------------------------------------------
// Case status: the six public states from the concept document
// ---------------------------------------------------------------------------

export const CASE_STATUSES = [
  "reported",
  "verifying",
  "referred",
  "progress",
  "resolved",
  "monitoring",
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number];

export interface CaseStatusMeta {
  key: CaseStatus;
  /** The label the public sees. Matches the concept document wording. */
  label: string;
  /** What this state actually means, in one plain sentence. */
  meaning: string;
  /** Position in the pipeline, 1 to 6. Drives the six-segment rail. */
  step: number;
  /** Tailwind class for the saturated dot or pin. */
  dotClass: string;
  /** Tailwind class for the darkened label text on a light ground. */
  textClass: string;
  /** Tailwind class for a tinted chip background. */
  chipClass: string;
}

// ---------------------------------------------------------------------------
// Map categories: the seven layers from the concept document
// ---------------------------------------------------------------------------

export const CASE_CATEGORIES = [
  "water",
  "forest",
  "waste",
  "air",
  "biodiversity",
  "land",
  "hazard",
] as const;

export type CaseCategory = (typeof CASE_CATEGORIES)[number];

export interface CaseCategoryMeta {
  key: CaseCategory;
  label: string;
  /** Plain-language description of what belongs in this layer. */
  covers: string;
  dotClass: string;
  textClass: string;
  chipClass: string;
  /** Raw hex for the SVG map, where a Tailwind class cannot reach. */
  hex: string;
}

// ---------------------------------------------------------------------------
// Urgency
// ---------------------------------------------------------------------------

export const URGENCY_LEVELS = ["low", "moderate", "high", "critical"] as const;
export type Urgency = (typeof URGENCY_LEVELS)[number];

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

export interface CaseUpdate {
  /** ISO date. Kept as a string so it serialises across the server boundary. */
  date: string;
  status: CaseStatus;
  /** Who recorded the update. A role, not a private individual's name. */
  actor: string;
  note: string;
}

/** A published article or official release that documents a case or mission. */
export interface SourceLink {
  outlet: string;
  title: string;
  url: string;
  /** ISO date of publication. */
  date: string;
}

export interface EarthCase {
  /** The EARTH Case Number. Format EARTH-YYYY-NNNN. Permanent, never reused. */
  caseNumber: string;
  slug: string;
  title: string;
  category: CaseCategory;
  status: CaseStatus;
  urgency: Urgency;
  /** ISO date the concern was observed by the reporter. */
  observedOn: string;
  /** ISO date the report was filed. */
  reportedOn: string;
  barangay: string;
  municipality: string;
  province: string;
  /** PSGC region short code, matching data/ph-map.json. */
  region: string;
  lat: number;
  lng: number;
  summary: string;
  /** How many separate people reported the same problem. Drives clustering. */
  reportCount: number;
  /** Community corroborations before escalation. */
  validations: number;
  /** The office a verified case was referred to, once it has been. */
  referredTo?: string;
  /** Timestamped history, oldest first. */
  timeline: CaseUpdate[];
  /** Measured result, present only once a case is resolved. */
  outcome?: {
    label: string;
    value: string;
  }[];
  /** Number of evidence files attached. */
  evidenceCount: number;
  /**
   * Where the case came from. "report" is a real report filed through the
   * Report page. Absent or "sample" is design-build sample data. The site marks
   * the difference wherever a case is shown.
   */
  source?: "sample" | "report" | "news";
  /** Public documentation of the case, shown on its page. */
  sources?: SourceLink[];
}

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------

export const MISSION_TYPES = [
  "cleanup",
  "planting",
  "mangrove",
  "recycling",
  "education",
  "gardening",
  "wildlife",
  "segregation",
] as const;

export type MissionType = (typeof MISSION_TYPES)[number];

export interface Mission {
  slug: string;
  title: string;
  type: MissionType;
  /** The case this mission answers, if it came from one. */
  caseNumber?: string;
  date: string;
  barangay: string;
  municipality: string;
  province: string;
  region: string;
  organiser: string;
  /** Volunteer places. */
  capacity: number;
  registered: number;
  status: "open" | "full" | "completed";
  summary: string;
  requirements: string[];
  /** Measured impact, present only on completed missions. */
  results?: {
    label: string;
    value: string;
  }[];
  /** How to join: a URL, a page, an email, or a sentence. Shown when capacity is not tracked here. */
  registration?: string;
  /** Public announcements of the mission. */
  sources?: SourceLink[];
}

// ---------------------------------------------------------------------------
// Learning
// ---------------------------------------------------------------------------

export interface Lesson {
  slug: string;
  title: string;
  /** Minutes. */
  duration: number;
  format: "video" | "infographic" | "reading" | "activity";
  summary: string;
  hasQuiz: boolean;
}

export interface Track {
  slug: string;
  title: string;
  /** Which of the ten concept topics this is. */
  topic: string;
  category: CaseCategory;
  level: "foundation" | "intermediate" | "advanced";
  summary: string;
  /** Who the track is written for. */
  audience: string;
  lessons: Lesson[];
  /** True for the simplified EARTH Kids versions. */
  kids?: boolean;
}

// ---------------------------------------------------------------------------
// Partners
// ---------------------------------------------------------------------------

export const PARTNER_TYPES = [
  "lgu",
  "national-agency",
  "barangay",
  "school",
  "ngo",
  "youth",
  "company",
  "expert",
] as const;

export type PartnerType = (typeof PARTNER_TYPES)[number];

export interface Partner {
  slug: string;
  name: string;
  type: PartnerType;
  /** Area of responsibility, as a person would say it. */
  coverage: string;
  region: string;
  /** What this partner can actually do with a referred case. */
  handles: CaseCategory[];
  casesReceived: number;
  casesAcknowledged: number;
  casesResolved: number;
}

// ---------------------------------------------------------------------------
// Scores
// ---------------------------------------------------------------------------

export interface ScoreEntry {
  rank: number;
  name: string;
  kind: "barangay" | "school" | "organisation" | "municipality";
  municipality: string;
  province: string;
  points: number;
  /** Change in rank since the previous period. Positive is an improvement. */
  movement: number;
  breakdown: {
    missions: number;
    casesResolved: number;
    wasteDivertedKg: number;
    treesSurviving: number;
    studentsEducated: number;
  };
}

// ---------------------------------------------------------------------------
// Impact counters
// ---------------------------------------------------------------------------

export interface ImpactMetric {
  key: string;
  label: string;
  value: number;
  /** Appended to the formatted number, for example "kg". */
  unit?: string;
  /** One line explaining exactly what is counted. Never ship a number without it. */
  basis: string;
  href?: string;
}
