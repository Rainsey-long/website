/**
 * What did this repo's subagents actually cost? — the report over
 * `.claude/agent-runs.jsonl`, which `.claude/hooks/agent-run-ledger.cjs` writes.
 *
 *   npm run agents:report                 # every session in the ledger
 *   npm run agents:report -- --session <id>
 *   npm run agents:report -- --last       # the most recent session only
 *   npm run agents:report -- --record '{"agent":"ui-ux-designer","tokens":193536,"toolCalls":46,"desc":"..."}'
 *
 * ---------- WHY A REPORT AND NOT JUST A LOG ----------
 *
 * `.claude/reference/agent-budget.md` fitted seventeen agents to
 *
 *     cost ~= 143,900 tokens + 966 tokens per tool call
 *
 * and the consequence is counter-intuitive enough that it has to be restated
 * every time the number is quoted: **the tool-call caps govern 22% of the
 * spend and the dispatch COUNT governs the other 78%.** A raw log of
 * dispatches does not make that visible. This does — the headline line of
 * every session block is the fixed cost that session paid simply for existing,
 * and the batching line beneath it is what a correct batch would have saved.
 *
 * ---------- MEASURED VS ESTIMATED, KEPT APART ----------
 *
 * The ledger's `done` records carry `measured: true` only when the harness
 * actually reported a token count back to the hook. Everything else is the
 * fitted line, and this script labels it `~` and says so in the footer. The
 * whole value of the ledger is being able to RE-fit that line on new data, and
 * a report that silently mixed its own estimates back into the sample would
 * make the next fit a fit of itself.
 *
 * Not a gate. It exits 0 whatever it finds — the discipline it reports on is a
 * judgement call the dispatcher makes, and a build that failed because a
 * session dispatched four agents would be enforcing a rule nobody agreed to.
 */

import { readFileSync, existsSync, appendFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LEDGER = path.join(ROOT, ".claude", "agent-runs.jsonl");

// The fitted line from `.claude/reference/agent-budget.md`, 17 agents,
// 3,116,825 tokens over 694 tool calls. Re-fit it rather than nudging it.
const FIXED_COST = 143_900;
const PER_CALL = 966;

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

// --record lets the dispatcher write a REAL number the hook could not see.
// The parent session is shown an agent's token usage in its result; the hook
// is not necessarily given it. Transcribing it here is what keeps the sample
// honest enough to re-fit.
const record = arg("record");
if (record) {
  let parsed;
  try {
    parsed = JSON.parse(record);
  } catch {
    console.error("--record needs one JSON object, e.g.");
    console.error(`  npm run agents:report -- --record '{"agent":"ui-ux-designer","tokens":193536,"toolCalls":46}'`);
    process.exit(1);
  }
  appendFileSync(
    LEDGER,
    JSON.stringify({
      ts: new Date().toISOString(),
      event: "done",
      session: parsed.session ?? "manual",
      agent: parsed.agent ?? "unknown",
      tier: parsed.tier ?? "unstated",
      model: parsed.model ?? "inherit",
      desc: parsed.desc ?? "",
      measured: true,
      tokens: parsed.tokens ?? null,
      toolCalls: parsed.toolCalls ?? null,
      hand: true,
    }) + "\n",
    "utf8"
  );
  console.log("Recorded.");
  process.exit(0);
}

if (!existsSync(LEDGER)) {
  console.log("No ledger yet — .claude/agent-runs.jsonl does not exist.");
  console.log("It is written by .claude/hooks/agent-run-ledger.cjs on the next Agent dispatch.");
  process.exit(0);
}

const rows = readFileSync(LEDGER, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  })
  .filter(Boolean);

if (rows.length === 0) {
  console.log("Ledger is empty.");
  process.exit(0);
}

const sessions = [];
const bySession = new Map();
for (const row of rows) {
  const key = row.session || "unknown";
  if (!bySession.has(key)) {
    bySession.set(key, { id: key, dispatches: [], done: [], first: row.ts, last: row.ts });
    sessions.push(key);
  }
  const s = bySession.get(key);
  if (row.event === "dispatch") s.dispatches.push(row);
  else if (row.event === "done") s.done.push(row);
  if (row.ts < s.first) s.first = row.ts;
  if (row.ts > s.last) s.last = row.ts;
}

let wanted = sessions;
const only = arg("session");
if (only) wanted = sessions.filter((s) => s.startsWith(only));
if (process.argv.includes("--last")) wanted = sessions.slice(-1);

const pad = (s, n) => String(s).padEnd(n);
const num = (n) => n.toLocaleString("en-US");

function costOf(session) {
  let measured = 0;
  let estimated = 0;
  let measuredCount = 0;
  const doneByDesc = new Map();
  for (const d of session.done) doneByDesc.set(d.desc + "|" + d.agent, d);

  for (const d of session.dispatches) {
    const done = doneByDesc.get(d.desc + "|" + d.agent);
    if (done && done.measured && typeof done.tokens === "number") {
      measured += done.tokens;
      measuredCount += 1;
    } else {
      const calls = done && typeof done.toolCalls === "number" ? done.toolCalls : tierCalls(d.tier);
      estimated += FIXED_COST + PER_CALL * calls;
    }
  }
  return { measured, estimated, measuredCount };
}

function tierCalls(tier) {
  if (tier === "full") return 60;
  if (tier === "surgeon") return 25;
  if (tier === "scout") return 10;
  return 25;
}

console.log("");
console.log("Subagent ledger — .claude/agent-runs.jsonl");
console.log("=".repeat(72));

let totalDispatches = 0;
let totalFixed = 0;

for (const id of wanted) {
  const s = bySession.get(id);
  const { measured, estimated, measuredCount } = costOf(s);
  const n = s.dispatches.length;
  totalDispatches += n;
  totalFixed += n * FIXED_COST;

  console.log("");
  // A `done` record on a background dispatch is a LAUNCH RECEIPT — PostToolUse
  // fires when the tool call returns, which for a background agent is the
  // moment it starts (measured: 126ms after the dispatch record). Counting
  // those as completions would overstate what the ledger knows.
  const receipts = s.done.filter((d) => d.background !== false && !d.measured).length;
  const completions = s.done.length - receipts;
  console.log(`session ${id}   ${s.first.slice(0, 16).replace("T", " ")} → ${s.last.slice(11, 16)}`);
  console.log(
    `  ${n} dispatch${n === 1 ? "" : "es"}, ${completions} with a reported result` +
      (receipts > 0 ? `, ${receipts} background launch receipt(s)` : "")
  );

  for (const d of s.dispatches) {
    const done = s.done.find((x) => x.desc === d.desc && x.agent === d.agent);
    const cost = done && done.measured && typeof done.tokens === "number"
      ? `${num(done.tokens)}`
      : `~${num(FIXED_COST + PER_CALL * (done?.toolCalls ?? tierCalls(d.tier)))}`;
    console.log(
      `    ${pad(d.tier, 8)} ${pad(d.model, 8)} ${pad(d.agent.slice(0, 20), 21)} ${pad(cost, 10)} ${d.desc}`
    );
  }

  const fixed = n * FIXED_COST;
  console.log(`  fixed cost paid: ${num(fixed)} tokens (${n} × ${num(FIXED_COST)})`);
  if (measuredCount > 0) console.log(`  measured:        ${num(measured)} over ${measuredCount} run(s)`);
  if (estimated > 0) console.log(`  estimated:       ~${num(estimated)} over ${n - measuredCount} run(s)`);

  if (n > 1) {
    console.log(
      `  batching:        ${n} → 1 agent would save ${num((n - 1) * FIXED_COST)} tokens of pure overhead`
    );
  }

  const unstated = s.dispatches.filter((d) => d.tier === "unstated").length;
  if (unstated > 0) console.log(`  ⚠ ${unstated} dispatch(es) with no TIER line — agent-tier-check.cjs should have denied these`);
  const cheapModel = s.dispatches.filter((d) => d.tier !== "full" && d.model === "inherit").length;
  if (cheapModel > 0) console.log(`  ⚠ ${cheapModel} non-Full dispatch(es) inheriting the parent model`);
}

console.log("");
console.log("-".repeat(72));
console.log(`${totalDispatches} dispatch(es) across ${wanted.length} session(s).`);
console.log(`Fixed cost floor: ${num(totalFixed)} tokens — paid before any agent did anything.`);
console.log("");
console.log("A `~` figure is the fitted line from .claude/reference/agent-budget.md");
console.log(`(${num(FIXED_COST)} + ${PER_CALL}/tool call), not a measurement. Record a real number with`);
console.log(`  npm run agents:report -- --record '{"agent":"…","tokens":123456,"toolCalls":42}'`);
console.log("");
