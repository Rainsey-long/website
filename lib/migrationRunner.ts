import type BetterSqlite3 from "better-sqlite3";
import crypto from "crypto";
import fs from "fs";
import path from "path";

/**
 * A schema-migration LEDGER and a numbered-file runner, for the changes that
 * `addColumnIfMissing` cannot express.
 *
 * ── WHY THIS EXISTS, AND WHAT IT DELIBERATELY DOES NOT DO ──────────────────
 *
 * `lib/db.ts`'s `migrate()` is a good design for what it is: ten
 * `CREATE TABLE IF NOT EXISTS` blocks, nineteen `addColumnIfMissing` calls and
 * (since the index pass) twelve `CREATE INDEX IF NOT EXISTS` statements — all
 * idempotent, all strictly additive, all safe to re-run on every boot. That is
 * exactly why `.claude/database.md` pre-approves it to auto-apply.
 *
 * What it cannot do (docs/DB-ARCHITECTURE-AUDIT.md §14.1):
 *
 *   - **No version number.** The only question the database can answer is
 *     "does this column exist?", never "which changes have you had?".
 *   - **No ordering.** Column additions are order-independent by luck; a
 *     change that must happen *after* another has nowhere to say so.
 *   - **No way to express a non-additive change** — a rename, a table split, a
 *     type change, a backfill from another table.
 *   - **Not transactional as a unit.** A crash halfway through leaves a
 *     partly-migrated schema that the next boot papers over.
 *
 * This module closes exactly that gap and nothing else. It is **additive
 * scaffolding for future changes, not a rewrite of how the current schema is
 * applied**: `migrate()` still owns the tables, the columns and the indexes,
 * `lib/seed.ts` still owns the content, and the `migrations/` directory starts
 * empty on purpose. The schema those two produce IS the baseline, recorded as
 * ledger row 0 rather than re-expressed as a migration file — re-expressing it
 * would mean re-applying a schema that is already live on every existing
 * database, which is precisely the risk this repo has spent the most effort
 * avoiding.
 *
 * ── THE THREE RULES (audit §14.3) ──────────────────────────────────────────
 *
 * 1. **A migration is append-only. Never edit one that has been applied
 *    anywhere.** Fix forward with a new file. This is enforced, not merely
 *    advised: the ledger stores a SHA-256 of every file it applied, and an
 *    edited file fails the next boot loudly instead of silently leaving the
 *    schema different from what the code believes.
 *
 * 2. **Every migration must state, in a comment at the top, whether it touches
 *    `skills.id` or `topics.id`.** If it does, it needs a named reviewer.
 *    Kid mastery is keyed by SKILL ID in `localStorage`
 *    (`lib/progress.ts`), so a migration that changes a skill's id silently
 *    wipes a child's progress — no error, no warning, just a mastery bar reset
 *    to 0. **No migration may `DELETE` and re-`INSERT` a `skills` or `topics`
 *    row**, not even to "clean up"; that is what `ensureTopic`'s in-place
 *    `UPDATE` and `ensureSkill`'s `moveSkill` exist to avoid.
 *
 * 3. **Some statements cannot run inside a transaction** — `VACUUM`,
 *    `PRAGMA journal_mode`, and (on the PostgreSQL side, if this schema ever
 *    moves) `CREATE INDEX CONCURRENTLY`. Put `-- migrate:no-transaction` on a
 *    line of its own at the top of such a file. Without it the failure message
 *    does not mention transactions at all.
 *
 * ── FILE FORMAT ────────────────────────────────────────────────────────────
 *
 *   migrations/0001_short-description.sql
 *   ^^^^^^^^^^ ^^^^ ^^^^^^^^^^^^^^^^^^^
 *              |    free-form, for humans
 *              the version: a positive integer, unique, applied in ascending
 *              order. Zero is reserved for the baseline row.
 *
 * `process.cwd()` is the resolution base, matching how `lib/db.ts` already
 * locates `data/` — this app is started with `next start` from the repo root
 * and is not built in `standalone` mode, so the directory is simply there.
 * A missing directory is not an error: it means "no file migrations yet",
 * which is the state this ships in.
 */

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

/** `0001_name.sql` / `0001-name.sql`. The version is the numeric prefix. */
const FILENAME_RE = /^(\d{1,12})[_-](.+)\.sql$/;

/** Opts a file out of the wrapping transaction — see rule 3 above. */
const NO_TRANSACTION_RE = /^[ \t]*--[ \t]*migrate:no-transaction[ \t]*$/im;

/**
 * Row 0 is synthetic and has no file. It records the schema every existing
 * database already has — the tables, columns and indexes `lib/db.ts`'s
 * `migrate()` applies, plus the curriculum `lib/seed.ts` applies — so that
 * "which changes have you had?" has an answer from the first boot rather than
 * from the first migration file.
 */
const BASELINE_VERSION = 0;
const BASELINE_NAME = "0000_baseline (lib/db.ts migrate + lib/seed.ts)";
const BASELINE_CHECKSUM = "baseline";

export type MigrationFile = {
  version: number;
  /** The filename as it appears on disk, which is what the ledger stores. */
  name: string;
  fullPath: string;
  sql: string;
  checksum: string;
  /** false when the file carries `-- migrate:no-transaction`. */
  transactional: boolean;
};

export type AppliedMigration = {
  version: number;
  name: string;
  checksum: string;
  applied_at: string;
};

export type MigrationRunResult = {
  /** Versions applied by THIS call. Empty on every run after the first. */
  applied: number[];
  /** Versions already in the ledger and therefore skipped. */
  skipped: number[];
  /** Highest applied version, mirrored into `PRAGMA user_version`. */
  version: number;
};

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * Creates the ledger and its baseline row. Idempotent, additive, and safe to
 * call on every open — the same contract as everything else in `migrate()`.
 *
 * Exported so a verification harness can assert the ledger's shape without
 * running any files.
 */
export function ensureMigrationLedger(db: BetterSqlite3.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY,
      name       TEXT NOT NULL,
      checksum   TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.prepare(
    `INSERT OR IGNORE INTO schema_migrations (version, name, checksum) VALUES (?, ?, ?)`
  ).run(BASELINE_VERSION, BASELINE_NAME, BASELINE_CHECKSUM);
}

/** Every applied migration, oldest first. */
export function appliedMigrations(db: BetterSqlite3.Database): AppliedMigration[] {
  return db
    .prepare(`SELECT version, name, checksum, applied_at FROM schema_migrations ORDER BY version`)
    .all() as AppliedMigration[];
}

/**
 * Reads and validates the migration files in `dir`.
 *
 * Throws on two duplicate version numbers, because that is an ambiguous
 * ordering and the entire value of the ledger is that ordering means
 * something. Files that do not match the naming pattern (a stray `.md`, an
 * editor backup) are ignored rather than rejected.
 */
export function readMigrationFiles(dir: string = MIGRATIONS_DIR): MigrationFile[] {
  if (!fs.existsSync(dir)) return [];
  const files: MigrationFile[] = [];
  const seen = new Map<number, string>();

  for (const name of fs.readdirSync(dir).sort()) {
    const match = FILENAME_RE.exec(name);
    if (!match) continue;
    const version = Number.parseInt(match[1], 10);
    if (version === BASELINE_VERSION) {
      throw new Error(
        `Migration "${name}" uses version 0, which is reserved for the baseline row ` +
          `(the schema lib/db.ts's migrate() already applies). Number it 1 or higher.`
      );
    }
    const clash = seen.get(version);
    if (clash) {
      throw new Error(
        `Migrations "${clash}" and "${name}" share version ${version}. ` +
          `Two files with one version have no defined order — renumber the newer one.`
      );
    }
    seen.set(version, name);
    const fullPath = path.join(dir, name);
    const sql = fs.readFileSync(fullPath, "utf8");
    files.push({
      version,
      name,
      fullPath,
      sql,
      checksum: sha256(sql),
      transactional: !NO_TRANSACTION_RE.test(sql),
    });
  }
  return files.sort((a, b) => a.version - b.version);
}

/**
 * Applies any migration file not yet in the ledger, in ascending version
 * order, and records each one as it goes.
 *
 * Restart-safe by construction: the ledger is the record of what ran, so a
 * second call applies nothing. A transactional migration takes `BEGIN
 * IMMEDIATE` and re-checks the ledger *inside* that transaction, so two
 * processes booting at the same moment cannot both apply the same file — the
 * SQLite equivalent of the advisory lock the audit (§14.2) credits
 * `node-pg-migrate` with. This app is single-instance today (`§17.2 F`), so
 * that is belt-and-braces rather than load-bearing, but it costs one extra
 * `SELECT` and removes a whole class of future surprise.
 *
 * @param dir overridable only so a verification harness can point at a scratch
 *            directory; application code always takes the default.
 */
export function runFileMigrations(
  db: BetterSqlite3.Database,
  dir: string = MIGRATIONS_DIR
): MigrationRunResult {
  ensureMigrationLedger(db);

  const files = readMigrationFiles(dir);
  const ledger = new Map(appliedMigrations(db).map((r) => [r.version, r]));

  // Rule 1, enforced: an applied file whose contents have changed means the
  // live schema is no longer what this checkout describes. Fail loudly here
  // rather than let the difference be discovered by a wrong query result.
  for (const file of files) {
    const row = ledger.get(file.version);
    if (row && row.checksum !== file.checksum) {
      throw new Error(
        `Migration "${file.name}" was already applied on ${row.applied_at} but its contents have ` +
          `changed since (checksum ${row.checksum.slice(0, 12)} → ${file.checksum.slice(0, 12)}). ` +
          `Migrations are append-only: restore the file and fix forward with a new one.`
      );
    }
  }

  // A ledger entry with no file means this database has had a change that this
  // checkout does not carry — usually an app rollback. Worth saying out loud;
  // not worth refusing to boot over, since the schema is a superset of what
  // the code expects and every query still works.
  const onDisk = new Set(files.map((f) => f.version));
  for (const row of ledger.values()) {
    if (row.version !== BASELINE_VERSION && !onDisk.has(row.version)) {
      console.warn(
        `[migrations] ledger has version ${row.version} ("${row.name}") but no such file exists. ` +
          `This database is ahead of the code.`
      );
    }
  }

  const highestApplied = Math.max(...ledger.keys());
  const pending = files.filter((f) => !ledger.has(f.version));

  // Rule 1 again, from the other side: a NEW file numbered below one that has
  // already run would be applied out of order, which makes the version number
  // meaningless. Renumbering it above the high-water mark is always correct.
  for (const file of pending) {
    if (file.version < highestApplied) {
      throw new Error(
        `Migration "${file.name}" (version ${file.version}) has not been applied, but version ` +
          `${highestApplied} already has. Migrations are append-only — renumber this file above ` +
          `${highestApplied} so it runs in order.`
      );
    }
  }

  const applied: number[] = [];
  for (const file of pending) {
    try {
      if (file.transactional) {
        const apply = db.transaction(() => {
          // Re-check under the write lock: another process may have applied
          // this file between our read above and this BEGIN.
          const already = db
            .prepare(`SELECT 1 FROM schema_migrations WHERE version = ?`)
            .get(file.version);
          if (already) return false;
          db.exec(file.sql);
          db.prepare(
            `INSERT INTO schema_migrations (version, name, checksum) VALUES (?, ?, ?)`
          ).run(file.version, file.name, file.checksum);
          return true;
        });
        if (!apply.immediate()) continue;
      } else {
        // No wrapping transaction, by the file's own request. There is
        // therefore no lock and no partial rollback: such a file must be
        // written to be safe if it is interrupted.
        db.exec(file.sql);
        db.prepare(
          `INSERT OR IGNORE INTO schema_migrations (version, name, checksum) VALUES (?, ?, ?)`
        ).run(file.version, file.name, file.checksum);
      }
    } catch (err) {
      throw new Error(
        `Migration "${file.name}" failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
    applied.push(file.version);
    console.info(`[migrations] applied ${file.name}`);
  }

  // Mirror the high-water mark into the header so the version is readable with
  // a single `PRAGMA user_version` — no join, no table, no app code. The audit
  // notes this pragma currently reads 0, i.e. "nothing has ever been tracked".
  const version = Math.max(highestApplied, ...applied, BASELINE_VERSION);
  if ((db.pragma("user_version", { simple: true }) as number) !== version) {
    // Interpolated because PRAGMA takes no bound parameters; `version` is
    // derived from parsed integers and Math.max, never from a string.
    db.pragma(`user_version = ${version}`);
  }

  return {
    applied,
    skipped: files.filter((f) => !applied.includes(f.version)).map((f) => f.version),
    version,
  };
}
