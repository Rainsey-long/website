import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import PairIndex from "@/components/PairIndex";
import PairPicker from "@/components/client/PairPicker";
import { SIGNS } from "@/lib/western";
import { westernScore } from "@/lib/compatibility";
import { pageMetadata } from "@/lib/seo";
import { defineMessages } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { signName } from "@/lib/names";

const T = defineMessages({
  en: {
    title: "Zodiac compatibility for every pair", description: "Compatibility for all 78 Western zodiac pairings: love, friendship and work, explained by element and aspect.",
    crumb: "Compatibility", h1: "Zodiac compatibility",
    intro: "Pick two signs to see how they connect. Scores come from elements and the angle between signs on the wheel. For the animals, see", chineseLink: "Chinese compatibility",
    noun: "sign", check: "Check two signs",
  },
  km: {
    title: "ភាពត្រូវគ្នានៃរាសីសម្រាប់គ្រប់គូ", description: "ភាពត្រូវគ្នាសម្រាប់គូរាសីលោកខាងលិចទាំង ៧៨៖ ស្នេហា មិត្តភាព និងការងារ ពន្យល់តាមធាតុ និងមុំរវាងរាសី។",
    crumb: "ភាពត្រូវគ្នា", h1: "ភាពត្រូវគ្នានៃរាសី",
    intro: "ជ្រើសរើសរាសីពីរ ដើម្បីមើលថាពួកវាភ្ជាប់គ្នាយ៉ាងណា។ ពិន្ទុមកពីធាតុ និងមុំរវាងរាសីនៅលើកង់រាសី។ សម្រាប់សត្វរាសី សូមមើល", chineseLink: "ភាពត្រូវគ្នាតាមរាសីចិន",
    noun: "រាសី", check: "ពិនិត្យរាសីពីរ",
  },
});
export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/compatibility" });
}

export default async function CompatIndex() {
  const lang = await getLang();
  const t = T[lang];
  const signs = SIGNS.map((s) => ({ ...s, name: signName(s.slug, lang) }));
  return (
    <>
      <Breadcrumbs items={[{ name: t.crumb, href: "/compatibility" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">{t.h1}</h1>
        <p className="reading mt-3 text-muted">{t.intro} <Link className="link text-ink" href="/chinese-compatibility">{t.chineseLink}</Link>{lang === "km" ? "។" : "."}</p>
        <PairPicker options={signs} base="/compatibility/" noun={t.noun} heading={t.check} a="aries" b="leo" />
        <PairIndex items={signs} set="western" base="/compatibility/" score={(a, b) => westernScore(a, b).score} />
      </div>
    </>
  );
}
