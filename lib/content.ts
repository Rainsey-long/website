/**
 * Server-only loader for long-form Markdown (profiles, yearly forecasts).
 *
 * Sources, in order: an owner edit saved in the admin (content_overrides, per
 * language), then the repository file. Khmer lives at content/km/<same path>;
 * when no Khmer version exists the English one is served and `translated` is
 * false, so the page can say the text is in English for now.
 *
 * Because owner-edited Markdown now reaches public pages, the renderer is
 * locked down: raw HTML in the Markdown is shown as text, never parsed, and
 * links may only point at http(s), mailto or site-relative URLs. Missing
 * files return null so a page still renders.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Marked } from "marked";

// gray-matter runs the executable "javascript"/"coffee" front-matter engines on
// a `---js` (etc.) delimiter, which is arbitrary code execution from
// owner-edited Markdown. Force YAML only: every code-running engine throws, so
// a non-YAML front-matter block is rejected, never evaluated. (Object.assign in
// gray-matter's defaults MERGES these over the built-ins, so they must be named
// explicitly — passing only `{yaml}` leaves the javascript engine live.)
const rejectEngine = () => {
  throw new Error("Only YAML front matter is allowed.");
};
export const GM_YAML_ONLY = {
  engines: { javascript: rejectEngine, js: rejectEngine, coffee: rejectEngine, coffeescript: rejectEngine, cson: rejectEngine },
} as const;
import { getDb } from "./db";
import { SIGNS } from "./western";
import { ANIMALS } from "./chinese";
import type { Lang } from "./i18n";

export interface Faq { q: string; a: string }
export interface WesternProfileFm { name: string; slug: string; summary: string; traits: string[]; luckyDay?: string; luckyColours?: string[]; luckyNumbers?: number[]; faq?: Faq[] }
export interface AnimalProfileFm { name: string; slug: string; summary: string; traits: string[]; bestMatches?: string[]; challengingMatches?: string[]; faq?: Faq[] }
export interface YearlyFm { animal: string; title: string; summary: string; relation: string; outlook: number; months: Array<{ label: string; text: string }> }
export type Loaded<T> = { fm: T; html: string; translated: boolean };

const ROOT = path.join(process.cwd(), "content");

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// "/\\x" is excluded too: browsers read a leading /\ as //, i.e. another site.
const SAFE_HREF = /^(https?:\/\/|mailto:|\/(?![/\\])|#)/i;
const md = new Marked({
  renderer: {
    html({ text }) { return escapeHtml(text); },
    link({ href, title, tokens }) {
      const label = this.parser.parseInline(tokens);
      if (!SAFE_HREF.test(href)) return label;
      return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ""}>${label}</a>`;
    },
    image({ text }) { return escapeHtml(text); },
  },
});

/** Every editable Markdown path, relative to content/ (also the admin's whitelist). */
export const CONTENT_PATHS: string[] = [
  ...SIGNS.map((s) => `profiles/western/${s.slug}.md`),
  ...ANIMALS.map((a) => `profiles/chinese/${a.slug}.md`),
  ...ANIMALS.map((a) => `yearly/2027/${a.slug}.md`),
];
const KNOWN = new Set(CONTENT_PATHS);
export const isContentPath = (p: string) => KNOWN.has(p);

/** The repository text for a path and language, or null. */
export function repoSource(rel: string, lang: Lang): string | null {
  if (!KNOWN.has(rel)) return null;
  const file = path.join(ROOT, lang === "km" ? "km" : "", rel);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}

/** The owner's saved edit, or null. A database error falls back to the repository text. */
function overrideSource(rel: string, lang: Lang): string | null {
  try {
    const row = getDb().prepare("SELECT source FROM content_overrides WHERE path = ? AND lang = ?").get(rel, lang) as { source: string } | undefined;
    return row?.source ?? null;
  } catch (err) {
    console.error("[content] override read failed, using repository text", err);
    return null;
  }
}

export function parseSource<T>(source: string): { fm: T; html: string } {
  const { data, content } = matter(source, GM_YAML_ONLY);
  return { fm: data as T, html: md.parse(content, { async: false }) as string };
}

// Parsed results, on globalThis so the admin API and the pages share one memo
// (Next bundles routes separately); cleared whenever the admin saves.
const store = globalThis as unknown as { __alContent?: Map<string, { fm: unknown; html: string } | null> };
const cache = (store.__alContent ??= new Map());
export function invalidateContent(): void {
  cache.clear();
}

function load<T>(rel: string, lang: Lang): { fm: T; html: string } | null {
  const key = `${lang}:${rel}`;
  if (cache.has(key)) return cache.get(key) as { fm: T; html: string } | null;
  const source = overrideSource(rel, lang) ?? repoSource(rel, lang);
  const out = source ? parseSource<T>(source) : null;
  cache.set(key, out);
  return out;
}

function localised<T>(rel: string, lang: Lang): Loaded<T> | null {
  if (lang === "km") {
    const km = load<T>(rel, "km");
    if (km) return { ...km, translated: true };
  }
  const en = load<T>(rel, "en");
  return en ? { ...en, translated: lang === "en" } : null;
}

const SLUG = /^[a-z]+$/;
export const westernProfile = (slug: string, lang: Lang = "en") => (SLUG.test(slug) ? localised<WesternProfileFm>(`profiles/western/${slug}.md`, lang) : null);
export const animalProfile = (slug: string, lang: Lang = "en") => (SLUG.test(slug) ? localised<AnimalProfileFm>(`profiles/chinese/${slug}.md`, lang) : null);
export const yearlyForecast = (slug: string, lang: Lang = "en") => (SLUG.test(slug) ? localised<YearlyFm>(`yearly/2027/${slug}.md`, lang) : null);
