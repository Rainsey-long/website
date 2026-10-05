/**
 * English and Khmer (BUILD_PLAN Phase 7.1), CamboMath's URL-addressable pattern.
 *
 * `/km/anything` is REWRITTEN by proxy.ts to `/anything` with the language in a
 * request header (LANG_HEADER). The same page component serves both languages,
 * Khmer gets real server-rendered URLs that search engines can index, and the
 * two versions point at each other with hreflang (lib/seo.ts). A rewrite, not a
 * redirect: a redirect would collapse /km/x back onto the English URL.
 *
 * English lives at the root and is never redirected by browser language (the
 * English URLs stay stable for search). A visitor who chooses Khmer gets the
 * LANG_COOKIE, and proxy.ts sends their unprefixed page loads to the /km twin.
 *
 * Strings: each file keeps its own `defineMessages({ en: {...}, km: {...} })`
 * next to where they are used. The type makes every English key require a
 * Khmer twin, so a missing translation is a type error, not a blank on screen.
 * Every Khmer string is a draft until a native reader approves it
 * (docs/KHMER-REVIEW.md).
 *
 * Directive-free: proxy.ts, server pages and client components all import it.
 */

export type Lang = "en" | "km";
export const LANGS: Lang[] = ["en", "km"];
export const LOCALE_PREFIX = "/km";
export const LANG_COOKIE = "lang";
export const LANG_HEADER = "x-al-lang";
/** BCP 47 tags for <html lang>, hreflang and Open Graph. */
export const LANG_TAG: Record<Lang, string> = { en: "en", km: "km" };
export const OG_LOCALE: Record<Lang, string> = { en: "en_GB", km: "km_KH" };
export const LANG_NAME: Record<Lang, string> = { en: "English", km: "ខ្មែរ" };

export const isLang = (v: string | null | undefined): v is Lang => v === "en" || v === "km";

/** Paths that have no Khmer twin and are never prefixed (.ics feeds take ?lang=km). */
// The admin has a Khmer twin too (/km/admin); API routes take ?lang= instead (lib/http.ts requestLang).
const UNLOCALISED = /^\/(api|og|_next)(\/|$)|^\/feeds\/.+\.ics$|^\/(robots\.txt|sitemap\.xml|favicon\.svg|ads\.txt|sw\.js|manifest\.webmanifest)$/;

export function isLocalisable(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !UNLOCALISED.test(path);
}

/** "/km/sky" → { lang: "km", path: "/sky" }; "/sky" → { lang: "en", path: "/sky" }. */
export function stripLocale(path: string): { lang: Lang; path: string } {
  if (path === LOCALE_PREFIX) return { lang: "km", path: "/" };
  if (path.startsWith(LOCALE_PREFIX + "/")) return { lang: "km", path: path.slice(LOCALE_PREFIX.length) };
  return { lang: "en", path };
}

/** The URL of `path` in `lang`. Leaves external, hash-only and unlocalised paths alone. */
export function localePath(path: string, lang: Lang): string {
  if (lang === "en" || !isLocalisable(path)) return path;
  const clean = stripLocale(path).path;
  return clean === "/" ? LOCALE_PREFIX : LOCALE_PREFIX + clean;
}

type Shape<T> = { [K in keyof T]: T[K] extends string ? string : T[K] extends (...args: infer A) => string ? (...args: A) => string : Shape<T[K]> };

/** Co-located bilingual strings; `km` must have exactly the shape of `en`. */
export function defineMessages<T extends Record<string, unknown>>(m: { en: T; km: Shape<T> }): Record<Lang, T> {
  return m as Record<Lang, T>;
}

const KHMER_DIGITS = "០១២៣៤៥៦៧៨៩";
/** Western digits to Khmer digits, leaving everything else alone. */
export function khmerDigits(s: string | number): string {
  return String(s).replace(/[0-9]/g, (d) => KHMER_DIGITS[Number(d)]);
}
/** Digits in the reader's script: Khmer numerals on Khmer pages (as Khmer print does). */
export function num(n: string | number, lang: Lang): string {
  return lang === "km" ? khmerDigits(n) : String(n);
}

/** Pick a field by language from an object that carries both, e.g. { en, km }. */
export function pick<T>(v: { en: T; km?: T | null }, lang: Lang): T {
  return lang === "km" && v.km != null && v.km !== "" ? v.km : v.en;
}
