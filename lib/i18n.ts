/**
 * The site is English only (owner decision, 2026-10-05). Khmer TRADITIONS stay,
 * written in English with Khmer terms shown inline (`<span lang="km">`); the
 * Khmer LANGUAGE version of the site was removed, and every old /km URL
 * permanently redirects to its English page (proxy.ts).
 *
 * What remains here is the thin scaffolding pages already use: one `Lang`,
 * `defineMessages({ en })` for co-located strings, and `localePath`, which now
 * returns the path unchanged. Directive-free: proxy, server and client import it.
 */

export type Lang = "en";
export const LANGS: Lang[] = ["en"];
/** The old Khmer URL prefix, kept only so proxy.ts can redirect it. */
export const LOCALE_PREFIX = "/km";
/** BCP 47 tag for <html lang> and Open Graph. */
export const LANG_TAG: Record<Lang, string> = { en: "en" };
export const OG_LOCALE: Record<Lang, string> = { en: "en_GB" };

export const isLang = (v: string | null | undefined): v is Lang => v === "en";

/** "/km/sky" → "/sky", "/km" → "/"; anything else unchanged. */
export function stripLocale(path: string): { lang: Lang; path: string; wasKhmer: boolean } {
  if (path === LOCALE_PREFIX) return { lang: "en", path: "/", wasKhmer: true };
  if (path.startsWith(LOCALE_PREFIX + "/")) return { lang: "en", path: path.slice(LOCALE_PREFIX.length), wasKhmer: true };
  return { lang: "en", path, wasKhmer: false };
}

/** Kept for existing call sites: there is one language, so a path is its own URL. */
export function localePath(path: string, _lang?: Lang): string {
  return path;
}

/** Co-located strings, `T[lang]` at the call site. */
export function defineMessages<T extends Record<string, unknown>>(m: { en: T }): Record<Lang, T> {
  return m;
}

const KHMER_DIGITS = "០១២៣៤៥៦៧៨៩";
/** Western digits to Khmer digits, for Khmer-script tradition labels shown inline. */
export function khmerDigits(s: string | number): string {
  return String(s).replace(/[0-9]/g, (d) => KHMER_DIGITS[Number(d)]);
}
/** Kept for existing call sites: numbers are written with Western digits. */
export function num(n: string | number, _lang?: Lang): string {
  return String(n);
}
