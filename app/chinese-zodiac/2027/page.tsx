import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import EnergyMeter from "@/components/EnergyMeter";
import { ANIMALS } from "@/lib/chinese";
import { yearlyForecast } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";
import { defineMessages } from "@/lib/i18n";
import { animalName } from "@/lib/names";

const T = defineMessages({
  en: {
    title: "2027 Year of the Fire Goat forecasts",
    description: "What the 2027 Year of the Fire Goat may bring for each Chinese zodiac animal: love, career, money and month-by-month highlights.",
    zodiac: "Chinese zodiac",
    crumb: "2027",
    h1: "2027, the Year of the Fire Goat",
    intro: "The Fire Goat year begins at Lunar New Year on 6 February 2027 and runs until 25 January 2028. In Cambodia the Goat year begins at Khmer New Year on 14 April 2027. Fire brings warmth and visibility; the Goat brings gentleness, creativity and care for home.",
    inYear: (a: string) => `${a} in 2027`,
    outlook: "Outlook",
  },
  km: {
    title: "ការព្យាករណ៍ឆ្នាំ២០២៧ ឆ្នាំមមែធាតុភ្លើង",
    description: "អ្វីដែលឆ្នាំមមែធាតុភ្លើង ២០២៧ អាចនាំមកសម្រាប់សត្វនីមួយៗក្នុងឆ្នាំចិន៖ ស្នេហា ការងារ ហិរញ្ញវត្ថុ និងចំណុចសំខាន់ប្រចាំខែ។",
    zodiac: "ឆ្នាំសត្វចិន",
    crumb: "២០២៧",
    h1: "ឆ្នាំ២០២៧ ឆ្នាំមមែធាតុភ្លើង",
    intro: "ឆ្នាំមមែធាតុភ្លើងចាប់ផ្ដើមនៅបុណ្យចូលឆ្នាំចិន ថ្ងៃទី៦ ខែកុម្ភៈ ឆ្នាំ២០២៧ ហើយបន្តរហូតដល់ថ្ងៃទី២៥ ខែមករា ឆ្នាំ២០២៨។ នៅកម្ពុជា ឆ្នាំមមែចាប់ផ្ដើមនៅបុណ្យចូលឆ្នាំខ្មែរ ថ្ងៃទី១៤ ខែមេសា ឆ្នាំ២០២៧។ ធាតុភ្លើងនាំមកនូវភាពកក់ក្ដៅ និងការលេចធ្លោ។ សត្វមមែនាំមកនូវភាពទន់ភ្លន់ ការច្នៃប្រឌិត និងការយកចិត្តទុកដាក់លើផ្ទះសម្បែង។",
    inYear: (a: string) => `${a} ក្នុងឆ្នាំ២០២៧`,
    outlook: "ទស្សនវិស័យ",
  },
});

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/chinese-zodiac/2027" });
}

export default async function Forecasts2027() {
  const lang = await getLang();
  const t = T[lang];
  return (
    <>
      <Breadcrumbs items={[{ name: t.zodiac, href: "/chinese-zodiac" }, { name: t.crumb, href: "/chinese-zodiac/2027" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">{t.h1}</h1>
        <p className="reading mt-3">{t.intro}</p>
        <ul className="mt-6">
          {ANIMALS.map((a) => {
            const loaded = yearlyForecast(a.slug, lang);
            const f = loaded?.fm;
            const translated = loaded?.translated ?? false;
            return (
              <li key={a.slug} className="border-t border-rule py-4">
                <Link href={`/chinese-zodiac/${a.slug}/2027`} className="group flex items-center gap-4 no-underline">
                  <Glyph name={a.slug} set="animal" className="size-glyph-lg shrink-0" />
                  <span className="flex-1">
                    <span className="serif text-h3 group-hover:underline">{t.inYear(lang === "km" ? `ឆ្នាំ${animalName(a.slug, lang)}` : a.name)}</span>
                    {f?.summary && <span className="mt-1 block text-muted" lang={lang === "km" && !translated ? "en" : undefined}>{f.summary}</span>}
                  </span>
                  {f?.outlook ? <EnergyMeter value={f.outlook} label={t.outlook} lang={lang} /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
