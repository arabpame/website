#!/usr/bin/env node
/**
 * Build the gazetteer used by the report form: every city and municipality in
 * the Philippines, with its province, region and centre point.
 *
 * Source: faeldon/philippines-json-maps (MIT), the same PSA PSGC boundary data
 * the EARTH Map is drawn from, so a place found here lands inside the coastline
 * the map draws. 17 region files give the province names, 88 province files give
 * the municipalities. Each file is cached under .cache/geo and downloaded once.
 *
 * THE OUTPUT IS COMMITTED (data/ph-places.json). The build never touches the
 * network. Re-run this only when the boundary data itself changes.
 *
 *   npm run places:build
 *
 * Zero dependencies.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = join(root, ".cache", "geo");
const outFile = join(root, "data", "ph-places.json");

const BASE = "https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/2023/geojson";

// Same table as scripts/build-map.mjs. PSGC region code -> short code.
const REGIONS = new Map([
  ["1400000000", "CAR"],
  ["100000000", "I"],
  ["200000000", "II"],
  ["300000000", "III"],
  ["1300000000", "NCR"],
  ["400000000", "IV-A"],
  ["1700000000", "MIMAROPA"],
  ["500000000", "V"],
  ["600000000", "VI"],
  ["700000000", "VII"],
  ["800000000", "VIII"],
  ["900000000", "IX"],
  ["1000000000", "X"],
  ["1100000000", "XI"],
  ["1200000000", "XII"],
  ["1600000000", "XIII"],
  ["1900000000", "BARMM"],
]);

async function fetchJson(relPath) {
  const cached = join(cacheDir, relPath.replace(/\//g, "__"));
  if (existsSync(cached)) return JSON.parse(readFileSync(cached, "utf8"));
  const url = `${BASE}/${relPath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  const text = await res.text();
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(cached, text, "utf8");
  return JSON.parse(text);
}

/** Area-weighted centroid of the largest ring, which is the mainland of the place. */
function centroid(geometry) {
  const polygons = geometry.type === "MultiPolygon" ? geometry.coordinates : [geometry.coordinates];
  let best = { area: -1, x: 0, y: 0 };
  for (const polygon of polygons) {
    const ring = polygon[0];
    let area = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      const f = xj * yi - xi * yj;
      area += f;
      cx += (xi + xj) * f;
      cy += (yi + yj) * f;
    }
    area /= 2;
    const abs = Math.abs(area);
    if (abs > best.area && abs > 0) {
      best = { area: abs, x: cx / (6 * area), y: cy / (6 * area) };
    }
  }
  return { lng: best.x, lat: best.y };
}

/**
 * "City of Bacoor" -> "Bacoor City", which is how people say and type it.
 * "City of Manila" -> "Manila", the one city nobody calls Manila City.
 * "Quezon City" stays as it is. Parenthetical notes such as "(Capital)" are
 * dropped. Matching ignores the word "City" anyway (see lib/places.ts).
 */
function displayName(raw) {
  const clean = raw.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  const m = clean.match(/^(?:Science )?City of (.+)$/i);
  if (!m) return clean;
  return m[1] === "Manila" ? "Manila" : `${m[1]} City`;
}

function provinceName(raw) {
  // "NCR, First District (Not a Province)" and friends.
  if (/^NCR/.test(raw)) return "Metro Manila";
  return raw.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

async function main() {
  const places = [];
  let provinceCount = 0;

  for (const [regionCode, short] of REGIONS) {
    const regionFile = await fetchJson(`regions/lowres/provdists-region-${regionCode}.0.001.json`);
    for (const prov of regionFile.features) {
      const provCode = String(prov.properties.adm2_psgc);
      if (!prov.properties.adm2_en) {
        process.stdout.write(`  skipped province ${provCode} in ${short}: no name
`);
        continue;
      }
      const province = provinceName(prov.properties.adm2_en);
      provinceCount += 1;

      const muniFile = await fetchJson(`provdists/lowres/municities-provdist-${provCode}.0.001.json`);
      for (const f of muniFile.features) {
        if (!f.geometry || !f.properties?.adm3_en) {
          // A handful of entries in the source carry a name but no shape. They
          // cannot be placed, so they are left out rather than pinned at 0,0.
          process.stdout.write(`  skipped ${f.properties?.adm3_en ?? "(unnamed)"} (${province}): no geometry or name
`);
          continue;
        }
        const { lat, lng } = centroid(f.geometry);
        const entry = {
          n: displayName(f.properties.adm3_en),
          p: province,
          r: short,
          lat: Number(lat.toFixed(4)),
          lng: Number(lng.toFixed(4)),
        };
        if (/city/i.test(f.properties.geo_level ?? "") || /^City of /i.test(f.properties.adm3_en)) entry.c = 1;
        places.push(entry);
      }
      process.stdout.write(`  ${short.padEnd(9)} ${province.padEnd(28)} ${String(muniFile.features.length).padStart(3)} places\n`);
    }
  }

  // The 2023 boundary set lists highly urbanised and independent component
  // cities outside their provinces, and has no municipality-level shape for
  // them. A reporter in Cebu City or Baguio still has to find their city, so
  // these are added by hand with their city-centre coordinates, under the
  // province people would type. Only the ones the data lacks are added.
  const SUPPLEMENT = [
    ["Angeles City", "Pampanga", "III", 15.145, 120.5887],
    ["Bacolod", "Negros Occidental", "VI", 10.6765, 122.9509],
    ["Baguio", "Benguet", "CAR", 16.4023, 120.596],
    ["Butuan", "Agusan del Norte", "XIII", 8.9475, 125.5406],
    ["Cagayan de Oro", "Misamis Oriental", "X", 8.4542, 124.6319],
    ["Cebu City", "Cebu", "VII", 10.3157, 123.8854],
    ["Cotabato City", "Maguindanao del Norte", "BARMM", 7.2236, 124.2464],
    ["Dagupan", "Pangasinan", "I", 16.0433, 120.3333],
    ["Davao City", "Davao del Sur", "XI", 7.0731, 125.6128],
    ["General Santos", "South Cotabato", "XII", 6.1164, 125.1716],
    ["Iligan", "Lanao del Norte", "X", 8.228, 124.2452],
    ["Iloilo City", "Iloilo", "VI", 10.7202, 122.5621],
    ["Isabela City", "Basilan", "IX", 6.7043, 121.9711],
    ["Lapu-Lapu", "Cebu", "VII", 10.3103, 123.9494],
    ["Lucena", "Quezon", "IV-A", 13.9373, 121.617],
    ["Mandaue", "Cebu", "VII", 10.3236, 123.9223],
    ["Naga", "Camarines Sur", "V", 13.6218, 123.1948],
    ["Olongapo", "Zambales", "III", 14.8386, 120.2842],
    ["Ormoc", "Leyte", "VIII", 11.0064, 124.6075],
    ["Puerto Princesa", "Palawan", "MIMAROPA", 9.7392, 118.7353],
    ["Santiago", "Isabela", "II", 16.6879, 121.5487],
    ["Tacloban", "Leyte", "VIII", 11.2444, 125.0039],
    ["Zamboanga City", "Zamboanga del Sur", "IX", 6.9214, 122.079],
    // Listed in the source with a name but no shape. Kalayaan (Palawan) is left
    // out on purpose: it lies west of the map, in the Spratly Islands.
    ["Jala-jala", "Rizal", "IV-A", 14.3536, 121.3253],
    ["San Pedro", "Laguna", "IV-A", 14.3583, 121.0583],
    ["Limasawa", "Southern Leyte", "VIII", 9.9333, 125.0833],
    ["Pikit", "Cotabato", "XII", 7.05, 124.6833],
  ];
  const key = (n, p) => `${n.toLowerCase().replace(/ city$/, "")}|${p.toLowerCase()}`;
  const have = new Set(places.map((e) => key(e.n, e.p)));
  for (const [n, p, r, lat, lng] of SUPPLEMENT) {
    if (have.has(key(n, p))) continue;
    places.push({ n, p, r, lat, lng, c: 1 });
    process.stdout.write(`  added    ${n} (${p}) from the supplement
`);
  }

  places.sort((a, b) => a.p.localeCompare(b.p) || a.n.localeCompare(b.n));
  writeFileSync(outFile, JSON.stringify(places), "utf8");
  const kb = (Buffer.byteLength(JSON.stringify(places)) / 1024).toFixed(0);
  console.log(`\n  ${places.length} places in ${provinceCount} provinces -> data/ph-places.json (${kb} KB)`);
}

main().catch((err) => {
  console.error(`\n  ${err.message}`);
  process.exitCode = 1;
});
