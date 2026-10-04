/**
 * The one database: data/almanac.db, a SQLite file. Same file and code path in
 * development and production (the Railway volume is mounted at /app/data).
 *
 * Ported from CamboMath's lib/db.ts, which earned every pragma below in
 * production. The reasoning lives there and in .claude/database.md; the short
 * version is kept beside each line so nobody "tidies" one away.
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { runFileMigrations } from "./migrationRunner";

/** PREFLIGHT_DATA_DIR lets scripts/db-preflight.mjs seed a COPY; never set it on a server. */
export const DATA_DIR = process.env.PREFLIGHT_DATA_DIR || path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "almanac.db");

/*
 * One connection per process, kept on globalThis because Next bundles each
 * route separately and a module-level variable would open one per bundle.
 * One connection means one shutdown checkpoint covers everything.
 */
const store = globalThis as unknown as { __alDb?: Database.Database | null };

export function getDb(): Database.Database {
  if (store.__alDb) return store.__alDb;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  store.__alDb = db;
  // Readers do not block the writer.
  db.pragma("journal_mode = WAL");
  // better-sqlite3 is synchronous: a busy database throws instead of queueing.
  db.pragma("busy_timeout = 5000");
  // A committed write must survive a HOST crash on a volume whose fsync we don't control.
  db.pragma("synchronous = FULL");
  // Bounds ANALYZE / PRAGMA optimize sampling.
  db.pragma("analysis_limit = 400");
  // Lets a checkpoint shrink the -wal sidecar instead of keeping its high-water mark.
  db.pragma("journal_size_limit = 1048576");
  // Deletions rely on ON DELETE CASCADE; stated, not inherited.
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

/** Shutdown path only: optimize, fold the WAL back in, close. Safe to call twice. */
export function closeDb(): void {
  const open = store.__alDb;
  if (!open) return;
  store.__alDb = null;
  try { open.pragma("optimize"); } catch { /* statistics are optional */ }
  try { open.pragma("wal_checkpoint(TRUNCATE)"); } catch { /* still close */ }
  try { open.close(); } catch { /* already closed */ }
}

/** Statistics for the planner after a seed. Failure is logged, never fatal. */
export function runAnalyze(): void {
  try {
    getDb().exec("ANALYZE");
    getDb().pragma("wal_checkpoint(TRUNCATE)");
  } catch (err) {
    console.error("[db] ANALYZE failed — queries still correct:", err);
  }
}

function addColumnIfMissing(d: Database.Database, table: string, column: string, ddl: string): void {
  const cols = d.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!cols.some((c) => c.name === column)) d.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
}

/**
 * Schema. Additive only: CREATE ... IF NOT EXISTS and addColumnIfMissing.
 * Anything these cannot express goes in migrations/ (see .claude/database.md).
 */
function migrate(d: Database.Database): void {
  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
      password_hash TEXT NOT NULL,
      session_epoch INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Reading text blocks. The STRUCTURE (which blocks exist, their
    -- conditions) is code: content/blocks/*.json. The TEXT can be reviewed and
    -- edited by the owner here. review = 'draft' until approved; drafts are
    -- still served (the whole library starts as drafts).
    CREATE TABLE IF NOT EXISTS text_blocks (
      id TEXT PRIMARY KEY,
      topic TEXT NOT NULL,
      kind TEXT NOT NULL,
      conditions TEXT NOT NULL,
      text TEXT NOT NULL,
      source_text TEXT NOT NULL,
      review TEXT NOT NULL DEFAULT 'draft' CHECK (review IN ('draft', 'approved')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_by TEXT
    );

    -- Official Khmer New Year moment and the year's prediction, entered by the
    -- owner from the Ministry of Cults and Religion announcement. The
    -- calculated moment is used when no row exists.
    CREATE TABLE IF NOT EXISTS songkran_overrides (
      year INTEGER PRIMARY KEY,
      official_at TEXT,
      tumneay TEXT,
      source TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- "Was this helpful?" — anonymous, no IP or identifier stored.
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      verdict TEXT NOT NULL CHECK (verdict IN ('helpful', 'not_helpful')),
      block_ids TEXT NOT NULL DEFAULT '',
      comment TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Owner edits to long-form Markdown (profiles, 2027 forecasts), per
    -- language. The repository file is the default; a row here replaces it on
    -- the site until the owner resets it. Never written by the seed.
    CREATE TABLE IF NOT EXISTS content_overrides (
      path TEXT NOT NULL,
      lang TEXT NOT NULL CHECK (lang IN ('en', 'km')),
      source TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_by TEXT,
      PRIMARY KEY (path, lang)
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_text_blocks_review ON text_blocks(review, topic);
    CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);
  `);
  addColumnIfMissing(d, "users", "session_epoch", "session_epoch INTEGER NOT NULL DEFAULT 0");
  // Khmer reading text (lib/i18n.ts). Same rule as the English pair: the seed
  // follows source_text_km only while the owner has not edited text_km.
  addColumnIfMissing(d, "text_blocks", "text_km", "text_km TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing(d, "text_blocks", "source_text_km", "source_text_km TEXT NOT NULL DEFAULT ''");
  // Admin triage: when the owner marked a feedback row as read (NULL = unread).
  addColumnIfMissing(d, "feedback", "read_at", "read_at TEXT");
  runFileMigrations(d);
}

export type TextBlockRow = {
  id: string;
  topic: string;
  kind: string;
  conditions: string;
  text: string;
  source_text: string;
  text_km: string;
  review: "draft" | "approved";
  updated_at: string;
  updated_by: string | null;
};

export type SongkranOverride = {
  year: number;
  official_at: string | null;
  tumneay: string | null;
  source: string | null;
  updated_at: string;
};

export type FeedbackRow = {
  id: number;
  path: string;
  verdict: "helpful" | "not_helpful";
  block_ids: string;
  comment: string;
  created_at: string;
  read_at: string | null;
};

export type ContentOverrideRow = {
  path: string;
  lang: "en" | "km";
  source: string;
  updated_at: string;
  updated_by: string | null;
};
