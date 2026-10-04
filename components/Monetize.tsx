/**
 * AdSlot (§6.11), AffiliateBox and ReportOffer (§6.12). All render nothing
 * while their flags are off in lib/site.ts. Ads: reserved fixed height, never
 * above the reading, inside a topic, inside forms, popups or sticky.
 */
import { FEATURES } from "@/lib/site";

export function AdSlot({ placement }: { placement: "afterReading" | "inContent" | "rail" }) {
  if (!FEATURES.ADS_ENABLED) return null;
  const h = placement === "rail" ? "h-ad-rail" : placement === "inContent" ? "h-ad-content" : "h-ad-mobile";
  return (
    <aside className={`my-7 flex flex-col ${h}`} aria-label="Advertisement">
      <span className="text-small text-muted">Advertisement</span>
      <div className="mt-1 flex-1 border border-rule" data-ad-slot={FEATURES.AD_SLOTS[placement]} />
    </aside>
  );
}

export function AffiliateBox({ title, text, href, store }: { title: string; text: string; href: string; store: string }) {
  if (!FEATURES.AFFILIATES_ENABLED) return null;
  return (
    <aside className="my-7 border border-rule p-5" aria-label="Recommended">
      <h2 className="text-h3">{title}</h2>
      <p className="mt-2">{text}</p>
      <a href={href} rel="sponsored nofollow noopener" target="_blank" className="btn-secondary mt-4">View on {store}</a>
      <p className="mt-3 text-small text-muted">We may earn a commission if you buy through this link, at no extra cost to you.</p>
    </aside>
  );
}

export function ReportOffer({ title, text }: { title: string; text: string }) {
  if (!FEATURES.REPORT_CTA_ENABLED) return null;
  return (
    <aside className="my-7 border border-rule p-5" aria-label="Full report">
      <h2 className="text-h3">{title}</h2>
      <p className="mt-2">{text}</p>
      <a href={FEATURES.REPORT_URL} rel="noopener" className="btn-secondary mt-4">Get the full report</a>
      <p className="mt-3 text-small text-muted">A paid PDF, sold through our store. The free reading above stays free.</p>
    </aside>
  );
}
