import TextPage from "@/components/TextPage";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";
import { longDate } from "@/lib/dates";

const UPDATED = "2026-10-04";
const META = {
  en: { title: "Terms", description: `Terms of use for ${SITE_NAME}.` },
  km: { title: "លក្ខខណ្ឌប្រើប្រាស់", description: `លក្ខខណ្ឌប្រើប្រាស់ ${SITE_NAME}។` },
};

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, ...META[lang], path: "/terms" });
}

export default async function Terms() {
  const lang = await getLang();
  if (lang === "km") {
    const site = <span lang="en">{SITE_NAME}</span>;
    return (
      <TextPage title={META.km.title} path="/terms" updated={longDate(UPDATED, "km")}>
        <p className="text-small text-muted">ទំព័រនេះជាការបកប្រែ។ ប្រសិនបើកំណែភាសាខ្មែរ និងភាសាអង់គ្លេសខុសគ្នា កំណែភាសាអង់គ្លេសជាកំណែដែលមានអានុភាព។</p>
        <p>ដោយការប្រើប្រាស់ {site} អ្នកយល់ព្រមតាមលក្ខខណ្ឌទាំងនេះ។</p>
        <h2>ការកម្សាន្ត និងការពិចារណា</h2>
        <p>ការទស្សន៍ទាយ ការព្យាករណ៍ ពិន្ទុភាពត្រូវគ្នា ថ្ងៃក្នុងប្រតិទិនចិន និងប្រពៃណីខ្មែរ គឺសម្រាប់ការកម្សាន្ត និងការពិចារណា។ វាមិនមែនជាដំបូន្មានវេជ្ជសាស្ត្រ ច្បាប់ ហិរញ្ញវត្ថុ ឬវិជ្ជាជីវៈទេ។ សូមកុំធ្វើការសម្រេចចិត្តសំខាន់ៗដោយផ្អែកលើវាតែមួយមុខ។</p>
        <h2>មាតិការបស់យើង</h2>
        <p>អត្ថបទ សញ្ញា និងការរចនានៅលើគេហទំព័រនេះ ជាស្នាដៃដើម ហើយជាកម្មសិទ្ធិរបស់ {site}។ អ្នកអាចចែករំលែកតំណ និងសម្រង់ខ្លីៗ ដោយបញ្ជាក់ប្រភព។ សូមកុំចម្លងទំព័រទាំងមូល។</p>
        <h2>តំណ និងការទិញ</h2>
        <p>ទំព័រខ្លះមានតំណទៅគេហទំព័រផ្សេង រួមទាំងហាង។ យើងមិនទទួលខុសត្រូវចំពោះមាតិកា ផលិតផល ឬលក្ខខណ្ឌរបស់ពួកគេទេ។ កន្លែងណាដែលយើងអាចទទួលបានកម្រៃជើងសារ យើងប្រាប់នៅជាប់នឹងតំណនោះ។</p>
        <h2>ការផ្លាស់ប្ដូរ</h2>
        <p>យើងអាចកែប្រែលក្ខខណ្ឌទាំងនេះ។ កាលបរិច្ឆេទខាងលើបង្ហាញកំណែចុងក្រោយ។</p>
        <h2>ទំនាក់ទំនង</h2>
        <p><a href={`mailto:${CONTACT_EMAIL}`} lang="en">{CONTACT_EMAIL}</a></p>
      </TextPage>
    );
  }
  return (
    <TextPage title="Terms" path="/terms" updated={longDate(UPDATED)}>
      <p>By using {SITE_NAME} you agree to these terms.</p>
      <h2>Entertainment and reflection</h2>
      <p>Readings, forecasts, compatibility scores, almanac days and Khmer traditions are for entertainment and reflection. They are not medical, legal, financial or professional advice. Please don&apos;t make important decisions based on them alone.</p>
      <h2>Our content</h2>
      <p>The text, glyphs and design on this site are original and belong to {SITE_NAME}. You&apos;re welcome to share links and short quotes with credit. Please don&apos;t copy whole pages.</p>
      <h2>Links and purchases</h2>
      <p>Some pages link to other sites, including shops. We aren&apos;t responsible for their content, products or terms. Where we may earn a commission, we say so next to the link.</p>
      <h2>Changes</h2>
      <p>We may update these terms. The date above shows the latest version.</p>
      <h2>Contact</h2>
      <p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
    </TextPage>
  );
}
