/**
 * Server-only loader for long-form Markdown (profiles, yearly forecasts).
 * Content is authored in this repository and reviewed in code review; it is
 * never user- or admin-supplied, which is why rendering it as HTML is safe
 * (.claude/security.md). Missing files return null so a page still renders.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export interface Faq { q: string; a: string }
export interface WesternProfileFm { name: string; slug: string; summary: string; traits: string[]; luckyDay?: string; luckyColours?: string[]; luckyNumbers?: number[]; faq?: Faq[] }
export interface AnimalProfileFm { name: string; slug: string; summary: string; traits: string[]; bestMatches?: string[]; challengingMatches?: string[]; faq?: Faq[] }
export interface YearlyFm { animal: string; title: string; summary: string; relation: string; outlook: number; months: Array<{ label: string; text: string }> }

const ROOT = path.join(process.cwd(), "content");
const cache = new Map<string, { fm: unknown; html: string } | null>();

function load<T>(rel: string): { fm: T; html: string } | null {
  if (cache.has(rel)) return cache.get(rel) as { fm: T; html: string } | null;
  const file = path.join(ROOT, rel);
  let out: { fm: T; html: string } | null = null;
  if (fs.existsSync(file)) {
    const { data, content } = matter(fs.readFileSync(file, "utf8"));
    out = { fm: data as T, html: marked.parse(content, { async: false }) as string };
  }
  cache.set(rel, out);
  return out;
}

const SLUG = /^[a-z]+$/;
export const westernProfile = (slug: string) => (SLUG.test(slug) ? load<WesternProfileFm>(`profiles/western/${slug}.md`) : null);
export const animalProfile = (slug: string) => (SLUG.test(slug) ? load<AnimalProfileFm>(`profiles/chinese/${slug}.md`) : null);
export const yearlyForecast = (slug: string) => (SLUG.test(slug) ? load<YearlyFm>(`yearly/2027/${slug}.md`) : null);
