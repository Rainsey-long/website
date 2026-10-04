import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import Glyph from "@/components/Glyph";
import { ANIMALS } from "@/lib/chinese";
import { KHMER_ANIMALS } from "@/lib/khmer";
import { VIETNAMESE_ANIMAL, VIETNAMESE_TERMS } from "@/lib/sea-variants";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";
import { defineMessages } from "@/lib/i18n";

const T = defineMessages({
  en: {
    title: "The zodiac in Southeast Asia",
    description: "How the twelve-animal zodiac works in Cambodia and Vietnam: Khmer New Year in April, the Vietnamese Cat and Buffalo, and why your animal can differ.",
    crumb: "Southeast Asian zodiac",
    names: "The animals in three traditions",
    chinese: "Chinese", khmer: "Khmer", vietnamese: "Vietnamese",
    find: "Find my animal in each tradition",
  },
  km: {
    title: "ឆ្នាំសត្វនៅអាស៊ីអាគ្នេយ៍",
    description: "របៀបដែលឆ្នាំសត្វទាំងដប់ពីរដំណើរការនៅកម្ពុជា និងវៀតណាម៖ ចូលឆ្នាំខ្មែរក្នុងខែមេសា ឆ្មា និងក្របីរបស់វៀតណាម និងហេតុអ្វីសត្វប្រចាំឆ្នាំរបស់អ្នកអាចខុសគ្នា។",
    crumb: "ឆ្នាំសត្វអាស៊ីអាគ្នេយ៍",
    names: "សត្វទាំងដប់ពីរក្នុងប្រពៃណីបី",
    chinese: "ចិន", khmer: "ខ្មែរ", vietnamese: "វៀតណាម",
    find: "រកសត្វប្រចាំឆ្នាំរបស់ខ្ញុំក្នុងប្រពៃណីនីមួយៗ",
  },
});

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/southeast-asian-zodiac" });
}

export default async function Sea() {
  const lang = await getLang();
  const t = T[lang];
  const km = lang === "km";
  return (
    <>
      <Breadcrumbs items={[{ name: t.crumb, href: "/southeast-asian-zodiac" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">{t.title}</h1>
        {km ? (
        <div className="prose reading mt-5 max-w-reading">
          <p>សត្វទាំងដប់ពីរបានធ្វើដំណើរឆ្លងកាត់អាស៊ី ហើយបានចូលទៅក្នុងប្រតិទិនក្នុងស្រុកនៅតាមផ្លូវ។ កម្ពុជា និងវៀតណាមប្រើវដ្ដនេះដូចប្រទេសចិន ដោយមានភាពខុសគ្នាពីរដែលគួរដឹង។</p>
          <h2>កម្ពុជា៖ ឆ្នាំផ្លាស់ប្ដូរក្នុងខែមេសា</h2>
          <p>នៅកម្ពុជា ឆ្នាំសត្វផ្លាស់ប្ដូរនៅពេលមហាសង្ក្រាន្ត គឺបុណ្យចូលឆ្នាំខ្មែរ ក្នុងពាក់កណ្ដាលខែមេសា។ ប្រសិនបើអ្នកកើតនៅចន្លោះបុណ្យចូលឆ្នាំចិន និងពេលនោះ សត្វប្រចាំឆ្នាំខ្មែររបស់អ្នក គឺសត្វនៃឆ្នាំមុន។ <Link href="/southeast-asian-zodiac/khmer">អានអំពីឆ្នាំសត្វខ្មែរ</Link>។</p>
          <h2>វៀតណាម៖ ឆ្មា និងក្របី</h2>
          <p>វៀតណាមរាប់ឆ្នាំចាប់ពីបុណ្យ <span lang="vi">Tết</span> ដែលជាថ្ងៃដូចគ្នានឹងបុណ្យចូលឆ្នាំចិន ប៉ុន្តែសត្វពីរខុសគ្នា។ ឆ្មាជំនួសថោះ ហើយក្របីជំនួសឆ្លូវ (គោ)។ <Link href="/southeast-asian-zodiac/vietnamese">អានអំពីឆ្នាំសត្វវៀតណាម</Link>។</p>
        </div>
        ) : (
        <div className="prose reading mt-5 max-w-reading">
          <p>The twelve animals travelled across Asia and settled into local calendars along the way. Cambodia and Vietnam share the cycle with China, with two differences worth knowing.</p>
          <h2>Cambodia: the year turns in April</h2>
          <p>In Cambodia the animal year changes at the moment of Moha Songkran, Khmer New Year, in mid-April. If you were born between Lunar New Year and that moment, your Khmer animal is the one from the year before. <Link href="/southeast-asian-zodiac/khmer">Read the Khmer guide</Link>.</p>
          <h2>Vietnam: the Cat and the Buffalo</h2>
          <p>Vietnam counts the year from Tết, the same day as Lunar New Year, but two animals change. The Cat takes the Rabbit&apos;s place, and the Buffalo stands in for the Ox. <Link href="/southeast-asian-zodiac/vietnamese">Read the Vietnamese guide</Link>.</p>
        </div>
        )}
        <section className="mt-7 border-t border-rule pt-5" aria-labelledby="names-h">
          <h2 id="names-h" className="text-h2">{t.names}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-small text-muted"><tr><th className="py-2 pr-4 font-medium">{t.chinese}</th><th className="py-2 pr-4 font-medium">{t.khmer}</th><th className="py-2 font-medium">{t.vietnamese}</th></tr></thead>
              <tbody>
                {ANIMALS.map((a) => (
                  <tr key={a.slug} className="border-t border-rule">
                    <td className="py-3 pr-4"><Link className="link inline-flex items-center gap-2" href={`/chinese-zodiac/${a.slug}`}><Glyph name={a.slug} set="animal" className="size-5" />{km ? <span lang="zh">{a.hanzi}</span> : a.name}</Link></td>
                    <td className="py-3 pr-4"><span lang="km">{KHMER_ANIMALS[a.index].km}</span> <span className="text-muted" lang={km ? "en" : undefined}>{KHMER_ANIMALS[a.index].roman}</span></td>
                    <td className="py-3">{VIETNAMESE_ANIMAL[lang][a.index]} (<span lang="vi">{VIETNAMESE_TERMS[a.index]}</span>)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5"><Link className="btn-primary" href="/tools/zodiac-calculator">{t.find}</Link></p>
        </section>
      </div>
    </>
  );
}
