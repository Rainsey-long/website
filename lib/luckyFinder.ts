/**
 * Lucky-date finder by occasion (docs/research/FEATURES.md #9), from the
 * Chinese almanac only. A day qualifies when the almanac lists the occasion as
 * favourable (宜), does not also list it to avoid (忌), the day is not one the
 * site calls "challenging", and it does not clash with any animal the visitor
 * chose. Presented as cultural tradition, never as a guarantee.
 *
 * Owner rule: Khmer good-day picking (wedding, house moving) is NOT built; that
 * is left to an achar (docs/research/KHMER-TRADITIONS.md §9). This is the
 * Chinese tong shu's own published list, which the lucky-days calendar already
 * shows day by day.
 */
import { almanacDay, translateTerms, type AlmanacDay } from "./almanac";
import { addDays } from "./dates";

export interface Occasion {
  slug: string;
  label: string;
  /** Almanac terms any one of which marks the day favourable. */
  terms: string[];
}

export const OCCASIONS: Occasion[] = [
  { slug: "moving", label: "Moving house", terms: ["移徙", "入宅"] },
  { slug: "wedding", label: "A wedding", terms: ["嫁娶"] },
  { slug: "engagement", label: "An engagement", terms: ["纳采", "订盟"] },
  { slug: "opening", label: "Opening a business", terms: ["开市", "挂匾"] },
  { slug: "contract", label: "Signing a contract", terms: ["立券", "交易"] },
  { slug: "travel", label: "Travel", terms: ["出行"] },
  { slug: "renovation", label: "Building or renovation", terms: ["修造", "动土"] },
  { slug: "school", label: "Starting school or a course", terms: ["入学", "习艺"] },
];

export const MAX_FINDER_DAYS = 186;

export interface FinderResult {
  day: AlmanacDay;
  /** The occasion terms the almanac listed, translated. */
  matched: string[];
}

export function findLuckyDays(opts: { occasion: Occasion; from: string; days: number; avoidAnimals: string[] }): FinderResult[] {
  const days = Math.max(1, Math.min(MAX_FINDER_DAYS, opts.days));
  const out: FinderResult[] = [];
  for (let i = 0; i < days; i++) {
    const day = almanacDay(addDays(opts.from, i));
    const hits = opts.occasion.terms.filter((t) => day.goodRaw.includes(t) && !day.avoidRaw.includes(t));
    if (!hits.length || day.quality === "challenging" || opts.avoidAnimals.includes(day.clash.slug)) continue;
    out.push({ day, matched: translateTerms(hits) });
  }
  return out;
}
