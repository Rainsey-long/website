# Compliance, privacy and security: brainstorm, 2026-10-05

The owner asked for three things: English only, compliance with Google advertising, and a security and privacy audit. All three are built (English only; `docs/ADSENSE.md`; `docs/SECURITY-AUDIT-2026-10-05.md`; `/privacy`). This file lists what could come next, scored by value and effort. Nothing below is built yet.

Labels: **PRIMARY** means read on the source that day; **KNOWLEDGE** means not re-read.

## Do before applying to AdSense (owner, no code)

| # | Item | Why |
|---|---|---|
| 1 | Review and personalise the draft readings, profiles and forecasts | "Low-value content" is the most common AdSense rejection. Templated pages (compatibility pairs, dated readings) are the weakest point |
| 2 | A real contact inbox in `CONTACT_EMAIL` (`lib/site.ts`) | The privacy policy promises answers to data requests |
| 3 | Publish Google's European regulations message, and consider the US state regulations message | Certified CMP rule (PRIMARY, answer 13554116); the US message covers CCPA "do not sell or share" (KNOWLEDGE) |
| 4 | Leave Auto ads off | Keeps ads inside the reserved boxes (DESIGN_SYSTEM §6.11) |
| 5 | Use the admin from a browser profile that doesn't browse the public site | Audit finding: ad scripts and the admin cookie in one browser |

## Small code changes worth doing (ranked)

| # | Item | Value | Effort | Note |
|---|---|---|---|---|
| 6 | `/.well-known/security.txt` with the contact address and an expiry | medium | 15 min | RFC 9116; tells researchers where to report |
| 7 | A sentence in `/terms` about ads and third-party links | medium | 15 min | Matches the privacy policy |
| 8 | Delete feedback older than 12 months automatically (on boot or with the backup cron) | medium | 1 h | Data minimisation; the privacy page would then state a retention period |
| 9 | `npm audit --omit=dev` as a `release:check` gate | medium | 30 min | Production dependencies are at 0 today; the gate keeps them there |
| 10 | Accessibility statement page (target WCAG 2.2 AA, how to report a problem) | low–medium | 1 h | The design system already meets AA contrast |
| 11 | "Your data" button on `/privacy` that clears this site's local storage and cookies in one click | low | 1 h | Makes the "clear it yourself" promise one click |

## Larger changes (decide first)

| # | Item | Trade-off |
|---|---|---|
| 12 | Admin on its own subdomain (`admin.<domain>`) | Fully separates the admin cookie from ad scripts. Needs DNS, a second Railway domain and cookie scoping; do it with the domain setup |
| 13 | Container as a non-root user, multi-stage image without the compiler | Smaller attack surface; must be checked against the Railway volume's owner first (`docs/RAILWAY.md` §7) |
| 14 | Nonce-based CSP without `'unsafe-inline'` for scripts | The strongest XSS defence, but it makes every page dynamic and needs nonces passed to the AdSense and analytics tags. Little gain while no user HTML is ever rendered |
| 15 | Let the browser ad-interest APIs (Topics, Protected Audience) back on | A little more ad revenue, less privacy. Today's choice is privacy |

## Recommended order

1–5 (owner), then 6, 7 and 9 together (one short commit), then 8, then 12 and 13 with the domain and Railway setup. 14 and 15 only on an explicit decision.
