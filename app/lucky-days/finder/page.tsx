/**
 * Lucky-date finder (docs/research/FEATURES.md #9, DESIGN_SYSTEM.md §6.17).
 * Searches the Chinese almanac only; Khmer good-day picking is deliberately not
 * built (CLAUDE.md owner rules). A GET form: results have a URL and need no JS.
 */
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import Seal from "@/components/Seal";
import { findLuckyDays, OCCASIONS, type FinderResult } from "@/lib/luckyFinder";
import { ANIMALS } from "@/lib/chinese";
import { fullDate, monthName } from "@/lib/dates";
import { today } from "@/lib/today";
import { pageMetadata } from "@/lib/seo";
import { CALENDAR_YEARS } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({
  title: "Find a lucky date: moving, weddings, opening a business",
  description: "Search the traditional Chinese almanac for days it lists as favourable for moving house, a wedding, opening a business, travel and more, leaving out days that clash with your family's animal signs.",
  path: "/lucky-days/finder",
});

type Search = { searchParams: Promise<{ occasion?: string; from?: string; months?: string; a1?: string; a2?: string }> };
const LENGTHS = [1, 3, 6];

export default async function Finder({ searchParams }: Search) {
  const sp = await searchParams;
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
  const animalName = (slug: string) => ANIMALS.find((a) => a.slug === slug)!.name;
  const rangeLabel = `${fullDate(start)} to the end of ${monthName(endExclusive.getUTCMonth() === 0 ? 12 : endExclusive.getUTCMonth())} ${endExclusive.getUTCMonth() === 0 ? endExclusive.getUTCFullYear() - 1 : endExclusive.getUTCFullYear()}`;

  return (
    <>
      <Breadcrumbs items={[{ name: "Lucky days", href: "/lucky-days" }, { name: "Find a lucky date", href: "/lucky-days/finder" }]} />
      <div className="mx-auto max-w-reading safe-x py-5">
        <h1 className="text-h1">Find a lucky date</h1>
        <p className="mt-2 text-muted">Search the traditional Chinese almanac for the days it lists as favourable for an occasion.</p>

        <form method="get" action="/lucky-days/finder" className="mt-6 flex flex-col gap-5">
          <div>
            <label className="label" htmlFor="f-occ">Occasion</label>
            <select className="field" id="f-occ" name="occasion" defaultValue={occasion?.slug ?? ""} required>
              <option value="" disabled>Choose an occasion</option>
              {OCCASIONS.map((o) => <option key={o.slug} value={o.slug}>{o.label}</option>)}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="f-from">Starting month</label>
              <input className="field tabular" type="month" id="f-from" name="from" defaultValue={fromMonth} min={`${CALENDAR_YEARS.min}-01`} max={`${CALENDAR_YEARS.max}-12`} />
            </div>
            <div>
              <label className="label" htmlFor="f-len">Search</label>
              <select className="field" id="f-len" name="months" defaultValue={String(months)}>
                {LENGTHS.map((l) => <option key={l} value={l}>{l === 1 ? "1 month" : `${l} months`}</option>)}
              </select>
            </div>
          </div>
          <fieldset>
            <legend className="label">People involved <span className="font-normal text-muted">(optional)</span></legend>
            <p className="mb-3 text-small text-muted">Days that clash with these animal signs are left out, as the almanac advises.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((n) => (
                <div key={n}>
                  <label className="sr-only" htmlFor={`f-a${n}`}>Person {n} born in the Year of</label>
                  <select className="field" id={`f-a${n}`} name={`a${n}`} defaultValue={animals[n - 1] ?? ""}>
                    <option value="">Person {n}: any sign</option>
                    {ANIMALS.map((a) => <option key={a.slug} value={a.slug}>Year of the {a.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </fieldset>
          <div><button type="submit" className="btn-primary">Find lucky dates</button></div>
        </form>

        {results && occasion && (
          <section className="mt-8" aria-labelledby="res-h" aria-live="polite">
            <h2 id="res-h" className="text-h2">{occasion.label}: {results.length === 0 ? "no days found" : results.length === 1 ? "1 day" : `${results.length} days`}</h2>
            <p className="mt-2 text-small text-muted">
              {rangeLabel}{animals.length ? `, leaving out days that clash with the ${animals.map(animalName).join(" or ")}` : ""}.
            </p>
            {results.length === 0 ? (
              <p className="mt-4">The almanac lists no suitable days in this range.{longer ? <> <Link className="link" href={params(longer)}>Search {longer} months instead</Link>.</> : " Try a later starting month."}</p>
            ) : (
              <>
                <p className="mt-3 flex items-center gap-2 text-small text-muted"><Seal size="sm" />Every day below suits the occasion. The seal marks days the calendar also counts as good overall.</p>
                {byMonth(results).map(([month, rows], i) => (
                  <details key={month} className="mt-4 border-t border-rule" open={i === 0}>
                    <summary className="flex min-h-tap cursor-pointer items-center justify-between py-3 font-semibold">
                      <span>{monthName(Number(month.slice(5)))} {month.slice(0, 4)}</span>
                      <span className="text-small font-normal text-muted">{rows.length === 1 ? "1 day" : `${rows.length} days`}</span>
                    </summary>
                    <ul>
                      {rows.map(({ day, matched }) => (
                        <li key={day.date} className="border-t border-rule py-4">
                          <div className="flex items-baseline justify-between gap-3">
                            <Link className="link font-semibold" href={`/lucky-days/${day.date.slice(0, 4)}/${day.date.slice(5, 7)}`}>{fullDate(day.date)}</Link>
                            {day.quality === "good" && <span className="flex shrink-0 items-center gap-2 text-small"><Seal size="sm" />Good day</span>}
                          </div>
                          <p className="mt-1 text-small text-muted">
                            Listed for: {matched.join(", ")}. Day {day.dayPillar}, officer {day.officer.en} (<span lang="zh">{day.officer.hanzi}</span>), {day.spirit.en} day. Clashes with the {day.clash.name}.
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
          <h2 id="about-h" className="text-h3">How the finder works</h2>
          <div className="reading mt-3 text-body">
            <p>Each day in the Chinese almanac (the tong shu) lists activities it favours and activities to avoid. The finder keeps the days that favour your occasion, do not also list it to avoid, are not marked as challenging, and do not clash with the animal signs you chose.</p>
            <p>This is a cultural tradition, not a guarantee. For a wedding or a new home, many families also ask a monk, an achar or an almanac master, and choose the day that suits the people involved.</p>
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
