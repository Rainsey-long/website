/**
 * Admin overview: what needs the owner's attention, at a glance, with a link
 * to the section that fixes each thing. Every read is behind getSession().
 */
import Link from "@/components/client/LocaleLink";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { CONTENT_PATHS } from "@/lib/content";
import { fileSize as size, listBackups } from "@/lib/backup";
import { songkran } from "@/lib/khmer";
import { songkranOverride } from "@/lib/songkranStore";
import { diskStatus } from "@/lib/volumeHeadroom";
import { defineMessages, localePath } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

export const dynamic = "force-dynamic";

const T = defineMessages({
  en: {
    title: "Overview",
    lead: "What needs attention. Each item links to the place to fix it.",
    open: "Open",
    readingTitle: "Reading text",
    approvedOf: (a: number, n: number) => `${a} of ${n} approved`,
    drafts: (n: number) => `${n} drafts to review`,
    allApproved: "All approved",
    contentTitle: "Profiles and forecasts",
    pages: (n: number, e: number) => `${n} pages, ${e} edited here`,
    editAny: "Edit the text of any page",
    feedbackTitle: "Feedback",
    unread: (n: number) => `${n} unread`,
    helpfulWeek: (g: number, n: number) => `${g} of ${n} helpful in the last 7 days`,
    noneWeek: "None in the last 7 days",
    nyTitle: (y: number) => `Khmer New Year ${y}`,
    official: (v: string) => `Official: ${v}`,
    calculated: (v: string) => `Calculated: ${v}`,
    officialIn: "Official moment entered",
    enterOfficial: "Enter the Ministry's minute when announced",
    backupsTitle: "Backups",
    last: (v: string) => `Last: ${v} UTC`,
    noBackup: "No backup yet",
    kept: (n: number) => `${n} kept`,
    volume: (p: number) => ` · volume ${p}% used`,
    latest: (file: string, s: string) => `Latest backup ${file}, ${s}.`,
  },
});

/** "2027-04-14" + "10:48" → "2027-04-14 10:48". */
function moment(date: string, time: string): string {
  return `${date} ${time}`;
}

export default async function AdminOverview() {
  const lang = await getLang();
  if (!(await getSession())) redirect(localePath("/admin/login", lang));
  const t = T[lang];
  seedIfEmpty();
  const db = getDb();
  const one = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  const drafts = one("SELECT COUNT(*) AS n FROM text_blocks WHERE review = 'draft'");
  const blocks = one("SELECT COUNT(*) AS n FROM text_blocks");
  const unread = one("SELECT COUNT(*) AS n FROM feedback WHERE read_at IS NULL");
  const week = db.prepare("SELECT SUM(verdict = 'helpful') AS good, COUNT(*) AS n FROM feedback WHERE created_at >= datetime('now', '-7 days')").get() as { good: number | null; n: number };
  const overrides = one("SELECT COUNT(*) AS n FROM content_overrides WHERE lang = 'en'");
  const now = new Date();
  const nyYear = now.getUTCFullYear() + (now.getUTCMonth() >= 4 ? 1 : 0);
  const ny = songkran(nyYear);
  const official = songkranOverride(nyYear)?.official_at;
  const disk = diskStatus();
  const backups = listBackups();
  const lastBackup = backups[0];
  const officialShown = official ? moment(official.slice(0, 10), official.slice(11)) : "";
  const lastShown = lastBackup ? moment(lastBackup.at.slice(0, 10), lastBackup.at.slice(11, 16)) : "";

  const cards: Array<{ title: string; value: string; note: string; href: string; attention: boolean }> = [
    { title: t.readingTitle, value: t.approvedOf(blocks - drafts, blocks), note: drafts ? t.drafts(drafts) : t.allApproved, href: "/admin/readings?show=draft", attention: drafts > 0 },
    { title: t.contentTitle, value: t.pages(CONTENT_PATHS.length, overrides), note: t.editAny, href: "/admin/content", attention: false },
    { title: t.feedbackTitle, value: t.unread(unread), note: week.n ? t.helpfulWeek(week.good ?? 0, week.n) : t.noneWeek, href: "/admin/feedback", attention: unread > 0 },
    { title: t.nyTitle(nyYear), value: official ? t.official(officialShown) : t.calculated(moment(ny.date, ny.time)), note: official ? t.officialIn : t.enterOfficial, href: "/admin/songkran", attention: !official },
    { title: t.backupsTitle, value: lastBackup ? t.last(lastShown) : t.noBackup, note: `${t.kept(backups.length)}${disk.usedPct !== null ? t.volume(disk.usedPct) : ""}`, href: "/admin/backups", attention: !lastBackup || disk.level !== "ok" },
  ];

  return (
    <>
      <h1 className="text-h1">{t.title}</h1>
      <p className="mt-2 text-muted">{t.lead}</p>
      <ul className="mt-6 grid gap-x-7 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.href} className="border-t border-rule py-4">
            <h2 className="text-small text-muted">{c.title}</h2>
            <p className="mt-1 serif text-h3">{c.value}</p>
            <p className={`mt-1 text-small ${c.attention ? "font-semibold" : "text-muted"}`}>{c.note}</p>
            <p className="mt-2 text-small"><Link className="link" href={c.href}>{t.open}</Link></p>
          </li>
        ))}
      </ul>
      {lastBackup && <p className="mt-4 text-small text-muted tabular">{t.latest(lastBackup.file, size(lastBackup.bytes))}</p>}
    </>
  );
}
