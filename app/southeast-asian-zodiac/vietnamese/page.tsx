import TextPage from "@/components/TextPage";
import { ANIMALS } from "@/lib/chinese";
import { VIETNAMESE_NAMES } from "@/lib/sea-variants";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "The Vietnamese zodiac", description: "The Vietnamese zodiac, con giáp: the same twelve-year cycle as China, with the Cat in place of the Rabbit and the Buffalo for the Ox.", path: "/southeast-asian-zodiac/vietnamese" });

export default function Vietnamese() {
  return (
    <TextPage title="The Vietnamese zodiac" path="/southeast-asian-zodiac/vietnamese" crumbs={[{ name: "Southeast Asian zodiac", href: "/southeast-asian-zodiac" }]}>
      <p>The Vietnamese zodiac, con giáp, follows the Chinese cycle and starts each year at Tết, the Lunar New Year. Two animals look different.</p>
      <h2>The Cat and the Buffalo</h2>
      <p>The fourth animal is the Cat rather than the Rabbit, and the second is the Buffalo, a familiar sight in rice fields, rather than the Ox. If you were born in a Rabbit year, Vietnamese tradition calls you a Cat.</p>
      <h2>The twelve animals</h2>
      <ul lang="vi">{ANIMALS.map((a) => <li key={a.slug}>{VIETNAMESE_NAMES[a.index]}</li>)}</ul>
      <p>Profiles and compatibility on this site use the Chinese names, but the personalities carry across. A Cat reads the Rabbit&apos;s profile, and a Buffalo reads the Ox&apos;s.</p>
    </TextPage>
  );
}
