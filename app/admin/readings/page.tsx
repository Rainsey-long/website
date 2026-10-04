/**
 * Admin: daily reading text, both languages. Filter by topic and by state
 * (awaiting review, approved, missing Khmer, all) or search the words.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { BlockEditor } from "@/components/client/AdminForms";
import { getSession } from "@/lib/auth";
import { getDb, type TextBlockRow } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";
type Search = { searchParams: Promise<{ topic?: string; show?: string; q?: string }> };
const TOPICS = ["love", "career", "money", "mood"];
const SHOWS: Array<[string, string]> = [["draft", "Awaiting review"], ["nokm", "Missing Khmer"], ["approved", "Approved"], ["all", "All"]];

export default async function Readings({ searchParams }: Search) {
  if (!(await getSession())) redirect("/admin/login");
  seedIfEmpty();
  const sp = await searchParams;
  const topic = TOPICS.includes(sp.topic ?? "") ? sp.topic! : "love";
  const show = SHOWS.some(([k]) => k === sp.show) ? sp.show! : "draft";
  const q = (sp.q ?? "").trim().slice(0, 80);
  // Fixed SQL fragments chosen by code; every value is a bound parameter.
  const where = ["topic = ?"];
  const args: string[] = [topic];
  if (show === "draft" || show === "approved") { where.push("review = ?"); args.push(show); }
  if (show === "nokm") where.push("text_km = ''");
  if (q) { where.push("(id LIKE ? ESCAPE '\\' OR text LIKE ? ESCAPE '\\' OR text_km LIKE ? ESCAPE '\\')"); const like = `%${q.replace(/[\\%_]/g, (c) => "\\" + c)}%`; args.push(like, like, like); }
  const rows = getDb().prepare(`SELECT * FROM text_blocks WHERE ${where.join(" AND ")} ORDER BY kind, id`).all(...args) as TextBlockRow[];
  const href = (t: string, sh: string) => `/admin/readings?topic=${t}&show=${sh}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <section>
      <h1 className="text-h1">Readings</h1>
      <p className="mt-2 max-w-reading text-small text-muted">Edit the words, not the meaning: each block is chosen by the Moon&apos;s house and phase. Warm, short sentences; no exclamation marks, health, money actions, guarantees or doom. An empty Khmer box shows the English text on Khmer pages.</p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-small">
        {TOPICS.map((t) => <Link key={t} className={`link ${t === topic ? "font-semibold" : ""}`} aria-current={t === topic ? "page" : undefined} href={href(t, show)}>{t[0].toUpperCase() + t.slice(1)}</Link>)}
        <span className="text-muted" aria-hidden="true">·</span>
        {SHOWS.map(([k, l]) => <Link key={k} className={`link ${k === show ? "font-semibold" : ""}`} aria-current={k === show ? "true" : undefined} href={href(topic, k)}>{l}</Link>)}
      </div>
      <form method="get" action="/admin/readings" className="mt-4 flex max-w-reading gap-3">
        <input type="hidden" name="topic" value={topic} />
        <input type="hidden" name="show" value={show} />
        <label className="sr-only" htmlFor="rq">Search reading text</label>
        <input className="field" id="rq" name="q" defaultValue={q} placeholder="Search words or block id" />
        <button className="btn-secondary" type="submit">Search</button>
      </form>
      <p className="mt-4 text-small text-muted tabular">{rows.length} {rows.length === 1 ? "block" : "blocks"}</p>
      {rows.length === 0 && <p className="mt-3">Nothing here. Every {topic} block in this view is done.</p>}
      <ul className="mt-2">
        {rows.map((r) => (
          <li key={r.id} className="border-b border-rule py-4">
            <p className="text-small text-muted tabular">{r.id} · {r.kind} · {r.conditions} · {r.review}{r.updated_by ? ` · edited by ${r.updated_by}` : ""}</p>
            <BlockEditor id={r.id} text={r.text} textKm={r.text_km} review={r.review} />
            {r.text !== r.source_text && <p className="mt-2 text-small text-muted">Original: {r.source_text}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
