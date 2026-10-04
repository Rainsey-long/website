# Decisions

Conventions chosen where the plan left room, and every departure from BUILD_PLAN.md.

## Platform (2026-10-04, owner request)

| Decision | Why |
|---|---|
| Next.js 16 + better-sqlite3 + Docker on Railway, Cloudflare DNS, instead of static Astro on Cloudflare Pages | Owner: use the same technology and production shape as CamboMath so it publishes the same way. Gains: owner-editable text, admin, feedback, the official Songkran override, any-date readings, visitor-zone "today" |
| Every page server-rendered on request | The layout reads the tradition and time-zone cookies; computations take milliseconds; one container serves it |
| One admin identity, no visitor accounts | Plan §2.3 (no stored birth data) stands; accounts were not asked for |
| CamboMath modules reused nearly verbatim: `rateLimit`, `migrationRunner`, `volumeHeadroom`, `aiBots`, the auth design, the backup rules, the git and agent hooks | Battle-tested in production; their comments carry the incidents |
| Site branch `claude/zodiac-site`, orphan | `master` is an unrelated 2018 Flutter docs fork |

## Astrology and calendars

| Area | Decision | Why |
|---|---|---|
| Zodiac | Tropical, Sun's apparent longitude of date | Most widely used Western convention |
| Unknown birth time | Noon in the birth city's zone, or the browser's zone | Plan §5.1; cusp flagged within 1° |
| Moon sign without a time | Noon; flagged "uncertain" when it changes sign that day | Honest about the 2.5-day transit |
| Rising sign | `ASC = atan2(cos RAMC, −(sin ε tan φ + cos ε sin RAMC))` | Tested against a table of houses and 5 charts |
| Houses for readings | Solar-sign houses | Readings are per sign |
| Lunar New Year in the browser | Generated table 1900–2100 from lunar-javascript | Keeps the calculator small; a test asserts equality |
| BaZi year | Sun at 315° (Lichun) | Same rule as lunar-javascript |
| Almanac day quality | Good = 黄道; challenging = 黑道 and officer 破/危/闭 or 诸事不宜 | "Challenging" stays rare |
| Almanac terms | Medical and catch-all terms hidden | No health advice |
| Reading variety | `(seed + a·lap + b·dayInStay) mod 3` per topic; one moon-phase note per reading | 30-day no-repeat guarantee; avoids the same sentence closing every topic |
| Sky event times | Stations to ~10 minutes, ingresses to ~30 s, shown in the visitor's zone | Matches published tables to the day; minutes vary between sources |
| Void-of-course Moon | Not shown | Definitions disagree (research §2.1); revisit with a stated definition |

## Khmer traditions (research: docs/research/KHMER-TRADITIONS.md)

| Decision | Why |
|---|---|
| Khmer lunar calendar, animal year, sak and Moha Songkran from @thyrith/momentkh (MIT) | Published Chhankitek algorithm; verified against km.wikipedia's Songkran table 2020–2026 and known festival dates |
| The Khmer animal turns at the Songkran **minute** (UTC+7); the calculator converts the birth instant to UTC+7 first | That is the tradition, and births on New Year's day differ by minutes |
| Replaced the hand-made Khmer New Year table with the calculation | The table was an unverified draft; the algorithm matches published years |
| Official Songkran minute is owner-entered per year (admin), calculated otherwise | Sources differ by minutes (2024: 22:17 vs 22:24); the Ministry announces it |
| Built: lunar date, sila days, festivals, New Year angel and posture, birth weekday (planet, colour, angel) | Deterministic, loved, not sensitive |
| Not built: wedding/house good-day picking, illness/war/accident omens, Bizot's "eight influences", Daksa colours, sidereal Reasey, nakshatra | Left to an achar, sensitive, or unverified for Khmer use (research §5–§9) |
| Optional "count from sunrise" rule for the birth weekday | Traditional day starts at sunrise; off by default because most people know their calendar weekday |
| Robe colours: the 1960 Buddhist Institute table, with a "colours vary" note | Newer books differ for three days |

## Features chosen from the research shortlist (docs/research/FEATURES.md)

Built now: Khmer calendar and holy days (score 29), moon calendar (28), retrograde and eclipse calendar (27), "the sky behind this reading" (26), .ics feeds (27), "was this helpful" feedback (23, worded as helpful, not accurate), tradition switch (25).
Built second (2026-10-04): natal chart wheel (26), lucky-date finder by occasion (26), good hours (25).
Next candidates (re-ranked 2026-10-04, docs/research/FEATURES.md §7): a date converter with a Khmer age / Buddhist-era tool, today's colour to wear, a printable monthly calendar, weekly horoscopes, a Telegram daily card; then almanac day pages, solar terms, an installable app, family profiles (browser only), numerology, personal transits.

| Feature | Decision | Why |
|---|---|---|
| Birth chart | Whole-sign houses; orbs 8/7/5 (+2 for Sun/Moon); no aspects between Uranus, Neptune and Pluto; unknown time = noon, no houses, sign changes flagged | Whole-sign works at every latitude; published orbs; generational aspects say nothing personal |
| Birth chart | Computed in the browser, never sent | Owner rule: birth details never leave the browser |
| Good hours | Chinese hours on the local clock, Zi split at midnight (13 rows); planetary hours from real sunrise/sunset, 24 equal hours from 06:00 where the Sun does not rise or set | Most almanacs and apps; polar fallback stated on the page |
| Lucky-date finder | Chinese almanac only; a day needs the occasion in 宜, not in 忌, not "challenging", no clash with chosen animals; ranges 1, 3 or 6 months | Khmer good-day picking stays with an achar (owner rule); the tong shu publishes its own list |

## Smaller

| Area | Decision |
|---|---|
| City data | 124 hand-picked cities with IANA zones, no external dataset |
| AI crawlers | Blocked like CamboMath (`FEATURES.BLOCK_AI_CRAWLERS`); answer-engine bots are an owner decision |
| Ads, affiliates, report CTA | Components built, flags off (plan §11) |
| Languages | English and Khmer (owner request, 2026-10-04), built ahead of the plan's Phase 7. Khmer under `/km` (CamboMath's rewrite pattern), English at the root, no browser-language redirect, choice remembered in a `lang` cookie. Mechanism: `lib/i18n.ts`; conventions: `docs/I18N.md` |
| Khmer translations | Drafted in the repository and listed in `docs/KHMER-REVIEW.md` until a native reader approves them; reading blocks are owner-editable in both languages in `/admin` |
| Admin | Owner-editable: reading text (both languages), profiles and 2027 forecasts (database overrides on top of the repository files, so deploys never wipe edits and "Reset" restores the file), Khmer New Year, feedback, admin accounts, backups. Not editable there (code changes): compatibility, birth-chart and good-hours wording, Khmer birth-day portraits, almanac terms |
| Everything is bilingual | Every page including the admin (`/km/admin`), the calendar feeds (`?lang=km` editions with their own UIDs) and the share images (`/og/<slug>?lang=km`). Share-image Khmer is shaped with HarfBuzz (harfbuzzjs) and drawn as outlines, because the image renderer (satori) cannot shape Khmer: without it, coeng marks showed and vowels were misplaced. Legal pages in Khmer say the English version prevails |
| Khmer numerals | Khmer digits in Khmer text, as Khmer print does (CamboMath does the same) |
