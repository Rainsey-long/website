import Link from "next/link";
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
import { RELATION_NAME, chineseScore, pairSlug } from "@/lib/compatibility";
import { almanacDay } from "@/lib/almanac";
import { articleLd, faqLd, pageMetadata } from "@/lib/seo";
import { today } from "@/lib/today";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ animal: string }> };

export async function generateMetadata({ params }: Params) {
  const animal = animalBySlug((await params).animal);
  if (!animal) return {};
  return pageMetadata({ title: `Year of the ${animal.name}: personality and years`, description: animalProfile(animal.slug)?.fm.summary ?? `The ${animal.name} in the Chinese zodiac.`, path: `/chinese-zodiac/${animal.slug}`, ogImage: `/og/animal-${animal.slug}`, type: "article" });
}

export default async function AnimalProfile({ params }: Params) {
  const animal = animalBySlug((await params).animal);
  if (!animal) notFound();
  const profile = animalProfile(animal.slug);
  const fm = profile?.fm;
  const years = Array.from({ length: 8 }, (_, i) => 1936 + animal.index + i * 12).map((y) => zodiacYear(y));
  const matches = ANIMALS.filter((o) => o.slug !== animal.slug).map((o) => ({ o, s: chineseScore(animal, o) })).sort((a, b) => b.s.score - a.s.score);
  const date = await today();
  const day = almanacDay(date);
  const kh = KHMER_ANIMALS[animal.index];
  const todayLine = day.clash.slug === animal.slug
    ? `The almanac marks today as a clash day for the ${animal.name}. Keep plans simple and give big decisions another day.`
    : chineseScore(animal, day.clash).relation === "clash"
      ? `Today clashes with the ${day.clash.name}, your opposite, which leaves you on calm ground. A good day to support someone who feels unsettled.`
      : `Today clashes with the ${day.clash.name}, not with you. The almanac favours ${day.good.slice(0, 2).map((s) => s.toLowerCase()).join(" and ") || "steady routines"}.`;
  return (
    <>
      <Breadcrumbs items={[{ name: "Chinese zodiac", href: "/chinese-zodiac" }, { name: animal.name, href: `/chinese-zodiac/${animal.slug}` }]} />
      <JsonLd data={[articleLd({ headline: `The ${animal.name} in the Chinese zodiac`, description: fm?.summary ?? "", path: `/chinese-zodiac/${animal.slug}` }), ...faqLd(fm?.faq)]} />
      <div className="mx-auto max-w-page safe-x py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
        <article className="max-w-reading">
          <h1 className="flex items-center gap-3 text-display"><Glyph name={animal.slug} set="animal" className="size-glyph-lg shrink-0" />{animal.name}</h1>
          <p className="mt-2 text-small text-muted"><span lang="zh">{animal.hanzi}</span> · <span lang="km">{kh.km}</span> ({kh.roman}) · {animal.yinYang === "yang" ? "Yang" : "Yin"} · fixed element {ELEMENT_NAME[animal.branchElement]}</p>
          <section className="mt-5 border-y border-rule py-4" aria-labelledby="years-h">
            <h2 id="years-h" className="text-small font-semibold text-muted" style={{ fontFamily: "var(--font-sans)" }}>{animal.name} years</h2>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 tabular">{years.map((z) => <li key={z.year}>{z.year} <span className="text-muted">{ELEMENT_NAME[z.element]}</span></li>)}</ul>
            <p className="mt-2 text-small text-muted">Each year starts at Lunar New Year. In Cambodia it starts at Khmer New Year in mid-April.</p>
          </section>
          <section className="mt-5" aria-labelledby="today-h">
            <h2 id="today-h" className="text-h3">Today for the {animal.name}</h2>
            <p className="reading mt-2">{todayLine}</p>
            <p className="mt-2"><Link className="link" href={`/lucky-days/${date.slice(0, 4)}/${date.slice(5, 7)}`}>See this month&apos;s lucky days</Link></p>
          </section>
          <p className="mt-5"><Link className="btn-primary" href={`/chinese-zodiac/${animal.slug}/2027`}>Read the {animal.name} 2027 forecast</Link></p>
          <div className="mt-7">{profile ? <Prose html={profile.html} /> : null}</div>
          <AdSlot placement="inContent" />
          <section className="mt-7 border-t border-rule pt-5" aria-labelledby="matches-h">
            <h2 id="matches-h" className="text-h2">{animal.name} compatibility</h2>
            <ul className="mt-3">
              {matches.map(({ o, s }) => (
                <li key={o.slug} className="flex justify-between gap-3 border-b border-rule py-3">
                  <Link className="link" href={`/chinese-compatibility/${pairSlug(animal.slug, o.slug)}`}>{animal.name} and {o.name}</Link>
                  <span className="text-small text-muted">{RELATION_NAME[s.relation]} · <span className="tabular">{s.score}</span></span>
                </li>
              ))}
            </ul>
          </section>
          <Faq items={fm?.faq ?? []} />
          <AffiliateBox title={`Year of the ${animal.name} gifts`} text={`Small gifts inspired by the ${animal.name}.`} href="#" store="Etsy" />
          <RelatedLinks links={[
            { href: `/chinese-zodiac/${animal.slug}/2027`, label: `${animal.name} in 2027` },
            { href: "/chinese-compatibility", label: "Chinese compatibility for every pair" },
            { href: "/khmer", label: "Khmer traditions" },
          ]} />
        </article>
        <div className="hidden lg:block"><AdSlot placement="rail" /></div>
      </div>
    </>
  );
}
