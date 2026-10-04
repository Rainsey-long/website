import TextPage from "@/components/TextPage";
import { DISCLAIMER, DISCLAIMER_KM } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";

const META = {
  en: { title: "Disclaimer", description: "Readings on this site are for entertainment and reflection, not advice." },
  km: { title: "ការបដិសេធទំនួលខុសត្រូវ", description: "ការទស្សន៍ទាយនៅលើគេហទំព័រនេះ គឺសម្រាប់ការកម្សាន្ត និងការពិចារណា មិនមែនជាដំបូន្មានទេ។" },
};

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, ...META[lang], path: "/disclaimer" });
}

export default async function Disclaimer() {
  const lang = await getLang();
  if (lang === "km") {
    return (
      <TextPage title={META.km.title} path="/disclaimer">
        <p>{DISCLAIMER_KM}</p>
        <p>ហោរាសាស្ត្រ ប្រតិទិនចិន និងប្រពៃណីប្រតិទិនខ្មែរ ជាទំនៀមទម្លាប់វប្បធម៌។ យើងបង្ហាញវាដោយយកចិត្តទុកដាក់ ប៉ុន្តែវាមិនអាចទស្សន៍ទាយព្រឹត្តិការណ៍បានទេ ហើយគ្មានអ្វីនៅទីនេះអាចជំនួសដំបូន្មានពីអ្នកជំនាញដែលមានគុណវុឌ្ឍិបានឡើយ។</p>
        <p>ទីតាំងនៅលើមេឃត្រូវបានគណនាដោយកម្មវិធីតារាសាស្ត្របើកចំហ។ ព័ត៌មានក្នុងប្រតិទិនចិនបានមកពីប្រតិទិនចិនប្រពៃណី ហើយថ្ងៃខែខ្មែរបានមកពីវិធីគណនាចន្ទគតិប្រពៃណី។ ពិន្ទុភាពត្រូវគ្នា គឺជាការសង្ខេបបែបលេងសើចនៃច្បាប់ប្រពៃណី មិនមែនជារង្វាស់នៃទំនាក់ទំនងពិតណាមួយទេ។</p>
        <p className="text-small text-muted">ទំព័រនេះជាការបកប្រែ។ ប្រសិនបើកំណែភាសាខ្មែរ និងភាសាអង់គ្លេសខុសគ្នា កំណែភាសាអង់គ្លេសជាកំណែដែលមានអានុភាព។</p>
      </TextPage>
    );
  }
  return (
    <TextPage title="Disclaimer" path="/disclaimer">
      <p>{DISCLAIMER}</p>
      <p>Astrology, the Chinese almanac and Khmer calendar traditions are cultural practices. We present them with care, but they can&apos;t predict events, and nothing here replaces advice from a qualified professional.</p>
      <p>Sky positions are calculated with open astronomy software. Almanac entries come from the traditional Chinese calendar, and Khmer dates from the Chhankitek method. Compatibility scores are a playful summary of traditional rules, not a measure of any real relationship.</p>
    </TextPage>
  );
}
