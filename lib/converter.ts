/**
 * Date converter (docs/research/FEATURES.md §7, #21 + #50): one Gregorian
 * date read in every calendar the site knows, and the reverse lookups people
 * actually search for: "which day is 15 waxing Pisakh this year?" and "when
 * is my Chinese lunar birthday this year?".
 *
 * Server only (lunar-javascript must not reach the browser bundle,
 * tech-stack.md). Pure: "today" is passed in, never read here.
 *
 * Ages are not computed here: a birth date belongs in the browser
 * (lib/age.ts, components/client/AgeTool.tsx), never in a URL the server sees.
 */
import * as kh from "@thyrith/momentkh";
import { Lunar, LunarMonth, LunarYear } from "lunar-javascript";
import { khmerDay, LUNAR_MONTHS, type KhmerDay } from "./khmer";
import { almanacDay, type AlmanacDay } from "./almanac";
import { zodiacYear, zodiacYearForDate, type ZodiacYear } from "./chinese";
import { CALENDAR_YEARS } from "./site";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

/** A real calendar date inside the supported range, or null. */
export function parseDateKey(v: string | undefined | null): string | null {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const [y, m, d] = v.split("-").map(Number);
  if (y < CALENDAR_YEARS.min || y > CALENDAR_YEARS.max) return null;
  const t = new Date(Date.UTC(y, m - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) return null;
  return v;
}

export interface Conversion {
  date: string;
  khmer: KhmerDay;
  chinese: AlmanacDay;
  /** The popular zodiac year (turns at Lunar New Year). */
  zodiac: ZodiacYear;
  /** Days from `today` (negative = in the past). */
  daysFromToday: number;
}

const dayNumber = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
};

export function convert(date: string, today: string): Conversion {
  const [y, m, d] = date.split("-").map(Number);
  return {
    date,
    khmer: khmerDay(date),
    chinese: almanacDay(date),
    zodiac: zodiacYearForDate(y, m, d),
    daysFromToday: dayNumber(date) - dayNumber(today),
  };
}

/* ---------- Khmer lunar date → Gregorian ---------- */

export interface KhmerQuery {
  year: number;
  /** Index into LUNAR_MONTHS (0 Migasir … 11 Kadeuk, 12/13 the two Asadh of a leap year). */
  month: number;
  phase: "waxing" | "waning";
  day: number;
}

/**
 * One Gregorian year's Khmer dates, encoded month*100 + phase*50 + day per
 * day of the year. Building it costs ~27 ms (365 momentkh calls), so tables
 * are kept on globalThis (one copy for every route, error-handling.md) and
 * bounded: at most KHMER_YEAR_CAP years, oldest dropped first.
 */
const KHMER_YEAR_CAP = 32;
const g = globalThis as unknown as { __khmerYears?: Map<number, Uint16Array> };
const khmerYears = (g.__khmerYears ??= new Map());

export const isKhmerYearCached = (year: number) => khmerYears.has(year);

function khmerYearTable(year: number): Uint16Array {
  const hit = khmerYears.get(year);
  if (hit) return hit;
  const days = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000;
  const table = new Uint16Array(days);
  for (let i = 0; i < days; i++) {
    const t = new Date(Date.UTC(year, 0, 1 + i));
    const k = kh.fromGregorian(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), 12, 0, 0).khmer;
    table[i] = k.monthIndex * 100 + k.moonPhase * 50 + k.day;
  }
  if (khmerYears.size >= KHMER_YEAR_CAP) khmerYears.delete(khmerYears.keys().next().value!);
  khmerYears.set(year, table);
  return table;
}

/**
 * Every Gregorian date in `year` whose Khmer lunar date matches. Usually one,
 * none when the month does not occur that year (the doubled Asadh, or a 15th
 * waning day in a 14-day half), and occasionally two when the month falls in
 * both January and December.
 */
export function findKhmerDates(q: KhmerQuery): string[] {
  const want = q.month * 100 + (q.phase === "waxing" ? 0 : 50) + q.day;
  const out: string[] = [];
  khmerYearTable(q.year).forEach((v, i) => {
    if (v !== want) return;
    const t = new Date(Date.UTC(q.year, 0, 1 + i));
    out.push(ymd(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()));
  });
  return out;
}

export function isKhmerQuery(q: Partial<KhmerQuery>): q is KhmerQuery {
  return Number.isInteger(q.year) && q.year! >= CALENDAR_YEARS.min && q.year! <= CALENDAR_YEARS.max
    && Number.isInteger(q.month) && q.month! >= 0 && q.month! < LUNAR_MONTHS.length
    && (q.phase === "waxing" || q.phase === "waning")
    && Number.isInteger(q.day) && q.day! >= 1 && q.day! <= 15;
}

/* ---------- Chinese lunar date → Gregorian ---------- */

export interface ChineseQuery {
  /** The Chinese lunar year that begins at Lunar New Year of this Gregorian year. */
  year: number;
  month: number;
  day: number;
  leap: boolean;
}

export type ChineseResult =
  | { ok: true; date: string; zodiac: ZodiacYear; leapMonth: number }
  /** The month has only 29 days that year, or it has no leap month of that number. */
  | { ok: false; reason: "no-day-30" | "no-leap"; leapMonth: number };

export function findChineseDate(q: ChineseQuery): ChineseResult {
  const leapMonth = LunarYear.fromYear(q.year).getLeapMonth();
  if (q.leap && leapMonth !== q.month) return { ok: false, reason: "no-leap", leapMonth };
  const month = q.leap ? -q.month : q.month;
  if (q.day > LunarMonth.fromYm(q.year, month).getDayCount()) return { ok: false, reason: "no-day-30", leapMonth };
  const s = Lunar.fromYmd(q.year, month, q.day).getSolar();
  return { ok: true, date: ymd(s.getYear(), s.getMonth(), s.getDay()), zodiac: zodiacYear(q.year), leapMonth };
}

export function isChineseQuery(q: Partial<ChineseQuery>): q is ChineseQuery {
  return Number.isInteger(q.year) && q.year! >= CALENDAR_YEARS.min && q.year! < CALENDAR_YEARS.max
    && Number.isInteger(q.month) && q.month! >= 1 && q.month! <= 12
    && Number.isInteger(q.day) && q.day! >= 1 && q.day! <= 30
    && typeof q.leap === "boolean";
}

