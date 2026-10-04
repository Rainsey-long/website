/**
 * "What's my zodiac?" — everything the calculator shows, computed client-side.
 * Nothing here is stored or sent anywhere (build plan §2.3).
 */
import * as Astronomy from "astronomy-engine";
import { sunSign, SIGNS, signIndexFromLongitude, type WesternSign } from "./western";
import {
  zodiacYear, zodiacYearForDate, luckyNumbers, LUCKY_COLORS, ELEMENT_NAME, STEMS,
  type ZodiacYear,
} from "./chinese";
import { moonLongitude, ascendant } from "./sky";
import { traditions, traditionsDiffer, type TraditionResult } from "./sea-variants";

export interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  tz: string;
}

/** Offset (minutes) of an IANA zone from UTC at a given instant. */
function zoneOffsetMinutes(instant: Date, tz: string): number {
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

const BRANCH_NAMES = ["Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"];

/** Start of spring (Lichun): the Sun reaches 315° longitude, early February. */
function lichun(year: number): Date {
  const t = Astronomy.SearchSunLongitude(315, Astronomy.MakeTime(new Date(Date.UTC(year, 0, 25))), 20);
  if (!t) throw new Error("Lichun search failed");
  return t.date;
}

/** BaZi year pillar, which turns at Lichun rather than Lunar New Year. */
export function baziYear(instant: Date): { year: number; pillar: string; label: string } {
  const y = instant.getUTCFullYear();
  const year = instant < lichun(y) ? y - 1 : y;
  const z = zodiacYear(year);
  const branch = BRANCH_NAMES[z.animal.index];
  return { year, pillar: `${z.stem} ${branch}`, label: `${ELEMENT_NAME[z.element]} ${z.animal.name}` };
}

export interface CalculatorInput {
  date: string; // YYYY-MM-DD
  time: string | null; // HH:MM, null when unknown
  city: City | null;
  /** Zone used when no city is given (the visitor's browser zone). */
  fallbackTz: string;
}

export interface CalculatorResult {
  sun: WesternSign;
  sunCusp: WesternSign | null;
  moon: WesternSign;
  /** True when time is unknown and the Moon changes sign during that day. */
  moonUncertain: boolean;
  rising: WesternSign | null;
  chinese: ZodiacYear;
  bazi: ReturnType<typeof baziYear>;
  traditions: TraditionResult[];
  traditionsDiffer: boolean;
  luckyColors: string[];
  luckyNumbers: number[];
  assumedNoon: boolean;
}

export function calculate(input: CalculatorInput): CalculatorResult {
  const tz = input.city?.tz ?? input.fallbackTz;
  const assumedNoon = !input.time;
  const instant = localToUtc(input.date, input.time ?? "12:00", tz);
  const sunRes = sunSign(instant);

  const moonIdx = signIndexFromLongitude(moonLongitude(instant));
  let moonUncertain = false;
  if (assumedNoon) {
    const start = signIndexFromLongitude(moonLongitude(localToUtc(input.date, "00:00", tz)));
    const end = signIndexFromLongitude(moonLongitude(localToUtc(input.date, "23:59", tz)));
    moonUncertain = start !== end;
  }

  const rising =
    input.time && input.city
      ? SIGNS[signIndexFromLongitude(ascendant(instant, input.city.lat, input.city.lon))]
      : null;

  const [y, m, d] = input.date.split("-").map(Number);
  const chinese = zodiacYearForDate(y, m, d);
  const trad = traditions(y, m, d);

  return {
    sun: sunRes.sign,
    sunCusp: sunRes.cusp?.other ?? null,
    moon: SIGNS[moonIdx],
    moonUncertain,
    rising,
    chinese,
    bazi: baziYear(instant),
    traditions: trad,
    traditionsDiffer: traditionsDiffer(trad),
    luckyColors: LUCKY_COLORS[chinese.element].map((c) => c.name),
    luckyNumbers: luckyNumbers(chinese.element, chinese.animal),
    assumedNoon,
  };
}

export { STEMS };
