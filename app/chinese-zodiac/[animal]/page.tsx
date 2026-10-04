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
import { animalName, elementName, yearOf } from "@/lib/names";

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
    notYet: "",
  },
  km: {
    title: (a: string) => `${a}៖ លក្ខណៈបុគ្គល និងឆ្នាំ`,
    fallbackDesc: (a: string) => `${a} ក្នុងឆ្នាំសត្វចិន។`,
    headline: (a: string) => `${a} ក្នុងឆ្នាំសត្វចិន`,
    zodiac: "ឆ្នាំសត្វចិន",
    yang: "យ៉ាង", yin: "យីន",
    fixed: (e: string) => `ធាតុថេរ ${e}`,
    years: (a: string) => `ឆ្នាំ${a}`,
    yearsNote: "ឆ្នាំនីមួយៗចាប់ផ្ដើមនៅបុណ្យចូលឆ្នាំចិន។ នៅកម្ពុជា វាចាប់ផ្ដើមនៅបុណ្យចូលឆ្នាំខ្មែរ ក្នុងពាក់កណ្ដាលខែមេសា។",
    today: (a: string) => `ថ្ងៃនេះសម្រាប់អ្នកកើតឆ្នាំ${a}`,
    clashSelf: (a: string) => `ប្រតិទិនចាត់ទុកថ្ងៃនេះជាថ្ងៃឆុងសម្រាប់អ្នកកើតឆ្នាំ${a}។ សូមធ្វើផែនការឲ្យសាមញ្ញ ហើយទុកការសម្រេចចិត្តធំៗសម្រាប់ថ្ងៃផ្សេង។`,
    clashOpp: (c: string) => `ថ្ងៃនេះឆុងនឹងឆ្នាំ${c} ដែលនៅទល់មុខអ្នក ដូច្នេះអ្នកនៅលើដីស្ងប់។ ជាថ្ងៃល្អសម្រាប់គាំទ្រអ្នកដែលមានអារម្មណ៍មិនស្ងប់។`,
    clashOther: (c: string, good: string) => `ថ្ងៃនេះឆុងនឹងឆ្នាំ${c} មិនមែនឆុងនឹងអ្នកទេ។ ប្រតិទិនល្អសម្រាប់${good}។`,
    and: " និង ", steady: "ទម្លាប់ប្រចាំថ្ងៃដ៏នឹងនរ",
    month: "មើលថ្ងៃល្អក្នុងខែនេះ",
    forecast: (a: string) => `អានការព្យាករណ៍ឆ្នាំ${a} សម្រាប់ឆ្នាំ២០២៧`,
    compat: (a: string) => `ភាពត្រូវគ្នារបស់ឆ្នាំ${a}`,
    pair: (a: string, b: string) => `${a} និង${b}`,
    giftsTitle: (a: string) => `អំណោយសម្រាប់ឆ្នាំ${a}`,
    giftsText: (a: string) => `អំណោយតូចៗដែលបំផុសគំនិតដោយឆ្នាំ${a}។`,
    in2027: (a: string) => `ឆ្នាំ${a} ក្នុងឆ្នាំ២០២៧`,
    allPairs: "ភាពត្រូវគ្នាតាមឆ្នាំចិនសម្រាប់គ្រប់គូ",
    khmer: "ប្រពៃណីខ្មែរ",
    notYet: "អត្ថបទនេះមានជាភាសាអង់គ្លេសនៅឡើយ។",
  },
});

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ animal: string }> };

export async function generateMetadata({ params }: Params) {
  const animal = animalBySlug((await params).animal);
  if (!animal) return {};
  const lang = await getLang();
  const name = lang === "km" ? yearOf(animal.slug, lang) : animal.name;
  const loaded = animalProfile(animal.slug, lang);
  const desc = loaded && (lang === "en" || loaded.translated) ? loaded.fm.summary : T[lang].fallbackDesc(name);
  return pageMetadata({ lang, title: T[lang].title(name), description: desc, path: `/chinese-zodiac/${animal.slug}`, ogImage: `/og/animal-${animal.slug}`, type: "article" });
}

export default async function AnimalProfile({ params }: Params) {
  const animal = animalBySlug((await params).animal);
  if (!animal) notFound();
  const lang = await getLang();
  const t = T[lang];
  const km = lang === "km";
  const A = km ? animalName(animal.slug, lang) : animal.name;
  const an = (slug: string, en: string) => (km ? animalName(slug, lang) : en);
  const profile = animalProfile(animal.slug, lang);
  const untranslated = km && profile !== null && !profile.translated;
  const fm = profile?.fm;
  const years = Array.from({ length: 8 }, (_, i) => 1936 + animal.index + i * 12).map((y) => zodiacYear(y));
  const matches = ANIMALS.filter((o) => o.slug !== animal.slug).map((o) => ({ o, s: chineseScore(animal, o) })).sort((a, b) => b.s.score - a.s.score);
  const date = await today();
  const day = almanacDay(date);
  const kh = KHMER_ANIMALS[animal.index];
  const favoured = km ? day.goodKm.slice(0, 2).join(t.and) : day.good.slice(0, 2).map((s) => s.toLowerCase()).join(t.and);
  const todayLine = day.clash.slug === animal.slug
    ? t.clashSelf(A)
    : chineseScore(animal, day.clash).relation === "clash"
      ? t.clashOpp(an(day.clash.slug, day.clash.name))
      : t.clashOther(an(day.clash.slug, day.clash.name), favoured || t.steady);
  return (
    <>
      <Breadcrumbs items={[{ name: t.zodiac, href: "/chinese-zodiac" }, { name: km ? yearOf(animal.slug, lang) : animal.name, href: `/chinese-zodiac/${animal.slug}` }]} />
      <JsonLd data={[articleLd({ headline: t.headline(km ? yearOf(animal.slug, lang) : animal.name), description: fm?.summary ?? "", path: `/chinese-zodiac/${animal.slug}`, lang }), ...faqLd(fm?.faq)]} />
      <div className="mx-auto max-w-page safe-x py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
        <article className="max-w-reading">
          <h1 className="flex items-center gap-3 text-display"><Glyph name={animal.slug} set="animal" className="size-glyph-lg shrink-0" />{km ? yearOf(animal.slug, lang) : animal.name}</h1>
          <p className="mt-2 text-small text-muted"><span lang="zh">{animal.hanzi}</span> · {km ? <span lang="en">{kh.roman}</span> : <><span lang="km">{kh.km}</span> ({kh.roman})</>} · {animal.yinYang === "yang" ? t.yang : t.yin} · {t.fixed(km ? elementName(animal.branchElement, lang) : ELEMENT_NAME[animal.branchElement])}</p>
          <section className="mt-5 border-y border-rule py-4" aria-labelledby="years-h">
            <h2 id="years-h" className="text-small font-semibold text-muted" style={{ fontFamily: "var(--font-sans)" }}>{t.years(A)}</h2>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 tabular">{years.map((z) => <li key={z.year}>{num(z.year, lang)} <span className="text-muted">{km ? elementName(z.element, lang) : ELEMENT_NAME[z.element]}</span></li>)}</ul>
            <p className="mt-2 text-small text-muted">{t.yearsNote}</p>
          </section>
          <section className="mt-5" aria-labelledby="today-h">
            <h2 id="today-h" className="text-h3">{t.today(A)}</h2>
            <p className="reading mt-2">{todayLine}</p>
            <p className="mt-2"><Link className="link" href={`/lucky-days/${date.slice(0, 4)}/${date.slice(5, 7)}`}>{t.month}</Link></p>
          </section>
          <p className="mt-5"><Link className="btn-primary" href={`/chinese-zodiac/${animal.slug}/2027`}>{t.forecast(A)}</Link></p>
          <div className="mt-7">{untranslated && <p className="mb-4 text-small text-muted">{t.notYet}</p>}{profile ? (untranslated ? <div lang="en"><Prose html={profile.html} /></div> : <Prose html={profile.html} />) : null}</div>
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
          {untranslated ? <div lang="en"><Faq items={fm?.faq ?? []} /></div> : <Faq items={fm?.faq ?? []} />}
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
