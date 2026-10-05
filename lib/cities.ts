/** The bundled city list (lib/data/cities.json) with stable URL slugs. */
import data from "./data/cities.json";
import type { City } from "./zone";
import type { Lang } from "./i18n";
import { citySlug } from "./people";

export interface CityEntry extends City {
  slug: string;
}

export const CITIES: CityEntry[] = (data as City[]).map((c) => ({ ...c, slug: citySlug(c.name, c.country) }));
const BY_SLUG = new Map(CITIES.map((c) => [c.slug, c]));

export function cityBySlug(slug: string | undefined): CityEntry | undefined {
  return slug ? BY_SLUG.get(slug) : undefined;
}

/** A sensible default for a visitor: the first listed city in their zone, else Phnom Penh. */
export function cityForZone(tz: string): CityEntry {
  return CITIES.find((c) => c.tz === tz) ?? CITIES[0];
}

// `...[]: [lang?: Lang]` keeps the old language argument for existing callers and ignores it (English only since 2026-10-05).
/** "Phnom Penh, Cambodia". */
export function cityLabel(c: City, ...[]: [lang?: Lang]): string {
  return `${c.name}, ${c.country}`;
}
export const cityName = (c: City, ...[]: [lang?: Lang]) => c.name;
