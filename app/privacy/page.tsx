import TextPage from "@/components/TextPage";
import { CONTACT_EMAIL, FEATURES, SITE_NAME } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";
import { longDate } from "@/lib/dates";

const UPDATED = "2026-10-04";
const META = {
  en: { title: "Privacy", description: `How ${SITE_NAME} handles your data: birth details stay in your browser, no accounts, minimal analytics.` },
};

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, ...META[lang], path: "/privacy" });
}

export default async function Privacy() {
  return (
    <TextPage title="Privacy" path="/privacy" updated={longDate(UPDATED)}>
      <h2>The short version</h2>
      <p>We don&apos;t ask you to sign up, and the birth details you type into our tools never leave your device. The calculations run in your browser.</p>
      <p>If you save people for quick filling, their labels, birth dates, times and cities are kept in your browser&apos;s local storage, under the name &quot;people&quot;. They are never sent to us. &quot;Forget&quot; removes one person, and clearing this site&apos;s data removes them all. Numerology is worked out in your browser too; the date and name you enter are not sent.</p>
      <h2>What stays on your device</h2>
      <p>If you save your sign or choose a theme, your browser keeps that choice in its local storage. You can clear it at any time, or use &quot;Change sign&quot; on the homepage.</p>
      <h2>Cookies we set</h2>
      <p>Two small preference cookies, both first-party and never shared: <code>traditions</code> remembers which traditions you chose to see, and <code>tz</code> holds your time zone name so &quot;today&quot; matches your calendar. Neither identifies you.</p>
      <h2>Feedback</h2>
      <p>If you tell us whether a reading was helpful, we store the page, your answer and any comment you write. We don&apos;t store your IP address or anything that identifies you.</p>
      <h2>Analytics</h2>
      <p>{FEATURES.CF_ANALYTICS_TOKEN ? "We use Cloudflare Web Analytics to count visits. It does not use cookies and does not track you across sites." : "We may use Cloudflare Web Analytics to count visits. It does not use cookies and does not track you across sites."}</p>
      <h2>Advertising</h2>
      <p>{FEATURES.ADS_ENABLED ? "We show ads from third-party networks. Those networks may use cookies. Visitors in the EEA and UK are asked for consent first." : "We don't show ads at the moment. If that changes, this page will explain what the ad networks collect and how to choose, and visitors in the EEA and UK will be asked for consent first."}</p>
      <h2>Contact</h2>
      <p>Questions about privacy: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </TextPage>
  );
}
