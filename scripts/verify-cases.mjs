// Verify that every sample case coordinate actually falls inside the region it claims.
// A pin in the wrong sea is the single most obvious way this demo could embarrass
// anyone presenting it. Run by npm run qa.
import { readFileSync } from 'node:fs';

const map = JSON.parse(readFileSync(new URL('../data/ph-map.json', import.meta.url), 'utf8'));
const src = readFileSync(new URL('../data/cases.ts', import.meta.url), 'utf8');

const { lonMin, lonMax, latMin, latMax } = map.bounds;
const VW = map.viewBox.width, VH = map.viewBox.height;
const MID = ((latMin + latMax) / 2) * Math.PI / 180;
const LON_SPAN = (lonMax - lonMin) * Math.cos(MID);
const SCALE = Math.min(VW / LON_SPAN, VH / (latMax - latMin));
const OFF_X = (VW - LON_SPAN * SCALE) / 2;
const OFF_Y = (VH - (latMax - latMin) * SCALE) / 2;
const project = (lon, lat) => [
  (lon - lonMin) * Math.cos(MID) * SCALE + OFF_X,
  (latMax - lat) * SCALE + OFF_Y,
];

function parsePath(p) {
  const pts = []; const re = /([ML])(-?[\d.]+) (-?[\d.]+)/g; let m;
  while ((m = re.exec(p))) pts.push([parseFloat(m[2]), parseFloat(m[3])]);
  return pts;
}
function inside(pt, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
const polys = new Map(map.regions.map(r => [r.short, r.paths.map(parsePath)]));

// Pull caseNumber / region / lat / lng straight out of the data file.
const blocks = src.split(/caseNumber:\s*"/).slice(1);
let pass = 0, fail = 0;
for (const b of blocks) {
  const num = b.slice(0, b.indexOf('"'));
  const region = b.match(/region:\s*"([^"]+)"/)?.[1];
  const lat = parseFloat(b.match(/lat:\s*(-?[\d.]+)/)?.[1]);
  const lng = parseFloat(b.match(/lng:\s*(-?[\d.]+)/)?.[1]);
  const muni = b.match(/municipality:\s*"([^"]+)"/)?.[1] ?? '?';
  if (!region || Number.isNaN(lat) || Number.isNaN(lng)) {
    console.log(` FAIL  ${num}  missing region or coordinates`); fail++; continue;
  }
  const pt = project(lng, lat);
  const hits = [...polys].filter(([, ps]) => ps.some(p => inside(pt, p))).map(([s]) => s);
  const ok = hits.includes(region);
  if (ok) pass++; else { fail++;
    console.log(` FAIL  ${num}  ${muni.padEnd(16)} says ${region.padEnd(9)} but lands in [${hits.join(', ') || 'open water'}]`);
  }
}
console.log(`\ncase coordinates: ${pass} pass, ${fail} fail`);
if (fail) { console.error('Sample case coordinates do not match their stated regions.'); process.exit(1); }
