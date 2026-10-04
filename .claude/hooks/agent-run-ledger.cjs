#!/usr/bin/env node
/**
 * The agent-run ledger — the measurement half of `.claude/reference/agent-budget.md`.
 *
 * That file's central finding is a fitted line over seventeen agents:
 *
 *     cost ~= 143,900 tokens + 966 tokens per tool call
 *
 * i.e. **78% of what subagents spend here is paid at dispatch, before any work
 * happens**, so the only lever that matters is dispatching fewer of them. But
 * every number behind that line was transcribed BY HAND out of one session's
 * scrollback, which means two things this hook exists to fix: the measurement
 * cannot be repeated without another manual pass, and nothing at all records
 * whether the discipline is actually being followed after the session that
 * wrote the rule ends.
 *
 * This hook is deliberately NOT an enforcement point. `agent-tier-check.cjs`
 * denies a malformed dispatch; this one only ever observes, and it is wired to
 * fail OPEN in every branch — a ledger that can break a dispatch is worse than
 * no ledger, and a hook that throws on an unreadable file would do exactly
 * that. Every failure path here is a silent `process.exit(0)`.
 *
 * Wired for two events on the `Agent` matcher (`.claude/settings.json`):
 *
 *   PreToolUse   -> one `dispatch` record: tier, model, agent type, brief size
 *   PostToolUse  -> one `done` record: whatever usage the harness reports back
 *
 * ---------- WHAT IT CAN AND CANNOT SEE ----------
 *
 * A hook receives the tool call's own JSON and nothing else. So the dispatch
 * side is exact — tier, model and brief length are all in `tool_input`. The
 * completion side is best-effort: the shape of `tool_response` is the
 * harness's, not this repo's, and it may or may not carry usage. Rather than
 * hardcode a field path that will rot, `findUsage()` walks the response for
 * any key that looks like a token count or a tool-call count and records what
 * it finds, marking the record `measured: true`. When it finds nothing the
 * record says `measured: false` and `scripts/agent-report.mjs` falls back to
 * the fitted line above, labelling the number as an ESTIMATE. A ledger that
 * quietly presented an estimate as a measurement would be worse than useless
 * here, because the whole point of the file is to re-measure the fit.
 *
 * **And a `done` record on a BACKGROUND agent is a launch receipt, not a
 * completion.** Measured on the first live dispatch after this hook was wired:
 * the `dispatch` record landed at 00:48:38.377 and the `done` record 126ms
 * later, for an agent that then ran for minutes. Agents are dispatched in the
 * background by default, and PostToolUse fires when the tool CALL returns —
 * which for a background dispatch is the launch. So a background run is
 * structurally `measured: false` and no field walk can rescue it; only a
 * foreground dispatch can hand usage back to a hook. The record therefore
 * carries `background`, and the report labels it, so nobody reads a 126ms
 * round trip as a completed agent.
 *
 * The ledger is `.claude/agent-runs.jsonl`, one JSON object per line, appended
 * and never rewritten. It is COMMITTED, unlike most generated files in this
 * repo, and that is on purpose: sessions run in ephemeral containers, so an
 * untracked ledger is deleted along with the container that wrote it and the
 * cross-session history — the only thing that makes this more useful than
 * reading the current session's scrollback — never accumulates.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const LEDGER = path.join(__dirname, "..", "agent-runs.jsonl");
const MAX_LINES = 5000;

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

/**
 * Depth-limited walk for a token or tool-call count anywhere in the harness's
 * response. Depth-limited because the response can embed a whole transcript,
 * and an unbounded walk over one is exactly the kind of cost this file exists
 * to argue against.
 */
function findUsage(node, depth = 0, acc = { tokens: null, toolCalls: null }) {
  if (!node || depth > 6 || typeof node !== "object") return acc;
  for (const [key, value] of Object.entries(node)) {
    const k = key.toLowerCase();
    if (typeof value === "number" && Number.isFinite(value)) {
      const isTotal = k.includes("total") || k === "tokens" || k.includes("cost");
      if (acc.tokens === null && k.includes("token") && isTotal) acc.tokens = value;
      else if (acc.tokens === null && k === "tokens") acc.tokens = value;
      if (acc.toolCalls === null && (k.includes("toolcall") || k.includes("tool_call") || k.includes("tooluse") || k.includes("tool_use"))) {
        acc.toolCalls = value;
      }
    } else if (value && typeof value === "object") {
      findUsage(value, depth + 1, acc);
    }
    if (acc.tokens !== null && acc.toolCalls !== null) break;
  }
  return acc;
}

/**
 * AUTO-COMMIT (owner request, 2026-09-20): the ledger is committed on purpose
 * (see the header), but nobody remembers to, and a dirty tracked file also
 * failed `release:check`'s "tracked files clean" gate. So after an append this
 * commits JUST this file.
 *
 * - `--only -- <path>` commits that path alone and leaves anything else the
 *   session has staged exactly as it was, so it can never sweep another
 *   agent's half-written files into a commit.
 * - It NEVER pushes. A commit is local and reversible; a push from a hook
 *   could ship to whichever branch the shared folder happens to be on.
 * - Throttled to one commit per 5 minutes so a dispatch and its completion
 *   (which land milliseconds apart) and a burst of agents make one commit,
 *   not dozens. The tail of a burst is committed by the next event.
 * - Skipped while a merge, rebase, cherry-pick or bisect is in progress or
 *   another git process holds the index lock.
 * - Fails open like everything else in this file.
 */
const COMMIT_EVERY_MS = 5 * 60 * 1000;

function autoCommit() {
  try {
    const root = path.join(__dirname, "..", "..");
    const gitDir = path.join(root, ".git");
    if (!fs.existsSync(gitDir)) return;
    for (const busy of ["index.lock", "MERGE_HEAD", "rebase-merge", "rebase-apply", "CHERRY_PICK_HEAD", "BISECT_LOG"]) {
      if (fs.existsSync(path.join(gitDir, busy))) return;
    }
    const rel = ".claude/agent-runs.jsonl";
    const git = (args) => spawnSync("git", args, { cwd: root, encoding: "utf8", timeout: 8000 });
    const dirty = git(["status", "--porcelain", "--", rel]).stdout.trim();
    if (!dirty) return;
    const last = Number(git(["log", "-1", "--format=%ct", "--", rel]).stdout.trim());
    if (Number.isFinite(last) && last > 0 && Date.now() - last * 1000 < COMMIT_EVERY_MS) return;
    git(["commit", "-q", "--no-verify", "--only", "-m", "chore: agent run ledger", "--", rel]);
  } catch {
    /* fail open */
  }
}

function append(record) {
  try {
    fs.appendFileSync(LEDGER, JSON.stringify(record) + "\n", "utf8");
  } catch {
    return;
  }
  // Bound the file so a long-lived repo cannot grow it without limit. Trimming
  // from the FRONT keeps the recent history, which is the half that describes
  // how the rule is being followed now.
  try {
    const lines = fs.readFileSync(LEDGER, "utf8").split("\n").filter(Boolean);
    if (lines.length > MAX_LINES) {
      fs.writeFileSync(LEDGER, lines.slice(-MAX_LINES).join("\n") + "\n", "utf8");
    }
  } catch {
    /* fail open */
  }
  autoCommit();
}

let input;
try {
  input = JSON.parse(readStdin());
} catch {
  process.exit(0);
}

if (!input || input.tool_name !== "Agent") process.exit(0);

const event = input.hook_event_name;
const toolInput = input.tool_input || {};
const prompt = String(toolInput.prompt || "");
const tierMatch = prompt.match(/TIER:\s*(scout|surgeon|full)/i);
const session = String(input.session_id || "").slice(0, 12);
const ts = new Date().toISOString();

if (event === "PreToolUse") {
  append({
    ts,
    event: "dispatch",
    session,
    agent: toolInput.subagent_type || "general-purpose",
    tier: tierMatch ? tierMatch[1].toLowerCase() : "unstated",
    model: toolInput.model || "inherit",
    background: toolInput.run_in_background !== false,
    desc: String(toolInput.description || "").slice(0, 80),
    briefChars: prompt.length,
  });
  process.exit(0);
}

if (event === "PostToolUse") {
  const usage = findUsage(input.tool_response);
  let replyChars = 0;
  try {
    replyChars = JSON.stringify(input.tool_response || "").length;
  } catch {
    replyChars = 0;
  }
  append({
    ts,
    event: "done",
    session,
    agent: toolInput.subagent_type || "general-purpose",
    tier: tierMatch ? tierMatch[1].toLowerCase() : "unstated",
    model: toolInput.model || "inherit",
    desc: String(toolInput.description || "").slice(0, 80),
    background: toolInput.run_in_background !== false,
    measured: usage.tokens !== null,
    tokens: usage.tokens,
    toolCalls: usage.toolCalls,
    replyChars,
  });
}

process.exit(0);
