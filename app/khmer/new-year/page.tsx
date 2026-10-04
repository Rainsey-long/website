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
import { getLang } from "@/lib/langServer";
import { defineMessages, khmerDigits } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const T = defineMessages({
  en: {
    title: "Khmer New Year: date, time and the New Year angel",
    description: "When Moha Songkran falls this year, the three or four days of Khmer New Year, and the New Year angel (Tevoda) who arrives, with her colour, flower and mount.",
    hub: "Khmer traditions",
    crumb: "Khmer New Year",
    h1: (y: number) => `Khmer New Year ${y}`,
    sub: "Choul Chnam Thmey",
    moment: "Moha Songkran",
    when: (date: string, time: string) => `${date}, ${time}`,
    zone: "Cambodian time (UTC+7).",
    official: (src: string | null) => `Official time${src ? `, ${src}` : ""}.`,
    calculated: "Calculated with the traditional method; the Ministry of Cults and Religion announces the official minute each year.",
    days: (n: number) => `The ${n} days`,
    day: (n: number) => `Day ${n}`,
    daysBody: "The first day welcomes the new angel. The middle day, Vanabat, is for offerings to elders and the pagoda. Leung Sak, the last day, is when the new year count begins.",
    angel: "This year's angel",
    tumneay: "The year's traditional saying",
    source: (s: string) => `Source: ${s}`,
    all: "All seven angels",
    allNote: "From the Khmer Customs Committee's 1960 description. Robe colours vary between almanacs, and newer books give some days different colours.",
  },
  km: {
    title: "ចូលឆ្នាំខ្មែរ៖ ថ្ងៃ ម៉ោង និងទេវតាឆ្នាំថ្មី",
    description: "ពេលមហាសង្ក្រាន្តឆ្នាំនេះ ថ្ងៃទាំងបី ឬបួននៃបុណ្យចូលឆ្នាំខ្មែរ និងទេវតាឆ្នាំថ្មីដែលយាងមក ព្រមទាំងពណ៌ ផ្កា និងពាហនៈរបស់នាង។",
    hub: "ប្រពៃណីខ្មែរ",
    crumb: "ចូលឆ្នាំខ្មែរ",
    h1: (y: number) => `ចូលឆ្នាំខ្មែរ ${khmerDigits(y)}`,
    sub: "បុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ",
    moment: "មហាសង្ក្រាន្ត",
    when: (date: string, time: string) => `${date} ម៉ោង ${khmerDigits(time)}`,
    zone: "ម៉ោងនៅកម្ពុជា (UTC+៧)។",
    official: (src: string | null) => `ម៉ោងផ្លូវការ${src ? ` ${src}` : ""}។`,
    calculated: "គណនាតាមវិធីប្រពៃណី។ ក្រសួងធម្មការ និងសាសនាប្រកាសនាទីផ្លូវការជារៀងរាល់ឆ្នាំ។",
    days: (n: number) => `ថ្ងៃទាំង${khmerDigits(n)}`,
    day: (n: number) => `ថ្ងៃទី${khmerDigits(n)}`,
    daysBody: "ថ្ងៃទីមួយជាថ្ងៃទទួលទេវតាថ្មី។ ថ្ងៃកណ្ដាល គឺវារៈវ័នបត ជាថ្ងៃធ្វើបុណ្យជូនចាស់ទុំ និងវត្តអារាម។ ថ្ងៃចុងក្រោយ គឺវារៈឡើងស័ក ជាថ្ងៃចាប់ផ្ដើមរាប់ឆ្នាំថ្មី។",
    angel: "ទេវតាប្រចាំឆ្នាំនេះ",
    tumneay: "ទំនាយប្រចាំឆ្នាំ",
    source: (s: string) => `ប្រភព៖ ${s}`,
    all: "ទេវតាទាំងប្រាំពីរ",
    allNote: "តាមការពិពណ៌នារបស់គណៈកម្មការទំនៀមទម្លាប់ខ្មែរ ឆ្នាំ១៩៦០។ ពណ៌សម្លៀកបំពាក់ខុសគ្នាខ្លះពីសាស្ត្រាមួយទៅសាស្ត្រាមួយ ហើយសៀវភៅថ្មីៗខ្លះឲ្យពណ៌ផ្សេងសម្រាប់ថ្ងៃខ្លះ។",
  },
});

const ARRIVES = {
  en: (time: string) => (time < "06:00" ? "before dawn" : time < "12:00" ? "in the morning" : time < "18:00" ? "in the afternoon" : "in the evening"),
  km: (time: string) => (time < "06:00" ? "មុនថ្ងៃរះ" : time < "12:00" ? "ពេលព្រឹក" : time < "18:00" ? "ពេលរសៀល" : "ពេលល្ងាច"),
};

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/khmer/new-year" });
}

export default async function NewYear() {
  const lang = await getLang();
  const t = T[lang];
  const km = lang === "km";
  const date = await today();
  const y = Number(date.slice(0, 4));
  const year = date > `${y}-04-17` ? y + 1 : y;
  const { s, tumneay, source } = songkranFor(year);
  const prev = songkranFor(year - 1).s;
  return (
    <>
      <Breadcrumbs items={[{ name: t.hub, href: "/khmer" }, { name: t.crumb, href: "/khmer/new-year" }]} />
      <div className="mx-auto max-w-page safe-x py-6 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
        <article className="max-w-reading">
          <h1 className="text-h1">{km ? t.h1(year) : <>Khmer New Year {year} <span lang="km" className="text-muted">ចូលឆ្នាំខ្មែរ</span></>}</h1>
          <p className="mt-2 text-small text-muted">{t.sub}</p>
          <section className="mt-6 border-y-2 border-ink py-5" aria-labelledby="moment-h">
            <h2 id="moment-h" className="text-h3">{t.moment}</h2>
            <p className="mt-2 serif text-h2">{t.when(fullDate(s.date, lang), s.time)}</p>
            <p className="mt-1 text-small text-muted">
              {t.zone} {s.source === "official" ? t.official(source) : t.calculated}
            </p>
            <Countdown to={s.instantIso} />
          </section>

          <section className="mt-7" aria-labelledby="days-h">
            <h2 id="days-h" className="text-h2">{t.days(s.days.length)}</h2>
            <ol className="mt-3">
              {s.days.map((d, i) => (
                <li key={d.date} className="border-b border-rule py-3">
                  {km
                    ? <><span className="tabular text-muted">{t.day(i + 1)}</span> · {fullDate(d.date, lang)}៖ <span className="font-semibold">{d.km}</span></>
                    : <><span className="tabular text-muted">{t.day(i + 1)}</span> · {fullDate(d.date)}: <span className="font-semibold">{d.en}</span> <span lang="km">{d.km}</span></>}
                </li>
              ))}
            </ol>
            <p className="reading mt-3">{t.daysBody}</p>
          </section>

          <section className="mt-7" aria-labelledby="angel-h">
            <h2 id="angel-h" className="text-h2">{t.angel}</h2>
            {km ? (
              <p className="reading mt-3">{`ទេវតាប្រាំពីរអង្គ ជាបុត្រីរបស់កបិលមហាព្រហ្ម ផ្លាស់វេនគ្នាទទួលឆ្នាំថ្មី។ ទេវតាដែលយាងមក គឺទេវតាប្រចាំថ្ងៃដែលមហាសង្ក្រាន្តធ្លាក់ចំ។ នៅឆ្នាំ${khmerDigits(year)} គឺថ្ងៃ${s.weekday.km} ដូច្នេះ ${s.angel.km} យាងមក ដោយ${s.posture.km} ព្រោះនាងយាងមក${ARRIVES.km(s.time)}។`}</p>
            ) : (
              <p className="reading mt-3">Seven angels, the daughters of Kabil Moha Prom, take turns to carry the New Year. The one who arrives is the angel of the weekday on which Moha Songkran falls. In {year} that is {s.weekday.en}, so <span lang="km">{s.angel.km}</span> ({s.angel.roman}) comes, {s.posture.en} (<span lang="km">{s.posture.km}</span>), because she arrives {ARRIVES.en(s.time)}.</p>
            )}
            <div className="mt-4"><AngelCard weekday={s.weekday} /></div>
          </section>

          {tumneay && (
            <section className="mt-7 border-t border-rule pt-5" aria-labelledby="tumneay-h">
              <h2 id="tumneay-h" className="text-h2">{km ? t.tumneay : <>{t.tumneay} <span lang="km" className="text-muted">ទំនាយ</span></>}</h2>
              <p className="reading mt-3 whitespace-pre-line">{tumneay}</p>
              {source && <p className="mt-2 text-small text-muted">{t.source(source)}</p>}
            </section>
          )}

          <section className="mt-7 border-t border-rule pt-5" aria-labelledby="all-h">
            <h2 id="all-h" className="text-h2">{t.all}</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">{WEEKDAYS.map((w) => <AngelCard key={w.index} weekday={w} />)}</div>
            <p className="mt-4 text-small text-muted">{t.allNote}</p>
          </section>

          {km ? (
            <p className="mt-7 text-small text-muted">{`ឆ្នាំមុន៖ មហាសង្ក្រាន្ត ${fullDate(prev.date, lang)} ម៉ោង ${khmerDigits(prev.time)} ជាមួយ ${prev.angel.km}។`}</p>
          ) : (
            <p className="mt-7 text-small text-muted">Last year: Moha Songkran {fullDate(prev.date)}, {prev.time}, with <span lang="km">{prev.angel.km}</span> ({prev.angel.roman}).</p>
          )}
          <p className="mt-2"><Link className="link" href="/khmer">{t.hub}</Link></p>
        </article>
      </div>
    </>
  );
}
