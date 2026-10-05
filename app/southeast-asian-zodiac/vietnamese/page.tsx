import TextPage from "@/components/TextPage";
import { ANIMALS } from "@/lib/chinese";
import { VIETNAMESE_ANIMAL, VIETNAMESE_TERMS } from "@/lib/sea-variants";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";

const META = {
  en: { title: "The Vietnamese zodiac", description: "The Vietnamese zodiac, con giáp: the same twelve-year cycle as China, with the Cat in place of the Rabbit and the Buffalo for the Ox.", crumb: "Southeast Asian zodiac" },
};

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: META[lang].title, description: META[lang].description, path: "/southeast-asian-zodiac/vietnamese" });
}

export default async function Vietnamese() {
  const crumbs = [{ name: META.en.crumb, href: "/southeast-asian-zodiac" }];
  return (
    <TextPage title="The Vietnamese zodiac" path="/southeast-asian-zodiac/vietnamese" crumbs={crumbs}>
      <p>The Vietnamese zodiac, con giáp, follows the Chinese cycle and starts each year at Tết, the Lunar New Year. Two animals look different.</p>
      <h2>The Cat and the Buffalo</h2>
      <p>The fourth animal is the Cat rather than the Rabbit, and the second is the Buffalo, a familiar sight in rice fields, rather than the Ox. If you were born in a Rabbit year, Vietnamese tradition calls you a Cat.</p>
      <h2>The twelve animals</h2>
      <ul>{ANIMALS.map((a) => <li key={a.slug}>{VIETNAMESE_ANIMAL.en[a.index]} (<span lang="vi">{VIETNAMESE_TERMS[a.index]}</span>)</li>)}</ul>
      <p>Profiles and compatibility on this site use the Chinese names, but the personalities carry across. A Cat reads the Rabbit&apos;s profile, and a Buffalo reads the Ox&apos;s.</p>
    </TextPage>
  );
}
