import TextPage from "@/components/TextPage";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";

const META = {
  en: { title: "Contact", description: `How to contact ${SITE_NAME}.` },
  km: { title: "ទំនាក់ទំនង", description: `របៀបទាក់ទង ${SITE_NAME}។` },
};

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, ...META[lang], path: "/contact" });
}

export default async function Contact() {
  const lang = await getLang();
  const mail = <a href={`mailto:${CONTACT_EMAIL}`} lang={lang === "km" ? "en" : undefined}>{CONTACT_EMAIL}</a>;
  if (lang === "km") {
    return (
      <TextPage title={META.km.title} path="/contact">
        <p>យើងអានរាល់សារដែលផ្ញើមក។ សម្រាប់ការកែតម្រូវ សំណូមពរ ឬសំណួរអំពីភាពជាដៃគូ សូមផ្ញើអ៊ីមែលមក {mail}។</p>
        <p>យើងមិនអាចផ្ដល់ការទស្សន៍ទាយផ្ទាល់ខ្លួន ឬដំបូន្មានតាមអ៊ីមែលបានទេ។ ដើម្បីប្រាប់យើងថាការទស្សន៍ទាយមួយមានប្រយោជន៍ ឬអត់ សូមប្រើប៊ូតុងនៅក្រោមការទស្សន៍ទាយនីមួយៗ។</p>
      </TextPage>
    );
  }
  return (
    <TextPage title="Contact" path="/contact">
      <p>We read every message. For corrections, suggestions or partnership questions, email {mail}.</p>
      <p>We can&apos;t offer personal readings or advice by email. To tell us a reading was or wasn&apos;t helpful, use the buttons under any reading.</p>
    </TextPage>
  );
}
