/** PUT the official Moha Songkran moment and the year's saying (from the Ministry's announcement). Admin only. */
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { json, readJsonCapped, sameOrigin } from "@/lib/http";
import { defineMessages } from "@/lib/i18n";

const T = defineMessages({
  en: {
    unauthorized: "Unauthorized",
    forbidden: "Forbidden",
    notFound: "Not found",
    format: (y: number) => `Use the form ${y}-04-14 10:48 (Cambodian time, 10–18 April).`,
  },
});

export async function PUT(req: Request, { params }: { params: Promise<{ year: string }> }) {
  const msg = T.en;
  if (!(await getSession())) return json({ error: msg.unauthorized }, 401);
  if (!sameOrigin(req)) return json({ error: msg.forbidden }, 403);
  // Canonical four digits only: Number() also accepts "2.0e3", " 2000", "0x7d0".
  const raw = (await params).year;
  const year = /^\d{4}$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isInteger(year) || year < 1950 || year > 2100) return json({ error: msg.notFound }, 404);
  const body = await readJsonCapped<{ officialAt?: unknown; tumneay?: unknown; source?: unknown }>(req, 16_384);
  if (!body.ok) return body.res;
  const { officialAt, tumneay, source } = body.value;
  const at = typeof officialAt === "string" ? officialAt.trim() : "";
  if (at && !new RegExp(`^${year}-04-(1[0-8]) ([01]\\d|2[0-3]):[0-5]\\d$`).test(at)) {
    return json({ error: msg.format(year) }, 400);
  }
  const t = typeof tumneay === "string" ? tumneay.trim().slice(0, 4000) : "";
  const src = typeof source === "string" ? source.trim().slice(0, 200) : "";
  getDb().prepare(`
    INSERT INTO songkran_overrides (year, official_at, tumneay, source, updated_at) VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(year) DO UPDATE SET official_at = excluded.official_at, tumneay = excluded.tumneay, source = excluded.source, updated_at = excluded.updated_at
  `).run(year, at || null, t || null, src || null);
  return json({ ok: true });
}
