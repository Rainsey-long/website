/** Birth-weekday profile (research §3): planet, colour, personal angel, a short portrait. */
import Link from "@/components/client/LocaleLink";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import AngelCard from "@/components/khmer/AngelCard";
import { WEEKDAYS } from "@/lib/khmer";
import { WEEKDAY_COPY } from "@/lib/khmerWeekdayCopy";
import { pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ day: string }> };
const byName = (d: string) => WEEKDAYS.find((w) => w.en.toLowerCase() === d);
export const dynamicParams = false;
export function generateStaticParams() { return WEEKDAYS.map((w) => ({ day: w.en.toLowerCase() })); }

export async function generateMetadata({ params }: Params) {
  const w = byName((await params).day);
  if (!w) return {};
  return pageMetadata({ title: `Born on a ${w.en}: Khmer birth-day colour and angel`, description: WEEKDAY_COPY[w.index].summary, path: `/khmer/born-on/${w.en.toLowerCase()}`, type: "article" });
}

export default async function BornOn({ params }: Params) {
  const w = byName((await params).day);
  if (!w) notFound();
  const copy = WEEKDAY_COPY[w.index];
  return (
    <>
      <Breadcrumbs items={[{ name: "Khmer traditions", href: "/khmer" }, { name: `Born on a ${w.en}`, href: `/khmer/born-on/${w.en.toLowerCase()}` }]} />
      <div className="mx-auto max-w-reading safe-x py-6 box-content">
        <h1 className="text-h1">Born on a {w.en} <span lang="km" className="text-muted">កើតថ្ងៃ{w.km}</span></h1>
        <dl className="mt-5 grid grid-cols-3 gap-4 border-y border-rule py-4 text-small">
          <div><dt className="text-muted">Planet</dt><dd className="mt-1 font-semibold">{w.planetEn} <span lang="km" className="font-normal">{w.planetKm}</span></dd></div>
          <div><dt className="text-muted">Colour</dt><dd className="mt-1 flex items-center gap-2 font-semibold"><span className="swatch" style={{ background: `var(--${w.swatch})` }} aria-hidden="true" />{w.colourEn}</dd></div>
          <div><dt className="text-muted">Keyword</dt><dd className="mt-1 font-semibold">{w.quality[0].toUpperCase() + w.quality.slice(1)}</dd></div>
        </dl>
        <div className="reading mt-6">
          <p className="serif text-h3">{copy.summary}</p>
          {copy.body.map((p) => <p key={p} className="mt-4">{p}</p>)}
        </div>
        <section className="mt-7" aria-labelledby="angel-h">
          <h2 id="angel-h" className="text-h2">Your day&apos;s New Year angel</h2>
          <p className="reading mt-3">Each weekday has one of the seven New Year angels. When Moha Songkran falls on a {w.en}, she is the one who arrives.</p>
          <div className="mt-4"><AngelCard weekday={w} /></div>
        </section>
        <nav aria-label="Other days" className="mt-7 border-t border-rule pt-5">
          <h2 className="text-h3">Other birth days</h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {WEEKDAYS.filter((x) => x.index !== w.index).map((x) => <li key={x.index}><Link className="link inline-flex min-h-tap items-center" href={`/khmer/born-on/${x.en.toLowerCase()}`}>{x.en}</Link></li>)}
          </ul>
          <p className="mt-4"><Link className="btn-primary" href="/tools/zodiac-calculator">Check which day I was born</Link></p>
        </nav>
        <p className="mt-6 text-small text-muted">Colours and meanings vary between almanacs. A tradition to enjoy, not a prediction.</p>
      </div>
    </>
  );
}
