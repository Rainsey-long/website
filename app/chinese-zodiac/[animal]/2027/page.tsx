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
import { RELATION_NAME, chineseScore, pairSlug } from "@/lib/compatibility";
import { yearlyForecast } from "@/lib/content";
import { absolute, articleLd, pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ animal: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return ANIMALS.map((a) => ({ animal: a.slug })); }

export async function generateMetadata({ params }: Params) {
  const animal = animalBySlug((await params).animal);
  if (!animal) return {};
  return pageMetadata({ title: `${animal.name} in the year of the Fire Goat (2027)`, description: yearlyForecast(animal.slug)?.fm.summary ?? `The 2027 forecast for the ${animal.name}.`, path: `/chinese-zodiac/${animal.slug}/2027`, ogImage: `/og/animal-${animal.slug}`, type: "article" });
}

export default async function Forecast({ params }: Params) {
  const animal = animalBySlug((await params).animal);
  if (!animal) notFound();
  const f = yearlyForecast(animal.slug);
  const fm = f?.fm;
  const rel = chineseScore(animal, animalBySlug("goat")!).relation;
  const title = `${animal.name} in the year of the Fire Goat (2027)`;
  const allies = ANIMALS.filter((o) => o.slug !== animal.slug && ["three-harmonies", "six-harmonies"].includes(chineseScore(animal, o).relation));
  return (
    <>
      <Breadcrumbs items={[{ name: "Chinese zodiac", href: "/chinese-zodiac" }, { name: "2027", href: "/chinese-zodiac/2027" }, { name: animal.name, href: `/chinese-zodiac/${animal.slug}/2027` }]} />
      <JsonLd data={[articleLd({ headline: title, description: fm?.summary ?? "", path: `/chinese-zodiac/${animal.slug}/2027` })]} />
      <div className="mx-auto max-w-page safe-x py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
        <article className="max-w-reading">
          <Glyph name={animal.slug} set="animal" className="size-9" label={animal.name} />
          <h1 className="mt-3 text-h1">{animal.name} in the year of the Fire Goat</h1>
          <p className="mt-2 text-small text-muted">6 February 2027 to 25 January 2028</p>
          <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-3 border-y border-rule py-4 text-small">
            <div><dt className="text-muted">With the Goat</dt><dd className="mt-1 font-semibold">{animal.slug === "goat" ? "Your own year" : RELATION_NAME[rel]}</dd></div>
            {fm?.outlook ? <div><dt className="text-muted">Overall outlook</dt><dd className="mt-1"><EnergyMeter value={fm.outlook} label="Outlook" /></dd></div> : null}
          </dl>
          <div className="mt-7">{f ? <Prose html={f.html} /> : null}</div>
          {fm?.months && (
            <section className="mt-7 border-t border-rule pt-5" aria-labelledby="months-h">
              <h2 id="months-h" className="text-h2">Month by month</h2>
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
          <ReportOffer title={`Your full 2027 ${animal.name} report`} text="A longer, printable forecast with each month in detail." />
          <Share title={title} text={`What 2027 may bring for the ${animal.name}`} url={absolute(`/chinese-zodiac/${animal.slug}/2027`)} />
          <RelatedLinks heading="Related animals" links={[
            ...allies.map((o) => ({ href: `/chinese-zodiac/${o.slug}/2027`, label: `${o.name} in 2027` })),
            { href: `/chinese-zodiac/${animal.slug}`, label: `${animal.name} profile` },
            ...(animal.slug !== "goat" ? [{ href: `/chinese-compatibility/${pairSlug(animal.slug, "goat")}`, label: `${animal.name} and Goat compatibility` }] : []),
            { href: "/chinese-zodiac/2027", label: "All 2027 forecasts" },
          ]} />
        </article>
        <div className="hidden lg:block"><AdSlot placement="rail" /></div>
      </div>
    </>
  );
}
