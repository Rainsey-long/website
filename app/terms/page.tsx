import TextPage from "@/components/TextPage";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Terms", description: `Terms of use for ${SITE_NAME}.`, path: "/terms" });

export default function Terms() {
  return (
    <TextPage title="Terms" path="/terms" updated="4 October 2026">
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
