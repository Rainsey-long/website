/** Faq — native disclosure (keyboard accessible). FAQPage JSON-LD is emitted by the page. */
import type { Faq as FaqItem } from "@/lib/content";

export default async function Faq({ items }: { items: FaqItem[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="faq-h" className="faq mt-7 border-t border-rule pt-5">
      <h2 id="faq-h" className="text-h2">Questions</h2>
      <div className="mt-3">
        {items.map((f) => (
          <details key={f.q} className="border-b border-rule">
            <summary className="flex min-h-tap cursor-pointer items-center py-3 serif text-h3">{f.q}</summary>
            <p className="reading pb-4">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
