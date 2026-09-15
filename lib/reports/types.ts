import type { CaseCategory, CaseStatus, Urgency } from "@/lib/types";

/**
 * A report as it is stored. This is the row shape of public.reports, in camel
 * case, split into the part the public site may read and the part it never may.
 */

export interface EvidenceFile {
  /** Object path inside the evidence bucket, for example EARTH-2026-0700/1.jpg */
  path: string;
  type: string;
  size: number;
}

export type LocationSource = "device" | "place";

/** Everything the public site is allowed to read. */
export interface ReportPublic {
  id: string;
  seq: number;
  caseNumber: string;
  /** ISO timestamp. */
  createdAt: string;
  category: CaseCategory;
  title: string;
  description: string;
  /** ISO date. */
  observedOn: string;
  urgency: Urgency;
  barangay: string;
  municipality: string;
  province: string;
  region: string;
  landmark: string;
  lat: number;
  lng: number;
  locationSource: LocationSource;
  status: CaseStatus;
  anonymous: boolean;
  evidence: EvidenceFile[];
}

/** The private columns. Written once, read only by the notification email. */
export interface ReportPrivate {
  reporterName: string | null;
  reporterContact: string | null;
  ipHash: string;
}

/** What the server action hands to storage. The database assigns id, seq, number and time. */
export type NewReport = Omit<ReportPublic, "id" | "seq" | "caseNumber" | "createdAt" | "evidence"> &
  ReportPrivate;

/** A stored report, with its assigned identity. */
export type StoredReport = ReportPublic & ReportPrivate;

/** An uploaded photograph, already compressed in the browser. */
export interface EvidenceUpload {
  bytes: Uint8Array;
  type: string;
}

/**
 * The storage contract. Two implementations: Supabase for real, and a local file
 * for development on a laptop without credentials. lib/reports/storage.ts picks.
 */
export interface ReportStore {
  readonly kind: "supabase" | "local";
  /** Public rows, newest first. */
  list(): Promise<ReportPublic[]>;
  /** How many reports this IP hash filed since the given ISO time. */
  countSince(ipHash: string, sinceIso: string): Promise<number>;
  insert(report: NewReport): Promise<StoredReport>;
  /** Store the files under the case number and record them on the row. */
  attachEvidence(id: string, caseNumber: string, files: EvidenceUpload[]): Promise<EvidenceFile[]>;
  /** Short-lived links for the notification email. */
  signedUrls(files: EvidenceFile[], expiresInSeconds: number): Promise<string[]>;
}
