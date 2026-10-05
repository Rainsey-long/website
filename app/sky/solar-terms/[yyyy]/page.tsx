/**
 * The 24 solar terms of a year (节气): exact moments from lib/solarTerms.ts,
 * shown in the visitor's zone, with the Chinese name, pinyin, English and a
 * draft Khmer name. Calm framing: a farmer's calendar of the Sun's year.
 */
import Link from "@/components/client/LocaleLink";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import { solarTermName, solarTermsAvailable, solarTermsForYear } from "@/lib/solarTerms";
import { getLang } from "@/lib/langServer";
import { defineMessages, num } from "@/lib/i18n";
import { dateTimeIn, zoneLabel } from "@/lib/format";
import { visitorZone } from "@/lib/today";
import { pageMetadata } from "@/lib/seo";
import { CALENDAR_YEARS } from "@/lib/site";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ yyyy: string }> };
const parse = (y: string) => (/^\d{4}$/.test(y) && +y >= CALENDAR_YEARS.min && +y <= CALENDAR_YEARS.max ? +y : null);

const T = defineMessages({
  en: {
    title: (y: string) => `The 24 solar terms in ${y}: dates and times`,
    description: (y: string) => `All 24 Chinese solar terms (jieqi) of ${y}, from Minor Cold to the Winter Solstice, with the exact moment of each in your time zone.`,
    sky: "Sky", crumb: (y: string) => `Solar terms ${y}`, yearNav: "Year",
    h1: (y: string) => `The 24 solar terms in ${y}`,
    intro: "The Chinese calendar divides the Sun's year into 24 solar terms, one each time the Sun moves 15° along the ecliptic. They began as a farmer's calendar of weather and work, and still mark the seasons: Lichun, the Start of Spring, also begins the year of the zodiac animal in Chinese astrology.",
    zone: (z: string) => `Times in ${z} time, to the minute.`,
    major: "Season marker",
    sun: (d: string) => `Sun at ${d}`,
    foot: "Calculated with astronomy-engine from the Sun's apparent longitude. The date of a term can differ by a day between time zones.",
    busy: "This page is busy right now. Try this year again in a few minutes.",
  },
  km: {
    title: (y: string) => `រដូវកាលព្រះអាទិត្យទាំង ២៤ ក្នុងឆ្នាំ${y}៖ ថ្ងៃ និងម៉ោង`,
    description: (y: string) => `រដូវកាលព្រះអាទិត្យចិនទាំង ២៤ (ជៀឆី) នៃឆ្នាំ${y} ចាប់ពីរងាតិច ដល់ថ្ងៃខ្លីបំផុតក្នុងឆ្នាំ ព្រមទាំងពេលវេលាពិតប្រាកដតាមម៉ោងរបស់អ្នក។`,
    sky: "មេឃ", crumb: (y: string) => `រដូវកាលព្រះអាទិត្យ ${y}`, yearNav: "ឆ្នាំ",
    h1: (y: string) => `រដូវកាលព្រះអាទិត្យទាំង ២៤ ក្នុងឆ្នាំ${y}`,
    intro: "ប្រតិទិនចិនបែងចែកឆ្នាំនៃព្រះអាទិត្យជា ២៤ រដូវកាល ម្ដងរាល់ពេលព្រះអាទិត្យផ្លាស់ទី ១៥° តាមគន្លងរបស់វា។ ពួកវាចាប់ផ្ដើមជាប្រតិទិនរបស់កសិករ សម្រាប់អាកាសធាតុ និងការងារ ហើយនៅតែសម្គាល់រដូវរហូតមកដល់សព្វថ្ងៃ។ លីឈុន (ចាប់ផ្ដើមរដូវផ្ការីក) ក៏ជាការចាប់ផ្ដើមឆ្នាំនៃសត្វប្រចាំឆ្នាំ ក្នុងហោរាសាស្ត្រចិនដែរ។",
    zone: (z: string) => `ម៉ោងគិតតាមម៉ោង ${z} ត្រឹមត្រូវដល់នាទី។`,
    major: "សញ្ញារដូវ",
    sun: (d: string) => `ព្រះអាទិត្យនៅ ${d}`,
    foot: "គណនាដោយ astronomy-engine ពីទីតាំងដែលយើងឃើញនៃព្រះអាទិត្យ។ ថ្ងៃនៃរដូវកាលមួយ អាចខុសគ្នាមួយថ្ងៃ រវាងតំបន់ម៉ោងផ្សេងៗ។",
    busy: "ទំព័រនេះរវល់បន្តិចឥឡូវនេះ។ សូមព្យាយាមម្ដងទៀតក្នុងពេលបន្តិចទៀត។",
  },
});

export async function generateMetadata({ params }: Params) {
  const year = parse((await params).yyyy);
  if (!year) return {};
  const lang = await getLang();
  const y = num(year, lang);
  return pageMetadata({ lang, title: T[lang].title(y), description: T[lang].description(y), path: `/sky/solar-terms/${year}`, noindex: year < 2020 || year > 2030 });
}

export default async function SolarTerms({ params }: Params) {
  const year = parse((await params).yyyy);
  if (!year) notFound();
  const tz = await visitorZone();
  const lang = await getLang();
  const t = T[lang];
  const y = num(year, lang);
  if (!solarTermsAvailable(year)) {
    return <div className="mx-auto max-w-reading safe-x py-7"><h1 className="text-h1">{t.h1(y)}</h1><p className="mt-3">{t.busy}</p></div>;
  }
  const terms = solarTermsForYear(year);
  return (
    <>
      <Breadcrumbs items={[{ name: t.sky, href: "/sky" }, { name: t.crumb(y), href: `/sky/solar-terms/${year}` }]} />
      <div className="mx-auto max-w-reading safe-x py-5 box-content">
        <nav aria-label={t.yearNav} className="flex justify-between text-small">
          {year > CALENDAR_YEARS.min ? <Link className="link inline-flex min-h-tap items-center gap-1" href={`/sky/solar-terms/${year - 1}`} rel="prev"><Glyph name="chevron-left" set="ui" className="size-4" />{num(year - 1, lang)}</Link> : <span />}
          {year < CALENDAR_YEARS.max ? <Link className="link inline-flex min-h-tap items-center gap-1" href={`/sky/solar-terms/${year + 1}`} rel="next">{num(year + 1, lang)}<Glyph name="chevron-right" set="ui" className="size-4" /></Link> : <span />}
        </nav>
        <h1 className="mt-3 text-h1">{t.h1(y)}</h1>
        <p className="reading mt-3">{t.intro}</p>
        <p className="mt-2 text-small text-muted">{t.zone(zoneLabel(tz))}</p>
        <ol className="mt-5">
          {terms.map((s) => (
            <li key={s.pinyin} className="grid gap-1 border-t border-rule py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-baseline sm:gap-5">
              <div>
                <span className="font-semibold">{solarTermName(s, lang)}</span>
                <span className="ml-2 text-small text-muted"><span lang="zh">{s.hanzi}</span> <span lang="zh-Latn">{s.pinyin}</span></span>
              </div>
              <div className="text-small tabular">
                <time dateTime={s.at}>{dateTimeIn(s.at, tz, lang)}</time>
                <span className="text-muted"> · {t.sun(num(`${s.longitude}°`, lang))}{s.major ? ` · ${t.major}` : ""}</span>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-small text-muted">{t.foot}</p>
      </div>
    </>
  );
}
