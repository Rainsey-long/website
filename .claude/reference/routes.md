# Routes

English only (2026-10-05): every old `/km<path>` URL 308-redirects to `<path>` (`proxy.ts`, `docs/I18N.md`).

| Route | What | Data |
|---|---|---|
| `/` | Home, sections per chosen tradition: your reading (remembered sign), DayDial night band, Khmer today + New Year, sign picker, birth-weekday chips, Chinese animals + almanac strip, 2027, pairs | engines + DB block text |
| `/horoscope`, `/horoscope/[sign]`, `/horoscope/[sign]/[date]` | Daily readings; hub shows yesterday/today/tomorrow by the visitor's local date; dated pages for 1900–2100 (only ±60 days indexed) | reading engine, DB text |
| `/zodiac`, `/zodiac/[sign]` | Western profiles | Markdown |
| `/chinese-zodiac`, `/chinese-zodiac/[animal]`, `/[animal]/2027`, `/chinese-zodiac/2027` | Animal profiles (+ today's clash note), Fire Goat forecasts | Markdown, almanac |
| `/compatibility`, `/compatibility/[a]-and-[b]`, `/chinese-compatibility/...` | 78 + 78 canonical pairs; reversed order 308s | rule tables |
| `/khmer` | Khmer hub: today's lunar date, New Year countdown, birth weekdays, the 12 animals, what is and isn't computed | Khmer engine, DB override |
| `/khmer/new-year` | Moha Songkran moment, festival days, the angel and posture, all seven angels, the owner's official time/saying | Khmer engine, DB override |
| `/khmer/colours` | Colour of the day: today's weekday colour, the next seven days, newer-book variants | Khmer weekday table |
| `/khmer/born-on/[weekday]` | Birth-weekday portrait, colour, planet, angel | static |
| `/lucky-days/[yyyy]/[mm]` | Calendar: Chinese almanac marks and/or Khmer lunar days, holy days, festivals (by tradition choice) | almanac + Khmer engines |
| `/sky`, `/sky/moon/[yyyy]/[mm]`, `/sky/retrogrades/[yyyy]` | Positions, phases, ingresses, stations + shadows, eclipses, in the visitor's zone | sky events |
| `/feeds`, `/feeds/[name].ics` | Subscribable calendars: moon phases, retrogrades, eclipses, Khmer holy days, Khmer festivals | sky + Khmer engines |
| `/tools/birth-chart` | Client-side natal chart: wheel, ten planets, whole-sign houses, aspects, plain-English reading (`lib/natal.ts`, `lib/natalCopy.ts`) | browser only |
| `/good-hours?city=&date=` | Chinese double-hours (good/quiet, spirit, clash) and planetary hours from local sunrise for a city and day (`lib/goodHours.ts`) | almanac + astronomy |
| `/horoscope/[sign]/week`, `/horoscope/[sign]/week/[monday]` | Weekly reading (`lib/weekly.ts`): overview block by the week's lunation × house (`content/weekly/lunations.json`, admin tab Weekly), best days from the daily engine, the Moon's path, planet events. Any Monday 1900–2100 renders; the last 8 weeks and the next 1 are indexed | sky + DB text |
| `/lucky-days/[yyyy]/[mm]/print` | One-page A4 landscape printable calendar (noindex), traditions as chosen; print CSS at the end of `app/globals.css` | almanac + Khmer engines |
| `/tools/date-converter?d=&ky=&kmo=&kph=&kd=&cy=&cm=&cd=&cl=` | A date in the Khmer and Chinese calendars; Khmer lunar date → Gregorian (`findKhmerDates`, scans the year); Chinese lunar date → Gregorian (`findChineseDate`); AgeTool is client-only (`lib/age.ts`), a birth date never reaches the server | `lib/converter.ts` |
| `/lucky-days/finder?occasion=&from=&months=&a1=&a2=` | Chinese almanac days listing an occasion as favourable, minus clash days, up to 6 months (`lib/luckyFinder.ts`) | almanac |
| `/tools/zodiac-calculator` | Client-side: sun/moon/rising, Chinese, Khmer (animal at the Songkran minute, birth weekday, lunar birth date) | browser only |
| `/tools/compatibility-checker` | Picks a pair page | — |
| `/southeast-asian-zodiac[/khmer|/vietnamese]`, `/about`, `/contact`, `/privacy`, `/terms`, `/disclaimer`, `/styleguide` (noindex) | | |
| `/admin/login` · `/admin` | Sign-in · overview of what needs attention | DB |
| `/admin/readings` | Reading text: review, edit, approve; filters (draft) and search | DB |
| `/admin/content`, `/admin/content/edit?path=` | Profiles and 2027 forecasts: owner edits, stored in `content_overrides`, reset to the repository file | DB + `content/` |
| `/admin/songkran` · `/admin/feedback` · `/admin/accounts` · `/admin/backups` | Official Khmer New Year moment · feedback triage, delete, CSV · add/remove admins, change password · list backups, back up now | DB / volume |
| `/api/health`, `/api/feedback`, `/api/admin/login`, `/api/admin/blocks/[id]`, `/api/admin/songkran/[year]`, `/api/admin/content`, `/api/admin/feedback` (+ `/export` CSV), `/api/admin/users`, `/api/admin/password`, `/api/admin/backups`, `/api/cron/backup` | see `.claude/security.md` | DB |
| `/og/[slug]`, `/sitemap.xml`, `/robots.txt` | share cards, sitemap, robots | |

## Added 2026-10-05

| Route | What | Data |
|---|---|---|
| `/lucky-days/day/[yyyy-mm-dd]` | One almanac day: lunar date, pillar, officer, spirit, good-for / leave for another day, clash; Khmer section when the traditions cookie includes Khmer. 1900–2100; indexed 60 days back to 366 ahead | almanac + Khmer engines |
| `/sky/solar-terms`, `/sky/solar-terms/[yyyy]` | The 24 jieqi with exact moments in the visitor's zone (`lib/solarTerms.ts`); uncached years charged to a ceiling | astronomy-engine |
| `/sky/week`, `/sky/week/[monday]` | This week in the sky: phases, Moon ingresses, planets, eclipses, Khmer holy days and festivals, Chinese good days (`weekSkyEvents` in `lib/weekly.ts`); charged to the sky-year ceiling | sky + calendars |
| `/feeds/khmer-holy-days.ics?eve=1` | Holy-day feed with an all-day note on each eve (`-eve` UIDs) | Khmer engine |
| `/tools/numerology` | Client-only numerology (life path, birthday, name number, personal year and month, `lib/numerology.ts`) | browser only |
| (saved people) | `lib/people.ts` + `PeoplePicker`: up to 6 people in localStorage key `people`, used by the calculator, birth chart, age tool and numerology; never sent | browser only |
| `/search?q=` | Static site search over pages, signs, animals, festivals, tools (`lib/searchIndex.ts`), q capped at 80, noindex with a query | static |
| `/offline`, `/manifest.webmanifest`, `/sw.js` | Installable app; the service worker keeps the last 20 pages, never `/api`, `/admin`, `/og`, `/feeds` or non-GET | — |
| `GET /api/cron/telegram` | `TELEGRAM_CRON_SECRET` bearer; posts the daily Khmer card to Telegram once per day (`lib/telegram.ts`, last date in `app_settings`) | DB |
| `/ads.txt` | AdSense seller line from `NEXT_PUBLIC_ADSENSE_ACCOUNT`; 404 until set (`lib/ads.ts`) | env |
