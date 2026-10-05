/** Sign hub (plan §8): today's reading, with yesterday/tomorrow ready for the visitor's local date. */
import Link from "@/components/client/LocaleLink";
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
import { defineMessages } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { signName } from "@/lib/names";

const T = defineMessages({
  en: {
    crumb: "Horoscopes", week: "Read this week", today: (s: string) => `${s} horoscope today`,
    desc: (s: string) => `Today's ${s} horoscope: love, career, money and mood, with your lucky colour, number and hour.`,
    short: (s: string) => `Today's ${s} horoscope.`,
    forDate: (s: string, d: string) => `${s} horoscope for ${d}`,
    descDate: (s: string, d: string) => `${s} horoscope for ${d}: love, career, money and mood, plus your lucky colour, number and hour.`,
    permalink: "Permanent link to this reading", day: "Day", tomorrow: "Read tomorrow",
    myToday: (s: string) => `My ${s} horoscope for today`, myDate: (s: string, d: string) => `My ${s} horoscope for ${d}`,
    profile: (s: string) => `${s} personality profile`, pair: (a: string, b: string) => `${a} and ${b} compatibility`,
    goat: "2027 Year of the Fire Goat forecast",
  },
});


export const dynamic = "force-dynamic";
type Params = { params: Promise<{ sign: string }> };

export async function generateMetadata({ params }: Params) {
  const sign = signBySlug((await params).sign);
  if (!sign) return {};
  const lang = await getLang();
  const name = signName(sign.slug, lang);
  return pageMetadata({
    lang,
    title: T[lang].today(name),
    description: T[lang].desc(name),
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
  const lang = await getLang();
  const t = T[lang];
  const name = signName(sign.slug, lang);
  const texts = blockTexts(lang);
  const readings = days.map((d) => dailyReading(sign, d, skyForDay(d), texts, lang));
  const title = t.today(name);
  const pairs = SIGNS.filter((s) => s.slug !== sign.slug && (s.element === sign.element || Math.abs(s.index - sign.index) === 6)).slice(0, 3);

  return (
    <>
      <Breadcrumbs items={[{ name: t.crumb, href: "/horoscope" }, { name, href: `/horoscope/${sign.slug}` }]} />
      <JsonLd data={[articleLd({ headline: title, description: t.short(name), path: `/horoscope/${sign.slug}`, date, lang })]} />
      <div className="mx-auto max-w-page safe-x py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
        <div className="max-w-reading">
          <header className="flex items-start justify-between gap-5">
            <div>
              <h1 className="flex items-center gap-3 text-display"><Glyph name={sign.slug} set="western" className="size-glyph-lg shrink-0" /><span>{name}</span></h1>
            </div>
            <div className="hidden md:block"><DayDial sky={readings[1].sky} selected={sign.slug} size="small" caption={false} id="hub-dial" /></div>
          </header>
          <HubDayPicker days={days} serverToday={date} labels={Object.fromEntries(days.map((d) => [d, fullDate(d, lang)]))}>
            {readings.map((r) => (
              <div key={r.date}>
                <ReadingSection reading={r} showHeader={false} />
                <SkyPanel reading={r} />
                <Feedback path={`/horoscope/${sign.slug}/${r.date}`} blockIds={r.topics.flatMap((t) => t.blockIds)} />
                <p className="mt-4 text-small"><Link className="link" href={`/horoscope/${sign.slug}/${r.date}`}>{t.permalink}</Link></p>
              </div>
            ))}
          </HubDayPicker>
          <nav aria-label={t.day} className="mt-5 flex flex-wrap gap-3">
            <Link className="btn-secondary" href={`/horoscope/${sign.slug}/${days[2]}`}>{t.tomorrow}</Link>
            <Link className="btn-secondary" href={`/horoscope/${sign.slug}/week`}>{t.week}</Link>
            <SaveSign slug={sign.slug} name={name} />
          </nav>
          <Share title={title} text={t.myToday(name)} url={absolute(`/horoscope/${sign.slug}`)} />
          <AdSlot placement="afterReading" />
          <RelatedLinks links={[
            { href: `/zodiac/${sign.slug}`, label: t.profile(name) },
            ...pairs.map((p) => ({ href: `/compatibility/${pairSlug(sign.slug, p.slug)}`, label: t.pair(name, signName(p.slug, lang)) })),
            { href: "/chinese-zodiac/2027", label: t.goat },
          ]} />
        </div>
        <div className="hidden lg:block"><AdSlot placement="rail" /></div>
      </div>
    </>
  );
}
