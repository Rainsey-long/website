import Link from "@/components/client/LocaleLink";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import Prose from "@/components/Prose";
import Faq from "@/components/Faq";
import JsonLd from "@/components/JsonLd";
import RelatedLinks from "@/components/RelatedLinks";
import { AdSlot, AffiliateBox } from "@/components/Monetize";
import { ANIMALS, ELEMENT_NAME, animalBySlug, zodiacYear } from "@/lib/chinese";
import { KHMER_ANIMALS } from "@/lib/khmer";
import { animalProfile } from "@/lib/content";
import { chineseScore, pairSlug, relationName } from "@/lib/compatibility";
import { almanacDay } from "@/lib/almanac";
import { articleLd, faqLd, pageMetadata } from "@/lib/seo";
import { today } from "@/lib/today";
import { getLang } from "@/lib/langServer";
import { defineMessages, num } from "@/lib/i18n";

const T = defineMessages({
  en: {
    title: (a: string) => `Year of the ${a}: personality and years`,
    fallbackDesc: (a: string) => `The ${a} in the Chinese zodiac.`,
    headline: (a: string) => `The ${a} in the Chinese zodiac`,
    zodiac: "Chinese zodiac",
    yang: "Yang", yin: "Yin",
    fixed: (e: string) => `fixed element ${e}`,
    years: (a: string) => `${a} years`,
    yearsNote: "Each year starts at Lunar New Year. In Cambodia it starts at Khmer New Year in mid-April.",
    today: (a: string) => `Today for the ${a}`,
    clashSelf: (a: string) => `The almanac marks today as a clash day for the ${a}. Keep plans simple and give big decisions another day.`,
    clashOpp: (c: string) => `Today clashes with the ${c}, your opposite, which leaves you on calm ground. A good day to support someone who feels unsettled.`,
    clashOther: (c: string, good: string) => `Today clashes with the ${c}, not with you. The almanac favours ${good}.`,
    and: " and ", steady: "steady routines",
    month: "See this month's lucky days",
    forecast: (a: string) => `Read the ${a} 2027 forecast`,
    compat: (a: string) => `${a} compatibility`,
    pair: (a: string, b: string) => `${a} and ${b}`,
    giftsTitle: (a: string) => `Year of the ${a} gifts`,
    giftsText: (a: string) => `Small gifts inspired by the ${a}.`,
    in2027: (a: string) => `${a} in 2027`,
    allPairs: "Chinese compatibility for every pair",
    khmer: "Khmer traditions",
  },
});

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ animal: string }> };

export async function generateMetadata({ params }: Params) {
  const animal = animalBySlug((await params).animal);
  if (!animal) return {};
  const lang = await getLang();
  const name = animal.name;
  const loaded = animalProfile(animal.slug, lang);
  const desc = loaded && (lang === "en" || loaded.translated) ? loaded.fm.summary : T[lang].fallbackDesc(name);
  return pageMetadata({ lang, title: T[lang].title(name), description: desc, path: `/chinese-zodiac/${animal.slug}`, ogImage: `/og/animal-${animal.slug}`, type: "article" });
}

export default async function AnimalProfile({ params }: Params) {
  const animal = animalBySlug((await params).animal);
  if (!animal) notFound();
  const lang = await getLang();
  const t = T[lang];
  const A = animal.name;
  const an = (slug: string, en: string) => (en);
  const profile = animalProfile(animal.slug, lang);
  const fm = profile?.fm;
  const years = Array.from({ length: 8 }, (_, i) => 1936 + animal.index + i * 12).map((y) => zodiacYear(y));
  const matches = ANIMALS.filter((o) => o.slug !== animal.slug).map((o) => ({ o, s: chineseScore(animal, o) })).sort((a, b) => b.s.score - a.s.score);
  const date = await today();
  const day = almanacDay(date);
  const kh = KHMER_ANIMALS[animal.index];
  const favoured = day.good.slice(0, 2).map((s) => s.toLowerCase()).join(t.and);
  const todayLine = day.clash.slug === animal.slug
    ? t.clashSelf(A)
    : chineseScore(animal, day.clash).relation === "clash"
      ? t.clashOpp(an(day.clash.slug, day.clash.name))
      : t.clashOther(an(day.clash.slug, day.clash.name), favoured || t.steady);
  return (
    <>
      <Breadcrumbs items={[{ name: t.zodiac, href: "/chinese-zodiac" }, { name: animal.name, href: `/chinese-zodiac/${animal.slug}` }]} />
      <JsonLd data={[articleLd({ headline: t.headline(animal.name), description: fm?.summary ?? "", path: `/chinese-zodiac/${animal.slug}`, lang }), ...faqLd(fm?.faq)]} />
      <div className="mx-auto max-w-page safe-x py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
        <article className="max-w-reading">
          <h1 className="flex items-center gap-3 text-display"><Glyph name={animal.slug} set="animal" className="size-glyph-lg shrink-0" />{animal.name}</h1>
          <p className="mt-2 text-small text-muted"><span lang="zh">{animal.hanzi}</span> · <span lang="km">{kh.km}</span> ({kh.roman}) · {animal.yinYang === "yang" ? t.yang : t.yin} · {t.fixed(ELEMENT_NAME[animal.branchElement])}</p>
          <section className="mt-5 border-y border-rule py-4" aria-labelledby="years-h">
            <h2 id="years-h" className="text-small font-semibold text-muted" style={{ fontFamily: "var(--font-sans)" }}>{t.years(A)}</h2>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 tabular">{years.map((z) => <li key={z.year}>{num(z.year, lang)} <span className="text-muted">{ELEMENT_NAME[z.element]}</span></li>)}</ul>
            <p className="mt-2 text-small text-muted">{t.yearsNote}</p>
          </section>
          <section className="mt-5" aria-labelledby="today-h">
            <h2 id="today-h" className="text-h3">{t.today(A)}</h2>
            <p className="reading mt-2">{todayLine}</p>
            <p className="mt-2"><Link className="link" href={`/lucky-days/${date.slice(0, 4)}/${date.slice(5, 7)}`}>{t.month}</Link></p>
          </section>
          <p className="mt-5"><Link className="btn-primary" href={`/chinese-zodiac/${animal.slug}/2027`}>{t.forecast(A)}</Link></p>
          <div className="mt-7">{profile ? (<Prose html={profile.html} />) : null}</div>
          <AdSlot placement="inContent" />
          <section className="mt-7 border-t border-rule pt-5" aria-labelledby="matches-h">
            <h2 id="matches-h" className="text-h2">{t.compat(A)}</h2>
            <ul className="mt-3">
              {matches.map(({ o, s }) => (
                <li key={o.slug} className="flex justify-between gap-3 border-b border-rule py-3">
                  <Link className="link" href={`/chinese-compatibility/${pairSlug(animal.slug, o.slug)}`}>{t.pair(A, an(o.slug, o.name))}</Link>
                  <span className="text-small text-muted">{relationName(s.relation, lang)} · <span className="tabular">{num(s.score, lang)}</span></span>
                </li>
              ))}
            </ul>
          </section>
          <Faq items={fm?.faq ?? []} />
          <AffiliateBox title={t.giftsTitle(A)} text={t.giftsText(A)} href="#" store="Etsy" />
          <RelatedLinks links={[
            { href: `/chinese-zodiac/${animal.slug}/2027`, label: t.in2027(A) },
            { href: "/chinese-compatibility", label: t.allPairs },
            { href: "/khmer", label: t.khmer },
          ]} />
        </article>
        <div className="hidden lg:block"><AdSlot placement="rail" /></div>
      </div>
    </>
  );
}
