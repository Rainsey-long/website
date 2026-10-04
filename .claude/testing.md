# Testing — definition of done

Every change, before calling it finished:

```bash
npx tsc --noEmit     # clean
npm run lint         # 0 problems (baseline)
npm run check        # contrast + design tokens + Vitest
npm run build        # validates text blocks, next build
```

| Change touches… | Also do |
|---|---|
| any UI | start `npm run build && npm start` (or `npm run dev`) and look in a real browser at 360px and 1280px, light and dark, and with tradition combinations that change the page. No preview tool? A throwaway Playwright script with `executablePath: /opt/pw-browsers/chromium-1194/chrome-linux/chrome`; delete it after |
| an engine in `lib/` | a Vitest case pinned to a **published** value (an almanac, an ephemeris table, km.wikipedia's Songkran table), not to the code's own output |
| `content/blocks` | `npm run validate:blocks` and `npm test` (the 30-day variety test) |
| `lib/seed.ts`, `lib/db.ts` | `npm run db:preflight` |
| an API route or anything taking input | live requests with curl against `next start`: success, missing Origin, oversize body, bad input, unauthenticated |
| a new component, page or visual change | dispatch the `ui-ux-designer` agent (mandatory, `role.md`) |
| auth, input handling, a trust boundary | dispatch the `security-auditor` agent (mandatory) |
| `Dockerfile`, `railway.json`, `instrumentation.ts` | cannot be verified from `next dev`; say so, and run `docs/RAILWAY.md` §7 after deploying |
| any visible text | both languages: check `/x` and `/km/x`; the Khmer page has no stray English UI text and survives the longer Khmer at 360px |
| any `.claude/*.md` or `CLAUDE.md` | every `@` import still resolves |

Before a deploy: `npm run release:check -- --build` must print GO.

No browser test framework (CamboMath stance): do not add Jest/Playwright-as-runner without asking.
