/**
 * POST /api/feedback — anonymous "was this helpful". No identity stored.
 * Global ceiling first (a per-caller key is forgeable without a trusted proxy),
 * then a per-caller bucket. The table rotates its oldest rows past the cap
 * instead of refusing, but rotation itself is capped per day so a flood
 * cannot erase the unread backlog (CamboMath /api/reports lessons).
 */
import { getDb } from "@/lib/db";
import { BLOCKS, TOPICS } from "@/lib/reading-engine";
import { WEEKLY_BLOCKS } from "@/lib/weekly";
import { SIGNS } from "@/lib/western";
import { GLOBAL_LIMIT_KEY, clientIp, createRateLimiter } from "@/lib/rateLimit";
import { json, readJsonCapped, sameOrigin } from "@/lib/http";

const globalLimit = createRateLimiter(10 * 60_000, 600);
const perCaller = createRateLimiter(10 * 60_000, 20);
const rotationBudget = createRateLimiter(24 * 3600_000, 500);
const MAX_ROWS = 20_000;
// Only the twelve sign slugs, a daily date or a weekly Monday path.
const FEEDBACK_PATH = new RegExp(`^/horoscope/(${SIGNS.map((x) => x.slug).join("|")})/(week/)?\\d{4}-\\d{2}-\\d{2}$`);
const BLOCK_IDS = new Set([...TOPICS.flatMap((t) => BLOCKS[t].map((b) => b.id)), ...WEEKLY_BLOCKS.map((b) => b.id)]);

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  if (globalLimit(GLOBAL_LIMIT_KEY)) return json({ error: "Busy" }, 429);
  if (perCaller(clientIp(req))) return json({ error: "Too many requests" }, 429);
  const body = await readJsonCapped<{ path?: unknown; verdict?: unknown; blockIds?: unknown; comment?: unknown }>(req, 4096);
  if (!body.ok) return body.res;
  const { path, verdict, blockIds, comment } = body.value;
  if (typeof path !== "string" || path.length > 200 || !FEEDBACK_PATH.test(path)) return json({ error: "Bad request" }, 400);
  if (verdict !== "helpful" && verdict !== "not_helpful") return json({ error: "Bad request" }, 400);
  const ids = Array.isArray(blockIds) ? blockIds.filter((x): x is string => typeof x === "string" && BLOCK_IDS.has(x)).slice(0, 12) : [];
  const text = typeof comment === "string" ? comment.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim().slice(0, 500) : "";
  try {
    const db = getDb();
    const count = (db.prepare("SELECT COUNT(*) AS n FROM feedback").get() as { n: number }).n;
    if (count >= MAX_ROWS) {
      if (rotationBudget(GLOBAL_LIMIT_KEY)) return json({ error: "Busy" }, 429);
      db.prepare("DELETE FROM feedback WHERE id = (SELECT MIN(id) FROM feedback)").run();
    }
    db.prepare("INSERT INTO feedback (path, verdict, block_ids, comment) VALUES (?, ?, ?, ?)").run(path, verdict, ids.join(","), text);
    return json({ ok: true });
  } catch (err) {
    console.error("[feedback] insert failed", err);
    return json({ error: "Server error" }, 500);
  }
}
