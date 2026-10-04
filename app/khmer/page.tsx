/** Khmer traditions hub: what can be computed honestly, and links into each. */
import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import KhmerDayCard from "@/components/khmer/KhmerDayCard";
import WeekdayChips from "@/components/khmer/WeekdayChips";
import Countdown from "@/components/client/Countdown";
import { KHMER_ANIMALS, khmerDay } from "@/lib/khmer";
import { songkranFor } from "@/lib/songkranStore";
import { fullDate } from "@/lib/dates";
import { today } from "@/lib/today";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({
  title: "Khmer traditions: calendar, birth day and New Year angel",
  description: "Today's Khmer lunar date, Buddhist holy days, your Khmer animal year and birth-day colour, and the Khmer New Year angel, calculated the traditional way.",
  path: "/khmer",
});

export default async function KhmerHub() {
  const date = await today();
  const day = khmerDay(date);
  const y = Number(date.slice(0, 4));
  const { s: ny } = songkranFor(date > `${y}-04-17` ? y + 1 : y);
  return (
    <>
      <Breadcrumbs items={[{ name: "Khmer traditions", href: "/khmer" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">Khmer traditions <span lang="km" className="text-muted">ប្រពៃណីខ្មែរ</span></h1>
        <p className="reading mt-3 text-muted">The Khmer calendar follows the Moon and the Buddhist year. Here it is calculated with the traditional Chhankitek method, the same arithmetic printed Khmer calendars use.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <KhmerDayCard day={day} />
          <section aria-labelledby="ny-h" className="border-y-2 border-ink py-5">
            <h2 id="ny-h" className="text-h3">Khmer New Year {ny.year}</h2>
            <p className="mt-3">Moha Songkran: {fullDate(ny.date)}, about {ny.time} Cambodian time.</p>
            <Countdown to={ny.instantIso} />
            <p className="mt-3">The year&apos;s angel is <span lang="km">{ny.angel.km}</span> ({ny.angel.roman}).</p>
            <p className="mt-4"><Link className="link" href="/khmer/new-year">Meet the New Year angel</Link></p>
          </section>
        </div>

        <div className="mt-7 border-t border-rule pt-7"><WeekdayChips /></div>

        <section className="mt-7 border-t border-rule pt-7" aria-labelledby="animals-h">
          <h2 id="animals-h" className="text-h2">The twelve animal years</h2>
          <p className="reading mt-3">Cambodia shares the twelve animals with China and Vietnam. The difference is the starting line: the Khmer animal year begins at the exact moment of Moha Songkran in mid-April, not at Lunar New Year. Each year also carries a <em>sak</em>, a ten-year count.</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-5 sm:grid-cols-3 md:grid-cols-4">
            {KHMER_ANIMALS.map((a) => (
              <li key={a.slug} className="border-b border-rule py-2"><Link className="link" href={`/chinese-zodiac/${a.slug}`}>{a.en}</Link> <span lang="km">{a.km}</span> <span className="text-muted">{a.roman}</span></li>
            ))}
          </ul>
          <p className="mt-5"><Link className="btn-primary" href="/tools/zodiac-calculator">Find my Khmer animal and birth day</Link></p>
        </section>

        <section className="mt-7 border-t border-rule pt-7 max-w-reading" aria-labelledby="what-h">
          <h2 id="what-h" className="text-h2">What we calculate, and what we leave to people</h2>
          <div className="reading mt-3">
            <p>We calculate what tradition fixes by rule: the lunar date, holy days, festivals, the animal year, your birth weekday and its colour, and the New Year moment and angel.</p>
            <p>We don&apos;t pick wedding or house-moving days. Families ask an achar for that, and no single published rule exists. We also leave out omens about illness, accidents or war, and anything that asks you to pay for a ritual.</p>
          </div>
          <p className="mt-4"><Link className="link" href="/lucky-days">Open the Khmer calendar</Link> · <Link className="link" href="/southeast-asian-zodiac">The zodiac across Southeast Asia</Link></p>
        </section>
      </div>
    </>
  );
}
