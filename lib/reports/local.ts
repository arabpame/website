import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type {
  EvidenceFile,
  ReportPublic,
  ReportStore,
  StoredReport,
} from "@/lib/reports/types";

/**
 * A file-backed store for development only.
 *
 * It lets the whole report flow run on a laptop that has no Supabase credentials
 * yet: the form submits, a case number is assigned, the pin appears on the map.
 * Everything lives under .cache/, which is gitignored and which npm run clean
 * deletes.
 *
 * It is never used on Vercel. lib/reports/storage.ts refuses to select it there,
 * because a serverless file system is thrown away after every request and a
 * report written to it would silently disappear.
 */

const DIR = join(process.cwd(), ".cache", "reports");
const FILE = join(DIR, "reports.local.json");
const EVIDENCE_DIR = join(DIR, "evidence");

type LocalRow = StoredReport;

function read(): LocalRow[] {
  if (!existsSync(FILE)) return [];
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as LocalRow[];
  } catch {
    return [];
  }
}

function write(rows: LocalRow[]) {
  mkdirSync(DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(rows, null, 2), "utf8");
}

function toPublic(row: LocalRow): ReportPublic {
  const pub: Partial<LocalRow> = { ...row };
  delete pub.reporterName;
  delete pub.reporterContact;
  delete pub.ipHash;
  return pub as ReportPublic;
}

export const localStore: ReportStore = {
  kind: "local",

  async list() {
    return read()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toPublic);
  },

  async countSince(ipHash, sinceIso) {
    return read().filter((r) => r.ipHash === ipHash && r.createdAt >= sinceIso).length;
  },

  async insert(report) {
    const rows = read();
    const seq = 100 + rows.length;
    const createdAt = new Date().toISOString();
    const year = createdAt.slice(0, 4);
    const row: LocalRow = {
      ...report,
      id: `local-${seq}`,
      seq,
      caseNumber: `EARTH-${year}-${String(seq).padStart(4, "0")}`,
      createdAt,
      evidence: [],
    };
    rows.push(row);
    write(rows);
    return row;
  },

  async attachEvidence(id, caseNumber, files) {
    const stored: EvidenceFile[] = [];
    mkdirSync(join(EVIDENCE_DIR, caseNumber), { recursive: true });
    for (const [i, file] of files.entries()) {
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${caseNumber}/${i + 1}.${ext}`;
      writeFileSync(join(EVIDENCE_DIR, path), file.bytes);
      stored.push({ path, type: file.type, size: file.bytes.byteLength });
    }
    const rows = read();
    const row = rows.find((r) => r.id === id);
    if (row) {
      row.evidence = stored;
      write(rows);
    }
    return stored;
  },

  async signedUrls(files) {
    // There is no URL for a file on a laptop. The email step reports the paths.
    return files.map((f) => `file: .cache/reports/evidence/${f.path}`);
  },
};
