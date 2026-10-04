/**
 * Good hours (docs/research/FEATURES.md #8, DESIGN_SYSTEM.md §6.15): Chinese
 * double-hours from the almanac and Western planetary hours from local sunrise,
 * for a chosen city and day. A GET form, so it works without JavaScript and
 * every view has a URL.
 */
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import Seal from "@/components/Seal";
import { chineseHours, planetaryHours, PLANET_HOUR } from "@/lib/goodHours";
import { almanacDay } from "@/lib/almanac";
import { CITIES, cityBySlug, cityForZone } from "@/lib/cities";
import { addDays, fullDate } from "@/lib/dates";
import { dateInZone, visitorZone } from "@/lib/today";
import { timeIn } from "@/lib/format";
import { chosenTraditions } from "@/lib/traditionsServer";
import { pageMetadata } from "@/lib/seo";
import { CALENDAR_YEARS } from "@/lib/site";
import { nowIso } from "@/lib/clock";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({
  title: "Good hours today: Chinese lucky hours and planetary hours",
  description: "Today's good and quiet hours from the Chinese almanac, and the planetary hours counted from sunrise in your city.",
  path: "/good-hours",
});

type Search = { searchParams: Promise<{ city?: string; date?: string }> };

const validDate = (d: string | undefined) =>
  !!d && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`)) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d &&
  Number(d.slice(0, 4)) >= CALENDAR_YEARS.min && Number(d.slice(0, 4)) <= CALENDAR_YEARS.max;

const toMin = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));

export default async function GoodHours({ searchParams }: Search) {
  const sp = await searchParams;
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
      <Breadcrumbs items={[{ name: "Good hours", href: "/good-hours" }]} />
      <div className="mx-auto max-w-page safe-x py-5">
        <h1 className="text-h1">Good hours</h1>
        <p className="mt-2 text-muted">{fullDate(date)} in {city.name}, {city.country}. Times are local clock time there.</p>

        <form method="get" action="/good-hours" className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] sm:items-end">
          <div>
            <label className="label" htmlFor="gh-city">City</label>
            <select className="field" id="gh-city" name="city" defaultValue={city.slug}>
              {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}, {c.country}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="gh-date">Day</label>
            <input className="field tabular" type="date" id="gh-date" name="date" defaultValue={date} min={`${CALENDAR_YEARS.min}-01-01`} max={`${CALENDAR_YEARS.max}-12-31`} />
          </div>
          <div><button type="submit" className="btn-secondary">Show hours</button></div>
        </form>

        <nav aria-label="Day" className="mt-5 flex justify-between text-small">
          <Link className="link inline-flex min-h-tap items-center gap-1" href={q(prev)} rel="prev"><Glyph name="chevron-left" set="ui" className="size-4" />Previous day</Link>
          <Link className="link inline-flex min-h-tap items-center gap-1" href={q(next)} rel="next">Next day<Glyph name="chevron-right" set="ui" className="size-4" /></Link>
        </nav>

        {unknownCity && <p className="mt-4 border border-rule p-4 text-small">That city is not on our list, so this shows {city.name}. Choose the nearest large city above.</p>}

        {neither && <p className="mt-4 border border-rule p-4 text-small">Good hours come from the Chinese and Western traditions, so both are shown here.</p>}

        <div className={`mt-6 grid gap-7 ${showChinese && showWestern ? "lg:grid-cols-2" : ""}`}>
          {showChinese && day && (
            <section aria-labelledby="ch-h">
              <h2 id="ch-h" className="text-h2">Chinese hours</h2>
              <p className="mt-2 text-small text-muted">
                Day {day.dayPillar} ({day.dayPillarHanzi}). Each two-hour block is ruled by one of twelve spirits; six are counted as good hours (黄道).
              </p>
              <ul className="mt-4">
                {chinese.map((h) => {
                  const current = isToday && toMin(nowHm) >= toMin(h.start) && toMin(nowHm) < toMin(h.end);
                  return (
                    <li key={h.start} className={`flex min-h-tap flex-wrap items-center gap-x-3 gap-y-1 border-b border-rule px-2 py-2 ${current ? "rounded-sm outline outline-1 outline-cinnabar" : ""}`} aria-current={current ? "time" : undefined}>
                      <span className="tabular shrink-0">{h.start}–{h.end}</span>
                      <span className="min-w-0 flex-1">
                        {h.animal.name} hour <span lang="zh">{h.branchHanzi}</span>
                        <span className="block text-small text-muted">{h.spirit}. Clashes with the {h.clash.name}.</span>
                      </span>
                      <span className="flex w-full shrink-0 items-center justify-end gap-2 text-small sm:w-auto">
                        {current && <span className="font-semibold">Now</span>}
                        {h.good ? <><Seal size="sm" />Good hour</> : <span className="text-muted">Quiet hour</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {showWestern && planetary && (
            <section aria-labelledby="pl-h">
              <h2 id="pl-h" className="text-h2">Planetary hours</h2>
              <p className="mt-2 text-small text-muted">
                {planetary.fallback
                  ? "The Sun does not both rise and set here on this day, so these are 24 equal hours from 06:00."
                  : `Sunrise ${timeIn(planetary.sunrise!, city.tz)}, sunset ${timeIn(planetary.sunset!, city.tz)}. Daylight and night are each split into twelve equal hours, ruled in turn by the seven classical planets.`}
              </p>
              <ul className="mt-4">
                {planetary.hours.map((h) => {
                  const current = h.start <= now && now < h.end;
                  const p = PLANET_HOUR[h.planet];
                  return (
                    <li key={h.start} className={`flex min-h-tap items-center gap-3 border-b border-rule px-2 py-2 ${current ? "rounded-sm outline outline-1 outline-cinnabar" : ""}`} aria-current={current ? "time" : undefined}>
                      <span className="tabular shrink-0">{timeIn(h.start, city.tz)}–{timeIn(h.end, city.tz)}</span>
                      <Glyph name={h.planet} set="planet" className="size-5 shrink-0" />
                      <span className="flex-1">
                        {p.name} hour{h.night ? <span className="text-muted"> · night</span> : null}
                        <span className="block text-small text-muted">Good for {p.theme}.</span>
                      </span>
                      {current && <span className="shrink-0 text-small font-semibold">Now</span>}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        <section className="mt-8 max-w-reading" aria-labelledby="how-h">
          <h2 id="how-h" className="text-h3">How these hours work</h2>
          <div className="reading mt-3 text-body">
            <p>The Chinese almanac divides the day into twelve two-hour blocks named after the zodiac animals. Each day, a fixed rule decides which spirit rules each block; the six good ones are traditionally chosen for starting important things. The Rat hour is split at midnight, so a day shows thirteen rows.</p>
            <p>Planetary hours are a Western tradition: the first hour after sunrise belongs to the planet that names the weekday (the Sun on Sunday, the Moon on Monday), and the rest follow the old order Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon.</p>
            <p>Both are cultural traditions to enjoy and reflect on, not instructions.</p>
          </div>
        </section>
      </div>
    </>
  );
}

