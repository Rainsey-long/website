import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import ChipGrid from "@/components/ChipGrid";
import { signChips } from "@/lib/pages";
import { pageMetadata } from "@/lib/seo";
import { defineMessages } from "@/lib/i18n";
import { SIGNS } from "@/lib/western";
import { signName } from "@/lib/names";
import { getLang } from "@/lib/langServer";

const T = defineMessages({
  en: {
    title: "Daily horoscopes for all 12 signs", description: "Today's horoscope for every zodiac sign: love, career, money and mood, written from where the Moon really is today.",
    crumb: "Horoscopes", h1: "Daily horoscopes",
    intro: "Pick your sign for today's reading. Each one follows the Moon's real position through the zodiac, so it changes every day.",
    notSure: "Not sure of your sign?", find: "Find my sign",
    weekly: "Weekly horoscopes", weeklyIntro: "The week ahead for each sign: the week's Moon, your best days and what the planets are doing.",
  },
  km: {
    title: "ហោរាសាស្ត្រប្រចាំថ្ងៃសម្រាប់រាសីទាំង ១២", description: "ហោរាសាស្ត្រថ្ងៃនេះសម្រាប់គ្រប់រាសី៖ ស្នេហា ការងារ ហិរញ្ញវត្ថុ និងអារម្មណ៍ សរសេរតាមទីតាំងពិតរបស់ព្រះចន្ទថ្ងៃនេះ។",
    crumb: "ហោរាសាស្ត្រ", h1: "ហោរាសាស្ត្រប្រចាំថ្ងៃ",
    intro: "ជ្រើសរើសរាសីរបស់អ្នក ដើម្បីអានសម្រាប់ថ្ងៃនេះ។ ការអាននីមួយៗដើរតាមទីតាំងពិតរបស់ព្រះចន្ទក្នុងរង្វង់រាសី ដូច្នេះវាប្រែប្រួលរៀងរាល់ថ្ងៃ។",
    notSure: "មិនប្រាកដពីរាសីរបស់អ្នកទេ?", find: "ស្វែងរករាសីខ្ញុំ",
    weekly: "ហោរាសាស្ត្រប្រចាំសប្ដាហ៍", weeklyIntro: "សប្ដាហ៍ខាងមុខសម្រាប់រាសីនីមួយៗ៖ ព្រះចន្ទប្រចាំសប្ដាហ៍ ថ្ងៃល្អបំផុតរបស់អ្នក និងដំណើររបស់ភពនានា។",
  },
});

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/horoscope" });
}

export default async function HoroscopeIndex() {
  const lang = await getLang();
  const t = T[lang];
  return (
    <>
      <Breadcrumbs items={[{ name: t.crumb, href: "/horoscope" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">{t.h1}</h1>
        <p className="reading mt-3 text-muted">{t.intro}</p>
        <div className="mt-6"><ChipGrid items={signChips(undefined, lang)} set="western" remember /></div>
        <p className="mt-5">{t.notSure} <Link className="link" href="/tools/zodiac-calculator">{t.find}</Link></p>
        <section className="mt-7 border-t border-rule pt-7" aria-labelledby="weekly-h">
          <h2 id="weekly-h" className="text-h2">{t.weekly}</h2>
          <p className="mt-2 text-muted">{t.weeklyIntro}</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-5 sm:grid-cols-3 md:grid-cols-4">
            {SIGNS.map((s) => <li key={s.slug}><Link className="link inline-flex min-h-tap items-center" href={`/horoscope/${s.slug}/week`}>{signName(s.slug, lang)}</Link></li>)}
          </ul>
        </section>
      </div>
    </>
  );
}
