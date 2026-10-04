/** Date helpers. A "day key" is an ISO calendar date string, YYYY-MM-DD. */

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

export const monthName = (m: number) => MONTHS[m - 1];

/** "5 October 2026" (design system §8.5: dates written out). */
export function longDate(key: string): string {
  const d = fromKey(key);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "Sunday, 5 October 2026" */
export function fullDate(key: string): string {
  return `${WEEKDAYS[fromKey(key).getUTCDay()]}, ${longDate(key)}`;
}

/** The build's notion of "today" (UTC). Overridable for reproducible builds. */
export function buildToday(): string {
  const forced = typeof process !== "undefined" ? process.env.BUILD_DATE : undefined;
  if (forced && /^\d{4}-\d{2}-\d{2}$/.test(forced)) return forced;
  return dayKey(new Date());
}
