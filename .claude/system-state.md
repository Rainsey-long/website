# System state — living snapshot

**Last refreshed 2026-10-04.** Re-check before trusting; update in the same commit as the change.

## Current shape

- Branch `claude/zodiac-site` of `Rainsey-long/website` (orphan; `master` is an unrelated 2018 Flutter docs fork). Not deployed yet.
- Next.js 16 on the CamboMath production shape (Docker, Railway volume, one replica). Ported from an earlier Astro static build on 2026-10-04 at the owner's request.
- Content: 196 reading blocks (all `draft`), 12 Western + 12 Chinese profiles, 12 Fire Goat 2027 forecasts, 156 compatibility pairs (templated), 7 Khmer birth-weekday portraits. All original, all awaiting owner review.
- Khmer traditions: lunar calendar, holy days, festivals, Moha Songkran + angel (2020–2026 match km.wikipedia's table), birth weekday, tradition switch.
- Sky: moon calendar, ingresses, retrogrades with shadows, eclipses (2026 matches published tables), .ics feeds.
- Tools: birth chart, good hours, lucky-date finder. Admin: overview, readings, profiles/forecasts, Khmer New Year, feedback, admins, backups.
- Memory: committed in `.claude/memory/` (MEMORY.md auto-loaded, sessions.md on demand); the SessionStart hook installs deps and prints status in cloud sessions.

## Baselines

| Gate | Value |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run lint` | **0** problems |
| `npm test` | 62 passing |
| `npm run check:contrast` | all pairs AA |
| `npm run check:tokens` | 0 violations |
| `npm run db:preflight` | CLEAN |
| `npm run docs:budget` | auto-loaded docs under 36 KB |

## Open items

- Owner: brand name and domain; review of all text; native-speaker review of Khmer text (`docs/KHMER-REVIEW.md`); Railway + Cloudflare setup (`docs/OWNER-ACTIONS.md`).
- Khmer calendar validated against the cases in tests and the research table; validation against Roath Kim Soeun's tables for 200+ dates (research §1.3) not yet done.
- English and Khmer (2026-10-04): every page has a `/km` twin (`docs/I18N.md`). All Khmer text is a draft awaiting a native reader (`docs/KHMER-REVIEW.md`). Everything is bilingual, including the admin (`/km/admin`), the .ics feeds (`?lang=km`) and share images (`/og/<slug>?lang=km`, HarfBuzz-shaped).
- Reading block library is 196 of the ~360 the plan targets.
- Built 2026-10-04 (second pass): birth chart (`/tools/birth-chart`), good hours (`/good-hours`), lucky-date finder (`/lucky-days/finder`). Their wording (`lib/natalCopy.ts`, `PLANET_HOUR` in `lib/goodHours.ts`) is draft.
- Not built from the research shortlist yet: personal transit readings, BaZi four pillars, personal year forecast, family profiles, email digest (see docs/research/FEATURES.md).
