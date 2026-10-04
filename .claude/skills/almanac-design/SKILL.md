---
name: almanac-design
description: Design work on this horoscope and almanac site — designing or auditing a page, adding a component, a chart or calendar, or any change to layout, typography, colour, density or motion. Use for "design this page", "audit the UI", "make this cleaner", "add a calendar view". Carries the site's design system so a session does not re-derive it; DESIGN_SYSTEM.md stays the binding source.
---

# The Modern Almanac — working design brief

Read `DESIGN_SYSTEM.md` before changing anything; this skill is the short form and the checklist.

## The idea

A beautifully printed daily almanac page that happens to know where the Moon is: paper, ink, a cinnabar seal for good days, fine star-atlas linework. Calm, readable, a little ceremonial. Never spooky, loud or "mystical".

## Hard rules

1. **Tokens only.** Colours, type sizes, spacing (4px scale: `p-1`=4 … `p-10`=128), radii (`rounded-sm` 4px, `rounded-full`), one shadow (`shadow-lift`, menus/popovers/dial only). `npm run check:tokens` and `npm run check:contrast` enforce it.
2. **Space and hairlines, not cards.** Sections separate with `border-t border-rule` and space; emphasis is a 2px ink or cinnabar rule.
3. **One memorable element per page**: the DayDial. Everything else quiet.
4. **Type**: Newsreader for display and reading (`text-reading`, max 66ch, left aligned); Figtree for UI. Sentence case. Khmer in Noto Serif Khmer / Kantumruy Pro with `lang="km"` (+0.15 line-height).
5. **Cinnabar sparingly**: primary button (one per view), today outline, selected ring, the seal (the only filled cinnabar shape).
6. **Colour never alone**: a label always says what jade/clay or a swatch means.
7. **Motion**: only the Moon's 600ms ease on load, and responses to a tap (≤200ms). Everything off under reduced motion.
8. **Never**: gradients as decoration, glow, sparkle, emoji icons, all-caps eyebrows, accent words, stock photos.
9. **Tap targets ≥ 48px** (`min-h-tap`, `size-tap`); visible 2px cinnabar focus ring.

## Patterns that already exist — reuse them

| Need | Use |
|---|---|
| sign/animal grid | `ChipGrid` |
| a rating | `EnergyMeter` (five dots, text alternative) |
| lucky facts strip | `LuckyRow` |
| a day grid | `client/AlmanacCalendar` (roving tabindex, detail panel) |
| a Khmer date | `khmer/KhmerDayCard`; an angel: `khmer/AngelCard` |
| a moon phase | `MoonGlyph` |
| computed facts behind a reading | `SkyPanel` (a `<details>` disclosure) |
| long-form Markdown | `Prose` |
| question list | `Faq` (native `<details>`) |

## Audiences and the tradition switch

Every page must read well with any non-empty combination of Western / Chinese / Khmer. When only Khmer is on, Khmer content leads; don't leave an empty band or a heading with nothing under it.

## Before you call it done

360px and 1280px · light and dark · each tradition combination the page reacts to · keyboard · reduced motion · no layout shift · copy follows DESIGN_SYSTEM.md §9 · nothing from §1.3. Then dispatch `ui-ux-designer` (mandatory for visible changes).
