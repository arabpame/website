#!/usr/bin/env node
/**
 * Delete every build cache.
 *
 * These folders are machine-specific and they sit inside OneDrive, which means
 * they sync between laptops. A cache built on a Mac poisons the next Windows
 * build and produces errors quoting paths from an operating system you are not
 * running. Deleting them is always safe: they are gitignored and they regenerate.
 *
 * Run this FIRST whenever a build fails strangely on a machine, before debugging
 * anything else.
 *
 * Zero dependencies. Runs before npm install.
 */

import { rmSync, existsSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

const TARGETS = [".next", "out", "dist", "build", ".turbo", ".vite", ".cache", "tsconfig.tsbuildinfo"];

function sizeOf(path) {
  let total = 0;
  const st = statSync(path);
  if (!st.isDirectory()) return st.size;
  for (const entry of readdirSync(path)) {
    try {
      total += sizeOf(join(path, entry));
    } catch {
      // A file vanished or is an online-only OneDrive stub. Not worth failing for.
    }
  }
  return total;
}

console.log("Cleaning build caches");
let freed = 0;
let removed = 0;

for (const target of TARGETS) {
  const full = join(root, target);
  if (!existsSync(full)) continue;
  let size = 0;
  try {
    size = sizeOf(full);
  } catch {
    size = 0;
  }
  rmSync(full, { recursive: true, force: true });
  freed += size;
  removed++;
  console.log(`  removed ${target}  ${(size / 1024 / 1024).toFixed(1)} MB`);
}

console.log("");
if (removed === 0) {
  console.log("  Nothing to clean.");
} else {
  console.log(`  ${removed} cache(s) removed, ${(freed / 1024 / 1024).toFixed(1)} MB freed.`);
}
console.log("  Note: data/ph-map.json is committed and is NOT a cache. It was not touched.");
