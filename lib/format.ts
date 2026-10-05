/** Time formatting in an IANA zone (server-side; the zone comes from lib/today.ts). */
import type { Lang } from "./i18n";
import { longDate, monthName } from "./dates";

// `...[]: [lang?: Lang]` keeps the old language argument for existing callers and ignores it (English only since 2026-10-05).
export function timeIn(iso: string, tz: string, ...[]: [lang?: Lang]): string {
  return (new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso)));
}
export function dateIn(iso: string, tz: string): string {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(iso));
  const g = (t: string) => p.find((x) => x.type === t)!.value;
  return `${g("year")}-${g("month")}-${g("day")}`;
}
/** "4 October 2026, 22:54". */
export function dateTimeIn(iso: string, tz: string, ...[]: [lang?: Lang]): string {
  return `${longDate(dateIn(iso, tz))}, ${timeIn(iso, tz)}`;
}
/** "4 Oct". */
export function shortDateIn(iso: string, tz: string, ...[]: [lang?: Lang]): string {
  const [, m, d] = dateIn(iso, tz).split("-").map(Number);
  return `${d} ${monthName(m).slice(0, 3)}`;
}
export function zoneLabel(tz: string): string {
  return tz.replace(/_/g, " ").split("/").pop() ?? tz;
}
