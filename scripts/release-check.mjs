#!/usr/bin/env node
// One command for "is this safe to deploy?" (CamboMath release:check pattern).
// Prints PASS/FAIL per gate and a final GO / NO-GO. Exit 1 on NO-GO.
//   npm run release:check            quick gates
//   npm run release:check -- --build also runs next build + db:preflight
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
const BUILD = process.argv.includes("--build") || process.argv.includes("--all");
const run = (cmd, argv, env = {}) => spawnSync(cmd, argv, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, env: { ...process.env, ...env } });
const last = (s) => (s || "").trim().split("\n").filter(Boolean).slice(-1)[0] ?? "";
const rows = [];
const record = (name, ok, detail = "") => {
  rows.push(ok);
  console.log(`  ${(ok ? "PASS" : "FAIL").padEnd(5)} ${name.padEnd(26)} ${detail}`);
};

const branch = run("git", ["branch", "--show-current"]).stdout.trim();
const dirty = run("git", ["status", "--porcelain"]).stdout.split("\n").filter((l) => l && !l.startsWith("??") && !l.endsWith(".claude/agent-runs.jsonl")).length;
console.log(`release:check on '${branch}'${branch.startsWith("release/") ? "  (PRODUCTION-deploying branch)" : ""}\n`);
record("git: tracked files clean", dirty === 0, dirty ? `${dirty} uncommitted file(s)` : "clean");

const tsc = run("npx", ["tsc", "--noEmit"]);
record("tsc --noEmit", tsc.status === 0, tsc.status === 0 ? "clean" : last(tsc.stdout));
const lint = run("npx", ["eslint"]);
record("eslint", lint.status === 0, lint.status === 0 ? "0 problems" : last(lint.stdout));
for (const [name, script] of [["text blocks", "validate:blocks"], ["contrast (WCAG AA)", "check:contrast"], ["design tokens", "check:tokens"], ["tests", "test"]]) {
  const r = run("npm", ["run", "-s", script]);
  record(name, r.status === 0, last(r.stdout) || last(r.stderr));
}
if (BUILD) {
  const b = run("npx", ["next", "build"], { AUTH_SECRET: process.env.AUTH_SECRET || "release-check-only-secret" });
  record("next build", b.status === 0, b.status === 0 ? "ok" : last(b.stdout) || last(b.stderr));
  const p = run("npm", ["run", "-s", "db:preflight"]);
  record("db:preflight", p.status === 0, last(p.stdout) || last(p.stderr));
}
const ok = rows.every(Boolean);
console.log(`\n${ok ? "GO" : "NO-GO"}${BUILD ? "" : "  (quick gates only; add --build before a deploy)"}`);
process.exit(ok ? 0 : 1);
