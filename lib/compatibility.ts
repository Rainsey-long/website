/**
 * Compatibility scoring for Chinese animal pairs (plan §5.6) and Western sign
 * pairs (plan §5.7). Every score is deterministic.
 */
import { ANIMALS, elementRelation, type Animal } from "./chinese";
import { SIGNS, type WesternSign } from "./western";
import { hash, int, rng } from "./random";
import type { Lang } from "./i18n";

/* ---------- Chinese ---------- */

export type ChineseRelation = "three-harmonies" | "six-harmonies" | "same" | "neutral" | "harm" | "clash";

const TRINES = [
  ["rat", "dragon", "monkey"],
  ["ox", "snake", "rooster"],
  ["tiger", "horse", "dog"],
  ["rabbit", "goat", "pig"],
];
const pairs = (list: string[]) => list.map((p) => p.split("-").sort().join("-"));
const SIX_HARMONIES = pairs(["rat-ox", "tiger-pig", "rabbit-dog", "dragon-rooster", "snake-monkey", "horse-goat"]);
const SIX_CLASHES = pairs(["rat-horse", "ox-goat", "tiger-monkey", "rabbit-rooster", "dragon-dog", "snake-pig"]);
const SIX_HARMS = pairs(["rat-goat", "ox-horse", "tiger-snake", "rabbit-dragon", "monkey-pig", "rooster-dog"]);

export const RELATION_NAME: Record<ChineseRelation, string> = {
  "three-harmonies": "Three Harmonies",
  "six-harmonies": "Six Harmonies",
  same: "Same animal",
  neutral: "Neutral pair",
  harm: "Six Harms",
  clash: "Six Clashes",
};

/** Khmer names for the Chinese relations (drafts for native review). */
export const RELATION_NAME_KM: Record<ChineseRelation, string> = {
  "three-harmonies": "ត្រីសុខដុម",
  "six-harmonies": "ឆសុខដុម",
  same: "សត្វដូចគ្នា",
  neutral: "គូអព្យាក្រឹត",
  harm: "ឆគ្រោះ",
  clash: "ឆប៉ះទង្គិច",
};
export const relationName = (r: ChineseRelation, lang: Lang = "en") => (lang === "km" ? RELATION_NAME_KM : RELATION_NAME)[r];

export function chineseRelation(a: Animal, b: Animal): ChineseRelation {
  if (a.slug === b.slug) return "same";
  const key = [a.slug, b.slug].sort().join("-");
  if (TRINES.some((t) => t.includes(a.slug) && t.includes(b.slug))) return "three-harmonies";
  if (SIX_HARMONIES.includes(key)) return "six-harmonies";
  if (SIX_CLASHES.includes(key)) return "clash";
  if (SIX_HARMS.includes(key)) return "harm";
  return "neutral";
}

const CHINESE_RANGE: Record<ChineseRelation, [number, number]> = {
  "three-harmonies": [90, 95],
  "six-harmonies": [85, 90],
  same: [68, 75],
  neutral: [60, 70],
  harm: [40, 50],
  clash: [30, 40],
};

export interface PairScore {
  score: number;
  love: number;
  friendship: number;
  work: number;
}

/** Map a 0–100 score to an EnergyMeter rating 1..5. */
export const toMeter = (n: number) => Math.max(1, Math.min(5, Math.round(n / 20)));

/**
 * Chinese pair score. Base from the relation range, picked deterministically
 * from the pair's hash; then ±3 by branch-element relation (generating +,
 * controlling −), clamped to the relation's range so the label always matches.
 */
export function chineseScore(a: Animal, b: Animal): PairScore & { relation: ChineseRelation } {
  const relation = chineseRelation(a, b);
  const [lo, hi] = CHINESE_RANGE[relation];
  const key = [a.slug, b.slug].sort().join("-");
  const r = rng(hash(`cn:${key}`));
  let score = int(lo, hi, r);
  const rel = elementRelation(a.branchElement, b.branchElement);
  if (rel === "generates" || rel === "generated-by") score += 3;
  if (rel === "controls" || rel === "controlled-by") score -= 3;
  score = Math.max(lo, Math.min(hi, score));
  return {
    relation,
    score,
    love: clamp(score + int(-8, 6, r)),
    friendship: clamp(score + int(-5, 8, r)),
    work: clamp(score + int(-8, 8, r)),
  };
}

/* ---------- Western ---------- */

export type WesternRelation =
  | "same-sign"
  | "same-element"
  | "complementary"
  | "opposites"
  | "square"
  | "mismatch"
  | "neutral";

export const WESTERN_RELATION_NAME: Record<WesternRelation, string> = {
  "same-sign": "Mirror match",
  "same-element": "Kindred element",
  complementary: "Complementary elements",
  opposites: "Opposites attract",
  square: "Creative tension",
  mismatch: "Different languages",
  neutral: "Easy neighbours",
};

export const WESTERN_RELATION_NAME_KM: Record<WesternRelation, string> = {
  "same-sign": "គូកញ្ចក់",
  "same-element": "ធាតុដូចគ្នា",
  complementary: "ធាតុបំពេញគ្នា",
  opposites: "ផ្ទុយគ្នាតែទាក់ទាញគ្នា",
  square: "ភាពតានតឹងដែលជំរុញការច្នៃប្រឌិត",
  mismatch: "ភាសាខុសគ្នា",
  neutral: "អ្នកជិតខាងងាយស្រួល",
};
export const westernRelationName = (r: WesternRelation, lang: Lang = "en") => (lang === "km" ? WESTERN_RELATION_NAME_KM : WESTERN_RELATION_NAME)[r];

export function westernRelation(a: WesternSign, b: WesternSign): WesternRelation {
  if (a.index === b.index) return "same-sign";
  const distance = Math.min((a.index - b.index + 12) % 12, (b.index - a.index + 12) % 12);
  if (distance === 6) return "opposites";
  if (a.element === b.element) return "same-element";
  if (distance === 3) return "square";
  const els = [a.element, b.element].sort().join("+");
  if (els === "air+fire" || els === "earth+water") return "complementary";
  if (els === "fire+water" || els === "air+earth") return "mismatch";
  return "neutral";
}

const WESTERN_RANGE: Record<WesternRelation, [number, number]> = {
  "same-element": [84, 92],
  complementary: [80, 88],
  opposites: [72, 82],
  "same-sign": [70, 80],
  neutral: [58, 68],
  square: [42, 54],
  mismatch: [38, 50],
};

export function westernScore(a: WesternSign, b: WesternSign): PairScore & { relation: WesternRelation } {
  const relation = westernRelation(a, b);
  const [lo, hi] = WESTERN_RANGE[relation];
  const key = [a.slug, b.slug].sort().join("-");
  const r = rng(hash(`w:${key}`));
  const score = int(lo, hi, r);
  // Sub-scores lean on element character: water/earth favour love, air/fire friendship.
  const tilt = (s: WesternSign) => (s.element === "water" || s.element === "earth" ? 1 : -1);
  const t = tilt(a) + tilt(b);
  return {
    relation,
    score,
    love: clamp(score + t * 3 + int(-4, 4, r)),
    friendship: clamp(score - t * 3 + int(-4, 4, r)),
    work: clamp(score + (a.modality === b.modality ? -5 : 3) + int(-4, 4, r)),
  };
}

const clamp = (n: number) => Math.max(5, Math.min(99, n));

/** Canonical (alphabetical) pair slug, e.g. "aries-and-leo". */
export function pairSlug(a: string, b: string): string {
  const [x, y] = [a, b].sort();
  return `${x}-and-${y}`;
}

export function parsePairSlug(slug: string): [string, string] | null {
  const m = /^([a-z]+)-and-([a-z]+)$/.exec(slug);
  return m ? [m[1], m[2]] : null;
}

/** Score band label in words, so colour is never the only signal. */
export function scoreBand(score: number, lang: Lang = "en"): { label: string; tone: "high" | "mid" | "low" } {
  const km = lang === "km";
  if (score >= 80) return { label: km ? "ត្រូវគ្នាខ្លាំង" : "Strong match", tone: "high" };
  if (score >= 55) return { label: km ? "អាចត្រូវគ្នាបាន" : "Workable match", tone: "mid" };
  return { label: km ? "ត្រូវការការខិតខំ" : "Needs effort", tone: "low" };
}

export { ANIMALS, SIGNS };
