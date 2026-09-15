#!/usr/bin/env node
/**
 * Static security scan.
 *
 * Catches the specific mistakes the studio playbook records as having actually
 * happened: a fallback admin password, a secret committed to source, a secret
 * leaked through a NEXT_PUBLIC_ variable, dangerouslySetInnerHTML over untrusted
 * input, and secrets sitting in files git will happily commit.
 *
 * This is a static scan, not a penetration test. It cannot prove the absence of a
 * vulnerability. It can stop the five things that keep recurring.
 *
 * Zero dependencies.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

const errors = [];
const warnings = [];
const fail = (msg, where) => errors.push(where ? `${msg}\n         ${where}` : msg);
const warn = (msg, where) => warnings.push(where ? `${msg}\n         ${where}` : msg);

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "out", ".cache"]);
const SCAN_EXT = new Set([".ts", ".tsx", ".mjs", ".js", ".json", ".md", ".css"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const allFiles = walk(root);
const scanFiles = allFiles.filter((f) => SCAN_EXT.has(extname(f)));
const rel = (f) => relative(root, f).replace(/\\/g, "/");

// ---------------------------------------------------------------------------
// 1. Hardcoded secrets
// ---------------------------------------------------------------------------

const SECRET_PATTERNS = [
  { name: "AWS access key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Private key block", re: /-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: "Supabase service role JWT", re: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/ },
  { name: "Resend API key", re: /\bre_[A-Za-z0-9]{20,}\b/ },
  { name: "Stripe secret key", re: /\bsk_(live|test)_[A-Za-z0-9]{20,}\b/ },
  { name: "GitHub token", re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/ },
  { name: "Generic assigned secret", re: /\b(api[_-]?key|secret|password|token)\s*[:=]\s*["'][A-Za-z0-9+/=_-]{16,}["']/i },
];

for (const file of scanFiles) {
  // This file necessarily contains the patterns it looks for.
  if (rel(file) === "scripts/security-check.mjs") continue;
  const src = readFileSync(file, "utf8");
  for (const pattern of SECRET_PATTERNS) {
    const m = src.match(pattern.re);
    if (m) fail(`Possible ${pattern.name} in source: ${m[0].slice(0, 12)}...`, rel(file));
  }
}

// ---------------------------------------------------------------------------
// 2. Fail-open auth patterns
// ---------------------------------------------------------------------------

for (const file of scanFiles) {
  if (rel(file) === "scripts/security-check.mjs") continue;

  // Code only. Documentation is expected to QUOTE this anti-pattern in order to
  // warn about it, and USER_MANUAL.md does exactly that. Flagging prose about a
  // bug as though it were the bug is how a scanner loses its credibility.
  if (![".ts", ".tsx", ".mjs", ".js"].includes(extname(file))) continue;

  const src = readFileSync(file, "utf8");

  // process.env.SOMETHING || "literal" is the exact bug the playbook records in
  // two existing projects. A missing secret must never degrade to a known value.
  for (const m of src.matchAll(/process\.env\.(\w+)\s*(\|\||\?\?)\s*["'][^"']+["']/g)) {
    const name = m[1] ?? "";
    // A public, non-secret default is fine. A credential default is not.
    if (/PASSWORD|SECRET|TOKEN|KEY|CREDENTIAL/i.test(name)) {
      fail(
        `Fallback value for a credential: process.env.${name} falls back to a literal. Throw instead. A build that will not start beats an open door.`,
        rel(file),
      );
    }
  }

  // Comparing a secret with === leaks length and prefix through timing.
  for (const m of src.matchAll(/(\w*(?:password|secret|token)\w*)\s*===?\s*/gi)) {
    if (/input|candidate|supplied|provided/i.test(m[1] ?? "")) {
      warn(`Possible non-constant-time comparison on a secret: ${m[1]}`, rel(file));
    }
  }
}

// ---------------------------------------------------------------------------
// 3. NEXT_PUBLIC_ is public
// ---------------------------------------------------------------------------

for (const file of scanFiles) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/NEXT_PUBLIC_(\w+)/g)) {
    const name = m[1] ?? "";
    if (/SECRET|PASSWORD|SERVICE_ROLE|PRIVATE/i.test(name)) {
      fail(
        `NEXT_PUBLIC_${name} is shipped in the browser bundle. Anything with that prefix is public. Remove the prefix and keep it server side.`,
        rel(file),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 4. dangerouslySetInnerHTML
// ---------------------------------------------------------------------------

for (const file of scanFiles) {
  if (!/\.tsx?$/.test(file)) continue;
  const src = readFileSync(file, "utf8");
  if (!src.includes("dangerouslySetInnerHTML")) continue;

  // The one legitimate use here is the JSON-LD block, which serialises our own
  // constants and escapes `<`. Anything else needs a look.
  const isJsonLd = rel(file) === "lib/seo.tsx" && /JSON\.stringify/.test(src) && /\\\\u003c/.test(src);
  if (!isJsonLd) {
    fail(
      "dangerouslySetInnerHTML outside the JSON-LD builder. Every use is an XSS surface. If the content is user-supplied, do not do this.",
      rel(file),
    );
  }
}

// ---------------------------------------------------------------------------
// 5. Env hygiene
// ---------------------------------------------------------------------------

const gitignore = existsSync(join(root, ".gitignore"))
  ? readFileSync(join(root, ".gitignore"), "utf8")
  : "";

if (!/^\.env\*?\.local$|^\.env\*/m.test(gitignore)) {
  fail(".gitignore does not ignore .env*.local. Environment files must never be committed.", ".gitignore");
}

for (const file of allFiles) {
  const name = rel(file);
  if (/^\.env(\.|$)/.test(name) && !name.endsWith(".example")) {
    fail(
      `${name} exists in the project. It is gitignored, but this folder is inside OneDrive, so it syncs to the cloud regardless. Treat its contents as exposed.`,
      name,
    );
  }
}

// .env.example must exist once the project has any env var, and must be blank.
const usesEnv = scanFiles.some(
  (f) => !rel(f).startsWith("scripts/") && /process\.env\./.test(readFileSync(f, "utf8")),
);
if (usesEnv && !existsSync(join(root, ".env.example"))) {
  fail(
    "The project reads process.env but there is no .env.example. That file is the contract for setting up a new machine.",
  );
}

if (existsSync(join(root, ".env.example"))) {
  const example = readFileSync(join(root, ".env.example"), "utf8");
  for (const [i, line] of example.split("\n").entries()) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/);
    if (!m) continue;
    const value = (m[2] ?? "").trim();
    // A commented example URL is fine. A real-looking value is not.
    if (value && !value.startsWith("#") && value.length > 8 && !/^https?:\/\/example\./.test(value)) {
      fail(
        `.env.example line ${i + 1} contains a value for ${m[1]}. Values in this file must be blank, or a placeholder nobody could mistake for a real credential.`,
        ".env.example",
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 6. Security headers
// ---------------------------------------------------------------------------

const vercelPath = join(root, "vercel.json");
if (!existsSync(vercelPath)) {
  fail("vercel.json is missing. The house security headers live there.");
} else {
  const vercel = readFileSync(vercelPath, "utf8");
  for (const header of [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
  ]) {
    if (!vercel.includes(header)) fail(`vercel.json is missing the ${header} header.`, "vercel.json");
  }
}

// ---------------------------------------------------------------------------
// 7. External links
// ---------------------------------------------------------------------------

for (const file of scanFiles) {
  if (!/\.tsx$/.test(file)) continue;
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/<a\b([^>]*target=["']_blank["'][^>]*)>/g)) {
    if (!/rel=["'][^"']*noopener/.test(m[1] ?? "")) {
      fail(
        'target="_blank" without rel="noreferrer noopener". The opened page can reach back through window.opener.',
        rel(file),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log("Security check");
console.log(`  ${scanFiles.length} files scanned`);
console.log("");

for (const w of warnings) console.log(`  WARN   ${w}`);
if (warnings.length) console.log("");

if (errors.length === 0) {
  console.log(`  PASS   No blocking issues.${warnings.length ? ` ${warnings.length} warning(s).` : ""}`);
  console.log("");
  console.log("  This is a static scan. It cannot prove the absence of a vulnerability.");
  process.exit(0);
}

for (const e of errors) console.error(`  FAIL   ${e}`);
console.error("");
console.error(`${errors.length} security failure(s).`);
process.exit(1);
