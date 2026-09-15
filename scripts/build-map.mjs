#!/usr/bin/env node
/**
 * Build the Philippines SVG map geometry used by the EARTH Map.
 *
 * Source: faeldon/philippines-json-maps (MIT), which derives its boundaries from
 * Philippine Statistics Authority PSGC shapefiles updated 31 December 2023.
 * https://github.com/faeldon/philippines-json-maps
 *
 * This script downloads the 17 low-resolution region files once, projects them to
 * a fixed SVG viewBox, drops islands too small to render, rounds coordinates, and
 * writes data/ph-map.json into the repo.
 *
 * The OUTPUT IS COMMITTED. The build never touches the network. A fresh laptop with
 * no internet can still run npm run build. Re-run this only when the boundary data
 * itself needs updating.
 *
 *   npm run map:build
 *
 * Zero dependencies.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = join(root, ".cache", "geo");

// PSGC region codes, in the conventional north-to-south order used by the PSA.
const REGIONS = [
  ["1400000000", "CAR", "Cordillera Administrative Region"],
  ["100000000", "I", "Ilocos Region"],
  ["200000000", "II", "Cagayan Valley"],
  ["300000000", "III", "Central Luzon"],
  ["1300000000", "NCR", "National Capital Region"],
  ["400000000", "IV-A", "CALABARZON"],
  ["1700000000", "MIMAROPA", "MIMAROPA Region"],
  ["500000000", "V", "Bicol Region"],
  ["600000000", "VI", "Western Visayas"],
  ["700000000", "VII", "Central Visayas"],
  ["800000000", "VIII", "Eastern Visayas"],
  ["900000000", "IX", "Zamboanga Peninsula"],
  ["1000000000", "X", "Northern Mindanao"],
  ["1100000000", "XI", "Davao Region"],
  ["1200000000", "XII", "SOCCSKSARGEN"],
  ["1600000000", "XIII", "Caraga"],
  ["1900000000", "BARMM", "Bangsamoro Autonomous Region in Muslim Mindanao"],
];

const BASE =
  "https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/2023/geojson/regions/lowres";

// ---------------------------------------------------------------------------
// Projection
// ---------------------------------------------------------------------------

// The Philippine archipelago, with a small margin.
const LON_MIN = 116.0;
const LON_MAX = 127.0;
const LAT_MIN = 4.4;
const LAT_MAX = 21.2;

// A tall viewBox, because the country is far taller than it is wide.
const VW = 620;
const VH = 1000;

/**
 * Equirectangular projection with a cos(lat) correction at the archipelago's
 * mid-latitude. Good enough for a schematic national map, and it avoids shipping
 * a projection library for one country.
 */
const MID_LAT_RAD = (((LAT_MIN + LAT_MAX) / 2) * Math.PI) / 180;
const LON_SPAN = (LON_MAX - LON_MIN) * Math.cos(MID_LAT_RAD);
const LAT_SPAN = LAT_MAX - LAT_MIN;

// Fit the larger span and centre the other, so the country is never distorted.
const SCALE = Math.min(VW / LON_SPAN, VH / LAT_SPAN);
const OFF_X = (VW - LON_SPAN * SCALE) / 2;
const OFF_Y = (VH - LAT_SPAN * SCALE) / 2;

function project(lon, lat) {
  const x = (lon - LON_MIN) * Math.cos(MID_LAT_RAD) * SCALE + OFF_X;
  const y = (LAT_MAX - lat) * SCALE + OFF_Y;
  return [x, y];
}

/** Shoelace area of a projected ring, in square viewBox units. */
function ringArea(points) {
  let a = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    a += points[j][0] * points[i][1] - points[i][0] * points[j][1];
  }
  return Math.abs(a / 2);
}

/**
 * Ramer-Douglas-Peucker. The source is already simplified at the source's own
 * 0.001 setting, but that is simplification in degrees. After projecting to a
 * 620x1000 box we can drop a great deal more without any visible change.
 */
function simplify(points, tolerance) {
  if (points.length < 3) return points;

  const sqTol = tolerance * tolerance;

  function sqSegDist(p, a, b) {
    let x = a[0];
    let y = a[1];
    let dx = b[0] - x;
    let dy = b[1] - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = b[0];
        y = b[1];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    dx = p[0] - x;
    dy = p[1] - y;
    return dx * dx + dy * dy;
  }

  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];

  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDist = 0;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const d = sqSegDist(points[i], points[first], points[last]);
      if (d > maxDist) {
        maxDist = d;
        index = i;
      }
    }
    if (maxDist > sqTol && index !== -1) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  return points.filter((_, i) => keep[i]);
}

// ---------------------------------------------------------------------------
// Fetch, with an on-disk cache so repeated runs do not re-download
// ---------------------------------------------------------------------------

async function loadRegion(code) {
  mkdirSync(cacheDir, { recursive: true });
  const cached = join(cacheDir, `${code}.json`);
  if (existsSync(cached)) return JSON.parse(readFileSync(cached, "utf8"));

  const url = `${BASE}/provdists-region-${code}.0.001.json`;
  process.stdout.write(`  downloading region ${code} ... `);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const json = await res.json();
  writeFileSync(cached, JSON.stringify(json), "utf8");
  console.log("ok");
  return json;
}

// ---------------------------------------------------------------------------
// Convert
// ---------------------------------------------------------------------------

/** Minimum projected area for an island to survive, in square viewBox units. */
const MIN_AREA = 0.08;

/**
 * RDP tolerance in viewBox units, for a large landmass. Under half a pixel at
 * render size.
 *
 * The tolerance is scaled DOWN for small islands, and that is not a refinement,
 * it is a correctness fix. A flat 0.45 tolerance applied to Bongao island in
 * Tawi-Tawi, which is about 1.6 units across, collapsed it into a shape that no
 * longer contained its own municipality. The southernmost province of the country
 * quietly vanished from a national map. Tolerance is now a fraction of each
 * island's own size, so small islands keep their shape and large ones still
 * simplify hard.
 */
const TOLERANCE = 0.45;
const MIN_TOLERANCE = 0.02;

/** Tolerance appropriate to a ring of this projected area. */
function toleranceFor(area) {
  // A ring's rough width is sqrt(area). Allow the tolerance to be at most a
  // twelfth of that, so no island is simplified past recognition.
  return Math.max(MIN_TOLERANCE, Math.min(TOLERANCE, Math.sqrt(area) / 12));
}

function ringsFromGeometry(geom) {
  // Only outer rings. Interior holes (lakes) are not worth the bytes at this scale.
  if (geom.type === "Polygon") return [geom.coordinates[0]];
  if (geom.type === "MultiPolygon") return geom.coordinates.map((poly) => poly[0]);
  return [];
}

function ringToPath(ring) {
  const projected = ring.map(([lon, lat]) => project(lon, lat));
  const area = ringArea(projected);
  if (area < MIN_AREA) return null;

  const reduced = simplify(projected, toleranceFor(area));
  if (reduced.length < 3) return null;
  if (ringArea(reduced) < MIN_AREA) return null;

  // Coordinate precision also scales with the island. Rounding a 1.6-unit island
  // to 0.1 units is a 6 percent error on every vertex; rounding Luzon to 0.1 is
  // invisible. Small rings get an extra decimal, and cost almost nothing because
  // there are few vertices in them.
  const decimals = area < 40 ? 2 : 1;
  const factor = 10 ** decimals;
  const r = (n) => {
    const v = Math.round(n * factor) / factor;
    return Number.isInteger(v) ? String(v) : v.toFixed(decimals);
  };

  let d = `M${r(reduced[0][0])} ${r(reduced[0][1])}`;
  for (let i = 1; i < reduced.length; i++) {
    d += `L${r(reduced[i][0])} ${r(reduced[i][1])}`;
  }
  return d + "Z";
}

async function main() {
  console.log("Building Philippines map geometry");
  console.log(`  viewBox 0 0 ${VW} ${VH}`);

  const regions = [];
  let totalRings = 0;
  let droppedRings = 0;

  for (const [code, short, name] of REGIONS) {
    const fc = await loadRegion(code);
    const paths = [];

    for (const feature of fc.features ?? []) {
      for (const ring of ringsFromGeometry(feature.geometry)) {
        totalRings++;
        const d = ringToPath(ring);
        if (d) paths.push(d);
        else droppedRings++;
      }
    }

    // Largest first, so the mainland paints before its satellite islands.
    paths.sort((a, b) => b.length - a.length);

    regions.push({ code, short, name, paths });
    console.log(`  ${short.padEnd(9)} ${String(paths.length).padStart(3)} shapes  ${name}`);
  }

  const out = {
    // Provenance travels with the data. A future maintainer should never have to
    // guess where a national boundary came from.
    source: "faeldon/philippines-json-maps (MIT), from PSA PSGC shapefiles, 31 December 2023",
    sourceUrl: "https://github.com/faeldon/philippines-json-maps",
    projection: "equirectangular, cos(lat) corrected at the archipelago mid-latitude",
    bounds: { lonMin: LON_MIN, lonMax: LON_MAX, latMin: LAT_MIN, latMax: LAT_MAX },
    viewBox: { width: VW, height: VH },
    generatedBy: "scripts/build-map.mjs",
    regions,
  };

  mkdirSync(join(root, "data"), { recursive: true });
  const target = join(root, "data", "ph-map.json");
  writeFileSync(target, JSON.stringify(out), "utf8");

  const bytes = readFileSync(target).length;
  console.log("");
  console.log(`  kept ${totalRings - droppedRings} of ${totalRings} shapes (dropped ${droppedRings} below ${MIN_AREA} sq units)`);
  console.log(`  wrote data/ph-map.json, ${(bytes / 1024).toFixed(1)} KB`);
  console.log("");
  console.log("  This file is committed. The build does not hit the network.");
}

main().catch((err) => {
  console.error("");
  console.error("Map build failed:", err.message);
  console.error("If this is a network error, the committed data/ph-map.json is still valid.");
  process.exit(1);
});
