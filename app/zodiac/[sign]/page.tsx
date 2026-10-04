import Link from "@/components/client/LocaleLink";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import Prose from "@/components/Prose";
import Faq from "@/components/Faq";
import JsonLd from "@/components/JsonLd";
import RelatedLinks from "@/components/RelatedLinks";
import { AdSlot, AffiliateBox } from "@/components/Monetize";
import { SIGNS, elementLabel, modalityLabel, signBySlug, signRange, signRuler } from "@/lib/western";
import { westernProfile } from "@/lib/content";
import { pairSlug, westernScore } from "@/lib/compatibility";
import { articleLd, faqLd, pageMetadata } from "@/lib/seo";
import { defineMessages, num } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { signName } from "@/lib/names";

const T = defineMessages({
  en: {
    title: (s: string) => `${s} traits, love and career`, fallback: (s: string) => `${s} personality profile.`,
    crumb: "Zodiac signs", headline: (s: string) => `${s} zodiac sign`,
    element: "Element", quality: "Quality", ruler: "Ruler", luckyDay: "Lucky day",
    read: (s: string) => `Read today's ${s} horoscope`, soon: (s: string) => `${s} profile coming soon.`,
    notTranslated: "", best: (s: string) => `Best matches for ${s}`, pair: (a: string, b: string) => `${a} and ${b}`,
    gifts: (s: string) => `${s} gifts`, giftText: (s: string) => `Thoughtful, small gifts inspired by ${s}.`,
    today: (s: string) => `${s} horoscope today`, every: "Compatibility for every pair", moonRising: "Find your moon and rising signs",
  },
  km: {
    title: (s: string) => `រាសី${s}៖ លក្ខណៈ ស្នេហា និងអាជីព`, fallback: (s: string) => `ប្រវត្តិរូបបុគ្គលិកលក្ខណៈរាសី${s}។`,
    crumb: "រាសី", headline: (s: string) => `រាសី${s}`,
    element: "ធាតុ", quality: "ប្រភេទ", ruler: "ភពគ្រប់គ្រង", luckyDay: "ថ្ងៃសំណាង",
    read: (s: string) => `អានហោរាសាស្ត្រថ្ងៃនេះ រាសី${s}`, soon: (s: string) => `ប្រវត្តិរូបរាសី${s} នឹងមានឆាប់ៗនេះ។`,
    notTranslated: "អត្ថបទនេះមានជាភាសាអង់គ្លេសនៅឡើយ។", best: (s: string) => `គូដែលត្រូវគ្នាបំផុតសម្រាប់រាសី${s}`, pair: (a: string, b: string) => `រាសី${a} និងរាសី${b}`,
    gifts: (s: string) => `កាដូសម្រាប់រាសី${s}`, giftText: (s: string) => `កាដូតូចៗ ដែលគិតគូរយ៉ាងល្អ បំផុសគំនិតដោយរាសី${s}។`,
    today: (s: string) => `ហោរាសាស្ត្រថ្ងៃនេះ រាសី${s}`, every: "ភាពត្រូវគ្នាសម្រាប់គ្រប់គូ", moonRising: "ស្វែងរករាសីព្រះចន្ទ និងរាសីឡើងរបស់អ្នក",
  },
});

type Params = { params: Promise<{ sign: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return SIGNS.map((s) => ({ sign: s.slug })); }

export async function generateMetadata({ params }: Params) {
  const sign = signBySlug((await params).sign);
  if (!sign) return {};
  const lang = await getLang();
  const name = signName(sign.slug, lang);
  const p = westernProfile(sign.slug, lang);
  const summary = p && (lang === "en" || p.translated) ? p.fm.summary : undefined;
  return pageMetadata({ lang, title: T[lang].title(name), description: summary ?? T[lang].fallback(name), path: `/zodiac/${sign.slug}`, ogImage: `/og/${sign.slug}`, type: "article" });
}

export default async function SignProfile({ params }: Params) {
  const sign = signBySlug((await params).sign);
  if (!sign) notFound();
  const lang = await getLang();
  const t = T[lang];
  const name = signName(sign.slug, lang);
  const profile = westernProfile(sign.slug, lang);
  const fm = profile?.fm;
  // A Khmer page whose profile is not translated yet shows the English text, marked as English.
  const english = lang === "km" && profile ? !profile.translated : false;
  const enLang = english ? "en" : undefined;
  const best = SIGNS.filter((s) => s.slug !== sign.slug).map((s) => ({ s, score: westernScore(sign, s).score })).sort((a, b) => b.score - a.score).slice(0, 3);
  return (
    <>
      <Breadcrumbs items={[{ name: t.crumb, href: "/zodiac" }, { name, href: `/zodiac/${sign.slug}` }]} />
      <JsonLd data={[articleLd({ headline: t.headline(name), description: fm?.summary ?? "", path: `/zodiac/${sign.slug}`, lang }), ...faqLd(fm?.faq)]} />
      <div className="mx-auto max-w-page safe-x py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
        <article className="max-w-reading">
          <h1 className="flex items-center gap-3 text-display"><Glyph name={sign.slug} set="western" className="size-glyph-lg shrink-0" />{name}</h1>
          <p className="mt-2 text-small text-muted tabular">{signRange(sign, lang)}</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-rule py-4 text-small sm:grid-cols-4">
            <div><dt className="text-muted">{t.element}</dt><dd className="mt-1 flex items-center gap-2 font-semibold"><span className="swatch" style={{ background: `var(--el-${sign.element})` }} aria-hidden="true" />{elementLabel(sign.element, lang)}</dd></div>
            <div><dt className="text-muted">{t.quality}</dt><dd className="mt-1 font-semibold">{modalityLabel(sign.modality, lang)}</dd></div>
            <div><dt className="text-muted">{t.ruler}</dt><dd className="mt-1 font-semibold">{signRuler(sign, lang).replace(/^the /, "The ")}</dd></div>
            {fm?.luckyDay && <div><dt className="text-muted">{t.luckyDay}</dt><dd className="mt-1 font-semibold" lang={enLang}>{fm.luckyDay}</dd></div>}
          </dl>
          {fm?.traits && <p className="mt-4 text-muted" lang={enLang}>{fm.traits.join(" · ")}</p>}
          <p className="mt-5"><Link className="btn-primary" href={`/horoscope/${sign.slug}`}>{t.read(name)}</Link></p>
          <div className="mt-7">
            {english && <p className="mb-4 text-small text-muted">{t.notTranslated}</p>}
            {profile ? (english ? <div lang="en"><Prose html={profile.html} /></div> : <Prose html={profile.html} />) : <p className="reading">{t.soon(name)}</p>}
          </div>
          <AdSlot placement="inContent" />
          <section className="mt-7 border-t border-rule pt-5" aria-labelledby="best-h">
            <h2 id="best-h" className="text-h2">{t.best(name)}</h2>
            <ul className="mt-3">{best.map(({ s, score }) => <li key={s.slug} className="flex justify-between border-b border-rule py-3"><Link className="link" href={`/compatibility/${pairSlug(sign.slug, s.slug)}`}>{t.pair(name, signName(s.slug, lang))}</Link><span className="tabular text-muted">{num(score, lang)}</span></li>)}</ul>
          </section>
          <Faq items={fm?.faq ?? []} />
          <AffiliateBox title={t.gifts(name)} text={t.giftText(name)} href="#" store="Etsy" />
          <RelatedLinks links={[
            { href: `/horoscope/${sign.slug}`, label: t.today(name) },
            { href: "/compatibility", label: t.every },
            { href: "/tools/zodiac-calculator", label: t.moonRising },
          ]} />
        </article>
        <div className="hidden lg:block"><AdSlot placement="rail" /></div>
      </div>
    </>
  );
}
