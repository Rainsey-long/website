# Context

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 (tokens in `app/styles/tokens.css`, mapped in `app/globals.css` with every default namespace reset) · better-sqlite3, one file `data/almanac.db` · astronomy-engine (MIT) · lunar-javascript (MIT, server only) · @thyrith/momentkh (MIT, Khmer calendar) · fonts self-hosted via @fontsource (Newsreader, Figtree, Noto Serif Khmer, Kantumruy Pro). Docker on Railway, volume at `/app/data`, one replica.

## Commands

```bash
npm run dev            # :3000
npm test               # Vitest: the engines (astronomy, calendars, scoring, variety)
npm run lint           # eslint, baseline 0
npm run check          # contrast + design-token guard + tests
npm run build          # validates text blocks, then next build
npm run db:preflight   # what the seed would do to a database (run before deploying)
npm run release:check  # all gates, GO / NO-GO (add -- --build before a deploy)
```

## The engines (all deterministic, all in `lib/`, all tested)

| Engine | Files | What it does |
|---|---|---|
| Western | `western.ts`, `sky.ts`, `calculator.ts` | Sun/Moon/rising from astronomy-engine; tropical zodiac |
| Readings | `reading-engine.ts`, `content/blocks/*.json`, `blockText.ts` | Solar-sign house from the Moon → text blocks; owner-edited text from the DB |
| Chinese | `chinese.ts`, `almanac.ts`, `data/lny.json` | Animal at Lunar New Year, BaZi year at Lichun, tong shu day |
| Khmer | `khmer.ts`, `sea-variants.ts`, `khmerWeekdayCopy.ts`, `songkranStore.ts` | Chhankitek lunar date, sila days, festivals, Moha Songkran + angel, birth weekday |
| Sky events | `skyEvents.ts`, `ics.ts` | Exact phases, Moon ingresses, stations + shadows, eclipses, .ics feeds |
| Compatibility | `compatibility.ts`, `compat-copy.ts` | Rule tables → scores and varied copy (same random choices in both languages) |
| Personal tools | `natal.ts` + `natalCopy.ts` (browser), `goodHours.ts`, `luckyFinder.ts` | Birth chart, Chinese + planetary hours, lucky-date finder |
| Languages | `i18n.ts`, `names.ts`, `langServer.ts`, `khmerShape.ts` | `/km` routing helpers, bilingual strings and names, Khmer shaping for images |

### Engine invariants

1. **Pure and deterministic.** No `Math.random()`/`Date.now()` inside an engine; randomness comes from `lib/random.ts` seeded by a stable key. "Now" enters through `lib/clock.ts` or `lib/today.ts` only.
2. **The 30-day variety guarantee.** Each topic has exactly 3 base blocks per house (`validate:blocks` enforces it) and the rotation in `reading-engine.ts` relies on it. Changing the count means changing the rotation and its test.
3. **Text never decides selection.** Owner edits change words, not which block is chosen.
4. **Time zones are explicit.** Khmer moments are UTC+7; Chinese lunar dates come from lunar-javascript's China-time calendar; pages format instants in the visitor's zone (`lib/today.ts`, `lib/format.ts`). momentkh is always called with explicit y/m/d/h numbers, never a `Date`.
5. **Verified against published tables.** Any engine change keeps the tests that pin Songkran 2020–2026, Visak Bochea, Pchum Ben, 2026 retrogrades and eclipses. Add a pinned case for anything new.
6. **Never compute what tradition leaves to people** (see CLAUDE.md owner rules).

## Conventions

- Pages are server components; interactivity lives in `components/client/*` ("use client"). `lib/*` modules carry no directive.
- Every page exports metadata via `lib/seo.ts` `pageMetadata()` and renders `Breadcrumbs` (which emits BreadcrumbList JSON-LD).
- The tradition preference is read on the server (`lib/traditionsServer.ts`); a page must render sensibly for any non-empty combination.
- Server-shared state (DB connection, caches, seed flag) lives on `globalThis`: Next bundles routes separately, and a module-level variable is a different copy per route (measured: an admin edit never reached the pages until this was fixed).
- **Bilingual (English/Khmer)**: no hard-coded visible English. Strings via `defineMessages`, language via `getLang()`/`useLang()`, links via `LocaleLink`, metadata via `pageMetadata({ lang })`. Full rules: `docs/I18N.md`.
- Khmer script inside English text: wrap in `lang="km"`; numerals via `num()`/`khmerDigits()` on Khmer pages.

## Where to look next

| Touching… | Read |
|---|---|
| any UI | `DESIGN_SYSTEM.md`, the `almanac-design` skill |
| `lib/db.ts`, `lib/seed.ts`, backups | `.claude/database.md` |
| admin, APIs, cookies, anything taking input | `.claude/security.md` |
| deploying, the domain | `.claude/environment.md`, `docs/RAILWAY.md` |
| Khmer features | `docs/research/KHMER-TRADITIONS.md` |
| a new feature idea | `docs/research/FEATURES.md` (already scored) |
