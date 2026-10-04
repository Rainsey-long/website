/**
 * Age and birth year in each tradition (docs/research/FEATURES.md §7, #50).
 * Runs in the browser (components/client/AgeTool.tsx): a birth date never
 * leaves the visitor's device (CLAUDE.md owner rule). Uses only client-safe
 * modules: the Lunar New Year table and momentkh, never lunar-javascript.
 *
 * Two ages are counted, both by published rule: the ordinary age in completed
 * years, and the Chinese nominal age (虚岁), one at birth plus one at every
 * Lunar New Year. No separate "Khmer age" is computed, because no published
 * Khmer rule for one was found (docs/research/KHMER-TRADITIONS.md); the Khmer
 * side gives what tradition does fix: the Buddhist Era year, animal year, sak
 * and weekday of the birth date.
 */
import { zodiacYearForDate, type ZodiacYear } from "./chinese";
import { birthWeekday, khmerDay, type KhmerDay, type Weekday } from "./khmer";

/** Age in completed years on `today`. A 29 February birthday counts from 1 March in common years. */
export function ageInYears(birth: string, today: string): number {
  const [by, bm, bd] = birth.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  let years = ty - by;
  if (tm < bm || (tm === bm && td < bd)) years -= 1;
  return Math.max(0, years);
}

/** Chinese nominal age (虚岁): 1 at birth, plus one at each Lunar New Year since. */
export function chineseNominalAge(birth: string, today: string): number {
  const [by, bm, bd] = birth.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  return zodiacYearForDate(ty, tm, td).year - zodiacYearForDate(by, bm, bd).year + 1;
}

/** Days from `today` to the next Gregorian birthday (0 on the day). 29 February falls on 1 March in common years. */
export function daysToBirthday(birth: string, today: string): number {
  const [, bm, bd] = birth.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  const now = Date.UTC(ty, tm - 1, td);
  const on = (y: number) => {
    const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    return bm === 2 && bd === 29 && !leap ? Date.UTC(y, 2, 1) : Date.UTC(y, bm - 1, bd);
  };
  const next = on(ty) >= now ? on(ty) : on(ty + 1);
  return Math.round((next - now) / 86_400_000);
}

export interface AgeResult {
  years: number;
  chineseNominal: number;
  daysToBirthday: number;
  chinese: ZodiacYear;
  /** The Khmer calendar on the birth date (BE year, lunar date, sak). */
  khmer: KhmerDay;
  weekday: Weekday;
}

/** Everything the age tool shows, for a birth date on or before `today`. */
export function ageFacts(birth: string, today: string): AgeResult {
  const [y, m, d] = birth.split("-").map(Number);
  return {
    years: ageInYears(birth, today),
    chineseNominal: chineseNominalAge(birth, today),
    daysToBirthday: daysToBirthday(birth, today),
    chinese: zodiacYearForDate(y, m, d),
    khmer: khmerDay(birth),
    weekday: birthWeekday(birth, null).weekday,
  };
}
