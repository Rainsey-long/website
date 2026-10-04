/**
 * Birth chart (docs/research/FEATURES.md #4), computed in the browser: nothing
 * here is stored or sent (owner rule). Pure apart from the astronomy.
 *
 * Conventions (DECISIONS.md):
 *  - Tropical zodiac, geocentric apparent longitudes of date (astronomy-engine),
 *    the same convention as the daily readings.
 *  - Whole-sign houses: the rising sign is the 1st house. Robust at every
 *    latitude, unlike Placidus, which fails near the poles.
 *  - Aspects and orbs: conjunction and opposition 8°, trine and square 7°,
 *    sextile 5°, each 2° wider when the Sun or Moon is involved. Aspects
 *    between two of Uranus, Neptune and Pluto are left out: they last for
 *    decades and describe a generation, not a person.
 *  - Unknown birth time: positions at local noon, no houses, rising sign or
 *    Midheaven, and any body that changes sign during that day is flagged.
 */
import * as Astronomy from "astronomy-engine";
import { ascendant, meanObliquity } from "./sky";
import { signIndexFromLongitude } from "./western";
import { localToUtc } from "./zone";

export const BODIES = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"] as const;
export type BodyKey = (typeof BODIES)[number];

const ENGINE: Record<BodyKey, Astronomy.Body> = {
  sun: Astronomy.Body.Sun, moon: Astronomy.Body.Moon, mercury: Astronomy.Body.Mercury, venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars, jupiter: Astronomy.Body.Jupiter, saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus, neptune: Astronomy.Body.Neptune, pluto: Astronomy.Body.Pluto,
};

const norm = (x: number) => ((x % 360) + 360) % 360;

export function bodyLongitude(body: BodyKey, date: Date): number {
  if (body === "sun") return Astronomy.SunPosition(date).elon;
  if (body === "moon") return Astronomy.EclipticGeoMoon(date).lon;
  return Astronomy.Ecliptic(Astronomy.GeoVector(ENGINE[body], date, true)).elon;
}

export interface Placement {
  body: BodyKey;
  longitude: number;
  signIndex: number;
  /** Degree within the sign, 0..30. */
  degree: number;
  retrograde: boolean;
  /** Whole-sign house 1..12, null without a birth time and place. */
  house: number | null;
  /** True when the time is unknown and the body changes sign that day. */
  uncertain: boolean;
}

export type AspectKind = "conjunction" | "sextile" | "square" | "trine" | "opposition";
export const ASPECTS: Array<{ kind: AspectKind; angle: number; orb: number }> = [
  { kind: "conjunction", angle: 0, orb: 8 },
  { kind: "sextile", angle: 60, orb: 5 },
  { kind: "square", angle: 90, orb: 7 },
  { kind: "trine", angle: 120, orb: 7 },
  { kind: "opposition", angle: 180, orb: 8 },
];
const LUMINARY_BONUS = 2;
const GENERATIONAL = new Set<BodyKey>(["uranus", "neptune", "pluto"]);

export interface Aspect {
  a: BodyKey;
  b: BodyKey;
  kind: AspectKind;
  /** Distance from exact, degrees. */
  orb: number;
}

export interface NatalChart {
  instant: Date;
  timeKnown: boolean;
  placements: Placement[];
  aspects: Aspect[];
  ascendant: number | null;
  midheaven: number | null;
}

function separation(x: number, y: number): number {
  const d = Math.abs(norm(x) - norm(y));
  return d > 180 ? 360 - d : d;
}

export function findAspects(placements: Array<Pick<Placement, "body" | "longitude">>): Aspect[] {
  const out: Aspect[] = [];
  for (let i = 0; i < placements.length; i++) {
    for (let j = i + 1; j < placements.length; j++) {
      const a = placements[i], b = placements[j];
      if (GENERATIONAL.has(a.body) && GENERATIONAL.has(b.body)) continue;
      const sep = separation(a.longitude, b.longitude);
      const bonus = [a.body, b.body].some((x) => x === "sun" || x === "moon") ? LUMINARY_BONUS : 0;
      for (const asp of ASPECTS) {
        const orb = Math.abs(sep - asp.angle);
        if (orb <= asp.orb + bonus) {
          out.push({ a: a.body, b: b.body, kind: asp.kind, orb: Math.round(orb * 10) / 10 });
          break;
        }
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

/** Midheaven: the ecliptic degree on the meridian. tan MC = tan RAMC / cos ε. */
export function midheaven(date: Date, longitude: number): number {
  const ramc = norm(Astronomy.SiderealTime(date) * 15 + longitude) * (Math.PI / 180);
  const e = meanObliquity(date) * (Math.PI / 180);
  return norm((Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(e)) * 180) / Math.PI);
}

function isRetro(body: BodyKey, date: Date): boolean {
  if (body === "sun" || body === "moon") return false;
  const d = bodyLongitude(body, new Date(date.getTime() + 43200000)) - bodyLongitude(body, new Date(date.getTime() - 43200000));
  return (d > 180 ? d - 360 : d < -180 ? d + 360 : d) < 0;
}

export function natalChart(input: { date: string; time: string | null; tz: string; place: { lat: number; lon: number } | null }): NatalChart {
  const timeKnown = !!input.time;
  const instant = localToUtc(input.date, input.time ?? "12:00", input.tz);
  const angles = timeKnown && input.place;
  const asc = angles ? ascendant(instant, input.place!.lat, input.place!.lon) : null;
  const mc = angles ? midheaven(instant, input.place!.lon) : null;
  const ascSign = asc === null ? null : signIndexFromLongitude(asc);
  const start = timeKnown ? null : localToUtc(input.date, "00:00", input.tz);
  const end = timeKnown ? null : localToUtc(input.date, "23:59", input.tz);
  const placements = BODIES.map((body): Placement => {
    const longitude = norm(bodyLongitude(body, instant));
    const signIndex = signIndexFromLongitude(longitude);
    return {
      body, longitude, signIndex,
      degree: longitude - signIndex * 30,
      retrograde: isRetro(body, instant),
      house: ascSign === null ? null : ((signIndex - ascSign + 12) % 12) + 1,
      uncertain: !timeKnown && signIndexFromLongitude(bodyLongitude(body, start!)) !== signIndexFromLongitude(bodyLongitude(body, end!)),
    };
  });
  return { instant, timeKnown, placements, aspects: findAspects(placements), ascendant: asc, midheaven: mc };
}
