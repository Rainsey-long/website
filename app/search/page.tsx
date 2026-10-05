/**
 * /search?q= (FEATURES.md #49). A plain GET form over the static index in
 * lib/searchIndex.ts. The query is capped at MAX_QUERY characters and only
 * ever rendered as React text. Result pages are noindex (thin, query-shaped).
 */
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "@/components/client/LocaleLink";
import { getLang } from "@/lib/langServer";
import { pageMetadata } from "@/lib/seo";
import { defineMessages } from "@/lib/i18n";
import { entryFor, MAX_QUERY, search, SUGGESTIONS, type SearchEntry, type SearchKind } from "@/lib/searchIndex";

export const dynamic = "force-dynamic";

const T = defineMessages({
  en: {
    title: "Search",
    description: "Search horoscopes, the Chinese zodiac, Khmer traditions, festivals, tools and sky pages.",
    label: "Search the site",
    placeholder: "A sign, an animal, a festival…",
    submit: "Search",
    results: (n: number, q: string) => `${n} ${n === 1 ? "result" : "results"} for “${q}”`,
    none: (q: string) => `Nothing matched “${q}”. Try a sign, an animal or a festival name, or start from one of these:`,
    start: "Start from one of these:",
    kinds: { sign: "Horoscope", animal: "Chinese zodiac", compatibility: "Compatibility", khmer: "Khmer tradition", festival: "Festival", tool: "Tool", sky: "Sky", page: "About the site" } as Record<SearchKind, string>,
  },
});

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const lang = await getLang();
  const q = (await searchParams).q;
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/search", noindex: Boolean(q) });
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const lang = await getLang();
  const t = T[lang];
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw ?? "").slice(0, MAX_QUERY).trim();
  const results = q ? search(q) : [];
  const suggestions = SUGGESTIONS.map(entryFor).filter((x): x is SearchEntry => Boolean(x));
  const list = (items: SearchEntry[]) => (
    <ul className="mt-4 border-t border-rule">
      {items.map((r) => (
        <li key={`${r.href}|${r.title.en}`} className="border-b border-rule">
          <Link href={r.href} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-4 no-underline">
            <span className="serif text-h3">{r.title[lang]}</span>
            <span className="text-small text-muted">{t.kinds[r.kind]}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      <Breadcrumbs items={[{ name: t.title, href: "/search" }]} />
      <div className="mx-auto max-w-reading safe-x py-6 box-content">
        <h1 className="text-h1">{t.title}</h1>
        <form role="search" action="/search" method="get" className="mt-6 flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <label htmlFor="q" className="label">{t.label}</label>
            <input id="q" name="q" type="search" className="field w-full" defaultValue={q} maxLength={MAX_QUERY} placeholder={t.placeholder} autoComplete="off" enterKeyHint="search" />
          </div>
          <button type="submit" className="btn-primary">{t.submit}</button>
        </form>
        <div className="mt-6" aria-live="polite">
          {q && results.length > 0 && (
            <>
              <p className="text-small text-muted">{t.results(results.length, q)}</p>
              {list(results)}
            </>
          )}
          {q && results.length === 0 && (
            <>
              <p>{t.none(q)}</p>
              {list(suggestions)}
            </>
          )}
          {!q && (
            <>
              <p className="text-muted">{t.start}</p>
              {list(suggestions)}
            </>
          )}
        </div>
      </div>
    </>
  );
}
