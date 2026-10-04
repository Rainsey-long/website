# Design System & UI/UX Guidelines

> This file is the single source of truth for how the site looks, reads, and behaves. **Every UI change must follow it.** If a change needs something this file doesn't cover, add it here first (with a short reason in the changelog at the bottom), then build it. Never hardcode a color, font size, spacing value, or radius outside the token files.

---

## 1. Design direction: "The Modern Almanac"

### 1.1 Concept
Most horoscope sites look the same: purple galaxy gradients, glowing gold text, stock nebula photos. We deliberately avoid that.

Our direction comes from two real traditions the site combines:

- **The printed Chinese almanac** (tong shu): paper pages, black ink, cinnabar-red seal stamps marking lucky days.
- **Old celestial star atlases**: fine ink linework, circular sky charts, brass instruments.

The result should feel like **a beautifully printed daily almanac page that happens to know where the Moon is right now**: calm, trustworthy, readable, a little ceremonial, never spooky or loud.

### 1.2 Design principles
1. **Answer first.** A visitor wants their reading. Their sign's reading must be visible within one tap from any page, and above the fold on reading pages.
2. **One memorable element per page.** The **Day Dial** (see §6.1) is the signature. Everything around it stays quiet.
3. **Real data, shown honestly.** When we show the Moon's sign or a phase, it comes from the calculation engine. Never decorative fake data.
4. **Reading comfort over decoration.** Readings are text. Treat them like good book typography.
5. **Ads and offers never interrupt the reading.** They come after it, in reserved space.
6. **Warm, not mystical.** Friendly guidance, no fear, no "destiny" claims.

### 1.3 What to avoid (hard rules)
- Galaxy/nebula backgrounds, glowing text, neon gradients, sparkle animations.
- Gradient washes as decoration.
- All-caps tracked-out labels above headings.
- Identical rounded cards with the same soft shadow for every block of content.
- Accenting a single word in a headline with a different color or italic.
- Emoji used as icons in the UI.
- Stock photos of people or crystals.

---

## 2. Color tokens

Defined once in `src/styles/tokens.css` as CSS variables and mapped into Tailwind. Components use semantic names only (e.g. `bg-surface`, `text-ink`), never raw hex.

### 2.1 Base palette

| Token | Hex | Use |
|---|---|---|
| `paper` | `#F6F7F4` | Page background (light) |
| `paper-raised` | `#FFFFFF` | Raised surfaces: dial plate, inputs, menus |
| `ink` | `#1C2340` | Primary text, linework (deep indigo ink) |
| `ink-muted` | `#555C78` | Secondary text, captions |
| `rule` | `#D9DCE3` | Hairlines, borders, dividers |
| `cinnabar` | `#B8301E` | Accent: "today" markers, lucky seals, primary buttons. Use sparingly |
| `night` | `#1F2650` | Night band behind the Day Dial on the homepage; dark-mode surfaces |
| `brass` | `#A7823A` | Planet markers, moon glyph, dial ticks |
| `jade` | `#2F6E58` | Positive states: good days, high compatibility |
| `clay` | `#9A5B2E` | Caution states: challenging days, clashes |
| `rule-strong` | `#80869E` | Input borders and empty meter dots (UI elements need 3:1, `rule` is decorative only) |
| `on-accent` | `#FFFFFF` | Text and marks on cinnabar (primary button, seal) |
| `night-ink` / `night-muted` / `night-rule` | `#F3F1EA` / `#BFC3D9` / `#3A4275` | Text, secondary text and linework on the `night` band |

### 2.2 Dark mode

| Token | Hex |
|---|---|
| `paper` | `#141933` |
| `paper-raised` | `#1C2244` |
| `ink` | `#E9EAF2` |
| `ink-muted` | `#A8ADC6` |
| `rule` | `#2E355E` |
| `cinnabar` | `#E0563F` |
| `brass` | `#CFA75A` |
| `jade` | `#5FB08F` |
| `clay` | `#D18A5A` |
| `rule-strong` | `#6C739A` |
| `on-accent` | `#141933` |
| `night` | `#10142B` |

- Cinnabar text appears only on `paper`; on `paper-raised` in dark mode it reaches 4.09:1, so there cinnabar is used for rings and seals only (3:1 UI contrast).
- `.theme-light` / `.theme-dark` classes apply either palette to a subtree (used by `/styleguide` to show both side by side).

- Respect `prefers-color-scheme`, plus a manual toggle stored in `localStorage` (wrapped in try/catch) and applied as `data-theme` on `<html>` before first paint (inline script, no flash).
- All text/background pairs must meet **WCAG AA** (4.5:1 body text, 3:1 large text and UI elements). Add a contrast test script that checks every token pair used for text.

### 2.3 Element colors (for zodiac elements only)
Used as small swatches and glyph tints, never as large backgrounds.

| Element | Light | Dark |
|---|---|---|
| Fire | `#B8301E` | `#E0563F` |
| Earth | `#9A5B2E` | `#D18A5A` |
| Air / Metal | `#6B7390` | `#B9BFD6` |
| Water | `#2B5C8A` | `#6FA3D6` |
| Wood | `#2F6E58` | `#5FB08F` |

---

## 3. Typography

### 3.1 Typefaces
All from Google Fonts (SIL Open Font License), **self-hosted** via `@fontsource` packages. No requests to external font CDNs.

| Role | Family | Notes |
|---|---|---|
| Display + reading text | **Newsreader** (variable, optical size axis) | Headings, readings, profiles. Book-like and warm |
| UI text | **Figtree** | Buttons, labels, navigation, form fields, small data |
| Khmer | **Noto Serif Khmer** (reading), **Kantumruy Pro** (UI) | Loaded only on `/km/` pages |
| Thai | **Noto Serif Thai** / **Noto Sans Thai** | Loaded only on `/th/` |
| Chinese | System stack: `"PingFang SC", "Noto Serif SC", "Source Han Serif SC", serif` | Do not ship CJK webfonts (too heavy) |

- Subset Latin fonts to Latin + Latin Extended + Vietnamese.
- Max **2 font families per page** in any one language. Preload only the regular weight of each.
- `font-display: swap` with size-adjusted fallbacks to prevent layout shift.

### 3.2 Type scale (mobile → desktop)

| Token | Mobile | Desktop | Family / weight | Use |
|---|---|---|---|---|
| `display` | 40px / 1.05 | 64px / 1.0 | Newsreader 500, opsz max | Page hero (sign name, date) |
| `h1` | 32px / 1.15 | 44px / 1.1 | Newsreader 500 | Page title |
| `h2` | 24px / 1.25 | 30px / 1.2 | Newsreader 500 | Section titles |
| `h3` | 19px / 1.3 | 22px / 1.3 | Newsreader 600 | Topic titles (Love, Career…) |
| `reading` | 18px / 1.65 | 19px / 1.7 | Newsreader 400 | Reading and profile body text |
| `body` | 16px / 1.5 | 16px / 1.5 | Figtree 400 | UI copy, descriptions |
| `small` | 14px / 1.45 | 14px / 1.45 | Figtree 500 | Captions, metadata, legal |

- Reading text line length: **max 66ch**, left aligned, never justified.
- Headings use sentence case. Never all caps.
- Khmer text gets +0.15 extra line-height (taller script).
- Numbers in data (scores, dates, degrees) use `font-variant-numeric: tabular-nums`.

---

## 4. Layout, spacing, shape

### 4.1 Spacing scale (4px base)
`0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128` → tokens `space-0` … `space-10`. No other values.

### 4.2 Grid
- Mobile-first. Breakpoints: `sm 480`, `md 768`, `lg 1024`, `xl 1280`.
- Page container: max 1120px, side padding 16px (mobile) / 24px (md+).
- **Reading column:** max 66ch, left aligned. On `lg+`, an optional 300px right rail holds related links and one ad slot; the reading column never moves.
- Respect safe areas: `viewport-fit=cover` and `env(safe-area-inset-*)` padding on fixed/sticky elements.

### 4.3 Shape
- Radius tokens: `radius-sm 4px` (inputs, buttons, small swatches), `radius-full` (sign chips, toggles, the dial). No other radii.
- Borders: 1px `rule`. Emphasis uses a 2px `ink` or `cinnabar` rule, not shadows.
- Shadows: only one, `shadow-lift` (`0 1px 2px rgba(28,35,64,.08), 0 8px 24px rgba(28,35,64,.08)`), used for menus, popovers, and the dial plate. Content sections have no shadow.
- Sections are separated by space and hairline rules, like a printed page, not boxed into cards.

### 4.4 Iconography
- **Zodiac glyphs:** 12 Western + 12 Chinese animals, drawn as **original** SVG line art: 24×24 grid, 1.5px stroke, round caps, `currentColor`. Stored in `src/icons/`. One consistent hand; never mix icon styles.
- UI icons: Lucide (ISC license), 1.5px stroke to match.
- Every icon that carries meaning has an accessible label; decorative icons get `aria-hidden="true"`.

---

## 5. Motion
- Default: none. The page should feel still and printed.
- **One orchestrated moment:** on the homepage and reading pages, the Day Dial's Moon marker eases into today's position once on load (600ms, ease-out). That's the only automatic motion.
- Motion responding to user action is fine when it shows what changed: accordion open (150ms), sign switch crossfade (150ms), toast enter (200ms).
- No hover animations on content. Hover = underline or color change only.
- `prefers-reduced-motion: reduce` → all motion off, final state shown immediately.

---

## 6. Components

All components live in `src/components/`, use tokens only, and are documented here. New component = add a section here first.

### 6.1 DayDial (signature element)
A circular sky chart: the 12-sign wheel as a fine ink ring with glyphs, tick marks in `brass`, and markers for today's Moon (phase-accurate moon glyph) and Sun. The visitor's sign (if chosen) is ringed in `cinnabar`.
- Data from `sky.ts`; never decorative.
- Static SVG rendered at build time; only the load easing is client-side.
- Sizes: 280px mobile, 360px desktop. Below it, one line of plain text: "The Moon is in Scorpio today, waxing gibbous." (also the accessible description).
- Tapping a sign on the dial navigates to that sign's reading.

### 6.2 SignPicker
Grid of 12 SignChips (4×3 on mobile, 6×2 on desktop). Each chip: glyph, name, date range in `small`. Selected chip: `cinnabar` ring. Tap target ≥ 48×48px. A "Find my sign" text link opens the calculator.

### 6.3 ReadingSection
- Header: sign glyph + sign name (`display`) + date (`small`, `ink-muted`), with previous/next day links.
- Four topics in fixed order: **Love, Career, Money, Mood**. Each: `h3` title, EnergyMeter, 2–4 sentences in `reading` style.
- Separated by hairline rules, not cards.
- Ends with the LuckyRow.

### 6.4 EnergyMeter
Five small circles; filled count = rating (1–5). Filled `ink`, empty `rule` outline. Text alternative: "Energy 4 of 5". No percentages or progress bars.

### 6.5 LuckyRow
Almanac-style strip: lucky color (swatch + name), lucky number, and lucky hour. On days the almanac marks as auspicious, a small round **cinnabar seal stamp** glyph appears with the label "Good day for…". The seal is the only place cinnabar appears as a filled shape.

### 6.6 CompatibilityResult
- Two glyphs facing each other with the relationship name between them (e.g. "Three Harmonies", "Opposites attract").
- Score shown as a large tabular number in Newsreader (e.g. "92") with the label "match" in `small`.
- Sub-scores (love, friendship, work) as EnergyMeters.
- Color only reinforces meaning (`jade` high, `clay` low); the label always says it in words.

### 6.7 Calculator form
- Fields: birth date (required), birth time (optional, with "I don't know" checkbox), birth city (optional, typeahead from bundled data).
- Native `<input type="date">` and `<input type="time">` for best mobile UX; labels always visible above fields (no placeholder-only labels).
- Primary button: "Show my signs". Results appear below the form on the same page and the page scrolls to them; the form stays editable.
- Cusp notice in a quiet bordered note when relevant.
- Errors: inline under the field, specific ("Enter a date between 1900 and today.").

### 6.8 AlmanacCalendar
Month grid, Monday-first, tabular numerals. Each day: Gregorian number large, lunar date small. Good days get the seal glyph; challenging days a small `clay` dot. Today outlined in `cinnabar`. Tapping a day opens a detail panel (good for / avoid / clash animal). Fully keyboard navigable (arrow keys).

### 6.9 Buttons and links
- Primary: `cinnabar` background, white Figtree 600, `radius-sm`, min height 48px. One primary button per view.
- Secondary: 1px `ink` border, transparent background.
- Text links: `ink` with underline (1px, offset 3px); hover thickens underline. No "→" arrows appended to labels.
- Labels say exactly what happens: "Show my signs", "Check compatibility", "Read tomorrow".

### 6.10 Header, navigation, footer
- Header: wordmark (left), nav (Horoscopes, Chinese zodiac, Compatibility, Lucky days), theme toggle, language switch. On mobile: wordmark + menu button opening a full-height sheet.
- "My sign" shortcut appears in the header once a sign is remembered.
- Footer: section links, legal pages, disclaimer line: "For entertainment and reflection. Not medical, legal, or financial advice."

### 6.11 AdSlot
- Reserved fixed-height container (mobile 280px, desktop rail 600px, in-content 250px) so ads never shift layout.
- Tiny "Advertisement" label in `small`, `ink-muted`.
- Allowed positions: after the reading, between profile sections (max one per 600 words), desktop right rail. **Never** above the reading, inside a topic, inside forms, or as popups, interstitials, or sticky overlays covering content.
- Max 3 ad slots per page.

### 6.12 AffiliateBox and offers
Quiet bordered block, 1 image max (product photo from the affiliate program), short honest description, button "View on Etsy" / "View on Amazon", and a disclosure line. Max one per page. Paid report promos use the same pattern.

### 6.13 Share
Native Web Share API on mobile; fallback buttons (copy link, Facebook, X, Telegram, WhatsApp). Shared links carry an OG image generated per sign and day in the same visual style.

### 6.14 Toasts, empty and error states
- Toasts: bottom center, auto-dismiss 4s, describe what happened ("Sign saved").
- Empty states give a next step ("Pick your sign to see today's reading").
- 404: "This page doesn't exist. Pick your sign below." + SignPicker.
- Errors never apologize; they say what happened and what to do.

### 6.15 HoursList (good hours)
A plain list, one row per hour: time range (tabular), the hour's name, and a short label in words ("Good hour" / "Quiet hour"). Good Chinese hours carry the small seal glyph, never a filled colour bar. The current hour is outlined in `cinnabar` (1px, `radius-sm`) and marked "Now" in text. No progress bars, no timeline graphics: the times are the information.

### 6.16 BirthChartWheel
A natal chart drawn in the DayDial's hand (§6.1): fine ink sign ring with glyphs, brass ticks, planets as planet glyphs on an inner ring, aspect lines in the centre (`rule-strong` for trine/sextile, `ink-muted` dashed for square/opposition; never red or green), and the ascendant on the left as a longer ink axis. Without a birth time the wheel starts at 0° Aries and draws no axis. Planets closer than 7° are stepped inwards so glyphs never overlap. Sizes as the DayDial. The wheel is decorative for screen readers; the same data is in the placements list below it (`aria-describedby`).

### 6.17 Finder form (lucky-date finder)
A GET form so results have a shareable URL and work without JavaScript: occasion (select), start month (month input), length (select: 1, 3 or 6 months), and up to two "people born in the Year of …" selects. Results: a list of dates (full date, day pillar, why: matched terms, officer, spirit), never a ranking or a score. Empty result: say so and offer the next longer range.

---

## 7. Page templates (wireframes)

### 7.1 Homepage
```
[Header]
─────────────────────────────────────────────
 NIGHT BAND
   Today, 5 October 2026
   ( DayDial )
   The Moon is in Scorpio today, waxing gibbous.
─────────────────────────────────────────────
 Pick your sign
 [♈][♉][♊][♋]
 [♌][♍][♎][♏]
 [♐][♑][♒][♓]      Find my sign
─────────────────────────────────────────────
 Chinese zodiac: 12 animal chips (same pattern)
─────────────────────────────────────────────
 Today's lucky day strip (LuckyRow, general)
─────────────────────────────────────────────
 2027 Year of the Fire Goat → forecasts by animal
 Popular compatibility pairs (text list)
[Footer]
```

### 7.2 Daily reading
```
[Header]
 ‹ Yesterday            Tomorrow ›
 ♏ Scorpio              (display)
 Sunday, 5 October 2026 (small)
 [small DayDial, sign ringed]   ← right of title on desktop
 ──────────
 Love      ●●●●○
 reading text…
 ──────────
 Career    ●●●○○
 ──────────
 Money     ●●○○○
 ──────────
 Mood      ●●●●●
 ──────────
 LuckyRow (+ seal if auspicious)
 Share
 [AdSlot]
 Related: Scorpio profile · compatibility · 2027 forecast
[Footer]
```
(The middle-dot list above is a wireframe shorthand; build it as a proper link list.)

### 7.3 Calculator
Form at top → results below: Western (sun, moon, rising), Chinese (animal, element, yin/yang), Southeast Asian variants note, lucky colors and numbers, links to readings and compatibility.

### 7.4 Compatibility pair page
CompatibilityResult at top → "How these signs connect" → strengths → challenges → advice → checker to try another pair → related pairs.

### 7.5 Yearly forecast
Animal glyph + "Rat in the year of the Fire Goat" → overview → love, career, money, health-free wellbeing → month-by-month list (12 short entries, real sequence, so numbered months are fine) → paid report offer → related animals.

### 7.6 Lucky days
Month heading with previous/next → AlmanacCalendar → selected day detail → how the almanac works (short explainer).

---

## 8. UX rules
1. **Remember the visitor's sign** (localStorage, try/catch). Homepage then shows "Your reading today" first, with an option to change sign.
2. **Navigation depth:** any reading reachable in ≤ 2 taps from the homepage.
3. **No sign-up walls.** Everything readable without an account. Email and push are optional invitations shown after the reading, once per visit at most.
4. **No dark patterns:** no fake countdowns, no pre-ticked boxes, no "you won't believe" copy, no exit popups.
5. **Dates** always written out in the page's language ("5 October 2026"); use the visitor's local date for "today".
6. **Performance budgets** (per page): JS ≤ 50 KB gzipped, CSS ≤ 30 KB, LCP < 2.0s and CLS < 0.05 on a mid-range phone (4G). Fail CI on regression.
7. **Accessibility:** WCAG 2.2 AA. Semantic HTML, one `h1` per page, visible focus ring (2px `cinnabar` outline, 2px offset), full keyboard support, tap targets ≥ 44px, `lang` attribute per page and per mixed-language span, alt text for every meaningful image.
8. **Internationalization ready:** no text baked into images or SVGs (except glyphs); all strings in locale files; layouts must survive 40% longer text (Khmer, Vietnamese) without breaking.

---

## 9. Voice and copy
- Warm, plain, encouraging. Second person ("you"). Sentence case everywhere.
- Short sentences. One idea per sentence in readings.
- Suggest, don't predict doom: "A good day to talk things through" rather than "Disaster awaits".
- No health diagnoses, no specific financial actions, no claims of certainty or guaranteed outcomes.
- Use the same name for a thing everywhere ("Lucky days", not "Auspicious calendar" in one place and "Lucky days" in another).
- Microcopy examples:
  - Button: "Show my signs" · "Check compatibility" · "Read tomorrow"
  - Toast: "Sign saved" · "Link copied"
  - Error: "Enter a date between 1900 and today."

---

## 10. Implementation rules for Claude Code
1. Tokens live in `src/styles/tokens.css` (CSS variables, light + dark) and are mapped in `tailwind.config` under semantic names. Disable Tailwind's default color palette so raw colors can't be used.
2. No hardcoded hex, px font sizes, spacing, or radius in components. Lint rule or CI grep to enforce.
3. Build a `/styleguide` page (excluded from sitemap, `noindex`) showing every token and component in light and dark mode. Update it whenever a component changes.
4. Each component: props documented in a comment block, works in both themes, keyboard accessible, tested at 360px and 1280px width.
5. **Design review checklist** before merging any UI change:
   - [ ] Uses only tokens and documented components
   - [ ] Matches the relevant wireframe in §7
   - [ ] Light and dark mode checked
   - [ ] 360px mobile and desktop checked
   - [ ] Keyboard and screen reader basics checked
   - [ ] Reduced motion respected
   - [ ] No layout shift from fonts or ad slots
   - [ ] Copy follows §9
   - [ ] Nothing from §1.3 "What to avoid"
6. If a requested change conflicts with this file, stop and ask the owner. If approved, update this file first, add a changelog entry, then implement.

---

## 11. Changelog
| Date | Change | Reason |
|---|---|---|
| 2026-10-04 | Initial design system | Project start |
| 2026-10-04 | Added `rule-strong`, `on-accent`, `night-ink`, `night-muted`, `night-rule`; dark `night` set to `#10142B` | `rule` fails 3:1 for inputs and meter outlines; white on dark-mode cinnabar is 3.6:1, so dark mode uses `paper` on cinnabar; the night band needs its own text colours to stay AA in both themes |
| 2026-10-04 | Non-spacing size tokens in `tokens.css` (`--size-page`, `--size-reading`, `--size-rail`, `--size-dial(-small)`, `--size-tap`, `--size-glyph(-lg)`, ad heights) | Dial, column and ad dimensions need one home so components never hardcode them |
| 2026-10-04 | Tailwind 4 has no `tailwind.config`; tokens are mapped in `src/styles/global.css` under `@theme inline`, with every default namespace reset to `initial`. Spacing utilities `p-0`…`p-10` map to `space-0`…`space-10` | §10.1 assumed Tailwind 3. Same intent: raw colours and off-scale sizes cannot be used |
| 2026-10-04 | Language switch omitted from the header until Phase 7 | English is the only language at launch; a switch with one option is noise. `hreflang` scaffolding is in place |
| 2026-10-04 | Calendar day cells show lunar day in `small`; the first day of a lunar month shows `M8` (month 8) | A lone "1" reads as Gregorian; marking the month start is how printed almanacs do it |
| 2026-10-04 | Khmer weekday colour tokens `kh-sun` … `kh-sat`, used only as swatches with a 1px `rule-strong` border and a text label | Khmer birth-day colours are a tradition fact; ripe yellow cannot reach 3:1 on paper, so the border carries the shape and the label the meaning |
| 2026-10-04 | Khmer faces (Noto Serif Khmer for reading, Kantumruy Pro for UI) load on every page, limited to the Khmer unicode-range | Khmer script now appears inline in English pages (Khmer traditions); the unicode-range means the files download only where Khmer text is present |
| 2026-10-04 | Calendar marks: brass ring = Buddhist holy day (ថ្ងៃសីល), alongside the cinnabar seal and clay dot | The Khmer calendar needs its own mark; brass is already the "sky" colour and stays distinct from cinnabar |
| 2026-10-04 | Header gains a "Traditions" control (Western / Chinese / Khmer, at least one on) | Owner: the visitor decides which traditions the site shows |
| 2026-10-04 | `MoonGlyph` (small phase moon), `SkyPanel` ("the sky behind this reading" disclosure) | Moon calendar and reading transparency features |
| 2026-10-04 | Nav adds "Khmer" and "Sky"; footer regrouped (Readings, Calendars, Tools, About) | New sections |
| 2026-10-04 | Added HoursList (§6.15), BirthChartWheel (§6.16), Finder form (§6.17), and planet glyphs in `lib/glyphs.ts` | Good hours, birth chart and lucky-date finder from the scored feature research |
