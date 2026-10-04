/**
 * Weekly horoscopes (docs/research/FEATURES.md §7, #46). Deterministic, like
 * the daily engine: real sky data plus pre-written text, nothing generated.
 *
 * A week runs Monday to Sunday. Its reading has four parts:
 *  1. The overview: one text block chosen by the week's main lunation (the
 *     new or full Moon if one falls in the week, otherwise the first quarter
 *     Moon) and the solar house it falls in for the sign. Principal phases
 *     are 6.5–8.2 days apart, so now and then a week holds none; it then
 *     takes the last phase before the week, whose mood carries into it.
 *     4 phases × 12 houses = 48 blocks in
 *     content/weekly/lunations.json; a sign meets the same block about once
 *     a year.
 *  2. The Moon's path through the sign's houses, day by day (no new text:
 *     the house themes of the daily engine).
 *  3. The best day for each topic: a day the daily engine gives the
 *     highest energy (a seeded pick among ties), so weekly and daily
 *     readings never disagree.
 *  4. Planet events in the week: sign changes of Mercury to Saturn, stations
 *     and eclipses, each with the house it touches for the sign.
 *
 * Instants are UTC; the week window is Monday 00:00 UTC to the next Monday.
 */
import lunations from "../content/weekly/lunations.json";
import { dailyReading, HOUSE_THEME, HOUSE_THEME_KM, solarHouse, TOPICS, type Topic } from "./reading-engine";
import * as A from "astronomy-engine";
import { planetLongitude, skyForDay, type SkyDay } from "./sky";
import { signIndexFromLongitude } from "./western";
import { hash } from "./random";
import { eclipsesForYear, moonPhases, retrogradesForYear, type PhaseEvent, type Planet } from "./skyEvents";
import { addDays, fromKey } from "./dates";
import type { WesternSign } from "./western";
import type { Lang } from "./i18n";

export type PhaseKey = "new" | "first" | "full" | "last";
export const PHASE_KEYS: PhaseKey[] = ["new", "first", "full", "last"];

export interface WeekBlock {
  id: string;
  topic: "week";
  kind: "base";
  conditions: { phase: PhaseKey; house: number[] };
  tone: string;
  text: string;
  text_km?: string;
}

export const WEEKLY_BLOCKS = lunations as WeekBlock[];

/** The Monday of the week holding `date` (YYYY-MM-DD). */
export function mondayOf(date: string): string {
  const dow = fromKey(date).getUTCDay(); // 0 Sunday
  return addDays(date, -((dow + 6) % 7));
}

export const isMonday = (date: string) => fromKey(date).getUTCDay() === 1;

export interface WeekEvent {
  date: string;
  kind: "ingress" | "station-rx" | "station-d" | "eclipse";
  /** Planet for ingresses and stations; "sun" or "moon" for eclipses. */
  body: Planet | "sun" | "moon";
  /** Eclipse kind (total, partial, annular, penumbral), when kind is "eclipse". */
  eclipseKind?: string;
  signIndex: number;
  house: number;
}

export interface WeeklyReading {
  sign: WesternSign;
  monday: string;
  sunday: string;
  days: string[];
  /** The phase that chose the overview (possibly just before the week), and every principal phase in the week. */
  lunation: PhaseEvent & { key: PhaseKey; house: number };
  phases: Array<PhaseEvent & { key: PhaseKey; house: number }>;
  overview: { id: string; text: string };
  /** Consecutive days the Moon spends in one house. */
  moonPath: Array<{ from: string; to: string; house: number; signIndex: number; theme: string }>;
  best: Record<Topic, { date: string; energy: number }>;
  events: WeekEvent[];
}

const PLANETS: Planet[] = ["mercury", "venus", "mars", "jupiter", "saturn"];
const BODY: Record<Planet, A.Body> = { mercury: A.Body.Mercury, venus: A.Body.Venus, mars: A.Body.Mars, jupiter: A.Body.Jupiter, saturn: A.Body.Saturn };
/** The sign a planet is in at noon UTC on `day`. */
const signOn = (p: Planet, day: string) => signIndexFromLongitude(planetLongitude(BODY[p], new Date(`${day}T12:00:00.000Z`)));
const keyOf = (quarter: 0 | 1 | 2 | 3): PhaseKey => PHASE_KEYS[quarter];
const dayOf = (iso: string) => iso.slice(0, 10);

export function weeklyReading(sign: WesternSign, monday: string, texts?: ReadonlyMap<string, string>, lang: Lang = "en"): WeeklyReading {
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const next = addDays(monday, 7);
  const from = `${monday}T00:00:00.000Z`, to = `${next}T00:00:00.000Z`;
  const skies: SkyDay[] = days.map((d) => skyForDay(d));
  const house = (signIndex: number) => solarHouse(signIndex, sign.index);

  const phases = moonPhases(from, to).map((p) => ({ ...p, key: keyOf(p.quarter), house: house(p.signIndex) }));
  const major = phases.find((p) => p.quarter === 0 || p.quarter === 2);
  const carried = () => {
    const prev = moonPhases(`${addDays(monday, -9)}T00:00:00.000Z`, from);
    const p = prev[prev.length - 1];
    return { ...p, key: keyOf(p.quarter), house: house(p.signIndex) };
  };
  const lunation = major ?? phases[0] ?? carried();
  const block = WEEKLY_BLOCKS.find((b) => b.conditions.phase === lunation.key && b.conditions.house.includes(lunation.house))!;
  const own = lang === "km" ? (block.text_km || block.text) : block.text;
  const overview = { id: block.id, text: texts?.get(block.id) ?? own };

  const themes = lang === "km" ? HOUSE_THEME_KM : HOUSE_THEME;
  const moonPath: WeeklyReading["moonPath"] = [];
  skies.forEach((s, i) => {
    const h = house(s.moon.signIndex);
    const last = moonPath[moonPath.length - 1];
    if (last && last.house === h) last.to = days[i];
    else moonPath.push({ from: days[i], to: days[i], house: h, signIndex: s.moon.signIndex, theme: themes[h] });
  });

  const readings = days.map((d, i) => dailyReading(sign, d, skies[i]));
  const best = Object.fromEntries(TOPICS.map((topic, t) => {
    // Several days often share the top energy; a seeded pick among them keeps
    // ties from always landing on Monday, and stays the same on every visit.
    const top = Math.max(...readings.map((r) => r.topics[t].energy));
    const tied = readings.map((r, i) => (r.topics[t].energy === top ? i : -1)).filter((i) => i >= 0);
    const at = tied[hash(`${sign.slug}|${monday}|${topic}`) % tied.length];
    return [topic, { date: days[at], energy: top }];
  })) as WeeklyReading["best"];

  const events: WeekEvent[] = [];
  PLANETS.forEach((p) => {
    let prev = signOn(p, addDays(monday, -1));
    days.forEach((day, i) => {
      const cur = signOn(p, day);
      if (cur !== prev) events.push({ date: days[i], kind: "ingress", body: p, signIndex: cur, house: house(cur) });
      prev = cur;
    });
  });
  const years = [...new Set([Number(monday.slice(0, 4)) - 1, Number(monday.slice(0, 4)), Number(next.slice(0, 4))])];
  const inWeek = (iso: string) => iso >= from && iso < to;
  for (const y of years) {
    for (const r of retrogradesForYear(y)) {
      if (!PLANETS.includes(r.planet)) continue;
      if (inWeek(r.stationRx.at)) events.push({ date: dayOf(r.stationRx.at), kind: "station-rx", body: r.planet, signIndex: r.stationRx.signIndex, house: house(r.stationRx.signIndex) });
      if (inWeek(r.stationD.at)) events.push({ date: dayOf(r.stationD.at), kind: "station-d", body: r.planet, signIndex: r.stationD.signIndex, house: house(r.stationD.signIndex) });
    }
  }
  for (const y of [...new Set([Number(monday.slice(0, 4)), Number(next.slice(0, 4))])]) {
    for (const e of eclipsesForYear(y)) {
      if (inWeek(e.at)) events.push({ date: dayOf(e.at), kind: "eclipse", body: e.body, eclipseKind: e.kind, signIndex: e.signIndex, house: house(e.signIndex) });
    }
  }
  // A station found in two overlapping years is listed once.
  const seen = new Set<string>();
  const unique = events.filter((e) => { const k = `${e.kind}|${e.body}|${e.date}`; if (seen.has(k)) return false; seen.add(k); return true; });
  unique.sort((a, b) => a.date.localeCompare(b.date));

  return { sign, monday, sunday: days[6], days, lunation, phases, overview, moonPath, best, events: unique };
}
