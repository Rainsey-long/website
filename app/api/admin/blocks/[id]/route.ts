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
  const body = await readJsonCapped<{ text?: unknown; review?: unknown }>(req, 4096);
  if (!body.ok) return body.res;
  const { text, review } = body.value;
  const row = getDb().prepare("SELECT id, text, review FROM text_blocks WHERE id = ?").get(id) as { id: string; text: string; review: string } | undefined;
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
  const nextReview = review === undefined ? row.review : review;
  if (nextReview !== "draft" && nextReview !== "approved") return json({ error: "Bad request" }, 400);
  getDb().prepare("UPDATE text_blocks SET text = ?, review = ?, updated_at = datetime('now'), updated_by = ? WHERE id = ?").run(next, nextReview, s.username, id);
  invalidateBlockTexts();
  return json({ ok: true, text: next, review: nextReview });
}
