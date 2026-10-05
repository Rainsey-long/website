import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import PairIndex from "@/components/PairIndex";
import PairPicker from "@/components/client/PairPicker";
import { ANIMALS } from "@/lib/chinese";
import { chineseScore, relationName } from "@/lib/compatibility";
import { pageMetadata } from "@/lib/seo";
import { defineMessages } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { animalName } from "@/lib/names";

const T = defineMessages({
  en: {
    title: "Chinese zodiac compatibility", description: "Compatibility for all 78 Chinese zodiac animal pairings, from the Three Harmonies to the Six Clashes, with love, friendship and work scores.",
    crumb: "Chinese compatibility",
    intro: "Traditional tables group the animals into harmonies, clashes and harms. The same animals and pairings are used in Cambodia and Vietnam. Looking for star signs? See", westernLink: "Western compatibility",
    noun: "animal", check: "Check two animals",
  },
});
export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/chinese-compatibility" });
}

export default async function ChineseCompatIndex() {
  const lang = await getLang();
  const t = T[lang];
  const animals = ANIMALS.map((a) => ({ ...a, name: animalName(a.slug, lang) }));
  return (
    <>
      <Breadcrumbs items={[{ name: t.crumb, href: "/chinese-compatibility" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">{t.title}</h1>
        <p className="reading mt-3 text-muted">{t.intro} <Link className="link text-ink" href="/compatibility">{t.westernLink}</Link>{"."}</p>
        <PairPicker options={animals} base="/chinese-compatibility/" noun={t.noun} heading={t.check} a="rat" b="dragon" />
        <PairIndex items={animals} set="animal" base="/chinese-compatibility/" score={(a, b) => chineseScore(a, b).score} label={(a, b) => relationName(chineseScore(a, b).relation, lang)} />
      </div>
    </>
  );
}
