/** Lucky days month (wireframe §7.6), with the Khmer calendar when chosen. */
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import AlmanacCalendar, { type CalDay } from "@/components/client/AlmanacCalendar";
import { almanacDay } from "@/lib/almanac";
import { khmerDay, toKhmerNum } from "@/lib/khmer";
import { fullDate, monthName } from "@/lib/dates";
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

export async function generateMetadata({ params }: Params) {
  const { yyyy, mm } = await params;
  const p = parse(yyyy, mm);
  if (!p) return {};
  const label = `${monthName(p.month)} ${p.year}`;
  return pageMetadata({
    title: `Lucky days and Khmer holy days in ${label}`,
    description: `Auspicious days from the Chinese almanac and Buddhist holy days and festivals from the Khmer calendar for ${label}.`,
    path: `/lucky-days/${yyyy}/${mm}`,
    noindex: p.year < 2020 || p.year > 2030,
  });
}

export default async function Month({ params }: Params) {
  const { yyyy, mm } = await params;
  const p = parse(yyyy, mm);
  if (!p) notFound();
  const { year, month } = p;
  const traditions = await chosenTraditions();
  const wantChinese = traditions.includes("chinese") || !traditions.includes("khmer");
  const wantKhmer = traditions.includes("khmer");
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days: CalDay[] = Array.from({ length: count }, (_, i) => {
    const date = `${year}-${mm}-${String(i + 1).padStart(2, "0")}`;
    const d: CalDay = { date, full: fullDate(date) };
    if (wantChinese) {
      const a = almanacDay(date);
      d.chinese = { lunarShort: a.lunarDay === 1 ? `M${a.lunarMonth}` : String(a.lunarDay), lunarLabel: a.lunarLabel, pillar: a.dayPillar, quality: a.quality, good: a.good, avoid: a.avoid, clash: { slug: a.clash.slug, name: a.clash.name } };
    }
    if (wantKhmer) {
      const k = khmerDay(date);
      d.khmer = { short: toKhmerNum(k.day), phase: k.phaseKm, labelKm: k.labelKm, labelEn: k.labelEn, sila: k.sila, festival: k.festival ? { km: k.festival.km, en: k.festival.en } : null };
    }
    return d;
  });
  const firstDow = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const label = `${monthName(month)} ${year}`;
  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const href = (x: { y: number; m: number }) => `/lucky-days/${x.y}/${String(x.m).padStart(2, "0")}`;
  const festivals = days.filter((d) => d.khmer?.festival);
  const good = days.filter((d) => d.chinese?.quality === "good").length;
  const sila = days.filter((d) => d.khmer?.sila).length;

  return (
    <>
      <Breadcrumbs items={[{ name: "Lucky days", href: "/lucky-days" }, { name: label, href: href({ y: year, m: month }) }]} />
      <div className="mx-auto max-w-page safe-x py-5">
        <nav aria-label="Month" className="flex justify-between text-small">
          {prev.y >= CALENDAR_YEARS.min ? <Link className="link inline-flex min-h-tap items-center gap-1" href={href(prev)} rel="prev"><Glyph name="chevron-left" set="ui" className="size-4" />{monthName(prev.m)} {prev.y}</Link> : <span />}
          {next.y <= CALENDAR_YEARS.max ? <Link className="link inline-flex min-h-tap items-center gap-1" href={href(next)} rel="next">{monthName(next.m)} {next.y}<Glyph name="chevron-right" set="ui" className="size-4" /></Link> : <span />}
        </nav>
        <h1 id="month-h" className="mt-3 text-h1">{label}</h1>
        <p className="mt-2 text-muted">
          {[wantChinese && `${good} good days by the Chinese almanac`, wantKhmer && `${sila} Buddhist holy days`].filter(Boolean).join(". ")}.
        </p>
        <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
          <AlmanacCalendar firstDow={firstDow} days={days} />
          <aside className="mt-7 lg:mt-0">
            {festivals.length > 0 && (
              <section className="mb-6" aria-labelledby="fest-h">
                <h2 id="fest-h" className="text-h3">Khmer festivals this month</h2>
                <ul className="mt-2">{festivals.map((d) => <li key={d.date} className="border-b border-rule py-2"><span className="tabular">{Number(d.date.slice(8))}</span> · {d.khmer!.festival!.en}</li>)}</ul>
              </section>
            )}
            <h2 className="text-h3">How these calendars work</h2>
            <div className="reading mt-3 text-body">
              {wantChinese && <p>The Chinese almanac, the tong shu, marks each day with a day spirit and a day officer. Favourable spirits get the seal; days where both lean unfavourable get a small dot. The clash animal is the zodiac animal opposite the day&apos;s branch.</p>}
              {wantKhmer && <p>The Khmer calendar, Chhankitek, follows the Moon. Each month has waxing (<span lang="km">កើត</span>) and waning (<span lang="km">រោច</span>) days. The 8th and 15th of each half are Buddhist holy days, <span lang="km">ថ្ងៃសីល</span>, when many people visit the pagoda.</p>}
              <p className="text-small text-muted">Traditions to enjoy and reflect on, not rules. Medical and catch-all almanac entries are left out. Choose which traditions you see in the header.</p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
