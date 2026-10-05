/** Birth-weekday profile (research §3): planet, colour, personal angel, a short portrait. */
import Link from "@/components/client/LocaleLink";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import AngelCard from "@/components/khmer/AngelCard";
import { WEEKDAYS } from "@/lib/khmer";
import { WEEKDAY_COPY } from "@/lib/khmerWeekdayCopy";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";
import { defineMessages } from "@/lib/i18n";

type Params = { params: Promise<{ day: string }> };
const byName = (d: string) => WEEKDAYS.find((w) => w.en.toLowerCase() === d);
export const dynamicParams = false;
export function generateStaticParams() { return WEEKDAYS.map((w) => ({ day: w.en.toLowerCase() })); }

const T = defineMessages({
  en: {
    hub: "Khmer traditions",
    born: (d: string) => `Born on a ${d}`,
    title: (d: string) => `Born on a ${d}: Khmer birth-day colour and angel`,
    planet: "Planet", colour: "Colour", keyword: "Keyword",
    angel: "Your day's New Year angel",
    angelBody: (d: string) => `Each weekday has one of the seven New Year angels. When Moha Songkran falls on a ${d}, she is the one who arrives.`,
    others: "Other birth days", otherDays: "Other days",
    check: "Check which day I was born",
    note: "Colours and meanings vary between almanacs. A tradition to enjoy, not a prediction.",
  },
});

export async function generateMetadata({ params }: Params) {
  const w = byName((await params).day);
  if (!w) return {};
  const lang = await getLang();
  const name = w.en;
  const copy = (WEEKDAY_COPY)[w.index];
  return pageMetadata({ lang, title: T[lang].title(name), description: copy.summary, path: `/khmer/born-on/${w.en.toLowerCase()}`, type: "article" });
}

export default async function BornOn({ params }: Params) {
  const w = byName((await params).day);
  if (!w) notFound();
  const lang = await getLang();
  const t = T[lang];
  const name = w.en;
  const copy = (WEEKDAY_COPY)[w.index];
  return (
    <>
      <Breadcrumbs items={[{ name: t.hub, href: "/khmer" }, { name: t.born(name), href: `/khmer/born-on/${w.en.toLowerCase()}` }]} />
      <div className="mx-auto max-w-reading safe-x py-6 box-content">
        <h1 className="text-h1">Born on a {w.en} <span lang="km" className="text-muted">កើតថ្ងៃ{w.km}</span></h1>
        <dl className="mt-5 grid grid-cols-3 gap-4 border-y border-rule py-4 text-small">
          <div><dt className="text-muted">{t.planet}</dt><dd className="mt-1 font-semibold">{w.planetEn} <span lang="km" className="font-normal">{w.planetKm}</span></dd></div>
          <div><dt className="text-muted">{t.colour}</dt><dd className="mt-1 flex items-center gap-2 font-semibold"><span className="swatch" style={{ background: `var(--${w.swatch})` }} aria-hidden="true" />{w.colourEn}</dd></div>
          <div><dt className="text-muted">{t.keyword}</dt><dd className="mt-1 font-semibold">{w.quality[0].toUpperCase() + w.quality.slice(1)}</dd></div>
        </dl>
        <div className="reading mt-6">
          <p className="serif text-h3">{copy.summary}</p>
          {copy.body.map((p) => <p key={p} className="mt-4">{p}</p>)}
        </div>
        <section className="mt-7" aria-labelledby="angel-h">
          <h2 id="angel-h" className="text-h2">{t.angel}</h2>
          <p className="reading mt-3">{t.angelBody(name)}</p>
          <div className="mt-4"><AngelCard weekday={w} /></div>
        </section>
        <nav aria-label={t.otherDays} className="mt-7 border-t border-rule pt-5">
          <h2 className="text-h3">{t.others}</h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {WEEKDAYS.filter((x) => x.index !== w.index).map((x) => <li key={x.index}><Link className="link inline-flex min-h-tap items-center" href={`/khmer/born-on/${x.en.toLowerCase()}`}>{x.en}</Link></li>)}
          </ul>
          <p className="mt-4"><Link className="btn-primary" href="/tools/zodiac-calculator">{t.check}</Link></p>
        </nav>
        <p className="mt-6 text-small text-muted">{t.note}</p>
      </div>
    </>
  );
}
