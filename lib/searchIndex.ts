/**
 * Site search (FEATURES.md #49). A static index over the site's pages, built
 * once per process from the same name tables the pages use (lib/names.ts,
 * lib/khmer.ts), in English and Khmer. No database, no network, no runtime AI.
 *
 * Matching: both the query and every entry are normalised the same way —
 * lower-cased, Latin diacritics removed (NFD, then the combining-mark block
 * U+0300–U+036F only; Khmer vowel signs are combining marks too, so a general
 * \p{M} strip would destroy Khmer words), zero-width spaces removed. Every
 * query word must appear somewhere in the entry. A Latin word must start a
 * word ("rat" finds Rat, not "chrat"); a Khmer word may match anywhere, since
 * Khmer is written without spaces between words.
 */
import { SIGNS } from "./western";
import { ANIMALS } from "./chinese";
import { KHMER_ANIMALS, WEEKDAYS } from "./khmer";
import { animalName, signName } from "./names";
import type { Lang } from "./i18n";

export type SearchKind = "sign" | "animal" | "compatibility" | "khmer" | "festival" | "tool" | "sky" | "page";

export interface SearchEntry {
  href: string;
  kind: SearchKind;
  title: Record<Lang, string>;
  /** Extra words that should find the page but are not shown. */
  keywords?: string;
  /** Ranks a sign's or animal's main page above its other pages. */
  boost?: number;
}

export const MAX_QUERY = 80;
const MAX_RESULTS = 40;

const e = (href: string, kind: SearchKind, en: string, km: string, keywords = ""): SearchEntry => ({ href, kind, title: { en, km }, keywords });

/** Festivals from lib/khmer.ts festivalFor(); their calendar lives on /khmer. */
const FESTIVALS: Array<[string, string, string]> = [
  ["Meak Bochea", "មាឃបូជា", "magha puja buddhist holiday"],
  ["Visak Bochea", "វិសាខបូជា", "vesak visakha puja buddha day"],
  ["Royal Ploughing Ceremony", "ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល", "plowing preah reach pithi chrat preah neangkol"],
  ["Start of Buddhist Lent", "ចូលវស្សា", "chol vossa vassa rains retreat"],
  ["First day of Kan Ben", "កាន់បិណ្ឌទី១", "dak ben kan ben ancestors"],
  ["Pchum Ben", "ភ្ជុំបិណ្ឌ", "ancestors day festival of the dead"],
  ["End of Buddhist Lent", "ចេញវស្សា", "chenh vossa"],
  ["Water Festival", "បុណ្យអុំទូក", "bon om touk boat races"],
];

function build(): SearchEntry[] {
  const out: SearchEntry[] = [
    e("/horoscope", "sign", "Daily horoscopes", "ហោរាសាស្ត្រប្រចាំថ្ងៃ", "today astrology zodiac signs daily"),
    e("/zodiac", "sign", "The twelve zodiac signs", "រាសីទាំងដប់ពីរ", "western astrology signs traits"),
    e("/chinese-zodiac", "animal", "Chinese zodiac", "ឆ្នាំចិន", "chinese horoscope animals year"),
    e("/chinese-zodiac/2027", "animal", "2027: Year of the Fire Goat", "ឆ្នាំ២០២៧៖ ឆ្នាំមមែភ្លើង", "2027 forecast fire goat sheep"),
    e("/compatibility", "compatibility", "Zodiac compatibility", "ភាពត្រូវគ្នានៃរាសី", "love match pairs"),
    e("/chinese-compatibility", "compatibility", "Chinese zodiac compatibility", "ភាពត្រូវគ្នានៃឆ្នាំចិន", "love match animals pairs"),
    e("/tools/compatibility-checker", "compatibility", "Compatibility checker", "ឧបករណ៍ពិនិត្យភាពត្រូវគ្នា", "love match tool"),
    { ...e("/khmer", "khmer", "Khmer calendar and traditions", "ប្រតិទិនខ្មែរ និងប្រពៃណី", "khmer lunar calendar holy days sila cambodia buddhist"), boost: 3 },
    e("/khmer/new-year", "khmer", "Khmer New Year (Moha Songkran)", "បុណ្យចូលឆ្នាំខ្មែរ (មហាសង្ក្រាន្ត)", "songkran chaul chnam thmey new year angel tevy"),
    e("/khmer/colours", "khmer", "Colour of the day", "ពណ៌ប្រចាំថ្ងៃ", "color clothes wear weekday colour"),
    e("/southeast-asian-zodiac", "khmer", "Southeast Asian zodiac", "ឆ្នាំអាស៊ីអាគ្នេយ៍", "khmer vietnamese thai zodiac cat buffalo"),
    e("/southeast-asian-zodiac/khmer", "khmer", "Khmer zodiac", "ឆ្នាំខ្មែរ", "khmer animals sak"),
    e("/southeast-asian-zodiac/vietnamese", "khmer", "Vietnamese zodiac", "ឆ្នាំវៀតណាម", "vietnamese tet cat"),
    e("/tools/zodiac-calculator", "tool", "Zodiac sign calculator", "ឧបករណ៍ស្វែងរករាសី", "find my sign rising moon sign birthday"),
    e("/tools/birth-chart", "tool", "Birth chart", "ផែនទីកំណើត", "natal chart planets houses"),
    e("/tools/date-converter", "tool", "Date converter", "ឧបករណ៍បម្លែងកាលបរិច្ឆេទ", "lunar khmer chinese calendar convert age"),
    e("/lucky-days", "tool", "Lucky days calendar", "ប្រតិទិនថ្ងៃល្អ", "almanac tong shu good days"),
    e("/lucky-days/finder", "tool", "Lucky date finder", "ឧបករណ៍ស្វែងរកថ្ងៃល្អ", "lucky dates finder"),
    e("/good-hours", "tool", "Good hours", "ម៉ោងល្អ", "lucky hours planetary hours chinese hours"),
    e("/sky", "sky", "Today's sky", "មេឃថ្ងៃនេះ", "planets moon phase astronomy"),
    e("/sky/moon", "sky", "Moon calendar", "ប្រតិទិនព្រះចន្ទ", "moon phases full moon new moon"),
    e("/sky/retrogrades", "sky", "Retrogrades", "ភពដើរថយក្រោយ", "mercury retrograde shadow station eclipses"),
    e("/feeds", "sky", "Calendar feeds", "ប្រតិទិនសម្រាប់ទូរស័ព្ទ", "ics subscribe calendar google apple"),
    e("/about", "page", "About", "អំពីយើង", ""),
    e("/contact", "page", "Contact", "ទំនាក់ទំនង", "email"),
    e("/privacy", "page", "Privacy", "ឯកជនភាព", "cookies data"),
    e("/terms", "page", "Terms", "លក្ខខណ្ឌ", ""),
    e("/disclaimer", "page", "Disclaimer", "សេចក្ដីប្រកាសបដិសេធ", ""),
  ];
  for (const s of SIGNS) {
    const en = signName(s.slug, "en");
    const km = signName(s.slug, "km");
    out.push(
      { ...e(`/horoscope/${s.slug}`, "sign", `${en} horoscope today`, `ហោរាសាស្ត្រ${km}ថ្ងៃនេះ`, `${en} ${km} daily`), boost: 3 },
      e(`/horoscope/${s.slug}/week`, "sign", `${en} weekly horoscope`, `ហោរាសាស្ត្រ${km}ប្រចាំសប្តាហ៍`, `${en} ${km} week`),
      e(`/zodiac/${s.slug}`, "sign", `${en}: traits and profile`, `រាសី${km}៖ លក្ខណៈ`, `${en} ${km} personality profile`),
    );
  }
  for (const a of ANIMALS) {
    const en = animalName(a.slug, "en");
    const km = animalName(a.slug, "km");
    const kh = KHMER_ANIMALS.find((k) => k.slug === a.slug);
    const extra = kh ? `${kh.km} ${kh.roman}` : "";
    out.push(
      { ...e(`/chinese-zodiac/${a.slug}`, "animal", `Year of the ${en}`, `ឆ្នាំ${km}`, `${en} ${km} ${extra} chinese zodiac`), boost: 3 },
      e(`/chinese-zodiac/${a.slug}/2027`, "animal", `${en} in 2027`, `ឆ្នាំ${km} ក្នុងឆ្នាំ២០២៧`, `${en} ${km} 2027 forecast`),
    );
  }
  for (const w of WEEKDAYS) {
    out.push(e(`/khmer/born-on/${w.en.toLowerCase()}`, "khmer", `Born on a ${w.en}`, `កើតថ្ងៃ${w.km}`, `${w.en} ${w.km} ${w.colourEn} ${w.colourKm} birth weekday`));
  }
  for (const [en, km, kw] of FESTIVALS) out.push(e("/khmer", "festival", en, km, kw));
  return out;
}

/** Normalise for matching (see the header). Exported for the tests. */
export function normalise(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[​‌‍]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

type Indexed = SearchEntry & { hay: string; titles: string };
const store = globalThis as unknown as { __alSearchIndex?: Indexed[] };

function index(): Indexed[] {
  if (!store.__alSearchIndex) {
    store.__alSearchIndex = build().map((x) => {
      const titles = normalise(`${x.title.en} ${x.title.km}`);
      return { ...x, titles, hay: `${titles} ${normalise(x.keywords ?? "")} ${x.kind === "festival" ? "" : normalise(x.href.replace(/[/-]/g, " "))}` };
    });
  }
  return store.__alSearchIndex;
}

/** Results for a query: every word must match; title matches rank first. */
export function search(query: string): SearchEntry[] {
  const q = normalise(query.slice(0, MAX_QUERY));
  if (!q) return [];
  const words = q.split(" ").filter(Boolean);
  const has = (hay: string, w: string) => (/[a-z0-9]/.test(w) ? hay.startsWith(w) || hay.includes(" " + w) : hay.includes(w));
  const scored: Array<{ x: Indexed; score: number; i: number }> = [];
  index().forEach((x, i) => {
    if (!words.every((w) => has(x.hay, w))) return;
    let score = x.boost ?? 0;
    if (x.titles.includes(q)) score += 4;
    for (const w of words) if (has(x.titles, w)) score += 1;
    if (x.titles.startsWith(q)) score += 2;
    scored.push({ x, score, i });
  });
  // Ties: the shorter title is the closer match ("Year of the Rat" before "Rat in 2027").
  scored.sort((a, b) => b.score - a.score || a.x.titles.length - b.x.titles.length || a.i - b.i);
  // Several festivals share /khmer; keep one result per page.
  const seen = new Set<string>();
  const out: SearchEntry[] = [];
  for (const { x } of scored) {
    if (seen.has(x.href) && x.kind !== "festival") continue;
    seen.add(x.href);
    out.push({ href: x.href, kind: x.kind, title: x.title });
    if (out.length >= MAX_RESULTS) break;
  }
  return out;
}

/** Shown when there is no query or nothing matched. */
export const SUGGESTIONS = ["/horoscope", "/chinese-zodiac", "/khmer/new-year", "/tools/zodiac-calculator", "/lucky-days", "/sky/moon"];
export const entryFor = (href: string): SearchEntry | undefined => index().find((x) => x.href === href);
