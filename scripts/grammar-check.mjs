#!/usr/bin/env node
/**
 * Grammar and house-style check.
 *
 * The headline rule is the em dash. PROJECT_RULES section 3 forbids them
 * absolutely, and they are easy to introduce by accident because most editors and
 * most generated prose produce them freely. That rule runs over EVERYTHING,
 * including code and comments, because an em dash has no legitimate use here.
 *
 * Every other rule runs over PROSE ONLY. The first version of this script checked
 * raw lines and produced 156 findings, of which roughly four were real: it was
 * flagging `viewBox="0 0 16 16"` as a repeated word, Tailwind's `items-center` as
 * an American spelling, and JSX indentation as a double space. A checker that
 * cries wolf gets switched off, so this one extracts prose first.
 *
 * Prose means: the text inside JSX elements, string literals long enough to be a
 * sentence, and markdown outside code fences. Not class names, not SVG path data,
 * not identifiers.
 *
 * Zero dependencies.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "out", ".cache"]);
const CHECK_EXT = new Set([".ts", ".tsx", ".md", ".css"]);
// PROJECT_RULES.md is copied in unchanged from the playbook and is not ours to edit.
// CONTRAST.md is generated.
const SKIP_FILES = new Set(["PROJECT_RULES.md", "CONTRAST.md"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (CHECK_EXT.has(extname(full)) && !SKIP_FILES.has(basename(full))) out.push(full);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Prose extraction
// ---------------------------------------------------------------------------

/** Does this string look like human prose rather than a token or a class list? */
function looksLikeProse(text) {
  const t = text.trim();
  if (t.length < 25) return false;
  const words = t.split(/\s+/);
  if (words.length < 5) return false;
  // Tailwind class lists, paths, urls, identifiers.
  if (/[{}<>]|https?:\/\/|^\/|\bclassName\b/.test(t)) return false;
  // A class list is mostly tokens carrying a hyphen, colon, slash or bracket.
  // An English word carries none of those, which is what separates
  // "hover:bg-brand-paper/92" from "hover".
  const tokenish = words.filter((w) => /^[a-z0-9]*[:/[\]%-][a-z0-9:/[\]%.-]*$/.test(w)).length;
  if (tokenish / words.length > 0.4) return false;
  // Mostly numbers is SVG data.
  const numeric = words.filter((w) => /^-?[\d.,]+$/.test(w)).length;
  if (numeric / words.length > 0.3) return false;
  return true;
}

/**
 * Pull prose out of a file, returning {line, text} pairs. Line numbers are
 * approximate for multi-line strings, pointing at the line the prose starts on.
 */
function extractProse(file, src) {
  const ext = extname(file);
  const out = [];
  const lines = src.split("\n");

  if (ext === ".md") {
    let inFence = false;
    for (const [i, line] of lines.entries()) {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        continue;
      }
      if (inFence) continue;
      // Skip table rows and link-only lines, which are structure not prose.
      if (/^\s*\|/.test(line)) continue;
      if (looksLikeProse(line)) out.push({ line: i + 1, text: line });
    }
    return out;
  }

  if (ext === ".css") {
    // Only comments carry prose in a stylesheet.
    for (const [i, line] of lines.entries()) {
      const m = line.match(/\/\*(.*)|^\s*\*\s?(.*)/);
      const text = m?.[1] ?? m?.[2];
      if (text && looksLikeProse(text)) out.push({ line: i + 1, text });
    }
    return out;
  }

  // TypeScript and TSX.
  const lineOf = (index) => src.slice(0, index).split("\n").length;

  // 1. Block and line comments.
  for (const m of src.matchAll(/\/\*[\s\S]*?\*\/|\/\/.*/g)) {
    const raw = m[0]
      .replace(/^\/\*+|\*+\/$/g, "")
      .replace(/^\s*\*\s?/gm, "")
      .replace(/^\/\/\s?/gm, "");
    for (const [offset, part] of raw.split("\n").entries()) {
      if (looksLikeProse(part)) out.push({ line: lineOf(m.index) + offset, text: part });
    }
  }

  // 2. Double-quoted string literals that read as sentences.
  for (const m of src.matchAll(/"((?:[^"\\]|\\.){25,})"/g)) {
    if (looksLikeProse(m[1])) out.push({ line: lineOf(m.index), text: m[1] });
  }

  // 3. JSX text nodes: text between > and < that is not markup.
  for (const m of src.matchAll(/>([^<>{}]{25,})</g)) {
    if (looksLikeProse(m[1])) out.push({ line: lineOf(m.index), text: m[1] });
  }

  return out;
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

/** Runs over every raw line of every file. There is no legitimate em dash here. */
const HARD_RULES = [
  {
    name: "em-dash",
    re: /[—–]/g,
    detail: "Em and en dashes are forbidden. Use a comma, a period, or parentheses.",
  },
  {
    name: "smart-quote",
    re: /[‘’“”]/g,
    detail: "Curly quote. Use a straight quote.",
  },
  {
    name: "ellipsis-char",
    re: /…/g,
    detail: "Unicode ellipsis. Use three periods, or rewrite the sentence.",
  },
];

/** Runs over extracted prose only. */
const PROSE_RULES = [
  {
    name: "double-space",
    re: /(?<=[.,;:!?a-zA-Z])  +(?=[a-zA-Z])/g,
    detail: "Double space inside a sentence.",
  },
  {
    name: "us-spelling",
    // Deliberately narrow. Only words that appear in our own prose, never in an
    // API name, an HTML attribute value, or a Tailwind class.
    re: /\b(organiz(?:e|ed|es|ing)|recogniz(?:e|ed|es|ing)|analyz(?:e|ed|es|ing)|behavior|neighbor|favorite|traveled|fulfill(?:ed|ing)?)\b/gi,
    detail: "American spelling. This site is written in Philippine English.",
  },
  {
    name: "misspelling",
    re: /\b(recieve|seperate|occured|untill|definately|enviroment|goverment|publically|accomodate|neccessary|existance|maintainance|thier|teh|adress)\b/gi,
    detail: "Misspelling.",
  },
  {
    name: "double-word",
    re: /\b([a-z]{3,})\s+\1\b/gi,
    detail: "Repeated word.",
    allow: /\b(had had|that that|is is)\b/i,
  },
];

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const issues = [];
const files = walk(root);
let proseCount = 0;

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const relPath = relative(root, file).replace(/\\/g, "/");

  // Hard rules over raw lines.
  for (const [i, line] of src.split("\n").entries()) {
    for (const rule of HARD_RULES) {
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(line))) {
        issues.push({ file: relPath, line: i + 1, rule: rule.name, detail: rule.detail, found: m[0] });
      }
    }
  }

  // Prose rules over extracted prose.
  const prose = extractProse(file, src);
  proseCount += prose.length;
  for (const { line, text } of prose) {
    for (const rule of PROSE_RULES) {
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(text))) {
        if (rule.allow?.test(m[0])) continue;
        issues.push({ file: relPath, line, rule: rule.name, detail: rule.detail, found: m[0].trim() || "spaces" });
      }
    }
  }
}

console.log("Grammar and house-style check");
console.log(`  ${files.length} files, ${proseCount} prose passages`);
console.log("");

if (issues.length === 0) {
  console.log("  PASS   No issues.");
  process.exit(0);
}

const byRule = new Map();
for (const issue of issues) {
  const list = byRule.get(issue.rule) ?? [];
  list.push(issue);
  byRule.set(issue.rule, list);
}

for (const [rule, list] of byRule) {
  console.error(`  ${rule}  (${list.length})`);
  for (const issue of list.slice(0, 15)) {
    console.error(`    ${issue.file}:${issue.line}  ${issue.detail}  Found: ${JSON.stringify(issue.found)}`);
  }
  if (list.length > 15) console.error(`    and ${list.length - 15} more`);
  console.error("");
}

console.error(`${issues.length} grammar issue(s).`);
process.exit(1);
