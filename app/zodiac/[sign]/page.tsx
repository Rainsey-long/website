import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import Prose from "@/components/Prose";
import Faq from "@/components/Faq";
import JsonLd from "@/components/JsonLd";
import RelatedLinks from "@/components/RelatedLinks";
import { AdSlot, AffiliateBox } from "@/components/Monetize";
import { ELEMENT_LABEL, MODALITY_LABEL, SIGNS, signBySlug } from "@/lib/western";
import { westernProfile } from "@/lib/content";
import { pairSlug, westernScore } from "@/lib/compatibility";
import { articleLd, faqLd, pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ sign: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return SIGNS.map((s) => ({ sign: s.slug })); }

export async function generateMetadata({ params }: Params) {
  const sign = signBySlug((await params).sign);
  if (!sign) return {};
  const fm = westernProfile(sign.slug)?.fm;
  return pageMetadata({ title: `${sign.name} traits, love and career`, description: fm?.summary ?? `${sign.name} personality profile.`, path: `/zodiac/${sign.slug}`, ogImage: `/og/${sign.slug}`, type: "article" });
}

export default async function SignProfile({ params }: Params) {
  const sign = signBySlug((await params).sign);
  if (!sign) notFound();
  const profile = westernProfile(sign.slug);
  const fm = profile?.fm;
  const best = SIGNS.filter((s) => s.slug !== sign.slug).map((s) => ({ s, score: westernScore(sign, s).score })).sort((a, b) => b.score - a.score).slice(0, 3);
  return (
    <>
      <Breadcrumbs items={[{ name: "Zodiac signs", href: "/zodiac" }, { name: sign.name, href: `/zodiac/${sign.slug}` }]} />
      <JsonLd data={[articleLd({ headline: `${sign.name} zodiac sign`, description: fm?.summary ?? "", path: `/zodiac/${sign.slug}` }), ...faqLd(fm?.faq)]} />
      <div className="mx-auto max-w-page safe-x py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
        <article className="max-w-reading">
          <h1 className="flex items-center gap-3 text-display"><Glyph name={sign.slug} set="western" className="size-glyph-lg shrink-0" />{sign.name}</h1>
          <p className="mt-2 text-small text-muted tabular">{sign.range}</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-rule py-4 text-small sm:grid-cols-4">
            <div><dt className="text-muted">Element</dt><dd className="mt-1 flex items-center gap-2 font-semibold"><span className="swatch" style={{ background: `var(--el-${sign.element})` }} aria-hidden="true" />{ELEMENT_LABEL[sign.element]}</dd></div>
            <div><dt className="text-muted">Quality</dt><dd className="mt-1 font-semibold">{MODALITY_LABEL[sign.modality]}</dd></div>
            <div><dt className="text-muted">Ruler</dt><dd className="mt-1 font-semibold">{sign.ruler.replace(/^the /, "The ")}</dd></div>
            {fm?.luckyDay && <div><dt className="text-muted">Lucky day</dt><dd className="mt-1 font-semibold">{fm.luckyDay}</dd></div>}
          </dl>
          {fm?.traits && <p className="mt-4 text-muted">{fm.traits.join(" · ")}</p>}
          <p className="mt-5"><Link className="btn-primary" href={`/horoscope/${sign.slug}`}>Read today&apos;s {sign.name} horoscope</Link></p>
          <div className="mt-7">{profile ? <Prose html={profile.html} /> : <p className="reading">{sign.name} profile coming soon.</p>}</div>
          <AdSlot placement="inContent" />
          <section className="mt-7 border-t border-rule pt-5" aria-labelledby="best-h">
            <h2 id="best-h" className="text-h2">Best matches for {sign.name}</h2>
            <ul className="mt-3">{best.map(({ s, score }) => <li key={s.slug} className="flex justify-between border-b border-rule py-3"><Link className="link" href={`/compatibility/${pairSlug(sign.slug, s.slug)}`}>{sign.name} and {s.name}</Link><span className="tabular text-muted">{score}</span></li>)}</ul>
          </section>
          <Faq items={fm?.faq ?? []} />
          <AffiliateBox title={`${sign.name} gifts`} text={`Thoughtful, small gifts inspired by ${sign.name}.`} href="#" store="Etsy" />
          <RelatedLinks links={[
            { href: `/horoscope/${sign.slug}`, label: `${sign.name} horoscope today` },
            { href: "/compatibility", label: "Compatibility for every pair" },
            { href: "/tools/zodiac-calculator", label: "Find your moon and rising signs" },
          ]} />
        </article>
        <div className="hidden lg:block"><AdSlot placement="rail" /></div>
      </div>
    </>
  );
}
