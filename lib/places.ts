import places from "@/data/ph-places.json";
import { MAP, project } from "@/lib/map";

/**
 * The gazetteer: every city and municipality in the Philippines with its
 * province, region and centre point. Built by scripts/build-places.mjs from the
 * same PSA boundary data as the map, and committed, so the site can turn a typed
 * "Bacoor, Cavite" into a pin with no network call and no API key.
 *
 * Two lookups:
 *   findPlace("bacoor", "cavite")   the reporter typed a location
 *   nearestPlace(14.459, 120.94)    the reporter's device gave coordinates
 */

export interface Place {
  /** Display name, for example "Bacoor" or "Quezon City". */
  name: string;
  province: string;
  /** PSGC region short code, matching data/ph-map.json. */
  region: string;
  lat: number;
  lng: number;
  city: boolean;
}

interface Raw {
  n: string;
  p: string;
  r: string;
  lat: number;
  lng: number;
  c?: 1;
}

export const PLACES: Place[] = (places as Raw[]).map((p) => ({
  name: p.n,
  province: p.p,
  region: p.r,
  lat: p.lat,
  lng: p.lng,
  city: p.c === 1,
}));

/**
 * Reduce a typed name to something comparable: lower case, no accents, no
 * punctuation, and none of the words people add or drop ("City of Bacoor",
 * "Bacoor City", "Bacoor" are the same place).
 */
export function normalisePlaceName(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(city of|municipality of|province of|city|municipality|province|mun|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const byKey = new Map<string, Place[]>();
const byName = new Map<string, Place[]>();
for (const place of PLACES) {
  const n = normalisePlaceName(place.name);
  const key = `${n}|${normalisePlaceName(place.province)}`;
  byKey.set(key, [...(byKey.get(key) ?? []), place]);
  byName.set(n, [...(byName.get(n) ?? []), place]);
}

/** Cheap similarity for the odd misspelling: shared leading characters. */
function commonPrefix(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  return i;
}

/**
 * Find the place a reporter typed. Exact on name and province first, then the
 * name alone if it is unique in the country, then a close province spelling.
 * Returns undefined rather than guessing wrongly: a pin in the wrong province is
 * worse than asking the reporter to check the spelling.
 */
export function findPlace(municipality: string, province: string): Place | undefined {
  const n = normalisePlaceName(municipality);
  const p = normalisePlaceName(province);
  if (!n) return undefined;

  const exact = byKey.get(`${n}|${p}`);
  if (exact?.length) return exact[0];

  const sameName = byName.get(n) ?? [];
  if (sameName.length === 1) return sameName[0];
  if (sameName.length > 1 && p) {
    // Several places share the name. Take the one whose province is the closest
    // spelling, as long as it is a convincing match.
    const scored = sameName
      .map((place) => ({ place, score: commonPrefix(normalisePlaceName(place.province), p) }))
      .sort((a, b) => b.score - a.score);
    const best = scored[0];
    if (best && best.score >= 4 && (scored.length === 1 || best.score > (scored[1]?.score ?? 0))) {
      return best.place;
    }
  }

  return undefined;
}

/** Great-circle distance in kilometres. */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** The city or municipality whose centre is closest to the coordinates. */
export function nearestPlace(lat: number, lng: number): { place: Place; km: number } | undefined {
  let best: { place: Place; km: number } | undefined;
  for (const place of PLACES) {
    const km = distanceKm(lat, lng, place.lat, place.lng);
    if (!best || km < best.km) best = { place, km };
  }
  return best;
}

// ---------------------------------------------------------------------------
// Region membership, from the map's own polygons
// ---------------------------------------------------------------------------

type Poly = [number, number][];

function parsePath(path: string): Poly {
  const pts: Poly = [];
  const re = /([ML])(-?[\d.]+) (-?[\d.]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(path))) pts.push([parseFloat(m[2] ?? "0"), parseFloat(m[3] ?? "0")]);
  return pts;
}

function inside(pt: [number, number], poly: Poly): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i] ?? [0, 0];
    const [xj, yj] = poly[j] ?? [0, 0];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

let regionPolys: { short: string; polys: Poly[] }[] | undefined;

/**
 * Which map region a coordinate falls in, or undefined for open water and
 * anywhere outside the Philippines. Same projection and same polygons as the
 * map, so a coordinate that passes here will draw inside the coastline.
 */
export function regionAt(lat: number, lng: number): string | undefined {
  regionPolys ??= MAP.regions.map((r) => ({ short: r.short, polys: r.paths.map(parsePath) }));
  const { x, y } = project(lat, lng);
  const hit = regionPolys.find((r) => r.polys.some((poly) => inside([x, y], poly)));
  return hit?.short;
}

/** Inside the map's bounding box at all. A quick sanity check before the polygon test. */
export function withinPhilippines(lat: number, lng: number): boolean {
  const { lonMin, lonMax, latMin, latMax } = MAP.bounds;
  return lat >= latMin && lat <= latMax && lng >= lonMin && lng <= lonMax;
}
