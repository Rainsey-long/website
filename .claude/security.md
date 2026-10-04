# Security

## Identities

| Layer | Mechanism | Grants |
|---|---|---|
| **Admin** | username + scrypt password (`lib/auth.ts`), HMAC-signed `al_session` cookie (`__Host-` in production, httpOnly, SameSite=Strict, 8 h) | `/admin`: review reading text, Songkran override, read feedback |
| **Visitor** | nothing. No accounts, ever (owner rule) | everything public |

**`getSession()` re-reads the users row on every call** and refuses a token whose `session_epoch` no longer matches, so sign-out (which bumps the epoch) revokes every copy of the token. It denies on a database error. Token readers refuse a non-base64url body before the MAC check. The password floor is `ADMIN_PASSWORD_MIN` (12), checked wherever a password is set.

## Visitor privacy (the promise on /privacy — keep it true)

- Birth date, time and city in the calculator are computed **in the browser** and never sent. A change that posts them anywhere is a privacy regression.
- Remembered sign and theme: localStorage only. Cookies: `traditions` (which traditions to show) and `tz` (IANA zone name, validated by `isValidZone`). Neither identifies anyone.
- Feedback stores page, verdict, block ids, an optional comment (500 chars, control characters stripped). No IP, no identifier.

## Rules for every request handler

1. **Auth first.** Admin routes call `getSession()` before reading the body or touching the database.
2. **Same-origin on every state change** (`sameOrigin()` in `lib/http.ts`): Origin must match the site, the Host header or X-Forwarded-Host.
3. **Cap the RAW body before parsing** (`readJsonCapped`). `next.config.ts` also bounds proxy body buffering at 1 MB.
4. **Rate limits: global ceiling first, then per caller** (`lib/rateLimit.ts`, CamboMath's). `clientIp()` is only trustworthy with `TRUSTED_PROXY_HOPS` set; until then the global ceiling is the limit that holds.
5. **Login:** per-IP and per-username buckets are PEEKED before authenticating and COUNTED only on failure; a correct password always succeeds and resets both. A username limit that refuses correct credentials is a lock-out primitive.
6. **Parameterised SQL only.** The admin dashboard's few dynamic SQL fragments are fixed strings chosen by code, never request text.
7. **Generic errors out, details to the log.**
8. **Cron routes** (`/api/cron/backup`): `Bearer` secret ≥ 32 chars compared with `timingSafeEqual` after a length check, before any work; 503 when unset; 409 while running. A new cron route gets its own secret.
9. **HTML rendering:** only repository Markdown (`lib/content.ts`) is rendered as HTML. Owner-edited block text and feedback are rendered as React text.
10. **`proxy.ts` makes no network call**, ever. Header and path work only.

## Headers (`next.config.ts`)

CSP (`script-src` keeps `'unsafe-inline'`: the App Router streams inline scripts and removing it silently kills hydration; widen it only for Cloudflare Web Analytics), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` (device and ad-interest APIs off), COOP, HSTS without `preload` (owner decision). `/api` and `/admin` carry `X-Robots-Tag: noindex`. Named AI-training crawlers get 403 from `proxy.ts` (`lib/aiBots.ts`, toggle `FEATURES.BLOCK_AI_CRAWLERS`), except on `/robots.txt`.

Mandatory: dispatch the `security-auditor` agent for any change to auth, input handling or a trust boundary (`role.md`).
