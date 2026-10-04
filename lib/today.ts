/**
 * Server-side "today": the visitor's local date when their zone is known (the
 * `tz` cookie, set by components/ZoneCookie.tsx on first visit), otherwise
 * DEFAULT_TZ. Design system §8.5: dates follow the visitor's local day.
 */
import { cookies } from "next/headers";
import { DEFAULT_TZ } from "./site";

export function isValidZone(tz: string | undefined): tz is string {
  if (!tz || tz.length > 64 || !/^[A-Za-z_+\-/0-9]+$/.test(tz)) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function dateInZone(tz: string, at = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export async function visitorZone(): Promise<string> {
  const tz = (await cookies()).get("tz")?.value;
  return isValidZone(tz) ? tz : DEFAULT_TZ;
}

export async function today(): Promise<string> {
  return dateInZone(await visitorZone());
}
