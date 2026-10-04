import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PairIndex from "@/components/PairIndex";
import PairPicker from "@/components/client/PairPicker";
import { ANIMALS } from "@/lib/chinese";
import { RELATION_NAME, chineseScore } from "@/lib/compatibility";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Chinese zodiac compatibility", description: "Compatibility for all 78 Chinese zodiac animal pairings, from the Three Harmonies to the Six Clashes, with love, friendship and work scores.", path: "/chinese-compatibility" });

export default function ChineseCompatIndex() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Chinese compatibility", href: "/chinese-compatibility" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">Chinese zodiac compatibility</h1>
        <p className="reading mt-3 text-muted">Traditional tables group the animals into harmonies, clashes and harms. The same animals and pairings are used in Cambodia and Vietnam. Looking for star signs? See <Link className="link text-ink" href="/compatibility">Western compatibility</Link>.</p>
        <PairPicker options={ANIMALS} base="/chinese-compatibility/" noun="animal" heading="Check two animals" a="rat" b="dragon" />
        <PairIndex items={ANIMALS} set="animal" base="/chinese-compatibility/" score={(a, b) => chineseScore(a, b).score} label={(a, b) => RELATION_NAME[chineseScore(a, b).relation]} />
      </div>
    </>
  );
}
