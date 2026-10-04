/**
 * Khmer traditional calendar and fortune (research: docs/research/KHMER-TRADITIONS.md).
 *
 * Lunar dates, Buddhist Era, animal year, sak and the Moha Songkran moment
 * come from @thyrith/momentkh (MIT, © 2018 ThyrithSor), an implementation of
 * the published Chhankitek algorithm. It is called with explicit
 * year/month/day/hour numbers, never a Date, so the result does not depend on
 * the server's time zone (verified: identical output under UTC, Los Angeles
 * and Phnom Penh). All Khmer moments are Cambodian local time (UTC+7).
 *
 * Deliberately NOT built (research §7–§9): Bizot's "eight influences",
 * war/epidemic/illness omens, wedding "good day" picking, number divination.
 * They are either sensitive, unverifiable, or the job of an achar.
 */
import * as kh from "@thyrith/momentkh";

export const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
export const toKhmerNum = (n: number | string) => String(n).replace(/[0-9]/g, (d) => KHMER_DIGITS[Number(d)]);

export const LUNAR_MONTHS: Array<{ km: string; en: string }> = [
  { km: "មិគសិរ", en: "Migasir" }, { km: "បុស្ស", en: "Boss" }, { km: "មាឃ", en: "Meak" },
  { km: "ផល្គុន", en: "Phalkun" }, { km: "ចេត្រ", en: "Cheit" }, { km: "ពិសាខ", en: "Pisakh" },
  { km: "ជេស្ឋ", en: "Jesth" }, { km: "អាសាឍ", en: "Asadh" }, { km: "ស្រាពណ៍", en: "Srap" },
  { km: "ភទ្របទ", en: "Phatrabot" }, { km: "អស្សុជ", en: "Assoch" }, { km: "កត្តិក", en: "Kadeuk" },
  { km: "បឋមាសាឍ", en: "First Asadh" }, { km: "ទុតិយាសាឍ", en: "Second Asadh" },
];

export const KHMER_ANIMALS: Array<{ km: string; roman: string; en: string; slug: string }> = [
  { km: "ជូត", roman: "Chhut", en: "Rat", slug: "rat" }, { km: "ឆ្លូវ", roman: "Chlov", en: "Ox", slug: "ox" },
  { km: "ខាល", roman: "Khal", en: "Tiger", slug: "tiger" }, { km: "ថោះ", roman: "Thos", en: "Rabbit", slug: "rabbit" },
  { km: "រោង", roman: "Rong", en: "Dragon", slug: "dragon" }, { km: "ម្សាញ់", roman: "Masagn", en: "Snake", slug: "snake" },
  { km: "មមី", roman: "Momee", en: "Horse", slug: "horse" }, { km: "មមែ", roman: "Momae", en: "Goat", slug: "goat" },
  { km: "វក", roman: "Vok", en: "Monkey", slug: "monkey" }, { km: "រកា", roman: "Roka", en: "Rooster", slug: "rooster" },
  { km: "ច", roman: "Cho", en: "Dog", slug: "dog" }, { km: "កុរ", roman: "Kor", en: "Pig", slug: "pig" },
];

export const SAKS = ["សំរឹទ្ធិស័ក", "ឯកស័ក", "ទោស័ក", "ត្រីស័ក", "ចត្វាស័ក", "បញ្ចស័ក", "ឆស័ក", "សប្តស័ក", "អដ្ឋស័ក", "នព្វស័ក"];
export const SAK_ROMAN = ["Samrith sak", "Ek sak", "To sak", "Trei sak", "Chattva sak", "Pancha sak", "Chha sak", "Sapta sak", "Attha sak", "Nobpa sak"];

/**
 * The seven weekdays: ruling planet, colour and the New Year angel of that day
 * (km.wikipedia «ចូលឆ្នាំខ្មែរ», table attributed to the Buddhist Institute's
 * Khmer Customs Committee, 1960 — facts only, wording ours). Colours vary
 * between almanacs; the UI says so.
 */
export interface Weekday {
  index: number;
  km: string;
  en: string;
  planetKm: string;
  planetEn: string;
  colourKm: string;
  colourEn: string;
  swatch: string; // token name in app/styles/tokens.css
  quality: string;
  angel: { km: string; roman: string; flower: string; jewel: string; food: string; hands: string; mount: string };
}

export const WEEKDAYS: Weekday[] = [
  { index: 0, km: "អាទិត្យ", en: "Sunday", planetKm: "ព្រះអាទិត្យ", planetEn: "the Sun", colourKm: "ក្រហម", colourEn: "Red", swatch: "kh-sun", quality: "courage",
    angel: { km: "ទុង្សាទេវី", roman: "Tungsa Tevy", flower: "pomegranate flower", jewel: "ruby", food: "figs", hands: "a conch and a discus", mount: "a garuda" } },
  { index: 1, km: "ចន្ទ", en: "Monday", planetKm: "ព្រះចន្ទ", planetEn: "the Moon", colourKm: "លឿងទុំ", colourEn: "Ripe yellow", swatch: "kh-mon", quality: "cheerfulness",
    angel: { km: "គោរាគៈទេវី", roman: "Koreak Tevy", flower: "angkeabos flower", jewel: "pearl", food: "sesame oil", hands: "a walking staff and a sword", mount: "a tiger" } },
  { index: 2, km: "អង្គារ", en: "Tuesday", planetKm: "ព្រះអង្គារ", planetEn: "Mars", colourKm: "ស្វាយ", colourEn: "Purple", swatch: "kh-tue", quality: "self-confidence",
    angel: { km: "រាក្យៈសាទេវី", roman: "Reaksa Tevy", flower: "lotus", jewel: "coral", food: "blood", hands: "a bow and a trident", mount: "a horse" } },
  { index: 3, km: "ពុធ", en: "Wednesday", planetKm: "ព្រះពុធ", planetEn: "Mercury", colourKm: "ស៊ីលៀប", colourEn: "Olive green", swatch: "kh-wed", quality: "optimism",
    angel: { km: "មណ្ឌាទេវី", roman: "Mondea Tevy", flower: "champa", jewel: "cat's-eye", food: "ghee and milk", hands: "a staff and a needle", mount: "a donkey" } },
  { index: 4, km: "ព្រហស្បតិ៍", en: "Thursday", planetKm: "ព្រះព្រហស្បតិ៍", planetEn: "Jupiter", colourKm: "បៃតង", colourEn: "Green", swatch: "kh-thu", quality: "good judgement",
    angel: { km: "កិរិណីទេវី", roman: "Kirinei Tevy", flower: "mandara flower", jewel: "emerald", food: "beans and sesame", hands: "a vajra and an elephant hook", mount: "an elephant" } },
  { index: 5, km: "សុក្រ", en: "Friday", planetKm: "ព្រះសុក្រ", planetEn: "Venus", colourKm: "ខៀវ", colourEn: "Blue", swatch: "kh-fri", quality: "perseverance",
    angel: { km: "កិមិរាទេវី", roman: "Kimira Tevy", flower: "romchang flower", jewel: "topaz", food: "bananas", hands: "a lute and a sword", mount: "a water buffalo" } },
  { index: 6, km: "សៅរ៍", en: "Saturday", planetKm: "ព្រះសៅរ៍", planetEn: "Saturn", colourKm: "ព្រីងទុំ", colourEn: "Dark plum", swatch: "kh-sat", quality: "friendliness",
    angel: { km: "មហោទរាទេវី", roman: "Mohorea Tevy", flower: "trakiet flower", jewel: "sapphire", food: "venison", hands: "a trident and a discus", mount: "a peacock" } },
];

export interface KhmerDay {
  date: string;
  day: number;
  phase: "waxing" | "waning";
  phaseKm: string;
  monthIndex: number;
  month: { km: string; en: string };
  beYear: number;
  animal: (typeof KHMER_ANIMALS)[number];
  sakKm: string;
  sakRoman: string;
  weekday: Weekday;
  /** Buddhist holy day: 8 and 15 waxing, 8 waning and the last day of the month. */
  sila: boolean;
  festival: Festival | null;
  /** e.g. "ថ្ងៃអាទិត្យ ៨រោច ខែភទ្របទ ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០" */
  labelKm: string;
  /** e.g. "8th waning day of Phatrabot" */
  labelEn: string;
}

export interface Festival { id: string; km: string; en: string }

const ord = (n: number) => n + (["th", "st", "nd", "rd"][(n % 100 - 20) % 10] || ["th", "st", "nd", "rd"][n % 100] || "th");

function convert(y: number, m: number, d: number, hour = 12, minute = 0) {
  return kh.fromGregorian(y, m, d, hour, minute, 0).khmer;
}

function festivalFor(monthIndex: number, phase: number, day: number): Festival | null {
  const waxing = phase === 0;
  if (monthIndex === 2 && waxing && day === 15) return { id: "meak-bochea", km: "មាឃបូជា", en: "Meak Bochea" };
  if (monthIndex === 5 && waxing && day === 15) return { id: "visak-bochea", km: "វិសាខបូជា", en: "Visak Bochea" };
  if (monthIndex === 5 && !waxing && day === 4) return { id: "royal-ploughing", km: "ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល", en: "Royal Ploughing Ceremony" };
  if ((monthIndex === 7 || monthIndex === 13) && waxing && day === 15) return { id: "chol-vossa", km: "ចូលវស្សា", en: "Start of Buddhist Lent" };
  if (monthIndex === 9 && !waxing && day === 1) return { id: "dak-ben", km: "កាន់បិណ្ឌទី១", en: "First day of Kan Ben" };
  if (monthIndex === 9 && !waxing && day === 15) return { id: "pchum-ben", km: "ភ្ជុំបិណ្ឌ", en: "Pchum Ben" };
  if (monthIndex === 10 && waxing && day === 15) return { id: "chenh-vossa", km: "ចេញវស្សា", en: "End of Buddhist Lent" };
  if (monthIndex === 11 && waxing && (day === 14 || day === 15)) return { id: "water-festival", km: "បុណ្យអុំទូក", en: "Water Festival" };
  if (monthIndex === 11 && !waxing && day === 1) return { id: "water-festival", km: "បុណ្យអុំទូក", en: "Water Festival" };
  return null;
}

const addDaysYmd = (y: number, m: number, d: number, n: number) => {
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()] as const;
};

export function khmerDay(dateKey: string): KhmerDay {
  const [y, m, d] = dateKey.split("-").map(Number);
  const k = convert(y, m, d);
  const [ny, nm, nd] = addDaysYmd(y, m, d, 1);
  const next = convert(ny, nm, nd);
  const waxing = k.moonPhase === 0;
  const lastOfMonth = next.monthIndex !== k.monthIndex;
  const sila = (waxing && (k.day === 8 || k.day === 15)) || (!waxing && (k.day === 8 || lastOfMonth));
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const month = LUNAR_MONTHS[k.monthIndex];
  const animal = KHMER_ANIMALS[k.animalYear];
  const songkran = songkranFestivalDay(dateKey);
  return {
    date: dateKey,
    day: k.day,
    phase: waxing ? "waxing" : "waning",
    phaseKm: waxing ? "កើត" : "រោច",
    monthIndex: k.monthIndex,
    month,
    beYear: k.beYear,
    animal,
    sakKm: SAKS[k.sak],
    sakRoman: SAK_ROMAN[k.sak],
    weekday,
    sila,
    festival: songkran ?? festivalFor(k.monthIndex, k.moonPhase, k.day),
    labelKm: `ថ្ងៃ${weekday.km} ${toKhmerNum(k.day)}${waxing ? "កើត" : "រោច"} ខែ${month.km} ឆ្នាំ${animal.km} ${SAKS[k.sak]} ព.ស. ${toKhmerNum(k.beYear)}`,
    labelEn: `${ord(k.day)} ${waxing ? "waxing" : "waning"} day of ${month.en}`,
  };
}

/** Khmer animal year for a birth moment in Cambodian local time; it turns at the exact Moha Songkran moment. */
export function khmerAnimalAt(dateKey: string, time: string | null): (typeof KHMER_ANIMALS)[number] {
  const [y, m, d] = dateKey.split("-").map(Number);
  const [hh, mm] = (time ?? "12:00").split(":").map(Number);
  return KHMER_ANIMALS[convert(y, m, d, hh, mm).animalYear];
}

/* ---------- Moha Songkran ---------- */

export type Posture = { km: string; en: string };
const POSTURES: Array<[number, Posture]> = [
  [0, { km: "ផ្ទំបិទព្រះនេត្រ", en: "reclining with eyes closed" }],
  [6, { km: "ទ្រង់ឈរ", en: "standing" }],
  [12, { km: "ទ្រង់អង្គុយ", en: "sitting" }],
  [18, { km: "ផ្ទំបើកព្រះនេត្រ", en: "reclining with eyes open" }],
];

export interface Songkran {
  year: number;
  /** Cambodian local date and time of the Moha Songkran moment. */
  date: string;
  time: string;
  /** "calculated" from the traditional algorithm, or "official" when the owner entered the Ministry's announcement. */
  source: "calculated" | "official";
  weekday: Weekday;
  angel: Weekday["angel"];
  posture: Posture;
  days: Array<{ date: string; km: string; en: string }>;
  /** UTC instant of the moment, for countdowns. */
  instantIso: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function songkran(year: number, override?: { date: string; time: string } | null): Songkran {
  const ny = kh.getNewYear(year);
  const date = override?.date ?? `${ny.year}-${pad(ny.month)}-${pad(ny.day)}`;
  const time = override?.time ?? `${pad(ny.hour)}:${pad(ny.minute)}`;
  const [y, m, d] = date.split("-").map(Number);
  const hour = Number(time.slice(0, 2));
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const posture = [...POSTURES].reverse().find(([h]) => hour >= h)![1];

  // Leung Sak is the day the sak turns (at midnight); the festival runs from
  // Moha Songkran to Leung Sak, three or four days. Derived, not tabled.
  const sakAt = (yy: number, mm: number, dd: number) => convert(yy, mm, dd, 0, 30).sak;
  const startSak = sakAt(y, m, d);
  let length = 3;
  for (let i = 1; i <= 4; i++) {
    const [a, b, c] = addDaysYmd(y, m, d, i);
    if (sakAt(a, b, c) !== startSak) { length = i + 1; break; }
  }
  length = Math.max(3, Math.min(4, length));
  const days = Array.from({ length }, (_, i) => {
    const [a, b, c] = addDaysYmd(y, m, d, i);
    const key = `${a}-${pad(b)}-${pad(c)}`;
    if (i === 0) return { date: key, km: "មហាសង្ក្រាន្ត", en: "Moha Songkran" };
    if (i === length - 1) return { date: key, km: "វារៈឡើងស័ក", en: "Leung Sak" };
    return { date: key, km: "វារៈវ័នបត", en: "Vanabat" };
  });
  const instant = new Date(Date.UTC(y, m - 1, d, hour - 7, Number(time.slice(3, 5))));
  return {
    year,
    date,
    time,
    source: override ? "official" : "calculated",
    weekday,
    angel: weekday.angel,
    posture,
    days,
    instantIso: instant.toISOString(),
  };
}

const songkranCache = new Map<number, Songkran>();
function songkranFestivalDay(dateKey: string): Festival | null {
  const y = Number(dateKey.slice(0, 4));
  if (dateKey.slice(5, 7) !== "04") return null;
  let s = songkranCache.get(y);
  if (!s) { s = songkran(y); songkranCache.set(y, s); }
  const hit = s.days.find((d) => d.date === dateKey);
  return hit ? { id: "khmer-new-year", km: `ចូលឆ្នាំខ្មែរ · ${hit.km}`, en: `Khmer New Year · ${hit.en}` } : null;
}

/** Birth-weekday profile. Traditional Khmer days start at sunrise; with a birth time before 06:00 the previous weekday applies when `fromSunrise` is set. */
export function birthWeekday(dateKey: string, time: string | null, fromSunrise = false): { weekday: Weekday; shifted: boolean } {
  const [y, m, d] = dateKey.split("-").map(Number);
  let dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const shifted = fromSunrise && !!time && Number(time.slice(0, 2)) < 6;
  if (shifted) dow = (dow + 6) % 7;
  return { weekday: WEEKDAYS[dow], shifted };
}
