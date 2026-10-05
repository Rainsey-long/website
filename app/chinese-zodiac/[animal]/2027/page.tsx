/** Yearly forecast (wireframe §7.5). */
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import Prose from "@/components/Prose";
import EnergyMeter from "@/components/EnergyMeter";
import JsonLd from "@/components/JsonLd";
import RelatedLinks from "@/components/RelatedLinks";
import { AdSlot, ReportOffer } from "@/components/Monetize";
import Share from "@/components/client/Share";
import { ANIMALS, animalBySlug } from "@/lib/chinese";
import { chineseScore, pairSlug, relationName } from "@/lib/compatibility";
import { yearlyForecast } from "@/lib/content";
import { absolute, articleLd, pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";
import { defineMessages } from "@/lib/i18n";

const T = defineMessages({
  en: {
    title: (a: string) => `${a} in the year of the Fire Goat (2027)`,
    h1: (a: string) => `${a} in the year of the Fire Goat`,
    fallbackDesc: (a: string) => `The 2027 forecast for the ${a}.`,
    zodiac: "Chinese zodiac", y2027: "2027",
    range: "6 February 2027 to 25 January 2028",
    withGoat: "With the Goat", own: "Your own year",
    outlookLabel: "Overall outlook", outlook: "Outlook",
    months: "Month by month",
    reportTitle: (a: string) => `Your full 2027 ${a} report`,
    reportText: "A longer, printable forecast with each month in detail.",
    shareText: (a: string) => `What 2027 may bring for the ${a}`,
    related: "Related animals",
    in2027: (a: string) => `${a} in 2027`,
    profile: (a: string) => `${a} profile`,
    pairGoat: (a: string) => `${a} and Goat compatibility`,
    all: "All 2027 forecasts",
  },
});

type Params = { params: Promise<{ animal: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return ANIMALS.map((a) => ({ animal: a.slug })); }

export async function generateMetadata({ params }: Params) {
  const animal = animalBySlug((await params).animal);
  if (!animal) return {};
  const lang = await getLang();
  const A = animal.name;
  const loaded = yearlyForecast(animal.slug, lang);
  const desc = loaded && (lang === "en" || loaded.translated) ? loaded.fm.summary : T[lang].fallbackDesc(A);
  return pageMetadata({ lang, title: T[lang].title(A), description: desc, path: `/chinese-zodiac/${animal.slug}/2027`, ogImage: `/og/animal-${animal.slug}`, type: "article" });
}

export default async function Forecast({ params }: Params) {
  const animal = animalBySlug((await params).animal);
  if (!animal) notFound();
  const lang = await getLang();
  const t = T[lang];
  const A = animal.name;
  const f = yearlyForecast(animal.slug, lang);
  const fm = f?.fm;
  const rel = chineseScore(animal, animalBySlug("goat")!).relation;
  const title = t.title(A);
  const allies = ANIMALS.filter((o) => o.slug !== animal.slug && ["three-harmonies", "six-harmonies"].includes(chineseScore(animal, o).relation));
  return (
    <>
      <Breadcrumbs items={[{ name: t.zodiac, href: "/chinese-zodiac" }, { name: t.y2027, href: "/chinese-zodiac/2027" }, { name: animal.name, href: `/chinese-zodiac/${animal.slug}/2027` }]} />
      <JsonLd data={[articleLd({ headline: title, description: fm?.summary ?? "", path: `/chinese-zodiac/${animal.slug}/2027`, lang })]} />
      <div className="mx-auto max-w-page safe-x py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
        <article className="max-w-reading">
          <Glyph name={animal.slug} set="animal" className="size-9" label={A} />
          <h1 className="mt-3 text-h1">{t.h1(A)}</h1>
          <p className="mt-2 text-small text-muted">{t.range}</p>
          <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-3 border-y border-rule py-4 text-small">
            <div><dt className="text-muted">{t.withGoat}</dt><dd className="mt-1 font-semibold">{animal.slug === "goat" ? t.own : relationName(rel, lang)}</dd></div>
            {fm?.outlook ? <div><dt className="text-muted">{t.outlookLabel}</dt><dd className="mt-1"><EnergyMeter value={fm.outlook} label={t.outlook} lang={lang} /></dd></div> : null}
          </dl>
          <div className="mt-7">{f ? (<Prose html={f.html} />) : null}</div>
          {fm?.months && (
            <section className="mt-7 border-t border-rule pt-5" aria-labelledby="months-h">
              <h2 id="months-h" className="text-h2">{t.months}</h2>
              <ol className="mt-3">
                {fm.months.map((m) => (
                  <li key={m.label} className="border-b border-rule py-4">
                    <h3 className="text-h3">{m.label}</h3>
                    <p className="reading mt-1">{m.text}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <AdSlot placement="afterReading" />
          <ReportOffer title={t.reportTitle(A)} text={t.reportText} />
          <Share title={title} text={t.shareText(A)} url={absolute(`/chinese-zodiac/${animal.slug}/2027`)} />
          <RelatedLinks heading={t.related} links={[
            ...allies.map((o) => ({ href: `/chinese-zodiac/${o.slug}/2027`, label: t.in2027(o.name) })),
            { href: `/chinese-zodiac/${animal.slug}`, label: t.profile(A) },
            ...(animal.slug !== "goat" ? [{ href: `/chinese-compatibility/${pairSlug(animal.slug, "goat")}`, label: t.pairGoat(A) }] : []),
            { href: "/chinese-zodiac/2027", label: t.all },
          ]} />
        </article>
        <div className="hidden lg:block"><AdSlot placement="rail" /></div>
      </div>
    </>
  );
}
