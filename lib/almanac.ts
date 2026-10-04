/**
 * Traditional Chinese almanac for a calendar day, via lunar-javascript (MIT):
 * lunar date, day pillar, auspicious (宜) and inauspicious (忌) activities,
 * and the clash animal (build plan §5.10).
 *
 * Day quality rule (DECISIONS.md):
 *  - "good"         the day spirit is auspicious (黄道, 吉)
 *  - "challenging"  the day spirit is inauspicious (黑道, 凶) AND the day
 *                   officer is 破/危/闭, or the almanac says 诸事不宜
 *  - "neutral"      everything else
 */
import { Solar } from "lunar-javascript";
import termData from "../content/data/almanac-terms.json";
import { ANIMALS, type Animal } from "./chinese";

type TermTable = Record<string, { en: string; hide?: boolean }>;
const TERMS = termData.terms as TermTable;

const HANZI_ANIMAL: Record<string, string> = {
  鼠: "rat", 牛: "ox", 虎: "tiger", 兔: "rabbit", 龙: "dragon", 蛇: "snake",
  马: "horse", 羊: "goat", 猴: "monkey", 鸡: "rooster", 狗: "dog", 猪: "pig",
};

const STEM_PINYIN: Record<string, string> = {
  甲: "Jia", 乙: "Yi", 丙: "Bing", 丁: "Ding", 戊: "Wu", 己: "Ji", 庚: "Geng", 辛: "Xin", 壬: "Ren", 癸: "Gui",
};
const BRANCH_PINYIN: Record<string, string> = {
  子: "Zi", 丑: "Chou", 寅: "Yin", 卯: "Mao", 辰: "Chen", 巳: "Si", 午: "Wu", 未: "Wei", 申: "Shen", 酉: "You", 戌: "Xu", 亥: "Hai",
};

export type DayQuality = "good" | "neutral" | "challenging";

export interface AlmanacDay {
  date: string;
  lunarMonth: number;
  lunarDay: number;
  /** Leap months are negative in lunar-javascript; we expose the flag. */
  leapMonth: boolean;
  lunarLabel: string;
  dayPillar: string;
  dayPillarHanzi: string;
  good: string[];
  avoid: string[];
  clash: Animal;
  quality: DayQuality;
  /** The day officer (建除十二值星), Chinese and English. */
  officer: { hanzi: string; en: string };
  /** The day spirit (十二天神) and whether the almanac counts it auspicious. */
  spirit: { hanzi: string; en: string; auspicious: boolean };
  /** Untranslated 宜 / 忌 terms, for matching occasions (lib/luckyFinder.ts). */
  goodRaw: string[];
  avoidRaw: string[];
}

/** The twelve day officers. English names follow common almanac translations. */
export const OFFICERS: Record<string, string> = {
  建: "Establish", 除: "Remove", 满: "Full", 平: "Balance", 定: "Stable", 执: "Initiate",
  破: "Break", 危: "Danger", 成: "Success", 收: "Receive", 开: "Open", 闭: "Close",
};

/** The twelve spirits that rule days and double-hours (黄道 / 黑道). */
export const SPIRITS: Record<string, string> = {
  青龙: "Azure Dragon", 明堂: "Bright Hall", 天刑: "Heavenly Punishment", 朱雀: "Vermilion Bird",
  金匮: "Golden Coffer", 天德: "Heavenly Virtue", 白虎: "White Tiger", 玉堂: "Jade Hall",
  天牢: "Heavenly Prison", 玄武: "Black Tortoise", 司命: "Life Keeper", 勾陈: "Hook Array",
};

export const HANZI_TO_ANIMAL = HANZI_ANIMAL;

export function translateTerms(terms: string[]): string[] {
  const out: string[] = [];
  for (const t of terms) {
    const entry = TERMS[t];
    if (!entry) throw new Error(`Missing almanac term translation: ${t}`);
    if (!entry.hide) out.push(entry.en);
  }
  return out;
}

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export function almanacDay(key: string): AlmanacDay {
  const [y, m, d] = key.split("-").map(Number);
  const lunar = Solar.fromYmd(y, m, d).getLunar();
  const rawMonth = lunar.getMonth();
  const lunarMonth = Math.abs(rawMonth);
  const lunarDay = lunar.getDay();
  const yi = lunar.getDayYi();
  const ji = lunar.getDayJi();
  const luck = lunar.getDayTianShenLuck();
  const officer = lunar.getZhiXing();
  let quality: DayQuality = "neutral";
  if (luck === "吉") quality = "good";
  else if (["破", "危", "闭"].includes(officer) || yi.includes("诸事不宜")) quality = "challenging";
  const gan = lunar.getDayGan();
  const zhi = lunar.getDayZhi();
  return {
    date: key,
    lunarMonth,
    lunarDay,
    leapMonth: rawMonth < 0,
    lunarLabel: `${rawMonth < 0 ? "leap " : ""}${ordinal(lunarMonth)} month, day ${lunarDay}`,
    dayPillar: `${STEM_PINYIN[gan]} ${BRANCH_PINYIN[zhi]}`,
    dayPillarHanzi: gan + zhi,
    good: translateTerms(yi),
    avoid: translateTerms(ji),
    clash: ANIMALS.find((a) => a.slug === HANZI_ANIMAL[lunar.getDayChongShengXiao()])!,
    quality,
    officer: { hanzi: officer, en: OFFICERS[officer] ?? officer },
    spirit: { hanzi: lunar.getDayTianShen(), en: SPIRITS[lunar.getDayTianShen()] ?? lunar.getDayTianShen(), auspicious: luck === "吉" },
    goodRaw: yi,
    avoidRaw: ji,
  };
}
