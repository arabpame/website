#!/usr/bin/env node
/**
 * Delete a filed report and its photographs, by case number.
 *
 *   npm run report:delete -- EARTH-2026-0102
 *
 * For test reports and for anything filed by mistake. It removes the row from
 * the reports table AND the files from the evidence bucket, which the Supabase
 * dashboard does not do together (the Table Editor deletes the row only, and
 * the SQL editor refuses to touch storage at all).
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local,
 * the same way the site does. Nothing is printed except what was deleted.
 *
 * The public pages keep showing a deleted case until they next rebuild, which
 * happens within five minutes on their own, or at once on a redeploy.
 *
 * Zero dependencies.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const file = join(root, ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

async function main() {
  const caseNumber = (process.argv[2] ?? "").trim().toUpperCase();
  if (!/^EARTH-\d{4}-\d{4}$/.test(caseNumber)) {
    console.error("\n  Usage: npm run report:delete -- EARTH-2026-0102\n");
    process.exitCode = 1;
    return;
  }

  loadEnv();
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) || !key) {
    console.error("\n  NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are needed in .env.local. See supabase/README.md.\n");
    process.exitCode = 1;
    return;
  }
  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

  // 1. Find the row, so the case number is confirmed before anything is removed.
  const found = await fetch(`${url}/rest/v1/reports?select=id,case_number,title,evidence&case_number=eq.${caseNumber}`, { headers });
  const rows = await found.json();
  if (!found.ok) throw new Error(`Lookup failed: ${found.status} ${JSON.stringify(rows).slice(0, 200)}`);
  if (!Array.isArray(rows) || rows.length === 0) {
    console.log(`\n  ${caseNumber} is not in the database. Nothing to delete.\n`);
    return;
  }
  const row = rows[0];
  console.log(`\n  ${row.case_number}: ${row.title}`);

  // 2. Photographs first, through the Storage API.
  const paths = Array.isArray(row.evidence) ? row.evidence.map((f) => f.path).filter(Boolean) : [];
  if (paths.length > 0) {
    const removed = await fetch(`${url}/storage/v1/object/evidence`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ prefixes: paths }),
    });
    if (!removed.ok) throw new Error(`Deleting photographs failed: ${removed.status} ${(await removed.text()).slice(0, 200)}`);
    console.log(`  removed ${paths.length} photograph(s)`);
  } else {
    console.log("  no photographs attached");
  }

  // 3. Then the row.
  const deleted = await fetch(`${url}/rest/v1/reports?id=eq.${row.id}`, {
    method: "DELETE",
    headers: { ...headers, Prefer: "return=minimal" },
  });
  if (!deleted.ok) throw new Error(`Deleting the row failed: ${deleted.status} ${(await deleted.text()).slice(0, 200)}`);
  console.log("  removed the report row");
  console.log("\n  Done. The public pages drop it within five minutes, or at once after a redeploy.\n");
}

main().catch((err) => {
  console.error(`\n  ${err.message}\n`);
  process.exitCode = 1;
});
