/**
 * Admin dashboard: the owner reviews reading text, enters the official Khmer
 * New Year moment, and reads feedback. Every read is behind getSession().
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { BlockEditor, SignOut, SongkranForm } from "@/components/client/AdminForms";
import { getSession } from "@/lib/auth";
import { getDb, type FeedbackRow, type TextBlockRow } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";
import { songkran } from "@/lib/khmer";
import { songkranOverride } from "@/lib/songkranStore";
import { diskStatus } from "@/lib/volumeHeadroom";

export const dynamic = "force-dynamic";
type Search = { searchParams: Promise<{ tab?: string; topic?: string; show?: string }> };

export default async function Admin({ searchParams }: Search) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  seedIfEmpty();
  const { tab = "blocks", topic = "love", show = "draft" } = await searchParams;
  const db = getDb();
  const totals = db.prepare("SELECT review, COUNT(*) AS n FROM text_blocks GROUP BY review").all() as Array<{ review: string; n: number }>;
  const n = (r: string) => totals.find((t) => t.review === r)?.n ?? 0;
  const disk = diskStatus();
  const tabs = [["blocks", "Reading text"], ["songkran", "Khmer New Year"], ["feedback", "Feedback"]] as const;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h1">Admin</h1>
        <div className="flex items-center gap-3"><span className="text-small text-muted">Signed in as {session.username}</span><SignOut /></div>
      </div>
      <p className="mt-2 text-small text-muted tabular">
        Reading blocks: {n("approved")} approved, {n("draft")} awaiting review.
        {disk.usedPct !== null && ` Volume ${disk.usedPct}% used (${disk.level}).`}
      </p>
      <nav aria-label="Admin" className="mt-5 flex gap-5 border-b border-rule">
        {tabs.map(([k, label]) => <Link key={k} href={`/admin?tab=${k}`} className={`link nav-link pb-3 ${tab === k ? "font-semibold" : ""}`} aria-current={tab === k ? "page" : undefined}>{label}</Link>)}
      </nav>

      {tab === "blocks" && (() => {
        const rows = db.prepare(`SELECT * FROM text_blocks WHERE topic = ? ${show === "all" ? "" : "AND review = ?"} ORDER BY kind, id`).all(...(show === "all" ? [topic] : [topic, show])) as TextBlockRow[];
        return (
          <section className="mt-6">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-small">
              {["love", "career", "money", "mood"].map((t) => <Link key={t} className={`link ${t === topic ? "font-semibold" : ""}`} href={`/admin?tab=blocks&topic=${t}&show=${show}`}>{t[0].toUpperCase() + t.slice(1)}</Link>)}
              <span className="text-muted">·</span>
              {[["draft", "Awaiting review"], ["approved", "Approved"], ["all", "All"]].map(([k, l]) => <Link key={k} className={`link ${k === show ? "font-semibold" : ""}`} href={`/admin?tab=blocks&topic=${topic}&show=${k}`}>{l}</Link>)}
            </div>
            <p className="mt-3 text-small text-muted">Edit the words, not the meaning: each block is chosen by the Moon&apos;s house and phase. Rules: warm, short sentences, no exclamation marks, no health, money actions, guarantees or doom.</p>
            {rows.length === 0 && <p className="mt-5">Nothing here. Every {topic} block in this view is done.</p>}
            <ul className="mt-4">
              {rows.map((r) => (
                <li key={r.id} className="border-b border-rule py-4">
                  <p className="text-small text-muted tabular">{r.id} · {r.kind} · {r.conditions} · {r.review}{r.updated_by ? ` · edited by ${r.updated_by}` : ""}</p>
                  <BlockEditor id={r.id} text={r.text} review={r.review} />
                  {r.text !== r.source_text && <p className="mt-2 text-small text-muted">Original: {r.source_text}</p>}
                </li>
              ))}
            </ul>
          </section>
        );
      })()}

      {tab === "songkran" && (() => {
        const year = new Date().getUTCFullYear() + (new Date().getUTCMonth() >= 4 ? 1 : 0);
        return (
          <section className="mt-6 grid gap-8 lg:grid-cols-2">
            {[year, year + 1].map((y) => {
              const o = songkranOverride(y);
              const c = songkran(y);
              return (
                <div key={y}>
                  <h2 className="text-h2">Khmer New Year {y}</h2>
                  <SongkranForm year={y} officialAt={o?.official_at ?? ""} tumneay={o?.tumneay ?? ""} source={o?.source ?? ""} calculated={`${c.date} ${c.time}`} />
                </div>
              );
            })}
          </section>
        );
      })()}

      {tab === "feedback" && (() => {
        const rows = db.prepare("SELECT * FROM feedback ORDER BY id DESC LIMIT 100").all() as FeedbackRow[];
        const worst = db.prepare(`
          WITH RECURSIVE split(id, rest, verdict) AS (
            SELECT '', block_ids || ',', verdict FROM feedback
            UNION ALL SELECT substr(rest, 0, instr(rest, ',')), substr(rest, instr(rest, ',') + 1), verdict FROM split WHERE rest <> ''
          )
          SELECT id, SUM(verdict = 'not_helpful') AS bad, COUNT(*) AS total FROM split WHERE id <> '' GROUP BY id HAVING total >= 3 ORDER BY bad * 1.0 / total DESC, total DESC LIMIT 15
        `).all() as Array<{ id: string; bad: number; total: number }>;
        return (
          <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_var(--size-rail)]">
            <div>
              <h2 className="text-h2">Latest feedback</h2>
              {rows.length === 0 && <p className="mt-3">No feedback yet.</p>}
              <ul className="mt-3">
                {rows.map((f) => (
                  <li key={f.id} className="border-b border-rule py-3 text-small">
                    <span className={f.verdict === "helpful" ? "text-jade font-semibold" : "text-clay font-semibold"}>{f.verdict === "helpful" ? "Helpful" : "Not helpful"}</span> · <Link className="link" href={f.path}>{f.path}</Link> · <span className="tabular text-muted">{f.created_at} UTC</span>
                    {f.comment && <p className="mt-1">{f.comment}</p>}
                  </li>
                ))}
              </ul>
            </div>
            <aside>
              <h2 className="text-h3">Blocks people found least helpful</h2>
              <p className="mt-1 text-small text-muted">At least 3 votes. Edit these first.</p>
              <ul className="mt-3 text-small tabular">{worst.map((w) => <li key={w.id} className="border-b border-rule py-2">{w.id}: {w.bad} of {w.total}</li>)}</ul>
            </aside>
          </section>
        );
      })()}
    </>
  );
}
