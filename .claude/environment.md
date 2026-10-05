# Environment

`.env.example` is the source of truth; copy to `.env.local` for development (git-ignored).

| Var | Required | Purpose |
|---|---|---|
| `AUTH_SECRET` | **prod** (≥16) | signs the admin cookie; boot refuses without it |
| `ADMIN_PASSWORD` | **first prod boot** (≥12) | creates the first admin on an empty users table |
| `NEXT_PUBLIC_SITE_URL` | recommended, **build-time** | canonical origin, share links, sitemap |
| `BACKUP_SECRET` | recommended (≥32) | bearer for `/api/cron/backup`; unset = 503 |
| `TRUSTED_PROXY_HOPS` | recommended | `1` on Railway with Cloudflare DNS-only, `2` with the orange proxy |
| `TELEGRAM_CRON_SECRET` | optional (≥32) | bearer for `/api/cron/telegram`; unset = 503 |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | optional, server-only | the bot and channel for the daily card |
| `TELEGRAM_API_BASE` | tests only | ignored in production unless it points at localhost |
| `BACKUP_RETAIN`, `DISK_BLOCK_PCT`, `DISK_WARN_PCT`, `MIN_FREE_MB` | optional | backup count and disk guard |
| `PREFLIGHT_DATA_DIR` | scripts only | never set on a server |

## Hosting: one container, one volume, one replica

Railway, Docker (`Dockerfile`), volume at `/app/data`, `numReplicas: 1`, healthcheck `/api/health`, tini as PID 1, `NEXT_MANUAL_SIG_HANDLE=1` so `lib/shutdown.ts` checkpoints the WAL on redeploy. Domain on Cloudflare (DNS-only like cambomath.com). Runbook: `docs/RAILWAY.md`.

## Gotchas carried over from CamboMath

1. **`NEXT_PUBLIC_*` is inlined at build.** Set it in Railway before the build; the Dockerfile must declare it as an `ARG`.
2. **Database-reading routes are dynamic** (`force-dynamic`, and the root layout reads cookies): a build-time render would describe the build's empty database and clock.
3. **`next start` snapshots `public/` at boot.** Never write files there at runtime; write under `data/`.
4. **Port 3000** is pinned in `.claude/launch.json`; kill a stale process (`fuser -k 3000/tcp`) rather than letting Next pick another port. Don't `pkill -f "next start"` from a shell whose own command contains that text: it kills the shell.
5. **Production mode locally needs `.env.local`** with `AUTH_SECRET` and `ADMIN_PASSWORD`, or the boot check refuses to start (that is the check working).
