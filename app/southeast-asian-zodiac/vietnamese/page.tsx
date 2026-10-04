import TextPage from "@/components/TextPage";
import { ANIMALS } from "@/lib/chinese";
import { VIETNAMESE_ANIMAL, VIETNAMESE_TERMS } from "@/lib/sea-variants";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";

const META = {
  en: { title: "The Vietnamese zodiac", description: "The Vietnamese zodiac, con giáp: the same twelve-year cycle as China, with the Cat in place of the Rabbit and the Buffalo for the Ox.", crumb: "Southeast Asian zodiac" },
  km: { title: "ឆ្នាំសត្វវៀតណាម", description: "ឆ្នាំសត្វវៀតណាម (con giáp)៖ វដ្ដដប់ពីរឆ្នាំដូចប្រទេសចិន ដោយមានឆ្មាជំនួសថោះ និងក្របីជំនួសឆ្លូវ។", crumb: "ឆ្នាំសត្វអាស៊ីអាគ្នេយ៍" },
};

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: META[lang].title, description: META[lang].description, path: "/southeast-asian-zodiac/vietnamese" });
}

export default async function Vietnamese() {
  const lang = await getLang();
  const crumbs = [{ name: META[lang].crumb, href: "/southeast-asian-zodiac" }];
  if (lang === "km") {
    return (
      <TextPage title={META.km.title} path="/southeast-asian-zodiac/vietnamese" crumbs={crumbs}>
        <p>ឆ្នាំសត្វវៀតណាម ហៅថា <span lang="vi">con giáp</span> ដើរតាមវដ្ដរបស់ចិន ហើយចាប់ផ្ដើមឆ្នាំនីមួយៗនៅបុណ្យ <span lang="vi">Tết</span> ដែលជាបុណ្យចូលឆ្នាំចិន។ មានសត្វពីរដែលខុសគ្នា។</p>
        <h2>ឆ្មា និងក្របី</h2>
        <p>សត្វទីបួនគឺឆ្មា ជំនួសឲ្យថោះ ហើយសត្វទីពីរគឺក្របី ដែលជាសត្វធ្លាប់ឃើញនៅវាលស្រែ ជំនួសឲ្យឆ្លូវ (គោ)។ ប្រសិនបើអ្នកកើតឆ្នាំថោះ ប្រពៃណីវៀតណាមហៅអ្នកថាឆ្នាំឆ្មា។</p>
        <h2>សត្វទាំងដប់ពីរ</h2>
        <ul>{ANIMALS.map((a) => <li key={a.slug}>{VIETNAMESE_ANIMAL[lang][a.index]} (<span lang="vi">{VIETNAMESE_TERMS[a.index]}</span>)</li>)}</ul>
        <p>ទំព័រលក្ខណៈបុគ្គល និងភាពត្រូវគ្នានៅលើគេហទំព័រនេះ ប្រើឈ្មោះសត្វតាមចិន ប៉ុន្តែលក្ខណៈបុគ្គលនៅតែដូចគ្នា។ អ្នកកើតឆ្នាំឆ្មាអានទំព័រឆ្នាំថោះ ហើយអ្នកកើតឆ្នាំក្របីអានទំព័រឆ្នាំឆ្លូវ។</p>
      </TextPage>
    );
  }
  return (
    <TextPage title="The Vietnamese zodiac" path="/southeast-asian-zodiac/vietnamese" crumbs={crumbs}>
      <p>The Vietnamese zodiac, con giáp, follows the Chinese cycle and starts each year at Tết, the Lunar New Year. Two animals look different.</p>
      <h2>The Cat and the Buffalo</h2>
      <p>The fourth animal is the Cat rather than the Rabbit, and the second is the Buffalo, a familiar sight in rice fields, rather than the Ox. If you were born in a Rabbit year, Vietnamese tradition calls you a Cat.</p>
      <h2>The twelve animals</h2>
      <ul>{ANIMALS.map((a) => <li key={a.slug}>{VIETNAMESE_ANIMAL[lang][a.index]} (<span lang="vi">{VIETNAMESE_TERMS[a.index]}</span>)</li>)}</ul>
      <p>Profiles and compatibility on this site use the Chinese names, but the personalities carry across. A Cat reads the Rabbit&apos;s profile, and a Buffalo reads the Ox&apos;s.</p>
    </TextPage>
  );
}
