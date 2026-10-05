/**
 * PUT    /api/admin/content  { path, source }  save an owner edit
 * DELETE /api/admin/content  { path }          reset to the repository file
 * The site is English only: every edit is stored as lang 'en'. Older Khmer
 * rows stay in the table untouched (additive-only rule) and are no longer read.
 * Admin only (checked first), same-origin, raw body capped before parsing.
 * `path` must be one of the known content files (lib/content.ts whitelist).
 */
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { invalidateContent, isContentPath } from "@/lib/content";
import { MAX_SOURCE_BYTES, validateContent } from "@/lib/contentAdmin";
import { defineMessages } from "@/lib/i18n";
import { json, readJsonCapped, sameOrigin } from "@/lib/http";

const T = defineMessages({
  en: {
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    badRequest: "Bad request",
    notFound: "Not found",
  },
});

async function target(req: Request, withSource: boolean) {
  const body = await readJsonCapped<{ path?: unknown; source?: unknown }>(req, MAX_SOURCE_BYTES * 2 + 1024);
  if (!body.ok) return { res: body.res } as const;
  const { path, source } = body.value;
  if (typeof path !== "string" || !isContentPath(path)) return { res: json({ error: T.en.notFound }, 404) } as const;
  if (withSource && typeof source !== "string") return { res: json({ error: T.en.badRequest }, 400) } as const;
  return { path, lang: "en", source: typeof source === "string" ? source.replace(/\r\n/g, "\n") : "" } as const;
}

export async function PUT(req: Request) {
  const s = await getSession();
  if (!s) return json({ error: T.en.unauthorized }, 401);
  if (!sameOrigin(req)) return json({ error: T.en.forbidden }, 403);
  const t = await target(req, true);
  if ("res" in t) return t.res;
  const error = validateContent(t.path, t.lang, t.source);
  if (error) return json({ error }, 400);
  getDb().prepare(`INSERT INTO content_overrides (path, lang, source, updated_by) VALUES (?, ?, ?, ?)
    ON CONFLICT(path, lang) DO UPDATE SET source = excluded.source, updated_at = datetime('now'), updated_by = excluded.updated_by`).run(t.path, t.lang, t.source, s.username);
  invalidateContent();
  return json({ ok: true });
}

export async function DELETE(req: Request) {
  const s = await getSession();
  if (!s) return json({ error: T.en.unauthorized }, 401);
  if (!sameOrigin(req)) return json({ error: T.en.forbidden }, 403);
  const t = await target(req, false);
  if ("res" in t) return t.res;
  getDb().prepare("DELETE FROM content_overrides WHERE path = ? AND lang = ?").run(t.path, t.lang);
  invalidateContent();
  return json({ ok: true });
}
