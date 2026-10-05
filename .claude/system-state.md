# System state — living snapshot

**Last refreshed 2026-10-04.** Re-check before trusting; update in the same commit as the change.

## Current shape

- Branch `claude/zodiac-site` of `Rainsey-long/website` (orphan; `master` is an unrelated 2018 Flutter docs fork). Not deployed yet.
- Next.js 16 on the CamboMath production shape (Docker, Railway volume, one replica). Ported from an earlier Astro static build on 2026-10-04 at the owner's request.
- Content: 196 daily reading blocks and 48 weekly overviews (all `draft`), 12 Western + 12 Chinese profiles, 12 Fire Goat 2027 forecasts, 156 compatibility pairs (templated), 7 Khmer birth-weekday portraits. All original, all awaiting owner review.
- Khmer traditions: lunar calendar, holy days, festivals, Moha Songkran + angel (2020–2026 match km.wikipedia's table), birth weekday, tradition switch.
- Sky: moon calendar, ingresses, retrogrades with shadows, eclipses (2026 matches published tables), .ics feeds.
- Tools: birth chart, good hours, lucky-date finder, date converter + age tool, numerology, saved people (browser only), colour of the day, printable month, almanac day pages, solar terms, sky week, search, installable app, Telegram card (needs the owner's bot). Routes: `.claude/reference/routes.md`. Admin: overview, readings, profiles/forecasts, Khmer New Year, feedback, admins, backups.
- Memory: committed in `.claude/memory/` (MEMORY.md auto-loaded, sessions.md on demand); the SessionStart hook installs deps and prints status in cloud sessions.

## Baselines

| Gate | Value |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run lint` | **0** problems |
| `npm test` | 111 passing |
| `npm run check:contrast` | all pairs AA |
| `npm run check:tokens` | 0 violations |
| `npm run db:preflight` | CLEAN |
| `npm run docs:budget` | auto-loaded docs under 36 KB |

## Open items

- Owner: brand name and domain; review of all text; native-speaker check of the inline Khmer tradition terms (`docs/KHMER-REVIEW.md`); Railway + Cloudflare setup (`docs/OWNER-ACTIONS.md`).
- Khmer calendar validated against the cases in tests and the research table; validation against Roath Kim Soeun's tables for 200+ dates (research §1.3) not yet done.
- English only since 2026-10-05: the Khmer language version was removed (owner decision); every `/km` URL 308-redirects to English. Khmer traditions stay, in English. AdSense readiness, privacy and a full security audit are in progress.
- Reading block library is 196 of the ~360 the plan targets.
- Built 2026-10-04 (second pass): birth chart (`/tools/birth-chart`), good hours (`/good-hours`), lucky-date finder (`/lucky-days/finder`). Their wording (`lib/natalCopy.ts`, `PLANET_HOUR` in `lib/goodHours.ts`) is draft.
- FEATURES.md §7 list built through 2026-10-05 except: personal transits (#4, ~600 text blocks first), BaZi (#6, would put lunar-javascript in the browser), owner analytics (#52, needs a Cloudflare token), gardening by the Moon (#53).
