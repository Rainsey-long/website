/**
 * POST   /api/admin/users { username, password }  add an admin
 * DELETE /api/admin/users { id }                  remove an admin
 * Admin only (checked first), same-origin. Never removes the last admin, and an
 * admin cannot remove themselves (sign in as another admin to do that), so the
 * dashboard can never lock its owner out. A removed admin's sessions die at
 * once: getSession() re-reads the row on every request.
 */
import { getDb } from "@/lib/db";
import { ADMIN_PASSWORD_MIN, getSession, hashPassword } from "@/lib/auth";
import { json, readJsonCapped, sameOrigin } from "@/lib/http";
import { defineMessages } from "@/lib/i18n";

const USERNAME = /^[A-Za-z0-9_.-]{3,32}$/;

const T = defineMessages({
  en: {
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    badRequest: "Bad request",
    notFound: "Not found",
    username: "Username: 3 to 32 letters, numbers, dots, dashes or underscores.",
    password: (n: number) => `Password: at least ${n} characters.`,
    taken: "That username is taken.",
    self: "You cannot remove your own account.",
    last: "The last admin cannot be removed.",
  },
});

export async function POST(req: Request) {
  const t = T.en;
  const s = await getSession();
  if (!s) return json({ error: t.unauthorized }, 401);
  if (!sameOrigin(req)) return json({ error: t.forbidden }, 403);
  const body = await readJsonCapped<{ username?: unknown; password?: unknown }>(req, 2048);
  if (!body.ok) return body.res;
  const { username, password } = body.value;
  if (typeof username !== "string" || !USERNAME.test(username)) return json({ error: t.username }, 400);
  if (typeof password !== "string" || password.length < ADMIN_PASSWORD_MIN || password.length > 200) return json({ error: t.password(ADMIN_PASSWORD_MIN) }, 400);
  const r = getDb().prepare("INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)").run(username, hashPassword(password));
  if (r.changes === 0) return json({ error: t.taken }, 409);
  console.log(`[admin] ${s.username} added admin ${username}`);
  return json({ ok: true });
}

export async function DELETE(req: Request) {
  const t = T.en;
  const s = await getSession();
  if (!s) return json({ error: t.unauthorized }, 401);
  if (!sameOrigin(req)) return json({ error: t.forbidden }, 403);
  const body = await readJsonCapped<{ id?: unknown }>(req, 512);
  if (!body.ok) return body.res;
  const id = body.value.id;
  if (!Number.isInteger(id)) return json({ error: t.badRequest }, 400);
  if (id === s.uid) return json({ error: t.self }, 400);
  const db = getDb();
  const result = db.transaction(() => {
    const total = (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
    if (total <= 1) return "last";
    return db.prepare("DELETE FROM users WHERE id = ?").run(id).changes ? "ok" : "missing";
  })();
  if (result === "last") return json({ error: t.last }, 400);
  if (result === "missing") return json({ error: t.notFound }, 404);
  console.log(`[admin] ${s.username} removed admin #${id}`);
  return json({ ok: true });
}
