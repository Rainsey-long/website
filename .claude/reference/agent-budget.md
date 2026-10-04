# Agent budget — when to dispatch, and how much it costs

`.claude/role.md` carries the rule (TIER line, caps, model); this file is the evidence. Nothing auto-loads it. The full CamboMath measurement history lives in that repo; this is the short version plus this repo's own numbers.

## What a subagent costs

**Fixed cost first.** CamboMath fitted 17 completed agents: **≈ 144,000 tokens at dispatch + ≈ 1,000 per tool call** — 78% of all agent spend was the fixed part (the auto-loaded docs, re-sent every turn, plus the brief). Tool calls barely predict cost; context does (every file read, every screenshot).

**Measured in this repo (2026-10-04)**, from completion notices:

| Agent | Tokens | Tool calls |
|---|---|---|
| Security audit, full site | 228,000 | 18 |
| UI/UX review, 12 pages, both themes | 245,000 | 40 |
| Translate the Western/home/tools page group | 393,000 | 44 |
| Translate the Chinese/Khmer/sky page group | 374,000 | 46 |
| Translate blocks + 12 profiles | 320,000 | 22 |
| Translate 24 profiles/forecasts | 384,000 | 44 |
| Translate the admin | 278,000 | 26 |
| Security follow-up (scoped, resumed) | 245,000 | 13 |

Same shape as CamboMath: ~200k is paid before useful work; resuming a finished agent with `SendMessage` (its context already loaded) was the cheapest way to get a second pass.

## Rules that save the most

1. **Do it inline if the main thread could finish in under ~10 tool calls.** A small change dispatched costs ~150k; inline it costs a few thousand.
2. **Check the premise with one grep** before sending an agent to build something; it may exist.
3. **Batch by file ownership, not by task.** Three tasks in three disjoint files are one agent with three jobs. Parallel agents must never share files.
4. **Resume, don't re-dispatch** (`SendMessage`).
5. **Never starve verification.** A browser check is ~1,000 tokens a call; an unverified change that ships costs more. Cut the number of agents, not what each proves.
6. **Cheap models for finding, capable models for judging.** Scout → `haiku`, Surgeon → `sonnet`, Full → default. Never downgrade a mandatory `ui-ux-designer` or `security-auditor`.
7. **Tell agents what is already known** (paths, the server already running, accepted exceptions) so they do not spend calls rediscovering it.

Spend so far: `npm run agents:report` (ledger written by `.claude/hooks/agent-run-ledger.cjs`, explained in `agent-runs.md`).
