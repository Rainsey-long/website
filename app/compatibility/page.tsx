import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import PairIndex from "@/components/PairIndex";
import PairPicker from "@/components/client/PairPicker";
import { SIGNS } from "@/lib/western";
import { westernScore } from "@/lib/compatibility";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Zodiac compatibility for every pair", description: "Compatibility for all 78 Western zodiac pairings: love, friendship and work, explained by element and aspect.", path: "/compatibility" });

export default function CompatIndex() {
  return (
    <>
      <Breadcrumbs items={[{ name: "Compatibility", href: "/compatibility" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">Zodiac compatibility</h1>
        <p className="reading mt-3 text-muted">Pick two signs to see how they connect. Scores come from elements and the angle between signs on the wheel. For the animals, see <Link className="link text-ink" href="/chinese-compatibility">Chinese compatibility</Link>.</p>
        <PairPicker options={SIGNS} base="/compatibility/" noun="sign" heading="Check two signs" a="aries" b="leo" />
        <PairIndex items={SIGNS} set="western" base="/compatibility/" score={(a, b) => westernScore(a, b).score} />
      </div>
    </>
  );
}
