/**
 * The visitor chooses which traditions they see: Western, Chinese, Khmer.
 * Stored in the `traditions` cookie (e.g. "western.khmer") so server-rendered
 * pages show the right sections on the first byte. No cookie = all three.
 * Pure helpers here; the cookie read is in lib/traditionsServer.ts.
 */
export type Tradition = "western" | "chinese" | "khmer";
export const ALL_TRADITIONS: Tradition[] = ["western", "chinese", "khmer"];
export const TRADITION_LABEL: Record<Tradition, { en: string; km: string }> = {
  western: { en: "Western", km: "លោកខាងលិច" },
  chinese: { en: "Chinese", km: "ចិន" },
  khmer: { en: "Khmer", km: "ខ្មែរ" },
};
export const TRADITIONS_COOKIE = "traditions";

export function parseTraditions(raw: string | undefined | null): Tradition[] {
  if (!raw) return ALL_TRADITIONS;
  const picked = raw.split(".").filter((t): t is Tradition => (ALL_TRADITIONS as string[]).includes(t));
  return picked.length ? ALL_TRADITIONS.filter((t) => picked.includes(t)) : ALL_TRADITIONS;
}

export const serializeTraditions = (t: Tradition[]) => ALL_TRADITIONS.filter((x) => t.includes(x)).join(".");
