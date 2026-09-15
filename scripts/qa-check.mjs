#!/usr/bin/env node
/**
 * QA check. Runs before every build and in npm run verify.
 *
 * This checks the things a typecheck and a linter cannot: broken internal links,
 * missing metadata, oversized images, console.log left in source, placeholder
 * values that must never ship, and the project-specific rules that this build
 * depends on.
 *
 * Zero dependencies, so it runs on a fresh machine before npm install.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = fileURLToPath(new URL("..", import.meta.url));

const errors = [];
const warnings = [];
const fail = (msg, where) => errors.push(where ? `${msg}\n         ${where}` : msg);
const warn = (msg, where) => warnings.push(where ? `${msg}\n         ${where}` : msg);

// ---------------------------------------------------------------------------
// Collect source files
// ---------------------------------------------------------------------------

// photos-master holds the full-size photograph originals. It is gitignored and
// never shipped, so the page-weight budget below does not apply to it.
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "out",
  ".cache",
  "docs",
  "photos-master",
]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const allFiles = walk(root);
const sourceFiles = allFiles.filter((f) => [".ts", ".tsx"].includes(extname(f)));
const appFiles = sourceFiles.filter((f) => relative(root, f).replace(/\\/g, "/").startsWith("app/"));
const pageFiles = appFiles.filter((f) => /[/\\]page\.tsx$/.test(f));

const read = (f) => readFileSync(f, "utf8");
const rel = (f) => relative(root, f).replace(/\\/g, "/");

// ---------------------------------------------------------------------------
// 1. Every page exports metadata, with a title and description in range
// ---------------------------------------------------------------------------

for (const file of pageFiles) {
  const src = read(file);
  const hasMeta = /export const metadata/.test(src) || /export async function generateMetadata/.test(src);
  if (!hasMeta) fail("Page has no metadata export", rel(file));

  // Titles and descriptions passed to pageMeta are checked for length.
  const titleMatch = src.match(/title:\s*"([^"]{1,200})"/);
  if (titleMatch?.[1] && titleMatch[1].length > 60) {
    fail(`Page title is ${titleMatch[1].length} characters, over the 60 limit`, rel(file));
  }
  const descMatch = src.match(/description:\s*\n?\s*"([^"]{1,500})"/);
  if (descMatch?.[1] && descMatch[1].length > 155) {
    fail(`Meta description is ${descMatch[1].length} characters, over the 155 limit`, rel(file));
  }

  // A computed title on a dynamic route cannot be measured statically, so the
  // rule is that it must go through trim() with the shared limit. `.slice()` on a
  // title cuts mid-word and ignores the " | EARTHLINK" suffix: a case page title
  // read "Household waste dumped along the creek ea" before this check existed.
  for (const m of src.matchAll(/(title|description):\s*([^,\n]*\.slice\([^)]*\))/g)) {
    fail(
      `${m[1]} uses .slice(), which cuts mid-word and ignores the title suffix. Use trim(text, MAX_PAGE_TITLE) or trim(text, MAX_DESCRIPTION) from lib/seo.`,
      rel(file),
    );
  }
}

// ---------------------------------------------------------------------------
// 2. Exactly one h1 per page, and headings do not skip levels
// ---------------------------------------------------------------------------

for (const file of pageFiles) {
  const src = read(file);
  // PageHeader and Hero both render the h1, so count either.
  const h1s =
    (src.match(/<h1[\s>]/g) ?? []).length +
    (src.match(/<PageHeader\b/g) ?? []).length +
    (src.match(/<Hero\b/g) ?? []).length;
  if (h1s === 0) fail("Page renders no h1", rel(file));
  if (h1s > 1) fail(`Page renders ${h1s} h1 elements. There must be exactly one.`, rel(file));
}

// ---------------------------------------------------------------------------
// 3. Internal links point at routes that exist
// ---------------------------------------------------------------------------

const routes = new Set(["/"]);
function collectRoutes(dir, base = "") {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    // Route groups and dynamic segments.
    if (entry.startsWith("(") || entry.startsWith("[")) {
      collectRoutes(full, entry.startsWith("(") ? base : `${base}/${entry}`);
      continue;
    }
    const path = `${base}/${entry}`;
    if (existsSync(join(full, "page.tsx"))) routes.add(path);
    collectRoutes(full, path);
  }
}
collectRoutes(join(root, "app"));

const dynamicRoutes = [...routes].filter((r) => r.includes("["));
const staticRoutes = new Set([...routes].filter((r) => !r.includes("[")));

function routeExists(href) {
  const path = href.split("#")[0]?.split("?")[0] ?? "";
  if (path === "" || path === "/") return true;
  if (staticRoutes.has(path)) return true;
  // Match against dynamic routes: /cases/[slug] matches /cases/anything.
  return dynamicRoutes.some((pattern) => {
    const re = new RegExp("^" + pattern.replace(/\[[^\]]+\]/g, "[^/]+") + "$");
    return re.test(path);
  });
}

for (const file of sourceFiles) {
  const src = read(file);
  const hrefs = [...src.matchAll(/href=["']([^"'{}]+)["']/g)].map((m) => m[1]);
  for (const href of hrefs) {
    if (!href || !href.startsWith("/")) continue;
    // Files in public/ are legitimate hrefs.
    if (existsSync(join(root, "public", href.replace(/^\//, "")))) continue;
    if (!routeExists(href)) fail(`Internal link to a route that does not exist: ${href}`, rel(file));
  }
}

// ---------------------------------------------------------------------------
// 4. No console.log in source, no debug leftovers
// ---------------------------------------------------------------------------

for (const file of sourceFiles) {
  const src = read(file);
  if (/console\.log\(/.test(src)) fail("console.log left in source", rel(file));
  if (/\bdebugger\b/.test(src)) fail("debugger statement left in source", rel(file));
  if (/\bTODO\b|\bFIXME\b|\bXXX\b/.test(src)) warn("TODO or FIXME left in source", rel(file));
}

// ---------------------------------------------------------------------------
// 5. Accessibility basics
// ---------------------------------------------------------------------------

for (const file of sourceFiles) {
  const src = read(file);

  // Every <img> needs an alt. next/image too.
  for (const m of src.matchAll(/<(img|Image)\b([^>]*)>/g)) {
    if (!/\balt=/.test(m[2] ?? "")) fail(`<${m[1]}> without an alt attribute`, rel(file));
  }

  // An <a> or <button> whose only child is an SVG needs an accessible name.
  // Checked loosely: flag a button with no text, no aria-label and no sr-only.
  for (const m of src.matchAll(/<button\b([^>]*)>([\s\S]{0,400}?)<\/button>/g)) {
    const attrs = m[1] ?? "";
    const body = m[2] ?? "";
    const hasName =
      /aria-label=/.test(attrs) ||
      /sr-only/.test(body) ||
      /\{[^}]*\}/.test(body) ||
      /[A-Za-z]{3,}/.test(body.replace(/<[^>]*>/g, ""));
    if (!hasName) fail("Button with no accessible name", rel(file));
  }

  // outline-none without a replacement focus style is a real barrier.
  for (const line of src.split("\n")) {
    if (/outline-none/.test(line) && !/ring-|focus-visible:ring|outline-\[/.test(line)) {
      fail("outline-none with no replacement focus indicator", rel(file));
    }
  }
}

// ---------------------------------------------------------------------------
// 6. Project-specific rules
// ---------------------------------------------------------------------------

// 6a. While IS_DEMO is true, the sample-data banner must be mounted in the layout.
const constants = read(join(root, "lib", "constants.ts"));
const layout = read(join(root, "app", "layout.tsx"));
const isDemo = /export const IS_DEMO = true/.test(constants);
if (isDemo && !/<DemoBanner\s*\/>/.test(layout)) {
  fail(
    "IS_DEMO is true but <DemoBanner /> is not mounted in app/layout.tsx. Sample case data must never be presentable as a real environmental record.",
    "app/layout.tsx",
  );
}

// 6b. Chartreuse must never be small text on the light ground. 1.18:1.
for (const file of sourceFiles) {
  const src = read(file);
  for (const [i, line] of src.split("\n").entries()) {
    // text-brand-signal on a light surface. Allowed inside an `on-ink` scope or
    // on an explicitly dark element, which is why this checks the same line only.
    if (/text-brand-signal/.test(line) && /bg-(brand-paper|brand-surface|white)\b/.test(line)) {
      fail(
        `Chartreuse text on a light ground at line ${i + 1}. That pair is 1.18:1. See docs/CONTRAST.md.`,
        rel(file),
      );
    }
  }
}

// 6c. The mono face is for data, never for prose.
for (const file of sourceFiles) {
  const src = read(file);
  for (const m of src.matchAll(/<p\b([^>]*font-data[^>]*)>([\s\S]{0,300}?)<\/p>/g)) {
    const text = (m[2] ?? "").replace(/<[^>]*>/g, "").replace(/\{[^}]*\}/g, "").trim();
    // A long sentence in mono is prose. Short labels and numbers are fine.
    if (text.split(/\s+/).length > 12) {
      fail("Prose set in the data (monospace) face. That face is for data only.", rel(file));
    }
  }
}

// 6d. Placeholder contact values must not ship.
if (!isDemo) {
  for (const m of constants.matchAll(/(\w+):\s*"(TO BE SUPPLIED[^"]*)"/g)) {
    fail(`Placeholder contact value still present: ${m[1]}`, "lib/constants.ts");
  }
}

// 6e. The footer year must be computed, never a literal.
const footer = read(join(root, "components", "layout", "Footer.tsx"));
if (/const year = 20\d\d/.test(footer)) {
  fail(
    "Footer year is hardcoded. It will be wrong on 1 January. Use new Date().getFullYear().",
    "components/layout/Footer.tsx",
  );
}

// ---------------------------------------------------------------------------
// 7. Asset sizes
// ---------------------------------------------------------------------------

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"]);
for (const file of allFiles) {
  if (!IMAGE_EXT.has(extname(file).toLowerCase())) continue;
  const kb = statSync(file).size / 1024;
  if (kb > 300) fail(`Image is ${kb.toFixed(0)} KB, over the 300 KB budget`, rel(file));
}

// Required assets.
for (const asset of ["public/icon.svg", "public/apple-touch-icon.png", "public/og.svg"]) {
  if (!existsSync(join(root, asset))) fail(`Required asset missing: ${asset}`);
}

// Every image path written in source has to exist in public/.
//
// next build does not check this. A missing one compiles, deploys and then
// renders as a silent hole on the live site. It happens most often by renaming:
// a file saved as founder-hero.png.jpg no longer answers to /photos/founder-hero.jpg,
// and nothing anywhere says so. Twelve more photographs are expected, so this is
// checked rather than watched for.
const referenced = new Map();
for (const file of sourceFiles) {
  for (const m of read(file).matchAll(/["'`](\/[\w.\-/]+\.(?:png|jpe?g|webp|avif|gif|svg))["'`]/g)) {
    if (!referenced.has(m[1])) referenced.set(m[1], rel(file));
  }
}

for (const [path, where] of referenced) {
  if (existsSync(join(root, "public", path))) continue;

  // Name the near miss when there is one. The fix is almost always a rename.
  const dir = join(root, "public", path.slice(0, path.lastIndexOf("/")));
  const wanted = path.slice(path.lastIndexOf("/") + 1);
  const stem = wanted.slice(0, wanted.lastIndexOf("."));
  const near = existsSync(dir)
    ? readdirSync(dir).filter((f) => f.startsWith(stem) && f !== wanted)
    : [];

  fail(
    `Image ${path} is referenced but does not exist in public/.` +
      (near.length ? ` Found ${near.join(", ")} instead. Rename it, do not re-encode.` : ""),
    where,
  );
}

// The committed map data must exist, or the whole site loses its map.
if (!existsSync(join(root, "data", "ph-map.json"))) {
  fail("data/ph-map.json is missing. Run npm run map:build.");
}

// ---------------------------------------------------------------------------
// 8. Docs must exist
// ---------------------------------------------------------------------------

for (const doc of ["README.md", "USER_MANUAL.md", "handoff.md", "PROJECT_RULES.md", "DESIGN_DIRECTION.md"]) {
  if (!existsSync(join(root, doc))) fail(`Required document missing: ${doc}`);
}

// ---------------------------------------------------------------------------
// 9. Map geometry and case coordinates (delegated to their own scripts)
// ---------------------------------------------------------------------------

for (const script of ["verify-map.mjs", "verify-cases.mjs"]) {
  try {
    execFileSync(process.execPath, [join(root, "scripts", script)], { stdio: "pipe" });
  } catch (err) {
    const out = `${err.stdout ?? ""}${err.stderr ?? ""}`.trim();
    fail(`${script} failed:\n${out.split("\n").slice(-6).join("\n")}`);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log("QA check");
console.log(`  ${sourceFiles.length} source files, ${pageFiles.length} pages, ${staticRoutes.size} static routes`);
console.log("");

for (const w of warnings) console.log(`  WARN   ${w}`);
if (warnings.length) console.log("");

if (errors.length === 0) {
  console.log(`  PASS   No blocking issues.${warnings.length ? ` ${warnings.length} warning(s).` : ""}`);
  process.exit(0);
}

for (const e of errors) console.error(`  FAIL   ${e}`);
console.error("");
console.error(`${errors.length} QA failure(s).`);
process.exit(1);
