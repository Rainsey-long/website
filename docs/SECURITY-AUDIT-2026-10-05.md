# Security audit, 2026-10-05

A full audit by the `security-auditor` agent after two changes: English only (the Khmer language layer stripped from ~220 files) and Google AdSense support. It made live probes against `next start` and read the code. **No Critical or High findings.**

## Fixed

| Severity | Finding | Fix |
|---|---|---|
| Medium | The login's global rate limit refused correct passwords too, so 200 anonymous POSTs locked the owner out for ten minutes, and could be repeated | `app/api/admin/login/route.ts`: every bucket is now peeked before authenticating and counted only on failure. The global failure ceiling (200 per 10 minutes, about 28,800 guesses a day) is the real guessing limit while the caller key is forgeable, which a 12-character minimum password makes acceptable |
| Medium | With ads on, the AdSense tag would load on the tools that take birth details, breaking the privacy promise (a first-party script can read forms, `localStorage` and the page address) | `lib/ads.ts`: `/tools` and `/lucky-days/finder` are excluded; `AdsScript` reloads a page reached in-site with the tag already loaded, so the excluded page starts clean. The privacy policy says so |
| Low | `/og/[slug]` (~29 ms of CPU per image) had no ceiling | global ceiling, 1,200 per 10 minutes |
| Low | Feedback comments kept bidi-override characters, which can disguise text in the admin | stripped (U+202A–202E, U+2066–2069) |

## Deferred, with the reason

- **The admin and ads in the same browser** (Low): any first-party script, ads included, can call `/api/admin/*` with the admin's cookie. Advice for the owner: use the admin from a browser profile that doesn't browse the public site. The structural fix is an admin subdomain, which goes with the domain setup.
- **Container runs as root and keeps the compiler** (Low, `Dockerfile`): a non-root `USER` must be able to write the Railway volume, which is mounted root-owned. That can only be verified on Railway, so it is listed in `docs/RAILWAY.md`'s post-deploy checks rather than changed blind.
- **`Permissions-Policy` turns off the browser ad-interest APIs** (Info): this is deliberate, for privacy, and documented in `docs/ADSENSE.md`. Personalised ads may earn a little less.

## Verified clean

- `proxy.ts` redirects, including `//`, encoded `%2F`/`%5C`, CRLF and spoofed Host: no open redirect.
- Same-origin checks, body caps, sign-out revocation, path traversal and `__proto__` lookups.
- Both cron secrets.
- No reflection or 500 on any dynamic page.
- Memoised and bounded CPU paths.
- `GM_YAML_ONLY` front matter and the Markdown link filter.
- Live security headers, and the CSP with ads on.
- The service worker's exclusions.
- `npm audit --omit=dev`: 0 vulnerabilities.
- No secrets in git or its history.
- Storage and cookies match `/privacy`.
