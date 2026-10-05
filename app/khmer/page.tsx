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
import { getLang } from "@/lib/langServer";
import { defineMessages } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const T = defineMessages({
  en: {
    title: "Khmer traditions: calendar, birth day and New Year angel",
    description: "Today's Khmer lunar date, Buddhist holy days, your Khmer animal year and birth-day colour, and the Khmer New Year angel, calculated the traditional way.",
    crumb: "Khmer traditions",
    intro: "The Khmer calendar follows the Moon and the Buddhist year. Here it is calculated with the traditional Chhankitek method, the same arithmetic printed Khmer calendars use.",
    ny: (y: number) => `Khmer New Year ${y}`,
    moment: (date: string, time: string) => `Moha Songkran: ${date}, about ${time} Cambodian time.`,
    meet: "Meet the New Year angel",
    animals: "The twelve animal years",
    animalsBody: "Cambodia shares the twelve animals with China and Vietnam. The difference is the starting line: the Khmer animal year begins at the exact moment of Moha Songkran in mid-April, not at Lunar New Year. Each year also carries a",
    sak: "sak",
    animalsEnd: ", a ten-year count.",
    find: "Find my Khmer animal and birth day",
    what: "What we calculate, and what we leave to people",
    what1: "We calculate what tradition fixes by rule: the lunar date, holy days, festivals, the animal year, your birth weekday and its colour, and the New Year moment and angel.",
    what2: "We don't pick wedding or house-moving days. Families ask an achar for that, and no single published rule exists. We also leave out omens about illness, accidents or war, and anything that asks you to pay for a ritual.",
    cal: "Open the Khmer calendar", converter: "Convert a date", colours: "Colour of the day",
    sea: "The zodiac across Southeast Asia",
  },
});

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/khmer" });
}

export default async function KhmerHub() {
  const lang = await getLang();
  const t = T[lang];
  const date = await today();
  const day = khmerDay(date);
  const y = Number(date.slice(0, 4));
  const { s: ny } = songkranFor(date > `${y}-04-17` ? y + 1 : y);
  return (
    <>
      <Breadcrumbs items={[{ name: t.crumb, href: "/khmer" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">Khmer traditions <span lang="km" className="text-muted">ប្រពៃណីខ្មែរ</span></h1>
        <p className="reading mt-3 text-muted">{t.intro}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <KhmerDayCard day={day} />
          <section aria-labelledby="ny-h" className="border-y-2 border-ink py-5">
            <h2 id="ny-h" className="text-h3">{t.ny(ny.year)}</h2>
            <p className="mt-3">{t.moment(fullDate(ny.date, lang), ny.time)}</p>
            <Countdown to={ny.instantIso} />
            {(
              <p className="mt-3">The year&apos;s angel is <span lang="km">{ny.angel.km}</span> ({ny.angel.roman}).</p>
            )}
            <p className="mt-4"><Link className="link" href="/khmer/new-year">{t.meet}</Link></p>
          </section>
        </div>

        <div className="mt-7 border-t border-rule pt-7"><WeekdayChips /></div>

        <section className="mt-7 border-t border-rule pt-7" aria-labelledby="animals-h">
          <h2 id="animals-h" className="text-h2">{t.animals}</h2>
          <p className="reading mt-3">{t.animalsBody} <em>{t.sak}</em>{t.animalsEnd}</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-5 sm:grid-cols-3 md:grid-cols-4">
            {KHMER_ANIMALS.map((a) => (
              <li key={a.slug} className="border-b border-rule py-2">
                <Link className="link inline-flex min-h-tap items-center" href={`/chinese-zodiac/${a.slug}`}>{a.en}</Link> <span lang="km">{a.km}</span> <span className="text-muted">{a.roman}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5"><Link className="btn-primary" href="/tools/zodiac-calculator">{t.find}</Link></p>
        </section>

        <section className="mt-7 border-t border-rule pt-7 max-w-reading" aria-labelledby="what-h">
          <h2 id="what-h" className="text-h2">{t.what}</h2>
          <div className="reading mt-3">
            <p>{t.what1}</p>
            <p>{t.what2}</p>
          </div>
          <p className="mt-4"><Link className="link" href="/lucky-days">{t.cal}</Link> · <Link className="link" href="/tools/date-converter">{t.converter}</Link> · <Link className="link" href="/khmer/colours">{t.colours}</Link> · <Link className="link" href="/southeast-asian-zodiac">{t.sea}</Link></p>
        </section>
      </div>
    </>
  );
}
