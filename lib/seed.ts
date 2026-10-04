/**
 * Seeding — idempotent and additive, run once per process (CamboMath pattern).
 *  - text_blocks: INSERT OR IGNORE every block in content/blocks/*.json.
 *    A block the owner has not touched (still draft, text == source_text)
 *    follows code edits; an edited or approved block is never overwritten.
 *  - users: the first admin from ADMIN_PASSWORD on an EMPTY table only.
 * Contains no DELETE. Removing a block from the JSON leaves its row in place.
 */
import { getDb, runAnalyze } from "./db";
import { ADMIN_PASSWORD_MIN, hashPassword } from "./auth";
import { BLOCKS, TOPICS } from "./reading-engine";

/** Dev-only default. instrumentation.ts refuses to boot production if any admin still verifies against it. */
export const DEV_ADMIN_PASSWORD = "almanac-dev-only";

const flag = globalThis as unknown as { __alSeeded?: boolean };

export function seedIfEmpty(): void {
  if (flag.__alSeeded) return;
  const db = getDb();
  const insert = db.prepare(
    "INSERT OR IGNORE INTO text_blocks (id, topic, kind, conditions, text, source_text) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const follow = db.prepare(
    "UPDATE text_blocks SET text = ?, source_text = ?, conditions = ?, updated_at = datetime('now') WHERE id = ? AND review = 'draft' AND text = source_text AND source_text <> ?",
  );
  let wrote = 0;
  db.transaction(() => {
    for (const topic of TOPICS) {
      for (const b of BLOCKS[topic]) {
        const cond = JSON.stringify(b.conditions);
        wrote += insert.run(b.id, b.topic, b.kind, cond, b.text, b.text).changes;
        wrote += follow.run(b.text, b.text, cond, b.id, b.text).changes;
      }
    }
  })();

  const users = (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
  if (users === 0) {
    const fromEnv = process.env.ADMIN_PASSWORD;
    const isProd = process.env.NODE_ENV === "production";
    if (isProd && !fromEnv) throw new Error("ADMIN_PASSWORD must be set to create the first admin in production.");
    const password = fromEnv ?? DEV_ADMIN_PASSWORD;
    if (password.length < ADMIN_PASSWORD_MIN) {
      throw new Error(`ADMIN_PASSWORD must be at least ${ADMIN_PASSWORD_MIN} characters.`);
    }
    db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(process.env.ADMIN_USERNAME ?? "admin", hashPassword(password));
    wrote++;
  }
  flag.__alSeeded = true;
  if (wrote) runAnalyze();
}
