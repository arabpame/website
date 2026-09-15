// Verify the generated map geometry in data/ph-map.json.
// Projects 19 real Philippine cities and checks each lands inside the region it is
// actually in. Run by npm run qa. If the map build or the projection ever changes,
// this catches it before anyone sees a pin in the wrong sea.
import { readFileSync } from 'node:fs';

const d = JSON.parse(readFileSync(new URL('../data/ph-map.json', import.meta.url), 'utf8'));
const { lonMin, lonMax, latMin, latMax } = d.bounds;
const VW = d.viewBox.width, VH = d.viewBox.height;
const MID = ((latMin + latMax) / 2) * Math.PI / 180;
const LON_SPAN = (lonMax - lonMin) * Math.cos(MID);
const LAT_SPAN = latMax - latMin;
const SCALE = Math.min(VW / LON_SPAN, VH / LAT_SPAN);
const OFF_X = (VW - LON_SPAN * SCALE) / 2;
const OFF_Y = (VH - LAT_SPAN * SCALE) / 2;
const project = (lon, lat) => [
  (lon - lonMin) * Math.cos(MID) * SCALE + OFF_X,
  (latMax - lat) * SCALE + OFF_Y,
];

function parsePath(p) {
  const pts = [];
  const re = /([ML])(-?[\d.]+) (-?[\d.]+)/g;
  let m;
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

// Real cities with their real regions.
const CITIES = [
  ['Manila',        14.5995, 120.9842, 'NCR'],
  ['Quezon City',   14.6760, 121.0437, 'NCR'],
  ['Baguio',        16.4023, 120.5960, 'CAR'],
  ['Laoag',         18.1978, 120.5936, 'I'],
  ['Tuguegarao',    17.6131, 121.7269, 'II'],
  ['San Fernando P',15.0349, 120.6899, 'III'],
  ['Bacoor, Cavite',14.4590, 120.9366, 'IV-A'],
  ['Calapan',       13.4117, 121.1803, 'MIMAROPA'],
  ['Puerto Princesa',9.7392, 118.7353, 'MIMAROPA'],
  ['Legazpi',       13.1391, 123.7438, 'V'],
  ['Iloilo City',   10.7202, 122.5621, 'VI'],
  ['Cebu City',     10.3157, 123.8854, 'VII'],
  ['Tacloban',      11.2444, 125.0048, 'VIII'],
  ['Zamboanga City', 6.9214, 122.0790, 'IX'],
  ['Cagayan de Oro', 8.4542, 124.6319, 'X'],
  ['Davao City',     7.1907, 125.4553, 'XI'],
  ['General Santos', 6.1164, 125.1716, 'XII'],
  ['Butuan',         8.9475, 125.5406, 'XIII'],
  ['Cotabato City',  7.2236, 124.2464, 'BARMM'],
];

const byShort = new Map(d.regions.map(r => [r.short, r]));
const polysByShort = new Map(
  d.regions.map(r => [r.short, r.paths.map(parsePath)])
);

let pass = 0, fail = 0;
for (const [name, lat, lon, expected] of CITIES) {
  const pt = project(lon, lat);
  const hits = [];
  for (const [short, polys] of polysByShort) {
    if (polys.some(poly => inside(pt, poly))) hits.push(short);
  }
  const ok = hits.includes(expected);
  if (ok) pass++; else fail++;
  console.log(
    `${ok ? '  OK  ' : ' FAIL '} ${name.padEnd(17)} expected ${expected.padEnd(9)} ` +
    `landed in [${hits.join(', ') || 'nothing'}]  at (${pt[0].toFixed(0)}, ${pt[1].toFixed(0)})`
  );
}

console.log(`\n${pass} pass, ${fail} fail out of ${CITIES.length}`);

// Bounding box of all geometry, to confirm the country fills the viewBox sensibly.
let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
for (const r of d.regions) for (const p of r.paths) for (const [x, y] of parsePath(p)) {
  if (x < minX) minX = x; if (x > maxX) maxX = x;
  if (y < minY) minY = y; if (y > maxY) maxY = y;
}
console.log(`\ngeometry bbox: x ${minX.toFixed(0)}..${maxX.toFixed(0)} of ${VW}, y ${minY.toFixed(0)}..${maxY.toFixed(0)} of ${VH}`);

if (fail > 0) {
  console.error(`\n${fail} city/region mismatch(es). The map geometry or projection is wrong.`);
  process.exit(1);
}
