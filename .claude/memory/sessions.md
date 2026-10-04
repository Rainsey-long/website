# Session log (newest first, read on demand)

One entry per working session, at most ~10 lines: what changed, the commit range, what is left open. This is the cross-session memory for "what happened last time"; the why of each change is in its commit message.

## 2026-10-04 — the site, end to end (one long session)

- Built the site as Astro, then ported to Next.js 16 + SQLite on Railway at the owner's request (CamboMath's shape and rules, agent docs, hooks, gates).
- Khmer traditions (calendar, holy days, festivals, Songkran + angel, birth weekday) with a visitor tradition switch; sky features (moon calendar, retrogrades, eclipses, .ics feeds, "sky behind this reading", feedback).
- Birth chart, good hours, lucky-date finder.
- Admin: overview, readings (EN/KM), profiles/forecasts overrides, Songkran, feedback + CSV, admins, backups.
- Whole site bilingual English/Khmer: /km URLs, Khmer content drafts, Khmer admin, Khmer .ics and share images (HarfBuzz).
- Reviews: two security passes (fixed gray-matter RCE, null-body 500s, 2100 almanac crash), two UI/UX passes (phone traditions menu, Khmer line height, calendar marks, tap targets).
- Open: owner brand/domain, Railway + Cloudflare setup, native Khmer review (docs/KHMER-REVIEW.md), next features (docs/research/FEATURES.md, 2026-10-04 brainstorm).
