/** Admin: database backups on the volume, and a button to take one now. */
import { redirect } from "next/navigation";
import { BackupNow } from "@/components/client/AdminForms";
import { getSession } from "@/lib/auth";
import { fileSize, listBackups } from "@/lib/backup";
import { diskStatus } from "@/lib/volumeHeadroom";

export const dynamic = "force-dynamic";

export default async function Backups() {
  if (!(await getSession())) redirect("/admin/login");
  const list = listBackups();
  const disk = diskStatus();
  return (
    <section className="max-w-reading">
      <h1 className="text-h1">Backups</h1>
      <p className="mt-2 text-small text-muted">
        Each backup is a verified copy of the database (reading text, your edits, Khmer New Year entries, feedback, admins), compressed. The newest {process.env.BACKUP_RETAIN || 7} are kept on the volume.
        A daily backup runs from the Railway cron service (docs/RAILWAY.md). Restoring is done on the server, not here.
      </p>
      {disk.usedPct !== null && <p className="mt-3 text-small tabular">Volume {disk.usedPct}% used{disk.freeBytes !== null ? `, ${fileSize(disk.freeBytes)} free` : ""}{disk.level !== "ok" ? ` (${disk.level})` : ""}.</p>}
      <div className="mt-4"><BackupNow /></div>
      {list.length === 0 ? <p className="mt-5">No backups yet.</p> : (
        <ul className="mt-5 text-small tabular">
          {list.map((b) => <li key={b.file} className="flex justify-between gap-3 border-b border-rule py-2"><span>{b.file}</span><span className="text-muted">{fileSize(b.bytes)}</span></li>)}
        </ul>
      )}
    </section>
  );
}
