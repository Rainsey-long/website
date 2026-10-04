/** Server-only: the owner's official Moha Songkran entries (admin → Khmer New Year). */
import { getDb, type SongkranOverride } from "./db";
import { songkran, type Songkran } from "./khmer";

export function songkranOverride(year: number): SongkranOverride | null {
  try {
    return (getDb().prepare("SELECT * FROM songkran_overrides WHERE year = ?").get(year) as SongkranOverride | undefined) ?? null;
  } catch (err) {
    console.error("[songkran] override read failed; using the calculated moment", err);
    return null;
  }
}

/** Calculated moment unless the owner entered the official one. */
export function songkranFor(year: number): { s: Songkran; tumneay: string | null; source: string | null } {
  const o = songkranOverride(year);
  const at = o?.official_at && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(o.official_at) ? { date: o.official_at.slice(0, 10), time: o.official_at.slice(11) } : null;
  return { s: songkran(year, at), tumneay: o?.tumneay?.trim() || null, source: o?.source?.trim() || null };
}
