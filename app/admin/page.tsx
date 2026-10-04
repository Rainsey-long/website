/**
 * Admin overview: what needs the owner's attention, at a glance, with a link
 * to the section that fixes each thing. Every read is behind getSession().
 */
import Link from "@/components/client/LocaleLink";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { CONTENT_PATHS, repoSource } from "@/lib/content";
import { fileSize as size, listBackups } from "@/lib/backup";
import { songkran } from "@/lib/khmer";
import { songkranOverride } from "@/lib/songkranStore";
import { diskStatus } from "@/lib/volumeHeadroom";
import { longDate } from "@/lib/dates";
import { defineMessages, khmerDigits, localePath, type Lang } from "@/lib/i18n";
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
    kmTitle: "Khmer reading text",
    translatedOf: (a: number, n: number) => `${a} of ${n} translated`,
    noKm: (n: number) => `${n} show English on Khmer pages`,
    allKm: "Every block has Khmer",
    contentTitle: "Profiles and forecasts",
    pages: (n: number, e: number) => `${n} pages, ${e} edited here`,
    kmMissing: (n: number) => `${n} have no Khmer version yet`,
    allKmPages: "All have a Khmer version",
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
  km: {
    title: "ទិដ្ឋភាពទូទៅ",
    lead: "អ្វីដែលត្រូវយកចិត្តទុកដាក់។ ធាតុនីមួយៗមានតំណទៅកន្លែងដែលត្រូវកែ។",
    open: "បើក",
    readingTitle: "អត្ថបទទស្សន៍ទាយ",
    approvedOf: (a: number, n: number) => `បានអនុម័ត ${khmerDigits(a)} ក្នុងចំណោម ${khmerDigits(n)}`,
    drafts: (n: number) => `សេចក្ដីព្រាង ${khmerDigits(n)} ត្រូវពិនិត្យ`,
    allApproved: "បានអនុម័តទាំងអស់",
    kmTitle: "អត្ថបទទស្សន៍ទាយជាភាសាខ្មែរ",
    translatedOf: (a: number, n: number) => `បានបកប្រែ ${khmerDigits(a)} ក្នុងចំណោម ${khmerDigits(n)}`,
    noKm: (n: number) => `${khmerDigits(n)} បង្ហាញភាសាអង់គ្លេសនៅលើទំព័រខ្មែរ`,
    allKm: "គ្រប់ប្លុកមានភាសាខ្មែរ",
    contentTitle: "ប្រវត្តិរូប និងការព្យាករណ៍",
    pages: (n: number, e: number) => `${khmerDigits(n)} ទំព័រ កែនៅទីនេះ ${khmerDigits(e)}`,
    kmMissing: (n: number) => `${khmerDigits(n)} មិនទាន់មានភាសាខ្មែរ`,
    allKmPages: "ទាំងអស់មានភាសាខ្មែររួចហើយ",
    feedbackTitle: "មតិយោបល់",
    unread: (n: number) => `មិនទាន់អាន ${khmerDigits(n)}`,
    helpfulWeek: (g: number, n: number) => `មានប្រយោជន៍ ${khmerDigits(g)} ក្នុងចំណោម ${khmerDigits(n)} ក្នុងរយៈពេល ៧ ថ្ងៃចុងក្រោយ`,
    noneWeek: "គ្មានក្នុងរយៈពេល ៧ ថ្ងៃចុងក្រោយ",
    nyTitle: (y: number) => `ចូលឆ្នាំខ្មែរ ${khmerDigits(y)}`,
    official: (v: string) => `ផ្លូវការ៖ ${v}`,
    calculated: (v: string) => `គណនា៖ ${v}`,
    officialIn: "បានបញ្ចូលពេលវេលាផ្លូវការហើយ",
    enterOfficial: "សូមបញ្ចូលនាទីរបស់ក្រសួង នៅពេលប្រកាស",
    backupsTitle: "ការបម្រុងទុក",
    last: (v: string) => `ចុងក្រោយ៖ ${v} UTC`,
    noBackup: "មិនទាន់មានការបម្រុងទុក",
    kept: (n: number) => `រក្សាទុក ${khmerDigits(n)}`,
    volume: (p: number) => ` · ថាសផ្ទុកប្រើអស់ ${khmerDigits(p)}%`,
    latest: (file: string, s: string) => `ការបម្រុងទុកចុងក្រោយ ${file} ${khmerDigits(s)}។`,
  },
});

/** "2027-04-14 10:48" → itself in English, "ទី១៤ ខែមេសា ឆ្នាំ២០២៧ ម៉ោង ១០:៤៨" in Khmer. */
function moment(date: string, time: string, lang: Lang): string {
  return lang === "km" ? `${longDate(date, "km")} ម៉ោង ${khmerDigits(time)}` : `${date} ${time}`;
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
  const officialShown = official ? moment(official.slice(0, 10), official.slice(11), lang) : "";
  const lastShown = lastBackup ? moment(lastBackup.at.slice(0, 10), lastBackup.at.slice(11, 16), lang) : "";

  const cards: Array<{ title: string; value: string; note: string; href: string; attention: boolean }> = [
    { title: t.readingTitle, value: t.approvedOf(blocks - drafts, blocks), note: drafts ? t.drafts(drafts) : t.allApproved, href: "/admin/readings?show=draft", attention: drafts > 0 },
    { title: t.kmTitle, value: t.translatedOf(blocks - noKm, blocks), note: noKm ? t.noKm(noKm) : t.allKm, href: "/admin/readings?show=nokm", attention: noKm > 0 },
    { title: t.contentTitle, value: t.pages(CONTENT_PATHS.length, overrides), note: kmMissing ? t.kmMissing(kmMissing) : t.allKmPages, href: "/admin/content", attention: kmMissing > 0 },
    { title: t.feedbackTitle, value: t.unread(unread), note: week.n ? t.helpfulWeek(week.good ?? 0, week.n) : t.noneWeek, href: "/admin/feedback", attention: unread > 0 },
    { title: t.nyTitle(nyYear), value: official ? t.official(officialShown) : t.calculated(moment(ny.date, ny.time, lang)), note: official ? t.officialIn : t.enterOfficial, href: "/admin/songkran", attention: !official },
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
