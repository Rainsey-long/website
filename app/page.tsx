/** Homepage (wireframe §7.1), arranged by the traditions the visitor chose. */
import Link from "@/components/client/LocaleLink";
import DayDial from "@/components/DayDial";
import ChipGrid from "@/components/ChipGrid";
import LuckyRow from "@/components/LuckyRow";
import Glyph from "@/components/Glyph";
import KhmerDayCard from "@/components/khmer/KhmerDayCard";
import WeekdayChips from "@/components/khmer/WeekdayChips";
import HomeMyReading from "@/components/client/HomeMyReading";
import { skyForDay } from "@/lib/sky";
import { addDays, fullDate, longDate } from "@/lib/dates";
import { animalChips, generalLucky, signChips } from "@/lib/pages";
import { readingsForDay } from "@/lib/reading-engine";
import { blockTexts } from "@/lib/blockText";
import { chineseScore, pairSlug, westernScore } from "@/lib/compatibility";
import { animalBySlug } from "@/lib/chinese";
import { signBySlug } from "@/lib/western";
import { khmerDay, songkran } from "@/lib/khmer";
import { today } from "@/lib/today";
import { chosenTraditions } from "@/lib/traditionsServer";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({
  title: SITE_TAGLINE,
  description: "Free daily horoscopes, Chinese zodiac and Khmer traditions, the 2027 Fire Goat forecast, compatibility and lucky days, from real sky data.",
  path: "/",
});

export default async function Home() {
  const date = await today();
  const traditions = await chosenTraditions();
  const show = (t: "western" | "chinese" | "khmer") => traditions.includes(t);
  const sky = skyForDay(date);
  const texts = blockTexts();

  const summaries: Record<string, Record<string, { energy: number[]; line: string; date: string }>> = {};
  for (const d of [addDays(date, -1), date, addDays(date, 1)]) {
    summaries[d] = {};
    for (const r of readingsForDay(d, texts)) {
      summaries[d][r.sign.slug] = { energy: r.topics.map((t) => t.energy), line: r.topics[3].text.split(/(?<=\.)\s/)[0], date: fullDate(d) };
    }
  }
  const lucky = generalLucky(date);
  const kday = khmerDay(date);
  const year = Number(date.slice(0, 4));
  const ny = songkran(date > `${year}-04-17` ? year + 1 : year);

  const westernPairs = [["aries", "leo"], ["taurus", "cancer"], ["gemini", "libra"], ["scorpio", "pisces"], ["virgo", "capricorn"], ["leo", "aquarius"]].map(([a, b]) => ({
    href: `/compatibility/${pairSlug(a, b)}`, label: `${signBySlug(a)!.name} and ${signBySlug(b)!.name}`, score: westernScore(signBySlug(a)!, signBySlug(b)!).score,
  }));
  const chinesePairs = [["rat", "dragon"], ["tiger", "horse"], ["rabbit", "goat"], ["dragon", "rooster"], ["horse", "goat"], ["rat", "ox"]].map(([a, b]) => ({
    href: `/chinese-compatibility/${pairSlug(a, b)}`, label: `${animalBySlug(a)!.name} and ${animalBySlug(b)!.name}`, score: chineseScore(animalBySlug(a)!, animalBySlug(b)!).score,
  }));

  // Answer first (DESIGN_SYSTEM §1.2, §7.1): with Western readings on, the sign
  // picker sits directly under the dial and the Khmer day follows it.
  const khmerToday = show("khmer") ? (
    <div className={show("western") ? "border-t border-rule py-7" : "py-7"}>
      {!show("western") && <p className="serif text-h2">Today, <time dateTime={date}>{longDate(date)}</time></p>}
      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <KhmerDayCard day={kday} />
        <section aria-labelledby="ny-h" className="border-y-2 border-ink py-5">
          <h2 id="ny-h" className="text-h3">Khmer New Year {ny.year}</h2>
          <p className="mt-3">Moha Songkran falls on {fullDate(ny.date)}, around {ny.time} Cambodian time. The New Year angel is <span lang="km">{ny.angel.km}</span> ({ny.angel.roman}), arriving {ny.posture.en}.</p>
          <p className="mt-4 text-small"><Link className="link" href="/khmer/new-year">Read about the New Year angel</Link></p>
        </section>
      </div>
    </div>
  ) : null;

  return (
    <>
      <h1 className="sr-only">{SITE_NAME}: daily horoscopes, Chinese zodiac, Khmer traditions and lucky days</h1>
      {show("western") && <HomeMyReading summaries={summaries} today={date} />}

      {show("western") && (
        <section className="night-band" aria-labelledby="today-h">
          <div className="mx-auto flex max-w-page flex-col items-center safe-x py-7 md:py-8">
            <p id="today-h" className="serif text-h2 text-center">Today, <time dateTime={date}>{longDate(date)}</time></p>
            <div className="mt-6"><DayDial sky={sky} tone="night" id="home-dial" /></div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-page safe-x">
        {!show("western") && khmerToday}
        {show("western") && (
          <div className="border-t border-rule py-7">
            <ChipGrid items={signChips()} set="western" heading="Pick your sign" headingId="pick-sign" remember />
            <p className="mt-4"><Link className="link" href="/tools/zodiac-calculator">Find my sign</Link></p>
          </div>
        )}

        {show("western") && khmerToday}

        {show("khmer") && <div className="border-t border-rule py-7"><WeekdayChips /></div>}

        {show("chinese") && (
          <>
            <div className="border-t border-rule py-7">
              <ChipGrid items={animalChips(year)} set="animal" heading="Chinese zodiac" headingId="pick-animal" />
              <p className="mt-4 text-muted">Your animal comes from your birth year, counted from Lunar New Year. <Link className="link text-ink" href="/tools/zodiac-calculator">Find your animal</Link></p>
            </div>
            <div className="border-t border-rule py-7">
              <LuckyRow heading={`Today's Chinese almanac: ${lucky.almanac.lunarLabel}`} headingId="almanac-h" color={lucky.color} number={lucky.number} hour={lucky.hour} seal={lucky.seal} />
              <p className="mt-4 text-muted">Day of {lucky.almanac.dayPillar}. Clashes with the {lucky.almanac.clash.name}. <Link className="link text-ink" href={`/lucky-days/${date.slice(0, 4)}/${date.slice(5, 7)}`}>See this month&apos;s lucky days</Link></p>
            </div>
            <section className="border-t border-rule py-7" aria-labelledby="goat-h">
              <h2 id="goat-h" className="text-h2">2027 Year of the Fire Goat</h2>
              <p className="reading mt-3">The Fire Goat year begins at Lunar New Year on 6 February 2027. Read what it may bring for your animal.</p>
              <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-1 sm:grid-cols-3 md:grid-cols-4">
                {animalChips(2027).map((a) => (
                  <li key={a.slug}><Link className="link inline-flex min-h-tap items-center gap-2" href={`/chinese-zodiac/${a.slug}/2027`}><Glyph name={a.slug} set="animal" className="size-5" />{a.name}</Link></li>
                ))}
              </ul>
            </section>
          </>
        )}

        <section className="border-t border-rule py-7" aria-labelledby="pairs-h">
          <h2 id="pairs-h" className="text-h2">Popular compatibility pairs</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            {show("western") && (
              <div>
                <h3 className="text-h3">Western signs</h3>
                <ul className="mt-3">{westernPairs.map((p) => <li key={p.href} className="flex justify-between border-b border-rule py-3"><Link className="link" href={p.href}>{p.label}</Link><span className="tabular text-muted">{p.score}</span></li>)}</ul>
              </div>
            )}
            {(show("chinese") || show("khmer")) && (
              <div>
                <h3 className="text-h3">Zodiac animals</h3>
                <ul className="mt-3">{chinesePairs.map((p) => <li key={p.href} className="flex justify-between border-b border-rule py-3"><Link className="link" href={p.href}>{p.label}</Link><span className="tabular text-muted">{p.score}</span></li>)}</ul>
              </div>
            )}
          </div>
          <p className="mt-5"><Link className="btn-secondary" href="/tools/compatibility-checker">Check compatibility</Link></p>
        </section>
      </div>
    </>
  );
}
