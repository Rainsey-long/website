# Project structure — where a new file goes

```
app/                 Next.js App Router pages and api/ routes
  styles/tokens.css  THE ONLY place raw design values live
  globals.css        Tailwind theme mapping + component styles
  api/               feedback, health, admin/*, cron/backup
  admin/             owner dashboard (noindex)
components/          server components (presentational)
  client/            "use client" islands
  khmer/             Khmer tradition cards
lib/                 engines and server logic (no "use client" directives)
  i18n.ts, names.ts  defineMessages and display names (English only, docs/I18N.md)
  data/              generated/static data (lny.json, cities.json)
content/             reading blocks (JSON), profiles and forecasts (Markdown), almanac terms
migrations/          numbered .sql for changes addColumnIfMissing can't express
scripts/             gates and generators (not in the Docker image)
tests/               Vitest engine tests
data/                RUNTIME, git-ignored, the Railway volume: almanac.db, backups/
docs/                RAILWAY runbook, research, owner action lists
.claude/             agent docs, agents, hooks, reference, skills, memory/ (committed session memory)
```

| Kind of file | Location |
|---|---|
| A page | `app/**/page.tsx` with `generateMetadata` → `pageMetadata({ lang })`, `Breadcrumbs`, and `defineMessages` for its strings |
| An API route | `app/api/**/route.ts` — only HTTP handlers exported; helpers in `lib/` |
| Interactive component | `components/client/` |
| Calculation | `lib/<engine>.ts` + a test in `tests/` pinned to a published value |
| Reading text | `content/blocks/*.json` via `scripts/blocks-source.py`, or the admin |
| Long-form copy | `content/profiles/**`, `content/yearly/**` |
| Schema | `lib/db.ts` (additive) or `migrations/` |
| Anything written at runtime | under `data/` only — nothing else survives a deploy |
