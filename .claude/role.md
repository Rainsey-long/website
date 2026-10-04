# Role — how an agent works in this repo

Ported from CamboMath's `role.md`; every rule here has a measured incident behind it there.

## Writing

Chat replies may be terse. **File content never is**: code comments, commit messages and every doc are full, plain English.

## Definition of done

`.claude/testing.md`. Short version: tsc clean, lint 0, `npm run check` green, build passes, looked at in a browser if visible, a pinned test if an engine changed. A passing build alone is not done.

## Mandatory specialist agents

- **`ui-ux-designer`** for any new component, page or visible change (layout, typography, colour, motion).
- **`security-auditor`** for auth, input handling, cookies, a new API route, or anything crossing a trust boundary.

Same standing as the build; in addition to, not instead of, your own verification. Never downgrade their model to save tokens.

## Subagent budget — tier every dispatch

Every `Agent` brief names a TIER (the `agent-tier-check` hook denies one that doesn't): **Scout** 10 tool calls (read only, `haiku`), **Surgeon** 25 (1–2 named files, `sonnet`), **Full** 60 (browser proof). A subagent costs ~144,000 tokens before it does anything (CamboMath measurement), so first ask whether to dispatch at all: do it inline under ~10 calls; check the premise with one grep; batch by file ownership; resume with `SendMessage` rather than re-dispatching. At the cap an agent stops and reports; it never skips verification. Detail: `.claude/reference/agent-budget.md`; spend so far: `npm run agents:report`.

**Subagents in the shared tree report their diff and do not commit**; the parent commits. Only an agent in its own worktree commits its own work.

## Research and new features

Order: (1) `docs/research/FEATURES.md` and `docs/research/KHMER-TRADITIONS.md` (already researched and scored; don't redo it), (2) `DECISIONS.md` and `system-state.md`, (3) only then the internet. Label findings PRIMARY (read the source) or SUMMARY (search snippet). Write findings back as a new dated section; never rewrite an old one.

## Finishing a task: commit, then push the working branch

One commit per task, after the definition of done. Stage explicit paths (never `git add -A` while an agent works in the tree). Never commit `.env*`, `data/` or scratch files. Never force-push.

**Always push to a named branch**: `git branch --show-current` first, then `git push -u origin HEAD:<working-branch>`. Never `git push origin HEAD`.

## Deploying is a separate, explicitly commanded act

`main` → Railway `develop`; `release/1.0.0` → **production**. Pushing `release/*` IS a production deploy: only when the owner says "deploy", in words, for that change, after `npm run release:check -- --build` prints GO. Mechanically enforced by `.githooks/pre-push` (`npm run hooks:install` once per clone): `ALLOW_PROD_DEPLOY=1 git push origin HEAD:release/1.0.0`. Never merge into a release branch to "keep it up to date".

## Restrictions

- No raw `ALTER TABLE` or one-off script against a real database (`.claude/database.md`).
- No new test framework without asking.
- No runtime AI, no paid APIs, no visitor accounts, no storing birth data (owner rules in `CLAUDE.md`).
- Khmer: never build what research §9 says not to (good-day picking, illness/war omens, paid rituals).
- `DESIGN_SYSTEM.md` wins over taste. Change it first, with a changelog row, if it must change.
- Anything destructive or hard to reverse needs the owner's confirmation.
