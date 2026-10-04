import Breadcrumbs from "@/components/Breadcrumbs";
import Calculator from "@/components/client/Calculator";
import cities from "@/lib/data/cities.json";
import { chosenTraditions } from "@/lib/traditionsServer";
import { pageMetadata } from "@/lib/seo";
import { defineMessages } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

export const dynamic = "force-dynamic";
const T = defineMessages({
  en: {
    title: "What's my zodiac sign? Sun, moon, rising, Chinese and Khmer",
    description: "Find your sun, moon and rising signs, your Chinese animal and element, and your Khmer animal year, birth day and colour. Free, private, works in your browser.",
    h1: "Find my sign",
    intro: "Enter your birth date to see your signs. Add a time and place for your moon and rising signs. Your details stay on this device.",
  },
  km: {
    title: "តើខ្ញុំរាសីអ្វី? រាសីព្រះអាទិត្យ ព្រះចន្ទ រាសីឡើង ចិន និងខ្មែរ",
    description: "ស្វែងរករាសីព្រះអាទិត្យ ព្រះចន្ទ និងរាសីឡើង សត្វ និងធាតុតាមរាសីចិន ព្រមទាំងឆ្នាំសត្វ ថ្ងៃកំណើត និងពណ៌តាមប្រពៃណីខ្មែរ។ ឥតគិតថ្លៃ ឯកជន ដំណើរការក្នុងកម្មវិធីរុករករបស់អ្នក។",
    h1: "ស្វែងរករាសីខ្ញុំ",
    intro: "បញ្ចូលថ្ងៃខែឆ្នាំកំណើត ដើម្បីមើលរាសីរបស់អ្នក។ បន្ថែមម៉ោង និងទីកន្លែង ដើម្បីដឹងរាសីព្រះចន្ទ និងរាសីឡើង។ ព័ត៌មានរបស់អ្នកនៅតែលើឧបករណ៍នេះ។",
  },
});
export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/tools/zodiac-calculator" });
}

export default async function CalculatorPage() {
  const traditions = await chosenTraditions();
  const t = T[await getLang()];
  const sorted = [...cities].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <Breadcrumbs items={[{ name: t.h1, href: "/tools/zodiac-calculator" }]} />
      <div className="mx-auto max-w-reading safe-x py-6 box-content">
        <h1 className="text-h1">{t.h1}</h1>
        <p className="reading mt-3 text-muted">{t.intro}</p>
        <Calculator cities={sorted} traditions={traditions} />
      </div>
    </>
  );
}
