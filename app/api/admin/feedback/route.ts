/**
 * PATCH  /api/admin/feedback { ids: number[], read: boolean }  mark read / unread
 * DELETE /api/admin/feedback { ids: number[] }                  delete rows
 * Admin only (checked first), same-origin, at most 200 ids per call.
 */
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { json, readJsonCapped, sameOrigin } from "@/lib/http";
import { defineMessages } from "@/lib/i18n";

const T = defineMessages({
  en: {
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    badRequest: "Bad request",
  },
});

function ids(v: unknown): number[] | null {
  if (!Array.isArray(v) || v.length === 0 || v.length > 200) return null;
  const out = v.filter((x): x is number => Number.isInteger(x) && x > 0);
  return out.length === v.length ? out : null;
}

async function guard(req: Request) {
  const t = T.en;
  const s = await getSession();
  if (!s) return { res: json({ error: t.unauthorized }, 401) } as const;
  if (!sameOrigin(req)) return { res: json({ error: t.forbidden }, 403) } as const;
  const body = await readJsonCapped<{ ids?: unknown; read?: unknown }>(req, 8192);
  if (!body.ok) return { res: body.res } as const;
  const list = ids(body.value.ids);
  if (!list) return { res: json({ error: t.badRequest }, 400) } as const;
  return { list, read: body.value.read } as const;
}

export async function PATCH(req: Request) {
  const g = await guard(req);
  if ("res" in g) return g.res;
  if (typeof g.read !== "boolean") return json({ error: T.en.badRequest }, 400);
  const stmt = getDb().prepare(`UPDATE feedback SET read_at = ${g.read ? "datetime('now')" : "NULL"} WHERE id = ?`);
  getDb().transaction(() => g.list.forEach((id) => stmt.run(id)))();
  return json({ ok: true });
}

export async function DELETE(req: Request) {
  const g = await guard(req);
  if ("res" in g) return g.res;
  const stmt = getDb().prepare("DELETE FROM feedback WHERE id = ?");
  let n = 0;
  getDb().transaction(() => g.list.forEach((id) => (n += stmt.run(id).changes)))();
  return json({ ok: true, deleted: n });
}
