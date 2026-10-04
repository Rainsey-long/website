/**
 * Admin: anonymous "was this helpful" feedback. Filter, mark read, delete,
 * export as CSV, and see which reading blocks people found least helpful.
 * Visitor comments are rendered as React text, never HTML.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { FeedbackActions } from "@/components/client/AdminForms";
import { getSession } from "@/lib/auth";
import { getDb, type FeedbackRow } from "@/lib/db";

export const dynamic = "force-dynamic";
type Search = { searchParams: Promise<{ show?: string; page?: string }> };
const FILTERS: Array<[string, string, string]> = [
  ["unread", "Unread", "read_at IS NULL"],
  ["comments", "With a comment", "comment <> ''"],
  ["not_helpful", "Not helpful", "verdict = 'not_helpful'"],
  ["all", "All", "1 = 1"],
];
const PER_PAGE = 50;

export default async function FeedbackAdmin({ searchParams }: Search) {
  if (!(await getSession())) redirect("/admin/login");
  const sp = await searchParams;
  const filter = FILTERS.find(([k]) => k === sp.show) ?? FILTERS[0];
  const page = Math.max(1, Math.min(1000, Number.parseInt(sp.page ?? "1", 10) || 1));
  const db = getDb();
  // The WHERE fragment is one of the fixed strings above, chosen by code.
  const total = (db.prepare(`SELECT COUNT(*) AS n FROM feedback WHERE ${filter[2]}`).get() as { n: number }).n;
  const rows = db.prepare(`SELECT * FROM feedback WHERE ${filter[2]} ORDER BY id DESC LIMIT ? OFFSET ?`).all(PER_PAGE, (page - 1) * PER_PAGE) as FeedbackRow[];
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
          <h1 className="text-h1">Feedback</h1>
          <a className="link text-small" href="/api/admin/feedback/export">Download all as CSV</a>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-small">
          {FILTERS.map(([k, l]) => <Link key={k} className={`link ${k === filter[0] ? "font-semibold" : ""}`} aria-current={k === filter[0] ? "true" : undefined} href={href(k)}>{l}</Link>)}
        </div>
        <p className="mt-3 text-small text-muted tabular">{total} {total === 1 ? "item" : "items"}{pages > 1 ? `, page ${page} of ${pages}` : ""}</p>
        {rows.length === 0 ? <p className="mt-3">Nothing here.</p> : <FeedbackActions rows={rows} />}
        {pages > 1 && (
          <nav aria-label="Pages" className="mt-4 flex justify-between text-small">
            {page > 1 ? <Link className="link" href={href(filter[0], page - 1)}>Newer</Link> : <span />}
            {page < pages ? <Link className="link" href={href(filter[0], page + 1)}>Older</Link> : <span />}
          </nav>
        )}
      </div>
      <aside>
        <h2 className="text-h3">Blocks people found least helpful</h2>
        <p className="mt-1 text-small text-muted">At least 3 votes. Edit these first.</p>
        <ul className="mt-3 text-small tabular">
          {worst.map((w) => <li key={w.id} className="border-b border-rule py-2"><Link className="link" href={`/admin/readings?topic=${w.id.split("-")[0]}&show=all&q=${encodeURIComponent(w.id)}`}>{w.id}</Link>: {w.bad} of {w.total}</li>)}
        </ul>
      </aside>
    </section>
  );
}
