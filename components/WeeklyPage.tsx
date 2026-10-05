/**
 * Weekly horoscope page body (DESIGN_SYSTEM.md §7.7), shared by
 * /horoscope/[sign]/week (this week) and /horoscope/[sign]/week/[monday].
 * The reading comes from lib/weekly.ts; every line here is computed from the
 * sky or chosen from the reviewed text blocks.
 */
import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "./Breadcrumbs";
import Glyph from "./Glyph";
import JsonLd from "./JsonLd";
import RelatedLinks from "./RelatedLinks";
import { AdSlot } from "./Monetize";
import Share from "@/components/client/Share";
import Feedback from "@/components/client/Feedback";
import { weeklyReading, type WeekEvent } from "@/lib/weekly";
import { blockTexts } from "@/lib/blockText";
import { HOUSE_THEME, TOPIC_LABEL, TOPICS } from "@/lib/reading-engine";
import { addDays, fromKey, fullDate, weekRange, weekdayName } from "@/lib/dates";
import { eclipseName, phaseName, planetNameIn, signNameIn, skyYearsAvailable } from "@/lib/skyEvents";
import { absolute, articleLd } from "@/lib/seo";
import { getLang } from "@/lib/langServer";
import { defineMessages, type Lang } from "@/lib/i18n";
import { signName } from "@/lib/names";
import { SIGNS, type WesternSign } from "@/lib/western";
import { CALENDAR_YEARS } from "@/lib/site";

const T = defineMessages({
  en: {
    crumb: "Horoscopes", week: "This week", weekNav: "Week", prev: "Previous week", next: "Next week",
    h1: (s: string) => `${s} weekly horoscope`,
    overview: "The week ahead",
    lunation: (phase: string, date: string, sign: string, theme: string) => `${phase} on ${date}, in ${sign}: your house of ${theme}.`,
    carried: (phase: string, date: string, sign: string, theme: string) => `No new, full or quarter Moon falls this week. It carries on from the ${phase.toLowerCase()} on ${date}, in ${sign}: your house of ${theme}.`,
    best: "Best days", bestIntro: "The day each part of life gets the most support this week, from your daily readings.",
    path: "The Moon's week", pathIntro: "The Moon moves through about two signs of your chart each week. Where it is shows what is on your mind.",
    sky: "In the sky this week", none: "No planet changes sign or direction this week.",
    ingress: (planet: string, sign: string, theme: string) => `${planet} moves into ${sign}, your house of ${theme}.`,
    rx: (planet: string, sign: string, theme: string) => `${planet} turns retrograde in ${sign}. Go gently with ${theme}, and double-check plans.`,
    direct: (planet: string, sign: string, theme: string) => `${planet} turns direct in ${sign}. Plans about ${theme} start moving again.`,
    eclipse: (name: string, sign: string, theme: string) => `${name} in ${sign}, your house of ${theme}.`,
    daily: (s: string) => `${s} horoscope today`, others: "Other signs this week",
    my: (s: string, r: string) => `My ${s} weekly horoscope, ${r}`,
    note: "Days are counted Monday to Sunday in universal time. For entertainment and reflection.",
    busy: "This page is busy right now. Try again in a few minutes.",
  },
});

const dayName = (date: string, lang: Lang) => weekdayName(fromKey(date).getUTCDay(), lang);
const validMonday = (d: string) => Number(d.slice(0, 4)) >= CALENDAR_YEARS.min && Number(addDays(d, 6).slice(0, 4)) <= CALENDAR_YEARS.max;

function eventLine(e: WeekEvent, lang: Lang): string {
  const t = T[lang];
  const sign = signNameIn(e.signIndex, lang);
  const theme = HOUSE_THEME[e.house];
  if (e.kind === "eclipse") return t.eclipse(eclipseName({ kind: e.eclipseKind!, body: e.body as "sun" | "moon" }, lang), sign, theme);
  const planet = planetNameIn(e.body as Exclude<WeekEvent["body"], "sun" | "moon">, lang);
  if (e.kind === "ingress") return t.ingress(planet, sign, theme);
  return e.kind === "station-rx" ? t.rx(planet, sign, theme) : t.direct(planet, sign, theme);
}

export default async function WeeklyPage({ sign, monday }: { sign: WesternSign; monday: string }) {
  const path = `/horoscope/${sign.slug}/week/${monday}`;
  const lang = await getLang();
  const t = T[lang];
  const name = signName(sign.slug, lang);
  // The years lib/weekly.ts reads stations and eclipses from; computing a new
  // one is charged against the site-wide ceiling in lib/skyEvents.ts.
  const y = Number(monday.slice(0, 4)), y2 = Number(addDays(monday, 7).slice(0, 4));
  if (!skyYearsAvailable([...new Set([y - 1, y, y2])])) {
    return <div className="mx-auto max-w-reading safe-x py-7"><h1 className="text-h1">{t.h1(name)}</h1><p className="mt-3">{t.busy}</p></div>;
  }
  const w = weeklyReading(sign, monday, blockTexts(lang), lang);
  const range = weekRange(monday, lang);
  const title = `${t.h1(name)} · ${range}`;
  const prev = addDays(monday, -7), next = addDays(monday, 7);
  const L = w.lunation;
  const lunationDate = fullDate(L.at.slice(0, 10), lang);
  const lunationArgs = [phaseName(L, lang), lunationDate, signNameIn(L.signIndex, lang), HOUSE_THEME[L.house]] as const;
  const carried = w.phases.length === 0;
  const span = (from: string, to: string) => (from === to ? dayName(from, lang) : `${dayName(from, lang)} – ${dayName(to, lang)}`);

  return (
    <>
      <Breadcrumbs items={[{ name: t.crumb, href: "/horoscope" }, { name, href: `/horoscope/${sign.slug}` }, { name: range, href: path }]} />
      <JsonLd data={[articleLd({ headline: title, description: w.overview.text, path, date: monday, lang })]} />
      <div className="mx-auto max-w-page safe-x py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
        <article className="max-w-reading">
          <nav aria-label={t.weekNav} className="flex justify-between text-small">
            {validMonday(prev) ? <Link className="link inline-flex min-h-tap items-center gap-1" href={`/horoscope/${sign.slug}/week/${prev}`} rel="prev"><Glyph name="chevron-left" set="ui" className="size-4" />{t.prev}</Link> : <span />}
            {validMonday(next) ? <Link className="link inline-flex min-h-tap items-center gap-1" href={`/horoscope/${sign.slug}/week/${next}`} rel="next">{t.next}<Glyph name="chevron-right" set="ui" className="size-4" /></Link> : <span />}
          </nav>
          <h1 className="mt-3 flex items-center gap-3 text-h1">
            <Glyph name={sign.slug} set="western" className="size-glyph-lg shrink-0" />
            <span>{t.h1(name)}</span>
          </h1>
          <p className="mt-2 text-small text-muted"><time dateTime={monday}>{range}</time></p>

          <section className="mt-6 border-t border-rule py-5" aria-labelledby="wk-overview">
            <h2 id="wk-overview" className="text-h3">{t.overview}</h2>
            <p className="mt-2 text-small text-muted">{carried ? t.carried(...lunationArgs) : t.lunation(...lunationArgs)}</p>
            <p className="reading mt-3">{w.overview.text}</p>
          </section>

          <section className="border-t border-rule py-5" aria-labelledby="wk-best">
            <h2 id="wk-best" className="text-h3">{t.best}</h2>
            <p className="mt-2 text-small text-muted">{t.bestIntro}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-4">
              {TOPICS.map((topic) => (
                <div key={topic}>
                  <dt className="text-small font-semibold">{TOPIC_LABEL[topic]}</dt>
                  <dd><Link className="link inline-flex min-h-tap items-center" href={`/horoscope/${sign.slug}/${w.best[topic].date}`}>{dayName(w.best[topic].date, lang)}</Link></dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="border-t border-rule py-5" aria-labelledby="wk-path">
            <h2 id="wk-path" className="text-h3">{t.path}</h2>
            <p className="mt-2 text-small text-muted">{t.pathIntro}</p>
            <ul className="mt-3">
              {w.moonPath.map((m) => (
                <li key={m.from} className="grid gap-1 border-t border-rule py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-baseline sm:gap-5">
                  <span className="text-small font-semibold">{span(m.from, m.to)}</span>
                  <span>{signNameIn(m.signIndex, lang)} · {m.theme}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-rule py-5" aria-labelledby="wk-sky">
            <h2 id="wk-sky" className="text-h3">{t.sky}</h2>
            {w.events.length === 0 ? <p className="mt-3">{t.none}</p> : (
              <ul className="mt-3">
                {w.events.map((e) => (
                  <li key={`${e.kind}-${e.body}-${e.date}`} className="grid gap-1 border-t border-rule py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-baseline sm:gap-5">
                    <span className="text-small font-semibold">{dayName(e.date, lang)}</span>
                    <span>{eventLine(e, lang)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-small text-muted">{t.note}</p>
          </section>

          <Feedback path={path} blockIds={[w.overview.id]} />
          <Share title={title} text={t.my(name, range)} url={absolute(path)} />
          <AdSlot placement="afterReading" />
          <RelatedLinks links={[
            { href: `/horoscope/${sign.slug}`, label: t.daily(name) },
            { href: "/sky", label: t.sky },
          ]} />
          <nav aria-labelledby="wk-others" className="mt-7 border-t border-rule pt-5">
            <h2 id="wk-others" className="text-h3">{t.others}</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-5 sm:grid-cols-3">
              {SIGNS.filter((s) => s.slug !== sign.slug).map((s) => (
                <li key={s.slug}><Link className="link inline-flex min-h-tap items-center" href={`/horoscope/${s.slug}/week/${monday}`}>{signName(s.slug, lang)}</Link></li>
              ))}
            </ul>
          </nav>
        </article>
        <div className="hidden lg:block"><AdSlot placement="rail" /></div>
      </div>
    </>
  );
}
