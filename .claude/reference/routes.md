# Routes

Every page below also exists in Khmer at `/km<path>` (the admin at `/km/admin`), rewritten by `proxy.ts` to the same component (`docs/I18N.md`). Non-page URLs take `?lang=km` instead: `/feeds/<name>.ics?lang=km`, `/og/<slug>?lang=km`, and API routes for their messages.

| Route | What | Data |
|---|---|---|
| `/` | Home, sections per chosen tradition: your reading (remembered sign), DayDial night band, Khmer today + New Year, sign picker, birth-weekday chips, Chinese animals + almanac strip, 2027, pairs | engines + DB block text |
| `/horoscope`, `/horoscope/[sign]`, `/horoscope/[sign]/[date]` | Daily readings; hub shows yesterday/today/tomorrow by the visitor's local date; dated pages for 1900–2100 (only ±60 days indexed) | reading engine, DB text |
| `/zodiac`, `/zodiac/[sign]` | Western profiles | Markdown |
| `/chinese-zodiac`, `/chinese-zodiac/[animal]`, `/[animal]/2027`, `/chinese-zodiac/2027` | Animal profiles (+ today's clash note), Fire Goat forecasts | Markdown, almanac |
| `/compatibility`, `/compatibility/[a]-and-[b]`, `/chinese-compatibility/...` | 78 + 78 canonical pairs; reversed order 308s | rule tables |
| `/khmer` | Khmer hub: today's lunar date, New Year countdown, birth weekdays, the 12 animals, what is and isn't computed | Khmer engine, DB override |
| `/khmer/new-year` | Moha Songkran moment, festival days, the angel and posture, all seven angels, the owner's official time/saying | Khmer engine, DB override |
| `/khmer/born-on/[weekday]` | Birth-weekday portrait, colour, planet, angel | static |
| `/lucky-days/[yyyy]/[mm]` | Calendar: Chinese almanac marks and/or Khmer lunar days, holy days, festivals (by tradition choice) | almanac + Khmer engines |
| `/sky`, `/sky/moon/[yyyy]/[mm]`, `/sky/retrogrades/[yyyy]` | Positions, phases, ingresses, stations + shadows, eclipses, in the visitor's zone | sky events |
| `/feeds`, `/feeds/[name].ics` | Subscribable calendars: moon phases, retrogrades, eclipses, Khmer holy days, Khmer festivals | sky + Khmer engines |
| `/tools/birth-chart` | Client-side natal chart: wheel, ten planets, whole-sign houses, aspects, plain-English reading (`lib/natal.ts`, `lib/natalCopy.ts`) | browser only |
| `/good-hours?city=&date=` | Chinese double-hours (good/quiet, spirit, clash) and planetary hours from local sunrise for a city and day (`lib/goodHours.ts`) | almanac + astronomy |
| `/lucky-days/finder?occasion=&from=&months=&a1=&a2=` | Chinese almanac days listing an occasion as favourable, minus clash days, up to 6 months (`lib/luckyFinder.ts`) | almanac |
| `/tools/zodiac-calculator` | Client-side: sun/moon/rising, Chinese, Khmer (animal at the Songkran minute, birth weekday, lunar birth date) | browser only |
| `/tools/compatibility-checker` | Picks a pair page | — |
| `/southeast-asian-zodiac[/khmer|/vietnamese]`, `/about`, `/contact`, `/privacy`, `/terms`, `/disclaimer`, `/styleguide` (noindex) | | |
| `/admin/login` · `/admin` | Sign-in · overview of what needs attention | DB |
| `/admin/readings` | Reading text in both languages: review, edit, approve; filters (draft, missing Khmer) and search | DB |
| `/admin/content`, `/admin/content/edit?path=&lang=` | Profiles and 2027 forecasts: owner edits per language, stored in `content_overrides`, reset to the repository file | DB + `content/` |
| `/admin/songkran` · `/admin/feedback` · `/admin/accounts` · `/admin/backups` | Official Khmer New Year moment · feedback triage, delete, CSV · add/remove admins, change password · list backups, back up now | DB / volume |
| `/api/health`, `/api/feedback`, `/api/admin/login`, `/api/admin/blocks/[id]`, `/api/admin/songkran/[year]`, `/api/admin/content`, `/api/admin/feedback` (+ `/export` CSV), `/api/admin/users`, `/api/admin/password`, `/api/admin/backups`, `/api/cron/backup` | see `.claude/security.md` | DB |
| `/og/[slug]` (`?lang=km`), `/sitemap.xml` (both languages with hreflang alternates), `/robots.txt` | share cards (Khmer shaped with HarfBuzz), sitemap, robots | |
