/**
 * PUT    /api/admin/content  { path, lang, source }  save an owner edit
 * DELETE /api/admin/content  { path, lang }          reset to the repository file
 * Admin only (checked first), same-origin, raw body capped before parsing.
 * `path` must be one of the known content files (lib/content.ts whitelist).
 */
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { invalidateContent, isContentPath } from "@/lib/content";
import { MAX_SOURCE_BYTES, validateContent } from "@/lib/contentAdmin";
import { defineMessages, isLang, type Lang } from "@/lib/i18n";
import { json, readJsonCapped, requestLang, sameOrigin } from "@/lib/http";

/** Wording only; the caller's language comes from `?lang=` (lib/http.ts requestLang). */
const T = defineMessages({
  en: {
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    badRequest: "Bad request",
    notFound: "Not found",
  },
  km: {
    unauthorized: "សូមចូលជាអ្នកគ្រប់គ្រងសិន។",
    forbidden: "មិនអនុញ្ញាតទេ។",
    badRequest: "សំណើមិនត្រឹមត្រូវ។",
    notFound: "រកមិនឃើញទេ។",
  },
});

async function target(req: Request, withSource: boolean, ui: Lang) {
  const body = await readJsonCapped<{ path?: unknown; lang?: unknown; source?: unknown }>(req, MAX_SOURCE_BYTES * 2 + 1024);
  if (!body.ok) return { res: body.res } as const;
  const { path, lang, source } = body.value;
  if (typeof path !== "string" || !isContentPath(path) || typeof lang !== "string" || !isLang(lang)) return { res: json({ error: T[ui].notFound }, 404) } as const;
  if (withSource && typeof source !== "string") return { res: json({ error: T[ui].badRequest }, 400) } as const;
  return { path, lang, source: typeof source === "string" ? source.replace(/\r\n/g, "\n") : "" } as const;
}

export async function PUT(req: Request) {
  const ui = requestLang(req);
  const s = await getSession();
  if (!s) return json({ error: T[ui].unauthorized }, 401);
  if (!sameOrigin(req)) return json({ error: T[ui].forbidden }, 403);
  const t = await target(req, true, ui);
  if ("res" in t) return t.res;
  const error = validateContent(t.path, t.lang, t.source, ui);
  if (error) return json({ error }, 400);
  getDb().prepare(`INSERT INTO content_overrides (path, lang, source, updated_by) VALUES (?, ?, ?, ?)
    ON CONFLICT(path, lang) DO UPDATE SET source = excluded.source, updated_at = datetime('now'), updated_by = excluded.updated_by`).run(t.path, t.lang, t.source, s.username);
  invalidateContent();
  return json({ ok: true });
}

export async function DELETE(req: Request) {
  const ui = requestLang(req);
  const s = await getSession();
  if (!s) return json({ error: T[ui].unauthorized }, 401);
  if (!sameOrigin(req)) return json({ error: T[ui].forbidden }, 403);
  const t = await target(req, false, ui);
  if ("res" in t) return t.res;
  getDb().prepare("DELETE FROM content_overrides WHERE path = ? AND lang = ?").run(t.path, t.lang);
  invalidateContent();
  return json({ ok: true });
}
