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
import { mondayOf } from "@/lib/weekly";
import { blockTexts } from "@/lib/blockText";
import { skyForDay } from "@/lib/sky";
import { addDays, longDate } from "@/lib/dates";
import { pairSlug } from "@/lib/compatibility";
import { absolute, articleLd, pageMetadata } from "@/lib/seo";
import { DAILY_WINDOW } from "@/lib/site";
import { dateInZone } from "@/lib/today";
import { DEFAULT_TZ } from "@/lib/site";
import { defineMessages } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { signName } from "@/lib/names";

const T = defineMessages({
  en: {
    crumb: "Horoscopes", today: (s: string) => `${s} horoscope today`,
    desc: (s: string) => `Today's ${s} horoscope: love, career, money and mood, with your lucky colour, number and hour.`,
    short: (s: string) => `Today's ${s} horoscope.`,
    forDate: (s: string, d: string) => `${s} horoscope for ${d}`,
    descDate: (s: string, d: string) => `${s} horoscope for ${d}: love, career, money and mood, plus your lucky colour, number and hour.`,
    permalink: "Permanent link to this reading", day: "Day", tomorrow: "Read tomorrow",
    myToday: (s: string) => `My ${s} horoscope for today`, myDate: (s: string, d: string) => `My ${s} horoscope for ${d}`,
    profile: (s: string) => `${s} personality profile`, pair: (a: string, b: string) => `${a} and ${b} compatibility`,
    goat: "2027 Year of the Fire Goat forecast", week: (s: string) => `${s} weekly horoscope for that week`,
  },
  km: {
    crumb: "ហោរាសាស្ត្រ", today: (s: string) => `ហោរាសាស្ត្រថ្ងៃនេះ រាសី${s}`,
    desc: (s: string) => `ហោរាសាស្ត្រថ្ងៃនេះសម្រាប់រាសី${s}៖ ស្នេហា ការងារ ហិរញ្ញវត្ថុ និងអារម្មណ៍ ព្រមទាំងពណ៌ លេខ និងម៉ោងសំណាងរបស់អ្នក។`,
    short: (s: string) => `ហោរាសាស្ត្រថ្ងៃនេះ រាសី${s}។`,
    forDate: (s: string, d: string) => `ហោរាសាស្ត្ររាសី${s} សម្រាប់${d}`,
    descDate: (s: string, d: string) => `ហោរាសាស្ត្ររាសី${s} សម្រាប់${d}៖ ស្នេហា ការងារ ហិរញ្ញវត្ថុ និងអារម្មណ៍ ព្រមទាំងពណ៌ លេខ និងម៉ោងសំណាងរបស់អ្នក។`,
    permalink: "តំណអចិន្ត្រៃយ៍ទៅការអាននេះ", day: "ថ្ងៃ", tomorrow: "អានថ្ងៃស្អែក",
    myToday: (s: string) => `ហោរាសាស្ត្រថ្ងៃនេះ រាសី${s} របស់ខ្ញុំ`, myDate: (s: string, d: string) => `ហោរាសាស្ត្ររាសី${s} របស់ខ្ញុំ សម្រាប់${d}`,
    profile: (s: string) => `ប្រវត្តិរូបបុគ្គលិកលក្ខណៈរាសី${s}`, pair: (a: string, b: string) => `ភាពត្រូវគ្នារវាងរាសី${a} និងរាសី${b}`,
    goat: "ការព្យាករឆ្នាំមមែ ធាតុភ្លើង ២០២៧", week: (s: string) => `ហោរាសាស្ត្រប្រចាំសប្ដាហ៍ រាសី${s} សម្រាប់សប្ដាហ៍នោះ`,
  },
});


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
  const lang = await getLang();
  const name = signName(sign.slug, lang);
  return pageMetadata({
    lang,
    title: T[lang].forDate(name, longDate(date, lang)),
    description: T[lang].descDate(name, longDate(date, lang)),
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
  const lang = await getLang();
  const t = T[lang];
  const name = signName(sign.slug, lang);
  const day = longDate(date, lang);
  const reading = dailyReading(sign, date, sky, blockTexts(lang), lang);
  const title = t.forDate(name, day);
  const opposite = SIGNS[(sign.index + 6) % 12];
  const prev = addDays(date, -1), next = addDays(date, 1);
  return (
    <>
      <Breadcrumbs items={[{ name: t.crumb, href: "/horoscope" }, { name, href: `/horoscope/${sign.slug}` }, { name: day, href: `/horoscope/${sign.slug}/${date}` }]} />
      <JsonLd data={[articleLd({ headline: title, description: title, path: `/horoscope/${sign.slug}/${date}`, date, lang })]} />
      <div className="mx-auto max-w-page safe-x py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--size-rail)] lg:gap-7">
        <div className="max-w-reading">
          <ReadingSection reading={reading} prevHref={validDate(prev) ? `/horoscope/${sign.slug}/${prev}` : null} nextHref={validDate(next) ? `/horoscope/${sign.slug}/${next}` : null} />
          <SkyPanel reading={reading} />
          <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <DayDial sky={sky} selected={sign.slug} size="small" caption={false} id="date-dial" />
          </div>
          <Feedback path={`/horoscope/${sign.slug}/${date}`} blockIds={reading.topics.flatMap((t) => t.blockIds)} />
          <div className="mt-5 flex flex-wrap gap-3"><SaveSign slug={sign.slug} name={name} /></div>
          <Share title={title} text={t.myDate(name, day)} url={absolute(`/horoscope/${sign.slug}/${date}`)} />
          <AdSlot placement="afterReading" />
          <RelatedLinks links={[
            { href: `/horoscope/${sign.slug}`, label: t.today(name) },
            { href: `/horoscope/${sign.slug}/week/${mondayOf(date)}`, label: t.week(name) },
            { href: `/zodiac/${sign.slug}`, label: t.profile(name) },
            { href: `/compatibility/${pairSlug(sign.slug, opposite.slug)}`, label: t.pair(name, signName(opposite.slug, lang)) },
            { href: "/chinese-zodiac/2027", label: t.goat },
          ]} />
        </div>
        <div className="hidden lg:block"><AdSlot placement="rail" /></div>
      </div>
    </>
  );
}
