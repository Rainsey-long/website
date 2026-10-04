/**
 * Admin overview: what needs the owner's attention, at a glance, with a link
 * to the section that fixes each thing. Every read is behind getSession().
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { CONTENT_PATHS, repoSource } from "@/lib/content";
import { fileSize as size, listBackups } from "@/lib/backup";
import { songkran } from "@/lib/khmer";
import { songkranOverride } from "@/lib/songkranStore";
import { diskStatus } from "@/lib/volumeHeadroom";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  if (!(await getSession())) redirect("/admin/login");
  seedIfEmpty();
  const db = getDb();
  const one = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  const drafts = one("SELECT COUNT(*) AS n FROM text_blocks WHERE review = 'draft'");
  const blocks = one("SELECT COUNT(*) AS n FROM text_blocks");
  const noKm = one("SELECT COUNT(*) AS n FROM text_blocks WHERE text_km = ''");
  const unread = one("SELECT COUNT(*) AS n FROM feedback WHERE read_at IS NULL");
  const week = db.prepare("SELECT SUM(verdict = 'helpful') AS good, COUNT(*) AS n FROM feedback WHERE created_at >= datetime('now', '-7 days')").get() as { good: number | null; n: number };
  const overrides = one("SELECT COUNT(*) AS n FROM content_overrides");
  const kmMissing = CONTENT_PATHS.filter((p) => !repoSource(p, "km") && !db.prepare("SELECT 1 FROM content_overrides WHERE path = ? AND lang = 'km'").get(p)).length;
  const now = new Date();
  const nyYear = now.getUTCFullYear() + (now.getUTCMonth() >= 4 ? 1 : 0);
  const ny = songkran(nyYear);
  const official = songkranOverride(nyYear)?.official_at;
  const disk = diskStatus();
  const backups = listBackups();
  const lastBackup = backups[0];

  const cards: Array<{ title: string; value: string; note: string; href: string; attention: boolean }> = [
    { title: "Reading text", value: `${blocks - drafts} of ${blocks} approved`, note: drafts ? `${drafts} drafts to review` : "All approved", href: "/admin/readings?show=draft", attention: drafts > 0 },
    { title: "Khmer reading text", value: `${blocks - noKm} of ${blocks} translated`, note: noKm ? `${noKm} show English on Khmer pages` : "Every block has Khmer", href: "/admin/readings?show=nokm", attention: noKm > 0 },
    { title: "Profiles and forecasts", value: `${CONTENT_PATHS.length} pages, ${overrides} edited here`, note: kmMissing ? `${kmMissing} have no Khmer version yet` : "All have a Khmer version", href: "/admin/content", attention: kmMissing > 0 },
    { title: "Feedback", value: `${unread} unread`, note: week.n ? `${week.good ?? 0} of ${week.n} helpful in the last 7 days` : "None in the last 7 days", href: "/admin/feedback", attention: unread > 0 },
    { title: `Khmer New Year ${nyYear}`, value: official ? `Official: ${official}` : `Calculated: ${ny.date} ${ny.time}`, note: official ? "Official moment entered" : "Enter the Ministry's minute when announced", href: "/admin/songkran", attention: !official },
    { title: "Backups", value: lastBackup ? `Last: ${lastBackup.at.slice(0, 16).replace("T", " ")} UTC` : "No backup yet", note: `${backups.length} kept${disk.usedPct !== null ? ` · volume ${disk.usedPct}% used` : ""}`, href: "/admin/backups", attention: !lastBackup || disk.level !== "ok" },
  ];

  return (
    <>
      <h1 className="text-h1">Overview</h1>
      <p className="mt-2 text-muted">What needs attention. Each item links to the place to fix it.</p>
      <ul className="mt-6 grid gap-x-7 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.title} className="border-t border-rule py-4">
            <h2 className="text-small text-muted">{c.title}</h2>
            <p className="mt-1 serif text-h3">{c.value}</p>
            <p className={`mt-1 text-small ${c.attention ? "font-semibold" : "text-muted"}`}>{c.note}</p>
            <p className="mt-2 text-small"><Link className="link" href={c.href}>Open</Link></p>
          </li>
        ))}
      </ul>
      {lastBackup && <p className="mt-4 text-small text-muted tabular">Latest backup {lastBackup.file}, {size(lastBackup.bytes)}.</p>}
    </>
  );
}
