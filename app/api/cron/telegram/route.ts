/**
 * GET /api/cron/telegram — called once a day by a scheduler (a Railway cron
 * service) with `Authorization: Bearer $TELEGRAM_CRON_SECRET`. Posts today's
 * share card to the owner's Telegram channel (lib/telegram.ts).
 *
 * Same shape as /api/cron/backup: the secret (its own, ≥ 32 characters) is
 * compared in constant time after a length check, before any other work; 503
 * when the secret or the bot is not configured (fails closed); 409 while a
 * post is in flight. A global ceiling bounds outbound calls even for a
 * caller holding the secret. Idempotent per day: a second call answers
 * `already-posted` without calling Telegram.
 */
import { timingSafeEqual } from "node:crypto";
import { json } from "@/lib/http";
import { createRateLimiter, GLOBAL_LIMIT_KEY } from "@/lib/rateLimit";
import { postDailyCard, telegramConfig } from "@/lib/telegram";

export const dynamic = "force-dynamic";

const flag = globalThis as unknown as { __alTelegramRunning?: boolean; __alTelegramLimit?: ReturnType<typeof createRateLimiter> };
// 20 calls an hour is far above a daily schedule plus retries.
const limited = (flag.__alTelegramLimit ??= createRateLimiter(60 * 60 * 1000, 20));

function authorised(req: Request): boolean | null {
  const secret = process.env.TELEGRAM_CRON_SECRET;
  if (!secret || secret.length < 32) return null;
  const got = Buffer.from(req.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

export async function GET(req: Request) {
  const ok = authorised(req);
  if (ok === null) return json({ error: "Telegram posting is not configured" }, 503);
  if (!ok) return json({ error: "Unauthorized" }, 401);
  const cfg = telegramConfig();
  if (!cfg) return json({ error: "Telegram posting is not configured" }, 503);
  if (limited(GLOBAL_LIMIT_KEY)) return json({ error: "Too many requests" }, 429);
  if (flag.__alTelegramRunning) return json({ error: "A post is already in progress" }, 409);
  flag.__alTelegramRunning = true;
  try {
    const r = await postDailyCard(cfg);
    if (r.posted) {
      console.log(`[telegram] posted the card for ${r.date}`);
      return json({ ok: true, posted: true, date: r.date });
    }
    if (r.reason === "already-posted") return json({ ok: true, posted: false, date: r.date, skipped: "already posted today" });
    console.error(`[telegram] send failed for ${r.date}: ${r.status}`);
    return json({ error: "Telegram did not accept the post" }, 502);
  } catch (err) {
    console.error("[telegram] failed", err instanceof Error ? err.name : "error");
    return json({ error: "Posting failed" }, 500);
  } finally {
    flag.__alTelegramRunning = false;
  }
}
