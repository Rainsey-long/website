/**
 * Verifiable sky events (research: docs/research/FEATURES.md §2.1): exact moon
 * phases, the Moon's sign changes, planetary stations and shadow periods, and
 * eclipses. All from astronomy-engine (MIT); deterministic, memoised per process.
 * Times are UTC instants; pages format them in the visitor's zone.
 */
import * as A from "astronomy-engine";
import { signIndexFromLongitude, SIGNS } from "./western";
import { moonLongitude, planetLongitude } from "./sky";
import type { Lang } from "./i18n";
import { GLOBAL_LIMIT_KEY, createRateLimiter, type RateLimiter } from "./rateLimit";

const QUARTER_NAMES = ["New moon", "First quarter", "Full moon", "Last quarter"];

export interface PhaseEvent { at: string; quarter: 0 | 1 | 2 | 3; name: string; signIndex: number }
export interface Ingress { at: string; signIndex: number }

const memo = new Map<string, unknown>();
function cached<T>(key: string, fn: () => T): T {
  if (!memo.has(key)) {
    if (memo.size > 400) memo.clear(); // bounded: keys are calendar-aligned, so this only trims old months
    memo.set(key, fn());
  }
  return memo.get(key) as T;
}

/*
 * Whole-year results (retrogrades, eclipses) cost 0.1-0.5 s each to compute,
 * so they get their own memo that week-by-week phase lookups cannot push
 * out: 201 supported years x 2 kinds fit under the cap. On globalThis so every
 * route shares one copy (error-handling.md).
 */
const YEAR_CAP = 450;
const g = globalThis as unknown as { __skyYearMemo?: Map<string, unknown>; __skyYearBudget?: RateLimiter };
const yearMemo = (g.__skyYearMemo ??= new Map<string, unknown>());
function cachedYear<T>(key: string, fn: () => T): T {
  if (!yearMemo.has(key)) {
    if (yearMemo.size >= YEAR_CAP) yearMemo.delete(yearMemo.keys().next().value!);
    yearMemo.set(key, fn());
  }
  return yearMemo.get(key) as T;
}

export const isSkyYearCached = (y: number) => yearMemo.has(`rx:${y}`) && yearMemo.has(`ecl:${y}`);

/**
 * Whether a page may compute these years now. Cached years are always free;
 * a request that needs a new one is charged against one site-wide ceiling
 * (security review 2026-10-04), so rotating through 1900-2100 cannot keep
 * the single process busy. The caller shows a calm "try again" when false.
 */
const yearBudget = (g.__skyYearBudget ??= createRateLimiter(10 * 60_000, 600));
export function skyYearsAvailable(years: number[]): boolean {
  if (years.every(isSkyYearCached)) return true;
  return !yearBudget(GLOBAL_LIMIT_KEY);
}

/** Exact new/full/quarter moments between two instants. */
export function moonPhases(fromIso: string, toIso: string): PhaseEvent[] {
  return cached(`phases:${fromIso}:${toIso}`, () => {
    const out: PhaseEvent[] = [];
    let mq = A.SearchMoonQuarter(new Date(fromIso));
    const end = new Date(toIso).getTime();
    while (mq.time.date.getTime() < end) {
      out.push({ at: mq.time.date.toISOString(), quarter: mq.quarter as 0 | 1 | 2 | 3, name: QUARTER_NAMES[mq.quarter], signIndex: signIndexFromLongitude(moonLongitude(mq.time.date)) });
      mq = A.NextMoonQuarter(mq);
    }
    return out;
  });
}

/** Moments the Moon enters a new sign, to the minute (bisection on its longitude). */
export function moonIngresses(fromIso: string, toIso: string): Ingress[] {
  return cached(`ingress:${fromIso}:${toIso}`, () => {
    const out: Ingress[] = [];
    const step = 2 * 3600_000;
    let t = new Date(fromIso).getTime();
    const end = new Date(toIso).getTime();
    let prev = signIndexFromLongitude(moonLongitude(new Date(t)));
    while (t < end) {
      const n = t + step;
      const cur = signIndexFromLongitude(moonLongitude(new Date(n)));
      if (cur !== prev) {
        let lo = t, hi = n;
        while (hi - lo > 30_000) {
          const mid = (lo + hi) / 2;
          if (signIndexFromLongitude(moonLongitude(new Date(mid))) === prev) lo = mid; else hi = mid;
        }
        out.push({ at: new Date(hi).toISOString(), signIndex: cur });
        prev = cur;
      }
      t = n;
    }
    return out;
  });
}

export type Planet = "mercury" | "venus" | "mars" | "jupiter" | "saturn";
export const PLANET_NAME: Record<Planet, string> = { mercury: "Mercury", venus: "Venus", mars: "Mars", jupiter: "Jupiter", saturn: "Saturn" };
const BODY: Record<Planet, A.Body> = { mercury: A.Body.Mercury, venus: A.Body.Venus, mars: A.Body.Mars, jupiter: A.Body.Jupiter, saturn: A.Body.Saturn };

export interface Retrograde {
  planet: Planet;
  name: string;
  /** Station retrograde: the planet appears to stop and turn back. */
  stationRx: { at: string; longitude: number; signIndex: number };
  /** Station direct: it turns forward again. */
  stationD: { at: string; longitude: number; signIndex: number };
  /** Pre-shadow starts when the planet first reaches the direct-station degree. */
  shadowStart: string | null;
  /** Post-shadow ends when it passes the retrograde-station degree again. */
  shadowEnd: string | null;
}

function wrap(d: number) { return d > 180 ? d - 360 : d < -180 ? d + 360 : d; }
function speed(body: A.Body, ms: number) { return wrap(planetLongitude(body, new Date(ms + 3600_000)) - planetLongitude(body, new Date(ms - 3600_000))); }

/** Find where the apparent motion changes sign, to within ~10 minutes. */
function station(body: A.Body, lo: number, hi: number): number {
  const s0 = Math.sign(speed(body, lo));
  while (hi - lo > 600_000) {
    const mid = (lo + hi) / 2;
    if (Math.sign(speed(body, mid)) === s0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/** First instant in [from, to] when the longitude crosses `target` moving forward. */
function crossing(body: A.Body, target: number, from: number, to: number): number | null {
  const day = 86400_000;
  let t = from, prev = wrap(planetLongitude(body, new Date(t)) - target);
  while (t < to) {
    const n = Math.min(to, t + day);
    const cur = wrap(planetLongitude(body, new Date(n)) - target);
    if (prev < 0 && cur >= 0 && Math.abs(cur - prev) < 30) {
      let lo = t, hi = n;
      while (hi - lo > 600_000) { const m = (lo + hi) / 2; if (wrap(planetLongitude(body, new Date(m)) - target) < 0) lo = m; else hi = m; }
      return hi;
    }
    prev = cur; t = n;
  }
  return null;
}

/** All retrograde periods that START in a calendar year (UTC). */
export function retrogradesForYear(year: number): Retrograde[] {
  return cachedYear(`rx:${year}`, () => {
    const out: Retrograde[] = [];
    const day = 86400_000;
    const start = Date.UTC(year, 0, 1), end = Date.UTC(year + 1, 0, 1);
    for (const planet of Object.keys(BODY) as Planet[]) {
      const body = BODY[planet];
      let t = start - 200 * day;
      let prevSpeed = speed(body, t);
      const stations: Array<{ ms: number; turnsRetro: boolean }> = [];
      while (t < end + 400 * day) {
        const n = t + day;
        const s = speed(body, n);
        if (Math.sign(s) !== Math.sign(prevSpeed)) stations.push({ ms: station(body, t, n), turnsRetro: s < 0 });
        prevSpeed = s; t = n;
      }
      for (let i = 0; i < stations.length - 1; i++) {
        const rx = stations[i], d = stations[i + 1];
        if (!rx.turnsRetro || d.turnsRetro || rx.ms < start || rx.ms >= end) continue;
        const lonRx = planetLongitude(body, new Date(rx.ms)), lonD = planetLongitude(body, new Date(d.ms));
        const shadowStart = crossing(body, lonD, rx.ms - 120 * day, rx.ms);
        const shadowEnd = crossing(body, lonRx, d.ms, d.ms + 200 * day);
        out.push({
          planet, name: PLANET_NAME[planet],
          stationRx: { at: new Date(rx.ms).toISOString(), longitude: lonRx, signIndex: signIndexFromLongitude(lonRx) },
          stationD: { at: new Date(d.ms).toISOString(), longitude: lonD, signIndex: signIndexFromLongitude(lonD) },
          shadowStart: shadowStart ? new Date(shadowStart).toISOString() : null,
          shadowEnd: shadowEnd ? new Date(shadowEnd).toISOString() : null,
        });
      }
    }
    return out.sort((a, b) => a.stationRx.at.localeCompare(b.stationRx.at));
  });
}

export interface Eclipse { at: string; body: "sun" | "moon"; kind: string; signIndex: number; obscuration: number | null }

/** Lunar and solar eclipses whose peak falls in a calendar year (UTC). */
export function eclipsesForYear(year: number): Eclipse[] {
  return cachedYear(`ecl:${year}`, () => {
    const out: Eclipse[] = [];
    const start = new Date(Date.UTC(year, 0, 1)), end = Date.UTC(year + 1, 0, 1);
    for (let e = A.SearchLunarEclipse(start); e.peak.date.getTime() < end; e = A.NextLunarEclipse(e.peak)) {
      out.push({ at: e.peak.date.toISOString(), body: "moon", kind: String(e.kind), signIndex: signIndexFromLongitude(moonLongitude(e.peak.date)), obscuration: e.obscuration });
    }
    for (let e = A.SearchGlobalSolarEclipse(start); e.peak.date.getTime() < end; e = A.NextGlobalSolarEclipse(e.peak)) {
      out.push({ at: e.peak.date.toISOString(), body: "sun", kind: String(e.kind), signIndex: signIndexFromLongitude(A.SunPosition(e.peak.date).elon), obscuration: e.obscuration ?? null });
    }
    return out.sort((a, b) => a.at.localeCompare(b.at));
  });
}

export const signName = (i: number) => SIGNS[i].name;
export const degreeIn = (lon: number) => `${Math.floor(((lon % 360) + 360) % 30)}°`;

/* ---------- Names for pages (labels only; no calculation; English only) ---------- */

// `...[]: [lang?: Lang]` keeps the old language argument for existing callers and ignores it (English only since 2026-10-05).
/** "Full moon". */
export const phaseName = (p: Pick<PhaseEvent, "quarter" | "name">, ...[]: [lang?: Lang]) => p.name;
/** Sign name by index. */
export const signNameIn = (i: number, ...[]: [lang?: Lang]) => SIGNS[i].name;
/** Planet name. */
export const planetNameIn = (planet: Planet, ...[]: [lang?: Lang]) => PLANET_NAME[planet];
/** "12°". */
export const degreeInL = (lon: number, ...[]: [lang?: Lang]) => degreeIn(lon);

/** "Total solar eclipse". */
export function eclipseName(e: Pick<Eclipse, "kind" | "body">, ...[]: [lang?: Lang]): string {
  return `${e.kind[0].toUpperCase() + e.kind.slice(1)} ${e.body === "sun" ? "solar" : "lunar"} eclipse`;
}
