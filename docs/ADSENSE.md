# Google AdSense: readiness and the owner's checklist

Written 2026-10-05. Sources marked **PRIMARY** were read on Google's help pages that day; **KNOWLEDGE** marks what was not re-read.

## Verdict

**The code is ready to apply; the site is not ready until the owner steps below are done.** Ads ship off. Nothing loads, no host is added to the CSP and `/ads.txt` 404s until the owner sets the variables (`lib/ads.ts`).

The biggest approval risk is **content, not code**: AdSense rejects sites it judges "low value". Every reading, profile and forecast here is an original draft awaiting owner review (`docs/OWNER-ACTIONS.md` #4–#5), and some pages are generated from templates (156 compatibility pairs, dated reading pages). Review and personalise the drafts before applying.

## What Google requires, and what the site does

| Requirement | Source | How the site meets it |
|---|---|---|
| Horoscope and astrology content is allowed | Google Publisher Restrictions list: sexual, shocking, weapons, tobacco, drugs, alcohol, gambling, pharma… astrology is not on it (PRIMARY, support.google.com/publisherpolicies/answer/10437795) | — |
| No ads on non-content pages, error pages, or pages made for ads; no misleading labels; no drawing attention to ads | AdSense Program policies (PRIMARY, support.google.com/adsense/answer/48182) | `adsAllowedOnPath()` keeps the tag off `/admin`, `/api`, `/search`, `/offline`, `/styleguide` and print pages; slots exist only on readings, profiles, forecasts and pair pages, after the content, labelled "Advertisement" (DESIGN_SYSTEM §6.11) |
| Never click your own ads; no incentives to click | AdSense Program policies (PRIMARY) | Owner rule. Test on a build with the test publisher id or with ads off |
| Privacy policy discloses third-party cookies, Google's use of them and the Ads Settings opt-out | PRIMARY, support.google.com/adsense/answer/1348695 | `/privacy` "Advertising" section, which appears when ads are configured |
| A Google-certified, IAB TCF CMP for personalised ads in the EEA and UK (since 16 Jan 2024) and Switzerland (since 31 Jul 2024) | PRIMARY, support.google.com/adsense/answer/13554116 | Google's own consent message (AdSense → Privacy & messaging), delivered by the AdSense tag; the footer and `/privacy` show a "Privacy and cookie settings" link that reopens it (`googlefc.showRevocationMessage`) |
| ads.txt line `google.com, pub-…, DIRECT, f08c47fec0942fa0` | PRIMARY, support.google.com/adsense/answer/12171612 | `/ads.txt` is generated from `NEXT_PUBLIC_ADSENSE_ACCOUNT` |
| Site ownership verification | KNOWLEDGE: an ads.txt file, a meta tag or the AdSense snippet | the `google-adsense-account` meta tag plus ads.txt, with no ad script needed |
| Google publisher products do not support Khmer | KNOWLEDGE, recorded in CamboMath's `lib/ads.ts` | the site is English only (2026-10-05) |

## Owner checklist (in order)

1. **Domain live, content reviewed.** Brand and domain chosen; `NEXT_PUBLIC_SITE_URL` set; drafts reviewed (`docs/OWNER-ACTIONS.md`). Replace the placeholder contact address (`CONTACT_EMAIL` in `lib/site.ts`) with a real inbox.
2. **Apply.** In AdSense, add the site. Set `NEXT_PUBLIC_ADSENSE_ACCOUNT=ca-pub-…` in Railway (a build variable) and redeploy. `/ads.txt` and the verification meta tag appear, and nothing else changes.
3. **Wait for approval.** Do not set the publisher id before approval.
4. **Consent message.** In AdSense → Privacy & messaging, create and publish the **European regulations** message (EEA, UK, Switzerland). Consider also the **US state regulations** message for California and other states.
5. **Ad units.** Create three display units: after reading, in content, rail. Set `NEXT_PUBLIC_AD_CLIENT_ID` and `NEXT_PUBLIC_AD_SLOT_AFTER_READING` / `_IN_CONTENT` / `_RAIL`, then redeploy.
6. **Check in a browser** on the live site:
   - the consent message appears from an EEA location (a VPN is fine);
   - "Privacy and cookie settings" in the footer reopens it;
   - ads fill the reserved boxes;
   - the browser console shows no CSP errors. The ad hosts come from CamboMath's list and were not all verified on an ads-on build. If the console names a blocked host, add it to `AD_CSP_HOSTS` in `lib/ads.ts`.
7. **Leave Auto ads off.** They would place ads outside the reserved boxes and break DESIGN_SYSTEM §6.11 and the layout-shift budget.

## Design choices worth knowing

- **Personalised ads are allowed** (an adult audience), subject to consent where the law requires it. CamboMath is child-directed and serves none; this site is not.
- **`Permissions-Policy` keeps the browser ad-interest APIs off** (Topics, Protected Audience, Attribution Reporting). This is a privacy choice that may lower revenue slightly; it lives in `next.config.ts`.
- **The tag loads on content pages without a slot too,** so a visitor's first page can show the consent message.
- **Client-side navigation from a content page to `/admin` keeps the already-loaded tag** in that browser tab. It creates no ad unit there, and the admin is used only by the owner.
