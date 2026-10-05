/**
 * Western (tropical) zodiac: signs, elements, modalities, and sun-sign lookup
 * from the Sun's real ecliptic longitude (build plan §5.1, §5.3).
 */
import * as Astronomy from "astronomy-engine";
import type { Lang } from "./i18n";

export type Element = "fire" | "earth" | "air" | "water";
export type Modality = "cardinal" | "fixed" | "mutable";

export interface WesternSign {
  index: number;
  slug: string;
  name: string;
  element: Element;
  modality: Modality;
  ruler: string;
  /** Typical date range, for display only. The calculator uses the Sun's position. */
  range: string;
  symbol: string;
}

const RAW: Array<[string, string, string, string]> = [
  ["aries", "Aries", "Mars", "21 Mar – 19 Apr"],
  ["taurus", "Taurus", "Venus", "20 Apr – 20 May"],
  ["gemini", "Gemini", "Mercury", "21 May – 20 Jun"],
  ["cancer", "Cancer", "the Moon", "21 Jun – 22 Jul"],
  ["leo", "Leo", "the Sun", "23 Jul – 22 Aug"],
  ["virgo", "Virgo", "Mercury", "23 Aug – 22 Sep"],
  ["libra", "Libra", "Venus", "23 Sep – 22 Oct"],
  ["scorpio", "Scorpio", "Mars and Pluto", "23 Oct – 21 Nov"],
  ["sagittarius", "Sagittarius", "Jupiter", "22 Nov – 21 Dec"],
  ["capricorn", "Capricorn", "Saturn", "22 Dec – 19 Jan"],
  ["aquarius", "Aquarius", "Saturn and Uranus", "20 Jan – 18 Feb"],
  ["pisces", "Pisces", "Jupiter and Neptune", "19 Feb – 20 Mar"],
];

const ELEMENTS: Element[] = ["fire", "earth", "air", "water"];
const MODALITIES: Modality[] = ["cardinal", "fixed", "mutable"];
const SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

export const SIGNS: WesternSign[] = RAW.map(([slug, name, ruler, range], index) => ({
  index,
  slug,
  name,
  ruler,
  range,
  element: ELEMENTS[index % 4],
  modality: MODALITIES[index % 3],
  symbol: SYMBOLS[index],
}));

export function signBySlug(slug: string): WesternSign | undefined {
  return SIGNS.find((s) => s.slug === slug);
}

/** Sign index 0..11 for an ecliptic longitude in degrees. */
export function signIndexFromLongitude(lon: number): number {
  const norm = ((lon % 360) + 360) % 360;
  return Math.floor(norm / 30);
}

/** The Sun's apparent tropical ecliptic longitude (of date) at an instant. */
export function sunLongitude(date: Date): number {
  return Astronomy.SunPosition(date).elon;
}

export interface SunSignResult {
  sign: WesternSign;
  longitude: number;
  /** Set when the Sun is within ~1 day (1°) of a sign boundary. */
  cusp: { other: WesternSign } | null;
}

export function sunSign(date: Date): SunSignResult {
  const longitude = sunLongitude(date);
  const sign = SIGNS[signIndexFromLongitude(longitude)];
  const within = longitude % 30;
  let cusp: SunSignResult["cusp"] = null;
  if (within < 1) cusp = { other: SIGNS[(sign.index + 11) % 12] };
  else if (within > 29) cusp = { other: SIGNS[(sign.index + 1) % 12] };
  return { sign, longitude, cusp };
}

export const ELEMENT_LABEL: Record<Element, string> = {
  fire: "Fire",
  earth: "Earth",
  air: "Air",
  water: "Water",
};
// `...[]: [lang?: Lang]` keeps the old language argument for existing callers and ignores it (English only since 2026-10-05).
export const elementLabel = (e: Element, ...[]: [lang?: Lang]) => ELEMENT_LABEL[e];
export const modalityLabel = (m: Modality, ...[]: [lang?: Lang]) => MODALITY_LABEL[m];
export const signRuler = (s: WesternSign, ...[]: [lang?: Lang]) => s.ruler;
/** "21 Mar – 19 Apr". */
export const signRange = (s: WesternSign, ...[]: [lang?: Lang]) => s.range;

export const MODALITY_LABEL: Record<Modality, string> = {
  cardinal: "Cardinal",
  fixed: "Fixed",
  mutable: "Mutable",
};
