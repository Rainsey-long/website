/**
 * Admin: anonymous "was this helpful" feedback. Filter, mark read, delete,
 * export as CSV, and see which reading blocks people found least helpful.
 * Visitor comments are rendered as React text, never HTML.
 */
import Link from "@/components/client/LocaleLink";
import { redirect } from "next/navigation";
import { FeedbackActions } from "@/components/client/AdminForms";
import { getSession } from "@/lib/auth";
import { getDb, type FeedbackRow } from "@/lib/db";
import { defineMessages, khmerDigits, localePath } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

export const dynamic = "force-dynamic";
type Search = { searchParams: Promise<{ show?: string; page?: string }> };
const FILTERS: Array<["unread" | "comments" | "not_helpful" | "all", string]> = [
  ["unread", "read_at IS NULL"],
  ["comments", "comment <> ''"],
  ["not_helpful", "verdict = 'not_helpful'"],
  ["all", "1 = 1"],
];
const PER_PAGE = 50;

const T = defineMessages({
  en: {
    title: "Feedback",
    csv: "Download all as CSV",
    filters: { unread: "Unread", comments: "With a comment", not_helpful: "Not helpful", all: "All" },
    count: (n: number) => `${n} ${n === 1 ? "item" : "items"}`,
    pageOf: (p: number, n: number) => `, page ${p} of ${n}`,
    empty: "Nothing here.",
    pages: "Pages",
    newer: "Newer",
    older: "Older",
    worstTitle: "Blocks people found least helpful",
    worstLead: "At least 3 votes. Edit these first.",
    of: (bad: number, total: number) => `${bad} of ${total}`,
  },
  km: {
    title: "មតិយោបល់",
    csv: "ទាញយកទាំងអស់ជា CSV",
    filters: { unread: "មិនទាន់អាន", comments: "មានមតិ", not_helpful: "គ្មានប្រយោជន៍", all: "ទាំងអស់" },
    count: (n: number) => `${khmerDigits(n)} ធាតុ`,
    pageOf: (p: number, n: number) => ` ទំព័រទី ${khmerDigits(p)} នៃ ${khmerDigits(n)}`,
    empty: "គ្មានអ្វីនៅទីនេះទេ។",
    pages: "ទំព័រ",
    newer: "ថ្មីជាង",
    older: "ចាស់ជាង",
    worstTitle: "ប្លុកដែលគេយល់ថាមានប្រយោជន៍តិចបំផុត",
    worstLead: "យ៉ាងតិច ៣ សំឡេង។ សូមកែប្លុកទាំងនេះមុនគេ។",
    of: (bad: number, total: number) => `${khmerDigits(bad)} ក្នុងចំណោម ${khmerDigits(total)}`,
  },
});

export default async function FeedbackAdmin({ searchParams }: Search) {
  const lang = await getLang();
  if (!(await getSession())) redirect(localePath("/admin/login", lang));
  const t = T[lang];
  const sp = await searchParams;
  const filter = FILTERS.find(([k]) => k === sp.show) ?? FILTERS[0];
  const page = Math.max(1, Math.min(1000, Number.parseInt(sp.page ?? "1", 10) || 1));
  const db = getDb();
  // The WHERE fragment is one of the fixed strings above, chosen by code.
  const total = (db.prepare(`SELECT COUNT(*) AS n FROM feedback WHERE ${filter[1]}`).get() as { n: number }).n;
  const rows = db.prepare(`SELECT * FROM feedback WHERE ${filter[1]} ORDER BY id DESC LIMIT ? OFFSET ?`).all(PER_PAGE, (page - 1) * PER_PAGE) as FeedbackRow[];
  const worst = db.prepare(`
    WITH RECURSIVE split(id, rest, verdict) AS (
      SELECT '', block_ids || ',', verdict FROM feedback
      UNION ALL SELECT substr(rest, 0, instr(rest, ',')), substr(rest, instr(rest, ',') + 1), verdict FROM split WHERE rest <> ''
    )
    SELECT id, SUM(verdict = 'not_helpful') AS bad, COUNT(*) AS total FROM split WHERE id <> '' GROUP BY id HAVING total >= 3 ORDER BY bad * 1.0 / total DESC, total DESC LIMIT 15
  `).all() as Array<{ id: string; bad: number; total: number }>;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const href = (k: string, p = 1) => `/admin/feedback?show=${k}${p > 1 ? `&page=${p}` : ""}`;

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_var(--size-rail)]">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-h1">{t.title}</h1>
          {/* An API URL: never /km-prefixed. The CSV itself stays English (column names, UTC times). */}
          <a className="link text-small" href={`/api/admin/feedback/export${lang === "km" ? "?lang=km" : ""}`}>{t.csv}</a>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-small">
          {FILTERS.map(([k]) => <Link key={k} className={`link ${k === filter[0] ? "font-semibold" : ""}`} aria-current={k === filter[0] ? "true" : undefined} href={href(k)}>{t.filters[k]}</Link>)}
        </div>
        <p className="mt-3 text-small text-muted tabular">{t.count(total)}{pages > 1 ? t.pageOf(page, pages) : ""}</p>
        {rows.length === 0 ? <p className="mt-3">{t.empty}</p> : <FeedbackActions rows={rows} />}
        {pages > 1 && (
          <nav aria-label={t.pages} className="mt-4 flex justify-between text-small">
            {page > 1 ? <Link className="link" href={href(filter[0], page - 1)}>{t.newer}</Link> : <span />}
            {page < pages ? <Link className="link" href={href(filter[0], page + 1)}>{t.older}</Link> : <span />}
          </nav>
        )}
      </div>
      <aside>
        <h2 className="text-h3">{t.worstTitle}</h2>
        <p className="mt-1 text-small text-muted">{t.worstLead}</p>
        <ul className="mt-3 text-small tabular">
          {worst.map((w) => <li key={w.id} className="border-b border-rule py-2"><Link className="link" lang="en" href={`/admin/readings?topic=${w.id.split("-")[0]}&show=all&q=${encodeURIComponent(w.id)}`}>{w.id}</Link>: {t.of(w.bad, w.total)}</li>)}
        </ul>
      </aside>
    </section>
  );
}
