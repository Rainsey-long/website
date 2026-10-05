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
  /** Draft Khmer names, for native review (docs/KHMER-REVIEW.md). */
  km: string;
  /** The Sun's longitude in degrees. */
  longitude: number;
  /** One of the eight "major" seasonal markers (the four starts, equinoxes and solstices). */
  major: boolean;
}

/** In calendar-year order, from Xiaohan (285°) to Dongzhi (270°). */
export const SOLAR_TERMS: SolarTermName[] = [
  ["小寒", "Xiaohan", "Minor Cold", "រងាតិច"],
  ["大寒", "Dahan", "Major Cold", "រងាខ្លាំង"],
  ["立春", "Lichun", "Start of Spring", "ចាប់ផ្ដើមរដូវផ្ការីក"],
  ["雨水", "Yushui", "Rain Water", "ទឹកភ្លៀង"],
  ["惊蛰", "Jingzhe", "Awakening of Insects", "សត្វល្អិតភ្ញាក់"],
  ["春分", "Chunfen", "Spring Equinox", "ថ្ងៃស្មើរដូវផ្ការីក"],
  ["清明", "Qingming", "Clear and Bright", "ភ្លឺថ្លា"],
  ["谷雨", "Guyu", "Grain Rain", "ភ្លៀងធញ្ញជាតិ"],
  ["立夏", "Lixia", "Start of Summer", "ចាប់ផ្ដើមរដូវក្ដៅ"],
  ["小满", "Xiaoman", "Grain Buds", "គ្រាប់ធញ្ញជាតិចាប់ពេញ"],
  ["芒种", "Mangzhong", "Grain in Ear", "ធញ្ញជាតិចេញកួរ"],
  ["夏至", "Xiazhi", "Summer Solstice", "ថ្ងៃវែងបំផុតក្នុងឆ្នាំ"],
  ["小暑", "Xiaoshu", "Minor Heat", "ក្ដៅតិច"],
  ["大暑", "Dashu", "Major Heat", "ក្ដៅខ្លាំង"],
  ["立秋", "Liqiu", "Start of Autumn", "ចាប់ផ្ដើមរដូវស្លឹកឈើជ្រុះ"],
  ["处暑", "Chushu", "End of Heat", "ចុងរដូវក្ដៅ"],
  ["白露", "Bailu", "White Dew", "ទឹកសន្សើមស"],
  ["秋分", "Qiufen", "Autumn Equinox", "ថ្ងៃស្មើរដូវស្លឹកឈើជ្រុះ"],
  ["寒露", "Hanlu", "Cold Dew", "ទឹកសន្សើមត្រជាក់"],
  ["霜降", "Shuangjiang", "Frost's Descent", "ទឹកកកស្រាលធ្លាក់"],
  ["立冬", "Lidong", "Start of Winter", "ចាប់ផ្ដើមរដូវរងា"],
  ["小雪", "Xiaoxue", "Minor Snow", "ព្រិលតិច"],
  ["大雪", "Daxue", "Major Snow", "ព្រិលខ្លាំង"],
  ["冬至", "Dongzhi", "Winter Solstice", "ថ្ងៃខ្លីបំផុតក្នុងឆ្នាំ"],
].map(([hanzi, pinyin, en, km], i) => {
  const longitude = (285 + 15 * i) % 360;
  return { hanzi, pinyin, en, km, longitude, major: longitude % 45 === 0 };
});

export interface SolarTerm extends SolarTermName {
  /** The exact moment, as a UTC ISO instant. */
  at: string;
}

export const solarTermName = (t: Pick<SolarTermName, "en" | "km">, lang: Lang) => (lang === "km" ? t.km : t.en);

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
