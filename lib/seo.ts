/**
 * Page metadata in one place (CamboMath lib/seo.ts pattern): every page calls
 * pageMetadata() so it gets a unique title, description, canonical, Open Graph
 * and Twitter card (build plan §9).
 */
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./site";

export function absolute(path: string): string {
  return new URL(path, SITE_URL).href;
}

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  type?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  const image = absolute(opts.ogImage ?? "/og/default");
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: absolute(opts.path), languages: { en: absolute(opts.path), "x-default": absolute(opts.path) } },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: absolute(opts.path),
      siteName: SITE_NAME,
      type: opts.type ?? "website",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, images: [image] },
  };
}

export function breadcrumbLd(items: Array<{ name: string; href: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", href: "/" }, ...items].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absolute(c.href),
    })),
  };
}

export function articleLd(opts: { headline: string; description: string; path: string; date?: string }): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    mainEntityOfPage: absolute(opts.path),
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
