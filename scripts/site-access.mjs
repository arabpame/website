#!/usr/bin/env node
/**
 * site-access.mjs
 *
 * Takes the live site offline, or puts it back, without touching the code,
 * the repository or the deployment.
 *
 * It flips Vercel's Deployment Protection. With protection ON, every visitor is
 * stopped at a Vercel sign-in screen before reaching a single page. With it OFF,
 * the site is public. Nothing is deleted, nothing is rebuilt, and the switch
 * takes effect in seconds either way.
 *
 * This is the safest possible kill switch:
 *   - the deployment stays exactly as it is, so there is nothing to restore
 *   - no git history changes, so no commit to undo
 *   - no DNS or domain changes, so nothing to propagate
 *   - reversible an unlimited number of times
 *
 *   npm run site:status     is the site public right now?
 *   npm run site:offline    take it down
 *   npm run site:online     put it back
 *
 * The same switch exists in the Vercel dashboard, if this machine is not to hand:
 *   Project  ->  Settings  ->  Deployment Protection  ->  Vercel Authentication
 *
 * Authentication comes from the Vercel CLI login already on this machine, so
 * there is no token to copy and none is ever printed. If you are on a new laptop,
 * run npm run vercel:login first. VERCEL_TOKEN in the environment also works.
 */

import { existsSync, readFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";

const PROJECT = process.env.VERCEL_PROJECT ?? "earthlink";
const API = "https://api.vercel.com";

/**
 * Calling process.exit() while fetch still holds a socket crashes Node on
 * Windows with a libuv assertion, and the shell then sees exit code 127 even
 * though the change worked. A kill switch that reports failure after
 * succeeding is worse than useless, so failures travel as exceptions and the
 * process is allowed to wind down on its own.
 */
class Fail extends Error {}

// Vercel's CLI stores its credentials in the platform's own config location.
// Erick moves between Windows and Mac, so both are handled, plus Linux.
function authFilePaths() {
  const home = homedir();
  const os = platform();

  if (os === "win32") {
    const appData = process.env.APPDATA ?? join(home, "AppData", "Roaming");
    return [join(appData, "com.vercel.cli", "Data", "auth.json")];
  }

  if (os === "darwin") {
    return [
      join(home, "Library", "Application Support", "com.vercel.cli", "auth.json"),
      join(home, ".local", "share", "com.vercel.cli", "auth.json"),
    ];
  }

  return [
    join(process.env.XDG_DATA_HOME ?? join(home, ".local", "share"), "com.vercel.cli", "auth.json"),
  ];
}

function readToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;

  for (const path of authFilePaths()) {
    if (!existsSync(path)) continue;
    try {
      const token = JSON.parse(readFileSync(path, "utf8")).token;
      if (token) return token;
    } catch {
      // A corrupt config is the same as no config. Fall through to the message.
    }
  }

  throw new Fail(
    "Not signed in to Vercel on this machine.\n\n" +
      "  Fix it with:\n\n    npm run vercel:login\n\n  Then run this command again.",
  );
}

async function api(path, init = {}) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${readToken()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body?.error?.message ?? `HTTP ${response.status}`;
    throw new Fail(
      `Vercel refused the request: ${message}` +
        (response.status === 401 || response.status === 403
          ? "\n\n  The saved login may have expired. Run npm run vercel:login."
          : ""),
    );
  }

  return body;
}

async function currentState() {
  const project = await api(`/v9/projects/${PROJECT}`);
  return Boolean(project.ssoProtection);
}

async function setProtection(on) {
  await api(`/v9/projects/${PROJECT}`, {
    method: "PATCH",
    body: JSON.stringify({
      // "all", not "all_except_custom_domains". The public aliases
      // (earthlinkph.vercel.app and earthlink-ebon.vercel.app) are registered as
      // project domains, so the "except custom domains" variant would exempt the
      // very URLs that matter and leave the site fully public while reporting
      // itself as protected.
      ssoProtection: on ? { deploymentType: "all" } : null,
    }),
  });
}

function report(locked) {
  if (locked) {
    console.log("\n  OFFLINE. Every visitor is stopped at a Vercel sign-in screen.");
    console.log("  The deployment is untouched and nothing has been lost.");
    console.log("\n  Put it back with:  npm run site:online\n");
  } else {
    console.log("\n  ONLINE. The site is public and anyone with the link can read it.");
    console.log("\n  Take it down with:  npm run site:offline\n");
  }
}

async function main() {
  const command = (process.argv[2] ?? "status").toLowerCase();

  if (!["status", "offline", "online"].includes(command)) {
    throw new Fail(`Unknown command "${command}". Use status, offline or online.`);
  }

  const before = await currentState();

  if (command === "status") {
    report(before);
    return;
  }

  const wanted = command === "offline";

  if (before === wanted) {
    console.log(`
  Already ${wanted ? "offline" : "online"}. Nothing to change.`);
    report(before);
    return;
  }

  await setProtection(wanted);

  // Read it back rather than trusting the write. A kill switch that reports
  // success without checking is worse than no kill switch.
  const after = await currentState();

  if (after !== wanted) {
    throw new Fail(
      `The change did not stick. The site is still ${after ? "offline" : "online"}.

` +
        "  Use the Vercel dashboard: Settings -> Deployment Protection.",
    );
  }

  console.log(`
  Done. Changed from ${before ? "offline" : "online"} to ${after ? "offline" : "online"}.`);
  report(after);
}

try {
  await main();
} catch (error) {
  console.error(`
  ${error instanceof Fail ? error.message : error}
`);
  process.exitCode = 1;
}
