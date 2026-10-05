/**
 * Chinese zodiac: animals, heavenly stems, five elements, and the animal for a
 * birth date with the Lunar New Year boundary (build plan §5.4, §5.5).
 *
 * Boundary rule: the popular animal changes at Lunar New Year (taken from
 * lunar-javascript, never hardcoded). The BaZi year pillar changes at Lichun
 * (~4 Feb) and is reported separately so the two are never confused.
 */
import lnyTable from "./data/lny.json";

export type FiveElement = "wood" | "fire" | "earth" | "metal" | "water";

export interface Animal {
  index: number;
  slug: string;
  name: string;
  /** Fixed element of the animal's earthly branch. */
  branchElement: FiveElement;
  yinYang: "yin" | "yang";
  hanzi: string;
}

const ANIMAL_RAW: Array<[string, string, FiveElement, string]> = [
  ["rat", "Rat", "water", "鼠"],
  ["ox", "Ox", "earth", "牛"],
  ["tiger", "Tiger", "wood", "虎"],
  ["rabbit", "Rabbit", "wood", "兔"],
  ["dragon", "Dragon", "earth", "龍"],
  ["snake", "Snake", "fire", "蛇"],
  ["horse", "Horse", "fire", "馬"],
  ["goat", "Goat", "earth", "羊"],
  ["monkey", "Monkey", "metal", "猴"],
  ["rooster", "Rooster", "metal", "雞"],
  ["dog", "Dog", "earth", "狗"],
  ["pig", "Pig", "water", "豬"],
];

export const ANIMALS: Animal[] = ANIMAL_RAW.map(([slug, name, branchElement, hanzi], index) => ({
  index,
  slug,
  name,
  branchElement,
  hanzi,
  yinYang: index % 2 === 0 ? "yang" : "yin",
}));

export function animalBySlug(slug: string): Animal | undefined {
  return ANIMALS.find((a) => a.slug === slug);
}

export const STEMS = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"];
export const ELEMENTS: FiveElement[] = ["wood", "fire", "earth", "metal", "water"];
export const ELEMENT_NAME: Record<FiveElement, string> = {
  wood: "Wood",
  fire: "Fire",
  earth: "Earth",
  metal: "Metal",
  water: "Water",
};

const mod = (n: number, m: number) => ((n % m) + m) % m;

export interface ZodiacYear {
  year: number;
  animal: Animal;
  stem: string;
  element: FiveElement;
  yinYang: "yin" | "yang";
}

/** Animal, stem and element for a zodiac year y (plan §5.4). */
export function zodiacYear(year: number): ZodiacYear {
  const stemIndex = mod(year - 4, 10);
  return {
    year,
    animal: ANIMALS[mod(year - 4, 12)],
    stem: STEMS[stemIndex],
    element: ELEMENTS[Math.floor(stemIndex / 2)],
    yinYang: stemIndex % 2 === 0 ? "yang" : "yin",
  };
}

const LNY = lnyTable as Record<string, string>;

/**
 * Gregorian date (YYYY-MM-DD) of Lunar New Year for year y, 1900–2100.
 * Read from src/data/lny.json, generated from lunar-javascript by
 * scripts/generate-lny.mjs (a test checks the two agree), so the browser
 * never needs the library.
 */
export function lunarNewYear(year: number): string {
  const md = LNY[String(year)];
  if (!md) throw new RangeError(`Lunar New Year table covers 1900–2100, not ${year}`);
  return `${year}-${md}`;
}

/** The popular zodiac year a local calendar date belongs to. */
export function zodiacYearForDate(y: number, m: number, d: number): ZodiacYear {
  const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return zodiacYear(key < lunarNewYear(y) ? y - 1 : y);
}

/** Display name such as "Fire Goat". */
export function zodiacLabel(z: ZodiacYear): string {
  return `${ELEMENT_NAME[z.element]} ${z.animal.name}`;
}

/* Five elements cycles (plan §5.5). */
const GENERATES: Record<FiveElement, FiveElement> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};
const CONTROLS: Record<FiveElement, FiveElement> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

export type ElementRelation = "same" | "generates" | "generated-by" | "controls" | "controlled-by";

export function elementRelation(a: FiveElement, b: FiveElement): ElementRelation {
  if (a === b) return "same";
  if (GENERATES[a] === b) return "generates";
  if (GENERATES[b] === a) return "generated-by";
  if (CONTROLS[a] === b) return "controls";
  return "controlled-by";
}

export const LUCKY_COLORS: Record<FiveElement, Array<{ name: string; swatch: string }>> = {
  wood: [
    { name: "Green", swatch: "wood" },
    { name: "Teal", swatch: "wood" },
  ],
  fire: [
    { name: "Red", swatch: "fire" },
    { name: "Purple", swatch: "fire" },
  ],
  earth: [
    { name: "Yellow", swatch: "earth" },
    { name: "Brown", swatch: "earth" },
  ],
  metal: [
    { name: "White", swatch: "air" },
    { name: "Gold", swatch: "air" },
    { name: "Silver", swatch: "air" },
  ],
  water: [
    { name: "Black", swatch: "water" },
    { name: "Blue", swatch: "water" },
  ],
};

/**
 * Lucky numbers, deterministic. Rule (documented per plan §5.5):
 *  - Each element owns the two digits of the He Tu (River Map) pairing:
 *    water 1/6, fire 2/7, wood 3/8, metal 4/9, earth 5/10→0.
 *  - Each animal adds its own branch number (1–12, Rat = 1).
 * Returned sorted and de-duplicated.
 */
const HETU: Record<FiveElement, [number, number]> = {
  water: [1, 6],
  fire: [2, 7],
  wood: [3, 8],
  metal: [4, 9],
  earth: [5, 0],
};

export function luckyNumbers(element: FiveElement, animal: Animal): number[] {
  return [...new Set([...HETU[element], animal.index + 1])].sort((a, b) => a - b);
}
