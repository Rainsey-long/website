# Decisions

Conventions chosen where the plan left room (BUILD_PLAN.md §14: "choose the most widely used convention, note it here").

| Area | Decision | Why |
|---|---|---|
| Branch | Site lives on the orphan branch `claude/zodiac-site` of this repo | `master` holds an unrelated 2018 Flutter docs site; an orphan branch keeps the histories apart |
| Framework | Astro 7 static output, Tailwind 4 via `@tailwindcss/vite` | Plan §3. Tailwind 4 configures in CSS, so tokens map in `src/styles/global.css` (see DESIGN_SYSTEM.md changelog) |
| Zodiac | Tropical zodiac, Sun's apparent longitude of date | Most widely used Western convention |
| Unknown birth time | Noon in the birth city's zone, or the browser's zone when no city | Plan §5.1. Cusp flagged within 1° of a boundary (≈ 1 day) |
| Moon sign without a time | Moon at noon; flagged "uncertain" when it changes sign that day | Honest about the 2.5-day Moon transit |
| Houses | Solar-sign houses for daily readings (plan §7.1) | Readings are per sign, not per chart |
| Rising sign | `ASC = atan2(cos RAMC, −(sin ε tan φ + cos ε sin RAMC))`, mean obliquity, GAST from astronomy-engine | Standard formula; tests check the London table of houses and that the point sits on the eastern horizon for 5 charts |
| Lunar New Year in the browser | Table 1900–2100 generated from lunar-javascript (`src/data/lny.json`) | Keeps the calculator at ~20 KB gzipped instead of shipping the library; a test asserts table = library |
| BaZi year | Turns when the Sun reaches 315° (Lichun), computed with astronomy-engine | Same rule lunar-javascript uses; shown separately from the popular animal |
| Western pair scores | Same element 84–92, complementary 80–88, opposites 72–82, same sign 70–80, other 58–68, square 42–54, fire/water and earth/air 38–50 | Plan §5.7 bands; exact number picked deterministically per pair |
| Chinese element adjustment | ±3 by branch element, clamped inside the relation's band | Plan §5.6 allows ±5; clamping keeps the label and the number consistent |
| Lucky numbers | He Tu pairing by element (water 1/6, fire 2/7, wood 3/8, metal 4/9, earth 5/0) + animal branch number | Traditional and deterministic (`src/lib/chinese.ts`) |
| Almanac day quality | Good = auspicious day spirit (黄道); challenging = inauspicious spirit **and** officer 破/危/闭 or 诸事不宜; else ordinary | Keeps "challenging" for genuinely marked days instead of half the month |
| Almanac terms | Medical and catch-all terms (治病, 求医, 针灸, 探病, 馀事勿取, 诸事不宜, 无) hidden | No health advice (DESIGN_SYSTEM.md §9) |
| Daily reading variety | Base block index `(seed + a·lap + b·dayInStay) mod 3` with per-topic (a, b) | Guarantees no full reading repeats for a sign within 30 days; tested over a year |
| Daily pages | 60 days back + 2 ahead rendered; older dated URLs hit the 404 page, which forwards to the sign hub | Cloudflare `_redirects` splats would also catch pages that exist |
| Daily buffer | `content/data/daily/` regenerated in CI, git-ignored | Deterministic output; committing 6 MB of JSON daily adds churn with no information |
| "Today" | Build date (UTC) for static HTML; hub pages carry yesterday/today/tomorrow and pick by the visitor's local date | Design system §8.5 |
| Khmer New Year | Draft table 2016–2028, fallback 14 April, marked unverified | Owner verifies (plan §13) |
| City data | 124 hand-picked major cities with IANA zones, no external dataset | Avoids the CC-BY attribution chain of GeoNames for now; extend as needed |
| Ads, affiliates, report CTA, email, push | Components built, flags off in `src/config/site.ts` | Plan §11: build early, switch on later |
