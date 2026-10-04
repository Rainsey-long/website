/** Shared page-level data: chip lists, the daily window, general lucky strip. */
import { SIGNS } from "./western";
import { ANIMALS, zodiacYear, ELEMENT_NAME, type FiveElement } from "./chinese";
import { addDays, buildToday } from "./dates";
import { DAILY_WINDOW } from "./site";
import { almanacDay } from "./almanac";
import { hash, pick, rng } from "./random";
import { khmerDigits, type Lang } from "./i18n";
import { animalName, signName } from "./names";
import { signRange } from "./western";

export const signChips = (hrefFor: (slug: string) => string = (s) => `/horoscope/${s}/`, lang: Lang = "en") =>
  SIGNS.map((s) => ({ slug: s.slug, name: signName(s.slug, lang), sub: signRange(s, lang), href: hrefFor(s.slug) }));

/** Most recent year of each animal on or before the given year, for chip sub-lines. */
export const animalChips = (year = 2026, hrefFor: (slug: string) => string = (s) => `/chinese-zodiac/${s}/`, lang: Lang = "en") =>
  ANIMALS.map((a) => {
    const recent = year - ((year - 4 - a.index) % 12 + 12) % 12;
    const sub = `${recent}, ${recent - 12}`;
    return { slug: a.slug, name: animalName(a.slug, lang), sub: lang === "km" ? khmerDigits(sub) : sub, href: hrefFor(a.slug) };
  });

/** Dated daily pages that exist: last N days + next M days around the build date (plan §10). */
export function dailyWindow(today: string = buildToday()): string[] {
  const out: string[] = [];
  for (let i = -DAILY_WINDOW.pastDays; i <= DAILY_WINDOW.futureDays; i++) out.push(addDays(today, i));
  return out;
}

const DAY_STEM_ELEMENT: Record<string, FiveElement> = {
  Jia: "wood", Yi: "wood", Bing: "fire", Ding: "fire", Wu: "earth", Ji: "earth", Geng: "metal", Xin: "metal", Ren: "water", Gui: "water",
};
const ELEMENT_COLOURS: Record<FiveElement, { names: string[]; swatch: "wood" | "fire" | "earth" | "air" | "water" }> = {
  wood: { names: ["Green", "Teal"], swatch: "wood" },
  fire: { names: ["Red", "Purple"], swatch: "fire" },
  earth: { names: ["Yellow", "Brown"], swatch: "earth" },
  metal: { names: ["White", "Gold", "Silver"], swatch: "air" },
  water: { names: ["Black", "Blue"], swatch: "water" },
};
const HETU: Record<FiveElement, number[]> = { water: [1, 6], fire: [2, 7], wood: [3, 8], metal: [4, 9], earth: [5, 10] };
const DOUBLE_HOURS = ["11 pm – 1 am", "1 – 3 am", "3 – 5 am", "5 – 7 am", "7 – 9 am", "9 – 11 am", "11 am – 1 pm", "1 – 3 pm", "3 – 5 pm", "5 – 7 pm", "7 – 9 pm", "9 – 11 pm"];

/**
 * A double-hour range ("11 pm – 1 am") in the page language. Khmer uses the
 * 24-hour clock with Khmer digits: "ម៉ោង ២៣:០០ – ០១:០០".
 */
export function hourRange(range: string, lang: Lang): string {
  if (lang === "en") return range;
  const m = /^(\d+)(?:\s*(am|pm))?\s*–\s*(\d+)\s*(am|pm)$/.exec(range);
  if (!m) return khmerDigits(range);
  const to24 = (h: number, ap: string) => (ap === "am" ? (h === 12 ? 0 : h) : h === 12 ? 12 : h + 12) % 24;
  const end = to24(Number(m[3]), m[4]);
  const startAp = m[2] ?? m[4];
  const start = to24(Number(m[1]), startAp);
  const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;
  return `ម៉ោង ${khmerDigits(hh(start))} – ${khmerDigits(hh(end))}`;
}

/**
 * The general (sign-free) lucky strip for a day. Rule: colour and number come
 * from the element of the day's heavenly stem (He Tu numbers); the hour is
 * one of the day's double hours, picked deterministically by date.
 */
export function generalLucky(date: string, lang: Lang = "en") {
  const a = almanacDay(date);
  const stem = a.dayPillar.split(" ")[0];
  const el = DAY_STEM_ELEMENT[stem];
  const r = rng(hash(`general:${date}`));
  return {
    almanac: a,
    element: ELEMENT_NAME[el],
    elementKey: el,
    color: { name: pick(ELEMENT_COLOURS[el].names, r), element: ELEMENT_COLOURS[el].swatch },
    number: pick(HETU[el], r),
    hour: pick(DOUBLE_HOURS, r),
    seal: a.quality === "good" ? (lang === "km" ? a.goodKm : a.good).slice(0, 2) : null,
  };
}

export { SIGNS, ANIMALS, zodiacYear };
