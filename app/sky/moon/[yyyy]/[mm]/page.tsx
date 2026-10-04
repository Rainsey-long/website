/** Moon calendar (research feature #2): phase and Moon sign each day, exact phase and ingress times. */
import Link from "@/components/client/LocaleLink";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import MoonGlyph from "@/components/MoonGlyph";
import { moonInfo } from "@/lib/sky";
import { SIGNS } from "@/lib/western";
import { moonIngresses, moonPhases, signName } from "@/lib/skyEvents";
import { dateIn, timeIn, zoneLabel } from "@/lib/format";
import { fullDate, monthName } from "@/lib/dates";
import { visitorZone } from "@/lib/today";
import { pageMetadata } from "@/lib/seo";
import { CALENDAR_YEARS } from "@/lib/site";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ yyyy: string; mm: string }> };
const parse = (y: string, m: string) => (/^\d{4}$/.test(y) && /^\d{2}$/.test(m) && +y >= CALENDAR_YEARS.min && +y <= CALENDAR_YEARS.max && +m >= 1 && +m <= 12 ? { year: +y, month: +m } : null);

export async function generateMetadata({ params }: Params) {
  const { yyyy, mm } = await params;
  const p = parse(yyyy, mm);
  if (!p) return {};
  return pageMetadata({ title: `Moon calendar for ${monthName(p.month)} ${p.year}`, description: `Moon phases and the Moon's sign for every day of ${monthName(p.month)} ${p.year}, with exact new moon, full moon and sign-change times.`, path: `/sky/moon/${yyyy}/${mm}`, noindex: p.year < 2020 || p.year > 2030 });
}

export default async function MoonMonth({ params }: Params) {
  const { yyyy, mm } = await params;
  const p = parse(yyyy, mm);
  if (!p) notFound();
  const tz = await visitorZone();
  const { year, month } = p;
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const from = new Date(Date.UTC(year, month - 1, 1) - 86400_000).toISOString();
  const to = new Date(Date.UTC(year, month, 1) + 86400_000).toISOString();
  const phases = moonPhases(from, to);
  const ingresses = moonIngresses(from, to);
  const rows = Array.from({ length: count }, (_, i) => {
    const date = `${yyyy}-${mm}-${String(i + 1).padStart(2, "0")}`;
    const noon = new Date(`${date}T12:00:00Z`);
    const m = moonInfo(noon);
    return {
      date, m,
      phase: phases.find((x) => dateIn(x.at, tz) === date),
      ingress: ingresses.find((x) => dateIn(x.at, tz) === date),
    };
  });
  const prev = month === 1 ? `${year - 1}/12` : `${year}/${String(month - 1).padStart(2, "0")}`;
  const next = month === 12 ? `${year + 1}/01` : `${year}/${String(month + 1).padStart(2, "0")}`;
  return (
    <>
      <Breadcrumbs items={[{ name: "Sky", href: "/sky" }, { name: `Moon, ${monthName(month)} ${year}`, href: `/sky/moon/${yyyy}/${mm}` }]} />
      <div className="mx-auto max-w-reading safe-x py-5 box-content">
        <nav aria-label="Month" className="flex justify-between text-small">
          <Link className="link inline-flex min-h-tap items-center gap-1" href={`/sky/moon/${prev}`} rel="prev"><Glyph name="chevron-left" set="ui" className="size-4" />Previous month</Link>
          <Link className="link inline-flex min-h-tap items-center gap-1" href={`/sky/moon/${next}`} rel="next">Next month<Glyph name="chevron-right" set="ui" className="size-4" /></Link>
        </nav>
        <h1 className="mt-3 text-h1">Moon calendar, {monthName(month)} {year}</h1>
        <p className="mt-2 text-small text-muted">Times in {zoneLabel(tz)} time. Daily phase and sign shown for 12:00 UTC.</p>
        <ol className="mt-6">
          {rows.map((r) => (
            <li key={r.date} className="flex items-start gap-4 border-b border-rule py-3">
              <span className="w-9 shrink-0 tabular"><span className="serif text-h3">{Number(r.date.slice(8))}</span></span>
              <MoonGlyph angle={r.m.phaseAngle} size={24} />
              <span className="flex-1">
                <span className="block">{fullDate(r.date).split(",")[0]} · Moon in {SIGNS[r.m.signIndex].name} · {r.m.illumination}% lit</span>
                {r.phase && <span className="block font-semibold">{r.phase.name} at <span className="tabular">{timeIn(r.phase.at, tz)}</span>, in {signName(r.phase.signIndex)}</span>}
                {r.ingress && <span className="block text-small text-muted">Moon enters {signName(r.ingress.signIndex)} at <span className="tabular">{timeIn(r.ingress.at, tz)}</span></span>}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-small text-muted">Calculated with astronomy-engine. Want these in your phone&apos;s calendar? <Link className="link" href="/feeds">Calendar feeds</Link></p>
      </div>
    </>
  );
}
