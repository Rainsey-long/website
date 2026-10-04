/** PATCH a reading block's text and/or review state. Admin only, checked first. */
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { invalidateBlockTexts } from "@/lib/blockText";
import { json, readJsonCapped, sameOrigin } from "@/lib/http";

const BANNED = [/\bdiagnos/i, /\bdisease\b/i, /\bmedication\b/i, /\binvest in\b/i, /\bguarantee/i, /\bdestiny\b/i, /!/];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return json({ error: "Unauthorized" }, 401);
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  const { id } = await params;
  if (!/^[a-z0-9-]{1,64}$/.test(id)) return json({ error: "Not found" }, 404);
  const body = await readJsonCapped<{ text?: unknown; text_km?: unknown; review?: unknown }>(req, 8192);
  if (!body.ok) return body.res;
  const { text, text_km, review } = body.value;
  const row = getDb().prepare("SELECT id, text, text_km, review FROM text_blocks WHERE id = ?").get(id) as { id: string; text: string; text_km: string; review: string } | undefined;
  if (!row) return json({ error: "Not found" }, 404);
  let next = row.text;
  if (text !== undefined) {
    if (typeof text !== "string") return json({ error: "Bad request" }, 400);
    next = text.replace(/\s+/g, " ").trim();
    if (next.length < 20 || next.length > 400) return json({ error: "Text must be 20 to 400 characters." }, 400);
    if (!/[.?]$/.test(next)) return json({ error: "End the text with a full stop." }, 400);
    const bad = BANNED.find((r) => r.test(next));
    if (bad) return json({ error: "That wording breaks the content guidelines (no exclamation marks, health, investment, guarantees or destiny)." }, 400);
  }
  let nextKm = row.text_km;
  if (text_km !== undefined) {
    if (typeof text_km !== "string") return json({ error: "Bad request" }, 400);
    nextKm = text_km.replace(/\s+/g, " ").trim();
    // Khmer runs longer than English; empty means "show the English text".
    if (nextKm && (nextKm.length < 10 || nextKm.length > 800)) return json({ error: "Khmer text must be 10 to 800 characters, or empty." }, 400);
    if (nextKm && !/[។?]$/.test(nextKm)) return json({ error: "End the Khmer text with ។" }, 400);
    if (nextKm.includes("!")) return json({ error: "No exclamation marks (content guidelines)." }, 400);
  }
  const nextReview = review === undefined ? row.review : review;
  if (nextReview !== "draft" && nextReview !== "approved") return json({ error: "Bad request" }, 400);
  getDb().prepare("UPDATE text_blocks SET text = ?, text_km = ?, review = ?, updated_at = datetime('now'), updated_by = ? WHERE id = ?").run(next, nextKm, nextReview, s.username, id);
  invalidateBlockTexts();
  return json({ ok: true, text: next, text_km: nextKm, review: nextReview });
}
