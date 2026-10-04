import TextPage from "@/components/TextPage";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Contact", description: `How to contact ${SITE_NAME}.`, path: "/contact" });

export default function Contact() {
  return (
    <TextPage title="Contact" path="/contact">
      <p>We read every message. For corrections, suggestions or partnership questions, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      <p>We can&apos;t offer personal readings or advice by email. To tell us a reading was or wasn&apos;t helpful, use the buttons under any reading.</p>
    </TextPage>
  );
}
