/**
 * Southeast Asian zodiac variants (build plan §5.9).
 *  - Khmer: same 12 animals; the animal year turns at the exact Moha Songkran
 *    moment (mid-April), computed by lib/khmer.ts (Chhankitek algorithm).
 *  - Vietnamese: Cat replaces Rabbit, Buffalo replaces Ox; turns at Tết (= Lunar New Year).
 */
import { ANIMALS, zodiacYearForDate, type Animal } from "./chinese";
import { KHMER_ANIMALS, khmerAnimalAt, songkran } from "./khmer";

export const KHMER_NAMES = KHMER_ANIMALS.map((a) => `${a.roman} (${a.km})`);

export const VIETNAMESE_NAMES = [
  "Rat (Tý)", "Buffalo (Sửu)", "Tiger (Dần)", "Cat (Mão)", "Dragon (Thìn)", "Snake (Tỵ)",
  "Horse (Ngọ)", "Goat (Mùi)", "Monkey (Thân)", "Rooster (Dậu)", "Dog (Tuất)", "Pig (Hợi)",
];

/** Khmer New Year (Moha Songkran) date for a year, Cambodian local time. */
export function khmerNewYear(year: number): { date: string; time: string } {
  const s = songkran(year);
  return { date: s.date, time: s.time };
}

export interface TraditionResult {
  tradition: "chinese" | "khmer" | "vietnamese";
  label: string;
  animal: Animal;
  animalName: string;
}

/** time: birth time in Cambodian local time when known; it only matters on Songkran day. */
export function traditions(y: number, m: number, d: number, time: string | null = null): TraditionResult[] {
  const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const chinese = zodiacYearForDate(y, m, d);
  const k = khmerAnimalAt(key, time);
  const khmer = ANIMALS.find((a) => a.slug === k.slug)!;
  return [
    { tradition: "chinese", label: "Chinese", animal: chinese.animal, animalName: chinese.animal.name },
    { tradition: "khmer", label: "Khmer", animal: khmer, animalName: `${khmer.name} (${k.km}, ${k.roman})` },
    { tradition: "vietnamese", label: "Vietnamese", animal: chinese.animal, animalName: VIETNAMESE_NAMES[chinese.animal.index] },
  ];
}

export function traditionsDiffer(results: TraditionResult[]): boolean {
  return new Set(results.map((r) => r.animal.index)).size > 1;
}
