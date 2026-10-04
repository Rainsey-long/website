/**
 * Good hours (docs/research/FEATURES.md #8, DESIGN_SYSTEM.md §6.15): Chinese
 * double-hours from the almanac and Western planetary hours from local sunrise,
 * for a chosen city and day. A GET form, so it works without JavaScript and
 * every view has a URL.
 */
import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import Seal from "@/components/Seal";
import { chineseHours, planetaryHours, PLANET_HOUR } from "@/lib/goodHours";
import { almanacDay } from "@/lib/almanac";
import { CITIES, cityBySlug, cityForZone, cityLabel, cityName } from "@/lib/cities";
import { addDays, fullDate } from "@/lib/dates";
import { dateInZone, visitorZone } from "@/lib/today";
import { timeIn } from "@/lib/format";
import { chosenTraditions } from "@/lib/traditionsServer";
import { pageMetadata } from "@/lib/seo";
import { CALENDAR_YEARS } from "@/lib/site";
import { nowIso } from "@/lib/clock";
import { getLang } from "@/lib/langServer";
import { defineMessages, localePath, num } from "@/lib/i18n";
import { animalName } from "@/lib/names";

export const dynamic = "force-dynamic";

const T = defineMessages({
  en: {
    title: "Good hours today: Chinese lucky hours and planetary hours",
    description: "Today's good and quiet hours from the Chinese almanac, and the planetary hours counted from sunrise in your city.",
    h1: "Good hours",
    where: (date: string, city: string) => `${date} in ${city}. Times are local clock time there.`,
    city: "City", day: "Day", show: "Show hours", dayNav: "Day", prev: "Previous day", next: "Next day",
    unknown: (city: string) => `That city is not on our list, so this shows ${city}. Choose the nearest large city above.`,
    neither: "Good hours come from the Chinese and Western traditions, so both are shown here.",
    chinese: "Chinese hours",
    chineseIntro: (pillar: string) => `Day ${pillar} `,
    chineseIntro2: ". Each two-hour block is ruled by one of twelve spirits; six are counted as good hours (黄道).",
    hour: (animal: string) => `${animal} hour `,
    spiritLine: (spirit: string, clash: string) => `${spirit}. Clashes with the ${clash}.`,
    now: "Now", good: "Good hour", quiet: "Quiet hour",
    planetary: "Planetary hours",
    fallback: "The Sun does not both rise and set here on this day, so these are 24 equal hours from 06:00.",
    sun: (rise: string, set: string) => `Sunrise ${rise}, sunset ${set}. Daylight and night are each split into twelve equal hours, ruled in turn by the seven classical planets.`,
    pHour: (p: string) => `${p} hour`,
    night: " · night",
    goodFor: (theme: string) => `Good for ${theme}.`,
    how: "How these hours work",
    how1: "The Chinese almanac divides the day into twelve two-hour blocks named after the zodiac animals. Each day, a fixed rule decides which spirit rules each block; the six good ones are traditionally chosen for starting important things. The Rat hour is split at midnight, so a day shows thirteen rows.",
    how2: "Planetary hours are a Western tradition: the first hour after sunrise belongs to the planet that names the weekday (the Sun on Sunday, the Moon on Monday), and the rest follow the old order Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon.",
    how3: "Both are cultural traditions to enjoy and reflect on, not instructions.",
  },
  km: {
    title: "ម៉ោងល្អថ្ងៃនេះ៖ ម៉ោងល្អតាមប្រតិទិនចិន និងម៉ោងភព",
    description: "ម៉ោងល្អ និងម៉ោងស្ងាត់ថ្ងៃនេះ តាមប្រតិទិនចិន និងម៉ោងភពដែលរាប់ចាប់ពីពេលថ្ងៃរះនៅទីក្រុងរបស់អ្នក។",
    h1: "ម៉ោងល្អ",
    where: (date: string, city: string) => `${date} នៅ ${city}។ ម៉ោងគិតតាមនាឡិកាក្នុងស្រុកនៅទីនោះ។`,
    city: "ទីក្រុង", day: "ថ្ងៃ", show: "បង្ហាញម៉ោង", dayNav: "ថ្ងៃ", prev: "ថ្ងៃមុន", next: "ថ្ងៃបន្ទាប់",
    unknown: (city: string) => `ទីក្រុងនោះមិនមាននៅក្នុងបញ្ជីរបស់យើងទេ ដូច្នេះទំព័រនេះបង្ហាញ ${city}។ សូមជ្រើសរើសទីក្រុងធំដែលនៅជិតបំផុតខាងលើ។`,
    neither: "ម៉ោងល្អមកពីប្រពៃណីចិន និងប្រពៃណីលោកខាងលិច ដូច្នេះទាំងពីរត្រូវបានបង្ហាញនៅទីនេះ។",
    chinese: "ម៉ោងតាមប្រតិទិនចិន",
    chineseIntro: (pillar: string) => `ថ្ងៃ ${pillar} `,
    chineseIntro2: "។ ម៉ោងពីរៗនីមួយៗ ស្ថិតក្រោមការគ្រប់គ្រងរបស់ទេវតាមួយក្នុងចំណោមដប់ពីរ ហើយប្រាំមួយក្នុងចំណោមនោះ ត្រូវបានរាប់ជាម៉ោងល្អ។",
    hour: (animal: string) => `ម៉ោង${animal} `,
    spiritLine: (spirit: string, clash: string) => `${spirit}។ ឆុងនឹងឆ្នាំ${clash}។`,
    now: "ឥឡូវ", good: "ម៉ោងល្អ", quiet: "ម៉ោងស្ងាត់",
    planetary: "ម៉ោងភព",
    fallback: "នៅថ្ងៃនេះ ព្រះអាទិត្យមិនរះ និងលិចទាំងពីរនៅទីនេះទេ ដូច្នេះនេះជាម៉ោងស្មើគ្នា ២៤ ម៉ោង ចាប់ពីម៉ោង ០៦:០០។",
    sun: (rise: string, set: string) => `ថ្ងៃរះម៉ោង ${rise} ថ្ងៃលិចម៉ោង ${set}។ ពេលថ្ងៃ និងពេលយប់ ត្រូវបានចែកជាដប់ពីរម៉ោងស្មើៗគ្នា ដែលភពបុរាណទាំងប្រាំពីរផ្លាស់វេនគ្នាគ្រប់គ្រង។`,
    pHour: (p: string) => `ម៉ោង${p}`,
    night: " · ពេលយប់",
    goodFor: (theme: string) => `ល្អសម្រាប់${theme}។`,
    how: "របៀបដែលម៉ោងទាំងនេះដំណើរការ",
    how1: "ប្រតិទិនចិនចែកថ្ងៃមួយជាដប់ពីរម៉ោងពីរៗ ដែលដាក់ឈ្មោះតាមសត្វទាំងដប់ពីរ។ ជារៀងរាល់ថ្ងៃ ច្បាប់ថេរមួយកំណត់ថាទេវតាណាគ្រប់គ្រងម៉ោងនីមួយៗ ហើយម៉ោងល្អទាំងប្រាំមួយ ត្រូវបានជ្រើសរើសតាមប្រពៃណីសម្រាប់ចាប់ផ្ដើមកិច្ចការសំខាន់ៗ។ ម៉ោងជូតត្រូវបានចែកនៅពាក់កណ្ដាលអធ្រាត្រ ដូច្នេះមួយថ្ងៃបង្ហាញដប់បីជួរ។",
    how2: "ម៉ោងភព ជាប្រពៃណីលោកខាងលិច៖ ម៉ោងទីមួយបន្ទាប់ពីថ្ងៃរះ ជារបស់ភពដែលជាឈ្មោះថ្ងៃនោះ (ព្រះអាទិត្យនៅថ្ងៃអាទិត្យ ព្រះចន្ទនៅថ្ងៃច័ន្ទ) ហើយម៉ោងបន្ទាប់ៗ ដើរតាមលំដាប់បុរាណ៖ ព្រះសៅរ៍ ព្រះព្រហស្បតិ៍ ព្រះអង្គារ ព្រះអាទិត្យ ព្រះសុក្រ ព្រះពុធ ព្រះចន្ទ។",
    how3: "ទាំងពីរជាប្រពៃណីវប្បធម៌សម្រាប់រីករាយ និងពិចារណា មិនមែនជាការណែនាំឲ្យធ្វើតាមទេ។",
  },
});

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/good-hours" });
}

type Search = { searchParams: Promise<{ city?: string; date?: string }> };

const validDate = (d: string | undefined) =>
  !!d && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`)) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d &&
  Number(d.slice(0, 4)) >= CALENDAR_YEARS.min && Number(d.slice(0, 4)) <= CALENDAR_YEARS.max;

const toMin = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));

export default async function GoodHours({ searchParams }: Search) {
  const sp = await searchParams;
  const lang = await getLang();
  const t = T[lang];
  const km = lang === "km";
  const asked = cityBySlug(sp.city);
  const city = asked ?? cityForZone(await visitorZone());
  const unknownCity = !!sp.city && !asked;
  const now = nowIso();
  const todayHere = dateInZone(city.tz, new Date(now));
  const date = validDate(sp.date) ? sp.date! : todayHere;
  const isToday = date === todayHere;
  const nowHm = timeIn(now, city.tz);
  const traditions = await chosenTraditions();
  const neither = !traditions.includes("chinese") && !traditions.includes("western");
  const showChinese = traditions.includes("chinese") || neither;
  const showWestern = traditions.includes("western") || neither;
  const chinese = showChinese ? chineseHours(date) : [];
  const day = showChinese ? almanacDay(date) : null;
  const planetary = showWestern ? planetaryHours(date, city.lat, city.lon, city.tz) : null;
  const q = (d: string) => `/good-hours?city=${city.slug}&date=${d}`;
  const prev = addDays(date, -1), next = addDays(date, 1);

  return (
    <>
      <Breadcrumbs items={[{ name: t.h1, href: "/good-hours" }]} />
      <div className="mx-auto max-w-page safe-x py-5">
        <h1 className="text-h1">{t.h1}</h1>
        <p className="mt-2 text-muted">{t.where(fullDate(date, lang), cityLabel(city, lang))}</p>

        <form method="get" action={localePath("/good-hours", lang)} className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] sm:items-end">
          <div>
            <label className="label" htmlFor="gh-city">{t.city}</label>
            <select className="field" id="gh-city" name="city" defaultValue={city.slug}>
              {CITIES.map((c) => <option key={c.slug} value={c.slug}>{cityLabel(c, lang)}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="gh-date">{t.day}</label>
            <input className="field tabular" type="date" id="gh-date" name="date" defaultValue={date} min={`${CALENDAR_YEARS.min}-01-01`} max={`${CALENDAR_YEARS.max}-12-31`} />
          </div>
          <div><button type="submit" className="btn-secondary">{t.show}</button></div>
        </form>

        <nav aria-label={t.dayNav} className="mt-5 flex justify-between text-small">
          <Link className="link inline-flex min-h-tap items-center gap-1" href={q(prev)} rel="prev"><Glyph name="chevron-left" set="ui" className="size-4" />{t.prev}</Link>
          <Link className="link inline-flex min-h-tap items-center gap-1" href={q(next)} rel="next">{t.next}<Glyph name="chevron-right" set="ui" className="size-4" /></Link>
        </nav>

        {unknownCity && <p className="mt-4 border border-rule p-4 text-small">{t.unknown(cityName(city, lang))}</p>}

        {neither && <p className="mt-4 border border-rule p-4 text-small">{t.neither}</p>}

        <div className={`mt-6 grid gap-7 ${showChinese && showWestern ? "lg:grid-cols-2" : ""}`}>
          {showChinese && day && (
            <section aria-labelledby="ch-h">
              <h2 id="ch-h" className="text-h2">{t.chinese}</h2>
              <p className="mt-2 text-small text-muted">
                {t.chineseIntro(day.dayPillar)}(<span lang="zh">{day.dayPillarHanzi}</span>){t.chineseIntro2}
              </p>
              <ul className="mt-4">
                {chinese.map((h) => {
                  const current = isToday && toMin(nowHm) >= toMin(h.start) && toMin(nowHm) < toMin(h.end);
                  return (
                    <li key={h.start} className={`flex min-h-tap flex-wrap items-center gap-x-3 gap-y-1 border-b border-rule px-2 py-2 ${current ? "rounded-sm outline outline-1 outline-cinnabar" : ""}`} aria-current={current ? "time" : undefined}>
                      <span className="tabular shrink-0">{num(h.start, lang)}–{num(h.end, lang)}</span>
                      <span className="min-w-0 flex-1">
                        {t.hour(animalName(h.animal.slug, lang))}<span lang="zh">{h.branchHanzi}</span>
                        <span className="block text-small text-muted">{t.spiritLine(km ? h.spiritKm : h.spirit, animalName(h.clash.slug, lang))}</span>
                      </span>
                      <span className="flex w-full shrink-0 items-center justify-end gap-2 text-small sm:w-auto">
                        {current && <span className="font-semibold">{t.now}</span>}
                        {h.good ? <><Seal size="sm" />{t.good}</> : <span className="text-muted">{t.quiet}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {showWestern && planetary && (
            <section aria-labelledby="pl-h">
              <h2 id="pl-h" className="text-h2">{t.planetary}</h2>
              <p className="mt-2 text-small text-muted">
                {planetary.fallback
                  ? t.fallback
                  : t.sun(timeIn(planetary.sunrise!, city.tz, lang), timeIn(planetary.sunset!, city.tz, lang))}
              </p>
              <ul className="mt-4">
                {planetary.hours.map((h) => {
                  const current = h.start <= now && now < h.end;
                  const p = PLANET_HOUR[h.planet];
                  return (
                    <li key={h.start} className={`flex min-h-tap items-center gap-3 border-b border-rule px-2 py-2 ${current ? "rounded-sm outline outline-1 outline-cinnabar" : ""}`} aria-current={current ? "time" : undefined}>
                      <span className="tabular shrink-0">{timeIn(h.start, city.tz, lang)}–{timeIn(h.end, city.tz, lang)}</span>
                      <Glyph name={h.planet} set="planet" className="size-5 shrink-0" />
                      <span className="flex-1">
                        {t.pHour(km ? p.nameKm : p.name)}{h.night ? <span className="text-muted">{t.night}</span> : null}
                        <span className="block text-small text-muted">{t.goodFor(km ? p.themeKm : p.theme)}</span>
                      </span>
                      {current && <span className="shrink-0 text-small font-semibold">{t.now}</span>}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        <section className="mt-8 max-w-reading" aria-labelledby="how-h">
          <h2 id="how-h" className="text-h3">{t.how}</h2>
          <div className="reading mt-3 text-body">
            <p>{t.how1}</p>
            <p>{t.how2}</p>
            <p>{t.how3}</p>
          </div>
        </section>
      </div>
    </>
  );
}

