/**
 * Server-only: the owner-reviewed text for each reading block, per language,
 * memoised per process and invalidated whenever the admin saves an edit. One
 * process, one replica (railway.json), so an in-memory memo is coherent.
 * A block with no Khmer text yet falls back to its English text.
 */
import { getDb } from "./db";
import { seedIfEmpty } from "./seed";
import type { Lang } from "./i18n";

/*
 * On globalThis, not module scope: Next bundles each route separately, so a
 * module-level variable would give the admin API and the pages two different
 * memos, and an edit would never reach the pages (found by test, 2026-10-04).
 */
const store = globalThis as unknown as { __alBlockTexts?: Record<Lang, Map<string, string>> | null };

export function blockTexts(lang: Lang = "en"): ReadonlyMap<string, string> {
  if (!store.__alBlockTexts) {
    seedIfEmpty();
    const rows = getDb().prepare("SELECT id, text, text_km FROM text_blocks").all() as Array<{ id: string; text: string; text_km: string }>;
    store.__alBlockTexts = {
      en: new Map(rows.map((r) => [r.id, r.text])),
      km: new Map(rows.map((r) => [r.id, r.text_km || r.text])),
    };
  }
  return store.__alBlockTexts[lang];
}

export function invalidateBlockTexts(): void {
  store.__alBlockTexts = null;
}
