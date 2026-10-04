/** Time formatting in an IANA zone (server-side; the zone comes from lib/today.ts). */
import { khmerDigits, type Lang } from "./i18n";
import { longDate, monthName } from "./dates";

const d2 = (lang: Lang, s: string) => (lang === "km" ? khmerDigits(s) : s);

export function timeIn(iso: string, tz: string, lang: Lang = "en"): string {
  return d2(lang, new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso)));
}
export function dateIn(iso: string, tz: string): string {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(iso));
  const g = (t: string) => p.find((x) => x.type === t)!.value;
  return `${g("year")}-${g("month")}-${g("day")}`;
}
/** "4 October 2026, 22:54" / "ទី៤ ខែតុលា ឆ្នាំ២០២៦ ម៉ោង ២២:៥៤". */
export function dateTimeIn(iso: string, tz: string, lang: Lang = "en"): string {
  const date = longDate(dateIn(iso, tz), lang);
  return lang === "km" ? `${date} ម៉ោង ${timeIn(iso, tz, "km")}` : `${date}, ${timeIn(iso, tz)}`;
}
/** "4 Oct" / "៤ តុលា". */
export function shortDateIn(iso: string, tz: string, lang: Lang = "en"): string {
  const [, m, d] = dateIn(iso, tz).split("-").map(Number);
  return lang === "km" ? `${khmerDigits(d)} ${monthName(m, "km")}` : `${d} ${monthName(m).slice(0, 3)}`;
}
export function zoneLabel(tz: string): string {
  return tz.replace(/_/g, " ").split("/").pop() ?? tz;
}
