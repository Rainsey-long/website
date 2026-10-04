/**
 * POST /api/admin/password { current, next } — change your own password.
 * Needs the current password (a stolen session alone cannot take over the
 * account), rate-limited per account, and bumps the session epoch, which
 * signs this admin out everywhere, including here (they sign in again).
 */
import { getDb } from "@/lib/db";
import { ADMIN_PASSWORD_MIN, bumpSessionEpoch, getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rateLimit";
import { json, readJsonCapped, requestLang, sameOrigin } from "@/lib/http";
import { defineMessages, khmerDigits } from "@/lib/i18n";

const perAccount = createRateLimiter(10 * 60_000, 10);

/** Wording only; the caller's language comes from `?lang=` (lib/http.ts requestLang). */
const T = defineMessages({
  en: {
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    badRequest: "Bad request",
    tooMany: "Too many attempts. Wait ten minutes.",
    short: (n: number) => `New password: at least ${n} characters.`,
    wrong: "The current password is not right.",
  },
  km: {
    unauthorized: "សូមចូលជាអ្នកគ្រប់គ្រងសិន។",
    forbidden: "មិនអនុញ្ញាតទេ។",
    badRequest: "សំណើមិនត្រឹមត្រូវ។",
    tooMany: "ព្យាយាមច្រើនដងពេក។ សូមរង់ចាំដប់នាទី។",
    short: (n: number) => `ពាក្យសម្ងាត់ថ្មី៖ យ៉ាងតិច ${khmerDigits(n)} តួអក្សរ។`,
    wrong: "ពាក្យសម្ងាត់បច្ចុប្បន្នមិនត្រឹមត្រូវទេ។",
  },
});

export async function POST(req: Request) {
  const t = T[requestLang(req)];
  const s = await getSession();
  if (!s) return json({ error: t.unauthorized }, 401);
  if (!sameOrigin(req)) return json({ error: t.forbidden }, 403);
  if (perAccount(`pw:${s.uid}`)) return json({ error: t.tooMany }, 429);
  const body = await readJsonCapped<{ current?: unknown; next?: unknown }>(req, 2048);
  if (!body.ok) return body.res;
  const { current, next } = body.value;
  if (typeof current !== "string" || typeof next !== "string") return json({ error: t.badRequest }, 400);
  if (next.length < ADMIN_PASSWORD_MIN || next.length > 200) return json({ error: t.short(ADMIN_PASSWORD_MIN) }, 400);
  const row = getDb().prepare("SELECT password_hash FROM users WHERE id = ?").get(s.uid) as { password_hash: string } | undefined;
  if (!row || !verifyPassword(current, row.password_hash)) return json({ error: t.wrong }, 400);
  getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(next), s.uid);
  bumpSessionEpoch(s.uid);
  console.log(`[admin] ${s.username} changed their password`);
  return json({ ok: true });
}
