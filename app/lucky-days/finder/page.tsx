/**
 * Lucky-date finder (docs/research/FEATURES.md #9, DESIGN_SYSTEM.md §6.17).
 * Searches the Chinese almanac only; Khmer good-day picking is deliberately not
 * built (CLAUDE.md owner rules). A GET form: results have a URL and need no JS.
 */
import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import Seal from "@/components/Seal";
import { findLuckyDays, OCCASIONS, type FinderResult } from "@/lib/luckyFinder";
import { ANIMALS } from "@/lib/chinese";
import { fullDate, monthName } from "@/lib/dates";
import { getLang } from "@/lib/langServer";
import { defineMessages } from "@/lib/i18n";
import { today } from "@/lib/today";
import { pageMetadata } from "@/lib/seo";
import { CALENDAR_YEARS } from "@/lib/site";

export const dynamic = "force-dynamic";

const T = defineMessages({
  en: {
    title: "Find a lucky date: moving, weddings, opening a business",
    description: "Search the traditional Chinese almanac for days it lists as favourable for moving house, a wedding, opening a business, travel and more, leaving out days that clash with your family's animal signs.",
    lucky: "Lucky days", h1: "Find a lucky date",
    intro: "Search the traditional Chinese almanac for the days it lists as favourable for an occasion.",
    occasion: "Occasion", choose: "Choose an occasion", from: "Starting month", search: "Search",
    months: (l: number) => (l === 1 ? "1 month" : `${l} months`),
    people: "People involved", optional: "(optional)",
    peopleNote: "Days that clash with these animal signs are left out, as the almanac advises.",
    personLabel: (n: number) => `Person ${n} born in the Year of`,
    anySign: (n: number) => `Person ${n}: any sign`,
    submit: "Find lucky dates",
    count: (n: number) => (n === 0 ? "no days found" : n === 1 ? "1 day" : `${n} days`),
    days: (n: number) => (n === 1 ? "1 day" : `${n} days`),
    range: (from: string, to: string) => `${from} to the end of ${to}`,
    leaving: (names: string) => `, leaving out days that clash with the ${names}`,
    or: " or ", end: ".",
    none: "The almanac lists no suitable days in this range.",
    longer: (n: number) => `Search ${n} months instead`,
    later: " Try a later starting month.",
    sealNote: "Every day below suits the occasion. The seal marks days the calendar also counts as good overall.",
    good: "Good day",
    listed: (matched: string, pillar: string, officer: string) => `Listed for: ${matched}. Day ${pillar}, officer ${officer} `,
    spiritDay: (spirit: string, clash: string) => `, ${spirit} day. Clashes with the ${clash}.`,
    how: "How the finder works",
    how1: "Each day in the Chinese almanac (the tong shu) lists activities it favours and activities to avoid. The finder keeps the days that favour your occasion, do not also list it to avoid, are not marked as challenging, and do not clash with the animal signs you chose.",
    how2: "This is a cultural tradition, not a guarantee. For a wedding or a new home, many families also ask a monk, an achar or an almanac master, and choose the day that suits the people involved.",
  },
});

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/lucky-days/finder" });
}

type Search = { searchParams: Promise<{ occasion?: string; from?: string; months?: string; a1?: string; a2?: string }> };
const LENGTHS = [1, 3, 6];

export default async function Finder({ searchParams }: Search) {
  const sp = await searchParams;
  const lang = await getLang();
  const t = T[lang];
  const now = await today();
  const occasion = OCCASIONS.find((o) => o.slug === sp.occasion);
  const fromMonth = sp.from && /^\d{4}-\d{2}$/.test(sp.from) && Number(sp.from.slice(5)) >= 1 && Number(sp.from.slice(5)) <= 12 &&
    Number(sp.from.slice(0, 4)) >= CALENDAR_YEARS.min && Number(sp.from.slice(0, 4)) <= CALENDAR_YEARS.max ? sp.from : now.slice(0, 7);
  const months = LENGTHS.includes(Number(sp.months)) ? Number(sp.months) : 3;
  const animals = [sp.a1, sp.a2].filter((a): a is string => !!a && ANIMALS.some((x) => x.slug === a));
  const [fy, fm] = fromMonth.split("-").map(Number);
  const start = fromMonth === now.slice(0, 7) ? now : `${fromMonth}-01`;
  // Never search past the last supported year: from December 2100 a 3- or
  // 6-month range reached 2101, where the Lunar New Year table ends and the
  // almanac throws (a 500 on a public page).
  const endExclusive = new Date(Math.min(Date.UTC(fy, fm - 1 + months, 1), Date.UTC(CALENDAR_YEARS.max + 1, 0, 1)));
  const days = Math.round((endExclusive.getTime() - Date.parse(`${start}T00:00:00Z`)) / 86400000);
  const results = occasion ? findLuckyDays({ occasion, from: start, days, avoidAnimals: animals }) : null;
  const longer = LENGTHS.find((l) => l > months);
  const params = (m: number) => `/lucky-days/finder?occasion=${occasion?.slug}&from=${fromMonth}&months=${m}${animals.map((a, i) => `&a${i + 1}=${a}`).join("")}`;
  const animalName = (slug: string) => (ANIMALS.find((a) => a.slug === slug)!.name);
  const lastM = endExclusive.getUTCMonth() === 0 ? 12 : endExclusive.getUTCMonth();
  const lastY = endExclusive.getUTCMonth() === 0 ? endExclusive.getUTCFullYear() - 1 : endExclusive.getUTCFullYear();
  const my = (y: number, m: number) => (`${monthName(m)} ${y}`);
  const rangeLabel = t.range(fullDate(start), my(lastY, lastM));

  return (
    <>
      <Breadcrumbs items={[{ name: t.lucky, href: "/lucky-days" }, { name: t.h1, href: "/lucky-days/finder" }]} />
      <div className="mx-auto max-w-reading safe-x py-5">
        <h1 className="text-h1">{t.h1}</h1>
        <p className="mt-2 text-muted">{t.intro}</p>

        <form method="get" action="/lucky-days/finder" className="mt-6 flex flex-col gap-5">
          <div>
            <label className="label" htmlFor="f-occ">{t.occasion}</label>
            <select className="field" id="f-occ" name="occasion" defaultValue={occasion?.slug ?? ""} required>
              <option value="" disabled>{t.choose}</option>
              {OCCASIONS.map((o) => <option key={o.slug} value={o.slug}>{o.label}</option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="f-from">{t.from}</label>
              <input className="field tabular" type="month" id="f-from" name="from" defaultValue={fromMonth} min={`${CALENDAR_YEARS.min}-01`} max={`${CALENDAR_YEARS.max}-12`} />
            </div>
            <div>
              <label className="label" htmlFor="f-len">{t.search}</label>
              <select className="field" id="f-len" name="months" defaultValue={String(months)}>
                {LENGTHS.map((l) => <option key={l} value={l}>{t.months(l)}</option>)}
              </select>
            </div>
          </div>
          <fieldset>
            <legend className="label">{t.people} <span className="font-normal text-muted">{t.optional}</span></legend>
            <p className="mb-3 text-small text-muted">{t.peopleNote}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((n) => (
                <div key={n}>
                  <label className="sr-only" htmlFor={`f-a${n}`}>{t.personLabel(n)}</label>
                  <select className="field" id={`f-a${n}`} name={`a${n}`} defaultValue={animals[n - 1] ?? ""}>
                    <option value="">{t.anySign(n)}</option>
                    {ANIMALS.map((a) => <option key={a.slug} value={a.slug}>{`Year of the ${a.name}`}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </fieldset>
          <div><button type="submit" className="btn-primary">{t.submit}</button></div>
        </form>

        {results && occasion && (
          <section className="mt-8" aria-labelledby="res-h" aria-live="polite">
            <h2 id="res-h" className="text-h2">{occasion.label}: {t.count(results.length)}</h2>
            <p className="mt-2 text-small text-muted">
              {rangeLabel}{animals.length ? t.leaving(animals.map(animalName).join(t.or)) : ""}{t.end}
            </p>
            {results.length === 0 ? (
              <p className="mt-4">{t.none}{longer ? <> <Link className="link" href={params(longer)}>{t.longer(longer)}</Link>{t.end}</> : t.later}</p>
            ) : (
              <>
                <p className="mt-3 flex items-center gap-2 text-small text-muted"><Seal size="sm" />{t.sealNote}</p>
                {byMonth(results).map(([month, rows], i) => (
                  <details key={month} className="mt-4 border-t border-rule" open={i === 0}>
                    <summary className="flex min-h-tap cursor-pointer items-center justify-between py-3 font-semibold">
                      <span>{my(Number(month.slice(0, 4)), Number(month.slice(5)))}</span>
                      <span className="text-small font-normal text-muted">{t.days(rows.length)}</span>
                    </summary>
                    <ul>
                      {rows.map(({ day, matched }) => (
                        <li key={day.date} className="border-t border-rule py-4">
                          <div className="flex items-baseline justify-between gap-3">
                            <Link className="link font-semibold" href={`/lucky-days/${day.date.slice(0, 4)}/${day.date.slice(5, 7)}`}>{fullDate(day.date, lang)}</Link>
                            {day.quality === "good" && <span className="flex shrink-0 items-center gap-2 text-small"><Seal size="sm" />{t.good}</span>}
                          </div>
                          <p className="mt-1 text-small text-muted">
                            {t.listed(matched.join(", "), day.dayPillar, day.officer.en)}(<span lang="zh">{day.officer.hanzi}</span>){t.spiritDay(day.spirit.en, day.clash.name)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </>
            )}
          </section>
        )}

        <section className="mt-8" aria-labelledby="about-h">
          <h2 id="about-h" className="text-h3">{t.how}</h2>
          <div className="reading mt-3 text-body">
            <p>{t.how1}</p>
            <p>{t.how2}</p>
          </div>
        </section>
      </div>
    </>
  );
}

/** Results grouped by month, in date order (§6.17: long lists stay calm). */
function byMonth(results: FinderResult[]): Array<[string, FinderResult[]]> {
  const groups = new Map<string, FinderResult[]>();
  for (const r of results) {
    const key = r.day.date.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups];
}
