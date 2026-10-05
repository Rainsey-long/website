# Database

**One database: `data/almanac.db` (SQLite, better-sqlite3).** Same file and code path in development and production; in production it sits on the Railway volume at `/app/data`. Opened once per process via `getDb()` (on `globalThis`), with CamboMath's pragmas: WAL, `busy_timeout=5000`, `synchronous=FULL`, `analysis_limit=400`, `journal_size_limit=1MB`, `foreign_keys=ON`. `closeDb()` (shutdown only) optimises and checkpoints.

## Tables

| Table | Owner | Holds |
|---|---|---|
| `users` | admin | admin accounts: username, scrypt hash, session_epoch |
| `text_blocks` | code + owner | reading text. Structure (id, topic, conditions) comes from `content/blocks/*.json`; `text` is owner-editable (follows `source_text` only while untouched; the `text_km` columns are unused since the site became English only and stay, additive-only); `review` is `draft` or `approved` (drafts are served) |
| `songkran_overrides` | owner | official Moha Songkran moment and the year's saying, per year |
| `feedback` | visitors | anonymous helpful/not-helpful, page, block ids, optional comment; `read_at` set by the owner |
| `content_overrides` | owner | owner edits to profiles and 2027 forecasts, per (path, language); replaces the repository file on the site until reset. Never written by the seed |
| `app_settings` | owner | small key/value settings (unused so far) |
| `schema_migrations` | runner | the file-migration ledger (`lib/migrationRunner.ts`) |

## Rules

1. **Additive only.** New table: `CREATE TABLE IF NOT EXISTS` in `lib/db.ts`. New column: `addColumnIfMissing`. Anything else (rename, backfill, drop): a numbered file in `migrations/` (append-only, checksummed; CamboMath's runner, unchanged). **Never a raw `ALTER TABLE` or one-off script against a real database.**
2. **The seed never deletes and never overwrites the owner's work.** `seedIfEmpty()` inserts missing blocks and refreshes only untouched drafts (`review='draft' AND text = source_text`). It creates the first admin from `ADMIN_PASSWORD` on an empty `users` table only. `npm run db:preflight` proves both on a copy.
3. **One writer, always.** `railway.json` pins `numReplicas: 1`. Two containers on one volume is a corruption path, not scaling.
4. **Never copy a development database to production.** The boot check refuses an admin that still verifies against the dev password.
5. **Never back up with `cp`.** Under WAL the newest pages are in the sidecar. Backups: `GET /api/cron/backup` → `lib/backup.ts` (online backup API, gzip, integrity_check + row counts verified, keep `BACKUP_RETAIN`). Restore steps are in the file header and `docs/RAILWAY.md`.

Readings, calendars and sky pages do not need the database to be correct: only owner-edited text, the Songkran override and feedback live there. A missing database degrades to the code defaults.
