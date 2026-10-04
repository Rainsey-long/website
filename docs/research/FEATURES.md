# Horoscope / almanac site — competitor research, accuracy audit, feature brainstorm

Date: 2026-10-04. Method: WebSearch + WebFetch. Every finding is labelled:

- **PRIMARY** — I fetched and read the page itself (WebFetch returned its content; note that WebFetch passes pages through a summarising model, so "primary" means the page, not a search snippet).
- **SUMMARY** — search-result summarisation only; treat as a lead, not a fact.
- **KNOWLEDGE** — from my own background knowledge, not re-verified this session.

**Fetch blocks hit:** `astro-seek.com` → HTTP 403; `reddit.com` → tool refuses the domain entirely (so no Reddit thread was read first-hand; all "Reddit" sentiment below comes via third-party review aggregators and is SUMMARY); the `astronomy-engine` GitHub README fetch returned only navigation chrome (truncated). Fetched OK: astro.com, cafeastrology.com, horoscope.com, yourchineseastrology.com, chinahighlights.com, unstar.app (comparison), sunmoresun substack (CHANI review), astroreka.metfone.com.kh.

---

## 1. Competitor landscape

### 1.1 Western astrology sites and apps

| Product | Core features | Retention mechanics | Praise | Complaints | Monetization | Label |
|---|---|---|---|---|---|---|
| **astro.com (Astrodienst)** | Free chart drawing (many house systems); Personal Daily Horoscope by Robert Hand (transits to natal); weekly sun-sign; free "try-out" editions of Transits of the Year, Liz Greene yearly; psychological, career, money, child, partner/relationship reports; AstroClick interactive charts; travel/local-space maps | Saved birth data in a free account ("Astro*Databank" style), daily personal horoscope needs a return visit | (KNOWLEDGE) regarded as the reference-accuracy site — Swiss Ephemeris is theirs | (KNOWLEDGE) dated, dense UI | Paid full-length reports in Astro Shop; free try-outs as funnel | PRIMARY (features), KNOWLEDGE (reputation) |
| **Cafe Astrology** | Free natal report (rising, houses, aspects); compatibility (Sun/Moon/Venus); personalized horoscope + transit report; **monthly/yearly astro calendars, "Good Days" calendars, moon-phase calendar, ephemeris tables, retrograde tables & stations, eclipse tables, Void-of-Course Moon tables, lunation tables, declinations**; daily/monthly/yearly sign horoscopes, birthday forecast, ascendant horoscopes, oracles | Huge evergreen reference-table SEO; "If today is your birthday" daily page | (KNOWLEDGE) breadth, free depth | (KNOWLEDGE) ad-heavy | Paid reports (Time Line Forecast, Year of Transits, packages) + ads | PRIMARY |
| **Horoscope.com** | Daily love/career/health/money; tarot "Card of the Day"; numerology; Chinese; birth chart; compatibility games; Mercury retrograde / Saturn return content; Magic 8-Ball, fortune cookie | Email subscription (daily/weekly), apps, daily "card of the day", games | — | (KNOWLEDGE) generic text | **"$1 psychic reading" upsell**, display ads, store | PRIMARY |
| **Co–Star** | Natal chart from date/time/place, daily transit-driven "day at a glance", friends' charts/relationships | Push notifications in a terse, sometimes harsh brand voice; social graph (add friends) | "Best baseline free daily horoscope" | Paywall creep (Co-Star Plus 2022+, compatibility & transits gated); notification cadence crept to 2–3/day incl. upsells; **negative tone hurts anxious users**; server crashes on big retrograde/eclipse mornings | Subscription | SUMMARY (unstar.app is a competitor reviewer — conflict of interest; dailydot/podcast snippets) |
| **The Pattern** | Psychological-style natal readings, "Bonds" compatibility categories (Soulmate…Challenging), dating ("Connect") | Social/viral hooks, celebrity endorsement | Feels "scarily accurate", psychological language | Readings feel recycled; multi-screen cancel flow; relationship tier ~$14.99/mo | Subscription | SUMMARY |
| **CHANI** | Astro Weather (7-day collective forecast), birth chart organised by planet with "gifts and challenges", current sky/transits, rising-sign podcast, meditations, journal prompts, rituals | Weekly content cadence, rising-sign podcast, journaling | Uplifting, kind tone; "revolutionary" gifts/challenges framing; clean UI; inclusivity; 4.9★ | Essentials behind paywall; **users ask for family-member profiles** | Subscription | PRIMARY (substack review) + SUMMARY |
| **Sanctuary** | Daily readings + live astrologer chat | Chat dependency | "Best astrologer network" | Billing ambiguity, per-minute timer starting in queue, 20–45 min waits, quality variance | Sub + per-minute chat | SUMMARY (unstar) |
| **Nebula** | Targeted horoscopes, palm reading, live astrologer chat | Drip content, trial funnel | Strong social marketing | **$1 teaser → $42–$49.99 or 3-day trial → $9.99/week auto-renew**, poor disclosure, hard cancel, reminder email after charge; Trustpilot 1★ cluster | Weekly subs + chat | SUMMARY (Trustpilot, unstar) |
| **TimePassages** | Natal chart, "big three", bi-wheel transits to natal **with date ranges for each transit**, glossary of houses/aspects, synastry bi-wheel | Transit windows make it a planning tool | "Explains why, not just what"; "absolute gem" | (SUMMARY) — | Free + $0.99 per chart / $9.99 unlimited / Pro $7.99 mo, $59.99 yr | SUMMARY |
| **Stellium** | Deep natal study (asteroids, midpoints) | Niche, study-oriented | **One-time purchase praised** vs recurring billing | Android rendering bugs, smaller library | One-time | SUMMARY |
| **Astro-Seek** | (KNOWLEDGE) the broadest free calculator set: natal, transits, synastry, composite, solar return, progressions, astro-calendar with VOC/ingresses/aspects, eclipse search, retrograde tables, famous-people database | Community + calculators, SEO on long-tail tables | Free, exhaustive | Cluttered | Ads | **403 — not read**; KNOWLEDGE only |
| **Lunary / AstralPath (free Co-Star alternatives)** | Full natal + transits, grimoire, AI readings | — | Free, no paywall | — | — | SUMMARY (alternative-list sites, low reliability) |

**Category-wide pattern (SUMMARY, consistent across several sources):** the three most repeated complaints are (1) opaque subscription disclosure / hard cancellation, (2) daily text that visibly recycles after a few weeks, (3) emotionally manipulative or negative notifications. The most repeated praise: kind tone (CHANI), "explains why" (TimePassages), "real chart, not just sun sign", one-time pricing (Stellium). **All three of the complaints are things our hard rules already forbid — that is a positioning advantage, not just a constraint.**

### 1.2 Chinese almanac / Chinese astrology

| Product | Core features | Retention / monetization | Label |
|---|---|---|---|
| **yourchineseastrology.com** | Yearly/monthly/weekly/daily zodiac forecasts; BaZi four pillars + marriage matching; lucky-day finder by occasion (wedding, engagement, moving, birth/C-section, renovation); lunar-age converter; Chinese calendar converter; feng shui flying stars; bone-weight astrology; dream meanings | Ads + paid readings store + Q&A forum | PRIMARY |
| **chinahighlights.com** | Zodiac calculator, compatibility calculator, 12 animal profiles, lucky numbers/colours/flowers tables, 2026 & 2027 forecasts | Content as top-of-funnel for **China tour sales** | PRIMARY |
| **老黄历 apps** (中华老黄历, 图上老黄历, 吉日黄历, 小黄历, 什么时辰, 神算堂老黄历) | Daily 宜忌 (do/avoid), **时辰吉凶 (12 double-hour good/bad)**, 黄道吉日 search, 干支 (stem-branch) for year/month/day, 冲煞 (clash animal & direction), 吉神方位 (auspicious directions), 建除十二神, 彭祖百忌, 二十八星宿, 节气, 五行穿衣 (daily five-element clothing colour), personal 运势; paper-almanac page-flip UI | Reviewers reward **"简洁无广告" (clean, ad-free)**; 图上老黄历 sells as **买断制 one-time purchase, zero ads/subs/IAP** as its pitch; 吉日黄历 4.9★/375 | SUMMARY (App Store listings via search) |
| **Lịch Vạn Niên (Vietnam)** | Lunar-solar calendar, can-chi of day/month/year, giờ hoàng đạo (auspicious hours), solar terms, age clashes (xung tuổi), travel directions, good/bad stars, việc nên làm / kiêng, holidays, prayer texts | 4.4★/205; complaint: **too many video ads** | SUMMARY |

### 1.3 Thai / Khmer / SE Asia

| Product | What it does | Label |
|---|---|---|
| **Metfone AstroReka** (Cambodian telco) | "AI-powered" Khmer zodiac platform: personal "energy map" from birth date, daily do/avoid guidance, zodiac fortune lookup, uses birth hour + lunar cycle; notes Khmer belief that the *actual* birth date and the *ID-card* birth date both matter | PRIMARY (pricing not on page; telco value-added services are typically SMS/airtime-billed — KNOWLEDGE, unverified) |
| **7 Khmer Teller** (app) | Horoscope from birth month and date | SUMMARY |
| **Thai sites** (มหามงคล.คอม, Thaiger Thai edition, Thairath horoscope, KTC article) | ดูดวงรายวัน by **day of the week born**, **daily lucky/avoid colours (สีมงคล)** split by money/work/love, lucky numbers, tarot | SUMMARY |
| **Num Eiang Astrolendar** (Thai-Chinese) | Auspicious calendar, daily/weekly/monthly, personal colours by five elements | SUMMARY |
| Khmer culture (Cambodia Daily, Foreign Policy "royal astrologer", ABS-CBN) | Royal astrologer's annual Khmer New Year (April) predictions are national news; a Cambodian leader reportedly changed a birth date for zodiac reasons; fortune tellers consulted for big decisions; Khmer calendar is lunisolar (Chhankitek) | SUMMARY |
| **Popular Khmer Facebook horoscope pages** | **Not found** — search does not index Facebook pages; would need a manual browse in-app. Gap. | — |

**Khmer computation libraries (SUMMARY, worth verifying):** `@thyrith/momentkh` (npm, zero-dependency Chhankitek conversion, v3.0.3), ported to Flutter (`flutter_khmer_chankitec`), Laravel (`asorasoft/chhankitek`), Deno (`@pphatdev/format-datetime`). This makes Khmer lunar date, animal year, Buddhist Era and **Thngai Sil (holy days: 8th & 15th waxing, 8th & 14th/15th waning)** computable without hand-rolling the algorithm.

---

## 2. Accuracy: what is computable vs what is text

The honest line: **astronomy is verifiable; interpretation is not.** A site earns trust by being exactly right on the first and transparent about the second ("positions computed from NASA-grade ephemeris; meanings are traditional, for reflection and entertainment").

### 2.1 Computable with astronomy-engine (KNOWLEDGE of the API; README fetch failed — verify names before building)

| Item | How | Verifiable against | Notes / gotchas |
|---|---|---|---|
| Planet & Moon ecliptic longitude → sign, degree | `GeoVector` + `Ecliptic`, `EclipticGeoMoon`, `SunPosition` | JPL Horizons, astro.com | Use **geocentric apparent, ecliptic of date (tropical)**. ~arcsecond-to-arcminute; fine for signs. |
| Sign ingress times | root-search on longitude crossing 30° multiples | Cafe Astrology / astro-seek tables | Show in user's time zone; ingress near midnight changes "today's sign". |
| Retrograde / station dates | sample longitude derivative, bisect sign change | Published retrograde tables | No built-in "station" search — write a search; stations are slow so tolerance matters (minutes). Shadow periods = longitude of the other station. |
| Moon phases & exact times | `SearchMoonPhase`, `SearchMoonQuarter`, `MoonPhase` | timeanddate.com, USNO | Rock solid. |
| Eclipses (lunar, global/local solar) | `SearchLunarEclipse`, `SearchGlobalSolarEclipse`, `SearchLocalSolarEclipse` | NASA eclipse catalog | Local visibility per user city is a nice differentiator. |
| Equinoxes/solstices | `Seasons` | almanacs | |
| **Chinese solar terms (24 节气)** | `SearchSunLongitude` at multiples of 15° | HKO / Purple Mountain Obs. | **Month pillar and 立春 (Li Chun) year boundary for BaZi depend on these** — compute, don't table. |
| Chinese lunar months / new year | new moons (`SearchMoonPhase` 0°) **in UTC+8** + zhongqi rule | HKO calendar | Must use China Standard Time, not user TZ; leap-month rule. Validate against HKO for 1900–2100. |
| Sunrise/sunset, moonrise | `SearchRiseSet` | timeanddate | Needed for Khmer/Thai day boundaries and "good hours" variants that start at sunrise. |
| Ascendant / MC / houses | `SiderealTime` + obliquity + latitude | astro.com | Not built in; ~20 lines of math for ASC/MC; Placidus needs iteration; offer Whole Sign + Placidus. **Birth time unknown → no rising/houses**; say so. Historic time zones need an IANA tz database (DST history matters for births before ~1980 in many countries). |
| Aspects (natal, transits to natal, synastry) | angular difference with orbs | astro.com | Orbs are convention — publish yours. |
| Void-of-course Moon | last applying Ptolemaic aspect before ingress | Cafe Astrology VOC tables | **Definition-dependent** (SUMMARY: traditional 7 planets vs incl. outers; Lilly's vs modern). Pick one, state it, show "computed with classical planets". |
| Moon sign per day | Moon longitude | any ephemeris | Moon changes sign every ~2.5 days — display the switch time. |
| Planetary hours | sunrise/sunset split into 12 + Chaldean order | Online planetary-hour calculators | Deterministic once sunrise/sunset are known. |

### 2.2 Computable by convention (deterministic, but the *rules* are tradition)

| Item | Rule source | Risk |
|---|---|---|
| BaZi four pillars (year/month/day/hour stems & branches) | Sexagenary cycle; day pillar from a fixed epoch; month from solar terms; hour by 2-hour branches | **Disputes:** year starts at Li Chun not Lunar New Year; late-Zi (23:00) hour day-rollover school; true solar time vs clock time. Pick defaults, expose them. |
| 黄历 day officers (建除十二神), 28 mansions, clash animal & direction, 彭祖百忌 | Derived from day/month branches & stems | Fully deterministic tables — verifiable against any 老黄历. |
| 宜/忌 activity lists | Almanac compendia (协纪辨方书 lineage) | **Apps disagree on lists**; the officer/clash parts agree. Present as "traditional almanac says". |
| 12 double-hour (时辰) good/bad (黄道/黑道 hours) | Day branch → 黄道 hours | Deterministic, verifiable. |
| Khmer lunar date, Buddhist Era, holy days (Thngai Sil), Khmer New Year date | Chhankitek algorithm (momentkh) | Validate against official Cambodian calendars for several years. |
| Thai/Khmer day-of-week-born planet, lucky colours | Fixed tables (Sunday=red, Monday=yellow, …) | Deterministic; Wednesday split day/night in Thai tradition. |
| Numerology (life path, personal year) | Digit sums | Deterministic. |
| Vietnamese can-chi + zodiac (Cat replaces Rabbit, Buffalo for Ox) | Same as Chinese; Vietnam computes on UTC+7 so **Tết can differ from Chinese New Year by a day** in some years (e.g. 1985, 2007 — KNOWLEDGE, verify) | |

### 2.3 Pure text (not verifiable — label as such)
Sun-sign daily horoscopes, personality profiles, compatibility narratives, yearly animal forecasts, transit meanings, BaZi readings of element balance. Our deterministic text-block engine is a strength here: **same input → same reading**, which is honest and cacheable; the weakness to manage is **visible repetition** (the #2 category complaint).

---

## 3. Brainstorm: 34 candidate features, scored

Scale 1–5. For **Effort** and **Privacy risk**, 5 = *low* effort / *low* risk (so higher is always better). Total out of 30.

| # | Feature | Benefit | Accuracy | Calm-fit | Effort (5=easy) | SEO/Retention | Privacy (5=safe) | Total |
|---|---|---|---|---|---|---|---|---|
| 1 | **Moon calendar** (phases, moon sign per day, ingress times, VOC) | 4 | 5 | 5 | 4 | 5 | 5 | **28** |
| 2 | **Retrograde & eclipse calendar** (stations, shadows, local eclipse visibility) | 4 | 5 | 4 | 4 | 5 | 5 | **27** |
| 3 | **Natal chart wheel + interpretation** (big three, planets/houses/aspects) | 5 | 5 | 5 | 3 | 5 | 3 | **26** |
| 4 | **Personal daily reading from transits to natal** | 5 | 4 | 4 | 3 | 5 | 3 | **24** |
| 5 | **Chinese almanac day page** (宜忌, officer, clash, good/bad 时辰, directions) | 5 | 4 | 5 | 3 | 5 | 5 | **27** |
| 6 | **BaZi four pillars calculator** + element balance | 4 | 4 | 4 | 3 | 4 | 3 | **22** |
| 7 | **Khmer calendar + Buddhist holy days (Thngai Sil)** + Khmer New Year countdown | 5 | 5 | 5 | 4 | 5 | 5 | **29** |
| 8 | **Saved profiles (self + family, local-first, optional account)** | 5 | n/a→3 | 5 | 3 | 5 | 2 | **23** |
| 9 | **Daily "good hours"** (Chinese 时辰 + planetary hours) | 4 | 4 | 4 | 4 | 4 | 5 | **25** |
| 10 | **Synastry / couple from birth data** (aspect grid + composite highlights) | 5 | 4 | 4 | 3 | 5 | 2 | **23** |
| 11 | **Personal year/month forecast** (major transits windows, solar return) | 4 | 4 | 4 | 3 | 4 | 3 | **22** |
| 12 | **Tradition switch** (Western / Chinese / Vietnamese / Khmer view of the same birthday) | 4 | 4 | 5 | 3 | 4 | 5 | **25** |
| 13 | **Shareable/printable cards** (OG image per sign/day; printable monthly almanac) | 4 | 4 | 4 | 4 | 5 | 4 | **25** |
| 14 | **Email daily/weekly digest** (opt-in, one per day max, one-click unsub) | 4 | 4 | 4 | 3 | 5 | 2 | **22** |
| 15 | **Web push digest** | 3 | 4 | 3 | 3 | 4 | 3 | **20** |
| 16 | **"Was this helpful?" feedback** (not "accurate?" — see notes) | 3 | 3 | 5 | 5 | 3 | 4 | **23** |
| 17 | **"Show the sky behind this reading"** transparency panel on every reading | 4 | 5 | 5 | 4 | 3 | 5 | **26** |
| 18 | Lucky-date finder by occasion (wedding, moving, opening) over a date range | 5 | 4 | 4 | 3 | 5 | 5 | **26** |
| 19 | Thai/Khmer day-of-week-born lucky colours (daily) | 4 | 4 | 5 | 5 | 4 | 5 | **27** |
| 20 | 24 solar terms page with exact times + seasonal notes | 3 | 5 | 5 | 5 | 4 | 5 | **27** |
| 21 | Lunar/Gregorian/Khmer date converter | 4 | 5 | 5 | 4 | 4 | 5 | **27** |
| 22 | Rectification helper ("unknown birth time") | 2 | 2 | 4 | 2 | 2 | 3 | 15 |
| 23 | Progressions / solar arc | 2 | 5 | 4 | 3 | 2 | 3 | 19 |
| 24 | Solar return chart | 3 | 5 | 4 | 3 | 3 | 3 | 21 |
| 25 | Astrocartography / relocation | 3 | 4 | 4 | 2 | 3 | 3 | 19 |
| 26 | Numerology (life path, personal year) | 3 | 4 | 5 | 5 | 4 | 4 | 25 |
| 27 | Tarot card of the day | 3 | 1 | 4 | 4 | 4 | 5 | 21 |
| 28 | Celebrity birthday / famous people by sign | 2 | 4 | 4 | 3 | 4 | 5 | 22 |
| 29 | Journaling prompts tied to moon phase (local storage) | 3 | 3 | 5 | 4 | 3 | 4 | 22 |
| 30 | Calendar export (.ics) for moon phases, retrogrades, holy days, lucky days | 4 | 5 | 5 | 4 | 4 | 5 | **27** |
| 31 | Friends graph / social comparison (Co-Star style) | 3 | 4 | 2 | 2 | 4 | 1 | 16 |
| 32 | Live astrologer chat | 3 | 1 | 1 | 1 | 3 | 1 | 10 |
| 33 | Runtime AI reading generation | 3 | 1 | 2 | 3 | 3 | 2 | 14 (also violates "no runtime AI") |
| 34 | Gamified streaks / badges | 2 | n/a | 1 | 4 | 4 | 4 | 15 (dark-pattern adjacent) |
| 35 | Feng shui flying stars (annual) | 3 | 4 | 4 | 3 | 4 | 5 | 23 |
| 36 | Khmer royal-astrologer-style New Year (Moha Sangkran) almanac: New Year angel (Tevoda), day/time of Sangkran | 4 | 4 | 5 | 3 | 5 | 5 | 26 |

Notes on the scoring:
- **Privacy** is lowest where birth date+time+place is stored server-side (#3, 4, 8, 10). Mitigation used in specs below: compute statelessly by default, store only if the user opts in, store *coarsened* place (lat/lon to 2 dp + tz id, not the city string) and never sell/share. Birth data of *others* (partner, family) is third-party personal data — keep it local-first.
- **Feedback (#16)**: "Was this accurate?" invites confirmation bias and implies predictive claims we disclaim. "Was this helpful / clear?" fits entertainment framing and still detects repetitive or confusing text blocks.
- Rejected outright on rules: #32 (paid chat, top source of billing complaints), #33 (runtime AI), #34 (streaks are a compulsion mechanic), #31 (social comparison; heavy privacy).

---

## 4. Top 10 picks — specs

Ranking blends total score with strategic fit (SEO moat from exact, verifiable data; SE Asia audience; server now available).

### 1. Khmer calendar & Buddhist holy days (score 29)
- **User sees:** today's Khmer lunar date in Khmer script + romanised + English ("ថ្ងៃ ៨ កើត ខែ…"), Buddhist Era year, animal year & sak, a month grid marking Thngai Sil (holy days), Khmer New Year countdown, Pchum Ben / Visak Bochea / Meak Bochea dates.
- **Inputs:** none (date picker optional).
- **Data/computation:** Chhankitek via `@thyrith/momentkh` (verify licence & correctness against 5+ years of printed Cambodian calendars); holiday rules as code.
- **Server/DB:** no DB; server-render + cache per day; static pages `/khmer-calendar/2027/04` for SEO.
- **Edge cases:** leap month (Adhikameas) and leap day (Chantrea-thimeas) years; Khmer New Year falls 13/14 April and its exact Sangkran time varies; day boundary at local midnight (Asia/Phnom_Penh) regardless of viewer TZ; holy day on 14th vs 15th waning in short months.

### 2. Moon calendar (28)
- **User sees:** month grid with phase icon, Moon's sign per day with ingress time, full/new moon exact times, VOC windows (shaded), "Moon in X today" blurb; next eclipse callout.
- **Inputs:** location/time zone (auto from browser TZ, editable city).
- **Computation:** `SearchMoonPhase`/`SearchMoonQuarter`; Moon longitude root-search for ingresses; VOC = last exact Ptolemaic aspect (Sun..Saturn, classical) before ingress — state the definition.
- **Server/DB:** pre-compute a global UTC event table for 1900–2100 (small: ~25k moon ingresses) into SQLite; render per TZ. Verify sample against Cafe Astrology tables in a test.
- **Edge cases:** an ingress or phase near midnight shifts date by TZ; VOC can span two days or be ~minutes long; DST transitions.

### 3. Chinese almanac day page (27)
- **User sees:** day's 干支, day officer (建除), 28-mansion, clash animal & direction (冲/煞), 宜/忌 lists in English + Chinese, the 12 时辰 marked 黄道/黑道 with clock times, solar term in effect, link to the user's animal "today's relation" (clash/harmony).
- **Inputs:** date; optional user's animal.
- **Computation:** sexagenary day count from epoch; month from solar terms (`SearchSunLongitude`, UTC+8); officer/mansion/clash from fixed tables; 宜忌 from a chosen almanac table (cite).
- **Server/DB:** tables in code or SQLite; one SSR page per date (`/almanac/2027-02-06`) = 365 indexable pages/year.
- **Edge cases:** 23:00–01:00 Zi hour day rollover (pick early/late-Zi rule, show it); lists differ between sources — label "one traditional almanac"; avoid fear wording (translate 忌 as "traditionally not favoured", not "danger").

### 4. Natal chart wheel + interpretation (26)
- **User sees:** SVG wheel (planets, signs, houses, aspect lines), big three card, planet-by-planet text in "strengths / growth areas" framing (CHANI's praised structure, our own text), aspect list, a "how this was computed" panel.
- **Inputs:** birth date, time (optional, "unknown" toggle), place (geocoder → lat/lon + IANA tz).
- **Computation:** astronomy-engine positions; ASC/MC from sidereal time; houses Whole Sign default, Placidus option; aspects with published orbs; historic tz via `Intl`/tzdb.
- **Server/DB:** computation can run client or server; **do not persist** unless the user saves a profile. Geocoding needs a city table (GeoNames cities15000 in SQLite — avoids sending birth places to a third-party API).
- **Edge cases:** unknown time → hide houses/ascendant, show Moon sign with "could be X or Y" if it changes sign that day; polar latitudes break Placidus (fall back to Whole Sign); pre-1970 DST errors; births at sign cusps.

### 5. Retrograde & eclipse calendar (27)
- **User sees:** timeline of Mercury/Venus/Mars/Jupiter/Saturn(+outers) retrogrades with pre/post shadow, station times, current-status badges ("Mercury direct, 12 days to station"); eclipse list with type, time, **visible from your city?** and magnitude.
- **Computation:** longitude-derivative search for stations; shadow from station longitudes; `SearchLunarEclipse`, `SearchGlobalSolarEclipse`, `SearchLocalSolarEclipse`.
- **Server/DB:** precompute 1900–2100 into SQLite; evergreen SEO pages (`/mercury-retrograde-2027`) — traditionally among the highest-traffic astrology queries.
- **Edge cases:** calm framing (no "chaos" copy — this is where competitors use fear; we explain the optical illusion and offer gentle "good time to review" notes); station times are imprecise by minutes, show to the hour.

### 6. Personal daily reading — transits to natal (24)
- **User sees:** 3–5 short items for today ranked by exactness & planet weight ("Moon trine your Venus — warm, sociable afternoon"), plus "this week's slow theme" (outer-planet transit with date window, TimePassages-style), and the sun-sign reading for those without birth data.
- **Inputs:** saved or one-off birth data.
- **Computation:** today's positions vs natal; aspects within orb; rank; pick text blocks keyed by (transiting planet, aspect, natal point[, house]); deterministic variant choice by hash(date, profile) to reduce visible repetition.
- **Data:** text library ≈ 10 transiting × 5 aspects × 12 natal points ≈ 600 blocks, ×2–3 variants. Biggest content cost.
- **Server/DB:** stateless compute; cache per profile-day only if account exists.
- **Edge cases:** no birth time → skip house/angle transits; Moon transits change hourly — say "this afternoon"; tone filter: Saturn/Pluto squares written as growth, never doom.

### 7. Saved profiles for self + family (23, but enabling)
- **User sees:** "My people" list (me, partner, mum, child), each with a nickname, tradition preference, and quick links (chart, daily, compatibility, animal, BaZi).
- **Inputs:** name/nickname, birth data.
- **Storage:** **local-first (localStorage/IndexedDB) by default**; optional account (email magic link) to sync. Server rows encrypted at rest; no third-party analytics on profile pages; export & delete buttons. CHANI users explicitly ask for this (PRIMARY).
- **Edge cases:** storing a child's or partner's data — copy should say it stays on device unless you sync; profile cap (e.g. 10) for abuse; account deletion is real deletion.

### 8. Daily "good hours" (25)
- **User sees:** today's timeline with Chinese 黄道 hours (2-hour blocks) and, in Western mode, planetary hours from local sunrise; optional overlay of the user's animal clash hour.
- **Computation:** `SearchRiseSet` for sunrise/sunset; Chaldean sequence; 时辰 table from day branch.
- **Server/DB:** none needed beyond location.
- **Edge cases:** high latitude (no sunrise in winter) → fall back to equal hours with a note; Chinese hours in local clock time vs true solar time — default to clock time, offer toggle.

### 9. Lucky-date finder by occasion (26)
- **User sees:** "Find good days for: moving / wedding / opening a business / travel" over a chosen range, optional "for people born in Year of the Rabbit & Dog" (removes clash days), results with why ("Officer: 成 Success; no clash with your animals").
- **Computation:** iterate days through the almanac engine (#3); filter by 宜 list + clash; optionally Khmer holy days or Western VOC exclusion as tradition filters.
- **Server/DB:** server endpoint (range up to 1 year), cacheable.
- **Edge cases:** always frame as cultural tradition; never "guaranteed"; empty results → widen range rather than "no lucky days" doom.

### 10. Shareable cards + .ics calendar export (25 / 27, bundled)
- **User sees:** "Share" on daily sign readings, animal profile, moon phase → a calm OG image (1200×630 and 1080×1350 story); "Add to calendar" for moon phases, retrogrades, Khmer holy days, chosen lucky days.
- **Computation:** server-side image render (Satori/resvg or canvas); .ics generated per feed with stable UIDs, subscribable URL (`/feeds/khmer-holy-days.ics`).
- **Server/DB:** server needed; subscribable feeds are a quiet retention mechanic (users see us in their calendar every week) with zero notifications pressure.
- **Edge cases:** cards must not embed birth data unless user chooses; feed URLs for personal lucky days should be unguessable tokens or not offered.

**Runners-up:** Tradition switch (#12) as a site-wide UI layer rather than a feature; "Show the sky behind this reading" panel (#17) — cheap, and the single most credible "accuracy" signal; opt-in email digest (#14) once profiles exist (one email/day max, plain, unsubscribe in one click, no upsell content); Moha Sangkran / Khmer New Year almanac (#36) as an annual traffic spike for Cambodia; solar-terms page (#20) as evergreen SEO.

---

## 5. Positioning takeaways

1. **Be the trustworthy one.** The market's top complaints (surprise billing, recycled text, anxious/negative notifications) are exactly what our rules forbid. Say so lightly in the About page: no subscriptions traps, no fear, computed sky.
2. **Verifiable data is the SEO moat.** Cafe Astrology and Astro-Seek win long-tail search with exact tables (VOC, stations, eclipses, ingresses). Our server + SQLite can precompute 1900–2100 once and serve thousands of evergreen, correct pages, each with a test against a reference.
3. **SE Asia is underserved in English and in calm design.** Vietnamese almanac apps are ad-heavy; Chinese almanac reviewers reward "clean, ad-free"; no English-quality Khmer calendar+fortune site was found. Khmer holy days + New Year almanac + day-of-week colours is a distinctive bundle.
4. **Fight repetition structurally**: keyed text blocks with variants selected by a deterministic hash, and readings driven by the *actual* sky so they change when the sky does.
5. **Privacy by default**: stateless computation, local-first profiles, self-hosted geocoding table, no third-party birth data flows.

## 6. Open gaps / to verify
- Reddit threads not read (domain blocked for the tool) — sentiment is via aggregators.
- Astro-Seek not read (403).
- Khmer Facebook horoscope pages not identified (not indexed by search).
- astronomy-engine function names from knowledge; confirm in the installed package.
- `momentkh` accuracy and licence; Vietnamese vs Chinese New Year divergence years.
- unstar.app comparison is from a competitor with an evident commercial stance — treat as SUMMARY-grade even though fetched.

## Sources
- https://www.astro.com/horoscopes (PRIMARY)
- https://cafeastrology.com/ (PRIMARY)
- https://www.horoscope.com/us/index.aspx (PRIMARY)
- https://www.yourchineseastrology.com/ (PRIMARY)
- https://www.chinahighlights.com/travelguide/chinese-zodiac/ (PRIMARY)
- https://unstar.app/blog/co-star-sanctuary-pattern-nebula-stellium-astrology-apps-ranked-2026 (fetched; competitor bias)
- https://sunmoresun.substack.com/p/chani-app-review (PRIMARY)
- https://astroreka.metfone.com.kh/language/en/bai-viet/khmer-zodiac-a-thousand-year-tradition-in-todays-world-2875.html (PRIMARY)
- https://www.trustpilot.com/review/appnebula.co , https://ca.trustpilot.com/review/nebula.app (SUMMARY)
- https://dailydot.com/co-star-astrology-app-push-notifications-memes , https://theastrologypodcast.com/2021/01/05/co-star-and-the-making-of-a-popular-astrology-app/ , https://kimola.com/reports/co-star-app-review-analysis-unveiling-user-insights-app-store-us-155484 (SUMMARY)
- https://www.bustle.com/life/timepassages-astrology-app-review , https://apps.apple.com/us/app/timepassages-astrology/id488946918 (SUMMARY)
- https://fashionweekdaily.com/soulmates-or-challenging-scarily-accurate-astrology-app-the-pattern-now-has-a-dating-feature (SUMMARY)
- 老黄历 App Store listings: https://apps.apple.com/cn/app/id1575380190 , https://apps.apple.com/cn/app/id6473355266 , https://apps.apple.com/app/id1533372181 , https://apps.apple.com/app/id1549367742 (SUMMARY)
- Lịch Vạn Niên: https://apps.apple.com/us/app/-/id877914778 (SUMMARY)
- Thai: https://www.ktc.co.th/article/knowledge/birthday-auspicious-color-timetable , https://thethaiger.com/th/news/654319/ (SUMMARY)
- Khmer calendar libs: https://npmjs.com/package/@thyrith/momentkh , https://root.packagist.org/packages/asorasoft/chhankitek (SUMMARY)
- VOC definitions: https://theastrologypodcast.com/transcripts/tap-ep-292-transcript-defining-the-void-of-course-moon/ , https://www.skyscript.co.uk/glossary/void-of-course (SUMMARY)
- Khmer culture: https://foreignpolicy.com/?p=8655 , https://ling-app.com/blog/khmer-calendar/ (SUMMARY)

---

## 7. Brainstorm round 2 (2026-10-04), after the bilingual build

Sources: the shortlist above, what the site now has, and the audience it now serves (Khmer readers as well as English). No new web research in this round; every new idea is labelled KNOWLEDGE unless it extends a researched one. Scores use the same scale as §3 (higher is always better, out of 30).

### Built since §3

Moon calendar (#1), retrogrades and eclipses (#2), natal chart (#3), Khmer calendar and holy days (#7), good hours (#9), tradition switch (#12), share cards (#13, now in Khmer too), feedback (#16), sky panel (#17), lucky-date finder (#18), .ics feeds (#30), plus an owner admin and the whole site in English and Khmer.

### Still open from §3 and still worth it

| # | Feature | Total | Why now |
|---|---|---|---|
| 21 | Lunar / Gregorian / Khmer date converter | 27 | All three engines exist; a converter is mostly UI. High search volume in Khmer ("ថ្ងៃនេះ ខែអ្វី") |
| 20 | 24 solar terms with exact times | 27 | `SearchSunLongitude` is already used for Lichun; one page per term per year is evergreen |
| 19 | Today's lucky colour by weekday (Khmer/Thai custom) | 27 | Weekday colours already exist (`lib/khmer.ts`); a daily "colour to wear" line is a daily return reason in Cambodia |
| 5 | Chinese almanac day page (宜忌, officer, clash, directions) | 27 | The calendar has the data in a panel; a page per day is linkable and indexable |
| 26 | Numerology (life path, personal year) | 25 | Pure arithmetic, no birth data stored |
| 4 | Personal transits | 24 | Biggest content cost (~600 blocks per language now) |
| 8 | Family profiles, saved in the browser only | 23 | Lets the calculators remember "me, mum, my child" without accounts |

### New ideas

Numbered from #45 so they never collide with §3's #1–#44.

| # | Feature | Benefit | Accuracy | Calm-fit | Effort (5=easy) | SEO/Retention | Privacy (5=safe) | Total |
|---|---|---|---|---|---|---|---|---|
| 45 | **Printable monthly calendar** (A4, Khmer lunar dates, holy days, festivals, Chinese good days; print CSS, no PDF service) | 5 | 5 | 5 | 4 | 4 | 5 | **28** |
| 46 | **Weekly and monthly horoscopes** per sign, from the Moon's path through the week (reuses the block engine; needs new weekly blocks) | 5 | 4 | 5 | 3 | 5 | 5 | **27** |
| 47 | **Telegram channel of the daily card** (bot posts the Khmer and English share image each morning; Telegram is the main channel in Cambodia; free API, owner creates the bot) | 4 | 5 | 4 | 4 | 5 | 5 | **27** |
| 48 | **Installable web app + offline "today"** (manifest, a small service worker caching today's pages) | 4 | 5 | 5 | 4 | 4 | 5 | **27** |
| 49 | **Site search** over signs, animals, festivals and pages in both languages (static index, no service) | 4 | 5 | 5 | 4 | 3 | 5 | **26** |
| 50 | **Khmer age and Buddhist-era year tool** (BE year, Khmer animal year, sak, Khmer-reckoned age) | 4 | 5 | 5 | 5 | 4 | 5 | **28** |
| 51 | **"This week in the sky" email-free digest page** (one URL per week: phases, ingresses, holy days, festivals, good days) | 4 | 5 | 5 | 4 | 4 | 5 | **27** |
| 52 | **Owner analytics in the admin** (page views and top pages from Cloudflare Web Analytics, no cookies) | 3 | 5 | 5 | 3 | 4 | 4 | **24** |
| 53 | **Gardening by the Moon** (planting days by phase and sign) | 3 | 3 | 5 | 4 | 3 | 5 | 23 |
| 54 | **Pagoda holy-day reminders in the calendar feeds with the eve marked** (ថ្ងៃសីល eve) | 3 | 5 | 5 | 5 | 3 | 5 | 26 |
| 55 | Daily tarot | 3 | 1 | 4 | 4 | 4 | 5 | 21 — rejected again: no accuracy basis |
| 56 | AI chat about your chart | — | — | — | — | — | — | rejected: owner rule, no runtime AI |
| 57 | Wedding / house-moving good days by the Khmer calendar | — | — | — | — | — | — | rejected: owner rule, left to an achar |

### Recommended order

1. **Date converter (#21) together with the Khmer age / Buddhist-era tool (#50)** — one page, two engines already built, strongest Khmer search intent.
2. **Today's colour to wear (#19)** on the home page and the Khmer hub — a one-line daily habit.
3. **Printable monthly calendar (#45)** — Cambodian households hang monthly calendars; print CSS over the existing calendar data.
4. **Weekly horoscopes (#46)** — the largest SEO gain; content first (blocks in both languages), then the page.
5. **Telegram daily card (#47)** — needs the owner to create a bot and channel; the images already exist.
6. Then: almanac day pages and solar terms (#5, #20), installable app (#48), weekly sky digest (#51), family profiles (#8), numerology (#26), transits (#4).
