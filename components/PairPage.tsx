/** Compatibility pair page body (wireframe §7.4), shared by Western and Chinese pairs. */
import Breadcrumbs from "./Breadcrumbs";
import CompatibilityResult from "./CompatibilityResult";
import JsonLd from "./JsonLd";
import RelatedLinks from "./RelatedLinks";
import { AdSlot, AffiliateBox } from "./Monetize";
import Share from "./client/Share";
import PairPicker from "./client/PairPicker";
import type { PairCopy } from "@/lib/compat-copy";
import type { PairScore } from "@/lib/compatibility";
import { absolute, articleLd } from "@/lib/seo";

type Side = { slug: string; name: string };
export default function PairPage(p: {
  a: Side; b: Side; set: "western" | "animal"; base: string; crumb: string; noun: string;
  title: string; description: string; relationName: string; score: PairScore; copy: PairCopy;
  options: Side[]; related: Array<{ href: string; label: string }>; giftTitle: string; giftText: string;
}) {
  const path = `${p.base}${[p.a.slug, p.b.slug].sort().join("-and-")}`;
  return (
    <>
      <Breadcrumbs items={[{ name: p.crumb, href: p.base.slice(0, -1) }, { name: `${p.a.name} and ${p.b.name}`, href: path }]} />
      <JsonLd data={[articleLd({ headline: p.title, description: p.description, path })]} />
      <div className="mx-auto max-w-reading safe-x py-5 box-content">
        <CompatibilityResult a={p.a} b={p.b} set={p.set} relationName={p.relationName} score={p.score} title={p.title} />
        <div className="reading mt-6">
          <h2 className="text-h2">How these {p.noun}s connect</h2>
          {p.copy.connect.map((x) => <p key={x} className="mt-3">{x}</p>)}
          <h2 className="mt-7 text-h2">Strengths</h2>
          <ul className="mt-3 list-disc pl-5">{p.copy.strengths.map((x) => <li key={x} className="mt-2">{x}</li>)}</ul>
          <AdSlot placement="inContent" />
          <h2 className="mt-7 text-h2">Challenges</h2>
          <ul className="mt-3 list-disc pl-5">{p.copy.challenges.map((x) => <li key={x} className="mt-2">{x}</li>)}</ul>
          <h2 className="mt-7 text-h2">Advice</h2>
          <ul className="mt-3 list-disc pl-5">{p.copy.advice.map((x) => <li key={x} className="mt-2">{x}</li>)}</ul>
        </div>
        <Share title={p.title} text={`${p.a.name} and ${p.b.name}: ${p.score.score}% match`} url={absolute(path)} />
        <PairPicker options={p.options} base={p.base} noun={p.noun} a={p.a.slug} b={p.b.slug} />
        <AffiliateBox title={p.giftTitle} text={p.giftText} href="#" store="Etsy" />
        <RelatedLinks heading="Related pairs and readings" links={p.related} />
      </div>
    </>
  );
}
