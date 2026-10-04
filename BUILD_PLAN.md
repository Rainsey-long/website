# Zodiac & Chinese Horoscope Website — Build Plan for Claude Code

> Handoff document. Read this file **and `DESIGN_SYSTEM.md`** fully before writing code. `DESIGN_SYSTEM.md` is binding for every UI change. Work phase by phase, run tests at the end of each phase, and ask the owner before changing scope, adding paid services, or adding any runtime AI.

---

## 1. Project summary

A fast, static, multilingual-ready website offering:

- Daily horoscopes for the 12 Western signs (love, career, money, mood)
- Chinese zodiac profiles, daily readings, and yearly forecasts (2027 = Fire Goat, starts 6 Feb 2027)
- Western and Chinese compatibility pages and an interactive checker
- "What's my zodiac?" calculator (Western sun/moon/rising, Chinese animal + element, lucky colors/numbers)
- Lucky/auspicious days calendar (traditional Chinese almanac)
- Southeast Asian zodiac content (Khmer, Vietnamese variants) as a differentiator

Built by a Cambodia-based owner, targeting an international English-speaking audience first, then Khmer, Vietnamese, Thai, and Chinese.

**Brand name / domain:** `[SITE_NAME]` / `[DOMAIN]` — placeholders, owner will decide. Use a single config constant so it is changed in one place.

---

## 2. Hard constraints (non-negotiable)

1. **Near-zero running cost.** Only expected cost is the domain (~$10–15/year). Use free tiers only.
2. **No runtime AI and no paid APIs.** All readings are produced by deterministic calculation + pre-written text blocks. Nothing calls an LLM at request time.
3. **Static site.** No backend server. All user calculations run client-side in the browser. Do not store users' birth data anywhere.
4. **Permissive licenses only.** Do not use Swiss Ephemeris (AGPL) or any CC-BY-NC/non-commercial data or models. Do not copy text from Wikipedia or other sites; all copy is original.
5. **Entertainment framing.** No medical, legal, or financial advice in readings. Disclaimer on every reading page footer.
6. **Mobile-first and fast.** Target Lighthouse ≥ 90 on mobile for performance, SEO, and accessibility.

---

## 3. Tech stack

| Purpose | Tool | Notes |
|---|---|---|
| Framework | Astro (static output) | Minimal client JS; islands only for interactive tools |
| Styling | Tailwind CSS | Dark mode via `class` strategy |
| Astronomy | `astronomy-engine` (MIT) | Sun/Moon/planet ecliptic longitudes, moon phase |
| Lunar calendar / BaZi / almanac | `lunar-javascript` (MIT) | Lunar dates, stems/branches, solar terms, daily 宜/忌 |
| Tests | Vitest | Required for all calculation code |
| Social/OG images | `satori` + `@resvg/resvg-js` | Generated at build time |
| Hosting | Cloudflare Pages (free) | Note limits in §10 |
| Daily rebuild | GitHub Actions cron (free) | Triggers a deploy hook each morning |
| Analytics | Cloudflare Web Analytics (free) | Privacy-friendly, no cookie banner needed for it |
| Email (Phase 6) | MailerLite free tier | Embed form only |
| Push (Phase 6) | OneSignal free tier | |
| Store (Phase 5/7) | Lemon Squeezy | Paid PDF reports, external checkout |

Verify the latest package versions and APIs at install time; pin exact versions in `package.json`.

---

## 4. Repository structure

```
/
├── astro.config.mjs
├── src/
│   ├── config/site.ts            # SITE_NAME, DOMAIN, feature flags, ad flags
│   ├── lib/
│   │   ├── western.ts            # sun sign, elements, modalities
│   │   ├── chinese.ts            # animal, element, stems/branches, compatibility
│   │   ├── sky.ts                # daily moon sign, planet signs, moon phase, retrograde flags
│   │   ├── almanac.ts            # lunar date, BaZi, daily good/bad activities
│   │   ├── sea-variants.ts       # Khmer & Vietnamese zodiac variants
│   │   ├── compatibility.ts      # scoring for Western + Chinese pairs
│   │   ├── reading-engine.ts     # assembles readings from text blocks
│   │   └── seed.ts               # deterministic hash + seeded RNG
│   ├── styles/tokens.css         # design tokens, see DESIGN_SYSTEM.md
│   ├── icons/                    # original zodiac SVG glyphs
│   ├── components/               # UI components per DESIGN_SYSTEM.md §6
│   ├── layouts/
│   └── pages/                    # routes, see §8
├── content/
│   ├── blocks/                   # reusable text blocks (JSON), see §7
│   ├── profiles/                 # sign & animal profile copy (Markdown)
│   ├── yearly/2027/              # yearly forecasts per animal (Markdown)
│   └── data/
│       ├── khmer-new-year.json   # Khmer New Year dates by year (owner verifies)
│       └── names.json            # localized sign/animal names
├── scripts/
│   ├── generate-daily.ts         # builds daily reading JSON for a date range
│   ├── generate-sky.ts           # precomputes sky data per day
│   └── generate-cards.ts         # social card images
├── tests/
└── .github/workflows/daily-build.yml
```

---

## 5. Calculation engine specification

### 5.1 Western sun sign
- Compute from the Sun's **tropical ecliptic longitude** at the birth moment using `astronomy-engine`, not fixed date tables (cusp dates shift by year). Sign index = `floor(longitude / 30)`, 0 = Aries … 11 = Pisces.
- If birth time is unknown, use 12:00 local time and flag cusp births (within ~1 day of a boundary) in the UI: "You were born on the cusp — check with your birth time."

### 5.2 Moon sign and rising sign (optional inputs: birth time + city)
- Moon sign: Moon's tropical ecliptic longitude at birth → `floor(lon / 30)`.
- Rising sign (ascendant): compute from local sidereal time, latitude, and obliquity of the ecliptic. Implement the standard ascendant formula and verify against at least 5 known reference charts in tests.
- City → lat/long/timezone: ship a small bundled JSON of major world cities (public-domain data, e.g. GeoNames cities15000 subset, which is CC-BY — include attribution) with a typeahead. No geocoding API.

### 5.3 Western elements and modalities
- Fire: Aries, Leo, Sagittarius · Earth: Taurus, Virgo, Capricorn · Air: Gemini, Libra, Aquarius · Water: Cancer, Scorpio, Pisces
- Cardinal: Aries, Cancer, Libra, Capricorn · Fixed: Taurus, Leo, Scorpio, Aquarius · Mutable: Gemini, Virgo, Sagittarius, Pisces

### 5.4 Chinese zodiac animal and element
- Order: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig.
- Stems: Jia, Yi (Wood) · Bing, Ding (Fire) · Wu, Ji (Earth) · Geng, Xin (Metal) · Ren, Gui (Water). Even stem = Yang, odd = Yin.
- For a **zodiac year** `y`: animal = `(y − 4) mod 12`, stem = `(y − 4) mod 10`, element = `floor(stem / 2)`.
- **Boundary rule:** the popular zodiac animal changes at **Lunar New Year** (get the date from `lunar-javascript`, never hardcode). The **BaZi year pillar** changes at **Lichun** (~4 Feb). Show the animal by Lunar New Year and label BaZi separately to avoid confusion.

### 5.5 Five Elements
- Generating cycle: Wood → Fire → Earth → Metal → Water → Wood
- Controlling cycle: Wood → Earth → Water → Fire → Metal → Wood
- Lucky colors: Wood green · Fire red/purple · Earth yellow/brown · Metal white/gold/silver · Water black/blue
- Lucky numbers: derive deterministically from element and animal; document the rule in code comments.

### 5.6 Chinese compatibility rule tables
- **Three Harmonies (best):** Rat–Dragon–Monkey · Ox–Snake–Rooster · Tiger–Horse–Dog · Rabbit–Goat–Pig
- **Six Harmonies (very good):** Rat–Ox · Tiger–Pig · Rabbit–Dog · Dragon–Rooster · Snake–Monkey · Horse–Goat
- **Six Clashes (challenging):** Rat–Horse · Ox–Goat · Tiger–Monkey · Rabbit–Rooster · Dragon–Dog · Snake–Pig
- **Six Harms (difficult):** Rat–Goat · Ox–Horse · Tiger–Snake · Rabbit–Dragon · Monkey–Pig · Rooster–Dog
- Same animal: neutral-to-good.
- Score: Three Harmonies 90–95, Six Harmonies 85–90, neutral 60–70, Harms 40–50, Clashes 30–40. Optionally adjust ±5 by element relationship (generating = +, controlling = −). Keep scores deterministic.

### 5.7 Western compatibility scoring
- Same element: high · Fire+Air or Earth+Water: high · Fire+Water, Earth+Air: low · Opposite signs (6 apart): "magnetic opposites" · Same modality, square (3 apart): challenging.
- Map to a 0–100 score plus sub-scores (love, friendship, work). Deterministic.

### 5.8 Daily sky data (`scripts/generate-sky.ts`)
For each date (computed at 00:00 UTC and 12:00 UTC; use the noon value for the day):
- Moon sign, moon phase name and illumination %
- Sun, Mercury, Venus, Mars sign
- Mercury/Venus/Mars retrograde flag (compare geocentric ecliptic longitude day-over-day)
- Output: `content/data/sky/YYYY.json`

### 5.9 Southeast Asian variants (`sea-variants.ts`)
- **Khmer:** same 12 animals, but the animal year changes at **Khmer New Year (mid-April)**, not Lunar New Year. Read dates from `content/data/khmer-new-year.json`. Khmer animal names (romanized, owner must verify spelling and Khmer script): Chuot, Chhlov, Khal, Thos, Rorng, Masanh, Momee, Momae, Vok, Roka, Cho, Kor.
- **Vietnamese:** Cat replaces Rabbit, Buffalo replaces Ox; year changes at Tết (= Lunar New Year).
- Calculator shows "Your animal in Chinese / Khmer / Vietnamese tradition" when results differ (e.g. births between Lunar New Year and Khmer New Year).

### 5.10 Almanac (`almanac.ts`)
Using `lunar-javascript`: lunar date, day stem/branch, daily auspicious (宜) and inauspicious (忌) activities, clash animal of the day. Translate activity terms with an English mapping table in `content/data/almanac-terms.json`.

---

## 6. Required test cases (Vitest)

| Input (local date) | Expected |
|---|---|
| 1990-03-15 | Sun: Pisces · Chinese: Metal Horse |
| 1990-01-20 | Sun: Capricorn/Aquarius cusp → Aquarius only if Sun lon ≥ 300°; Chinese: Earth Snake (before LNY 27 Jan 1990) |
| 2000-02-04 | Chinese: Earth Rabbit (LNY 2000 = 5 Feb) |
| 2026-02-16 | Chinese: Wood Snake |
| 2026-02-17 | Chinese: Fire Horse (LNY 2026) |
| 2027-02-06 | Chinese: Fire Goat (LNY 2027) |
| Rat + Dragon | Three Harmonies, score ≥ 90 |
| Rat + Horse | Six Clash, score ≤ 40 |

Also test: house calculation, seeded RNG stability (same seed → same output), Khmer variant boundary, rising sign against 5 reference charts.

---

## 7. Reading engine and content blocks

### 7.1 Daily reading algorithm
1. `house = ((moonSignIndex − sunSignIndex + 12) mod 12) + 1` (solar-sign houses).
2. House themes: 1 self · 2 money · 3 communication · 4 home · 5 romance/fun · 6 work/health routines · 7 partnerships · 8 shared resources/change · 9 travel/learning · 10 career · 11 friends/goals · 12 rest/reflection.
3. Modifiers: moon phase (new/waxing/full/waning), active retrogrades, element of the day.
4. Pick blocks per topic (love, career, money, mood) filtered by house + modifiers.
5. Seed: `hash(sign + YYYY-MM-DD)` for public pages; `hash(birthdate + YYYY-MM-DD)` for personal readings. Same seed → same reading all day.
6. Add lucky color, lucky number, and a 1–5 "energy" rating per topic, all deterministic.

### 7.2 Block format (`content/blocks/*.json`)
```json
{
  "id": "love-h7-full-01",
  "topic": "love",
  "conditions": { "house": [7], "moonPhase": ["full"] },
  "tone": "warm",
  "text": "Partnerships take centre stage today..."
}
```
- Target library size for launch: ≥ 12 houses × 4 topics × 6 variants (≈ 300 blocks) plus phase/retrograde modifier sentences (≈ 60). More variants = less repetition.
- Blocks are written once. Claude Code may draft them; the owner reviews. No runtime generation.
- Never include health diagnoses, medical advice, or specific financial actions (e.g. "buy stocks").

### 7.3 Long-form content
- 12 Western sign profiles and 12 Chinese animal profiles (personality, strengths, challenges, love, career, lucky elements) — ~800–1,200 words each, original.
- 144 Western + 144 Chinese compatibility pages: templated structure with genuinely varied text driven by the rule tables (avoid near-duplicate pages).
- 2027 Fire Goat yearly forecast for each of the 12 animals (overview, love, career, money, monthly highlights). **Must be live before November 2026.**

---

## 8. Routes and pages

| Route | Type | Notes |
|---|---|---|
| `/` | static | Sign picker, "find your sign", today's highlights |
| `/horoscope/[sign]/` | static + island | Shows today's reading client-side from bundled JSON; links to dated page |
| `/horoscope/[sign]/[yyyy-mm-dd]/` | static | Rolling window only, see §10 |
| `/zodiac/[sign]/` | static | Western profile |
| `/chinese-zodiac/[animal]/` | static | Chinese profile |
| `/chinese-zodiac/[animal]/2027/` | static | Yearly forecast |
| `/compatibility/[a]-and-[b]/` | static | 144 Western pairs (canonical alphabetical order; redirect reverse order) |
| `/chinese-compatibility/[a]-and-[b]/` | static | 144 Chinese pairs |
| `/tools/zodiac-calculator/` | island | All calculations client-side |
| `/tools/compatibility-checker/` | island | |
| `/lucky-days/[yyyy]/[mm]/` | static | Almanac calendar |
| `/southeast-asian-zodiac/` + subpages | static | Khmer & Vietnamese guides |
| `/about`, `/privacy`, `/terms`, `/disclaimer`, `/contact` | static | Required for AdSense |

---

## 9. SEO requirements
- Unique `<title>` and meta description per page; Open Graph + Twitter cards with generated images.
- Structured data: `Article` for readings/profiles, `FAQPage` where FAQs exist, `BreadcrumbList` everywhere.
- XML sitemap (split by section), `robots.txt`, canonical URLs.
- Internal linking: every sign page links to its compatibility pages, profile, yearly forecast, and today's reading.
- `hreflang` scaffolding ready for Phase 7 languages (`/en/`, `/km/`, `/vi/`, `/th/`, `/zh/`), but launch English-only at root.
- Fast: no layout shift from ad slots (reserve space).

---

## 10. Hosting limits and automation
- Cloudflare Pages free tier has a per-deployment file limit (around 20,000 files) and a monthly build limit — verify current numbers. Keep dated daily pages to a **rolling window** (e.g. last 60 days + next 2 days). Older dates redirect to the sign hub.
- `scripts/generate-daily.ts` keeps at least 365 days of reading JSON ready in `content/` (buffer), but only the window is rendered as pages.
- `.github/workflows/daily-build.yml`: cron at 17:05 UTC (00:05 in UTC+7) → regenerate window → call Cloudflare Pages deploy hook (stored as a GitHub secret).
- Fail-safe: if a day's data is missing, fall back to a seeded reading from the block library rather than a broken page.

---

## 11. Monetization hooks (build early, switch on later)
- `AdSlot` component controlled by `site.ts` flags (`ADS_ENABLED`, provider, slot IDs). Reserved fixed-height containers. Placements: below the reading, between profile sections, sidebar on desktop. Never above or inside the reading text.
- `public/ads.txt` placeholder.
- Google-certified consent banner (CMP) for EEA/UK visitors before ads go live.
- `AffiliateBox` component (zodiac jewelry, crystals, books) with `rel="sponsored nofollow"` and a disclosure line.
- "Get your full 2027 report" call-to-action linking to Lemon Squeezy (placeholder URL in config).
- Email signup and push opt-in components behind feature flags.

---

## 12. Phased execution plan

Each item is numbered so the owner can combine or reorder. Complete acceptance criteria before moving on.

### Phase 0 — Foundation (week 1)
- 0.1 Config placeholders for brand name and domain
- 0.2 Scope: English only, Western + Chinese at launch
- 0.3 Astro + Tailwind + Vitest project, GitHub repo, Cloudflare Pages connected
- 0.4 Target keyword list (owner supplies; Claude Code maps keywords to routes)
- 0.5 Legal pages: privacy, terms, disclaimer, about, contact
- 0.6 Cloudflare Web Analytics snippet
- **Done when:** blank site deploys from `main` to Cloudflare Pages.

### Phase 1 — Calculation engine (weeks 2–3)
- 1.1 Western sun sign (§5.1)
- 1.2 Chinese animal + element with Lunar New Year boundary (§5.4)
- 1.3 Moon and rising sign + bundled city data (§5.2)
- 1.4 Daily sky data script (§5.8)
- 1.5 Almanac module (§5.10)
- 1.6 Compatibility tables and scoring (§5.6, §5.7)
- 1.7 Southeast Asian variants (§5.9)
- 1.8 All tests in §6 passing
- **Done when:** `npm test` is green and sky JSON for 2026–2027 is generated.

### Phase 2 — Content system (weeks 3–5)
- 2.1 Block schema + validation script (fails build on malformed blocks)
- 2.2 Draft ≈ 360 text blocks (§7.2) for owner review
- 2.3 Reading engine with seeded RNG (§7.1)
- 2.4 24 profile pages copy
- 2.5 288 compatibility page copy (templated + varied)
- 2.6 12 yearly 2027 forecasts (**time-critical, before November 2026**)
- 2.7 `generate-daily.ts` for a full year
- 2.8 Editorial checklist in `CONTENT_GUIDELINES.md`
- **Done when:** a full year of daily readings generates with no repeated full reading for the same sign within 30 days.

### Phase 3 — Website MVP (weeks 4–6)
- 3.1 Implement `DESIGN_SYSTEM.md`: tokens (light/dark), fonts, original zodiac glyphs, all components, and the `/styleguide` page — build this first, before any page template
- 3.2 Homepage
- 3.3 Daily horoscope hub + dated pages
- 3.4 Zodiac calculator
- 3.5 Compatibility checker
- 3.6 Lucky days calendar
- 3.7 Share buttons, dark mode
- 3.8 SEO requirements (§9)
- 3.9 Lighthouse ≥ 90 mobile on key templates
- **Done when:** all routes in §8 render, pass Lighthouse targets, and pass the design review checklist in `DESIGN_SYSTEM.md` §10.

### Phase 4 — Automation and launch (week 7)
- 4.1 GitHub Actions daily rebuild (§10)
- 4.2 365-day content buffer check in CI (warn when < 60 days remain)
- 4.3 Sitemap submitted to Google Search Console and Bing Webmaster Tools (owner action; Claude Code prepares verification files)
- 4.4 Launch checklist in `LAUNCH.md`
- **Done when:** site updates itself for 3 consecutive days without manual action.

### Phase 5 — First monetization (from week 8)
- 5.1 AdSense application (owner action) once ≥ 30 quality pages are live
- 5.2 CMP consent banner
- 5.3 Enable `AdSlot` placements
- 5.4 Affiliate boxes on profile and compatibility pages
- 5.5 Lemon Squeezy store links (placeholders until products exist)

### Phase 6 — Audience and retention (months 2–4)
- 6.1 Daily social card generator (§3, satori) — one image per sign per day
- 6.2 Export folder of cards + captions ready for scheduling
- 6.3 MailerLite signup embed + daily email template
- 6.4 OneSignal web push
- 6.5 Khmer Telegram channel content export (text + card)
- 6.6 Vertical video script export for the owner's video pipeline

### Phase 7 — Expansion (months 3–6)
- 7.1 i18n: Khmer first, then Vietnamese, Thai, Chinese (owner/translators review all copy)
- 7.2 Southeast Asian zodiac guide pages
- 7.3 Paid PDF reports (yearly forecast, couple compatibility) generated from the same engine
- 7.4 Personal birth chart page (sun + moon + rising + Chinese + element)
- 7.5 Remember "my sign" in `localStorage` (wrapped in try/catch)

### Phase 8 — Scale (month 6+)
- 8.1 Switch to higher-paying ad networks when traffic qualifies
- 8.2 Analytics-driven content expansion
- 8.3 Newsletter and page sponsorship slots
- 8.4 Ad-free membership
- 8.5 Optional iOS app with daily horoscope home-screen widget (separate project)

### Fast-track option (≈ 4 weeks)
Ship only: 1.1, 1.2, 1.6, 2.4, 2.5, 2.6, 3.2, 3.4, 3.8, 4.3 — evergreen profiles, compatibility, calculator, and 2027 forecasts. Add daily horoscopes afterward.

---

## 13. Owner decisions still open
- [ ] Brand name and domain
- [ ] Full plan or fast-track
- [ ] Who reviews/edits the text blocks
- [ ] Khmer New Year dates table and Khmer spellings (native speaker verification)
- [ ] Order of additional languages

---

## 14. Working rules for Claude Code
- **All UI work follows `DESIGN_SYSTEM.md`.** No hardcoded colors, sizes, spacing, or radii. If a change needs something not covered there, update that file first (with a changelog entry), then build.
- Keep everything static; no servers, databases, or paid APIs unless the owner approves.
- Write tests before or alongside every calculation function.
- Commit per numbered item with the item number in the message (e.g. `1.2 chinese zodiac with LNY boundary`).
- When unsure about astrology conventions, choose the most widely used convention, note it in `DECISIONS.md`, and continue.
- Never copy third-party text. All copy original; cite data sources and licenses in `CREDITS.md`.
