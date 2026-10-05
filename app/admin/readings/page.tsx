/**
 * Admin: daily and weekly reading text (English). Filter by topic and by state
 * (awaiting review, approved, all) or search the words.
 */
import Link from "@/components/client/LocaleLink";
import { redirect } from "next/navigation";
import { BlockEditor } from "@/components/client/AdminForms";
import { getSession } from "@/lib/auth";
import { getDb, type TextBlockRow } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { defineMessages, localePath } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

export const dynamic = "force-dynamic";
type Search = { searchParams: Promise<{ topic?: string; show?: string; q?: string }> };
const TOPICS = ["love", "career", "money", "mood", "week"] as const;
const SHOWS = ["draft", "approved", "all"] as const;

const T = defineMessages({
  en: {
    title: "Readings",
    lead: "Edit the words, not the meaning: each block is chosen by the Moon's house and phase. Warm, short sentences; no exclamation marks, health, money actions, guarantees or doom.",
    topics: { love: "Love", career: "Career", money: "Money", mood: "Mood", week: "Weekly" },
    shows: { draft: "Awaiting review", approved: "Approved", all: "All" },
    review: { draft: "draft", approved: "approved" },
    searchLabel: "Search reading text",
    searchPlaceholder: "Search words or block id",
    search: "Search",
    count: (n: number) => `${n} ${n === 1 ? "block" : "blocks"}`,
    empty: (topic: string) => `Nothing here. Every ${topic} block in this view is done.`,
    editedBy: (u: string) => ` · edited by ${u}`,
    original: "Original:",
  },
});

export default async function Readings({ searchParams }: Search) {
  const lang = await getLang();
  if (!(await getSession())) redirect(localePath("/admin/login", lang));
  const t = T[lang];
  seedIfEmpty();
  const sp = await searchParams;
  const topic = TOPICS.find((x) => x === sp.topic) ?? "love";
  const show = SHOWS.find((x) => x === sp.show) ?? "draft";
  const q = (sp.q ?? "").trim().slice(0, 80);
  // Fixed SQL fragments chosen by code; every value is a bound parameter.
  const where = ["topic = ?"];
  const args: string[] = [topic];
  if (show === "draft" || show === "approved") { where.push("review = ?"); args.push(show); }
  if (q) { where.push("(id LIKE ? ESCAPE '\\' OR text LIKE ? ESCAPE '\\')"); const like = `%${q.replace(/[\\%_]/g, (c) => "\\" + c)}%`; args.push(like, like); }
  const rows = getDb().prepare(`SELECT * FROM text_blocks WHERE ${where.join(" AND ")} ORDER BY kind, id`).all(...args) as TextBlockRow[];
  const href = (tp: string, sh: string) => `/admin/readings?topic=${tp}&show=${sh}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <section>
      <h1 className="text-h1">{t.title}</h1>
      <p className="mt-2 max-w-reading text-small text-muted">{t.lead}</p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-small">
        {TOPICS.map((tp) => <Link key={tp} className={`link inline-flex min-h-tap items-center ${tp === topic ? "font-semibold" : ""}`} aria-current={tp === topic ? "page" : undefined} href={href(tp, show)}>{t.topics[tp]}</Link>)}
        <span className="text-muted" aria-hidden="true">·</span>
        {SHOWS.map((k) => <Link key={k} className={`link inline-flex min-h-tap items-center ${k === show ? "font-semibold" : ""}`} aria-current={k === show ? "true" : undefined} href={href(topic, k)}>{t.shows[k]}</Link>)}
      </div>
      <form method="get" action={localePath("/admin/readings", lang)} className="mt-4 flex max-w-reading gap-3">
        <input type="hidden" name="topic" value={topic} />
        <input type="hidden" name="show" value={show} />
        <label className="sr-only" htmlFor="rq">{t.searchLabel}</label>
        <input className="field" id="rq" name="q" defaultValue={q} placeholder={t.searchPlaceholder} />
        <button className="btn-secondary" type="submit">{t.search}</button>
      </form>
      <p className="mt-4 text-small text-muted tabular">{t.count(rows.length)}</p>
      {rows.length === 0 && <p className="mt-3">{t.empty(topic)}</p>}
      <ul className="mt-2">
        {rows.map((r) => (
          <li key={r.id} className="border-b border-rule py-4">
            <p className="text-small text-muted tabular"><span lang="en">{r.id} · {r.kind} · {r.conditions}</span> · {t.review[r.review]}{r.updated_by ? t.editedBy(r.updated_by) : ""}</p>
            <BlockEditor id={r.id} text={r.text} review={r.review} />
            {r.text !== r.source_text && <p className="mt-2 text-small text-muted">{t.original} <span lang="en">{r.source_text}</span></p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
