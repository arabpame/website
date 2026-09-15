import "server-only";
import type {
  EvidenceFile,
  NewReport,
  ReportPublic,
  ReportStore,
  StoredReport,
} from "@/lib/reports/types";

/**
 * Supabase, through its REST and Storage APIs, with plain fetch.
 *
 * No client library. The whole surface this project needs is four HTTP calls,
 * and a dependency-free module is one fewer thing to break on a new laptop. The
 * service role key is used because row level security has no policies at all:
 * the anon key can do nothing, and that is deliberate. This file must therefore
 * only ever be imported on the server, which "server-only" above enforces at
 * build time.
 */

const URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
const KEY_VAR = "SUPABASE_SERVICE_ROLE_KEY";
const BUCKET = "evidence";

/** The public columns, and only those. Reporter details and the IP hash stay behind. */
const PUBLIC_COLUMNS = [
  "id",
  "seq",
  "case_number",
  "created_at",
  "category",
  "title",
  "description",
  "observed_on",
  "urgency",
  "barangay",
  "municipality",
  "province",
  "region",
  "landmark",
  "lat",
  "lng",
  "location_source",
  "status",
  "anonymous",
  "evidence",
].join(",");

export function supabaseConfigured(): boolean {
  return Boolean(process.env[URL_VAR] && process.env[KEY_VAR]);
}

function config() {
  const url = process.env[URL_VAR];
  const key = process.env[KEY_VAR];
  if (!url || !key) {
    // Throw, never fall back. A missing credential must stop the request, not
    // quietly turn into a different behaviour.
    throw new Error(`Supabase is not configured. Set ${URL_VAR} and ${KEY_VAR}.`);
  }
  // The easiest mistake on the dashboard is pasting a key into the URL slot.
  // Say so plainly instead of failing on every request with "Invalid URL".
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url.replace(/\/$/, ""))) {
    throw new Error(
      `${URL_VAR} must be the Project URL, like https://abcdefghijkl.supabase.co, not a key. Supabase -> Project Settings -> API Keys, top of the page.`,
    );
  }
  if (/^(sb_publishable_|eyJ.*"role":"anon")/.test(key)) {
    throw new Error(`${KEY_VAR} looks like the public anon key. Use the service_role (or a secret) key, server side only.`);
  }
  return { url: url.replace(/\/$/, ""), key };
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const { url, key } = config();
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(init.headers ?? {}),
    },
    // Reads on the public pages are revalidated on demand after every insert,
    // so the fetch itself must never be cached by Next.
    cache: "no-store",
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Supabase ${init.method ?? "GET"} ${path} failed: ${response.status} ${text.slice(0, 300)}`);
  }
  return response;
}

interface Row {
  id: string;
  seq: number;
  case_number: string;
  created_at: string;
  category: ReportPublic["category"];
  title: string;
  description: string;
  observed_on: string;
  urgency: ReportPublic["urgency"];
  barangay: string;
  municipality: string;
  province: string;
  region: string;
  landmark: string;
  lat: number;
  lng: number;
  location_source: ReportPublic["locationSource"];
  status: ReportPublic["status"];
  anonymous: boolean;
  evidence: EvidenceFile[];
  reporter_name?: string | null;
  reporter_contact?: string | null;
  ip_hash?: string;
}

function fromRow(row: Row): ReportPublic {
  return {
    id: row.id,
    seq: row.seq,
    caseNumber: row.case_number,
    createdAt: row.created_at,
    category: row.category,
    title: row.title,
    description: row.description,
    observedOn: row.observed_on,
    urgency: row.urgency,
    barangay: row.barangay,
    municipality: row.municipality,
    province: row.province,
    region: row.region,
    landmark: row.landmark,
    lat: row.lat,
    lng: row.lng,
    locationSource: row.location_source,
    status: row.status,
    anonymous: row.anonymous,
    evidence: Array.isArray(row.evidence) ? row.evidence : [],
  };
}

function toRow(report: NewReport) {
  return {
    category: report.category,
    title: report.title,
    description: report.description,
    observed_on: report.observedOn,
    urgency: report.urgency,
    barangay: report.barangay,
    municipality: report.municipality,
    province: report.province,
    region: report.region,
    landmark: report.landmark,
    lat: report.lat,
    lng: report.lng,
    location_source: report.locationSource,
    status: report.status,
    anonymous: report.anonymous,
    reporter_name: report.reporterName,
    reporter_contact: report.reporterContact,
    ip_hash: report.ipHash,
  };
}

export const supabaseStore: ReportStore = {
  kind: "supabase",

  async list() {
    const response = await request(`/rest/v1/reports?select=${PUBLIC_COLUMNS}&order=created_at.desc`);
    const rows = (await response.json()) as Row[];
    return rows.map(fromRow);
  },

  async countSince(ipHash, sinceIso) {
    const params = new URLSearchParams({
      select: "id",
      ip_hash: `eq.${ipHash}`,
      created_at: `gte.${sinceIso}`,
    });
    const response = await request(`/rest/v1/reports?${params}`, {
      headers: { Prefer: "count=exact", Range: "0-0", "Range-Unit": "items" },
    });
    // content-range looks like "0-0/3" or "*/0".
    const range = response.headers.get("content-range") ?? "*/0";
    return Number(range.split("/")[1] ?? 0) || 0;
  },

  async insert(report) {
    const response = await request(`/rest/v1/reports?select=${PUBLIC_COLUMNS},reporter_name,reporter_contact,ip_hash`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(toRow(report)),
    });
    const [row] = (await response.json()) as Row[];
    if (!row) throw new Error("Supabase insert returned no row.");
    return {
      ...fromRow(row),
      reporterName: row.reporter_name ?? null,
      reporterContact: row.reporter_contact ?? null,
      ipHash: row.ip_hash ?? report.ipHash,
    } satisfies StoredReport;
  },

  async attachEvidence(id, caseNumber, files) {
    const stored: EvidenceFile[] = [];
    for (const [i, file] of files.entries()) {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${caseNumber}/${i + 1}.${ext}`;
      await request(`/storage/v1/object/${BUCKET}/${path}`, {
        method: "POST",
        headers: { "Content-Type": file.type, "x-upsert": "true" },
        body: file.bytes as BodyInit,
      });
      stored.push({ path, type: file.type, size: file.bytes.byteLength });
    }
    if (stored.length > 0) {
      await request(`/rest/v1/reports?id=eq.${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ evidence: stored }),
      });
    }
    return stored;
  },

  async signedUrls(files, expiresInSeconds) {
    if (files.length === 0) return [];
    const { url } = config();
    const response = await request(`/storage/v1/object/sign/${BUCKET}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn: expiresInSeconds, paths: files.map((f) => f.path) }),
    });
    const signed = (await response.json()) as { signedURL?: string; signedUrl?: string }[];
    return signed
      .map((s) => s.signedURL ?? s.signedUrl ?? "")
      .filter(Boolean)
      .map((s) => `${url}/storage/v1${s}`);
  },
};
