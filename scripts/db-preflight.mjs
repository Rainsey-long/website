#!/usr/bin/env node
// "What would this code's seed do to THAT database?" — answered on a COPY.
// Copies the reference database through SQLite's online backup API, runs the
// real seedIfEmpty() against the copy, and FAILS if the seed changed any
// user-owned table (users, songkran_overrides, feedback) or rewrote a block
// the owner has edited or approved. Lists drafts it will refresh from code.
//   npm run db:preflight                                 data/almanac.db
//   npm run db:preflight -- data/backups/almanac-X.db.gz a production backup
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import Database from "better-sqlite3";

const src = process.argv[2] ?? "data/almanac.db";
if (!fs.existsSync(src)) { console.log(`No database at ${src}; a fresh volume seeds itself. CLEAN`); process.exit(0); }
const work = fs.mkdtempSync(path.join(os.tmpdir(), "preflight-"));
const copy = path.join(work, "data", "almanac.db");
fs.mkdirSync(path.dirname(copy));
if (src.endsWith(".gz")) fs.writeFileSync(copy, zlib.gunzipSync(fs.readFileSync(src)));
else await new Database(src, { readonly: true }).backup(copy);

const snap = (file) => {
  const db = new Database(file, { readonly: true });
  const q = (sql) => db.prepare(sql).all();
  const has = (t) => db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(t);
  const out = {
    users: has("users") ? JSON.stringify(q("SELECT id, username, password_hash, session_epoch FROM users ORDER BY id")) : "[]",
    songkran: has("songkran_overrides") ? JSON.stringify(q("SELECT * FROM songkran_overrides ORDER BY year")) : "[]",
    feedback: has("feedback") ? JSON.stringify(q("SELECT id FROM feedback ORDER BY id")) : "[]",
    blocks: has("text_blocks") ? q("SELECT id, text, source_text, review FROM text_blocks") : [],
  };
  db.close();
  return out;
};

const before = snap(copy);
const seed = spawnSync("npx", ["tsx", "-e", "import { seedIfEmpty } from './lib/seed'; seedIfEmpty();"], {
  cwd: process.cwd(), encoding: "utf8", env: { ...process.env, PREFLIGHT_DATA_DIR: path.dirname(copy), ADMIN_PASSWORD: "preflight-only-password" },
});
if (seed.status !== 0) { console.error(seed.stderr || seed.stdout); console.error("FAIL: seed threw"); process.exit(1); }
const after = snap(copy);

const problems = [];
for (const k of ["users", "songkran", "feedback"]) if (before[k] !== after[k] && !(k === "users" && before[k] === "[]")) problems.push(`seed changed user-owned table: ${k}`);
const byId = new Map(before.blocks.map((b) => [b.id, b]));
let refreshed = 0, added = 0;
for (const b of after.blocks) {
  const old = byId.get(b.id);
  if (!old) { added++; continue; }
  if (old.text !== b.text) {
    if (old.review !== "draft" || old.text !== old.source_text) problems.push(`seed rewrote owner-edited block ${b.id}`);
    else refreshed++;
  }
}
for (const id of byId.keys()) if (!after.blocks.some((b) => b.id === id)) problems.push(`block ${id} disappeared`);
fs.rmSync(work, { recursive: true, force: true });
console.log(`blocks: ${added} added, ${refreshed} untouched drafts refreshed from code`);
if (problems.length) { console.error(problems.join("\n")); console.error("FAIL"); process.exit(1); }
console.log("CLEAN");
