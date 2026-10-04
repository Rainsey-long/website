/** The sky now: positions, the next phases, current retrogrades, next eclipse. */
import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import DayDial from "@/components/DayDial";
import MoonGlyph from "@/components/MoonGlyph";
import { skyForDay } from "@/lib/sky";
import { SIGNS } from "@/lib/western";
import { eclipsesForYear, moonPhases, retrogradesForYear, degreeIn, signName } from "@/lib/skyEvents";
import { dateTimeIn, zoneLabel } from "@/lib/format";
import { today, visitorZone } from "@/lib/today";
import { pageMetadata } from "@/lib/seo";
import { addDays } from "@/lib/dates";
import { nowIso } from "@/lib/clock";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({ title: "The sky today: Moon, planets, retrogrades and eclipses", description: "Where the Sun, Moon and planets are today, the next moon phases, which planets are retrograde, and the next eclipse, calculated to the minute.", path: "/sky" });

export default async function SkyPage() {
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
      <Breadcrumbs items={[{ name: "Sky", href: "/sky" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">The sky today</h1>
        <p className="reading mt-3 text-muted">Positions for 12:00 UTC on {new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00Z`))}, tropical zodiac. Times below are in {zoneLabel(tz)} time.</p>
        <div className="mt-6 grid gap-7 lg:grid-cols-2">
          <DayDial sky={sky} size="large" id="sky-dial" />
          <div>
            <h2 className="text-h2">Positions</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 tabular">
              <div><dt className="text-small text-muted">Sun</dt><dd>{SIGNS[sky.sunSignIndex].name} {degreeIn(sky.sunLongitude)}</dd></div>
              <div><dt className="text-small text-muted">Moon</dt><dd>{SIGNS[sky.moon.signIndex].name} {degreeIn(sky.moon.longitude)}, {sky.moon.illumination}% lit</dd></div>
              {(["mercury", "venus", "mars"] as const).map((p) => (
                <div key={p}><dt className="text-small text-muted">{p[0].toUpperCase() + p.slice(1)}</dt><dd>{SIGNS[sky.planets[p].signIndex].name} {degreeIn(sky.planets[p].longitude)}{sky.planets[p].retrograde ? " (retrograde)" : ""}</dd></div>
              ))}
            </dl>
            <h2 className="mt-7 text-h2">Next moon phases</h2>
            <ul className="mt-3">
              {phases.map((p) => (
                <li key={p.at} className="flex items-center gap-3 border-b border-rule py-2">
                  <MoonGlyph angle={p.quarter * 90} />
                  <span><span className="font-semibold">{p.name}</span> in {signName(p.signIndex)} · <span className="tabular">{dateTimeIn(p.at, tz)}</span></span>
                </li>
              ))}
            </ul>
            <p className="mt-3"><Link className="link" href="/sky/moon">Moon calendar</Link></p>
          </div>
        </div>
        <section className="mt-8 border-t border-rule pt-6" aria-labelledby="rx-h">
          <h2 id="rx-h" className="text-h2">Retrogrades</h2>
          <p className="reading mt-3">A retrograde is an optical effect: as Earth overtakes or is overtaken by a planet, it seems to drift backwards for a while. Traditionally it is a time to review rather than rush.</p>
          <ul className="mt-4">
            {active.length === 0 && <li className="border-b border-rule py-2">No planet from Mercury to Saturn is retrograde right now.</li>}
            {active.map((r) => <li key={r.planet + r.stationRx.at} className="border-b border-rule py-2"><span className="font-semibold">{r.name} is retrograde</span> in {signName(r.stationRx.signIndex)}, turning direct on <span className="tabular">{dateTimeIn(r.stationD.at, tz)}</span>.</li>)}
            {nextRx.map((r) => <li key={r.planet + r.stationRx.at} className="border-b border-rule py-2">{r.name} turns retrograde on <span className="tabular">{dateTimeIn(r.stationRx.at, tz)}</span> in {signName(r.stationRx.signIndex)}.</li>)}
          </ul>
          {nextEclipse && <p className="mt-5">Next eclipse: a {nextEclipse.kind} {nextEclipse.body === "sun" ? "solar" : "lunar"} eclipse on <span className="tabular">{dateTimeIn(nextEclipse.at, tz)}</span>, in {signName(nextEclipse.signIndex)}.</p>}
          <p className="mt-3"><Link className="link" href="/sky/retrogrades">Retrograde and eclipse calendar</Link> · <Link className="link" href="/feeds">Add these dates to your calendar</Link></p>
        </section>
      </div>
    </>
  );
}
