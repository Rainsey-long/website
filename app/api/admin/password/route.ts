/**
 * POST /api/admin/password { current, next } — change your own password.
 * Needs the current password (a stolen session alone cannot take over the
 * account), rate-limited per account, and bumps the session epoch, which
 * signs this admin out everywhere, including here (they sign in again).
 */
import { getDb } from "@/lib/db";
import { ADMIN_PASSWORD_MIN, bumpSessionEpoch, getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rateLimit";
import { json, readJsonCapped, sameOrigin } from "@/lib/http";

const perAccount = createRateLimiter(10 * 60_000, 10);

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return json({ error: "Unauthorized" }, 401);
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  if (perAccount(`pw:${s.uid}`)) return json({ error: "Too many attempts. Wait ten minutes." }, 429);
  const body = await readJsonCapped<{ current?: unknown; next?: unknown }>(req, 2048);
  if (!body.ok) return body.res;
  const { current, next } = body.value;
  if (typeof current !== "string" || typeof next !== "string") return json({ error: "Bad request" }, 400);
  if (next.length < ADMIN_PASSWORD_MIN || next.length > 200) return json({ error: `New password: at least ${ADMIN_PASSWORD_MIN} characters.` }, 400);
  const row = getDb().prepare("SELECT password_hash FROM users WHERE id = ?").get(s.uid) as { password_hash: string } | undefined;
  if (!row || !verifyPassword(current, row.password_hash)) return json({ error: "The current password is not right." }, 400);
  getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(next), s.uid);
  bumpSessionEpoch(s.uid);
  console.log(`[admin] ${s.username} changed their password`);
  return json({ ok: true });
}
