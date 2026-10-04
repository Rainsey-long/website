/** PATCH a reading block's text and/or review state. Admin only, checked first. */
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { invalidateBlockTexts } from "@/lib/blockText";
import { json, readJsonCapped, requestLang, sameOrigin } from "@/lib/http";
import { defineMessages } from "@/lib/i18n";

const BANNED = [/\bdiagnos/i, /\bdisease\b/i, /\bmedication\b/i, /\binvest in\b/i, /\bguarantee/i, /\bdestiny\b/i, /!/];

/** Wording only; the caller's language comes from `?lang=` (lib/http.ts requestLang). */
const T = defineMessages({
  en: {
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    badRequest: "Bad request",
    notFound: "Not found",
    length: "Text must be 20 to 400 characters.",
    fullStop: "End the text with a full stop.",
    guidelines: "That wording breaks the content guidelines (no exclamation marks, health, investment, guarantees or destiny).",
    kmLength: "Khmer text must be 10 to 800 characters, or empty.",
    kmEnd: "End the Khmer text with ។",
    kmBang: "No exclamation marks (content guidelines).",
  },
  km: {
    unauthorized: "សូមចូលជាអ្នកគ្រប់គ្រងសិន។",
    forbidden: "មិនអនុញ្ញាតទេ។",
    badRequest: "សំណើមិនត្រឹមត្រូវ។",
    notFound: "រកមិនឃើញទេ។",
    length: "អត្ថបទអង់គ្លេសត្រូវមានពី ២០ ដល់ ៤០០ តួអក្សរ។",
    fullStop: "សូមបញ្ចប់អត្ថបទអង់គ្លេសដោយសញ្ញាចុច (.)។",
    guidelines: "ពាក្យពេចន៍នេះខុសគោលការណ៍ណែនាំខ្លឹមសារ (គ្មានសញ្ញាឧទាន សុខភាព ការវិនិយោគ ការធានា ឬវាសនា)។",
    kmLength: "អត្ថបទខ្មែរត្រូវមានពី ១០ ដល់ ៨០០ តួអក្សរ ឬទុកទទេ។",
    kmEnd: "សូមបញ្ចប់អត្ថបទខ្មែរដោយ ។",
    kmBang: "កុំប្រើសញ្ញាឧទាន (គោលការណ៍ណែនាំខ្លឹមសារ)។",
  },
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = T[requestLang(req)];
  const s = await getSession();
  if (!s) return json({ error: t.unauthorized }, 401);
  if (!sameOrigin(req)) return json({ error: t.forbidden }, 403);
  const { id } = await params;
  if (!/^[a-z0-9-]{1,64}$/.test(id)) return json({ error: t.notFound }, 404);
  const body = await readJsonCapped<{ text?: unknown; text_km?: unknown; review?: unknown }>(req, 8192);
  if (!body.ok) return body.res;
  const { text, text_km, review } = body.value;
  const row = getDb().prepare("SELECT id, text, text_km, review FROM text_blocks WHERE id = ?").get(id) as { id: string; text: string; text_km: string; review: string } | undefined;
  if (!row) return json({ error: t.notFound }, 404);
  let next = row.text;
  if (text !== undefined) {
    if (typeof text !== "string") return json({ error: t.badRequest }, 400);
    next = text.replace(/\s+/g, " ").trim();
    if (next.length < 20 || next.length > 400) return json({ error: t.length }, 400);
    if (!/[.?]$/.test(next)) return json({ error: t.fullStop }, 400);
    const bad = BANNED.find((r) => r.test(next));
    if (bad) return json({ error: t.guidelines }, 400);
  }
  let nextKm = row.text_km;
  if (text_km !== undefined) {
    if (typeof text_km !== "string") return json({ error: t.badRequest }, 400);
    nextKm = text_km.replace(/\s+/g, " ").trim();
    // Khmer runs longer than English; empty means "show the English text".
    if (nextKm && (nextKm.length < 10 || nextKm.length > 800)) return json({ error: t.kmLength }, 400);
    if (nextKm && !/[។?]$/.test(nextKm)) return json({ error: t.kmEnd }, 400);
    if (nextKm.includes("!")) return json({ error: t.kmBang }, 400);
  }
  const nextReview = review === undefined ? row.review : review;
  if (nextReview !== "draft" && nextReview !== "approved") return json({ error: t.badRequest }, 400);
  getDb().prepare("UPDATE text_blocks SET text = ?, text_km = ?, review = ?, updated_at = datetime('now'), updated_by = ? WHERE id = ?").run(next, nextKm, nextReview, s.username, id);
  invalidateBlockTexts();
  return json({ ok: true, text: next, text_km: nextKm, review: nextReview });
}
