/**
 * Page metadata in one place (CamboMath lib/seo.ts pattern): every page calls
 * pageMetadata() so it gets a unique title, description, canonical, Open Graph
 * and Twitter card (build plan §9).
 */
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./site";
import { localePath, OG_LOCALE, type Lang } from "./i18n";

export function absolute(path: string): string {
  return new URL(path, SITE_URL).href;
}

/**
 * `path` is the English (unprefixed) path; with `lang: "km"` the canonical is
 * the /km twin. Both versions always list each other plus x-default (English)
 * as hreflang alternates, as Google asks of language versions.
 */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  lang?: Lang;
  ogImage?: string;
  type?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  const lang = opts.lang ?? "en";
  // Khmer pages share the Khmer card (app/og, ?lang=km).
  const image = absolute((opts.ogImage ?? "/og/default") + (lang === "km" ? "?lang=km" : ""));
  const url = absolute(localePath(opts.path, lang));
  return {
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical: url,
      languages: { en: absolute(opts.path), km: absolute(localePath(opts.path, "km")), "x-default": absolute(opts.path) },
    },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALE[lang],
      alternateLocale: [OG_LOCALE[lang === "en" ? "km" : "en"]],
      type: opts.type ?? "website",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, images: [image] },
  };
}

export function breadcrumbLd(items: Array<{ name: string; href: string }>, lang: Lang = "en"): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: lang === "km" ? "ទំព័រដើម" : "Home", href: "/" }, ...items].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absolute(localePath(c.href, lang)),
    })),
  };
}

export function articleLd(opts: { headline: string; description: string; path: string; date?: string; lang?: Lang }): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    inLanguage: opts.lang ?? "en",
    mainEntityOfPage: absolute(localePath(opts.path, opts.lang ?? "en")),
    ...(opts.date ? { datePublished: opts.date, dateModified: opts.date } : {}),
  };
}

export function faqLd(faq: Array<{ q: string; a: string }> | undefined): object[] {
  if (!faq?.length) return [];
  return [{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }];
}
