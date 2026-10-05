/** Metadata for the weekly horoscope pages (shared by both routes). */
import { addDays, weekRange } from "./dates";
import { defineMessages, type Lang } from "./i18n";
import { signName } from "./names";
import { pageMetadata } from "./seo";
import { CALENDAR_YEARS, DEFAULT_TZ } from "./site";
import { dateInZone } from "./today";
import { mondayOf, isMonday } from "./weekly";
import type { WesternSign } from "./western";

const T = defineMessages({
  en: {
    title: (s: string, r: string) => `${s} weekly horoscope, ${r}`,
    desc: (s: string, r: string) => `${s} weekly horoscope for ${r}: the week's Moon, your best days for love, work, money and mood, and what the planets are doing.`,
  },
});

/** A Monday whose whole week lies in the supported range. */
export function validWeek(monday: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(monday) || addDays(monday, 0) !== monday || !isMonday(monday)) return false;
  return Number(monday.slice(0, 4)) >= CALENDAR_YEARS.min && Number(addDays(monday, 6).slice(0, 4)) <= CALENDAR_YEARS.max;
}

/** Indexed: the last eight weeks and the next one. Older and later weeks render but stay out of search. */
function inWindow(monday: string): boolean {
  const now = mondayOf(dateInZone(DEFAULT_TZ));
  return monday >= addDays(now, -56) && monday <= addDays(now, 7);
}

export function weeklyMetadata(sign: WesternSign, monday: string, lang: Lang, path: string) {
  const name = signName(sign.slug, lang);
  const range = weekRange(monday, lang);
  return pageMetadata({
    lang, path, type: "article", ogImage: `/og/${sign.slug}`,
    title: T[lang].title(name, range), description: T[lang].desc(name, range),
    noindex: !inWindow(monday),
  });
}
