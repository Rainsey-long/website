/** Khmer New Year: Moha Songkran moment, festival days, the year's angel. Official time and prediction come from the admin when entered. */
import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import AngelCard from "@/components/khmer/AngelCard";
import Countdown from "@/components/client/Countdown";
import { WEEKDAYS } from "@/lib/khmer";
import { songkranFor } from "@/lib/songkranStore";
import { fullDate } from "@/lib/dates";
import { today } from "@/lib/today";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({
  title: "Khmer New Year: date, time and the New Year angel",
  description: "When Moha Songkran falls this year, the three or four days of Khmer New Year, and the New Year angel (Tevoda) who arrives, with her colour, flower and mount.",
  path: "/khmer/new-year",
});

export default async function NewYear() {
  const date = await today();
  const y = Number(date.slice(0, 4));
  const year = date > `${y}-04-17` ? y + 1 : y;
  const { s, tumneay, source } = songkranFor(year);
  const prev = songkranFor(year - 1).s;
  return (
    <>
      <Breadcrumbs items={[{ name: "Khmer traditions", href: "/khmer" }, { name: "Khmer New Year", href: "/khmer/new-year" }]} />
      <div className="mx-auto max-w-page safe-x py-6 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
        <article className="max-w-reading">
          <h1 className="text-h1">Khmer New Year {year} <span lang="km" className="text-muted">ចូលឆ្នាំខ្មែរ</span></h1>
          <p className="mt-2 text-small text-muted">Choul Chnam Thmey</p>
          <section className="mt-6 border-y-2 border-ink py-5" aria-labelledby="moment-h">
            <h2 id="moment-h" className="text-h3">Moha Songkran</h2>
            <p className="mt-2 serif text-h2">{fullDate(s.date)}, {s.time}</p>
            <p className="mt-1 text-small text-muted">
              Cambodian time (UTC+7). {s.source === "official" ? `Official time${source ? `, ${source}` : ""}.` : "Calculated with the traditional method; the Ministry of Cults and Religion announces the official minute each year."}
            </p>
            <Countdown to={s.instantIso} />
          </section>

          <section className="mt-7" aria-labelledby="days-h">
            <h2 id="days-h" className="text-h2">The {s.days.length} days</h2>
            <ol className="mt-3">
              {s.days.map((d, i) => (
                <li key={d.date} className="border-b border-rule py-3">
                  <span className="tabular text-muted">Day {i + 1}</span> · {fullDate(d.date)}: <span className="font-semibold">{d.en}</span> <span lang="km">{d.km}</span>
                </li>
              ))}
            </ol>
            <p className="reading mt-3">The first day welcomes the new angel. The middle day, Vanabat, is for offerings to elders and the pagoda. Leung Sak, the last day, is when the new year count begins.</p>
          </section>

          <section className="mt-7" aria-labelledby="angel-h">
            <h2 id="angel-h" className="text-h2">This year&apos;s angel</h2>
            <p className="reading mt-3">Seven angels, the daughters of Kabil Moha Prom, take turns to carry the New Year. The one who arrives is the angel of the weekday on which Moha Songkran falls. In {year} that is {s.weekday.en}, so <span lang="km">{s.angel.km}</span> ({s.angel.roman}) comes, {s.posture.en} (<span lang="km">{s.posture.km}</span>), because she arrives {s.time < "06:00" ? "before dawn" : s.time < "12:00" ? "in the morning" : s.time < "18:00" ? "in the afternoon" : "in the evening"}.</p>
            <div className="mt-4"><AngelCard weekday={s.weekday} /></div>
          </section>

          {tumneay && (
            <section className="mt-7 border-t border-rule pt-5" aria-labelledby="tumneay-h">
              <h2 id="tumneay-h" className="text-h2">The year&apos;s traditional saying <span lang="km" className="text-muted">ទំនាយ</span></h2>
              <p className="reading mt-3 whitespace-pre-line">{tumneay}</p>
              {source && <p className="mt-2 text-small text-muted">Source: {source}</p>}
            </section>
          )}

          <section className="mt-7 border-t border-rule pt-5" aria-labelledby="all-h">
            <h2 id="all-h" className="text-h2">All seven angels</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">{WEEKDAYS.map((w) => <AngelCard key={w.index} weekday={w} />)}</div>
            <p className="mt-4 text-small text-muted">From the Khmer Customs Committee&apos;s 1960 description. Robe colours vary between almanacs, and newer books give some days different colours.</p>
          </section>

          <p className="mt-7 text-small text-muted">Last year: Moha Songkran {fullDate(prev.date)}, {prev.time}, with <span lang="km">{prev.angel.km}</span> ({prev.angel.roman}).</p>
          <p className="mt-2"><Link className="link" href="/khmer">Khmer traditions</Link></p>
        </article>
      </div>
    </>
  );
}
