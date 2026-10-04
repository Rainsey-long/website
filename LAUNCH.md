# Launch checklist (plan 4.4)

## Owner decisions
- [ ] Brand name and domain → `src/config/site.ts` (`SITE_NAME`, `DOMAIN`), `astro.config.mjs` (`SITE`), `public/robots.txt`
- [ ] Review text blocks, profiles and 2027 forecasts
- [ ] Verify Khmer New Year table (`content/data/khmer-new-year.json`) and Khmer spellings (`src/lib/sea-variants.ts`)

## Hosting (Cloudflare Pages, free tier)
- [ ] Connect the repo; build command `npm run build`, output `dist`, branch `claude/zodiac-site` (or merge to your production branch)
- [ ] Check file count stays under the per-deployment limit (≈ 1,000 HTML pages today plus assets)
- [ ] Create a deploy hook; store it as GitHub secret `CF_PAGES_DEPLOY_HOOK`
- [ ] Web Analytics: put the beacon token in `FEATURES.CF_ANALYTICS_TOKEN`

## Automation
- [ ] `.github/workflows/daily-build.yml` runs at 17:05 UTC (00:05 UTC+7): tests, buffer check, build, deploy hook
- [ ] Confirm three consecutive days update without manual action

## Search
- [ ] Google Search Console and Bing Webmaster: verify the domain (DNS TXT is simplest), submit `/sitemap-index.xml`
- [ ] Spot-check structured data with the Rich Results Test (Article, FAQPage, BreadcrumbList)

## Before ads (Phase 5)
- [ ] ≥ 30 quality pages live (already true: profiles, forecasts, compatibility)
- [ ] Google-certified CMP for EEA/UK
- [ ] Add the publisher line to `public/ads.txt`; set `FEATURES.ADS_ENABLED` and slot IDs; update `/privacy`
