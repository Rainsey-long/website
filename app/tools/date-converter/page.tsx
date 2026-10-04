/**
 * Date converter (docs/research/FEATURES.md §7, #21; DESIGN_SYSTEM.md §6.18):
 * a Gregorian date in the Khmer and Chinese lunar calendars, and the two
 * reverse lookups. GET forms, so every answer has a URL and works without
 * JavaScript. The age tool at the bottom is a client island: a birth date
 * stays in the browser (CLAUDE.md owner rule), so it never joins these forms.
 */
import type { ReactNode } from "react";
import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import Seal from "@/components/Seal";
import AgeTool from "@/components/client/AgeTool";
import { convert, findChineseDate, findKhmerDates, isChineseQuery, isKhmerQuery, isKhmerYearCached, parseDateKey, type ChineseQuery, type KhmerQuery } from "@/lib/converter";
import { LUNAR_MONTHS, khmerDay } from "@/lib/khmer";
import { fullDate } from "@/lib/dates";
import { today } from "@/lib/today";
import { pageMetadata } from "@/lib/seo";
import { CALENDAR_YEARS } from "@/lib/site";
import { getLang } from "@/lib/langServer";
import { defineMessages, khmerDigits, localePath, num } from "@/lib/i18n";
import { animalName, elementName } from "@/lib/names";
import { almanacDay } from "@/lib/almanac";
import { GLOBAL_LIMIT_KEY, createRateLimiter } from "@/lib/rateLimit";

/**
 * A Khmer lookup for a year not yet cached builds a 365-day table (~27 ms of
 * synchronous work, security review 2026-10-04). Those builds share one
 * site-wide ceiling; cached years are free and never charged.
 */
const g = globalThis as unknown as { __khmerLookupLimiter?: ReturnType<typeof createRateLimiter> };
const khmerBuilds = (g.__khmerLookupLimiter ??= createRateLimiter(10 * 60_000, 600));

export const dynamic = "force-dynamic";

const T = defineMessages({
  en: {
    title: "Date converter: Khmer lunar, Chinese lunar and Gregorian dates",
    description: "Convert any date to the Khmer lunar calendar and the Chinese lunar calendar, find which day a lunar date falls on, and work out your age in each tradition.",
    h1: "Date converter",
    intro: "Read any day in the Khmer and Chinese lunar calendars, or find the Gregorian date of a lunar date.",
    date: "Date", convert: "Convert date", dateErr: "Enter a date between 1900 and 2100.",
    when: (n: number) => (n === 0 ? "Today" : n > 0 ? `In ${n} ${n === 1 ? "day" : "days"}` : `${-n} ${n === -1 ? "day" : "days"} ago`),
    khmerLunar: "Khmer lunar date", khmerYear: "Khmer year",
    khmerYearValue: (be: number, an: string, roman: string, sak: string) => `Buddhist Era ${be}, year of the ${an} (${roman}), ${sak}`,
    holy: "Buddhist holy day", festival: "Festival",
    chineseLunar: "Chinese lunar date", chineseYear: "Chinese zodiac year", pillar: "Day pillar",
    chineseYearValue: (el: string, an: string, y: number) => `${el} ${an}, lunar year ${y}`,
    almanac: "Chinese almanac", good: "Good day", neutral: "Ordinary day", challenging: "Quiet day", clash: (a: string) => `clashes with the ${a}`,
    month: "See the whole month",
    findKhmer: "Find a Khmer lunar date",
    findKhmerIntro: "Which day is 15 waxing Pisakh this year? Choose the lunar date and a Gregorian year.",
    year: "Gregorian year", lmonth: "Lunar month", phase: "Waxing or waning", waxing: "Waxing (កើត)", waning: "Waning (រោច)", day: "Day",
    leapNote: "(leap years only)",
    find: "Find the date",
    busy: "Many people are looking up dates right now. Try again in a few minutes.",
    birthHint: "Converting your own birth date? Use the age tool below: it works on your device and sends nothing.",
    ageLink: "Go to the age tool",
    khmerNone: (y: number) => `That lunar date does not fall in ${y}. The two Asadh months occur only in leap years, and some months have 14 waning days, not 15.`,
    khmerMany: "It falls twice this year: the lunar month starts in January and again in December.",
    findChinese: "Find a Chinese lunar date",
    findChineseIntro: "Families who keep a lunar birthday or a memorial day look this up every year. The lunar year here is the one that begins at Lunar New Year of the year you choose.",
    cmonth: "Lunar month", leap: "Leap month", monthN: (n: number) => `Month ${n}`,
    noDay30: "That month has only 29 days in this lunar year. Many families keep the 29th instead.",
    noLeap: (m: number) => (m ? `This lunar year's leap month is month ${m}, not the one you chose.` : "This lunar year has no leap month."),
    chineseResult: (y: number) => `Lunar year ${y}:`,
    how: "How the calendars line up",
    how1: "The Khmer calendar counts each lunar month in two halves, waxing (កើត) and waning (រោច), up to 15 days each. The Buddhist Era year changes at Visak Bochea, and the animal year at the Khmer New Year moment in April.",
    how2: "The Chinese lunar calendar numbers its months 1 to 12, adds a leap month about every three years, and starts the year at Lunar New Year in late January or February.",
    how3: "Both are calculated here by their published rules (the Chhankitek arithmetic and the Chinese calendar), so a printed calendar from your pagoda or temple is the final word if the two ever differ.",
  },
  km: {
    title: "កម្មវិធីបម្លែងកាលបរិច្ឆេទ៖ ចន្ទគតិខ្មែរ ចន្ទគតិចិន និងសុរិយគតិ",
    description: "បម្លែងកាលបរិច្ឆេទណាមួយទៅប្រតិទិនចន្ទគតិខ្មែរ និងប្រតិទិនចន្ទគតិចិន រកថ្ងៃដែលត្រូវនឹងថ្ងៃចន្ទគតិ និងគណនាអាយុរបស់អ្នកតាមប្រពៃណីនីមួយៗ។",
    h1: "បម្លែងកាលបរិច្ឆេទ",
    intro: "អានថ្ងៃណាមួយតាមប្រតិទិនចន្ទគតិខ្មែរ និងចិន ឬរកថ្ងៃខែសុរិយគតិនៃថ្ងៃចន្ទគតិណាមួយ។",
    date: "កាលបរិច្ឆេទ", convert: "បម្លែងកាលបរិច្ឆេទ", dateErr: "សូមបញ្ចូលកាលបរិច្ឆេទចន្លោះឆ្នាំ ១៩០០ និង ២១០០។",
    when: (n: number) => (n === 0 ? "ថ្ងៃនេះ" : n > 0 ? `${khmerDigits(n)} ថ្ងៃទៀត` : `${khmerDigits(-n)} ថ្ងៃមុន`),
    khmerLunar: "ថ្ងៃខែចន្ទគតិខ្មែរ", khmerYear: "ឆ្នាំខ្មែរ",
    khmerYearValue: (be: number, an: string, _roman: string, sak: string) => `ព.ស. ${khmerDigits(be)} ឆ្នាំ${an} ${sak}`,
    holy: "ថ្ងៃសីល", festival: "ពិធីបុណ្យ",
    chineseLunar: "ថ្ងៃខែចន្ទគតិចិន", chineseYear: "ឆ្នាំរាសីចិន", pillar: "សសរថ្ងៃ",
    chineseYearValue: (el: string, an: string, y: number) => `ឆ្នាំ${an} ធាតុ${el} ឆ្នាំចន្ទគតិ ${khmerDigits(y)}`,
    almanac: "ប្រតិទិនចិន", good: "ថ្ងៃល្អ", neutral: "ថ្ងៃធម្មតា", challenging: "ថ្ងៃស្ងាត់", clash: (a: string) => `ឆុងនឹងឆ្នាំ${a}`,
    month: "មើលខែទាំងមូល",
    findKhmer: "រកថ្ងៃចន្ទគតិខ្មែរ",
    findKhmerIntro: "ថ្ងៃ ១៥កើត ខែពិសាខ ឆ្នាំនេះ ត្រូវនឹងថ្ងៃណា? សូមជ្រើសថ្ងៃចន្ទគតិ និងឆ្នាំសុរិយគតិ។",
    year: "ឆ្នាំសុរិយគតិ", lmonth: "ខែចន្ទគតិ", phase: "កើត ឬរោច", waxing: "កើត", waning: "រោច", day: "ថ្ងៃ",
    leapNote: "(តែឆ្នាំអធិកមាសប៉ុណ្ណោះ)",
    find: "រកកាលបរិច្ឆេទ",
    busy: "ឥឡូវនេះមានមនុស្សច្រើនកំពុងរកកាលបរិច្ឆេទ។ សូមព្យាយាមម្ដងទៀតក្នុងពេលបន្តិចទៀត។",
    birthHint: "ចង់បម្លែងថ្ងៃកំណើតរបស់អ្នក? សូមប្រើឧបករណ៍អាយុខាងក្រោម៖ វាដំណើរការនៅលើឧបករណ៍របស់អ្នក ហើយមិនផ្ញើអ្វីទាំងអស់។",
    ageLink: "ទៅកាន់ឧបករណ៍អាយុ",
    khmerNone: (y: number) => `ថ្ងៃចន្ទគតិនោះមិនមាននៅក្នុងឆ្នាំ ${khmerDigits(y)} ទេ។ ខែអាសាឍទាំងពីរមានតែក្នុងឆ្នាំអធិកមាស ហើយខែខ្លះមានថ្ងៃរោចត្រឹម ១៤ មិនមែន ១៥ ទេ។`,
    khmerMany: "ឆ្នាំនេះវាធ្លាក់ពីរដង៖ ខែចន្ទគតិនោះចាប់ផ្ដើមក្នុងខែមករា និងម្ដងទៀតក្នុងខែធ្នូ។",
    findChinese: "រកថ្ងៃចន្ទគតិចិន",
    findChineseIntro: "គ្រួសារដែលរក្សាថ្ងៃកំណើតតាមចន្ទគតិ ឬថ្ងៃខួបដូនតា រកមើលវារៀងរាល់ឆ្នាំ។ ឆ្នាំចន្ទគតិនៅទីនេះ គឺឆ្នាំដែលចាប់ផ្ដើមនៅបុណ្យចូលឆ្នាំចិននៃឆ្នាំដែលអ្នកជ្រើស។",
    cmonth: "ខែចន្ទគតិ", leap: "ខែអធិក", monthN: (n: number) => `ខែទី${khmerDigits(n)}`,
    noDay30: "ខែនោះមានត្រឹម ២៩ ថ្ងៃប៉ុណ្ណោះក្នុងឆ្នាំចន្ទគតិនេះ។ គ្រួសារជាច្រើនប្រើថ្ងៃទី២៩ ជំនួសវិញ។",
    noLeap: (m: number) => (m ? `ខែអធិកនៃឆ្នាំចន្ទគតិនេះ គឺខែទី${khmerDigits(m)} មិនមែនខែដែលអ្នកជ្រើសទេ។` : "ឆ្នាំចន្ទគតិនេះគ្មានខែអធិកទេ។"),
    chineseResult: (y: number) => `ឆ្នាំចន្ទគតិ ${khmerDigits(y)}៖`,
    how: "របៀបដែលប្រតិទិនទាំងនេះត្រូវគ្នា",
    how1: "ប្រតិទិនខ្មែររាប់ខែចន្ទគតិនីមួយៗជាពីរពាក់កណ្ដាល គឺកើត និងរោច រហូតដល់ ១៥ ថ្ងៃម្ខាង។ ឆ្នាំពុទ្ធសករាជប្ដូរនៅថ្ងៃវិសាខបូជា ហើយឆ្នាំសត្វប្ដូរនៅពេលចូលឆ្នាំខ្មែរក្នុងខែមេសា។",
    how2: "ប្រតិទិនចន្ទគតិចិនដាក់លេខខែពី ១ ដល់ ១២ បន្ថែមខែអធិកប្រហែលរៀងរាល់បីឆ្នាំម្ដង ហើយចាប់ផ្ដើមឆ្នាំនៅបុណ្យចូលឆ្នាំចិន ចុងខែមករា ឬខែកុម្ភៈ។",
    how3: "ទាំងពីរត្រូវបានគណនានៅទីនេះតាមច្បាប់ដែលបានបោះពុម្ព (ការគណនាចន្ទគតិ និងប្រតិទិនចិន) ដូច្នេះប្រសិនបើខុសគ្នា ប្រតិទិនដែលបោះពុម្ពដោយវត្ត ឬទីសក្ការៈរបស់អ្នក គឺជាពាក្យចុងក្រោយ។",
  },
});

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/tools/date-converter" });
}

type Search = { searchParams: Promise<Record<string, string | undefined>> };
const int = (v: string | undefined) => (v && /^\d{1,4}$/.test(v) ? Number(v) : NaN);

export default async function DateConverter({ searchParams }: Search) {
  const sp = await searchParams;
  const lang = await getLang();
  const t = T[lang];
  const km = lang === "km";
  const now = await today();
  const thisYear = Number(now.slice(0, 4));
  const action = localePath("/tools/date-converter", lang);

  const asked = parseDateKey(sp.d);
  const dateError = sp.d !== undefined && !asked;
  const date = asked ?? now;
  const c = convert(date, now);

  const kq: Partial<KhmerQuery> = { year: int(sp.ky), month: int(sp.kmo), phase: sp.kph as KhmerQuery["phase"], day: int(sp.kd) };
  const khmerQuery = isKhmerQuery(kq) ? kq : null;
  const khmerBusy = !!khmerQuery && !isKhmerYearCached(khmerQuery.year) && khmerBuilds(GLOBAL_LIMIT_KEY);
  const khmerHits = khmerQuery && !khmerBusy ? findKhmerDates(khmerQuery) : null;

  const cq: Partial<ChineseQuery> = { year: int(sp.cy), month: int(sp.cm), day: int(sp.cd), leap: sp.cl === "1" };
  const chineseQuery = isChineseQuery(cq) ? cq : null;
  const chineseHit = chineseQuery ? findChineseDate(chineseQuery) : null;

  const todayK = khmerDay(now);
  const todayC = almanacDay(now);
  const kDefaults = khmerQuery ?? { year: thisYear, month: todayK.monthIndex, phase: todayK.phase, day: todayK.day };
  const cDefaults = chineseQuery ?? { year: thisYear, month: todayC.lunarMonth, day: todayC.lunarDay, leap: false };
  const k = c.khmer;
  const a = c.chinese;
  const quality = a.quality === "good" ? t.good : a.quality === "challenging" ? t.challenging : t.neutral;
  const dateLink = (d: string) => `/tools/date-converter?d=${d}#result-h`;

  return (
    <>
      <Breadcrumbs items={[{ name: t.h1, href: "/tools/date-converter" }]} />
      <div className="mx-auto max-w-reading safe-x py-5">
        <h1 className="text-h1">{t.h1}</h1>
        <p className="mt-2 text-muted">{t.intro}</p>

        <form method="get" action={action} className="mt-6 flex flex-wrap items-end gap-4">
          <div className="grow">
            <label className="label" htmlFor="cv-d">{t.date}</label>
            <input className="field tabular" type="date" id="cv-d" name="d" defaultValue={date} min={`${CALENDAR_YEARS.min}-01-01`} max={`${CALENDAR_YEARS.max}-12-31`} required aria-invalid={dateError} aria-describedby={dateError ? "cv-d-err" : undefined} />
          </div>
          <button type="submit" className="btn-primary">{t.convert}</button>
          {dateError && <p id="cv-d-err" className="w-full text-small font-semibold text-cinnabar">{t.dateErr}</p>}
          <p className="w-full text-small text-muted">{t.birthHint} <a className="link" href="#age-tool">{t.ageLink}</a></p>
        </form>

        <section className="mt-7" aria-labelledby="result-h">
          <h2 id="result-h" className="text-h2">{fullDate(date, lang)}</h2>
          <p className="mt-1 text-small text-muted">{t.when(c.daysFromToday)}</p>
          <dl className="mt-4">
            <Row label={t.khmerLunar}>
              <span lang="km" className="serif text-h3">{k.labelKm}</span>
              {!km && <span className="block text-muted">{k.weekday.en}, the {k.labelEn}</span>}
            </Row>
            <Row label={t.khmerYear}>{t.khmerYearValue(k.beYear, km ? k.animal.km : k.animal.en, k.animal.roman, km ? k.sakKm : k.sakRoman)}</Row>
            {(k.sila || k.festival) && (
              <Row label={k.festival ? t.festival : t.holy}>
                <span className="inline-flex flex-wrap items-center gap-x-4 gap-y-2">
                  {k.sila && <span className="inline-flex items-center gap-2"><span className="cal-sila" aria-hidden="true" />{t.holy}{!km && <span lang="km" className="text-muted"> ថ្ងៃសីល</span>}</span>}
                  {k.festival && <span className="font-semibold">{km ? k.festival.km : <>{k.festival.en} <span lang="km" className="font-normal text-muted">{k.festival.km}</span></>}</span>}
                </span>
              </Row>
            )}
            <Row label={t.chineseLunar}>{km ? a.lunarLabelKm : a.lunarLabel}</Row>
            <Row label={t.chineseYear}>
              <Link className="link" href={`/chinese-zodiac/${c.zodiac.animal.slug}`}>{t.chineseYearValue(elementName(c.zodiac.element, lang), animalName(c.zodiac.animal.slug, lang), c.zodiac.year)}</Link>
            </Row>
            <Row label={t.pillar}>{km ? <span lang="zh">{a.dayPillarHanzi}</span> : <>{a.dayPillar} <span lang="zh" className="text-muted">{a.dayPillarHanzi}</span></>}</Row>
            <Row label={t.almanac}>
              <span className="inline-flex items-center gap-2">{a.quality === "good" && <Seal size="sm" />}{a.quality === "challenging" && <span className="cal-dot" aria-hidden="true" />}{quality}</span>
              <span className="block text-small text-muted">{t.clash(animalName(a.clash.slug, lang))}</span>
            </Row>
          </dl>
          <p className="mt-4 text-small"><Link className="link" href={`/lucky-days/${date.slice(0, 4)}/${date.slice(5, 7)}`}>{t.month}</Link></p>
        </section>

        <section className="mt-8 border-t border-rule pt-7" aria-labelledby="kfind-h">
          <h2 id="kfind-h" className="text-h2">{t.findKhmer}</h2>
          <p className="mt-2 text-muted">{t.findKhmerIntro}</p>
          <form method="get" action={`${action}#kfind-h`} className="mt-5 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="kf-d" label={t.day}>
                <select className="field tabular" id="kf-d" name="kd" defaultValue={String(kDefaults.day)}>
                  {Array.from({ length: 15 }, (_, i) => <option key={i} value={i + 1}>{num(i + 1, lang)}</option>)}
                </select>
              </Field>
              <Field id="kf-p" label={t.phase}>
                <select className="field" id="kf-p" name="kph" defaultValue={kDefaults.phase}>
                  <option value="waxing">{t.waxing}</option>
                  <option value="waning">{t.waning}</option>
                </select>
              </Field>
              <Field id="kf-m" label={t.lmonth}>
                <select className="field" id="kf-m" name="kmo" defaultValue={String(kDefaults.month)}>
                  {LUNAR_MONTHS.map((m, i) => <option key={i} value={i}>{km ? `ខែ${m.km}` : `${m.en} (${m.km})`}{i >= 12 ? ` ${t.leapNote}` : ""}</option>)}
                </select>
              </Field>
              <Field id="kf-y" label={t.year}>
                <input className="field tabular" type="number" id="kf-y" name="ky" defaultValue={kDefaults.year} min={CALENDAR_YEARS.min} max={CALENDAR_YEARS.max} required />
              </Field>
            </div>
            <div><button type="submit" className="btn-secondary">{t.find}</button></div>
          </form>
          {khmerBusy && <p className="mt-5" aria-live="polite">{t.busy}</p>}
          {khmerQuery && khmerHits && (
            <div className="mt-5" aria-live="polite">
              {khmerHits.length === 0 ? <p>{t.khmerNone(khmerQuery.year)}</p> : (
                <>
                  <ul>{khmerHits.map((d) => <li key={d} className="border-t border-rule py-3"><Link className="link font-semibold" href={dateLink(d)}>{fullDate(d, lang)}</Link></li>)}</ul>
                  {khmerHits.length > 1 && <p className="mt-2 text-small text-muted">{t.khmerMany}</p>}
                </>
              )}
            </div>
          )}
        </section>

        <section className="mt-8 border-t border-rule pt-7" aria-labelledby="cfind-h">
          <h2 id="cfind-h" className="text-h2">{t.findChinese}</h2>
          <p className="mt-2 text-muted">{t.findChineseIntro}</p>
          <form method="get" action={`${action}#cfind-h`} className="mt-5 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="cf-m" label={t.cmonth}>
                <select className="field" id="cf-m" name="cm" defaultValue={String(cDefaults.month)}>
                  {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{t.monthN(i + 1)}</option>)}
                </select>
              </Field>
              <Field id="cf-d" label={t.day}>
                <select className="field tabular" id="cf-d" name="cd" defaultValue={String(cDefaults.day)}>
                  {Array.from({ length: 30 }, (_, i) => <option key={i} value={i + 1}>{num(i + 1, lang)}</option>)}
                </select>
              </Field>
              <Field id="cf-y" label={t.year}>
                <input className="field tabular" type="number" id="cf-y" name="cy" defaultValue={cDefaults.year} min={CALENDAR_YEARS.min} max={CALENDAR_YEARS.max - 1} required />
              </Field>
            </div>
            <label className="inline-flex min-h-tap items-center gap-3">
              <input type="checkbox" name="cl" value="1" defaultChecked={cDefaults.leap} className="size-5" />
              {t.leap}
            </label>
            <div><button type="submit" className="btn-secondary">{t.find}</button></div>
          </form>
          {chineseQuery && chineseHit && (
            <div className="mt-5" aria-live="polite">
              {chineseHit.ok ? (
                <p className="border-t border-rule py-3">{t.chineseResult(chineseQuery.year)} <Link className="link font-semibold" href={dateLink(chineseHit.date)}>{fullDate(chineseHit.date, lang)}</Link></p>
              ) : <p>{chineseHit.reason === "no-day-30" ? t.noDay30 : t.noLeap(chineseHit.leapMonth)}</p>}
            </div>
          )}
        </section>

        <div className="mt-8" id="age-tool"><AgeTool /></div>

        <section className="mt-8 border-t border-rule pt-7" aria-labelledby="how-h">
          <h2 id="how-h" className="text-h3">{t.how}</h2>
          <div className="reading mt-3 text-body">
            <p>{t.how1}</p>
            <p>{t.how2}</p>
            <p className="text-small text-muted">{t.how3}</p>
          </div>
        </section>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-rule py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-5">
      <dt className="text-small font-semibold">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}
