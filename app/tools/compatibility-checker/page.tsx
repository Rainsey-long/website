import Breadcrumbs from "@/components/Breadcrumbs";
import Checker from "@/components/client/Checker";
import { SIGNS } from "@/lib/western";
import { ANIMALS } from "@/lib/chinese";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Compatibility checker", description: "Check zodiac compatibility for any two Western signs or zodiac animals: overall match, love, friendship and work.", path: "/tools/compatibility-checker" });

export default function CheckerPage() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Compatibility checker", href: "/tools/compatibility-checker" }]} />
      <div className="mx-auto max-w-reading safe-x py-6 box-content">
        <h1 className="text-h1">Compatibility checker</h1>
        <p className="reading mt-3 text-muted">Choose a system and two signs. You&apos;ll go straight to the full pair page.</p>
        <Checker signs={SIGNS.map(({ slug, name }) => ({ slug, name }))} animals={ANIMALS.map(({ slug, name }) => ({ slug, name }))} />
      </div>
    </>
  );
}
