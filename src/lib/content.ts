/**
 * Loads Markdown long-form content (profiles, yearly forecasts) at build time.
 * Missing files degrade to null so a page can still render a short fallback.
 */
import type { MarkdownInstance } from "astro";

export interface Faq { q: string; a: string }
export interface WesternProfileFm { name: string; slug: string; summary: string; traits: string[]; luckyDay?: string; luckyColours?: string[]; luckyNumbers?: number[]; faq?: Faq[] }
export interface AnimalProfileFm { name: string; slug: string; summary: string; traits: string[]; bestMatches?: string[]; challengingMatches?: string[]; faq?: Faq[] }
export interface YearlyFm { animal: string; title: string; summary: string; relation: string; outlook: number; months: Array<{ label: string; text: string }> }

const western = import.meta.glob<MarkdownInstance<WesternProfileFm>>("../../content/profiles/western/*.md", { eager: true });
const chinese = import.meta.glob<MarkdownInstance<AnimalProfileFm>>("../../content/profiles/chinese/*.md", { eager: true });
const yearly = import.meta.glob<MarkdownInstance<YearlyFm>>("../../content/yearly/2027/*.md", { eager: true });

const bySlug = <T>(mods: Record<string, T>, slug: string): T | null =>
  Object.entries(mods).find(([path]) => path.endsWith(`/${slug}.md`))?.[1] ?? null;

export const westernProfile = (slug: string) => bySlug(western, slug);
export const animalProfile = (slug: string) => bySlug(chinese, slug);
export const yearlyForecast = (slug: string) => bySlug(yearly, slug);

/** FAQPage structured data from frontmatter (plan §9). */
export function faqLd(faq: Faq[] | undefined): object[] {
  if (!faq?.length) return [];
  return [{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }];
}

export function articleLd(opts: { headline: string; description: string; url: string; date?: string }): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    mainEntityOfPage: opts.url,
    ...(opts.date ? { datePublished: opts.date, dateModified: opts.date } : {}),
  };
}
