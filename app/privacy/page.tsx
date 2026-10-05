/**
 * Privacy policy. Every statement here is read off the code it describes:
 * the advertising section follows lib/ads.ts (adsConfigured), analytics
 * follows FEATURES.CF_ANALYTICS_TOKEN, and the storage list matches the only
 * keys the code writes (theme, mySign, people) and the only cookies it sets
 * (traditions, tz; al_session for the site's own admins). Change this page in
 * the same commit as any change to what the site stores or sends.
 *
 * The advertising wording includes what AdSense requires of a publisher's
 * privacy policy (support.google.com/adsense/answer/1348695, read 2026-10-05).
 */
import TextPage from "@/components/TextPage";
import PrivacyChoices from "@/components/client/PrivacyChoices";
import { CONTACT_EMAIL, FEATURES, SITE_NAME } from "@/lib/site";
import { adsConfigured } from "@/lib/ads";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";
import { longDate } from "@/lib/dates";

const UPDATED = "2026-10-05";

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({
    lang,
    title: "Privacy policy",
    description: `How ${SITE_NAME} handles your data: no accounts, birth details stay in your browser, what is stored, advertising and your choices.`,
    path: "/privacy",
  });
}

const Ext = ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href} rel="noopener noreferrer" target="_blank">{children}</a>;

export default async function Privacy() {
  const ads = adsConfigured();
  const analytics = !!FEATURES.CF_ANALYTICS_TOKEN;
  return (
    <TextPage title="Privacy policy" path="/privacy" updated={longDate(UPDATED)}>
      <h2>The short version</h2>
      <ul>
        <li>There are no accounts. You never sign in, and we never ask for your name or email.</li>
        <li>Birth dates, times, places and names you type into our tools are worked out <strong>in your browser</strong>. They are never sent to us.</li>
        <li>We set two small preference cookies and keep a few choices in your browser. None of them identifies you.</li>
        <li>{ads ? "We show ads from Google. Google and its partners may use cookies to choose and measure ads; where the law requires it, you are asked first, and you can change your choice at any time." : "We do not show ads at the moment. If we start, this page will say so before any ad code runs."}</li>
      </ul>

      <h2>Who we are</h2>
      <p>{SITE_NAME} is a free horoscope and almanac website, for entertainment and reflection. For anything about your data, write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>

      <h2>What stays on your device</h2>
      <p>These are kept in your browser&apos;s local storage. They never leave your device, and clearing this site&apos;s data in your browser removes them all.</p>
      <ul>
        <li><code>mySign</code>: the sign you chose to remember, so the homepage opens on your reading.</li>
        <li><code>theme</code>: light or dark, if you picked one.</li>
        <li><code>people</code>: only if you use “Save this person” in a tool. The labels, birth dates, times and cities you saved, up to six. “Forget” removes one person.</li>
      </ul>
      <p>If you install the site as an app, your browser also keeps copies of the last pages you visited so they open offline. Those copies stay on your device.</p>

      <h2>Cookies</h2>
      <p>Our own cookies, first-party and never shared:</p>
      <ul>
        <li><code>traditions</code>: which traditions you chose to see (Western, Chinese, Khmer). Kept for a year.</li>
        <li><code>tz</code>: your time zone name, so “today” matches your calendar. Kept for a year.</li>
        <li><code>al_session</code>: set only when one of the site&apos;s own administrators signs in. Visitors never receive it.</li>
      </ul>
      <p>{ads ? "Advertising cookies set by Google and its partners are described under Advertising below." : "No advertising or tracking cookies are set."}</p>

      <h2>What reaches our server</h2>
      <ul>
        <li><strong>Pages you open.</strong> Like any website, our hosting provider (Railway) and DNS provider (Cloudflare) process your IP address and browser details to deliver pages and protect the site from abuse. We do not keep these in our database. To limit abuse, the site counts recent requests in memory for a few minutes; nothing is written down.</li>
        <li><strong>Feedback.</strong> If you say whether a reading helped, we store the page, your answer, which text blocks you saw and any comment you write. No IP address and nothing that identifies you. Please do not put personal details in a comment.</li>
        <li><strong>Dates you look up</strong> in the date converter, the lucky-date finder or the calendars are part of the page address, so they reach the server like any page. Use the age tool, which works in your browser, for your own birth date.</li>
      </ul>

      <h2>Analytics</h2>
      <p>{analytics ? "We count visits with Cloudflare Web Analytics. It sets no cookies, does not fingerprint you and does not follow you across sites." : "We do not run analytics at the moment. If we add it, it will be Cloudflare Web Analytics, which sets no cookies and does not follow you across sites."}</p>

      <h2>Advertising</h2>
      {ads ? (
        <>
          <p>We use Google AdSense to show ads, which keeps the site free. Ads appear in marked spaces after the content, never inside a reading or a form. The ad code is never loaded on the tools where you enter birth details or personal dates, so what you type there stays on your device.</p>
          <p>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites. Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and/or other sites on the Internet.</p>
          <p>You may opt out of personalised advertising by visiting <Ext href="https://adssettings.google.com">Google&apos;s Ads Settings</Ext>. You can also opt out of some other vendors&apos; personalised advertising at <Ext href="https://www.aboutads.info/choices">aboutads.info</Ext> or, in Europe, <Ext href="https://www.youronlinechoices.eu">youronlinechoices.eu</Ext>. How Google uses information from sites that use its services is explained at <Ext href="https://policies.google.com/technologies/partner-sites">policies.google.com/technologies/partner-sites</Ext>.</p>
          <p>If you are in the European Economic Area, the United Kingdom or Switzerland, Google&apos;s consent message asks you first, and without your consent you see only non-personalised or limited ads. You can change or withdraw your choice at any time: <PrivacyChoices />.</p>
        </>
      ) : (
        <p>We do not show ads at the moment. If we start, we will use Google AdSense, update this page first, and visitors in the European Economic Area, the United Kingdom and Switzerland will be asked for consent before any personalised ads.</p>
      )}

      <h2>Children</h2>
      <p>The site is meant for adults and is not directed at children under 13. We do not knowingly collect information from children, and we hold nothing that identifies anyone.</p>

      <h2>Your rights</h2>
      <p>Depending on where you live (for example under the GDPR, the UK GDPR or California law), you can ask what we hold about you, and ask us to correct or delete it, or to stop using it. In practice we hold nothing that identifies you: your saved choices are on your own device, and you remove them by clearing this site&apos;s data. If you want a feedback comment removed, write to us with the page and roughly when you sent it. We do not sell personal information.{ads ? " Advertising choices are made through Google's tools linked above." : ""} You can also complain to your local data protection authority.</p>

      <h2>Changes</h2>
      <p>We update this page whenever what the site stores or sends changes, and change the date at the top.</p>
    </TextPage>
  );
}
