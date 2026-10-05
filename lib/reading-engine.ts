/**
 * Assembles a daily reading from pre-written text blocks (build plan §7.1).
 * No runtime generation: every sentence comes from content/blocks/*.json.
 *
 * Variety guarantee: the Moon stays in a sign for 2–3 days and returns to it
 * about every 27.3 days, so the same solar house recurs both on consecutive
 * days and a lunar month later. Each topic's base block is chosen by
 *   (seed + a·lap + b·dayInStay) mod 3
 * with (a, b) = (1,0), (0,1), (1,1), (1,2) for the four topics. For any two
 * days within 30 days that share a house, at least one topic differs, so no
 * full reading repeats for a sign within 30 days (tested over a full year).
 */
import love from "../content/blocks/love.json";
import career from "../content/blocks/career.json";
import money from "../content/blocks/money.json";
import mood from "../content/blocks/mood.json";
import { hash, int, pick, rng } from "./random";
import { SIGNS, type WesternSign } from "./western";
import { moonLongitude, skyForDay, type PhaseGroup, type SkyDay } from "./sky";
import { addDays, fromKey } from "./dates";
import { signIndexFromLongitude } from "./western";
import { almanacDay, type AlmanacDay } from "./almanac";
import type { Lang } from "./i18n";

export type Topic = "love" | "career" | "money" | "mood";
export const TOPICS: Topic[] = ["love", "career", "money", "mood"];
export const TOPIC_LABEL: Record<Topic, string> = { love: "Love", career: "Career", money: "Money", mood: "Mood" };
/** @deprecated English only since 2026-10-05; an alias kept until the last caller is gone. */
export const TOPIC_LABEL_KM = TOPIC_LABEL;

export interface Block {
  id: string;
  topic: Topic;
  kind: "base" | "modifier";
  conditions: {
    house?: number[];
    moonPhase?: PhaseGroup[];
    retrograde?: Array<"mercury" | "venus" | "mars">;
    moonElement?: Array<"fire" | "earth" | "air" | "water">;
  };
  tone: string;
  text: string;
}

export const BLOCKS: Record<Topic, Block[]> = {
  love: love as Block[],
  career: career as Block[],
  money: money as Block[],
  mood: mood as Block[],
};

export const HOUSE_THEME = [
  "", "self", "money", "communication", "home", "romance and fun", "work and routines",
  "partnerships", "shared resources and change", "travel and learning", "career",
  "friends and goals", "rest and reflection",
];
/** @deprecated English only since 2026-10-05; an alias kept until the last caller is gone. */
export const HOUSE_THEME_KM = HOUSE_THEME;

/** Solar-sign house: ((moonSign − sunSign + 12) mod 12) + 1. */
export function solarHouse(moonSignIndex: number, sunSignIndex: number): number {
  return ((moonSignIndex - sunSignIndex + 12) % 12) + 1;
}

/** How well each house suits each topic, 1..5, before modifiers. */
const HOUSE_ENERGY: Record<Topic, number[]> = {
  //       h1 h2 h3 h4 h5 h6 h7 h8 h9 h10 h11 h12
  love:   [4, 3, 3, 3, 5, 3, 5, 4, 3, 3, 4, 2],
  career: [4, 3, 3, 2, 3, 4, 4, 3, 3, 5, 3, 2],
  money:  [3, 5, 3, 3, 2, 4, 3, 4, 3, 4, 3, 2],
  mood:   [5, 3, 4, 3, 5, 3, 3, 2, 4, 3, 4, 2],
};

const LAP_EPOCH = Date.UTC(2000, 0, 6, 18, 14); // a new Moon; any fixed instant works
const MEAN_DAILY_MOTION = 360 / 27.321582; // sidereal-ish lap of the zodiac

/** Number of times the Moon has lapped the zodiac since the epoch. */
export function lunarLap(dateKey: string, moonLongitude: number): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  const days = (Date.UTC(y, m - 1, d, 12) - LAP_EPOCH) / 86400000;
  const mean = 280 + days * MEAN_DAILY_MOTION; // approx mean longitude, unwrapped
  let delta = (moonLongitude - mean) % 360;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return Math.floor((mean + delta) / 360);
}

const moonSignCache = new Map<string, number>();
function moonSignOn(key: string): number {
  let v = moonSignCache.get(key);
  if (v === undefined) {
    v = signIndexFromLongitude(moonLongitude(fromKey(key)));
    moonSignCache.set(key, v);
  }
  return v;
}

/** 0 on the first day the Moon is in its current sign, 1 the next, then 2. */
export function dayInStay(date: string, moonSignIndex: number): number {
  let k = 0;
  while (k < 2 && moonSignOn(addDays(date, -(k + 1))) === moonSignIndex) k++;
  return k;
}

const ROTATION: Record<Topic, [number, number]> = { love: [1, 0], career: [0, 1], money: [1, 1], mood: [1, 2] };

export interface TopicReading {
  topic: Topic;
  label: string;
  energy: number;
  text: string;
  blockIds: string[];
}

export interface LuckyInfo {
  color: { name: string; element: "fire" | "earth" | "air" | "water" };
  number: number;
  hour: string;
  seal: string[] | null;
}

export interface DailyReading {
  sign: WesternSign;
  date: string;
  house: number;
  theme: string;
  sky: SkyDay;
  topics: TopicReading[];
  lucky: LuckyInfo;
  almanac: AlmanacDay;
}

const LUCKY_COLORS: Record<"fire" | "earth" | "air" | "water", string[]> = {
  fire: ["Scarlet", "Amber", "Coral", "Gold"],
  earth: ["Olive", "Terracotta", "Sand", "Forest green"],
  air: ["Sky blue", "Silver", "Lavender", "Pale yellow"],
  water: ["Sea green", "Indigo", "Pearl white", "Deep blue"],
};

// `...[]: [lang?: Lang]` keeps the old language argument for existing callers and ignores it (English only since 2026-10-05).
/** A lucky colour name from the reading engine in the page language. */
export const luckyColourName = (english: string, ...[]: [lang?: Lang]) => english;

/** The twelve Chinese double hours, as clock ranges. */
const DOUBLE_HOURS = [
  "11 pm – 1 am", "1 – 3 am", "3 – 5 am", "5 – 7 am", "7 – 9 am", "9 – 11 am",
  "11 am – 1 pm", "1 – 3 pm", "3 – 5 pm", "5 – 7 pm", "7 – 9 pm", "9 – 11 pm",
];

const ELEMENT_OF_SIGN = (i: number) => (["fire", "earth", "air", "water"] as const)[i % 4];

function modifiersFor(topic: Topic, sky: SkyDay): Block[] {
  const retro = (["mercury", "venus", "mars"] as const).filter((p) => sky.planets[p].retrograde);
  const moonEl = ELEMENT_OF_SIGN(sky.moon.signIndex);
  return BLOCKS[topic].filter((b) => {
    if (b.kind !== "modifier") return false;
    const c = b.conditions;
    if (c.moonPhase) return c.moonPhase.includes(sky.moon.phaseGroup);
    if (c.retrograde) return c.retrograde.some((p) => retro.includes(p));
    if (c.moonElement) return c.moonElement.includes(moonEl);
    return false;
  });
}

/**
 * texts: optional owner-edited text per block id (lib/blockText.ts). The
 * selection never depends on it, only the words shown, so the 30-day variety
 * guarantee holds whatever the owner edits.
 */
export function dailyReading(sign: WesternSign, date: string, skyIn?: SkyDay, texts?: ReadonlyMap<string, string>, ...[]: [lang?: Lang]): DailyReading {
  const sky = skyIn ?? skyForDay(date);
  const house = solarHouse(sky.moon.signIndex, sign.index);
  const lap = lunarLap(date, sky.moon.longitude);
  const stay = dayInStay(date, sky.moon.signIndex);
  const random = rng(hash(sign.slug + date));

  // One moon-phase note per reading, on one topic, so the same sentence
  // does not close every section. Retrograde and element notes go where they fit.
  const phaseTopic = TOPICS[Math.floor(random() * TOPICS.length)];

  const topics: TopicReading[] = TOPICS.map((topic) => {
    const bases = BLOCKS[topic].filter((b) => b.kind === "base" && b.conditions.house?.includes(house));
    const [a, b] = ROTATION[topic];
    const base = bases[(hash(`${sign.slug}|${topic}`) + a * lap + b * stay) % bases.length];
    const mods = modifiersFor(topic, sky);
    // At most one modifier per topic: a retrograde note when one applies,
    // the Moon's element for mood, the phase note only on the chosen topic.
    const retroMods = mods.filter((m) => m.conditions.retrograde);
    const elementMods = mods.filter((m) => m.conditions.moonElement);
    const phaseMods = topic === phaseTopic ? mods.filter((m) => m.conditions.moonPhase) : [];
    const roll = random();
    const mod =
      retroMods.length && roll < 0.5 ? pick(retroMods, random)
      : phaseMods.length ? pick(phaseMods, random)
      : elementMods.length && roll < 0.8 ? pick(elementMods, random)
      : null;

    let energy = HOUSE_ENERGY[topic][house - 1];
    if (sky.moon.phaseGroup === "waxing" && random() < 0.5) energy += 1;
    if (mod?.conditions.retrograde) energy -= 1;
    energy += int(-1, 1, random) * (random() < 0.35 ? 1 : 0);
    energy = Math.max(1, Math.min(5, energy));

    return {
      topic,
      label: TOPIC_LABEL[topic],
      energy,
      text: [base, mod].filter((b): b is Block => !!b).map((b) => texts?.get(b.id) ?? b.text).join(" "),
      blockIds: mod ? [base.id, mod.id] : [base.id],
    };
  });

  const almanac = almanacDay(date);
  const el = sign.element;
  const lucky: LuckyInfo = {
    color: { name: pick(LUCKY_COLORS[el], random), element: el },
    number: int(1, 9, random) + (random() < 0.5 ? 0 : 10 * int(1, 4, random)),
    hour: pick(DOUBLE_HOURS, random),
    seal: almanac.quality === "good" ? almanac.good.slice(0, 2) : null,
  };

  return { sign, date, house, theme: HOUSE_THEME[house], sky, topics, lucky, almanac };
}

export function readingsForDay(date: string, texts?: ReadonlyMap<string, string>, lang: Lang = "en"): DailyReading[] {
  const sky = skyForDay(date);
  return SIGNS.map((s) => dailyReading(s, date, sky, texts, lang));
}

export { SIGNS };
