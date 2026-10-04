/**
 * Server-only: the owner-reviewed text for each reading block, memoised per
 * process and invalidated whenever the admin saves an edit. One process, one
 * replica (railway.json), so an in-memory memo is coherent.
 */
import { getDb } from "./db";
import { seedIfEmpty } from "./seed";

/*
 * On globalThis, not module scope: Next bundles each route separately, so a
 * module-level variable would give the admin API and the pages two different
 * memos, and an edit would never reach the pages (found by test, 2026-10-04).
 */
const store = globalThis as unknown as { __alBlockTexts?: Map<string, string> | null };

export function blockTexts(): ReadonlyMap<string, string> {
  if (store.__alBlockTexts) return store.__alBlockTexts;
  seedIfEmpty();
  const rows = getDb().prepare("SELECT id, text FROM text_blocks").all() as Array<{ id: string; text: string }>;
  store.__alBlockTexts = new Map(rows.map((r) => [r.id, r.text]));
  return store.__alBlockTexts;
}

export function invalidateBlockTexts(): void {
  store.__alBlockTexts = null;
}
