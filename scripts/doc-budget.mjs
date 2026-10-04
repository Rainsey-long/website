// Token budget for the docs every session and every subagent loads before it
// does anything: CLAUDE.md and its @ imports (followed one level, as Claude
// Code does). Over budget = move detail to .claude/reference/ or docs/ and
// leave a pointer (role.md). Exit 1 when over.
//   node scripts/doc-budget.mjs          # report
//   node scripts/doc-budget.mjs --quiet  # one line (used by the session hook)
import fs from "node:fs";
import path from "node:path";

const BUDGET_BYTES = 36_000; // ~9k tokens of mostly English
const MEMORY_MAX = 3_000;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const files = new Set(["CLAUDE.md"]);
for (const line of fs.readFileSync(path.join(root, "CLAUDE.md"), "utf8").split("\n")) {
  const m = /^@(\S+)/.exec(line.trim());
  if (m) files.add(m[1]);
}
const rows = [...files].map((f) => [f, fs.existsSync(path.join(root, f)) ? fs.statSync(path.join(root, f)).size : -1]);
const missing = rows.filter(([, n]) => n < 0).map(([f]) => f);
const total = rows.reduce((s, [, n]) => s + Math.max(0, n), 0);
const memory = rows.find(([f]) => f.endsWith("memory/MEMORY.md"))?.[1] ?? 0;
const tokens = Math.round(total / 4);
const over = total > BUDGET_BYTES || memory > MEMORY_MAX || missing.length > 0;
if (process.argv.includes("--quiet")) {
  console.log(`auto-loaded docs: ${(total / 1024).toFixed(1)} KB (~${tokens} tokens) of ${BUDGET_BYTES / 1000} KB budget${over ? " — OVER, trim before adding" : ""}`);
} else {
  for (const [f, n] of rows.sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(6)}  ${f}${n < 0 ? "  MISSING" : ""}`);
  console.log(`${String(total).padStart(6)}  total (~${tokens} tokens), budget ${BUDGET_BYTES}; memory ${memory}/${MEMORY_MAX}`);
}
process.exit(over ? 1 : 0);
