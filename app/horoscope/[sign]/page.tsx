/** Sign hub (plan §8): today's reading, with yesterday/tomorrow ready for the visitor's local date. */
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ReadingSection from "@/components/ReadingSection";
import DayDial from "@/components/DayDial";
import Glyph from "@/components/Glyph";
import SkyPanel from "@/components/SkyPanel";
import JsonLd from "@/components/JsonLd";
import RelatedLinks from "@/components/RelatedLinks";
import { AdSlot } from "@/components/Monetize";
import Share from "@/components/client/Share";
import { SaveSign } from "@/components/client/Remembered";
import Feedback from "@/components/client/Feedback";
import HubDayPicker from "@/components/client/HubDayPicker";
import { SIGNS, signBySlug } from "@/lib/western";
import { dailyReading } from "@/lib/reading-engine";
import { blockTexts } from "@/lib/blockText";
import { skyForDay } from "@/lib/sky";
import { addDays, fullDate } from "@/lib/dates";
import { pairSlug } from "@/lib/compatibility";
import { absolute, articleLd, pageMetadata } from "@/lib/seo";
import { today } from "@/lib/today";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ sign: string }> };

export async function generateMetadata({ params }: Params) {
  const sign = signBySlug((await params).sign);
  if (!sign) return {};
  return pageMetadata({
    title: `${sign.name} horoscope today`,
    description: `Today's ${sign.name} horoscope: love, career, money and mood, with your lucky colour, number and hour.`,
    path: `/horoscope/${sign.slug}`,
    ogImage: `/og/${sign.slug}`,
    type: "article",
  });
}

export default async function SignHub({ params }: Params) {
  const sign = signBySlug((await params).sign);
  if (!sign) notFound();
  const date = await today();
  const days = [addDays(date, -1), date, addDays(date, 1)];
  const texts = blockTexts();
  const readings = days.map((d) => dailyReading(sign, d, skyForDay(d), texts));
  const title = `${sign.name} horoscope today`;
  const pairs = SIGNS.filter((s) => s.slug !== sign.slug && (s.element === sign.element || Math.abs(s.index - sign.index) === 6)).slice(0, 3);

  return (
    <>
      <Breadcrumbs items={[{ name: "Horoscopes", href: "/horoscope" }, { name: sign.name, href: `/horoscope/${sign.slug}` }]} />
      <JsonLd data={[articleLd({ headline: title, description: `Today's ${sign.name} horoscope.`, path: `/horoscope/${sign.slug}`, date })]} />
      <div className="mx-auto max-w-page safe-x py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
        <div className="max-w-reading">
          <header className="flex items-start justify-between gap-5">
            <div>
              <h1 className="flex items-center gap-3 text-display"><Glyph name={sign.slug} set="western" className="size-glyph-lg shrink-0" /><span>{sign.name}</span></h1>
            </div>
            <div className="hidden md:block"><DayDial sky={readings[1].sky} selected={sign.slug} size="small" caption={false} id="hub-dial" /></div>
          </header>
          <HubDayPicker days={days} serverToday={date} labels={Object.fromEntries(days.map((d) => [d, fullDate(d)]))}>
            {readings.map((r) => (
              <div key={r.date}>
                <ReadingSection reading={r} showHeader={false} />
                <SkyPanel reading={r} />
                <Feedback path={`/horoscope/${sign.slug}/${r.date}`} blockIds={r.topics.flatMap((t) => t.blockIds)} />
                <p className="mt-4 text-small"><Link className="link" href={`/horoscope/${sign.slug}/${r.date}`}>Permanent link to this reading</Link></p>
              </div>
            ))}
          </HubDayPicker>
          <nav aria-label="Day" className="mt-5 flex flex-wrap gap-3">
            <Link className="btn-secondary" href={`/horoscope/${sign.slug}/${days[2]}`}>Read tomorrow</Link>
            <SaveSign slug={sign.slug} name={sign.name} />
          </nav>
          <Share title={title} text={`My ${sign.name} horoscope for today`} url={absolute(`/horoscope/${sign.slug}`)} />
          <AdSlot placement="afterReading" />
          <RelatedLinks links={[
            { href: `/zodiac/${sign.slug}`, label: `${sign.name} personality profile` },
            ...pairs.map((p) => ({ href: `/compatibility/${pairSlug(sign.slug, p.slug)}`, label: `${sign.name} and ${p.name} compatibility` })),
            { href: "/chinese-zodiac/2027", label: "2027 Year of the Fire Goat forecast" },
          ]} />
        </div>
        <div className="hidden lg:block"><AdSlot placement="rail" /></div>
      </div>
    </>
  );
}
