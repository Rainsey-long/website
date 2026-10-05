/**
 * "This week in the sky": one digest per Monday (UTC Monday to Monday, like
 * the weekly horoscopes). Moon phases and sign changes (lib/skyEvents.ts),
 * planet sign changes, stations and eclipses (lib/weekly.ts weekSkyEvents),
 * and, for the traditions the visitor shows, Khmer holy days and festivals
 * and the Chinese almanac's good days. Every line is computed; no reading
 * text. Any week 1900–2100 renders; a week whose sky years are not cached
 * is charged against the site-wide sky-year ceiling.
 */
import Link from "@/components/client/LocaleLink";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import Seal from "@/components/Seal";
import { eclipseName, moonIngresses, moonPhases, phaseName, planetNameIn, signNameIn, skyYearsAvailable } from "@/lib/skyEvents";
import { mondayOf, weekSkyEvents, weekSkyYears, type SkyWeekEvent } from "@/lib/weekly";
import { validWeek } from "@/lib/weeklyMeta";
import { almanacDay } from "@/lib/almanac";
import { khmerDay } from "@/lib/khmer";
import { addDays, fromKey, fullDate, weekRange, weekdayName } from "@/lib/dates";
import { dateTimeIn, zoneLabel } from "@/lib/format";
import { getLang } from "@/lib/langServer";
import { defineMessages, type Lang } from "@/lib/i18n";
import { chosenTraditions } from "@/lib/traditionsServer";
import { pageMetadata } from "@/lib/seo";
import { DEFAULT_TZ } from "@/lib/site";
import { dateInZone, visitorZone } from "@/lib/today";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ monday: string }> };

const T = defineMessages({
  en: {
    title: (r: string) => `This week in the sky, ${r}`,
    description: (r: string) => `The sky for ${r}: Moon phases and sign changes, planets changing sign or direction, eclipses, Khmer holy days and the Chinese almanac's good days.`,
    sky: "Sky", weekNav: "Week", prev: "Previous week", next: "Next week",
    h1: "This week in the sky",
    zone: (z: string) => `Times in ${z} time. The week runs Monday to Sunday in universal time.`,
    phases: "Moon phases", noPhase: "No new, full or quarter Moon falls this week.",
    phaseLine: (p: string, s: string) => `${p} in ${s}`,
    moonSigns: "The Moon changes sign",
    moonLine: (s: string) => `The Moon enters ${s}`,
    planets: "Planets", none: "No planet changes sign or direction this week.",
    ingress: (p: string, s: string) => `${p} moves into ${s}.`,
    rx: (p: string, s: string) => `${p} turns retrograde in ${s}. A time to review, not to fear.`,
    direct: (p: string, s: string) => `${p} turns direct in ${s}.`,
    eclipse: (n: string, s: string) => `${n} in ${s}.`,
    khmer: "Khmer holy days and festivals", noKhmer: "No holy day or festival this week.",
    holy: "Buddhist holy day",
    chinese: "Good days by the Chinese almanac", noChinese: "The almanac marks no especially good day this week.",
    moonCal: "Moon calendar", rxCal: "Retrogrades and eclipses", terms: "The 24 solar terms", feeds: "Add these dates to your calendar",
    note: "Calculated with astronomy-engine. For entertainment and reflection.",
    busy: "This page is busy right now. Try this week again in a few minutes.",
  },
  km: {
    title: (r: string) => `មេឃសប្ដាហ៍នេះ ${r}`,
    description: (r: string) => `មេឃសម្រាប់${r}៖ ដំណាក់កាលព្រះចន្ទ និងការប្ដូររាសី ភពប្ដូររាសី ឬប្ដូរទិសដៅ គ្រាស ថ្ងៃសីល និងថ្ងៃល្អតាមប្រតិទិនចិន។`,
    sky: "មេឃ", weekNav: "សប្ដាហ៍", prev: "សប្ដាហ៍មុន", next: "សប្ដាហ៍បន្ទាប់",
    h1: "មេឃសប្ដាហ៍នេះ",
    zone: (z: string) => `ម៉ោងគិតតាមម៉ោង ${z}។ សប្ដាហ៍រាប់ពីថ្ងៃច័ន្ទដល់ថ្ងៃអាទិត្យ តាមម៉ោងសកល។`,
    phases: "ដំណាក់កាលព្រះចន្ទ", noPhase: "សប្ដាហ៍នេះគ្មានព្រះចន្ទងងឹត ព្រះចន្ទពេញវង់ ឬព្រះចន្ទកន្លះទេ។",
    phaseLine: (p: string, s: string) => `${p} ក្នុងរាសី${s}`,
    moonSigns: "ព្រះចន្ទប្ដូររាសី",
    moonLine: (s: string) => `ព្រះចន្ទចូលរាសី${s}`,
    planets: "ភពនានា", none: "សប្ដាហ៍នេះគ្មានភពណាប្ដូររាសី ឬប្ដូរទិសដៅទេ។",
    ingress: (p: string, s: string) => `${p}ចូលរាសី${s}។`,
    rx: (p: string, s: string) => `${p}ចាប់ផ្ដើមដើរថយក្រោយក្នុងរាសី${s}។ ជាពេលសម្រាប់ពិនិត្យឡើងវិញ មិនមែនសម្រាប់ភ័យខ្លាចទេ។`,
    direct: (p: string, s: string) => `${p}ដើរទៅមុខវិញក្នុងរាសី${s}។`,
    eclipse: (n: string, s: string) => `${n}ក្នុងរាសី${s}។`,
    khmer: "ថ្ងៃសីល និងពិធីបុណ្យខ្មែរ", noKhmer: "សប្ដាហ៍នេះគ្មានថ្ងៃសីល ឬពិធីបុណ្យទេ។",
    holy: "ថ្ងៃសីល",
    chinese: "ថ្ងៃល្អតាមប្រតិទិនចិន", noChinese: "សប្ដាហ៍នេះ ប្រតិទិនមិនបានកំណត់ថ្ងៃល្អពិសេសណាមួយទេ។",
    moonCal: "ប្រតិទិនព្រះចន្ទ", rxCal: "ភពដើរថយក្រោយ និងគ្រាស", terms: "រដូវកាលព្រះអាទិត្យទាំង ២៤", feeds: "បន្ថែមកាលបរិច្ឆេទទាំងនេះទៅប្រតិទិនរបស់អ្នក",
    note: "គណនាដោយ astronomy-engine។ សម្រាប់ការកម្សាន្ត និងការឆ្លុះបញ្ចាំង។",
    busy: "ទំព័រនេះរវល់បន្តិចឥឡូវនេះ។ សូមព្យាយាមម្ដងទៀតក្នុងពេលបន្តិចទៀត។",
  },
});

/** Indexed: the last eight weeks and the next four. */
function inWindow(monday: string): boolean {
  const now = mondayOf(dateInZone(DEFAULT_TZ));
  return monday >= addDays(now, -56) && monday <= addDays(now, 28);
}

function eventLine(e: SkyWeekEvent, lang: Lang): string {
  const t = T[lang];
  const sign = signNameIn(e.signIndex, lang);
  if (e.kind === "eclipse") return t.eclipse(eclipseName({ kind: e.eclipseKind!, body: e.body as "sun" | "moon" }, lang), sign);
  const planet = planetNameIn(e.body as Exclude<SkyWeekEvent["body"], "sun" | "moon">, lang);
  if (e.kind === "ingress") return t.ingress(planet, sign);
  return e.kind === "station-rx" ? t.rx(planet, sign) : t.direct(planet, sign);
}

export async function generateMetadata({ params }: Params) {
  const { monday } = await params;
  if (!validWeek(monday)) return {};
  const lang = await getLang();
  const r = weekRange(monday, lang);
  return pageMetadata({ lang, title: T[lang].title(r), description: T[lang].description(r), path: `/sky/week/${monday}`, noindex: !inWindow(monday) });
}

const row = "grid gap-1 border-t border-rule py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-baseline sm:gap-5";

export default async function SkyWeek({ params }: Params) {
  const { monday } = await params;
  if (!validWeek(monday)) notFound();
  const lang = await getLang();
  const t = T[lang];
  const km = lang === "km";
  const range = weekRange(monday, lang);
  if (!skyYearsAvailable(weekSkyYears(monday))) {
    return <div className="mx-auto max-w-reading safe-x py-7"><h1 className="text-h1">{t.h1}</h1><p className="mt-3">{t.busy}</p></div>;
  }
  const tz = await visitorZone();
  const traditions = await chosenTraditions();
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const from = `${monday}T00:00:00.000Z`, to = `${addDays(monday, 7)}T00:00:00.000Z`;
  const phases = moonPhases(from, to);
  const ingresses = moonIngresses(from, to);
  const events = weekSkyEvents(monday);
  const khmer = traditions.includes("khmer") ? days.map((d) => khmerDay(d)).filter((k) => k.sila || k.festival) : null;
  const chinese = traditions.includes("chinese") ? days.map((d) => almanacDay(d)).filter((a) => a.quality === "good") : null;
  const prev = addDays(monday, -7), next = addDays(monday, 7);
  const dayName = (d: string) => weekdayName(fromKey(d).getUTCDay(), lang);

  return (
    <>
      <Breadcrumbs items={[{ name: t.sky, href: "/sky" }, { name: range, href: `/sky/week/${monday}` }]} />
      <div className="mx-auto max-w-reading safe-x py-5 box-content">
        <nav aria-label={t.weekNav} className="flex justify-between text-small">
          {validWeek(prev) ? <Link className="link inline-flex min-h-tap items-center gap-1" href={`/sky/week/${prev}`} rel="prev"><Glyph name="chevron-left" set="ui" className="size-4" />{t.prev}</Link> : <span />}
          {validWeek(next) ? <Link className="link inline-flex min-h-tap items-center gap-1" href={`/sky/week/${next}`} rel="next">{t.next}<Glyph name="chevron-right" set="ui" className="size-4" /></Link> : <span />}
        </nav>
        <h1 className="mt-3 text-h1">{t.h1}</h1>
        <p className="mt-2 text-muted"><time dateTime={monday}>{range}</time></p>
        <p className="mt-1 text-small text-muted">{t.zone(zoneLabel(tz))}</p>

        {/* The sky sections are Western; with Western readings off the Khmer and
            Chinese calendar lead (UI review 2026-10-05). */}
        <div className="mt-6">
        {traditions.includes("western") ? <>
        <section className="border-t border-rule py-5" aria-labelledby="sw-phases">
          <h2 id="sw-phases" className="text-h3">{t.phases}</h2>
          {phases.length === 0 ? <p className="mt-3">{t.noPhase}</p> : (
            <ul className="mt-3">{phases.map((p) => (
              <li key={p.at} className={row}><span className="text-small font-semibold tabular"><time dateTime={p.at}>{dateTimeIn(p.at, tz, lang)}</time></span><span>{t.phaseLine(phaseName(p, lang), signNameIn(p.signIndex, lang))}</span></li>
            ))}</ul>
          )}
        </section>

        <section className="border-t border-rule py-5" aria-labelledby="sw-moon">
          <h2 id="sw-moon" className="text-h3">{t.moonSigns}</h2>
          <ul className="mt-3">{ingresses.map((m) => (
            <li key={m.at} className={row}><span className="text-small font-semibold tabular"><time dateTime={m.at}>{dateTimeIn(m.at, tz, lang)}</time></span><span>{t.moonLine(signNameIn(m.signIndex, lang))}</span></li>
          ))}</ul>
        </section>

        <section className="border-t border-rule py-5" aria-labelledby="sw-planets">
          <h2 id="sw-planets" className="text-h3">{t.planets}</h2>
          {events.length === 0 ? <p className="mt-3">{t.none}</p> : (
            <ul className="mt-3">{events.map((e) => (
              <li key={`${e.kind}-${e.body}-${e.date}`} className={row}><span className="text-small font-semibold">{dayName(e.date)}</span><span>{eventLine(e, lang)}</span></li>
            ))}</ul>
          )}
        </section>

        {khmer && (
          <section className="border-t border-rule py-5" aria-labelledby="sw-khmer">
            <h2 id="sw-khmer" className="text-h3">{t.khmer}</h2>
            {khmer.length === 0 ? <p className="mt-3">{t.noKhmer}</p> : (
              <ul className="mt-3">{khmer.map((k) => (
                <li key={k.date} className={row}>
                  <span className="text-small font-semibold">{fullDate(k.date, lang)}</span>
                  <span>
                    <span lang="km">{k.labelKmShort}</span>
                    {k.sila && <> · {t.holy}{km ? "" : <> (<span lang="km">ថ្ងៃសីល</span>)</>}</>}
                    {k.festival && <> · <span className="font-semibold">{km ? k.festival.km : k.festival.en}</span></>}
                  </span>
                </li>
              ))}</ul>
            )}
          </section>
        )}

        {chinese && (
          <section className="border-t border-rule py-5" aria-labelledby="sw-chinese">
            <h2 id="sw-chinese" className="text-h3">{t.chinese}</h2>
            {chinese.length === 0 ? <p className="mt-3">{t.noChinese}</p> : (
              <ul className="mt-3">{chinese.map((a) => (
                <li key={a.date} className={row}>
                  <span className="text-small font-semibold"><Link className="link inline-flex min-h-tap items-center gap-2" href={`/lucky-days/day/${a.date}`}><Seal size="sm" />{dayName(a.date)}</Link></span>
                  <span>{(km ? a.goodKm : a.good).slice(0, 4).join(km ? " · " : ", ")}</span>
                </li>
              ))}</ul>
            )}
          </section>
        )}

        </> : <>
        {khmer && (
          <section className="border-t border-rule py-5" aria-labelledby="sw-khmer">
            <h2 id="sw-khmer" className="text-h3">{t.khmer}</h2>
            {khmer.length === 0 ? <p className="mt-3">{t.noKhmer}</p> : (
              <ul className="mt-3">{khmer.map((k) => (
                <li key={k.date} className={row}>
                  <span className="text-small font-semibold">{fullDate(k.date, lang)}</span>
                  <span>
                    <span lang="km">{k.labelKmShort}</span>
                    {k.sila && <> · {t.holy}{km ? "" : <> (<span lang="km">ថ្ងៃសីល</span>)</>}</>}
                    {k.festival && <> · <span className="font-semibold">{km ? k.festival.km : k.festival.en}</span></>}
                  </span>
                </li>
              ))}</ul>
            )}
          </section>
        )}

        {chinese && (
          <section className="border-t border-rule py-5" aria-labelledby="sw-chinese">
            <h2 id="sw-chinese" className="text-h3">{t.chinese}</h2>
            {chinese.length === 0 ? <p className="mt-3">{t.noChinese}</p> : (
              <ul className="mt-3">{chinese.map((a) => (
                <li key={a.date} className={row}>
                  <span className="text-small font-semibold"><Link className="link inline-flex min-h-tap items-center gap-2" href={`/lucky-days/day/${a.date}`}><Seal size="sm" />{dayName(a.date)}</Link></span>
                  <span>{(km ? a.goodKm : a.good).slice(0, 4).join(km ? " · " : ", ")}</span>
                </li>
              ))}</ul>
            )}
          </section>
        )}

        <section className="border-t border-rule py-5" aria-labelledby="sw-phases">
          <h2 id="sw-phases" className="text-h3">{t.phases}</h2>
          {phases.length === 0 ? <p className="mt-3">{t.noPhase}</p> : (
            <ul className="mt-3">{phases.map((p) => (
              <li key={p.at} className={row}><span className="text-small font-semibold tabular"><time dateTime={p.at}>{dateTimeIn(p.at, tz, lang)}</time></span><span>{t.phaseLine(phaseName(p, lang), signNameIn(p.signIndex, lang))}</span></li>
            ))}</ul>
          )}
        </section>

        <section className="border-t border-rule py-5" aria-labelledby="sw-moon">
          <h2 id="sw-moon" className="text-h3">{t.moonSigns}</h2>
          <ul className="mt-3">{ingresses.map((m) => (
            <li key={m.at} className={row}><span className="text-small font-semibold tabular"><time dateTime={m.at}>{dateTimeIn(m.at, tz, lang)}</time></span><span>{t.moonLine(signNameIn(m.signIndex, lang))}</span></li>
          ))}</ul>
        </section>

        <section className="border-t border-rule py-5" aria-labelledby="sw-planets">
          <h2 id="sw-planets" className="text-h3">{t.planets}</h2>
          {events.length === 0 ? <p className="mt-3">{t.none}</p> : (
            <ul className="mt-3">{events.map((e) => (
              <li key={`${e.kind}-${e.body}-${e.date}`} className={row}><span className="text-small font-semibold">{dayName(e.date)}</span><span>{eventLine(e, lang)}</span></li>
            ))}</ul>
          )}
        </section>

        </>}
        </div>

        <p className="border-t border-rule pt-5">
          <Link className="link" href="/sky/moon">{t.moonCal}</Link> · <Link className="link" href="/sky/retrogrades">{t.rxCal}</Link> · <Link className="link" href="/sky/solar-terms">{t.terms}</Link> · <Link className="link" href="/feeds">{t.feeds}</Link>
        </p>
        <p className="mt-4 text-small text-muted">{t.note}</p>
      </div>
    </>
  );
}
