/**
 * Printable monthly calendar (docs/research/FEATURES.md §7, #45;
 * DESIGN_SYSTEM.md §6.19). One A4 landscape sheet: Gregorian days with the
 * Khmer lunar date, holy days and festivals, and the Chinese lunar day and
 * good days, for the traditions the visitor chose. Plain print CSS, no PDF
 * service. The sheet always uses the light palette, also in dark mode.
 */
import Link from "@/components/client/LocaleLink";
import { notFound } from "next/navigation";
import Seal from "@/components/Seal";
import PrintButton from "@/components/client/PrintButton";
import { almanacDay } from "@/lib/almanac";
import { khmerDay, toKhmerNum, WEEKDAYS } from "@/lib/khmer";
import { zodiacYearForDate } from "@/lib/chinese";
import { monthName } from "@/lib/dates";
import { today } from "@/lib/today";
import { getLang } from "@/lib/langServer";
import { defineMessages, num } from "@/lib/i18n";
import { animalName, elementName } from "@/lib/names";
import { chosenTraditions } from "@/lib/traditionsServer";
import { pageMetadata } from "@/lib/seo";
import { CALENDAR_YEARS, DISCLAIMER, SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ yyyy: string; mm: string }> };

function parse(yyyy: string, mm: string) {
  if (!/^\d{4}$/.test(yyyy) || !/^\d{2}$/.test(mm)) return null;
  const year = Number(yyyy), month = Number(mm);
  if (year < CALENDAR_YEARS.min || year > CALENDAR_YEARS.max || month < 1 || month > 12) return null;
  return { year, month };
}

const T = defineMessages({
  en: {
    title: (l: string) => `Printable calendar for ${l}`,
    description: (l: string) => `A one-page printable calendar for ${l} with Khmer lunar dates, Buddhist holy days, festivals and Chinese good days.`,
    intro: "One A4 page in landscape. Your browser's print dialog can also save it as a PDF.",
    print: "Print this calendar", back: "Back to the month",
    chineseYear: (el: string, an: string) => `Chinese year of the ${el} ${an}`,
    lunarMonths: (a: number, b: number) => (a === b ? `Chinese lunar month ${a}` : `Chinese lunar months ${a}–${b}`),
    holy: "Buddhist holy day", good: "Good day (Chinese almanac)", quiet: "Quiet day (Chinese almanac)",
    keyKhmer: "Khmer lunar day, counted 1–15 in the waxing and the waning half of each month.",
    keyChinese: (first: string) => `Chinese lunar day; ${first} marks the first day of lunar month 9.`,
    festivals: "Festivals",
    first: (m: number) => `M${m}`,
  },
});

const label = (y: number, m: number) => (`${monthName(m)} ${y}`);

export async function generateMetadata({ params }: Params) {
  const { yyyy, mm } = await params;
  const p = parse(yyyy, mm);
  if (!p) return {};
  const lang = await getLang();
  const l = label(p.year, p.month);
  // A print view of the month page: not a separate search result.
  return pageMetadata({ lang, title: T[lang].title(l), description: T[lang].description(l), path: `/lucky-days/${yyyy}/${mm}/print`, noindex: true });
}

export default async function PrintMonth({ params }: Params) {
  const { yyyy, mm } = await params;
  const p = parse(yyyy, mm);
  if (!p) notFound();
  const { year, month } = p;
  const lang = await getLang();
  const t = T[lang];
  const traditions = await chosenTraditions();
  const wantKhmer = traditions.includes("khmer");
  const wantChinese = traditions.includes("chinese") || !wantKhmer;
  const now = await today();

  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = Array.from({ length: count }, (_, i) => {
    const date = `${yyyy}-${mm}-${String(i + 1).padStart(2, "0")}`;
    return { date, n: i + 1, k: wantKhmer ? khmerDay(date) : null, c: wantChinese ? almanacDay(date) : null };
  });
  const lead = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const cells: Array<(typeof days)[number] | null> = [...Array(lead).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const heads = [1, 2, 3, 4, 5, 6, 0].map((i) => (WEEKDAYS[i].en.slice(0, 3)));

  const first = days[0], last = days[days.length - 1];
  const khmerHead = first.k && last.k ? (() => {
    const months = [...new Set(days.map((d) => d.k!.month.km))].map((m) => `ខែ${m}`).join(" – ");
    const years = [...new Set(days.map((d) => `ព.ស. ${toKhmerNum(d.k!.beYear)}`))].join(" – ");
    const animals = [...new Set(days.map((d) => `ឆ្នាំ${d.k!.animal.km} ${d.k!.sakKm}`))].join(" – ");
    return `${months} · ${years} · ${animals}`;
  })() : null;
  const zodiac = zodiacYearForDate(year, month, count);
  const festivals = days.filter((d) => d.k?.festival).map((d) => ({ n: d.n, name: d.k!.festival!.en }));
  const back = `/lucky-days/${yyyy}/${mm}`;

  return (
    <div className="mx-auto max-w-page safe-x py-5">
      <div className="no-print mb-6">
        <p className="text-muted">{t.intro}</p>
        <p className="mt-4 flex flex-wrap items-center gap-4"><PrintButton label={t.print} /><Link className="link" href={back}>{t.back}</Link></p>
      </div>

      <article className="print-sheet theme-light" aria-labelledby="sheet-h">
        <header className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b-2 border-ink pb-3">
          <h1 id="sheet-h" className="serif text-h1">{label(year, month)}</h1>
          <div className="text-small">
            {khmerHead && <p lang="km">{khmerHead}</p>}
            {first.c && last.c && <p>{t.lunarMonths(first.c.lunarMonth, last.c.lunarMonth)} · {t.chineseYear(elementName(zodiac.element, lang), animalName(zodiac.animal.slug, lang))}</p>}
          </div>
        </header>

        <div className="print-scroll mt-3" tabIndex={0} role="region" aria-labelledby="sheet-h">
        <table className="print-cal">
          <thead><tr>{heads.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
          <tbody>
            {weeks.map((w, i) => (
              <tr key={i}>
                {w.map((d, j) => d ? (
                  <td key={j} className={d.date === now ? "is-today" : undefined}>
                    <span className="print-num serif tabular">{num(d.n, lang)}</span>
                    {d.k && (
                      <span className="print-line">
                        {d.k.sila && <span className="cal-sila" aria-label={t.holy} role="img" />}
                        {d.k.day} {d.k.phase}{d.k.day === 1 && d.k.phase === "waxing" ? ` · ${d.k.month.en}` : ""}
                      </span>
                    )}
                    {d.c && (
                      <span className="print-line">
                        {d.c.quality === "good" && <span role="img" aria-label={t.good}><Seal size="sm" /></span>}
                        {d.c.quality === "challenging" && <span className="cal-dot" role="img" aria-label={t.quiet} />}
                        <span className="tabular">{d.c.lunarDay === 1 ? t.first(d.c.lunarMonth) : num(d.c.lunarDay, lang)}</span>
                      </span>
                    )}
                    {d.k?.festival && <span className="print-fest">{d.k.festival.en}</span>}
                  </td>
                ) : <td key={j} className="is-empty" />)}
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <footer className="mt-3 grid gap-x-6 gap-y-2 text-small sm:grid-cols-2">
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {wantKhmer && <li className="inline-flex items-center gap-2"><span className="cal-sila" aria-hidden="true" />{t.holy}</li>}
            {wantChinese && <li className="inline-flex items-center gap-2"><Seal size="sm" />{t.good}</li>}
            {wantChinese && <li className="inline-flex items-center gap-2"><span className="cal-dot" aria-hidden="true" />{t.quiet}</li>}
            {wantKhmer && <li>{t.keyKhmer}</li>}
            {wantChinese && <li>{t.keyChinese(t.first(9))}</li>}
          </ul>
          {festivals.length > 0 && (
            <p><span className="font-semibold">{t.festivals}:</span> {festivals.map((f) => `${num(f.n, lang)} ${f.name}`).join(" · ")}</p>
          )}
          <p className="text-muted sm:col-span-2">{SITE_NAME} · {SITE_URL.replace(/^https?:\/\//, "")} · {DISCLAIMER}</p>
        </footer>
      </article>
    </div>
  );
}
