/** Lucky days month (wireframe §7.6), with the Khmer calendar when chosen. */
import Link from "@/components/client/LocaleLink";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import AlmanacCalendar, { type CalDay } from "@/components/client/AlmanacCalendar";
import { almanacDay } from "@/lib/almanac";
import { khmerDay } from "@/lib/khmer";
import { fullDate, monthName } from "@/lib/dates";
import { getLang } from "@/lib/langServer";
import { defineMessages, num } from "@/lib/i18n";
import { chosenTraditions } from "@/lib/traditionsServer";
import { pageMetadata } from "@/lib/seo";
import { CALENDAR_YEARS } from "@/lib/site";

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
    title: (l: string) => `Lucky days and Khmer holy days in ${l}`,
    description: (l: string) => `Auspicious days from the Chinese almanac and Buddhist holy days and festivals from the Khmer calendar for ${l}.`,
    crumb: "Lucky days", monthNav: "Month",
    goodCount: (n: number) => `${n} good days by the Chinese almanac`,
    silaCount: (n: number) => `${n} Buddhist holy days`,
    end: ".", sep: ". ",
    festivals: "Khmer festivals this month",
    finder: "Find a lucky date for an occasion",
    hours: "Today's good hours",
    print: "Print this month",
    how: "How these calendars work",
    howChinese: "The Chinese almanac, the tong shu, marks each day with a day spirit and a day officer. Favourable spirits get the seal; days where both lean unfavourable get a small dot. The clash animal is the zodiac animal opposite the day's branch.",
    note: "Traditions to enjoy and reflect on, not rules. Medical and catch-all almanac entries are left out. Choose which traditions you see in the header.",
  },
});

const label = (y: number, m: number) => (`${monthName(m)} ${y}`);

export async function generateMetadata({ params }: Params) {
  const { yyyy, mm } = await params;
  const p = parse(yyyy, mm);
  if (!p) return {};
  const lang = await getLang();
  const l = label(p.year, p.month);
  return pageMetadata({
    lang,
    title: T[lang].title(l),
    description: T[lang].description(l),
    path: `/lucky-days/${yyyy}/${mm}`,
    noindex: p.year < 2020 || p.year > 2030,
  });
}

export default async function Month({ params }: Params) {
  const { yyyy, mm } = await params;
  const p = parse(yyyy, mm);
  if (!p) notFound();
  const { year, month } = p;
  const lang = await getLang();
  const t = T[lang];
  const traditions = await chosenTraditions();
  const wantChinese = traditions.includes("chinese") || !traditions.includes("khmer");
  const wantKhmer = traditions.includes("khmer");
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days: CalDay[] = Array.from({ length: count }, (_, i) => {
    const date = `${year}-${mm}-${String(i + 1).padStart(2, "0")}`;
    const d: CalDay = { date, full: fullDate(date, lang) };
    if (wantChinese) {
      const a = almanacDay(date);
      d.chinese = { lunarShort: a.lunarDay === 1 ? (`M${a.lunarMonth}`) : String(a.lunarDay), lunarLabel: a.lunarLabel, pillar: a.dayPillar, quality: a.quality, good: a.good, avoid: a.avoid, clash: { slug: a.clash.slug, name: a.clash.name } };
    }
    if (wantKhmer) {
      const k = khmerDay(date);
      d.khmer = { short: String(k.day), phase: k.phase === "waxing" ? " waxing" : " waning", labelKm: k.labelKm, labelEn: k.labelEn, labelKmShort: k.labelKmShort, sila: k.sila, festival: k.festival ? { km: k.festival.km, en: k.festival.en } : null };
    }
    return d;
  });
  const firstDow = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const title = label(year, month);
  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const href = (x: { y: number; m: number }) => `/lucky-days/${x.y}/${String(x.m).padStart(2, "0")}`;
  const festivals = days.filter((d) => d.khmer?.festival);
  const good = days.filter((d) => d.chinese?.quality === "good").length;
  const sila = days.filter((d) => d.khmer?.sila).length;

  return (
    <>
      <Breadcrumbs items={[{ name: t.crumb, href: "/lucky-days" }, { name: title, href: href({ y: year, m: month }) }]} />
      <div className="mx-auto max-w-page safe-x py-5">
        <nav aria-label={t.monthNav} className="flex justify-between text-small">
          {prev.y >= CALENDAR_YEARS.min ? <Link className="link inline-flex min-h-tap items-center gap-1" href={href(prev)} rel="prev"><Glyph name="chevron-left" set="ui" className="size-4" />{label(prev.y, prev.m)}</Link> : <span />}
          {next.y <= CALENDAR_YEARS.max ? <Link className="link inline-flex min-h-tap items-center gap-1" href={href(next)} rel="next">{label(next.y, next.m)}<Glyph name="chevron-right" set="ui" className="size-4" /></Link> : <span />}
        </nav>
        <h1 id="month-h" className="mt-3 text-h1">{title}</h1>
        <p className="mt-2 text-muted">
          {[wantChinese && t.goodCount(good), wantKhmer && t.silaCount(sila)].filter(Boolean).join(t.sep)}{t.end}
        </p>
        <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
          <AlmanacCalendar firstDow={firstDow} days={days} />
          <aside className="mt-7 lg:mt-0">
            {festivals.length > 0 && (
              <section className="mb-6" aria-labelledby="fest-h">
                <h2 id="fest-h" className="text-h3">{t.festivals}</h2>
                <ul className="mt-2">{festivals.map((d) => <li key={d.date} className="border-b border-rule py-2"><span className="tabular">{num(Number(d.date.slice(8)), lang)}</span> · {d.khmer!.festival!.en}</li>)}</ul>
              </section>
            )}
            <p className="mb-6"><Link className="link" href={`${href({ y: year, m: month })}/print`}>{t.print}</Link>{wantChinese && <> · <Link className="link" href="/lucky-days/finder">{t.finder}</Link> · <Link className="link" href="/good-hours">{t.hours}</Link></>}</p>
            <h2 className="text-h3">{t.how}</h2>
            <div className="reading mt-3 text-body">
              {wantChinese && <p>{t.howChinese}</p>}
              {wantKhmer && <p>The Khmer calendar, Chhankitek, follows the Moon. Each month has waxing (<span lang="km">កើត</span>) and waning (<span lang="km">រោច</span>) days. The 8th and 15th of each half are Buddhist holy days, <span lang="km">ថ្ងៃសីល</span>, when many people visit the pagoda.</p>}
              <p className="text-small text-muted">{t.note}</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
