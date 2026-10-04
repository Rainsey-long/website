# Session log (newest first, read on demand)

One entry per working session, at most ~10 lines: what changed, the commit range, what is left open. This is the cross-session memory for "what happened last time"; the why of each change is in its commit message.

## 2026-10-04 (evening) — top three features from the brainstorm

- Date converter `/tools/date-converter` (Khmer and Chinese lunar, both reverse lookups) with a client-only age tool (`lib/age.ts`: a birth date never reaches the server); Khmer year tables cached per year with a ceiling on cache misses (security review).
- Colour of the day `/khmer/colours` plus a line on the Khmer day card; printable A4 month `/lucky-days/YYYY/MM/print`.
- UI review found `.theme-light` resetting the type tokens (fixed in tokens.css: type and size tokens live on `:root` only).
- Open: Khmer strings for these pages (docs/KHMER-REVIEW.md), next features #46 weekly horoscopes and #47 Telegram card.

## 2026-10-04 (later) — docs sync, memory, token budget, brainstorm round 2

- Committed memory in `.claude/memory/` (MEMORY.md auto-loaded, this log on demand) and a SessionStart hook (cloud only: installs deps, sets the git hooks path, prints status).
- `npm run docs:budget` (auto-loaded docs under 36 KB, a release:check gate); agent-budget.md cut from 17.7 KB to 2.4 KB.
- Every Markdown doc synced with the code (paths, bilingual rules, admin, tools).
- FEATURES.md §7: 13 new ideas scored; top picks are the date converter with a Khmer age tool, colour to wear, a printable calendar, weekly horoscopes, a Telegram card.
- Open: as before, plus the hook only runs once this branch is the default branch's content.

## 2026-10-04 — the site, end to end (one long session)

- Built the site as Astro, then ported to Next.js 16 + SQLite on Railway at the owner's request (CamboMath's shape and rules, agent docs, hooks, gates).
- Khmer traditions (calendar, holy days, festivals, Songkran + angel, birth weekday) with a visitor tradition switch; sky features (moon calendar, retrogrades, eclipses, .ics feeds, "sky behind this reading", feedback).
- Birth chart, good hours, lucky-date finder.
- Admin: overview, readings (EN/KM), profiles/forecasts overrides, Songkran, feedback + CSV, admins, backups.
- Whole site bilingual English/Khmer: /km URLs, Khmer content drafts, Khmer admin, Khmer .ics and share images (HarfBuzz).
- Reviews: two security passes (fixed gray-matter RCE, null-body 500s, 2100 almanac crash), two UI/UX passes (phone traditions menu, Khmer line height, calendar marks, tap targets).
- Open: owner brand/domain, Railway + Cloudflare setup, native Khmer review (docs/KHMER-REVIEW.md), next features (docs/research/FEATURES.md, 2026-10-04 brainstorm).
