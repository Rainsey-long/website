/**
 * GET /api/cron/backup — called by a scheduler (Railway cron service) with
 * `Authorization: Bearer $BACKUP_SECRET`. Secret checked in constant time,
 * before any database or filesystem work; 503 when unset (fails closed);
 * 409 while a backup is already running.
 */
import { timingSafeEqual } from "node:crypto";
import { BackupSkippedError, runBackup } from "@/lib/backup";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";
let running = false;

function authorised(req: Request): boolean | null {
  const secret = process.env.BACKUP_SECRET;
  if (!secret || secret.length < 32) return null;
  const got = Buffer.from(req.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

export async function GET(req: Request) {
  const ok = authorised(req);
  if (ok === null) return json({ error: "Backups are not configured" }, 503);
  if (!ok) return json({ error: "Unauthorized" }, 401);
  if (running) return json({ error: "A backup is already running" }, 409);
  running = true;
  try {
    const r = await runBackup();
    console.log(`[backup] ${r.file} ${r.bytes} bytes, pruned ${r.pruned}`);
    return json({ ok: true, ...r });
  } catch (err) {
    if (err instanceof BackupSkippedError) return json({ ok: false, skipped: err.message }, 507);
    console.error("[backup] failed", err);
    return json({ error: "Backup failed" }, 500);
  } finally {
    running = false;
  }
}
