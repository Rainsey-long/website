/**
 * POST /api/admin/backups — run a verified backup now (the same function the
 * cron route calls). Admin only, same-origin; one at a time (409), refused
 * when the volume is low (507). Backups are listed on the admin page; there is
 * deliberately no download route: a copy of the database leaves the server
 * only through `railway volume` access (docs/RAILWAY.md).
 */
import { getSession } from "@/lib/auth";
import { BackupSkippedError, runBackup } from "@/lib/backup";
import { json, sameOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";
const flag = globalThis as unknown as { __alBackupRunning?: boolean };

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return json({ error: "Unauthorized" }, 401);
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  if (flag.__alBackupRunning) return json({ error: "A backup is already running." }, 409);
  flag.__alBackupRunning = true;
  try {
    const r = await runBackup();
    console.log(`[backup] manual by ${s.username}: ${r.file} ${r.bytes} bytes`);
    return json({ ok: true, file: r.file, bytes: r.bytes, pruned: r.pruned });
  } catch (err) {
    if (err instanceof BackupSkippedError) return json({ error: err.message }, 507);
    console.error("[backup] manual backup failed", err);
    return json({ error: "Backup failed. See the server log." }, 500);
  } finally {
    flag.__alBackupRunning = false;
  }
}
