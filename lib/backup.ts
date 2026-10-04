/**
 * Database backups (CamboMath lib/backup.ts, trimmed to this site's needs).
 *  - SQLite's ONLINE backup API, never `cp`: under WAL the newest pages live
 *    in the -wal sidecar, so a copied .db alone is torn.
 *  - gzip, then VERIFY: decompress, open read-only, PRAGMA integrity_check,
 *    compare row counts. An unverified backup is deleted, not kept.
 *  - keep the newest BACKUP_RETAIN (default 7); refuse when the volume is low.
 * Restore: stop the service, delete data/almanac.db-wal and -shm, then
 *   gunzip -c data/backups/almanac-<stamp>.db.gz > data/almanac.db
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { pipeline } from "node:stream/promises";
import Database from "better-sqlite3";
import { DATA_DIR, getDb } from "./db";
import { diskBlock, mb } from "./volumeHeadroom";

export const BACKUP_DIR = path.join(DATA_DIR, "backups");
const PREFIX = "almanac-";
const TABLES = ["users", "text_blocks", "songkran_overrides", "feedback", "content_overrides"] as const;

export class BackupSkippedError extends Error {}

function counts(db: Database.Database): Record<string, number> {
  return Object.fromEntries(TABLES.map((t) => [t, (db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n]));
}

export async function runBackup(at = new Date()): Promise<{ file: string; bytes: number; counts: Record<string, number>; pruned: number }> {
  const block = diskBlock({ fresh: true });
  if (block) throw new BackupSkippedError(`volume low (${block.level}); backup skipped, nothing deleted`);
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = at.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const raw = path.join(BACKUP_DIR, `${PREFIX}${stamp}.db.tmp`);
  const gz = path.join(BACKUP_DIR, `${PREFIX}${stamp}.db.gz`);
  const check = path.join(BACKUP_DIR, `${PREFIX}${stamp}.verify.tmp`);
  try {
    const live = getDb();
    const expected = counts(live);
    await live.backup(raw);
    await pipeline(fs.createReadStream(raw), zlib.createGzip({ level: 9 }), fs.createWriteStream(gz));
    await pipeline(fs.createReadStream(gz), zlib.createGunzip(), fs.createWriteStream(check));
    const copy = new Database(check, { readonly: true });
    try {
      const ok = copy.pragma("integrity_check", { simple: true });
      if (ok !== "ok") throw new Error(`integrity_check: ${String(ok)}`);
      const got = counts(copy);
      // Feedback may grow during the copy; everything else must match exactly.
      for (const t of TABLES) if (t !== "feedback" && got[t] !== expected[t]) throw new Error(`row count mismatch in ${t}`);
    } finally {
      copy.close();
    }
    const pruned = prune();
    return { file: path.basename(gz), bytes: fs.statSync(gz).size, counts: expected, pruned };
  } catch (err) {
    fs.rmSync(gz, { force: true });
    throw err;
  } finally {
    fs.rmSync(raw, { force: true });
    fs.rmSync(check, { force: true });
  }
}

function prune(): number {
  const keep = Math.max(1, Number.parseInt(process.env.BACKUP_RETAIN ?? "7", 10) || 7);
  const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith(PREFIX) && f.endsWith(".db.gz")).sort();
  const old = files.slice(0, Math.max(0, files.length - keep));
  for (const f of old) fs.rmSync(path.join(BACKUP_DIR, f), { force: true });
  return old.length;
}

/** Verified backups on the volume, newest first (admin "Backups" tab). */
export function listBackups(): Array<{ file: string; bytes: number; at: string }> {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith(PREFIX) && f.endsWith(".db.gz"))
    .sort()
    .reverse()
    .map((file) => ({ file, bytes: fs.statSync(path.join(BACKUP_DIR, file)).size, at: fs.statSync(path.join(BACKUP_DIR, file)).mtime.toISOString() }));
}

/** "812 KB" / "3.1 MB" for the admin pages. */
export const fileSize = (bytes: number) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export { mb };
