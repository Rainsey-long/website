/**
 * Southeast Asian zodiac variants (build plan §5.9).
 *  - Khmer: same 12 animals; the animal year turns at Khmer New Year (mid-April),
 *    dates read from content/data/khmer-new-year.json (owner verifies).
 *  - Vietnamese: Cat replaces Rabbit, Buffalo replaces Ox; turns at Tết (= Lunar New Year).
 */
import khnyData from "../../content/data/khmer-new-year.json";
import { ANIMALS, zodiacYear, zodiacYearForDate, type Animal } from "./chinese";

/** Romanized Khmer names; owner must verify spelling and Khmer script. */
export const KHMER_NAMES = [
  "Chuot", "Chhlov", "Khal", "Thos", "Rorng", "Masanh",
  "Momee", "Momae", "Vok", "Roka", "Cho", "Kor",
];

export const VIETNAMESE_NAMES = [
  "Rat (Tý)", "Buffalo (Sửu)", "Tiger (Dần)", "Cat (Mão)", "Dragon (Thìn)", "Snake (Tỵ)",
  "Horse (Ngọ)", "Goat (Mùi)", "Monkey (Thân)", "Rooster (Dậu)", "Dog (Tuất)", "Pig (Hợi)",
];

const KHNY = khnyData.dates as Record<string, string>;

/** Khmer New Year date for a year. Falls back to 14 April when the table has no entry. */
export function khmerNewYear(year: number): { date: string; verified: boolean } {
  const date = KHNY[String(year)];
  if (date) return { date, verified: true };
  return { date: `${year}-04-14`, verified: false };
}

export interface TraditionResult {
  tradition: "chinese" | "khmer" | "vietnamese";
  label: string;
  animal: Animal;
  animalName: string;
  year: number;
}

export function traditions(y: number, m: number, d: number): TraditionResult[] {
  const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const chinese = zodiacYearForDate(y, m, d);
  const khmerYear = key < khmerNewYear(y).date ? y - 1 : y;
  const khmer = zodiacYear(khmerYear);
  return [
    { tradition: "chinese", label: "Chinese", animal: chinese.animal, animalName: chinese.animal.name, year: chinese.year },
    {
      tradition: "khmer",
      label: "Khmer",
      animal: khmer.animal,
      animalName: `${khmer.animal.name} (${KHMER_NAMES[khmer.animal.index]})`,
      year: khmerYear,
    },
    {
      tradition: "vietnamese",
      label: "Vietnamese",
      animal: chinese.animal,
      animalName: VIETNAMESE_NAMES[chinese.animal.index],
      year: chinese.year,
    },
  ];
}

/** True when the traditions disagree on the animal, which the calculator explains. */
export function traditionsDiffer(results: TraditionResult[]): boolean {
  return new Set(results.map((r) => r.animal.index)).size > 1;
}

export { ANIMALS };
