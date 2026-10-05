/**
 * Shown by the service worker (public/sw.js) when a page is requested with no
 * network and no cached copy. Cached at install time in both languages.
 * Noindex: it is not a page anyone should land on from search.
 */
import TextPage from "@/components/TextPage";
import Link from "@/components/client/LocaleLink";
import { getLang } from "@/lib/langServer";
import { pageMetadata } from "@/lib/seo";
import { defineMessages } from "@/lib/i18n";

const T = defineMessages({
  en: {
    title: "You are offline",
    description: "This page is not saved on this device yet.",
    body: "This page is not saved on this device yet. Pages you have opened recently still work without a connection; this one will too once you have visited it online.",
    retry: "When you are connected again, reload the page or go back to the home page.",
    home: "Home page",
  },
  km: {
    title: "អ្នកមិនមានអ៊ីនធឺណិតទេ",
    description: "ទំព័រនេះមិនទាន់បានរក្សាទុកនៅលើឧបករណ៍នេះនៅឡើយទេ។",
    body: "ទំព័រនេះមិនទាន់បានរក្សាទុកនៅលើឧបករណ៍នេះនៅឡើយទេ។ ទំព័រដែលអ្នកបានបើកថ្មីៗនេះនៅតែអាចមើលបានដោយគ្មានអ៊ីនធឺណិត ហើយទំព័រនេះក៏នឹងអាចមើលបានដែរ បន្ទាប់ពីអ្នកបានបើកវាពេលមានអ៊ីនធឺណិត។",
    retry: "ពេលមានអ៊ីនធឺណិតវិញ សូមផ្ទុកទំព័រឡើងវិញ ឬត្រឡប់ទៅទំព័រដើម។",
    home: "ទំព័រដើម",
  },
});

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/offline", noindex: true });
}

export default async function Offline() {
  const lang = await getLang();
  const t = T[lang];
  return (
    <TextPage title={t.title} path="/offline">
      <p>{t.body}</p>
      <p>{t.retry}</p>
      <p><Link href="/" className="link">{t.home}</Link></p>
    </TextPage>
  );
}
