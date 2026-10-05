/** The sky now: positions, the next phases, current retrogrades, next eclipse. */
import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import DayDial from "@/components/DayDial";
import MoonGlyph from "@/components/MoonGlyph";
import { skyForDay } from "@/lib/sky";
import { eclipsesForYear, moonPhases, retrogradesForYear, degreeInL, signNameIn, phaseName, planetNameIn, eclipseName } from "@/lib/skyEvents";
import { dateTimeIn, zoneLabel } from "@/lib/format";
import { today, visitorZone } from "@/lib/today";
import { pageMetadata } from "@/lib/seo";
import { addDays } from "@/lib/dates";
import { getLang } from "@/lib/langServer";
import { defineMessages } from "@/lib/i18n";
import { nowIso } from "@/lib/clock";

export const dynamic = "force-dynamic";

const T = defineMessages({
  en: {
    title: "The sky today: Moon, planets, retrogrades and eclipses",
    description: "Where the Sun, Moon and planets are today, the next moon phases, which planets are retrograde, and the next eclipse, calculated to the minute.",
    crumb: "Sky",
    h1: "The sky today",
    intro: (date: string, zone: string) => `Positions for 12:00 UTC on ${date}, tropical zodiac. Times below are in ${zone} time.`,
    positions: "Positions",
    lit: (n: number) => `${n}% lit`,
    retro: " (retrograde)",
    nextPhases: "Next moon phases",
    phaseIn: (sign: string) => ` in ${sign}`,
    moonCal: "Moon calendar",
    rx: "Retrogrades",
    rxBody: "A retrograde is an optical effect: as Earth overtakes or is overtaken by a planet, it seems to drift backwards for a while. Traditionally it is a time to review rather than rush.",
    none: "No planet from Mercury to Saturn is retrograde right now.",
    isRx: (p: string) => `${p} is retrograde`,
    activeTail: (sign: string) => ` in ${sign}, turning direct on `,
    nextRx: (p: string) => `${p} turns retrograde on `,
    nextRxTail: (sign: string) => ` in ${sign}.`,
    eclipse: (name: string) => `Next eclipse: a ${name.toLowerCase()} on `,
    eclipseTail: (sign: string) => `, in ${sign}.`,
    rxCal: "Retrograde and eclipse calendar",
    feeds: "Add these dates to your calendar",
    week: "This week in the sky", terms: "The 24 solar terms",
  },
});

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/sky" });
}

const planetLabel = (p: "mercury" | "venus" | "mars") => (p[0].toUpperCase() + p.slice(1));

export default async function SkyPage() {
  const lang = await getLang();
  const t = T[lang];
  const sign = (i: number) => signNameIn(i, lang);
  const deg = (lon: number) => degreeInL(lon, lang);
  const date = await today();
  const tz = await visitorZone();
  const sky = skyForDay(date);
  const now = nowIso();
  const y = Number(date.slice(0, 4));
  // Day-aligned window so the memo key is stable across requests.
  const phases = moonPhases(`${addDays(date, -1)}T00:00:00Z`, `${addDays(date, 40)}T00:00:00Z`).filter((p) => p.at > now).slice(0, 4);
  const rx = [...retrogradesForYear(y - 1), ...retrogradesForYear(y), ...retrogradesForYear(y + 1)];
  const active = rx.filter((r) => r.stationRx.at <= now && now <= r.stationD.at);
  const nextRx = rx.filter((r) => r.stationRx.at > now).slice(0, 3);
  const nextEclipse = [...eclipsesForYear(y), ...eclipsesForYear(y + 1)].find((e) => e.at > now);
  return (
    <>
      <Breadcrumbs items={[{ name: t.crumb, href: "/sky" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">{t.h1}</h1>
        <p className="reading mt-3 text-muted">{t.intro(new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00Z`)), zoneLabel(tz))}</p>
        <div className="mt-6 grid gap-7 lg:grid-cols-2">
          <DayDial sky={sky} size="large" id="sky-dial" />
          <div>
            <h2 className="text-h2">{t.positions}</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 tabular">
              <div><dt className="text-small text-muted">{"Sun"}</dt><dd>{sign(sky.sunSignIndex)} {deg(sky.sunLongitude)}</dd></div>
              <div><dt className="text-small text-muted">{"Moon"}</dt><dd>{sign(sky.moon.signIndex)} {deg(sky.moon.longitude)}, {t.lit(sky.moon.illumination)}</dd></div>
              {(["mercury", "venus", "mars"] as const).map((p) => (
                <div key={p}><dt className="text-small text-muted">{planetLabel(p)}</dt><dd>{sign(sky.planets[p].signIndex)} {deg(sky.planets[p].longitude)}{sky.planets[p].retrograde ? t.retro : ""}</dd></div>
              ))}
            </dl>
            <h2 className="mt-7 text-h2">{t.nextPhases}</h2>
            <ul className="mt-3">
              {phases.map((p) => (
                <li key={p.at} className="flex items-center gap-3 border-b border-rule py-2">
                  <MoonGlyph angle={p.quarter * 90} />
                  <span><span className="font-semibold">{phaseName(p, lang)}</span>{t.phaseIn(sign(p.signIndex))} · <span className="tabular">{dateTimeIn(p.at, tz, lang)}</span></span>
                </li>
              ))}
            </ul>
            <p className="mt-3"><Link className="link" href="/sky/moon">{t.moonCal}</Link></p>
          </div>
        </div>
        <section className="mt-8 border-t border-rule pt-6" aria-labelledby="rx-h">
          <h2 id="rx-h" className="text-h2">{t.rx}</h2>
          <p className="reading mt-3">{t.rxBody}</p>
          <ul className="mt-4">
            {active.length === 0 && <li className="border-b border-rule py-2">{t.none}</li>}
            {active.map((r) => <li key={r.planet + r.stationRx.at} className="border-b border-rule py-2"><span className="font-semibold">{t.isRx(planetNameIn(r.planet, lang))}</span> in {sign(r.stationRx.signIndex)}, turning direct on <span className="tabular">{dateTimeIn(r.stationD.at, tz, lang)}</span>{"."}</li>)}
            {nextRx.map((r) => <li key={r.planet + r.stationRx.at} className="border-b border-rule py-2">{t.nextRx(planetNameIn(r.planet, lang))}<span className="tabular">{dateTimeIn(r.stationRx.at, tz, lang)}</span>{t.nextRxTail(sign(r.stationRx.signIndex))}</li>)}
          </ul>
          {nextEclipse && <p className="mt-5">{t.eclipse(eclipseName(nextEclipse, lang))}<span className="tabular">{dateTimeIn(nextEclipse.at, tz, lang)}</span>{t.eclipseTail(sign(nextEclipse.signIndex))}</p>}
          <p className="mt-3"><Link className="link" href="/sky/retrogrades">{t.rxCal}</Link> · <Link className="link" href="/sky/week">{t.week}</Link> · <Link className="link" href="/sky/solar-terms">{t.terms}</Link> · <Link className="link" href="/feeds">{t.feeds}</Link></p>
        </section>
      </div>
    </>
  );
}
