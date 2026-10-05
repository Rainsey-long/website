/**
 * The 24 solar terms (节气, jieqi) of the Chinese calendar: the moments the
 * Sun's apparent geocentric ecliptic longitude reaches a multiple of 15°.
 * Lichun (立春, Start of Spring) is 315°, the spring equinox 0°, the winter
 * solstice 270°. Computed with astronomy-engine's SearchSunLongitude (true
 * equinox of date, the definition the Chinese calendar and the US Naval
 * Observatory's equinox/solstice tables both use). Pure and deterministic.
 *
 * Within a Gregorian year the terms run from Xiaohan (小寒, 285°, early
 * January) to Dongzhi (冬至, 270°, late December), so every year has exactly
 * 24. Results are memoised per year on globalThis (every route shares one
 * copy, error-handling.md); computing a year that is not cached is charged
 * against a site-wide ceiling (solarTermsAvailable), like lib/skyEvents.ts.
 */
import * as A from "astronomy-engine";
import { GLOBAL_LIMIT_KEY, createRateLimiter, type RateLimiter } from "./rateLimit";
import type { Lang } from "./i18n";

export interface SolarTermName {
  hanzi: string;
  pinyin: string;
  en: string;
  /** The Sun's longitude in degrees. */
  longitude: number;
  /** One of the eight "major" seasonal markers (the four starts, equinoxes and solstices). */
  major: boolean;
}

/** In calendar-year order, from Xiaohan (285°) to Dongzhi (270°). */
export const SOLAR_TERMS: SolarTermName[] = [
  ["小寒", "Xiaohan", "Minor Cold"],
  ["大寒", "Dahan", "Major Cold"],
  ["立春", "Lichun", "Start of Spring"],
  ["雨水", "Yushui", "Rain Water"],
  ["惊蛰", "Jingzhe", "Awakening of Insects"],
  ["春分", "Chunfen", "Spring Equinox"],
  ["清明", "Qingming", "Clear and Bright"],
  ["谷雨", "Guyu", "Grain Rain"],
  ["立夏", "Lixia", "Start of Summer"],
  ["小满", "Xiaoman", "Grain Buds"],
  ["芒种", "Mangzhong", "Grain in Ear"],
  ["夏至", "Xiazhi", "Summer Solstice"],
  ["小暑", "Xiaoshu", "Minor Heat"],
  ["大暑", "Dashu", "Major Heat"],
  ["立秋", "Liqiu", "Start of Autumn"],
  ["处暑", "Chushu", "End of Heat"],
  ["白露", "Bailu", "White Dew"],
  ["秋分", "Qiufen", "Autumn Equinox"],
  ["寒露", "Hanlu", "Cold Dew"],
  ["霜降", "Shuangjiang", "Frost's Descent"],
  ["立冬", "Lidong", "Start of Winter"],
  ["小雪", "Xiaoxue", "Minor Snow"],
  ["大雪", "Daxue", "Major Snow"],
  ["冬至", "Dongzhi", "Winter Solstice"],
].map(([hanzi, pinyin, en], i) => {
  const longitude = (285 + 15 * i) % 360;
  return { hanzi, pinyin, en, longitude, major: longitude % 45 === 0 };
});

export interface SolarTerm extends SolarTermName {
  /** The exact moment, as a UTC ISO instant. */
  at: string;
}

// `...[]: [lang?: Lang]` keeps the old language argument for existing callers and ignores it (English only since 2026-10-05).
export const solarTermName = (t: Pick<SolarTermName, "en">, ...[]: [lang?: Lang]) => t.en;

const g = globalThis as unknown as { __solarTermMemo?: Map<number, SolarTerm[]>; __solarTermBudget?: RateLimiter };
const memo = (g.__solarTermMemo ??= new Map<number, SolarTerm[]>());
const MEMO_CAP = 250; // every supported year (1900–2100) fits

/** The 24 solar terms of a Gregorian year, in order. */
export function solarTermsForYear(year: number): SolarTerm[] {
  const hit = memo.get(year);
  if (hit) return hit;
  // Each search starts a few days before the term's earliest possible date,
  // so a 30-day window always finds exactly the crossing in this year.
  const out = SOLAR_TERMS.map((t, i) => {
    const start = new Date(Date.UTC(year, 0, 1) + (i * 15.2 - 5) * 86400_000);
    const found = A.SearchSunLongitude(t.longitude, start, 30);
    if (!found) throw new Error(`Solar term ${t.pinyin} not found in ${year}`);
    return { ...t, at: found.date.toISOString() };
  });
  if (memo.size >= MEMO_CAP) memo.delete(memo.keys().next().value!);
  memo.set(year, out);
  return out;
}

export const isSolarTermYearCached = (y: number) => memo.has(y);

/**
 * Whether a page may compute this year now. A cached year is free; a new one
 * is charged against one site-wide ceiling, so walking 1900–2100 cannot keep
 * the single process busy. The caller shows a calm "try again" when false.
 */
const budget = (g.__solarTermBudget ??= createRateLimiter(10 * 60_000, 600));
export function solarTermsAvailable(year: number): boolean {
  return isSolarTermYearCached(year) || !budget(GLOBAL_LIMIT_KEY);
}
