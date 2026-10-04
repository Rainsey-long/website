/**
 * AdSlot (§6.11), AffiliateBox and ReportOffer (§6.12). All render nothing
 * while their flags are off in lib/site.ts. Ads: reserved fixed height, never
 * above the reading, inside a topic, inside forms, popups or sticky.
 */
import { FEATURES } from "@/lib/site";
import { defineMessages } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

const T = defineMessages({
  en: {
    ad: "Advertisement", recommended: "Recommended", viewOn: (store: string) => `View on ${store}`,
    commission: "We may earn a commission if you buy through this link, at no extra cost to you.",
    fullReport: "Full report", getReport: "Get the full report", paid: "A paid PDF, sold through our store. The free reading above stays free.",
  },
  km: {
    ad: "ពាណិជ្ជកម្ម", recommended: "ការណែនាំ", viewOn: (store: string) => `មើលនៅ ${store}`,
    commission: "យើងអាចទទួលបានកម្រៃជើងសារ ប្រសិនបើអ្នកទិញតាមតំណនេះ ដោយអ្នកមិនចំណាយបន្ថែមទេ។",
    fullReport: "របាយការណ៍ពេញលេញ", getReport: "ទទួលរបាយការណ៍ពេញលេញ", paid: "ជាឯកសារ PDF ដែលត្រូវបង់ប្រាក់ លក់តាមហាងរបស់យើង។ ការអានឥតគិតថ្លៃខាងលើនៅតែឥតគិតថ្លៃ។",
  },
});

export async function AdSlot({ placement }: { placement: "afterReading" | "inContent" | "rail" }) {
  if (!FEATURES.ADS_ENABLED) return null;
  const t = T[await getLang()];
  const h = placement === "rail" ? "h-ad-rail" : placement === "inContent" ? "h-ad-content" : "h-ad-mobile";
  return (
    <aside className={`my-7 flex flex-col ${h}`} aria-label={t.ad}>
      <span className="text-small text-muted">{t.ad}</span>
      <div className="mt-1 flex-1 border border-rule" data-ad-slot={FEATURES.AD_SLOTS[placement]} />
    </aside>
  );
}

export async function AffiliateBox({ title, text, href, store }: { title: string; text: string; href: string; store: string }) {
  if (!FEATURES.AFFILIATES_ENABLED) return null;
  const t = T[await getLang()];
  return (
    <aside className="my-7 border border-rule p-5" aria-label={t.recommended}>
      <h2 className="text-h3">{title}</h2>
      <p className="mt-2">{text}</p>
      <a href={href} rel="sponsored nofollow noopener" target="_blank" className="btn-secondary mt-4">{t.viewOn(store)}</a>
      <p className="mt-3 text-small text-muted">{t.commission}</p>
    </aside>
  );
}

export async function ReportOffer({ title, text }: { title: string; text: string }) {
  if (!FEATURES.REPORT_CTA_ENABLED) return null;
  const t = T[await getLang()];
  return (
    <aside className="my-7 border border-rule p-5" aria-label={t.fullReport}>
      <h2 className="text-h3">{title}</h2>
      <p className="mt-2">{text}</p>
      <a href={FEATURES.REPORT_URL} rel="noopener" className="btn-secondary mt-4">{t.getReport}</a>
      <p className="mt-3 text-small text-muted">{t.paid}</p>
    </aside>
  );
}
