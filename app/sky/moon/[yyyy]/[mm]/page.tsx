/** Moon calendar (research feature #2): phase and Moon sign each day, exact phase and ingress times. */
import Link from "@/components/client/LocaleLink";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import MoonGlyph from "@/components/MoonGlyph";
import { moonInfo } from "@/lib/sky";
import { moonIngresses, moonPhases, phaseName, signNameIn } from "@/lib/skyEvents";
import { dateIn, timeIn, zoneLabel } from "@/lib/format";
import { monthName, monthYear, weekdayName } from "@/lib/dates";
import { getLang } from "@/lib/langServer";
import { defineMessages, num } from "@/lib/i18n";
import { visitorZone } from "@/lib/today";
import { pageMetadata } from "@/lib/seo";
import { CALENDAR_YEARS } from "@/lib/site";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ yyyy: string; mm: string }> };
const parse = (y: string, m: string) => (/^\d{4}$/.test(y) && /^\d{2}$/.test(m) && +y >= CALENDAR_YEARS.min && +y <= CALENDAR_YEARS.max && +m >= 1 && +m <= 12 ? { year: +y, month: +m } : null);

const T = defineMessages({
  en: {
    title: (my: string) => `Moon calendar for ${my}`,
    description: (my: string) => `Moon phases and the Moon's sign for every day of ${my}, with exact new moon, full moon and sign-change times.`,
    sky: "Sky",
    crumb: (my: string) => `Moon, ${my}`,
    monthNav: "Month", prev: "Previous month", next: "Next month",
    h1: (my: string) => `Moon calendar, ${my}`,
    zone: (z: string) => `Times in ${z} time. Daily phase and sign shown for 12:00 UTC.`,
    moonIn: (sign: string) => `Moon in ${sign}`,
    lit: (n: number) => `${n}% lit`,
    phaseAt: (name: string) => `${name} at `,
    phaseSign: (sign: string) => `, in ${sign}`,
    enters: (sign: string) => `Moon enters ${sign} at `,
    foot: "Calculated with astronomy-engine. Want these in your phone's calendar?",
    feeds: "Calendar feeds",
  },
  km: {
    title: (my: string) => `ប្រតិទិនព្រះចន្ទ ${my}`,
    description: (my: string) => `ដំណាក់កាលព្រះចន្ទ និងរាសីដែលព្រះចន្ទស្ថិតនៅ សម្រាប់គ្រប់ថ្ងៃក្នុង${my} ព្រមទាំងម៉ោងពិតប្រាកដនៃព្រះចន្ទងងឹត ព្រះចន្ទពេញវង់ និងការប្ដូររាសី។`,
    sky: "មេឃ",
    crumb: (my: string) => `ព្រះចន្ទ ${my}`,
    monthNav: "ខែ", prev: "ខែមុន", next: "ខែបន្ទាប់",
    h1: (my: string) => `ប្រតិទិនព្រះចន្ទ ${my}`,
    zone: (z: string) => `ម៉ោងគិតតាមម៉ោង ${z}។ ដំណាក់កាល និងរាសីប្រចាំថ្ងៃ បង្ហាញសម្រាប់ម៉ោង ១២:០០ UTC។`,
    moonIn: (sign: string) => `ព្រះចន្ទក្នុងរាសី${sign}`,
    lit: (n: number) => `ភ្លឺ ${num(n, "km")}%`,
    phaseAt: (name: string) => `${name} ម៉ោង `,
    phaseSign: (sign: string) => ` ក្នុងរាសី${sign}`,
    enters: (sign: string) => `ព្រះចន្ទចូលរាសី${sign} ម៉ោង `,
    foot: "គណនាដោយ astronomy-engine។ ចង់បានកាលបរិច្ឆេទទាំងនេះក្នុងប្រតិទិនទូរសព្ទរបស់អ្នកទេ?",
    feeds: "ប្រតិទិនសម្រាប់ជាវ",
  },
});

export async function generateMetadata({ params }: Params) {
  const { yyyy, mm } = await params;
  const p = parse(yyyy, mm);
  if (!p) return {};
  const lang = await getLang();
  const my = lang === "km" ? monthYear(p.year, p.month, "km") : `${monthName(p.month)} ${p.year}`;
  return pageMetadata({ lang, title: T[lang].title(my), description: T[lang].description(my), path: `/sky/moon/${yyyy}/${mm}`, noindex: p.year < 2020 || p.year > 2030 });
}

export default async function MoonMonth({ params }: Params) {
  const { yyyy, mm } = await params;
  const p = parse(yyyy, mm);
  if (!p) notFound();
  const tz = await visitorZone();
  const lang = await getLang();
  const t = T[lang];
  const { year, month } = p;
  const my = lang === "km" ? monthYear(year, month, "km") : `${monthName(month)} ${year}`;
  const sign = (i: number) => signNameIn(i, lang);
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
      <Breadcrumbs items={[{ name: t.sky, href: "/sky" }, { name: t.crumb(my), href: `/sky/moon/${yyyy}/${mm}` }]} />
      <div className="mx-auto max-w-reading safe-x py-5 box-content">
        <nav aria-label={t.monthNav} className="flex justify-between text-small">
          <Link className="link inline-flex min-h-tap items-center gap-1" href={`/sky/moon/${prev}`} rel="prev"><Glyph name="chevron-left" set="ui" className="size-4" />{t.prev}</Link>
          <Link className="link inline-flex min-h-tap items-center gap-1" href={`/sky/moon/${next}`} rel="next">{t.next}<Glyph name="chevron-right" set="ui" className="size-4" /></Link>
        </nav>
        <h1 className="mt-3 text-h1">{t.h1(my)}</h1>
        <p className="mt-2 text-small text-muted">{t.zone(zoneLabel(tz))}</p>
        <ol className="mt-6">
          {rows.map((r) => (
            <li key={r.date} className="flex items-start gap-4 border-b border-rule py-3">
              <span className="w-9 shrink-0 tabular"><span className="serif text-h3">{num(Number(r.date.slice(8)), lang)}</span></span>
              <MoonGlyph angle={r.m.phaseAngle} size={24} />
              <span className="flex-1">
                <span className="block">{weekdayName(new Date(`${r.date}T00:00:00Z`).getUTCDay(), lang)} · {t.moonIn(sign(r.m.signIndex))} · {t.lit(r.m.illumination)}</span>
                {r.phase && <span className="block font-semibold">{t.phaseAt(phaseName(r.phase, lang))}<span className="tabular">{timeIn(r.phase.at, tz, lang)}</span>{t.phaseSign(sign(r.phase.signIndex))}</span>}
                {r.ingress && <span className="block text-small text-muted">{t.enters(sign(r.ingress.signIndex))}<span className="tabular">{timeIn(r.ingress.at, tz, lang)}</span></span>}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-small text-muted">{t.foot} <Link className="link" href="/feeds">{t.feeds}</Link></p>
      </div>
    </>
  );
}
