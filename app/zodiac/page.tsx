import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import ChipGrid from "@/components/ChipGrid";
import { signChips } from "@/lib/pages";
import { SIGNS, elementLabel } from "@/lib/western";
import { pageMetadata } from "@/lib/seo";
import { defineMessages } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { signName } from "@/lib/names";

const T = defineMessages({
  en: {
    title: "The 12 zodiac signs", description: "Personality profiles for all 12 Western zodiac signs: strengths, challenges, love and work, grouped by element.",
    crumb: "Zodiac signs", intro: "Your sun sign is where the Sun was on the day you were born. Pick a sign to read its profile.",
    group: (el: string) => `${el} signs`,
  },
  km: {
    title: "រាសីទាំង ១២", description: "ប្រវត្តិរូបបុគ្គលិកលក្ខណៈនៃរាសីលោកខាងលិចទាំង ១២៖ ចំណុចខ្លាំង បញ្ហាប្រឈម ស្នេហា និងការងារ ដាក់ជាក្រុមតាមធាតុ។",
    crumb: "រាសី", intro: "រាសីព្រះអាទិត្យរបស់អ្នក គឺកន្លែងដែលព្រះអាទិត្យស្ថិតនៅថ្ងៃដែលអ្នកកើត។ ជ្រើសរើសរាសីមួយ ដើម្បីអានប្រវត្តិរូបរបស់វា។",
    group: (el: string) => `រាសីធាតុ${el}`,
  },
});

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/zodiac" });
}

export default async function ZodiacIndex() {
  const lang = await getLang();
  const t = T[lang];
  const byElement = (["fire", "earth", "air", "water"] as const).map((el) => ({ el, signs: SIGNS.filter((s) => s.element === el) }));
  return (
    <>
      <Breadcrumbs items={[{ name: t.crumb, href: "/zodiac" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">{t.title}</h1>
        <p className="reading mt-3 text-muted">{t.intro}</p>
        <div className="mt-6"><ChipGrid items={signChips((s) => `/zodiac/${s}`, lang)} set="western" remember /></div>
        <div className="mt-7 grid gap-6 border-t border-rule pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {byElement.map(({ el, signs }) => (
            <section key={el}>
              <h2 className="flex items-center gap-2 text-h3"><span className="swatch" style={{ background: `var(--el-${el})` }} aria-hidden="true" />{t.group(elementLabel(el, lang))}</h2>
              <ul className="mt-2">{signs.map((s) => <li key={s.slug}><Link className="link inline-flex min-h-tap items-center" href={`/zodiac/${s.slug}`}>{signName(s.slug, lang)}</Link></li>)}</ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
