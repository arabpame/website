// Generate the favicon, apple touch icon and OG image for EARTHLINK.
// Zero dependencies: the icon is hand-written SVG, the PNG is encoded here with
// a minimal PNG writer so the project needs no image library.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { join } from 'node:path';

// Default to the repo root, so it runs as `npm run assets:build` from anywhere.
const root = process.argv[2] ?? new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const pub = join(root, 'public');
mkdirSync(pub, { recursive: true });

const INK = [7, 35, 30];
const SIGNAL = [194, 242, 77];
const PAPER = [241, 245, 241];
const DEEP = [11, 59, 50];

// ---------------------------------------------------------------- icon.svg
// The EARTHLINK mark: a location pin whose head is the planet.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#07231E"/>
  <path d="M32 55s18-16.5 18-30A18 18 0 0 0 14 25c0 13.5 18 30 18 30Z" fill="#0B3B32"/>
  <circle cx="32" cy="24.5" r="10.5" fill="#C2F24D"/>
  <path d="M21.8 22.8c3.8 1.5 6.5.8 8.5-1.3 2.2-2.2 1-5 3.5-6.5 1.7-1 4.2-.8 7 .8M22.8 29.8c3.2-1.2 6-.5 8 1.5 1.5 1.5 1.5 3.5.8 5.5" stroke="#07231E" stroke-width="2.6" stroke-linecap="round" fill="none"/>
</svg>`;
writeFileSync(join(pub, 'icon.svg'), icon, 'utf8');

// ---------------------------------------------------------------- og.svg
// 1200x630. Social cards need a real image; SVG is served fine by Next metadata
// and keeps the file at a couple of kilobytes instead of several hundred.
const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#07231E"/>
      <stop offset="100%" stop-color="#0B3B32"/>
    </linearGradient>
    <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0H0v44" fill="none" stroke="#C2F24D" stroke-opacity="0.07" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <g transform="translate(72 68)">
    <rect width="40" height="40" rx="9" fill="#0B3B32"/>
    <path d="M20 34s11-10 11-18A11 11 0 0 0 9 16c0 8 11 18 11 18Z" fill="#F1F5F1"/>
    <circle cx="20" cy="15.5" r="6.5" fill="#C2F24D"/>
    <text x="56" y="27" font-family="Helvetica Neue, Arial, sans-serif" font-size="20" font-weight="800" fill="#F1F5F1" letter-spacing="0.5">EARTHLINK</text>
    <text x="164" y="27" font-family="Consolas, monospace" font-size="12" font-weight="500" fill="#C2F24D" letter-spacing="2.5">PH</text>
  </g>

  <text x="72" y="270" font-family="Helvetica Neue, Arial, sans-serif" font-size="76" font-weight="800" fill="#F1F5F1" letter-spacing="-2">See the problem.</text>
  <text x="72" y="352" font-family="Helvetica Neue, Arial, sans-serif" font-size="76" font-weight="800" fill="#F1F5F1" letter-spacing="-2">Connect the people.</text>
  <text x="72" y="434" font-family="Helvetica Neue, Arial, sans-serif" font-size="76" font-weight="800" fill="#C2F24D" letter-spacing="-2">Create the solution.</text>

  <rect x="72" y="478" width="64" height="2" fill="#C2F24D"/>

  <text x="72" y="536" font-family="Helvetica Neue, Arial, sans-serif" font-size="23" fill="#F1F5F1" fill-opacity="0.72">A digital environmental action platform for the Philippines.</text>

  <g font-family="Consolas, monospace" font-size="15" fill="#F1F5F1" fill-opacity="0.5">
    <circle cx="80" cy="576" r="5" fill="#DF3023"/><text x="94" y="581">Reported</text>
    <circle cx="214" cy="576" r="5" fill="#F79009"/><text x="228" y="581">Verified</text>
    <circle cx="336" cy="576" r="5" fill="#CA8A04"/><text x="350" y="581">Referred</text>
    <circle cx="462" cy="576" r="5" fill="#2E90FA"/><text x="476" y="581">In progress</text>
    <circle cx="616" cy="576" r="5" fill="#12B76A"/><text x="630" y="581">Resolved</text>
    <circle cx="746" cy="576" r="5" fill="#98A2B3"/><text x="760" y="581">Monitoring</text>
  </g>
</svg>`;
writeFileSync(join(pub, 'og.svg'), og, 'utf8');

// ---------------------------------------------------------------- PNG writer
function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = c ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(width, height, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    pixels.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ------------------------------------------------- apple-touch-icon.png 180px
const S = 180;
const px = Buffer.alloc(S * S * 4);
const set = (x, y, [r, g, b], a = 255) => {
  if (x < 0 || y < 0 || x >= S || y >= S) return;
  const i = (y * S + x) * 4;
  const na = a / 255;
  px[i] = Math.round(r * na + px[i] * (1 - na));
  px[i + 1] = Math.round(g * na + px[i + 1] * (1 - na));
  px[i + 2] = Math.round(b * na + px[i + 2] * (1 - na));
  px[i + 3] = 255;
};

// Rounded-rect ink ground.
const R = 38;
for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    const cx = Math.min(Math.max(x, R), S - 1 - R);
    const cy = Math.min(Math.max(y, R), S - 1 - R);
    const d = Math.hypot(x - cx, y - cy);
    if (d <= R) set(x, y, INK, 255);
    else if (d <= R + 1.2) set(x, y, INK, Math.round(255 * (1 - (d - R) / 1.2)));
  }
}

// Pin body: a teardrop, drawn as a circle plus a tapering triangle.
const PCX = S / 2, PCY = 70, PR = 44;
for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    const d = Math.hypot(x - PCX, y - PCY);
    let inside = d <= PR;
    if (!inside && y > PCY) {
      // Taper from the circle's width down to a point at y = 156.
      const t = (y - PCY) / (156 - PCY);
      const halfW = PR * (1 - t) * (1 - t * 0.35);
      inside = Math.abs(x - PCX) <= halfW && y <= 156;
    }
    if (inside) set(x, y, DEEP);
  }
}

// Planet head in chartreuse.
const HR = 26;
for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    const d = Math.hypot(x - PCX, y - PCY);
    if (d <= HR) set(x, y, SIGNAL);
    else if (d <= HR + 1) set(x, y, SIGNAL, Math.round(255 * (1 - (d - HR))));
  }
}

// Two continent strokes across the planet, in ink.
function stroke(points, colour, w) {
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i], [x2, y2] = points[i + 1];
    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 2);
    for (let s = 0; s <= steps; s++) {
      const x = x1 + ((x2 - x1) * s) / steps;
      const y = y1 + ((y2 - y1) * s) / steps;
      for (let dy = -w; dy <= w; dy++) {
        for (let dx = -w; dx <= w; dx++) {
          if (Math.hypot(dx, dy) > w) continue;
          const nx = Math.round(x + dx), ny = Math.round(y + dy);
          if (Math.hypot(nx - PCX, ny - PCY) <= HR) set(nx, ny, colour);
        }
      }
    }
  }
}
stroke([[PCX - 19, PCY - 4], [PCX - 8, PCY - 1], [PCX - 2, PCY - 8], [PCX + 5, PCY - 13], [PCX + 15, PCY - 11]], INK, 2.6);
stroke([[PCX - 17, PCY + 9], [PCX - 6, PCY + 6], [PCX + 2, PCY + 12], [PCX + 4, PCY + 18]], INK, 2.6);

writeFileSync(join(pub, 'apple-touch-icon.png'), png(S, S, px));

console.log('wrote public/icon.svg, public/og.svg, public/apple-touch-icon.png');
