/** Retrograde and eclipse calendar (research feature #5). Calm framing: an optical effect, a time to review. */
import Link from "@/components/client/LocaleLink";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import { degreeInL, eclipseName, eclipsesForYear, planetNameIn, retrogradesForYear, signNameIn } from "@/lib/skyEvents";
import { getLang } from "@/lib/langServer";
import { defineMessages, num } from "@/lib/i18n";
import { dateTimeIn, shortDateIn, zoneLabel } from "@/lib/format";
import { visitorZone } from "@/lib/today";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ yyyy: string }> };
const parse = (y: string) => (/^\d{4}$/.test(y) && +y >= 1950 && +y <= 2080 ? +y : null);

const T = defineMessages({
  en: {
    title: (y: number) => `Mercury retrograde ${y}, all retrogrades and eclipses`,
    description: (y: number) => `Every retrograde from Mercury to Saturn in ${y}, with station dates, shadow periods and the year's solar and lunar eclipses.`,
    sky: "Sky", crumb: (y: number) => `Retrogrades ${y}`, yearNav: "Year",
    h1: (y: number) => `Retrogrades and eclipses in ${y}`,
    intro: "A planet looks retrograde when Earth's own motion makes it seem to move backwards against the stars. Tradition reads it as a time to review, revisit and finish, not to fear. The shadow is the stretch of sky the planet covers three times.",
    zone: (z: string) => `Times in ${z} time, to within about ten minutes.`,
    rx: "Retrogrades",
    span: (p: string, a: string, b: string) => `${p}, ${a} to ${b}`,
    turnsRx: "Turns retrograde", turnsD: "Turns direct", shadowStart: "Shadow begins", shadowEnd: "Shadow ends",
    eclipses: "Eclipses", peak: "(peak)",
    bodyIn: (sun: boolean, sign: string) => `${sun ? "Sun" : "Moon"} in ${sign}`,
    foot: "Whether an eclipse is visible depends on where you are. Calculated with astronomy-engine.",
  },
  km: {
    title: (y: number) => `ព្រះពុធដើរថយក្រោយ ${khmerYear(y)} និងភពដើរថយក្រោយ និងគ្រាសទាំងអស់`,
    description: (y: number) => `រាល់ការដើរថយក្រោយរបស់ភព ពីព្រះពុធដល់ព្រះសៅរ៍ ក្នុងឆ្នាំ${khmerYear(y)} ព្រមទាំងថ្ងៃឈប់ រយៈពេលស្រមោល និងសូរ្យគ្រាស ចន្ទគ្រាសប្រចាំឆ្នាំ។`,
    sky: "មេឃ", crumb: (y: number) => `ភពដើរថយក្រោយ ${khmerYear(y)}`, yearNav: "ឆ្នាំ",
    h1: (y: number) => `ភពដើរថយក្រោយ និងគ្រាស ក្នុងឆ្នាំ${khmerYear(y)}`,
    intro: "ភពមួយមើលទៅដូចជាដើរថយក្រោយ នៅពេលដែលចលនារបស់ផែនដីខ្លួនឯង ធ្វើឲ្យវាហាក់ដូចជាផ្លាស់ទីថយក្រោយធៀបនឹងផ្កាយ។ ប្រពៃណីចាត់ទុកវាជាពេលសម្រាប់ពិនិត្យឡើងវិញ ត្រឡប់មើល និងបញ្ចប់កិច្ចការ មិនមែនសម្រាប់ភ័យខ្លាចទេ។ ស្រមោល គឺជាផ្នែកមេឃដែលភពនោះឆ្លងកាត់បីដង។",
    zone: (z: string) => `ម៉ោងគិតតាមម៉ោង ${z} ត្រឹមត្រូវក្នុងរង្វង់ប្រហែលដប់នាទី។`,
    rx: "ភពដើរថយក្រោយ",
    span: (p: string, a: string, b: string) => `${p} ពី ${a} ដល់ ${b}`,
    turnsRx: "ចាប់ផ្ដើមដើរថយក្រោយ", turnsD: "ដើរទៅមុខវិញ", shadowStart: "ស្រមោលចាប់ផ្ដើម", shadowEnd: "ស្រមោលបញ្ចប់",
    eclipses: "សូរ្យគ្រាស និងចន្ទគ្រាស", peak: "(ពេលពេញលេញបំផុត)",
    bodyIn: (sun: boolean, sign: string) => `${sun ? "ព្រះអាទិត្យ" : "ព្រះចន្ទ"}ក្នុងរាសី${sign}`,
    foot: "អ្នកអាចមើលឃើញគ្រាសឬអត់ អាស្រ័យលើទីកន្លែងដែលអ្នកនៅ។ គណនាដោយ astronomy-engine។",
  },
});
function khmerYear(y: number) { return num(y, "km"); }

export async function generateMetadata({ params }: Params) {
  const year = parse((await params).yyyy);
  if (!year) return {};
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title(year), description: T[lang].description(year), path: `/sky/retrogrades/${year}`, noindex: year < 2020 || year > 2030 });
}

export default async function Retrogrades({ params }: Params) {
  const year = parse((await params).yyyy);
  if (!year) notFound();
  const tz = await visitorZone();
  const lang = await getLang();
  const t = T[lang];
  const sign = (i: number) => signNameIn(i, lang);
  const deg = (lon: number) => degreeInL(lon, lang);
  const rx = retrogradesForYear(year);
  const ecl = eclipsesForYear(year);
  return (
    <>
      <Breadcrumbs items={[{ name: t.sky, href: "/sky" }, { name: t.crumb(year), href: `/sky/retrogrades/${year}` }]} />
      <div className="mx-auto max-w-reading safe-x py-5 box-content">
        <nav aria-label={t.yearNav} className="flex justify-between text-small">
          <Link className="link inline-flex min-h-tap items-center gap-1" href={`/sky/retrogrades/${year - 1}`} rel="prev"><Glyph name="chevron-left" set="ui" className="size-4" />{num(year - 1, lang)}</Link>
          <Link className="link inline-flex min-h-tap items-center gap-1" href={`/sky/retrogrades/${year + 1}`} rel="next">{num(year + 1, lang)}<Glyph name="chevron-right" set="ui" className="size-4" /></Link>
        </nav>
        <h1 className="mt-3 text-h1">{t.h1(year)}</h1>
        <p className="reading mt-3">{t.intro}</p>
        <p className="mt-2 text-small text-muted">{t.zone(zoneLabel(tz))}</p>
        <h2 className="mt-7 text-h2">{t.rx}</h2>
        <ol className="mt-3">
          {rx.map((r) => (
            <li key={r.planet + r.stationRx.at} className="border-b border-rule py-4">
              <h3 className="text-h3">{t.span(planetNameIn(r.planet, lang), shortDateIn(r.stationRx.at, tz, lang), shortDateIn(r.stationD.at, tz, lang))}</h3>
              <dl className="mt-2 grid gap-x-5 gap-y-2 text-small sm:grid-cols-2 tabular">
                <div><dt className="text-muted">{t.turnsRx}</dt><dd>{dateTimeIn(r.stationRx.at, tz, lang)}, {sign(r.stationRx.signIndex)} {deg(r.stationRx.longitude)}</dd></div>
                <div><dt className="text-muted">{t.turnsD}</dt><dd>{dateTimeIn(r.stationD.at, tz, lang)}, {sign(r.stationD.signIndex)} {deg(r.stationD.longitude)}</dd></div>
                {r.shadowStart && <div><dt className="text-muted">{t.shadowStart}</dt><dd>{shortDateIn(r.shadowStart, tz, lang)}</dd></div>}
                {r.shadowEnd && <div><dt className="text-muted">{t.shadowEnd}</dt><dd>{shortDateIn(r.shadowEnd, tz, lang)}</dd></div>}
              </dl>
            </li>
          ))}
        </ol>
        <h2 className="mt-7 text-h2">{t.eclipses}</h2>
        <ol className="mt-3">
          {ecl.map((e) => (
            <li key={e.at} className="border-b border-rule py-3">
              <span className="font-semibold">{eclipseName(e, lang)}</span> · <span className="tabular">{dateTimeIn(e.at, tz, lang)}</span> {t.peak} · {t.bodyIn(e.body === "sun", sign(e.signIndex))}
            </li>
          ))}
        </ol>
        <p className="mt-5 text-small text-muted">{t.foot}</p>
      </div>
    </>
  );
}
