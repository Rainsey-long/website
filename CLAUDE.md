@AGENTS.md
@.claude/context.md
@.claude/database.md
@.claude/security.md
@.claude/project-structure.md
@.claude/tech-stack.md
@.claude/system-state.md
@.claude/testing.md
@.claude/environment.md
@.claude/error-handling.md
@.claude/role.md
@.claude/memory/MEMORY.md

# Almanac — daily horoscopes, Chinese zodiac, Khmer traditions

A calm, minimalist horoscope and almanac site. Western astrology, the Chinese zodiac and almanac, and Khmer traditional calendar and fortune, **side by side, with the visitor choosing which traditions they see**. International English audience first, Cambodia and Southeast Asia second. Brand name and domain are placeholders (`lib/site.ts`) until the owner decides.

Built on the same stack and production shape as the owner's other site, CamboMath (cambomath.com): Next.js 16, better-sqlite3 on a Railway volume, one replica, Cloudflare DNS. Its practices were ported deliberately; where this repo says "CamboMath pattern", the reasoning lives in that repo.

## Owner rules

- **`DESIGN_SYSTEM.md` is binding for every UI change.** If a change needs something it does not cover, add it there first with a changelog row, then build.
- **`BUILD_PLAN.md`** is the original product plan. Where this repo departs from it (Next.js on Railway instead of static Astro on Cloudflare Pages), the owner asked for it; DECISIONS.md records each departure.
- **No runtime AI and no paid APIs.** Readings are deterministic: real astronomy plus pre-written text blocks.
- **Entertainment framing.** No health, legal or financial advice, no fear, no doom, no certainty. No dark patterns.
- **Visitors never sign in, and their birth details never leave their browser.**
- **English only** (2026-10-05): no Khmer language version; Khmer traditions are written in English with Khmer terms inline.
- **Khmer traditions**: compute only what tradition fixes by rule (research: `docs/research/KHMER-TRADITIONS.md`). Never build wedding/house "good day" picking, illness/war/accident omens, or anything that sells a ritual.

## How this doc set is organised

**Auto-loaded** (the `@` imports above; every session and subagent pays for them):

| File | Holds |
|---|---|
| `context.md` | Stack, commands, the engines (reading, Khmer, sky, almanac), engine invariants, conventions, where to look next |
| `database.md` | Tables, the additive-only rule, seeding, backups, the one-writer rule |
| `security.md` | The one identity (admin), visitor privacy, request rules |
| `project-structure.md` | Where a new file goes |
| `tech-stack.md` | Versions and constraints |
| `system-state.md` | **Check first**: current state, open items, baselines |
| `testing.md` | Definition of done |
| `environment.md` | Env vars, Railway + Cloudflare shape |
| `error-handling.md` | Failure modes |
| `role.md` | Working restrictions, commit/deploy rules, agent budget |
| `memory/MEMORY.md` | Lessons that cost time (committed memory; `sessions.md` beside it is the session log) |

**On demand:**

| File | Open it when |
|---|---|
| `DESIGN_SYSTEM.md` | Any UI work (binding) |
| `docs/RAILWAY.md` | Deploying, the domain, backups, production |
| `docs/research/KHMER-TRADITIONS.md` | Anything Khmer: algorithms, tables, sources, what not to build |
| `docs/research/FEATURES.md` | Choosing the next feature: competitor research and the scored brainstorm |
| `CONTENT_GUIDELINES.md` | Writing or editing any reading text |
| `DECISIONS.md` · `CREDITS.md` | Why a convention was chosen · licences |
| `docs/OWNER-ACTIONS.md` · `docs/KHMER-REVIEW.md` | What waits on the owner · Khmer tradition terms needing a native read |
| `.claude/reference/agent-budget.md` · `agent-runs.md` | Before dispatching a subagent · what agents have cost (`npm run agents:report`) |
| `.claude/reference/routes.md` | What each route does |
| `.claude/reference/memory.md` · `.claude/memory/sessions.md` | How memory works here · what each past session did |
| `docs/I18N.md` | English only: why, the redirects, and how to show a Khmer tradition term inline |
