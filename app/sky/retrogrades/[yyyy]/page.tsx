/** Retrograde and eclipse calendar (research feature #5). Calm framing: an optical effect, a time to review. */
import Link from "@/components/client/LocaleLink";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import { degreeIn, eclipsesForYear, retrogradesForYear, signName } from "@/lib/skyEvents";
import { dateTimeIn, shortDateIn, zoneLabel } from "@/lib/format";
import { visitorZone } from "@/lib/today";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ yyyy: string }> };
const parse = (y: string) => (/^\d{4}$/.test(y) && +y >= 1950 && +y <= 2080 ? +y : null);

export async function generateMetadata({ params }: Params) {
  const year = parse((await params).yyyy);
  if (!year) return {};
  return pageMetadata({ title: `Mercury retrograde ${year}, all retrogrades and eclipses`, description: `Every retrograde from Mercury to Saturn in ${year}, with station dates, shadow periods and the year's solar and lunar eclipses.`, path: `/sky/retrogrades/${year}`, noindex: year < 2020 || year > 2030 });
}

export default async function Retrogrades({ params }: Params) {
  const year = parse((await params).yyyy);
  if (!year) notFound();
  const tz = await visitorZone();
  const rx = retrogradesForYear(year);
  const ecl = eclipsesForYear(year);
  return (
    <>
      <Breadcrumbs items={[{ name: "Sky", href: "/sky" }, { name: `Retrogrades ${year}`, href: `/sky/retrogrades/${year}` }]} />
      <div className="mx-auto max-w-reading safe-x py-5 box-content">
        <nav aria-label="Year" className="flex justify-between text-small">
          <Link className="link inline-flex min-h-tap items-center gap-1" href={`/sky/retrogrades/${year - 1}`} rel="prev"><Glyph name="chevron-left" set="ui" className="size-4" />{year - 1}</Link>
          <Link className="link inline-flex min-h-tap items-center gap-1" href={`/sky/retrogrades/${year + 1}`} rel="next">{year + 1}<Glyph name="chevron-right" set="ui" className="size-4" /></Link>
        </nav>
        <h1 className="mt-3 text-h1">Retrogrades and eclipses in {year}</h1>
        <p className="reading mt-3">A planet looks retrograde when Earth&apos;s own motion makes it seem to move backwards against the stars. Tradition reads it as a time to review, revisit and finish, not to fear. The shadow is the stretch of sky the planet covers three times.</p>
        <p className="mt-2 text-small text-muted">Times in {zoneLabel(tz)} time, to within about ten minutes.</p>
        <h2 className="mt-7 text-h2">Retrogrades</h2>
        <ol className="mt-3">
          {rx.map((r) => (
            <li key={r.planet + r.stationRx.at} className="border-b border-rule py-4">
              <h3 className="text-h3">{r.name}, {shortDateIn(r.stationRx.at, tz)} to {shortDateIn(r.stationD.at, tz)}</h3>
              <dl className="mt-2 grid gap-x-5 gap-y-2 text-small sm:grid-cols-2 tabular">
                <div><dt className="text-muted">Turns retrograde</dt><dd>{dateTimeIn(r.stationRx.at, tz)}, {signName(r.stationRx.signIndex)} {degreeIn(r.stationRx.longitude)}</dd></div>
                <div><dt className="text-muted">Turns direct</dt><dd>{dateTimeIn(r.stationD.at, tz)}, {signName(r.stationD.signIndex)} {degreeIn(r.stationD.longitude)}</dd></div>
                {r.shadowStart && <div><dt className="text-muted">Shadow begins</dt><dd>{shortDateIn(r.shadowStart, tz)}</dd></div>}
                {r.shadowEnd && <div><dt className="text-muted">Shadow ends</dt><dd>{shortDateIn(r.shadowEnd, tz)}</dd></div>}
              </dl>
            </li>
          ))}
        </ol>
        <h2 className="mt-7 text-h2">Eclipses</h2>
        <ol className="mt-3">
          {ecl.map((e) => (
            <li key={e.at} className="border-b border-rule py-3">
              <span className="font-semibold">{e.kind[0].toUpperCase() + e.kind.slice(1)} {e.body === "sun" ? "solar" : "lunar"} eclipse</span> · <span className="tabular">{dateTimeIn(e.at, tz)}</span> (peak) · {e.body === "sun" ? "Sun" : "Moon"} in {signName(e.signIndex)}
            </li>
          ))}
        </ol>
        <p className="mt-5 text-small text-muted">Whether an eclipse is visible depends on where you are. Calculated with astronomy-engine.</p>
      </div>
    </>
  );
}
