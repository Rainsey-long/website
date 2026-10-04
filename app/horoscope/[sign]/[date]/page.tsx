/** Dated reading. Any date 1900–2100 renders; only the recent window is indexed (plan §10, now unbounded on a server). */
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ReadingSection from "@/components/ReadingSection";
import DayDial from "@/components/DayDial";
import SkyPanel from "@/components/SkyPanel";
import JsonLd from "@/components/JsonLd";
import RelatedLinks from "@/components/RelatedLinks";
import { AdSlot } from "@/components/Monetize";
import Share from "@/components/client/Share";
import { SaveSign } from "@/components/client/Remembered";
import Feedback from "@/components/client/Feedback";
import { SIGNS, signBySlug } from "@/lib/western";
import { dailyReading } from "@/lib/reading-engine";
import { blockTexts } from "@/lib/blockText";
import { skyForDay } from "@/lib/sky";
import { addDays, longDate } from "@/lib/dates";
import { pairSlug } from "@/lib/compatibility";
import { absolute, articleLd, pageMetadata } from "@/lib/seo";
import { DAILY_WINDOW } from "@/lib/site";
import { dateInZone } from "@/lib/today";
import { DEFAULT_TZ } from "@/lib/site";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ sign: string; date: string }> };

function validDate(d: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const y = Number(d.slice(0, 4));
  return y >= 1900 && y <= 2100 && addDays(d, 0) === d;
}

function inWindow(d: string): boolean {
  const t = dateInZone(DEFAULT_TZ);
  return d >= addDays(t, -DAILY_WINDOW.pastDays) && d <= addDays(t, DAILY_WINDOW.futureDays + 1);
}

export async function generateMetadata({ params }: Params) {
  const { sign: s, date } = await params;
  const sign = signBySlug(s);
  if (!sign || !validDate(date)) return {};
  return pageMetadata({
    title: `${sign.name} horoscope for ${longDate(date)}`,
    description: `${sign.name} horoscope for ${longDate(date)}: love, career, money and mood, plus your lucky colour, number and hour.`,
    path: `/horoscope/${sign.slug}/${date}`,
    ogImage: `/og/${sign.slug}`,
    type: "article",
    noindex: !inWindow(date),
  });
}

export default async function DatedReading({ params }: Params) {
  const { sign: s, date } = await params;
  const sign = signBySlug(s);
  if (!sign || !validDate(date)) notFound();
  const sky = skyForDay(date);
  const reading = dailyReading(sign, date, sky, blockTexts());
  const title = `${sign.name} horoscope for ${longDate(date)}`;
  const opposite = SIGNS[(sign.index + 6) % 12];
  const prev = addDays(date, -1), next = addDays(date, 1);
  return (
    <>
      <Breadcrumbs items={[{ name: "Horoscopes", href: "/horoscope" }, { name: sign.name, href: `/horoscope/${sign.slug}` }, { name: longDate(date), href: `/horoscope/${sign.slug}/${date}` }]} />
      <JsonLd data={[articleLd({ headline: title, description: title, path: `/horoscope/${sign.slug}/${date}`, date })]} />
      <div className="mx-auto max-w-page safe-x py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
        <div className="max-w-reading">
          <ReadingSection reading={reading} prevHref={validDate(prev) ? `/horoscope/${sign.slug}/${prev}` : null} nextHref={validDate(next) ? `/horoscope/${sign.slug}/${next}` : null} />
          <SkyPanel reading={reading} />
          <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <DayDial sky={sky} selected={sign.slug} size="small" caption={false} id="date-dial" />
          </div>
          <Feedback path={`/horoscope/${sign.slug}/${date}`} blockIds={reading.topics.flatMap((t) => t.blockIds)} />
          <div className="mt-5 flex flex-wrap gap-3"><SaveSign slug={sign.slug} name={sign.name} /></div>
          <Share title={title} text={`My ${sign.name} horoscope for ${longDate(date)}`} url={absolute(`/horoscope/${sign.slug}/${date}`)} />
          <AdSlot placement="afterReading" />
          <RelatedLinks links={[
            { href: `/horoscope/${sign.slug}`, label: `${sign.name} horoscope today` },
            { href: `/zodiac/${sign.slug}`, label: `${sign.name} personality profile` },
            { href: `/compatibility/${pairSlug(sign.slug, opposite.slug)}`, label: `${sign.name} and ${opposite.name} compatibility` },
            { href: "/chinese-zodiac/2027", label: "2027 Year of the Fire Goat forecast" },
          ]} />
        </div>
        <div className="hidden lg:block"><AdSlot placement="rail" /></div>
      </div>
    </>
  );
}
