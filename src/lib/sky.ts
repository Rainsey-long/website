/**
 * Sky positions from astronomy-engine (MIT): Moon sign and phase, planet
 * signs, retrograde flags, and the ascendant (build plan §5.2, §5.8).
 * All longitudes are tropical, ecliptic of date.
 */
import * as Astronomy from "astronomy-engine";
import { signIndexFromLongitude } from "./western";

export type PhaseGroup = "new" | "waxing" | "full" | "waning";

export interface MoonInfo {
  longitude: number;
  signIndex: number;
  /** 0..360, 0 = new, 180 = full. */
  phaseAngle: number;
  phaseName: string;
  phaseGroup: PhaseGroup;
  /** 0..100 */
  illumination: number;
}

export function moonLongitude(date: Date): number {
  return Astronomy.EclipticGeoMoon(date).lon;
}

export function phaseNameFromAngle(angle: number): { name: string; group: PhaseGroup } {
  const a = ((angle % 360) + 360) % 360;
  if (a < 22.5 || a >= 337.5) return { name: "new moon", group: "new" };
  if (a < 67.5) return { name: "waxing crescent", group: "waxing" };
  if (a < 112.5) return { name: "first quarter", group: "waxing" };
  if (a < 157.5) return { name: "waxing gibbous", group: "waxing" };
  if (a < 202.5) return { name: "full moon", group: "full" };
  if (a < 247.5) return { name: "waning gibbous", group: "waning" };
  if (a < 292.5) return { name: "last quarter", group: "waning" };
  return { name: "waning crescent", group: "waning" };
}

export function moonInfo(date: Date): MoonInfo {
  const longitude = moonLongitude(date);
  const phaseAngle = Astronomy.MoonPhase(date);
  const { name, group } = phaseNameFromAngle(phaseAngle);
  const illumination = Astronomy.Illumination(Astronomy.Body.Moon, date).phase_fraction * 100;
  return {
    longitude,
    signIndex: signIndexFromLongitude(longitude),
    phaseAngle,
    phaseName: name,
    phaseGroup: group,
    illumination: Math.round(illumination),
  };
}

const PLANETS = {
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
} as const;
export type PlanetKey = keyof typeof PLANETS;

/** Geocentric apparent ecliptic longitude of a planet, of date. */
export function planetLongitude(body: Astronomy.Body, date: Date): number {
  const vec = Astronomy.GeoVector(body, date, true);
  return Astronomy.Ecliptic(vec).elon;
}

/** Retrograde when the geocentric longitude decreases day over day. */
export function isRetrograde(body: Astronomy.Body, date: Date): boolean {
  const next = new Date(date.getTime() + 86400000);
  let delta = planetLongitude(body, next) - planetLongitude(body, date);
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta < 0;
}

export interface SkyDay {
  date: string;
  moon: MoonInfo;
  sunLongitude: number;
  sunSignIndex: number;
  planets: Record<PlanetKey, { longitude: number; signIndex: number; retrograde: boolean }>;
}

/** Sky for a calendar day, using the noon UTC value (plan §5.8). */
export function skyForDay(key: string): SkyDay {
  const [y, m, d] = key.split("-").map(Number);
  const noon = new Date(Date.UTC(y, m - 1, d, 12));
  const sunLon = Astronomy.SunPosition(noon).elon;
  const planets = {} as SkyDay["planets"];
  for (const [k, body] of Object.entries(PLANETS) as Array<[PlanetKey, Astronomy.Body]>) {
    const lon = planetLongitude(body, noon);
    planets[k] = {
      longitude: round(lon),
      signIndex: signIndexFromLongitude(lon),
      retrograde: isRetrograde(body, noon),
    };
  }
  const moon = moonInfo(noon);
  return {
    date: key,
    moon: { ...moon, longitude: round(moon.longitude), phaseAngle: round(moon.phaseAngle) },
    sunLongitude: round(sunLon),
    sunSignIndex: signIndexFromLongitude(sunLon),
    planets,
  };
}

const round = (n: number) => Math.round(n * 1000) / 1000;

const DEG = Math.PI / 180;

/** Mean obliquity of the ecliptic (IAU 2006, degrees). Accurate to well under 1″ for 1900–2100. */
export function meanObliquity(date: Date): number {
  const t = Astronomy.MakeTime(date).tt / 36525;
  return 23.439279444 - (46.815 / 3600) * t - (0.00059 / 3600) * t * t + (0.001813 / 3600) * t * t * t;
}

/**
 * Ascendant (ecliptic longitude rising on the eastern horizon) from the
 * right ascension of the meridian (RAMC), latitude and obliquity, degrees.
 *   ASC = atan2(cos RAMC, -(sin ε · tan φ + cos ε · sin RAMC))
 */
export function ascendantFromRamc(ramc: number, latitude: number, obliquity: number): number {
  const r = ramc * DEG;
  const e = obliquity * DEG;
  const phi = latitude * DEG;
  const asc = Math.atan2(Math.cos(r), -(Math.sin(e) * Math.tan(phi) + Math.cos(e) * Math.sin(r)));
  return ((asc / DEG) % 360 + 360) % 360;
}

/** Ascendant for an instant and place (longitude east-positive). */
export function ascendant(date: Date, latitude: number, longitude: number): number {
  const gast = Astronomy.SiderealTime(date); // hours
  const ramc = (((gast * 15 + longitude) % 360) + 360) % 360;
  return ascendantFromRamc(ramc, latitude, meanObliquity(date));
}
