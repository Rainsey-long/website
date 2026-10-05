/**
 * Good hours for a day (docs/research/FEATURES.md #8): the Chinese double-hours
 * (时辰) with their ruling spirit, and Western planetary hours counted from local
 * sunrise. Server-side (lunar-javascript must not reach the client bundle).
 *
 * Conventions (DECISIONS.md):
 *  - Chinese hours are read on the local clock, not true solar time. The Zi
 *    hour is split at midnight (00:00-00:59 early Zi, 23:00-23:59 late Zi), as
 *    lunar-javascript and most printed almanacs do, so a day has 13 rows.
 *  - Planetary hours: daylight (sunrise to sunset) and night (sunset to next
 *    sunrise) are each split into 12 equal hours; the first day hour belongs
 *    to the weekday's planet and the rest follow the Chaldean order. Where the
 *    Sun does not rise or set (polar day/night), 24 equal hours from 06:00
 *    are used and the page says so.
 */
import * as Astronomy from "astronomy-engine";
import { Solar } from "lunar-javascript";
import { SPIRITS, HANZI_TO_ANIMAL } from "./almanac";
import { ANIMALS, type Animal } from "./chinese";
import { localToUtc } from "./zone";

const BRANCH_PINYIN: Record<string, string> = {
  子: "Zi", 丑: "Chou", 寅: "Yin", 卯: "Mao", 辰: "Chen", 巳: "Si", 午: "Wu", 未: "Wei", 申: "Shen", 酉: "You", 戌: "Xu", 亥: "Hai",
};

export interface ChineseHour {
  /** Local clock times, "HH:MM", inclusive start, exclusive end. */
  start: string;
  end: string;
  branch: string;
  branchHanzi: string;
  /** The animal of the hour itself. */
  animal: Animal;
  spirit: string;
  /** The spirit's Khmer name (draft). */
  good: boolean;
  /** People born in this animal's year traditionally take this hour gently. */
  clash: Animal;
}

const animal = (hanzi: string) => ANIMALS.find((a) => a.slug === HANZI_TO_ANIMAL[hanzi])!;
const ZHI_ANIMAL = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const ZHI = "子丑寅卯辰巳午未申酉戌亥";

/** The 13 Chinese hour rows for a calendar date. */
export function chineseHours(dateKey: string): ChineseHour[] {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Solar.fromYmd(y, m, d).getLunar().getTimes().map((t) => {
    const zhi = t.getZhi();
    const end = t.getMaxHm();
    const [eh, em] = end.split(":").map(Number);
    const next = eh * 60 + em + 1;
    return {
      start: t.getMinHm(),
      end: next >= 1440 ? "24:00" : `${String(Math.floor(next / 60)).padStart(2, "0")}:${String(next % 60).padStart(2, "0")}`,
      branch: BRANCH_PINYIN[zhi],
      branchHanzi: zhi,
      animal: animal(ZHI_ANIMAL[ZHI.indexOf(zhi)]),
      spirit: SPIRITS[t.getTianShen()] ?? t.getTianShen(),
      good: t.getTianShenLuck() === "吉",
      clash: animal(t.getChongShengXiao()),
    };
  });
}

export type Planet = "sun" | "moon" | "mars" | "mercury" | "jupiter" | "venus" | "saturn";

/** Chaldean order, slowest to fastest. */
const CHALDEAN: Planet[] = ["saturn", "jupiter", "mars", "sun", "venus", "mercury", "moon"];
/** Day rulers, Sunday first (the weekday names come from these planets). */
const DAY_RULER: Planet[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];

export const PLANET_HOUR: Record<Planet, { name: string; theme: string }> = {
  sun: { name: "Sun", theme: "being seen: presenting, leading, asking for what you want" },
  moon: { name: "Moon", theme: "home and feelings: rest, family, looking after yourself" },
  mars: { name: "Mars", theme: "effort: exercise, hard tasks, getting started" },
  mercury: { name: "Mercury", theme: "words: messages, calls, study, short errands" },
  jupiter: { name: "Jupiter", theme: "growth: plans, generosity, asking a favour" },
  venus: { name: "Venus", theme: "connection: friends, beauty, making peace" },
  saturn: { name: "Saturn", theme: "structure: tidying up, finishing, careful work" },
};

export interface PlanetaryHour {
  /** ISO instants. */
  start: string;
  end: string;
  planet: Planet;
  night: boolean;
}

export interface PlanetaryDay {
  hours: PlanetaryHour[];
  sunrise: string | null;
  sunset: string | null;
  /** True when the Sun did not both rise and set, so equal hours were used. */
  fallback: boolean;
}

function riseSet(dir: 1 | -1, from: Date, observer: Astronomy.Observer): Date | null {
  const t = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, dir, from, 1.5);
  return t ? t.date : null;
}

/** Planetary hours for a calendar date at a place, from that day's sunrise. */
export function planetaryHours(dateKey: string, lat: number, lon: number, tz: string): PlanetaryDay {
  const observer = new Astronomy.Observer(lat, lon, 0);
  const midnight = localToUtc(dateKey, "00:00", tz);
  const rise = riseSet(1, midnight, observer);
  const set = rise ? riseSet(-1, rise, observer) : null;
  const nextRise = set ? riseSet(1, set, observer) : null;
  const sameDay = (x: Date | null) => x !== null && x.getTime() - midnight.getTime() < 86400000;
  const ok = rise && set && nextRise && sameDay(rise) && nextRise.getTime() - rise.getTime() < 30 * 3600000;
  const [y, m, d] = dateKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  let i = CHALDEAN.indexOf(DAY_RULER[weekday]);
  const hours: PlanetaryHour[] = [];
  const push = (from: number, len: number, night: boolean) => {
    for (let k = 0; k < 12; k++) {
      hours.push({ start: new Date(from + k * len).toISOString(), end: new Date(from + (k + 1) * len).toISOString(), planet: CHALDEAN[i % 7], night });
      i++;
    }
  };
  if (ok) {
    push(rise.getTime(), (set.getTime() - rise.getTime()) / 12, false);
    push(set.getTime(), (nextRise.getTime() - set.getTime()) / 12, true);
    return { hours, sunrise: rise.toISOString(), sunset: set.toISOString(), fallback: false };
  }
  const six = localToUtc(dateKey, "06:00", tz).getTime();
  push(six, 3600000, false);
  push(six + 12 * 3600000, 3600000, true);
  return { hours, sunrise: null, sunset: null, fallback: true };
}
