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
  cancer: { en: "Cancer", km: "កក្កដ" }, leo: { en: "Leo", km: "សីហ៍" }, virgo: { en: "Virgo", km: "កញ្ញ" },
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

const COLOUR: Record<string, string> = {
  Black: "ខ្មៅ", Blue: "ខៀវ", Brown: "ត្នោត", Gold: "មាស", Green: "បៃតង", Purple: "ស្វាយ", Red: "ក្រហម",
  Silver: "ប្រាក់", Teal: "ខៀវបៃតង", White: "ស", Yellow: "លឿង", Orange: "ទឹកក្រូច", Pink: "ផ្កាឈូក", Grey: "ប្រផេះ",
  Coral: "ផ្កាថ្ម", Navy: "ខៀវចាស់", Cream: "ក្រែម", Indigo: "ខៀវចាស់ស្វាយ", Turquoise: "ខៀវទឹកសមុទ្រ", Lavender: "ស្វាយស្រាល",
};
/** A colour name from the lucky-colour tables, by its English name (falls back to English). */
export const colourName = (english: string, lang: Lang) => (lang === "km" ? (COLOUR[english] ?? english) : english);

const PHASE: Record<string, string> = {
  "new moon": "ព្រះចន្ទងងឹត", "waxing crescent": "ព្រះចន្ទចាប់ផ្ដើមភ្លឺ", "first quarter": "ព្រះចន្ទកន្លះដើមខែ",
  "waxing gibbous": "ព្រះចន្ទជិតពេញវង់", "full moon": "ព្រះចន្ទពេញវង់", "waning gibbous": "ព្រះចន្ទចាប់ផ្ដើមរួញ",
  "last quarter": "ព្រះចន្ទកន្លះចុងខែ", "waning crescent": "ព្រះចន្ទជិតងងឹត",
};
/** Moon phase names (lib/sky.ts phaseNameFromAngle output) in the page language. */
export const moonPhaseName = (english: string, lang: Lang) => (lang === "km" ? (PHASE[english] ?? english) : english);

const TOPIC: Record<string, string> = { love: "ស្នេហា", career: "ការងារ", money: "ហិរញ្ញវត្ថុ", mood: "អារម្មណ៍" };
/** Reading topics (love, career, money, mood). */
export const topicName = (topic: string, lang: Lang, english: string) => (lang === "km" ? (TOPIC[topic] ?? english) : english);
