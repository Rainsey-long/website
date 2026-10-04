#!/usr/bin/env node
/**
 * PreToolUse hook on the `Agent` tool — enforces `.claude/reference/agent-budget.md`'s
 * tiering discipline mechanically, because relying on the dispatching model to
 * remember it has already failed once (2026-09-06: 8 agents dispatched in one
 * session, every one tiered Full, none with a model override, ~1.45M tokens).
 *
 * Two checks, both cheap and both things a hook can actually verify from the
 * tool call's own JSON — it cannot judge whether Full was the RIGHT tier for
 * the task, only whether a tier was declared at all and whether the model
 * lever was used when the tier calls for it:
 *
 *   1. The prompt must contain a `TIER: Scout|Surgeon|Full` line. Forces a
 *      conscious choice every dispatch instead of a silent default.
 *   2. If the declared tier is Scout or Surgeon, a `model` field must be set
 *      on the tool call. Full is exempt — the doc says Full is allowed to
 *      inherit the parent model.
 *
 * Reads the hook's stdin JSON, decides, and prints a PreToolUse
 * hookSpecificOutput. Any input this script cannot parse, or any tool other
 * than `Agent`, is allowed through untouched — this hook only ever narrows
 * ONE tool's dispatch shape, never the harness's own behaviour.
 */

let raw = "";
try {
  raw = require("fs").readFileSync(0, "utf8");
} catch {
  process.exit(0);
}

let input;
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

if (input.tool_name !== "Agent") {
  process.exit(0);
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

const toolInput = input.tool_input || {};
const prompt = String(toolInput.prompt || "");
const model = toolInput.model;

const tierMatch = prompt.match(/TIER:\s*(scout|surgeon|full)/i);

if (!tierMatch) {
  deny(
    'Agent dispatch blocked: no "TIER: Scout|Surgeon|Full" line found in the prompt. ' +
      "State the tier explicitly before dispatching (10/25/60 tool-call caps) -- " +
      "see .claude/reference/agent-budget.md's tier table and standing brief template. " +
      'Add a line like "TIER: Surgeon (25 tool calls max)" to the prompt and retry.'
  );
}

const tier = tierMatch[1].toLowerCase();

if ((tier === "scout" || tier === "surgeon") && !model) {
  const suggested = tier === "scout" ? "haiku" : "sonnet";
  deny(
    `Agent dispatch blocked: tier is ${tierMatch[1]} but no "model" field is set on the tool call. ` +
      `Per .claude/reference/agent-budget.md's tier table, ${tierMatch[1]} tier should run on ${suggested} ` +
      "(Full is the only tier allowed to inherit the parent model without stating one). " +
      `Pass model: "${suggested}" and retry.`
  );
}

process.exit(0);
