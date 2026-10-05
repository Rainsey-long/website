import Link from "@/components/client/LocaleLink";
import TextPage from "@/components/TextPage";
import { KHMER_ANIMALS, songkran } from "@/lib/khmer";
import { lunarNewYear } from "@/lib/chinese";
import { longDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";

const META = {
  en: { title: "The Khmer zodiac", description: "The twelve animals of the Khmer zodiac, their names, and why the Cambodian animal year begins at the Khmer New Year moment in April.", crumb: "Southeast Asian zodiac" },
};

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: META[lang].title, description: META[lang].description, path: "/southeast-asian-zodiac/khmer" });
}

export default async function KhmerZodiac() {
  const years = [2024, 2025, 2026, 2027];
  const crumbs = [{ name: META.en.crumb, href: "/southeast-asian-zodiac" }];
  return (
    <TextPage title="The Khmer zodiac" path="/southeast-asian-zodiac/khmer" crumbs={crumbs}>
      <p>Cambodia uses the same twelve animals as China, in the same order. What changes is the starting line. The new animal arrives at the moment of Moha Songkran, the start of Khmer New Year, in the middle of April.</p>
      <h2>Why your animal may differ</h2>
      <p>Someone born in March 2026 is a Horse by Lunar New Year, which fell on 17 February. By the Khmer count they are still a Snake, because Moha Songkran did not arrive until 14 April at 10:48. Births from late January to mid-April are the ones to check.</p>
      <h2>Recent new years</h2>
      <ul>{years.map((y) => { const s = songkran(y); return <li key={y}>{y}: Lunar New Year {longDate(lunarNewYear(y))}; Moha Songkran {longDate(s.date)} at {s.time}</li>; })}</ul>
      <p>Khmer New Year moments are calculated with the traditional Chhankitek method. The Ministry of Cults and Religion announces the official minute each year.</p>
      <h2>The animal names</h2>
      <ul>{KHMER_ANIMALS.map((a) => <li key={a.slug}>{a.en}: <span lang="km">{a.km}</span> ({a.roman})</li>)}</ul>
      <p><Link href="/khmer">More Khmer traditions</Link></p>
    </TextPage>
  );
}
