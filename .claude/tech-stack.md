# Tech stack

| Layer | Installed (exact versions in package.json) |
|---|---|
| Runtime | Node 22, npm (package-lock committed) |
| Framework | Next.js 16.3.8, React 19.2.4 — same as CamboMath |
| Styling | Tailwind CSS 4.3.3 via @tailwindcss/postcss; no tailwind.config, theme in CSS |
| Data | better-sqlite3 13 (synchronous) — the only data dependency |
| Astronomy | astronomy-engine 2.1.19 |
| Calendars | lunar-javascript 1.7.7 (server only; the browser uses lib/data/lny.json), @thyrith/momentkh 3.0.3 |
| Content | gray-matter + marked (repository Markdown only) |
| Fonts | @fontsource: Newsreader (variable + static woff for share cards), Figtree, Noto Serif Khmer, Kantumruy Pro |
| Tests | Vitest 5 (engines). No browser test runner; browser checks are throwaway Playwright scripts against the pre-installed Chromium |
| Share images | next/og ImageResponse; Khmer text shaped with harfbuzzjs 1.6.2 (WOFF fonts unpacked to SFNT in `lib/khmerShape.ts`) |

Constraints that outlive a version bump:
- **No auth library**: admin auth is hand-rolled scrypt + HMAC (CamboMath's design).
- **`lunar-javascript` must not reach the client bundle** (size). `lib/chinese.ts` reads the generated LNY table; regenerate with `npm run generate:lny`, a test asserts it matches the library.
- **momentkh is called with explicit numbers, never a Date** (its Date paths use the host zone).
- **next/og cannot shape Khmer.** Khmer in an image goes through `shapedLine()`; harfbuzzjs is in `serverExternalPackages` (it loads a wasm file at runtime).
- **Not serverless.** The database is a file; `instrumentation.ts` refuses to boot on Vercel/Netlify/Lambda/Cloud Run/Cloudflare Pages.
- Lint toolchain (eslint-config-next 16.3.0) carries 5 high npm-audit findings in dev-only glob dependencies; CamboMath carries the same. Not shipped in the image.
