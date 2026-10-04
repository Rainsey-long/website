# Error handling — failure modes actually hit here

- **API routes never leak.** `console.error(err)` server-side, a generic message out. Classify: 400 bad input, 401 no session, 403 cross-origin, 404 unknown, 409 busy, 413 too large, 429 limited, 503 not configured, 507 disk low.
- **A page that cannot find its data degrades, never throws.** Missing Markdown → short fallback text; a database error reading the Songkran override → the calculated moment (`lib/songkranStore.ts`).
- **Hydration**: anything from `Date.now()`, `localStorage`, `location` or `matchMedia` is read through `useSyncExternalStore` with a server snapshot (see `HubDayPicker`, `HeaderControls`), never in render or a `useState` initialiser. React's lint flags `setState` in an effect; use the store pattern instead.
- **Route-bundled module state**: a cache or connection held in a module variable is per-route in a Next build. Shared state goes on `globalThis` (`lib/db.ts`, `lib/blockText.ts`, `lib/seed.ts`).
- **Memo keys must be bounded.** Never key a memo on the current instant (found in `/sky`: one entry per request). Align keys to days/months; `lib/skyEvents.ts` also caps its memo.
- **Error boundaries**: `app/error.tsx` (says what happened and what to do, never apologises), `app/not-found.tsx` (sign picker).
- **Boot refusals are features.** `instrumentation.ts` refuses production without `AUTH_SECRET`, on serverless hosts, or with the dev admin password. Fix the cause, never the check.
