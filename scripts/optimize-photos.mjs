#!/usr/bin/env node
/**
 * optimize-photos.mjs
 *
 * Photographs arrive from a camera, a phone or an image generator at several
 * megabytes each. npm run qa enforces a 300 KB budget per file in public/, and
 * it is right to: these files are cloned, synced through OneDrive and carried to
 * every new laptop forever.
 *
 * This converts everything in public/photos to a web-ready derivative under the
 * budget, and moves the untouched original into photos-master/ at the repo root,
 * which is gitignored. Nothing is destroyed, and the repo stays light.
 *
 * Rules:
 *   - an image with transparency becomes .webp, because it is the only common
 *     format that keeps an alpha channel at a sane file size
 *   - everything else becomes .jpg
 *   - quality steps down until the file fits, then the width comes down
 *
 * Usage:  npm run photos:optimize
 *         npm run photos:optimize -- --budget 200
 *
 * sharp is not a direct dependency of this project. Next.js installs it to do
 * production image optimisation, so it is already present. If that ever stops
 * being true this script says so plainly rather than failing with a stack trace.
 */

import { existsSync, mkdirSync, readdirSync, renameSync, statSync } from "node:fs";
import { join, parse } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const photosDir = join(root, "public", "photos");
const masterDir = join(root, "photos-master");

const SOURCE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);
const QUALITY_STEPS = [82, 74, 66, 58, 50];
const WIDTH_STEPS = [1920, 1600, 1400, 1200];

const budgetArg = process.argv.indexOf("--budget");
const BUDGET_KB = budgetArg === -1 ? 300 : Number(process.argv[budgetArg + 1]) || 300;

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("\n  This script needs sharp, and it is not installed.\n");
  console.error("  Next.js normally provides it. Install it with:\n");
  console.error("    npm install --save-dev sharp\n");
  process.exit(1);
}

if (!existsSync(photosDir)) {
  console.log("No public/photos directory. Nothing to do.");
  process.exit(0);
}

const files = readdirSync(photosDir).filter((f) => SOURCE_EXT.has(parse(f).ext.toLowerCase()));

if (files.length === 0) {
  console.log("No photographs in public/photos. Nothing to do.");
  process.exit(0);
}

const kb = (bytes) => bytes / 1024;
const fmt = (bytes) => `${kb(bytes).toFixed(0)} KB`;

let converted = 0;
let skipped = 0;

console.log(`\n  Optimising ${files.length} photograph(s) to a ${BUDGET_KB} KB budget.\n`);

for (const file of files) {
  const source = join(photosDir, file);
  const { name, ext } = parse(file);
  const sizeBefore = statSync(source).size;

  const meta = await sharp(source).metadata();
  const hasAlpha = Boolean(meta.hasAlpha);
  const targetExt = hasAlpha ? ".webp" : ".jpg";

  // Already small enough and already in a sensible format. Leave it alone so the
  // script is safe to run repeatedly.
  if (kb(sizeBefore) <= BUDGET_KB && ext.toLowerCase() === targetExt) {
    console.log(`  skip    ${file.padEnd(26)} ${fmt(sizeBefore).padStart(9)}  already within budget`);
    skipped += 1;
    continue;
  }

  let best = null;

  outer: for (const width of WIDTH_STEPS) {
    if (meta.width && width > meta.width && width !== WIDTH_STEPS[0]) continue;

    for (const quality of QUALITY_STEPS) {
      const pipeline = sharp(source).resize({
        width: Math.min(width, meta.width ?? width),
        withoutEnlargement: true,
      });

      const buffer = hasAlpha
        ? await pipeline.webp({ quality, effort: 6 }).toBuffer()
        : await pipeline.jpeg({ quality, mozjpeg: true, progressive: true }).toBuffer();

      if (!best || buffer.length < best.buffer.length) {
        best = { buffer, quality, width: Math.min(width, meta.width ?? width) };
      }

      if (kb(buffer.length) <= BUDGET_KB) {
        best = { buffer, quality, width: Math.min(width, meta.width ?? width) };
        break outer;
      }
    }
  }

  if (!best) {
    console.log(`  FAIL    ${file} could not be encoded.`);
    continue;
  }

  mkdirSync(masterDir, { recursive: true });
  renameSync(source, join(masterDir, file));

  const outName = `${name}${targetExt}`;
  await sharp(best.buffer).toFile(join(photosDir, outName));

  const within = kb(best.buffer.length) <= BUDGET_KB;
  console.log(
    `  ${within ? "ok" : "OVER"}      ${outName.padEnd(26)} ${fmt(sizeBefore).padStart(9)} -> ` +
      `${fmt(best.buffer.length).padStart(9)}  q${best.quality} ${best.width}px` +
      (hasAlpha ? "  alpha kept" : ""),
  );
  converted += 1;
}

console.log(
  `\n  ${converted} converted, ${skipped} already fine. Originals moved to photos-master/, which is gitignored.\n`,
);

if (converted > 0) {
  console.log("  If a filename changed extension, update the path in lib/constants.ts.\n");
}
