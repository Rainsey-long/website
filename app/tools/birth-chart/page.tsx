import Breadcrumbs from "@/components/Breadcrumbs";
import BirthChart from "@/components/client/BirthChart";
import { CITIES } from "@/lib/cities";
import { pageMetadata } from "@/lib/seo";
import { defineMessages } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

const T = defineMessages({
  en: {
    title: "Free birth chart: planets, houses and aspects",
    description: "Draw your birth chart with the Sun, Moon, rising sign, all ten planets, whole-sign houses and aspects, with a plain-English reading. Private: it runs in your browser.",
    h1: "Birth chart",
    intro: "See where the Sun, Moon and planets were when you were born. Add a time and city for your rising sign and houses. Your details stay on this device.",
  },
  km: {
    title: "តារាងកំណើតឥតគិតថ្លៃ៖ ភព ផ្ទះ និងមុំរវាងភព",
    description: "គូរតារាងកំណើតរបស់អ្នក ជាមួយព្រះអាទិត្យ ព្រះចន្ទ រាសីឡើង ភពទាំងដប់ ផ្ទះ និងមុំរវាងភព ព្រមទាំងការពន្យល់ងាយយល់។ ឯកជន៖ វាដំណើរការក្នុងកម្មវិធីរុករករបស់អ្នក។",
    h1: "តារាងកំណើត",
    intro: "មើលថាព្រះអាទិត្យ ព្រះចន្ទ និងភពនានានៅទីណា ពេលអ្នកកើត។ បន្ថែមម៉ោង និងទីក្រុង ដើម្បីដឹងរាសីឡើង និងផ្ទះរបស់អ្នក។ ព័ត៌មានរបស់អ្នកនៅតែលើឧបករណ៍នេះ។",
  },
});
export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/tools/birth-chart" });
}

export default async function BirthChartPage() {
  const t = T[await getLang()];
  const cities = [...CITIES].sort((a, b) => a.name.localeCompare(b.name)).map(({ name, country, lat, lon, tz }) => ({ name, country, lat, lon, tz }));
  return (
    <>
      <Breadcrumbs items={[{ name: t.h1, href: "/tools/birth-chart" }]} />
      <div className="mx-auto max-w-reading safe-x py-6 box-content">
        <h1 className="text-h1">{t.h1}</h1>
        <p className="reading mt-3 text-muted">{t.intro}</p>
        <BirthChart cities={cities} />
      </div>
    </>
  );
}
