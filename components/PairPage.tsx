/**
 * Compatibility pair page body (wireframe §7.4), shared by Western and Chinese pairs.
 * `noun` is in the page language ("sign" / "រាសី"); names arrive already localised.
 */
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
import { defineMessages, num } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

const T = defineMessages({
  en: {
    pair: (a: string, b: string) => `${a} and ${b}`, connect: (noun: string) => `How these ${noun}s connect`,
    strengths: "Strengths", challenges: "Challenges", advice: "Advice", related: "Related pairs and readings",
    share: (a: string, b: string, n: number) => `${a} and ${b}: ${n}% match`,
  },
  km: {
    pair: (a: string, b: string) => `${a} និង ${b}`, connect: (noun: string) => `របៀបដែល${noun}ទាំងពីរនេះភ្ជាប់គ្នា`,
    strengths: "ចំណុចខ្លាំង", challenges: "បញ្ហាប្រឈម", advice: "ដំបូន្មាន", related: "គូ និងការអានពាក់ព័ន្ធ",
    share: (a: string, b: string, n: number) => `${a} និង ${b}៖ ត្រូវគ្នា ${num(n, "km")}%`,
  },
});

type Side = { slug: string; name: string };
export default async function PairPage(p: {
  a: Side; b: Side; set: "western" | "animal"; base: string; crumb: string; noun: string;
  title: string; description: string; relationName: string; score: PairScore; copy: PairCopy;
  options: Side[]; related: Array<{ href: string; label: string }>; giftTitle: string; giftText: string;
}) {
  const lang = await getLang();
  const t = T[lang];
  const path = `${p.base}${[p.a.slug, p.b.slug].sort().join("-and-")}`;
  return (
    <>
      <Breadcrumbs items={[{ name: p.crumb, href: p.base.slice(0, -1) }, { name: t.pair(p.a.name, p.b.name), href: path }]} />
      <JsonLd data={[articleLd({ headline: p.title, description: p.description, path, lang })]} />
      <div className="mx-auto max-w-reading safe-x py-5 box-content">
        <CompatibilityResult a={p.a} b={p.b} set={p.set} relationName={p.relationName} score={p.score} title={p.title} />
        <div className="reading mt-6">
          <h2 className="text-h2">{t.connect(p.noun)}</h2>
          {p.copy.connect.map((x) => <p key={x} className="mt-3">{x}</p>)}
          <h2 className="mt-7 text-h2">{t.strengths}</h2>
          <ul className="mt-3 list-disc pl-5">{p.copy.strengths.map((x) => <li key={x} className="mt-2">{x}</li>)}</ul>
          <AdSlot placement="inContent" />
          <h2 className="mt-7 text-h2">{t.challenges}</h2>
          <ul className="mt-3 list-disc pl-5">{p.copy.challenges.map((x) => <li key={x} className="mt-2">{x}</li>)}</ul>
          <h2 className="mt-7 text-h2">{t.advice}</h2>
          <ul className="mt-3 list-disc pl-5">{p.copy.advice.map((x) => <li key={x} className="mt-2">{x}</li>)}</ul>
        </div>
        <Share title={p.title} text={t.share(p.a.name, p.b.name, p.score.score)} url={absolute(path)} />
        <PairPicker options={p.options} base={p.base} noun={p.noun} a={p.a.slug} b={p.b.slug} />
        <AffiliateBox title={p.giftTitle} text={p.giftText} href="#" store="Etsy" />
        <RelatedLinks heading={t.related} links={p.related} />
      </div>
    </>
  );
}
