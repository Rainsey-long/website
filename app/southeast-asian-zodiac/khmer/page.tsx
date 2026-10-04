import Link from "@/components/client/LocaleLink";
import TextPage from "@/components/TextPage";
import { KHMER_ANIMALS, songkran } from "@/lib/khmer";
import { lunarNewYear } from "@/lib/chinese";
import { longDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";
import { khmerDigits } from "@/lib/i18n";

const META = {
  en: { title: "The Khmer zodiac", description: "The twelve animals of the Khmer zodiac, their names, and why the Cambodian animal year begins at the Khmer New Year moment in April.", crumb: "Southeast Asian zodiac" },
  km: { title: "ឆ្នាំសត្វខ្មែរ", description: "សត្វទាំងដប់ពីរនៃឆ្នាំសត្វខ្មែរ ឈ្មោះរបស់វា និងហេតុអ្វីឆ្នាំសត្វនៅកម្ពុជាចាប់ផ្ដើមនៅពេលចូលឆ្នាំខ្មែរ ក្នុងខែមេសា។", crumb: "ឆ្នាំសត្វអាស៊ីអាគ្នេយ៍" },
};

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: META[lang].title, description: META[lang].description, path: "/southeast-asian-zodiac/khmer" });
}

export default async function KhmerZodiac() {
  const lang = await getLang();
  const years = [2024, 2025, 2026, 2027];
  const crumbs = [{ name: META[lang].crumb, href: "/southeast-asian-zodiac" }];
  if (lang === "km") {
    return (
      <TextPage title={META.km.title} path="/southeast-asian-zodiac/khmer" crumbs={crumbs}>
        <p>កម្ពុជាប្រើសត្វទាំងដប់ពីរដូចប្រទេសចិន តាមលំដាប់ដូចគ្នា។ អ្វីដែលខុសគ្នាគឺចំណុចចាប់ផ្ដើម។ សត្វថ្មីមកដល់នៅពេលមហាសង្ក្រាន្ត ដែលជាការចាប់ផ្ដើមបុណ្យចូលឆ្នាំខ្មែរ នៅពាក់កណ្ដាលខែមេសា។</p>
        <h2>ហេតុអ្វីសត្វប្រចាំឆ្នាំរបស់អ្នកអាចខុសគ្នា</h2>
        <p>អ្នកដែលកើតក្នុងខែមីនា ឆ្នាំ២០២៦ ជាឆ្នាំមមីតាមបុណ្យចូលឆ្នាំចិន ដែលធ្លាក់នៅថ្ងៃទី១៧ ខែកុម្ភៈ។ តាមការរាប់របស់ខ្មែរ គេនៅតែជាឆ្នាំម្សាញ់ ព្រោះមហាសង្ក្រាន្តមិនទាន់មកដល់រហូតដល់ថ្ងៃទី១៤ ខែមេសា ម៉ោង ១០:៤៨។ អ្នកដែលកើតពីចុងខែមករា ដល់ពាក់កណ្ដាលខែមេសា គឺជាអ្នកដែលគួរពិនិត្យមើល។</p>
        <h2>ឆ្នាំថ្មីៗកន្លងមក</h2>
        <ul>{years.map((y) => { const s = songkran(y); return <li key={y}>{`${khmerDigits(y)}៖ ចូលឆ្នាំចិន ${longDate(lunarNewYear(y), "km")}។ មហាសង្ក្រាន្ត ${longDate(s.date, "km")} ម៉ោង ${khmerDigits(s.time)}`}</li>; })}</ul>
        <p>ពេលចូលឆ្នាំខ្មែរ ត្រូវបានគណនាតាមវិធីគណនាចន្ទគតិប្រពៃណី។ ក្រសួងធម្មការ និងសាសនា ប្រកាសនាទីផ្លូវការជារៀងរាល់ឆ្នាំ។</p>
        <h2>ឈ្មោះសត្វ</h2>
        <ul>{KHMER_ANIMALS.map((a) => <li key={a.slug}>{a.km} (<span lang="en">{a.roman}</span>)</li>)}</ul>
        <p><Link href="/khmer">ប្រពៃណីខ្មែរផ្សេងទៀត</Link></p>
      </TextPage>
    );
  }
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
