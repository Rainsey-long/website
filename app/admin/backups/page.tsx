/** Admin: database backups on the volume, and a button to take one now. */
import { redirect } from "next/navigation";
import { BackupNow } from "@/components/client/AdminForms";
import { getSession } from "@/lib/auth";
import { fileSize, listBackups } from "@/lib/backup";
import { diskStatus } from "@/lib/volumeHeadroom";
import { defineMessages, localePath } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

export const dynamic = "force-dynamic";

const T = defineMessages({
  en: {
    title: "Backups",
    lead1: (n: string) => `Each backup is a verified copy of the database (reading text, your edits, Khmer New Year entries, feedback, admins), compressed. The newest ${n} are kept on the volume.`,
    lead2: "A daily backup runs from the Railway cron service (docs/RAILWAY.md). Restoring is done on the server, not here.",
    volume: (pct: number, free: string | null, level: string | null) => `Volume ${pct}% used${free !== null ? `, ${free} free` : ""}${level ? ` (${level})` : ""}.`,
    none: "No backups yet.",
    // English shows the level name as lib/volumeHeadroom.ts spells it.
    levels: {} as Record<string, string>,
  },
});

export default async function Backups() {
  const lang = await getLang();
  if (!(await getSession())) redirect(localePath("/admin/login", lang));
  const t = T[lang];
  const list = listBackups();
  const disk = diskStatus();
  return (
    <section className="max-w-reading">
      <h1 className="text-h1">{t.title}</h1>
      <p className="mt-2 text-small text-muted">
        {t.lead1(String(process.env.BACKUP_RETAIN || 7))}
        {" "}{t.lead2}
      </p>
      {disk.usedPct !== null && <p className="mt-3 text-small tabular">{t.volume(disk.usedPct, disk.freeBytes !== null ? fileSize(disk.freeBytes) : null, disk.level !== "ok" ? (t.levels[disk.level] ?? disk.level) : null)}</p>}
      <div className="mt-4"><BackupNow /></div>
      {list.length === 0 ? <p className="mt-5">{t.none}</p> : (
        <ul className="mt-5 text-small tabular">
          {list.map((b) => <li key={b.file} className="flex justify-between gap-3 border-b border-rule py-2"><span lang="en">{b.file}</span><span className="text-muted">{fileSize(b.bytes)}</span></li>)}
        </ul>
      )}
    </section>
  );
}
