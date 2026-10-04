# Waiting on the owner

Update this file in the same commit as the change that adds or closes an item.

| # | Item | Where |
|---|---|---|
| 1 | Choose the brand name and domain | `lib/site.ts` (`SITE_NAME`, `DOMAIN`), then `NEXT_PUBLIC_SITE_URL` on Railway |
| 2 | Create the Railway project, volume, variables and backup cron | `docs/RAILWAY.md` §1–§5 |
| 3 | Point the domain on Cloudflare at Railway | `docs/RAILWAY.md` §4 |
| 4 | Review the 196 reading blocks in `/admin` (approve or edit) | `/admin?tab=blocks` |
| 5 | Review profiles, 2027 forecasts, compatibility copy, Khmer weekday portraits, birth chart and good-hours wording | `content/`, `lib/compat-copy.ts`, `lib/khmerWeekdayCopy.ts`, `lib/natalCopy.ts`, `lib/goodHours.ts` (`PLANET_HOUR`) |
| 6 | A native Khmer reader checks every Khmer string | `docs/KHMER-REVIEW.md` |
| 7 | Each April: enter the Ministry's official Moha Songkran minute and saying | `/admin?tab=songkran` |
| 8 | Decide whether answer-engine bots (Perplexity, OpenAI search) may crawl | `lib/aiBots.ts`, `FEATURES.BLOCK_AI_CRAWLERS` |
| 9 | Search Console and Bing: verify the domain, submit `/sitemap.xml` | after #3 |
| 10 | Delete the local test Songkran rows (dev database only; never on production) if you run this checkout: Admin → Songkran shows them as "Test entry" | local `data/almanac.db` |
