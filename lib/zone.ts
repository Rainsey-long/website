/** Wall-clock time in an IANA zone to a UTC instant. Small and dependency-free so
 *  client components can use it without pulling in the calendar engines. */

/** Offset (minutes) of an IANA zone from UTC at a given instant. */
export function zoneOffsetMinutes(instant: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return (asUtc - instant.getTime()) / 60000;
}

/** Local wall-clock date + time in an IANA zone → UTC instant. */
export function localToUtc(dateKey: string, time: string, tz: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let offset = zoneOffsetMinutes(new Date(guess), tz);
  // Second pass settles DST transitions.
  offset = zoneOffsetMinutes(new Date(guess - offset * 60000), tz);
  return new Date(guess - offset * 60000);
}

export interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  tz: string;
}
