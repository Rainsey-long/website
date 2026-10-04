# Zodiac almanac site

Daily horoscopes, Chinese zodiac, the 2027 Fire Goat forecast, compatibility and lucky days. A static Astro site with every calculation done at build time or in the browser.

Read **BUILD_PLAN.md** and **DESIGN_SYSTEM.md** before changing anything. DESIGN_SYSTEM.md is binding for UI work.

```bash
npm install
npm run dev          # http://localhost:4321
npm test             # calculation engine tests (Vitest)
npm run check        # contrast + design-token guard + tests
npm run build        # validates text blocks, builds ~1,000 pages to dist/
```

| Where | What |
|---|---|
| `src/config/site.ts` | Brand, domain, feature flags (ads, affiliates, report, email, push) |
| `src/lib/` | Engine: `western`, `chinese`, `sky`, `almanac`, `sea-variants`, `compatibility`, `reading-engine`, `calculator`, `seed` |
| `src/styles/tokens.css` | The only place raw design values live |
| `src/icons/glyphs.ts` | Original zodiac glyphs and redrawn UI icons |
| `src/components/` | Components documented in DESIGN_SYSTEM.md §6 |
| `content/` | Text blocks, profiles, 2027 forecasts, almanac terms, Khmer New Year table |
| `scripts/` | Generators (sky, daily buffer, LNY table), validators, contrast and token checks |
| `/styleguide/` | Every token and component in light and dark (noindex) |

See DECISIONS.md for conventions, CREDITS.md for licences, CONTENT_GUIDELINES.md for the editorial checklist, LAUNCH.md for go-live steps.
