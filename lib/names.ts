/**
 * Names in both languages for the things every page mentions: zodiac signs,
 * animals, elements, planets. Directive-free and dependency-free so client
 * components can use it. Khmer forms are the traditional ones (the rasi names
 * for the Western signs, the Khmer zodiac-year names for the animals); all are
 * drafts for native review (docs/KHMER-REVIEW.md).
 */
import type { Lang } from "./i18n";

const SIGN: Record<string, { en: string; km: string }> = {
  aries: { en: "Aries", km: "មេស" }, taurus: { en: "Taurus", km: "ឧសភ" }, gemini: { en: "Gemini", km: "មិថុន" },
  cancer: { en: "Cancer", km: "កក៌ដ" }, leo: { en: "Leo", km: "សីហ៍" }, virgo: { en: "Virgo", km: "កញ្ញ" },
  libra: { en: "Libra", km: "តុល" }, scorpio: { en: "Scorpio", km: "វិច្ឆិក" }, sagittarius: { en: "Sagittarius", km: "ធ្នូ" },
  capricorn: { en: "Capricorn", km: "មករ" }, aquarius: { en: "Aquarius", km: "កុម្ភៈ" }, pisces: { en: "Pisces", km: "មីន" },
};

const ANIMAL: Record<string, { en: string; km: string }> = {
  rat: { en: "Rat", km: "ជូត" }, ox: { en: "Ox", km: "ឆ្លូវ" }, tiger: { en: "Tiger", km: "ខាល" }, rabbit: { en: "Rabbit", km: "ថោះ" },
  dragon: { en: "Dragon", km: "រោង" }, snake: { en: "Snake", km: "ម្សាញ់" }, horse: { en: "Horse", km: "មមី" }, goat: { en: "Goat", km: "មមែ" },
  monkey: { en: "Monkey", km: "វក" }, rooster: { en: "Rooster", km: "រកា" }, dog: { en: "Dog", km: "ច" }, pig: { en: "Pig", km: "កុរ" },
};

const ELEMENT: Record<string, { en: string; km: string }> = {
  wood: { en: "Wood", km: "ឈើ" }, fire: { en: "Fire", km: "ភ្លើង" }, earth: { en: "Earth", km: "ដី" },
  metal: { en: "Metal", km: "លោហៈ" }, water: { en: "Water", km: "ទឹក" }, air: { en: "Air", km: "ខ្យល់" },
};

const PLANET: Record<string, { en: string; km: string }> = {
  sun: { en: "Sun", km: "ព្រះអាទិត្យ" }, moon: { en: "Moon", km: "ព្រះចន្ទ" }, mercury: { en: "Mercury", km: "ព្រះពុធ" },
  venus: { en: "Venus", km: "ព្រះសុក្រ" }, mars: { en: "Mars", km: "ព្រះអង្គារ" }, jupiter: { en: "Jupiter", km: "ព្រះព្រហស្បតិ៍" },
  saturn: { en: "Saturn", km: "ព្រះសៅរ៍" }, uranus: { en: "Uranus", km: "អ៊ុយរ៉ានុស" }, neptune: { en: "Neptune", km: "ណិបទូន" },
  pluto: { en: "Pluto", km: "ភ្លុយតូ" },
};

const get = (table: Record<string, { en: string; km: string }>, slug: string, lang: Lang) => table[slug]?.[lang] ?? table[slug]?.en ?? slug;

export const signName = (slug: string, lang: Lang) => get(SIGN, slug, lang);
export const animalName = (slug: string, lang: Lang) => get(ANIMAL, slug, lang);
export const elementName = (element: string, lang: Lang) => get(ELEMENT, element, lang);
export const planetName = (body: string, lang: Lang) => get(PLANET, body, lang);
/** "Year of the Rat" / "ឆ្នាំជូត". */
export const yearOf = (slug: string, lang: Lang) => (lang === "km" ? `ឆ្នាំ${get(ANIMAL, slug, "km")}` : `Year of the ${get(ANIMAL, slug, "en")}`);
