# Project memory (committed, so it survives cloud containers)

Cloud sessions start in a fresh container: nothing outside git survives. This file is the memory that does. Keep it under 3 KB: one line per lesson, newest first, each one something that cost real time and is not already obvious from the code or another doc. History of what each session did: `.claude/memory/sessions.md` (read on demand). Add to both at the end of a session.

## Lessons that cost time

- **A palette class (`.theme-light`) must only set colours.** Type and size tokens on `:root` only, or the class resets the type scale and the Khmer line heights.
- **Printing in dark mode:** set `color-scheme: light` on html in `@media print`, or the canvas prints dark around a light sheet.
- **Shared server state goes on `globalThis`.** Next bundles each route separately; a module-level cache or DB handle is a different copy per route (an admin edit never reached the pages).
- **gray-matter evals `---js` front matter.** Always pass `GM_YAML_ONLY` (lib/content.ts); passing only a yaml engine is not enough (it merges over the built-ins).
- **next/og (satori) cannot shape Khmer.** Use `shapedLine()` (lib/khmerShape.ts, HarfBuzz). Plain Khmer text in an image shows coeng marks and misplaced vowels.
- **Proxy redirects need an absolute Location** (Next 500s on a relative one). Build it from NEXT_PUBLIC_SITE_URL, never from Host.
- **`.gitignore` patterns without a leading `/` match at every depth.** `data/` hid `content/data` and `lib/data`; the runtime dir is `/data/`. `.env*` hid `.env.example` until `!.env.example`.
- **Parallel agents in one tree:** give each a disjoint file list, forbid commits/builds, and commit per finished group by explicit paths. A build by one agent restarts the server under another's browser check.
- **Restarting the server:** `fuser -k 3000/tcp`, then `setsid nohup npm start &`. `pkill -f "next start"` kills the calling shell.
- **Browser checks:** playwright-core is not a dependency; install it in the scratchpad (`npm i playwright-core@1.56`) and launch `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- **The design token guard rejects off-scale values** (e.g. a 2px gap); use the 4px scale.
- **Translators:** an agent writing Khmer must not edit `docs/KHMER-REVIEW.md` or other shared files; the parent collects their review lists.
- **Local dev DB has a "Test entry" Songkran override for 2027** (data/, never committed); the auto-mode classifier refused deleting it.

## Where things are decided

`DECISIONS.md` (why), `.claude/system-state.md` (what is true now), `docs/I18N.md` (bilingual rules), `docs/research/FEATURES.md` (scored ideas), commit messages (the why of each change).
