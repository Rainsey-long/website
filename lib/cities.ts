/** The bundled city list (lib/data/cities.json) with stable URL slugs. */
import data from "./data/cities.json";
import type { City } from "./zone";
import type { Lang } from "./i18n";

export interface CityEntry extends City {
  slug: string;
}

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const CITIES: CityEntry[] = (data as City[]).map((c) => ({ ...c, slug: slugify(`${c.name}-${c.country}`) }));
const BY_SLUG = new Map(CITIES.map((c) => [c.slug, c]));

export function cityBySlug(slug: string | undefined): CityEntry | undefined {
  return slug ? BY_SLUG.get(slug) : undefined;
}

/** A sensible default for a visitor: the first listed city in their zone, else Phnom Penh. */
export function cityForZone(tz: string): CityEntry {
  return CITIES.find((c) => c.tz === tz) ?? CITIES[0];
}

// Khmer names for the Cambodian cities (other cities keep their international
// names on Khmer pages, as Khmer media usually does).
const KM_CITY: Record<string, string> = {
  "Phnom Penh": "ភ្នំពេញ", "Siem Reap": "សៀមរាប", Battambang: "បាត់ដំបង", Sihanoukville: "ព្រះសីហនុ", Kampot: "កំពត",
};
/** "Phnom Penh, Cambodia" / "ភ្នំពេញ កម្ពុជា". */
export function cityLabel(c: City, lang: Lang): string {
  if (lang === "km" && c.country === "Cambodia") return `${KM_CITY[c.name] ?? c.name} កម្ពុជា`;
  return `${c.name}, ${c.country}`;
}
export const cityName = (c: City, lang: Lang) => (lang === "km" ? KM_CITY[c.name] ?? c.name : c.name);
