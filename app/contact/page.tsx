import TextPage from "@/components/TextPage";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";

const META = {
  en: { title: "Contact", description: `How to contact ${SITE_NAME}.` },
};

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, ...META[lang], path: "/contact" });
}

export default async function Contact() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <TextPage title="Contact" path="/contact">
      <p>We read every message. For corrections, suggestions or partnership questions, email {mail}.</p>
      <p>We can&apos;t offer personal readings or advice by email. To tell us a reading was or wasn&apos;t helpful, use the buttons under any reading.</p>
    </TextPage>
  );
}
