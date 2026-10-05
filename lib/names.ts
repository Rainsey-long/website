/**
 * Names for the things every page mentions: zodiac signs, animals, elements,
 * planets. Directive-free and dependency-free so client components can use it.
 * The site is English only (2026-10-05); the `lang` parameters stay so
 * existing call sites compile, and every function returns English.
 */
import type { Lang } from "./i18n";

const SIGN: Record<string, string> = {
  aries: "Aries", taurus: "Taurus", gemini: "Gemini", cancer: "Cancer", leo: "Leo", virgo: "Virgo",
  libra: "Libra", scorpio: "Scorpio", sagittarius: "Sagittarius", capricorn: "Capricorn", aquarius: "Aquarius", pisces: "Pisces",
};

const ANIMAL: Record<string, string> = {
  rat: "Rat", ox: "Ox", tiger: "Tiger", rabbit: "Rabbit", dragon: "Dragon", snake: "Snake",
  horse: "Horse", goat: "Goat", monkey: "Monkey", rooster: "Rooster", dog: "Dog", pig: "Pig",
};

const ELEMENT: Record<string, string> = {
  wood: "Wood", fire: "Fire", earth: "Earth", metal: "Metal", water: "Water", air: "Air",
};

const PLANET: Record<string, string> = {
  sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars", jupiter: "Jupiter",
  saturn: "Saturn", uranus: "Uranus", neptune: "Neptune", pluto: "Pluto",
};

const get = (table: Record<string, string>, slug: string) => table[slug] ?? slug;

// `...[]: [lang?: Lang]` keeps the old language argument for existing callers and ignores it (English only since 2026-10-05).
export const signName = (slug: string, ...[]: [lang?: Lang]) => get(SIGN, slug);
export const animalName = (slug: string, ...[]: [lang?: Lang]) => get(ANIMAL, slug);
export const elementName = (element: string, ...[]: [lang?: Lang]) => get(ELEMENT, element);
export const planetName = (body: string, ...[]: [lang?: Lang]) => get(PLANET, body);
/** "Year of the Rat". */
export const yearOf = (slug: string, ...[]: [lang?: Lang]) => `Year of the ${get(ANIMAL, slug)}`;

/** A colour name from the lucky-colour tables (already English). */
export const colourName = (english: string, ...[]: [lang?: Lang]) => english;
/** Moon phase names (lib/sky.ts phaseNameFromAngle output). */
export const moonPhaseName = (english: string, ...[]: [lang?: Lang]) => english;
/** Reading topics (love, career, money, mood): the English label passed in. */
export const topicName = (...[, , english]: [topic: string, lang: Lang, english: string]) => english;
