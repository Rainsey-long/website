# Deploying to Railway, with the domain on Cloudflare

The same shape as CamboMath (cambomath.com): one Docker container, one volume at `/app/data`, one replica, a healthcheck, a cron service for backups, DNS on Cloudflare. CamboMath's runbook is the long-form source for every rule here; this file is what differs and what to click.

## 0. Three facts that shape everything

1. **The database is a file on the volume** (`data/almanac.db`). Everything written at runtime is under `data/`. Anything else is wiped by the next deploy.
2. **One replica, forever.** better-sqlite3 is a single-process writer on a single-attach volume. Two replicas, or an overlapping deploy sharing the volume, can corrupt it.
3. **`NEXT_PUBLIC_*` values are baked in at build time.** Railway passes service variables to the Docker build as build args; the Dockerfile declares each one it needs.

## 1. Service settings

| Setting | Value | Why |
|---|---|---|
| Source | this repo, branch `main` for the `develop` environment and `release/1.0.0` for `production` (create them when ready) | Same split as CamboMath; a push to `release/*` IS a production deploy |
| Builder | Dockerfile (`railway.json` pins it) | |
| Volume mount path | **`/app/data`** | Set on the service; the Dockerfile has no `VOLUME` instruction (Railway rejects one) |
| Volume size | 1 GB is plenty (database is ~1 MB; 7 backups ~150 KB) | |
| Replicas | **1** (pinned in `railway.json`) | §0.2 |
| Healthcheck | `/api/health` (pinned) | runs `SELECT 1`, so it fails if the volume did not mount |
| Memory | 512 MB minimum, 1 GB comfortable | no Chromium here, unlike CamboMath |
| Region | `asia-southeast1` (Singapore) | nearest Cambodia; fine for the international audience behind Cloudflare |

## 2. Variables (Variables tab, per environment)

| Variable | Value |
|---|---|
| `AUTH_SECRET` | `openssl rand -base64 32`. Required; the app refuses to boot without it |
| `ADMIN_PASSWORD` | ≥ 12 characters. Creates the first admin on the first boot of an empty volume; later changes do nothing |
| `ADMIN_USERNAME` | optional, default `admin` |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-domain>` — **build-time**; redeploy after changing it |
| `BACKUP_SECRET` | `openssl rand -hex 32` (≥ 32 chars) |
| `TRUSTED_PROXY_HOPS` | `1` with Cloudflare DNS-only (grey cloud); `2` with the orange-cloud proxy on. Too high lets a client forge its IP |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION` | optional, build-time |

Never set `VERCEL`, `NETLIFY` and similar: `instrumentation.ts` refuses to boot on serverless hosts.

## 3. First boot

1. Deploy. The first request creates the schema, seeds 196 reading blocks and the admin from `ADMIN_PASSWORD`.
2. Open `/api/health` → `{"ok":true}`. Sign in at `/admin/login` (not linked anywhere on the site).
3. Take a backup straight away (§5) and keep it.
4. **Never copy a development `data/almanac.db` onto the volume.** Its admin has the development password and the boot check will refuse to start.

## 4. The domain on Cloudflare (same as cambomath.com)

1. In Railway: service → Settings → Networking → **Custom Domain** → enter `yourdomain.com` (and `www.yourdomain.com` if wanted). Railway shows a CNAME target.
2. In Cloudflare DNS: add a `CNAME` for `@` (Cloudflare flattens it at the apex) and for `www`, pointing at the Railway target. Start **DNS only (grey cloud)**, like cambomath.com, so Railway issues the certificate. Keep the TXT verification record Railway asks for.
3. Wait for Railway to show the certificate as issued, then open the site over https.
4. Set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` and redeploy (build-time variable). Update `DOMAIN` in `lib/site.ts` too, so share cards and the contact address match.
5. **If you later turn the orange cloud on**: SSL/TLS mode **Full (strict)**, leave HTML uncached (Cloudflare's default; never "Cache Everything", never a rule matching `/admin` or `/api`), and set `TRUSTED_PROXY_HOPS=2`.
6. Optional: Cloudflare Web Analytics (free, no cookies). Put the token in `FEATURES.CF_ANALYTICS_TOKEN` in `lib/site.ts`; the CSP already allows it.

## 5. Backups

`GET /api/cron/backup` with `Authorization: Bearer $BACKUP_SECRET` writes `data/backups/almanac-<stamp>.db.gz` using SQLite's online backup API, verifies it (decompress, `integrity_check`, row counts), and keeps the newest `BACKUP_RETAIN` (7). It refuses when the volume is ≥ 90% full and deletes nothing.

**Cron service (once per environment)**, exactly as CamboMath:
1. New → Empty Service `backup-cron`, Docker image `curlimages/curl:latest`.
2. Start command: `sh -c 'curl -fsS -m 120 -H "Authorization: Bearer $BACKUP_SECRET" "$SITE_URL/api/cron/backup"'`
3. Cron schedule `0 20 * * *` (03:00 in Phnom Penh). Variables: `BACKUP_SECRET=${{web.BACKUP_SECRET}}`, `SITE_URL=https://yourdomain.com`.
4. Run it once by hand; the JSON must say `"ok":true`.

**Restore:** stop the service, delete `data/almanac.db-wal` and `data/almanac.db-shm`, then `gunzip -c data/backups/almanac-<stamp>.db.gz > data/almanac.db`, start. Backups on the volume do not survive losing the volume: download one now and then (Railway volume → browse, or `railway ssh`).

## 6. Before every production deploy

```bash
npm run release:check -- --build   # GO / NO-GO
npm run db:preflight -- data/backups/almanac-<latest>.db.gz   # against a production backup
ALLOW_PROD_DEPLOY=1 git push origin HEAD:release/1.0.0        # only when the owner says "deploy"
```

`npm run hooks:install` (once per clone) makes the pre-push hook refuse a `release/*` push without `ALLOW_PROD_DEPLOY=1`.

## 7. After a deploy

`/api/health` ok · home, one horoscope, `/khmer/new-year`, `/lucky-days` render · `/admin` signs in · `/sitemap.xml` uses your domain · a backup run succeeds · Railway logs show no `[boot]` warnings you didn't expect.
