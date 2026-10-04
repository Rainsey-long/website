> Copied from CamboMath (cambomath.com), where these numbers were measured. The rules apply here unchanged; the measurements are CamboMath's, not this repo's.

# The agent-run ledger — measuring the rule instead of remembering it

`.claude/reference/agent-budget.md` is the **doctrine**: the tiers, the model
table, the fitted cost line, the standing brief template. This file is the
**instrumentation** — what actually gets recorded when an agent is dispatched
here, where it is written, how to read it, and precisely what it cannot see.

Nothing auto-loads either file.

## Why this exists — the doctrine could not check itself

The budget doc's central finding is a least-squares fit over seventeen agents:

> **cost ≈ 143,900 tokens + 966 tokens per tool call**

so **78% of subagent spend in this repo is paid at dispatch**, before the agent
does anything, and the only lever that moves it is dispatching fewer agents.
That number is the most useful measurement in the whole doc set, and it had two
problems that had nothing to do with whether it was right:

- **Every data point was transcribed by hand out of one session's scrollback.**
  Re-measuring meant another manual pass, so in practice it would never be
  re-measured, and a fitted line nobody can re-fit slowly becomes folklore.
- **Nothing recorded whether the rule was being followed.** The discipline was
  enforced at dispatch time by `agent-tier-check.cjs` — which can see that a
  `TIER:` line exists and that a non-Full tier named a model — and then
  forgotten. Whether a session dispatched one agent or eight, whether the eight
  should have been two, whether Scout work kept going to the default model:
  none of it survived the session that did it.

That second gap is the one that already cost real tokens. `system-state.md`
records the failure the tier hook was written for: **2026-09-06, eight agents
in one session, every one tiered Full, none with a model override, ~1.45M
tokens.** The hook now stops the malformed *shape* of that dispatch. It cannot
stop the *count*, because "should these eight have been two?" is a judgement,
not a schema — and a judgement can only be improved by being able to look back
at it.

So: record every dispatch, report the fixed cost it committed to, and keep
measured numbers strictly apart from estimated ones so the line can be re-fit
on real data later.

## The pieces

| Piece | What it does |
|---|---|
| `.claude/hooks/agent-tier-check.cjs` | **Enforces.** PreToolUse on `Agent`; denies a dispatch with no `TIER:` line, or a Scout/Surgeon dispatch with no `model`. Unchanged by this work. |
| `.claude/hooks/agent-run-ledger.cjs` | **Observes.** PreToolUse *and* PostToolUse on `Agent`; appends one JSON line per event. Never denies anything, fails open in every branch. |
| `.claude/agent-runs.jsonl` | The ledger. One JSON object per line, append-only, **committed**. |
| `scripts/agent-report.mjs` (`npm run agents:report`) | Reads the ledger and reports per session: the dispatch list, the fixed cost that session paid, and what batching would have saved. |

Both hooks are wired in `.claude/settings.json` under the `Agent` matcher. The
enforcement hook runs first; if it denies, the dispatch never happens.

### Why the ledger is committed, unlike every other generated file here

Sessions run in ephemeral containers. An untracked ledger is deleted with the
container that wrote it, and the cross-session history — the only thing that
makes this more useful than scrolling up — never accumulates. It is small
(a few lines per session), append-only, and capped at 5,000 lines with the
oldest trimmed first, so it cannot grow without bound.

The conflict cost is real but trivial: two branches appending to the same file
conflict, and the resolution is always "keep both sides". That is a better
trade than losing the record.

## What each record holds

```jsonc
// PreToolUse — exact, all of it read straight out of the tool call
{"ts":"2026-09-09T…","event":"dispatch","session":"abc123",
 "agent":"ui-ux-designer","tier":"full","model":"inherit",
 "background":true,"desc":"Audit /learn","briefChars":2841}

// PostToolUse — best-effort, see the limits below
{"ts":"2026-09-09T…","event":"done","session":"abc123",
 "agent":"ui-ux-designer","tier":"full","measured":false,
 "tokens":null,"toolCalls":null,"replyChars":6142}
```

## What it cannot see — read this before trusting a number

A hook receives the tool call's own JSON and nothing else, which splits the
ledger cleanly in two.

**The dispatch side is exact.** Tier, model, agent type, background flag and
brief length are all in `tool_input`. Anything the report says about *how many*
agents ran, at what tier, on what model, is a measurement.

**The completion side is best-effort, and usually an estimate.** The shape of
`tool_response` belongs to the harness, not this repo, and it may carry no
usage at all. Rather than hardcode a field path that will rot, the hook walks
the response (depth-limited to 6) for any key that looks like a total token
count or a tool-call count. When it finds one the record is `measured: true`;
when it does not, `measured: false`, and the report falls back to the fitted
line and prefixes the figure with `~`.

**A `~` figure is not evidence.** It is the doctrine's own line evaluated at a
tool-call count, and where even that is unknown it uses the tier's cap — so it
is an upper bound on a Full-tier run and roughly right on a Scout. Never feed
`~` figures back into a re-fit; that fits the line to itself.

**A `done` record on a BACKGROUND agent is a launch acknowledgement, not a
completion.** Measured on this file's own first live dispatch: the `dispatch`
record was written at `00:48:38.377` and the `done` record at `00:48:38.503`,
126 milliseconds later, for an agent that then ran for minutes. Agents are
dispatched in the background by default, and PostToolUse fires when the tool
CALL returns — which for a background dispatch is the moment the agent is
launched, carrying a receipt rather than a result. So a background run is
structurally `measured: false` and always will be; only a foreground dispatch
(`run_in_background: false`) can return usage to the hook at all. This is the
single most important limitation of the automatic half, and it is why
`--record` below is not an optional extra: **for a background agent it is the
only way a real number ever enters the ledger.**

**Three things are invisible to the ledger entirely**, and they matter:

- **Work done in the main thread.** The cheapest possible outcome — noticing a
  task is a five-line edit and doing it inline — leaves no record at all. The
  ledger can show that a session dispatched three agents; it can never show the
  four it correctly did not dispatch.
- **Whether the tier was RIGHT.** `agent-tier-check.cjs` says the same thing
  about itself. A Scout task dispatched as Full is a well-formed dispatch.
- **A denied dispatch.** The tier hook denies before the ledger hook runs, so a
  malformed dispatch that was corrected and retried appears once, corrected.

## Recording a real number

The parent session IS shown an agent's token usage in the result it gets back,
even when the hook was not handed it. Transcribing that is what keeps the
sample honest enough to re-fit the line:

```bash
npm run agents:report -- --record '{"agent":"ui-ux-designer","tokens":193536,"toolCalls":46,"tier":"full","desc":"share dialog"}'
```

That appends a `done` record with `measured: true` and `hand: true`. Do it for
runs that are unusual in either direction — a very cheap agent that found the
work already done, or an expensive one that earned it. Seventeen more of those
and the line can be re-fitted on this repo's current doc set rather than the
2026-09-08 one.

## Reading the report

```bash
npm run agents:report            # every session
npm run agents:report -- --last  # this session only
npm run agents:report -- --session abc123
```

The line that matters in each block is not the per-agent list, it is:

```
  fixed cost paid: 431,700 tokens (3 × 143,900)
  batching:        3 → 1 agent would save 287,800 tokens of pure overhead
```

Those two lines are the whole point. The per-agent costs are mostly the fitted
line reflected back; the dispatch **count** is the measurement, and it is the
78%.

Two warnings can appear under a session, both drawn from the doctrine:

- `⚠ n dispatch(es) with no TIER line` — should be impossible while
  `agent-tier-check.cjs` is wired. If it appears, the hook is not running.
- `⚠ n non-Full dispatch(es) inheriting the parent model` — Scout and Surgeon
  work should be on `haiku` and `sonnet`. Same caveat: the tier hook should
  have caught it, so this is a hook-health signal as much as a discipline one.

**It is deliberately not a gate.** It exits 0 whatever it finds. A build that
failed because a session dispatched four agents would be enforcing a threshold
nobody agreed to, on a decision that is genuinely contextual — and this repo
already has eight gates that fail for reasons that are not contextual at all.

## The rule this instrumentation serves

Unchanged, and stated in `role.md`. The ledger does not add a rule, it makes
the existing one auditable:

1. **Do it inline** if the main thread could finish it in under ~10 tool calls.
2. **Check the premise** before delegating it — two of the seventeen measured
   agents were sent to build things that already existed.
3. **Batch by file ownership**, not by task. Three tasks in three disjoint
   files are ONE agent with three numbered jobs.
4. **Resume, don't re-dispatch** — `SendMessage` reuses a context already paid
   for; a fresh `Agent` call pays the ~144,000 again.
5. **Never starve a verification pass to save tokens.** Cut the number of
   agents, not what each one proves.

And the second lever, which no ledger can measure but which compounds across
every agent and every session: **the auto-loaded set is ~55,700 tokens and is
re-sent every turn.** Taking it to 25,000 saves ~30,700 per agent. That is the
one saving that does not require anybody to make a good decision at dispatch
time.


## Auto-commit (2026-09-20)

The ledger hook now commits `.claude/agent-runs.jsonl` itself after an append: `git commit --only` on that one path (anything else staged stays staged), never a push, at most once per 5 minutes, skipped during a merge, rebase, cherry-pick or bisect or while `index.lock` exists, and silent on any failure. The last few lines of a burst are committed by the next event. `scripts/release-check.mjs` ignores the ledger in its "tracked files clean" gate for the same reason. The commit lands on whatever branch the working folder is on, which is fine because it is local only; a push is still a separate act.
