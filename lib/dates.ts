/** Date helpers. A "day key" is an ISO calendar date string, YYYY-MM-DD. */
import { khmerDigits, type Lang } from "./i18n";

export function dayKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse YYYY-MM-DD to a Date at 12:00 UTC (noon is the day's reference). */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setUTCDate(d.getUTCDate() + n);
  return dayKey(d);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// Khmer Gregorian month and weekday names, as Cambodian print uses them.
const MONTHS_KM = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
const WEEKDAYS_KM = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];

export const monthName = (m: number, lang: Lang = "en") => (lang === "km" ? MONTHS_KM : MONTHS)[m - 1];
export const weekdayName = (dow: number, lang: Lang = "en") => (lang === "km" ? `ថ្ងៃ${WEEKDAYS_KM[dow]}` : WEEKDAYS[dow]);

/** "October 2026" / "ខែតុលា ឆ្នាំ២០២៦". */
export function monthYear(year: number, month: number, lang: Lang = "en"): string {
  return lang === "km" ? `ខែ${MONTHS_KM[month - 1]} ឆ្នាំ${khmerDigits(year)}` : `${MONTHS[month - 1]} ${year}`;
}

/** "5 October 2026" / "ទី៥ ខែតុលា ឆ្នាំ២០២៦" (design system §8.5: dates written out). */
export function longDate(key: string, lang: Lang = "en"): string {
  const d = fromKey(key);
  if (lang === "km") return `ទី${khmerDigits(d.getUTCDate())} ${monthYear(d.getUTCFullYear(), d.getUTCMonth() + 1, "km")}`;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "Sunday, 5 October 2026" / "ថ្ងៃអាទិត្យ ទី៥ ខែតុលា ឆ្នាំ២០២៦". */
export function fullDate(key: string, lang: Lang = "en"): string {
  const dow = fromKey(key).getUTCDay();
  return lang === "km" ? `${weekdayName(dow, "km")} ${longDate(key, "km")}` : `${WEEKDAYS[dow]}, ${longDate(key)}`;
}

/** The build's notion of "today" (UTC). Overridable for reproducible builds. */
/** Server "today" in UTC for scripts; pages use lib/today.ts (visitor zone). */
export function buildToday(): string {
  const forced = typeof process !== "undefined" ? process.env.BUILD_DATE : undefined;
  if (forced && /^\d{4}-\d{2}-\d{2}$/.test(forced)) return forced;
  return dayKey(new Date());
}
