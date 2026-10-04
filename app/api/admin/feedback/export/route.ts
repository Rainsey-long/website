/**
 * GET /api/admin/feedback/export — all feedback as CSV, admin only.
 * Cells that a spreadsheet would read as a formula (= + - @, tab, CR) get a
 * leading apostrophe: comments are visitor-written (CSV injection).
 */
import { getDb, type FeedbackRow } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { json, requestLang } from "@/lib/http";

export const dynamic = "force-dynamic";

function cell(v: unknown): string {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  if (!(await getSession())) return json({ error: requestLang(req) === "km" ? "សូមចូលជាអ្នកគ្រប់គ្រងសិន។" : "Unauthorized" }, 401);
  const rows = getDb().prepare("SELECT * FROM feedback ORDER BY id DESC").all() as FeedbackRow[];
  const head = requestLang(req) === "km"
    ? ["លេខ", "ពេលបង្កើត (UTC)", "ទំព័រ", "ការវាយតម្លៃ", "ប្លុក", "មតិ", "ពេលអាន (UTC)"]
    : ["id", "created_at_utc", "page", "verdict", "blocks", "comment", "read_at_utc"];
  const lines = [head.join(","), ...rows.map((r) => [r.id, r.created_at, r.path, r.verdict, r.block_ids, r.comment, r.read_at ?? ""].map(cell).join(","))];
  return new Response("﻿" + lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="feedback-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
