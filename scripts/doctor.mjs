#!/usr/bin/env node
/**
 * The preflight.
 *
 * Checks the MACHINE, not the code, and runs with zero dependencies BEFORE
 * npm install. This is the first thing to run in this project on a laptop it has
 * never seen.
 *
 * It answers: do I have the right Node, is the checkout current, has OneDrive
 * silently reverted anything, are there stale build caches from another operating
 * system, is git configured, and what do I still need to fetch from a dashboard.
 *
 *   node scripts/doctor.mjs
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { platform, homedir } from "node:os";

const root = fileURLToPath(new URL("..", import.meta.url));

const ok = [];
const notes = [];
const warnings = [];
const problems = [];

const pass = (msg) => ok.push(msg);
const note = (msg) => notes.push(msg);
const warn = (msg, fix) => warnings.push({ msg, fix });
const problem = (msg, fix) => problems.push({ msg, fix });

/**
 * Run a command and return its trimmed output, or null.
 *
 * `shell: true` on Windows is not optional here. npm ships as npm.cmd, and
 * execFileSync without a shell cannot launch a .cmd, so the first version of this
 * script reported "npm is not on PATH" on a machine where npm was working fine.
 * A doctor that raises false alarms gets ignored, which defeats its purpose.
 */
function run(cmd, args) {
  try {
    return execFileSync(cmd, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      shell: platform() === "win32",
    }).trim();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Node and npm
// ---------------------------------------------------------------------------

const nodeVersion = process.versions.node;
const [major = 0, minor = 0] = nodeVersion.split(".").map(Number);
if (major > 20 || (major === 20 && minor >= 10)) {
  pass(`Node.js ${nodeVersion}`);
} else {
  problem(
    `Node.js ${nodeVersion} is too old. This project needs 20.10 or newer.`,
    "Install the current LTS from https://nodejs.org, or run: nvm use",
  );
}

if (existsSync(join(root, ".nvmrc"))) {
  const pinned = readFileSync(join(root, ".nvmrc"), "utf8").trim();
  if (pinned && !nodeVersion.startsWith(pinned.split(".")[0] ?? "")) {
    note(`.nvmrc pins Node ${pinned}, this machine runs ${nodeVersion}. Usually fine, worth knowing.`);
  }
}

const npmVersion = run("npm", ["--version"]);
if (npmVersion) pass(`npm ${npmVersion}`);
else problem("npm is not on PATH.", "Reinstall Node.js, which bundles npm.");

// ---------------------------------------------------------------------------
// Git
// ---------------------------------------------------------------------------

const gitVersion = run("git", ["--version"]);
if (gitVersion) {
  pass(gitVersion);

  const isRepo = run("git", ["rev-parse", "--is-inside-work-tree"]) === "true";
  if (!isRepo) {
    warn(
      "This project is not a git repository, so there is no history and no backup.",
      "Run: git init && git add -A && git commit -m \"Initial commit\"",
    );
  } else {
    const name = run("git", ["config", "user.name"]);
    const email = run("git", ["config", "user.email"]);
    if (name && email) pass(`git identity: ${name} <${email}>`);
    else
      problem(
        "git has no user.name or user.email on this machine. Commits will be unattributed.",
        'Run: git config --global user.name "Your Name" && git config --global user.email "you@example.com"',
      );

    const status = run("git", ["status", "--porcelain"]);
    if (status) {
      const count = status.split("\n").filter(Boolean).length;
      note(`${count} uncommitted change(s) in the working tree.`);
    } else {
      pass("Working tree is clean.");
    }

    // A branch both ahead and behind means another laptop pushed first.
    const upstream = run("git", ["rev-parse", "--abbrev-ref", "@{upstream}"]);
    if (upstream) {
      const counts = run("git", ["rev-list", "--left-right", "--count", "@{upstream}...HEAD"]);
      const [behind = "0", ahead = "0"] = (counts ?? "0\t0").split(/\s+/);
      if (Number(behind) > 0 && Number(ahead) > 0) {
        problem(
          `This branch is ${ahead} ahead and ${behind} behind ${upstream}. Another machine pushed first.`,
          "Run: git pull --rebase && git push   (never force-push)",
        );
      } else if (Number(ahead) > 0) {
        warn(`${ahead} commit(s) not pushed. They exist only on this laptop.`, "Run: git push");
      } else if (Number(behind) > 0) {
        warn(`${behind} commit(s) behind ${upstream}.`, "Run: git pull --rebase");
      } else {
        pass(`In sync with ${upstream}.`);
      }
    } else {
      note("No upstream branch set. Nothing is backed up to a remote yet.");
    }
  }
} else {
  problem("git is not on PATH.", "Install it from https://git-scm.com/downloads");
}

// ---------------------------------------------------------------------------
// OneDrive sync conflicts
//
// OneDrive resolves a two-machine edit by keeping one version and saving the
// other beside it with the device name appended. Nothing errors. git status just
// shows unexplained changes plus untracked files, and it reads like normal work.
// In another studio project this silently reverted eight committed files.
// ---------------------------------------------------------------------------

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "out", ".cache"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(root);
const names = new Set(files.map((f) => relative(root, f).replace(/\\/g, "/")));
const conflicts = [];

for (const file of names) {
  // "index-LAPTOPNAME.html" beside "index.html", or "handoff-ATPHMAC-CJ9QPYVMPH.md".
  const m = file.match(/^(.*)-([A-Za-z0-9-]{4,})(\.[^.]+)$/);
  if (!m) continue;

  // The suffix OneDrive appends is a DEVICE NAME, which always carries at least
  // one capital letter. Requiring that is what separates a real conflict copy
  // from "package-lock.json", which the first version of this check flagged as
  // a conflict with package.json on every single run.
  const suffix = m[2] ?? "";
  if (!/[A-Z]/.test(suffix)) continue;

  const original = `${m[1]}${m[3]}`;
  if (names.has(original)) conflicts.push({ copy: file, original });
}

if (conflicts.length > 0) {
  problem(
    `${conflicts.length} possible OneDrive sync conflict copy/copies found. These are usually YOUR WORK, parked under a new name while the original was silently reverted:\n` +
      conflicts.map((c) => `           ${c.copy}  beside  ${c.original}`).join("\n"),
    "Compare each pair against HEAD and against each other's timestamps BEFORE deleting anything.",
  );
} else {
  pass("No OneDrive sync conflict copies.");
}

const inOneDrive = root.replace(/\\/g, "/").toLowerCase().includes("/onedrive/");
if (inOneDrive) {
  note(
    "This project lives inside OneDrive. Build caches and node_modules sync between machines, which causes builds to fail with paths from another operating system. Run npm run clean if a build fails strangely.",
  );
}

// ---------------------------------------------------------------------------
// Stale caches from another operating system
// ---------------------------------------------------------------------------

const nextDir = join(root, ".next");
if (existsSync(nextDir)) {
  let foreign = false;
  try {
    const traceFile = join(nextDir, "trace");
    if (existsSync(traceFile)) {
      const trace = readFileSync(traceFile, "utf8").slice(0, 20000);
      if (platform() === "win32" && /\/Users\/[^/]+\/Library/.test(trace)) foreign = true;
      if (platform() === "darwin" && /[A-Z]:\\\\Users/.test(trace)) foreign = true;
    }
  } catch {
    // Unreadable trace is not worth failing over.
  }
  if (foreign) {
    problem(
      "The .next cache was built on a DIFFERENT operating system and synced here through OneDrive. This is the cause of build errors quoting paths you do not recognise.",
      "Run: npm run clean",
    );
  } else {
    note("A .next build cache is present. If a build fails strangely, run npm run clean first.");
  }
}

// ---------------------------------------------------------------------------
// Dependencies
// ---------------------------------------------------------------------------

if (!existsSync(join(root, "node_modules"))) {
  warn("Dependencies are not installed.", "Run: npm install");
} else {
  pass("node_modules is present.");
}

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

if (!existsSync(join(root, ".env.example"))) {
  problem(".env.example is missing. It is the contract for setting up a new machine.");
} else if (!existsSync(join(root, ".env.local"))) {
  note(
    "No .env.local on this machine. The Phase 1 design build runs fine without one. Create it with: cp .env.example .env.local",
  );
} else {
  const local = readFileSync(join(root, ".env.local"), "utf8");
  const example = readFileSync(join(root, ".env.example"), "utf8");
  const wanted = [...example.matchAll(/^([A-Z_][A-Z0-9_]*)=/gm)].map((m) => m[1]);
  const have = new Set([...local.matchAll(/^([A-Z_][A-Z0-9_]*)=(.*)$/gm)].filter((m) => (m[2] ?? "").trim()).map((m) => m[1]));
  const missing = wanted.filter((k) => !have.has(k));
  if (missing.length === wanted.length) {
    note(".env.local exists but every value is blank. That is correct for the Phase 1 design build.");
  } else if (missing.length) {
    note(`.env.local is missing values for: ${missing.join(", ")}. Fetch each from its provider dashboard, never from another laptop.`);
  } else {
    pass(".env.local has a value for every key in .env.example.");
  }
}

// ---------------------------------------------------------------------------
// Hardcoded home paths
// ---------------------------------------------------------------------------

const home = homedir().replace(/\\/g, "/");
const homeLeak = [];
for (const file of files) {
  if (!/\.(ts|tsx|mjs|js|json|md)$/.test(file)) continue;
  if (relative(root, file).replace(/\\/g, "/") === "scripts/doctor.mjs") continue;
  const src = readFileSync(file, "utf8");
  if (src.includes(home) || /[A-Z]:\\\\Users\\\\/.test(src) || /\/Users\/[a-z]+\/(Library|Desktop)/.test(src)) {
    homeLeak.push(relative(root, file).replace(/\\/g, "/"));
  }
}
if (homeLeak.length) {
  problem(
    `Absolute home paths found in: ${homeLeak.join(", ")}. These break on every other machine.`,
    "Use paths relative to the repo root.",
  );
} else {
  pass("No hardcoded home or machine paths in source.");
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const line = "=".repeat(78);
console.log(line);
console.log(`  EARTHLINK DOCTOR    ${platform()}    Node ${nodeVersion}`);
console.log(`  ${root}`);
console.log(line);
console.log("");

for (const m of ok) console.log(`  OK       ${m}`);

if (notes.length) {
  console.log("");
  console.log("  NOTES (nothing is broken)");
  console.log("");
  for (const m of notes) console.log(`  -  ${m}`);
}

if (warnings.length) {
  console.log("");
  console.log("  WARNINGS (you can work, but read these)");
  console.log("");
  for (const w of warnings) {
    console.log(`  !  ${w.msg}`);
    if (w.fix) console.log(`     fix: ${w.fix}`);
  }
}

if (problems.length) {
  console.log("");
  console.log("  PROBLEMS (fix these first)");
  console.log("");
  for (const p of problems) {
    console.log(`  X  ${p.msg}`);
    if (p.fix) console.log(`     fix: ${p.fix}`);
  }
}

console.log("");
console.log(line);
if (problems.length === 0) {
  console.log(`  This machine can build EARTHLINK. ${warnings.length} warning(s), ${notes.length} note(s).`);
  console.log("  Next: npm install && npm run verify");
} else {
  console.log(`  ${problems.length} problem(s) to fix before this machine can build reliably.`);
}
console.log(line);

process.exit(problems.length > 0 ? 1 : 0);
