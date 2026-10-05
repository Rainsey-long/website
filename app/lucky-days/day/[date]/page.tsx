/**
 * One day of the Chinese almanac (tong shu): lunar date, day pillar, day
 * officer and spirit, the almanac's good-for and avoid lists and the clash
 * animal, with the Khmer lunar date when the visitor shows that tradition.
 * Any day 1900–2100 renders (one lunar-javascript lookup and, for Khmer, two
 * momentkh conversions: cheap and bounded per request); only a window around
 * today is indexed, like the dated horoscopes.
 */
import Link from "@/components/client/LocaleLink";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import Seal from "@/components/Seal";
import { almanacDay } from "@/lib/almanac";
import { khmerDay } from "@/lib/khmer";
import { addDays, fullDate, longDate, monthName, monthYear } from "@/lib/dates";
import { getLang } from "@/lib/langServer";
import { defineMessages, type Lang } from "@/lib/i18n";
import { animalName } from "@/lib/names";
import { chosenTraditions } from "@/lib/traditionsServer";
import { pageMetadata } from "@/lib/seo";
import { CALENDAR_YEARS, DEFAULT_TZ } from "@/lib/site";
import { dateInZone } from "@/lib/today";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ date: string }> };

function validDate(d: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const y = Number(d.slice(0, 4));
  return y >= CALENDAR_YEARS.min && y <= CALENDAR_YEARS.max && addDays(d, 0) === d;
}

/** Indexed: about two months back and a year ahead (people plan ahead with an almanac). */
function inWindow(d: string): boolean {
  const t = dateInZone(DEFAULT_TZ);
  return d >= addDays(t, -60) && d <= addDays(t, 366);
}

const T = defineMessages({
  en: {
    crumb: "Lucky days",
    title: (d: string) => `Chinese almanac for ${d}: good for, avoid and clash`,
    description: (d: string) => `The Chinese almanac for ${d}: lunar date, day pillar, day officer and spirit, what the day is traditionally good for and what to leave for another day.`,
    dayNav: "Day", prev: "Previous day", next: "Next day",
    quality: { good: "A good day by the almanac", neutral: "An ordinary day by the almanac", challenging: "A day the almanac treats with care" },
    lunar: "Chinese lunar date", pillar: "Day pillar", officer: "Day officer", spirit: "Day spirit",
    spiritGood: "favourable", spiritPlain: "less favourable",
    goodFor: "Good for", avoid: "Leave for another day", nothing: "Nothing in particular",
    clashH: "Clash animal",
    clashA: "The day clashes with the ", clashB: ".",
    clashNote: "People born in that year may prefer a quieter day for big plans.",
    khmerH: "Khmer lunar calendar", khmerEn: (l: string) => `The ${l}.`,
    holy: "A Buddhist holy day.",
    month: (m: string) => `All of ${m}`,
    finder: "Find a lucky date for an occasion",
    hours: "Good hours of the day",
    note: "The almanac is a tradition to enjoy and reflect on, not a rule. Medical and catch-all entries are left out.",
  },
  km: {
    crumb: "ថ្ងៃល្អ",
    title: (d: string) => `ប្រតិទិនចិនសម្រាប់${d}៖ ល្អសម្រាប់ គួរជៀសវាង និងសត្វឆុង`,
    description: (d: string) => `ប្រតិទិនចិនសម្រាប់${d}៖ ថ្ងៃចន្ទគតិ សសរថ្ងៃ មន្ត្រី និងទេវតាប្រចាំថ្ងៃ អ្វីដែលថ្ងៃនេះល្អសម្រាប់ និងអ្វីដែលគួរទុកធ្វើថ្ងៃផ្សេង។`,
    dayNav: "ថ្ងៃ", prev: "ថ្ងៃមុន", next: "ថ្ងៃបន្ទាប់",
    quality: { good: "ថ្ងៃល្អតាមប្រតិទិន", neutral: "ថ្ងៃធម្មតាតាមប្រតិទិន", challenging: "ថ្ងៃដែលប្រតិទិនណែនាំឲ្យប្រុងប្រយ័ត្ន" },
    lunar: "ថ្ងៃចន្ទគតិចិន", pillar: "សសរថ្ងៃ", officer: "មន្ត្រីប្រចាំថ្ងៃ", spirit: "ទេវតាប្រចាំថ្ងៃ",
    spiritGood: "ល្អ", spiritPlain: "មិនសូវល្អ",
    goodFor: "ល្អសម្រាប់", avoid: "គួរទុកធ្វើថ្ងៃផ្សេង", nothing: "គ្មានអ្វីពិសេស",
    clashH: "សត្វឆុង",
    clashA: "ថ្ងៃនេះឆុងនឹងឆ្នាំ", clashB: "។",
    clashNote: "អ្នកកើតឆ្នាំនោះ ប្រហែលជាចូលចិត្តថ្ងៃដែលស្ងប់ស្ងាត់ជាង សម្រាប់គម្រោងធំៗ។",
    khmerH: "ប្រតិទិនចន្ទគតិខ្មែរ", khmerEn: (l: string) => l,
    holy: "ថ្ងៃសីល។",
    month: (m: string) => `មើល${m}ទាំងមូល`,
    finder: "រកថ្ងៃល្អសម្រាប់កម្មវិធីណាមួយ",
    hours: "ម៉ោងល្អប្រចាំថ្ងៃ",
    note: "ប្រតិទិននេះជាប្រពៃណីសម្រាប់រីករាយ និងពិចារណា មិនមែនជាច្បាប់ទេ។ ព័ត៌មានទាក់ទងនឹងសុខភាព និងព័ត៌មានទូទៅពេក ត្រូវបានដកចេញ។",
  },
});

const monthLabel = (y: number, m: number, lang: Lang) => (lang === "km" ? monthYear(y, m, "km") : `${monthName(m)} ${y}`);

export async function generateMetadata({ params }: Params) {
  const { date } = await params;
  if (!validDate(date)) return {};
  const lang = await getLang();
  const d = longDate(date, lang);
  return pageMetadata({ lang, title: T[lang].title(d), description: T[lang].description(d), path: `/lucky-days/day/${date}`, noindex: !inWindow(date) });
}

export default async function AlmanacDayPage({ params }: Params) {
  const { date } = await params;
  if (!validDate(date)) notFound();
  const lang = await getLang();
  const t = T[lang];
  const km = lang === "km";
  const traditions = await chosenTraditions();
  const a = almanacDay(date);
  const k = traditions.includes("khmer") ? khmerDay(date) : null;
  const y = Number(date.slice(0, 4)), m = Number(date.slice(5, 7));
  const monthHref = `/lucky-days/${date.slice(0, 4)}/${date.slice(5, 7)}`;
  const prev = addDays(date, -1), next = addDays(date, 1);
  const title = fullDate(date, lang);
  const list = (x: string[]) => (x.length ? x.join(km ? " · " : ", ") : t.nothing);

  return (
    <>
      <Breadcrumbs items={[{ name: t.crumb, href: "/lucky-days" }, { name: monthLabel(y, m, lang), href: monthHref }, { name: longDate(date, lang), href: `/lucky-days/day/${date}` }]} />
      <div className="mx-auto max-w-reading safe-x py-5 box-content">
        <nav aria-label={t.dayNav} className="flex justify-between text-small">
          {validDate(prev) ? <Link className="link inline-flex min-h-tap items-center gap-1" href={`/lucky-days/day/${prev}`} rel="prev"><Glyph name="chevron-left" set="ui" className="size-4" />{t.prev}</Link> : <span />}
          {validDate(next) ? <Link className="link inline-flex min-h-tap items-center gap-1" href={`/lucky-days/day/${next}`} rel="next">{t.next}<Glyph name="chevron-right" set="ui" className="size-4" /></Link> : <span />}
        </nav>
        <h1 className="mt-3 text-h1"><time dateTime={date}>{title}</time></h1>
        <p className="mt-2 flex items-center gap-2 text-muted">{a.quality === "good" && <Seal size="sm" />}{t.quality[a.quality]}</p>

        <dl className="mt-6 grid gap-x-5 gap-y-4 border-t border-rule pt-5 sm:grid-cols-2 tabular">
          <div><dt className="text-small text-muted">{t.lunar}</dt><dd>{km ? a.lunarLabelKm : a.lunarLabel}</dd></div>
          <div><dt className="text-small text-muted">{t.pillar}</dt><dd><span lang="zh">{a.dayPillarHanzi}</span> · <span lang="zh-Latn">{a.dayPillar}</span></dd></div>
          <div><dt className="text-small text-muted">{t.officer}</dt><dd><span lang="zh">{a.officer.hanzi}</span> · {km ? a.officer.km : a.officer.en}</dd></div>
          <div><dt className="text-small text-muted">{t.spirit}</dt><dd><span lang="zh">{a.spirit.hanzi}</span> · {km ? a.spirit.km : a.spirit.en} ({a.spirit.auspicious ? t.spiritGood : t.spiritPlain})</dd></div>
        </dl>

        <section className="mt-6 border-t border-rule pt-5" aria-labelledby="day-lists">
          <h2 id="day-lists" className="sr-only">{t.goodFor} · {t.avoid}</h2>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div><dt className="font-semibold">{t.goodFor}</dt><dd className="mt-1">{list(km ? a.goodKm : a.good)}</dd></div>
            <div><dt className="font-semibold">{t.avoid}</dt><dd className="mt-1">{list(km ? a.avoidKm : a.avoid)}</dd></div>
          </dl>
        </section>

        <section className="mt-6 border-t border-rule pt-5" aria-labelledby="day-clash">
          <h2 id="day-clash" className="text-h3">{t.clashH}</h2>
          <p className="mt-2">{t.clashA}<Link className="link" href={`/chinese-zodiac/${a.clash.slug}`}>{km ? animalName(a.clash.slug, lang) : a.clash.name}</Link>{t.clashB}</p>
          <p className="mt-1 text-small text-muted">{t.clashNote}</p>
        </section>

        {k && (
          <section className="mt-6 border-t border-rule pt-5" aria-labelledby="day-khmer">
            <h2 id="day-khmer" className="text-h3">{t.khmerH}</h2>
            <p lang="km" className="serif mt-2">{k.labelKm}</p>
            {!km && <p className="text-small text-muted">{t.khmerEn(k.labelEn)}</p>}
            {k.sila && <p className="mt-1 text-small">{t.holy}</p>}
            {k.festival && (km
              ? <p className="mt-2 font-semibold">{k.festival.km}</p>
              : <p className="mt-2 font-semibold">{k.festival.en} <span lang="km" className="font-normal">{k.festival.km}</span></p>)}
          </section>
        )}

        <p className="mt-6 border-t border-rule pt-5">
          <Link className="link" href={monthHref}>{t.month(monthLabel(y, m, lang))}</Link> · <Link className="link" href="/lucky-days/finder">{t.finder}</Link> · <Link className="link" href="/good-hours">{t.hours}</Link>
        </p>
        <p className="mt-4 text-small text-muted">{t.note}</p>
      </div>
    </>
  );
}
