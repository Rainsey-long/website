> Copied from CamboMath (cambomath.com), where these numbers were measured. The rules apply here unchanged; the measurements are CamboMath's, not this repo's.

# Agent budget — how much a subagent may spend, and on what

Owner request, 2026-09-05: cap subagent tool use and stop burning tokens.
`.claude/role.md` carries the rule; this file carries the measurements and the
reasoning, and nothing auto-loads it.

## What a subagent actually costs here — measured, not estimated

Six agents completed in one session on 2026-09-05, all `ui-ux-designer`, all on
this repo:

| Task | Tokens | Tool calls | Wall time |
|---|---|---|---|
| Share panel rewrite | 240,472 | 67 | 12.5 min |
| Trend metrics + picker into header | 268,984 | 70 | 11 min |
| Effort matrix redesign | 256,321 | 41 | 11.5 min |
| Confetti geometry + share strip | 262,326 | 80 | 18 min |
| Chevron sweep + /learn autoscroll | 247,420 | 64 | 12 min |
| Ring label + header + title block | 294,976 | 95 | 24 min |

**~1.57 million tokens for six tasks**, and a seventh agent died on a session
rate limit having done nothing. That rate limit is the real cost: it took the
whole session's agent capacity down for two hours and forced three tasks back
into the main thread.

Two things that table says, and they pull in opposite directions:

- **Tool calls do not predict cost.** The 41-call agent spent nearly as much as
  the 70-call one. What costs tokens is CONTEXT — every file read, every
  screenshot, every re-read of a file the agent already had. A single
  full-resolution screenshot is worth more than a dozen `grep`s.
- **The expensive agents were the ones that found real defects.** The 95-call
  run is the one that measured the header bar growing 72px → 128px mid-question,
  and the 80-call run is the one that proved the confetti was 65% above the
  card. Neither finding was reachable without repeated measurement in a browser.

So the goal is not "fewer tool calls". It is **fewer tokens per unit of proof**.

## Re-measured 2026-09-08: seventeen agents, and the cost is 78% fixed

A second, much larger sample — seventeen completed agents in one session,
across research, UI work, security audit, generators and docs:

| Task | Tokens | Tool calls |
|---|---|---|
| Facebook clipboard (sonnet) — found the work already done | 141,338 | 7 |
| Security audit of one commit | 165,561 | 9 |
| Name cap 25 → 20 (sonnet) | 141,512 | 15 |
| Railway two-environment docs (sonnet) | 164,147 | 20 |
| App-icon diagnosis + art prompts | 160,654 | 24 |
| Site-wide performance audit (read-only) | 177,632 | 29 |
| Length-bar item ranges | 175,312 | 29 |
| Equal-height dashboard cards | 165,245 | 31 |
| Worksheet peek zoom | 187,677 | 39 |
| Share-dialog redesign | 193,536 | 46 |
| Avatar traits all free | 190,274 | 48 |
| Weekly summary: hero + filter | 196,611 | 49 |
| Safe performance fixes | 209,983 | 51 |
| Admin stats column widths | 221,818 | 64 |
| Sign-in provider toggle | 191,618 | 69 |
| Avatar auto-buy + option sweep | 207,157 | 74 |
| Trend range picker swap | 226,750 | 90 |

**3,116,825 tokens for 694 tool calls across 17 agents. Mean 183,343.**

Least squares over those seventeen points:

> **cost ≈ 143,900 tokens + 966 tokens per tool call**

That single line is the finding, and it inverts the intuition the tiers were
built on. **A subagent costs about 144,000 tokens before it does anything at
all**, and roughly 1,000 tokens for each thing it then does. The cheapest run
in the table — seven tool calls, which correctly concluded the feature was
already built and changed no files — cost 141,338, i.e. **102% of the fitted
fixed cost and essentially none of it work**. Across the session, the fixed
cost was paid seventeen times: **2,446,000 tokens, 78% of everything the agents
spent.**

The 2026-09-05 section above says "tool calls do not predict cost". This sample
says something sharper: tool calls barely *matter*. Going from a 7-call agent
to a 90-call agent costs about 85,000 extra tokens — less than the fixed cost of
dispatching one more agent. **Capping tool calls was optimising the 22%.**

### What the fixed cost is made of

Measured by `wc -c / 4` over the auto-loaded set on 2026-09-08:

| File | ~tokens |
|---|---|
| `.claude/system-state.md` | 13,012 |
| `.claude/security.md` | 9,123 |
| `.claude/database.md` | 6,060 |
| `.claude/environment.md` | 5,192 |
| `CLAUDE.md` | 4,837 |
| `.claude/role.md` | 4,510 |
| `.claude/context.md` | 4,400 |
| `.claude/testing.md` | 3,295 |
| `.claude/tech-stack.md` | 1,932 |
| `.claude/project-structure.md` | 1,727 |
| `.claude/error-handling.md` | 1,437 |
| `AGENTS.md` | 169 |
| **total** | **~55,700** |

That is the memory every agent loads before reading a line of code, and it is
re-sent on every turn, which is why it dominates rather than merely appearing
once. The rest of the fixed cost is the tool schemas, the system prompt and the
brief.

**So the two levers are, in order:**

1. **Dispatch fewer agents.** Each one avoided saves ~144,000 tokens. The same
   seventeen tasks batched into six agents would have saved roughly **1.58
   million tokens, 51% of the session's agent spend**, with no work skipped.
2. **Shrink the auto-loaded set.** Taking 55,700 down to 25,000 saves ~30,700
   per agent — about **522,000** across a seventeen-agent session, and it
   compounds with every future one.

Nothing else is close. Model choice matters for the price of those tokens but
not their count; screenshots and file reads are real but they live in the 22%.

### The rules this produces

- **Never dispatch an agent for work the main thread could finish in under
  ~10 tool calls.** The name-cap change was five one-line edits and cost
  141,512 tokens as an agent; inline it would have been a few thousand. The
  Facebook-clipboard dispatch cost 141,338 tokens to discover a `grep` would
  have answered it in one call.
- **Check the claim before you delegate it.** Two of the seventeen were
  dispatched to do work that was already done. One `grep` in the main thread
  is the whole check.
- **Batch by file ownership, not by task.** Agents must not share files, but
  three tasks in three disjoint files can be ONE agent with three numbered
  jobs and one shared preamble. Three agents there is ~288,000 tokens of pure
  overhead bought for nothing.
- **Prefer resuming an agent** (`SendMessage`) to dispatching a fresh one: its
  context is already loaded, so a follow-up costs the marginal rate, not the
  fixed one.
- **A tool-call cap is a safety rail, not a savings plan.** Keep the tiers to
  stop a runaway, but do not starve a verification pass to save tokens — the
  saving is ~1,000 a call, and an unverified change costs more than that to
  find later.

### First independent validation of the line: 3.5% error

2026-09-09, one `ui-ux-designer` agent, Full tier, auditing three screens
(`docs/RESEARCH.md` §63): **184,945 tokens over 36 tool calls**. The line above
predicts 143,900 + 966x36 = **178,676**, so it was **3.5% low** on a run that
was not part of the sample it was fitted to. That is a good deal more accurate
than a two-sample fit has any right to be, and it means the "~" figures in
`npm run agents:report` are worth reading as rough truth rather than as
arithmetic.

Two things about that run are worth copying rather than the number:

- **`npm run ui:check` was run in the MAIN THREAD first** and its results put
  in the brief, which removed four whole defect classes (overflow, touch
  target, HTML text size, containment) from the agent's search space before it
  started. A gate's output in a brief is the cheapest context there is.
- **Three surfaces went to ONE agent**, because they are disjoint files. Three
  agents there would have bought ~288,000 tokens of duplicated fixed cost and
  nothing else.

### The fit is now re-measurable, which it was not when it was made

Every number in both tables above was transcribed by hand out of one session's
scrollback. As of 2026-09-09 dispatches are recorded automatically:
`.claude/hooks/agent-run-ledger.cjs` → `.claude/agent-runs.jsonl` →
**`npm run agents:report`**. The dispatch side is exact (count, tier, model,
agent type — which is the 78%); the completion side is best-effort and a
background agent's is only a launch receipt, so real token counts still have to
be transcribed with `--record`. **Full detail on what that ledger can and cannot
see is `.claude/reference/agent-runs.md` — read it before quoting a number out
of the report**, because a `~` figure in that output is this section's own
fitted line reflected back, not evidence.

## The tiers

The parent names the tier in the brief. An agent that is given no tier is a
SCOUT.

| Tier | Cap | For |
|---|---|---|
| **Scout** | **10 tool calls, no browser, no edits** | "Where is X?", "does Y exist?", "which files do Z?" Answers a question. Returns a file:line list and a conclusion. |
| **Surgeon** | **25** | A bounded change in 1–2 known files, verified by `tsc` + `lint` only. No browser pass. |
| **Full** | **60** | A change that must be proven in a browser, at more than one width or language. The only tier allowed screenshots. |

**10 is the default and the cap for anything that is not implementing a
verified change.** Most work dispatched to an agent in this repo is genuinely a
Scout task wearing a bigger costume.

### The Full tier exists because this repo's definition of done requires it

`testing.md` requires a browser check for any UI change and `role.md` makes the
`ui-ux-designer` pass mandatory for one. A browser verification cannot be done
in ten calls: navigate, resize, screenshot, measure, and that is four before a
single file has been read. **Capping a UI implementation task at 10 does not
make it cheaper, it makes it unverified** — and an unverified UI change in this
repo is the exact failure `role.md` warns about, code that compiles and lints
and is confidently wrong.

So the cap is real, and the honest way to hold it is to send fewer Full-tier
agents, not to starve them.

## Pick the MODEL as well as the tier — it is the bigger lever

`Agent` takes a `model` parameter, and a Scout does not need the same model as a
surgeon. Searching, listing, "where is X", "which files do Y", reading a
directory and reporting back — none of that is reasoning-limited, and running it
on the default model is the most expensive way to do the cheapest kind of work.

| Tier | Model |
|---|---|
| **Scout** | `haiku` — lookups, inventories, "does this exist" |
| **Surgeon** | `sonnet` unless the change turns on a subtle invariant |
| **Full** | default (inherits the parent) — measurement, design judgement, anything where being confidently wrong is expensive |

The exception that matters: **do not downgrade a task whose whole value is
catching something plausible-but-wrong.** `role.md` records why the mandatory
`ui-ux-designer`/`security-auditor` passes exist — AI-written code fails by
looking right — and a cheaper model reviewing for that is a false negative
generator. Cheap models for FINDING things, capable models for JUDGING them.

## The floor cost is the context, not the work

Measured 2026-09-05, and this is the number that should change how often you
dispatch at all: `CLAUDE.md` plus its `@` imports is **~50,000 tokens** (it was
~71,000 before the fourth slimming pass), and **every subagent pays it before
its first tool call.**

The proof is in the table above: the cheapest agent that day used **12 tool
calls** and still cost **188,000 tokens**. Ten completed agents cost ~2.49M, of
which roughly **710k — 28% — was auto-loaded preamble**.

Two consequences:

- **Below a few tool calls of real work, delegating always loses.** Not usually,
  always: the preamble alone exceeds what the task would cost inline.
- **One agent doing three related things beats three agents doing one each** by
  two whole preambles. Batch by FILE OWNERSHIP — two agents must never hold the
  same file — not by how many requests the owner listed.

Anything added to `CLAUDE.md`'s `@` imports is multiplied by every agent and
every session. That is the reasoning behind `role.md`'s rule against adding one
casually, and it is why `.claude/reference/` exists.

## When the cap is reached, STOP — do not silently degrade

An agent that hits its cap **reports what it has and stops**. It does not skip
the browser check, drop the lint run, or guess at the last measurement. A
truncated report that says "I ran out at 25 calls, the edit is applied and
unverified" is useful. A report that quietly omits verification is worse than no
agent at all, because the parent will commit it.

The parent then decides: raise the tier and resume the SAME agent
(`SendMessage` keeps its context, so resuming is far cheaper than a fresh
dispatch), or finish it in the main thread.

## How to actually spend less, in order of effect

1. **Do not dispatch at all for a small task.** An agent costs a full context
   load plus its own re-reading of files the main thread already has. Below
   roughly a few tool calls of real work, delegating spends more than it saves
   (`~/.claude/CLAUDE.md`).
2. **Name the files.** Every path in the brief is a search the agent does not
   run. The briefs in this session that named exact files and line numbers
   produced the cheapest runs.
3. **State what is already known.** Measurements, constraints, prior findings —
   an agent that has to rediscover the 45% sticky-header rule pays for it twice.
4. **Name what NOT to do.** "Do not audit anything outside this scope" is worth
   more than any other sentence in a brief.
5. **One agent, three related things** beats three agents doing one each — the
   shared context is loaded once. The five-request batches in this session were
   correctly split by FILE OWNERSHIP, not by request count.
6. **Screenshots are expensive.** `scale: 0.5–0.7` for a look-and-see;
   full-scale only when the thing being judged is a pixel measurement. Prefer
   `read_page` or a `javascript_tool` measurement over a screenshot when the
   question is "what is the number", not "how does it look".
7. **Never let an agent spawn its own agents.** Say so in the brief; it is in
   the standing template below.

## The second lever: this repo's files are enormous, so NEVER read one whole

Measured 2026-09-05. These are the cost of ONE `Read` with no offset:

| File | Lines | Tokens |
|---|---|---|
| `lib/seed.ts` | 9,373 | **~168,000** |
| `components/admin/WorksheetManager.tsx` | 2,849 | ~36,000 |
| `components/PracticeSession.tsx` | 2,151 | ~29,000 |
| `components/LearnMap.tsx` | 1,941 | ~27,700 |
| `components/WorksheetLibrary.tsx` | 2,118 | ~26,000 |
| `components/admin/AdminDashboard.tsx` | 1,945 | ~26,000 |
| `components/figures/Figure.tsx` | 1,619 | ~17,000 |

Twelve components are over 1,000 lines. An agent handed "your file is
`PracticeSession.tsx`" spends 29,000 tokens before it has done anything, and
if it re-reads after editing — which is the habit — it spends 58,000. Add the
~50,000-token preamble and it is at 108,000 before a single thought. **That is
the whole explanation for the 12-tool-call agent that still cost 188,000.**

So, in order of how much they save:

- **Locate with `grep -n`, then read a RANGE.** `Read` takes `offset` and
  `limit`. A 200-line window around the thing you are changing is ~3,000
  tokens against 29,000 for the file. The file's header comment is usually
  worth reading too — in this repo it carries the decisions — but that is
  another 100 lines, not 2,000.
- **Never re-read a file you just edited.** `Edit` fails loudly if its
  `old_string` did not match, and the harness tracks file state, so a
  confirming read proves nothing and costs full price. Re-read only when
  something else changed the file.
- **Never read `lib/seed.ts`.** At ~168,000 tokens it exceeds most of what an
  agent has to spend. Query the database instead — `npm run curriculum:find`
  answers "does this exist / what params are in play / what does grade N teach"
  in about 100 tokens. `context.md` already says this about the index files;
  it goes double for the seed itself.
- **Prefer a command's output to a file's contents.** `npm run ui:check`
  returns four numbers where a screenshot returns an image and a hand-rolled
  harness returns fifteen tool calls of boilerplate.

A brief that names the file AND the line range is the single cheapest thing the
dispatcher can do. Every line number supplied is a search the agent does not
run and a window it does not have to widen.

## The standing brief template

Every dispatch carries these, and the ones that matter most are the negative
constraints:

```
TIER: scout | surgeon | full   (cap: 10 | 25 | 60 tool calls)
When you reach the cap, STOP and report what you have. Do not skip verification
to stay under it — say it is unverified instead.

FILES: <exact paths>. Touch nothing else.
FENCED: <paths another agent holds>. Describe the edit, do not make it.
KNOWN: <measurements, constraints, prior findings>
DO NOT: audit or refactor outside this scope. Do not spawn subagents. Do not
commit or `git add -A` — report the diff, the parent commits.
REPORT: findings, not narrative. Numbers, not adjectives.
```

## The concurrency rule this sits on top of

Subagents share one working tree unless given a worktree, so **the parent
commits**, and every dispatch must name the files another agent holds. Two
writers on one file lose edits — that is `~/.claude/CLAUDE.md`'s rule and this
session hit it twice, both times caught by fencing rather than by luck.
