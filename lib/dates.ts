/** Date helpers. A "day key" is an ISO calendar date string, YYYY-MM-DD. */
import type { Lang } from "./i18n";

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
// `...[]: [lang?: Lang]` keeps the old language argument for existing callers and ignores it (English only since 2026-10-05).
export const monthName = (m: number, ...[]: [lang?: Lang]) => MONTHS[m - 1];
export const weekdayName = (dow: number, ...[]: [lang?: Lang]) => WEEKDAYS[dow];

/** "October 2026". */
export function monthYear(year: number, month: number, ...[]: [lang?: Lang]): string {
  return `${MONTHS[month - 1]} ${year}`;
}

/** "5 October 2026" (design system §8.5: dates written out). */
export function longDate(key: string, ...[]: [lang?: Lang]): string {
  const d = fromKey(key);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "Sunday, 5 October 2026". */
export function fullDate(key: string, ...[]: [lang?: Lang]): string {
  return `${WEEKDAYS[fromKey(key).getUTCDay()]}, ${longDate(key)}`;
}

/** The build's notion of "today" (UTC). Overridable for reproducible builds. */
/** Server "today" in UTC for scripts; pages use lib/today.ts (visitor zone). */
export function buildToday(): string {
  const forced = typeof process !== "undefined" ? process.env.BUILD_DATE : undefined;
  if (forced && /^\d{4}-\d{2}-\d{2}$/.test(forced)) return forced;
  return dayKey(new Date());
}

/** "5–11 October 2026", "28 September – 4 October 2026", "29 December 2025 – 4 January 2026". */
export function weekRange(monday: string, ...[]: [lang?: Lang]): string {
  const sunday = addDays(monday, 6);
  const a = fromKey(monday), b = fromKey(sunday);
  const sameYear = a.getUTCFullYear() === b.getUTCFullYear();
  const sameMonth = sameYear && a.getUTCMonth() === b.getUTCMonth();
  if (sameMonth) return `${a.getUTCDate()}–${longDate(sunday)}`;
  if (sameYear) return `${a.getUTCDate()} ${MONTHS[a.getUTCMonth()]} – ${longDate(sunday)}`;
  return `${longDate(monday)} – ${longDate(sunday)}`;
}
