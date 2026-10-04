import Breadcrumbs from "@/components/Breadcrumbs";
import Checker from "@/components/client/Checker";
import { SIGNS } from "@/lib/western";
import { ANIMALS } from "@/lib/chinese";
import { pageMetadata } from "@/lib/seo";
import { defineMessages } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { animalName, signName } from "@/lib/names";

const T = defineMessages({
  en: {
    title: "Compatibility checker", description: "Check zodiac compatibility for any two Western signs or zodiac animals: overall match, love, friendship and work.",
    intro: "Choose a system and two signs. You'll go straight to the full pair page.",
  },
  km: {
    title: "ពិនិត្យភាពត្រូវគ្នា", description: "ពិនិត្យភាពត្រូវគ្នារវាងរាសីលោកខាងលិច ឬសត្វរាសីណាមួយពីរ៖ ភាពត្រូវគ្នាទូទៅ ស្នេហា មិត្តភាព និងការងារ។",
    intro: "ជ្រើសរើសប្រព័ន្ធ និងរាសីពីរ។ អ្នកនឹងទៅដល់ទំព័រគូពេញលេញភ្លាមៗ។",
  },
});
export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/tools/compatibility-checker" });
}

export default async function CheckerPage() {
  const lang = await getLang();
  const t = T[lang];
  return (
    <>
      <Breadcrumbs items={[{ name: t.title, href: "/tools/compatibility-checker" }]} />
      <div className="mx-auto max-w-reading safe-x py-6 box-content">
        <h1 className="text-h1">{t.title}</h1>
        <p className="reading mt-3 text-muted">{t.intro}</p>
        <Checker signs={SIGNS.map(({ slug }) => ({ slug, name: signName(slug, lang) }))} animals={ANIMALS.map(({ slug }) => ({ slug, name: animalName(slug, lang) }))} />
      </div>
    </>
  );
}
