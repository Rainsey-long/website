/** The bundled city list (lib/data/cities.json) with stable URL slugs. */
import data from "./data/cities.json";
import type { City } from "./zone";

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
