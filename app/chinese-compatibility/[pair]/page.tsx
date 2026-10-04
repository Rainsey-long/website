import { notFound, permanentRedirect } from "next/navigation";
import PairPage from "@/components/PairPage";
import { ANIMALS, animalBySlug, elementRelation } from "@/lib/chinese";
import { RELATION_NAME, chineseScore, pairSlug, parsePairSlug } from "@/lib/compatibility";
import { chineseCopy } from "@/lib/compat-copy";
import { pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ pair: string }> };
export function generateStaticParams() {
  const out: Array<{ pair: string }> = [];
  for (const a of ANIMALS) for (const b of ANIMALS) if (a.slug <= b.slug) out.push({ pair: pairSlug(a.slug, b.slug) });
  return out;
}

function resolve(slug: string) {
  const p = parsePairSlug(slug);
  const a = p && animalBySlug(p[0]), b = p && animalBySlug(p[1]);
  return a && b ? { a, b, canonical: pairSlug(a.slug, b.slug) } : null;
}

export async function generateMetadata({ params }: Params) {
  const r = resolve((await params).pair);
  if (!r) return {};
  const s = chineseScore(r.a, r.b);
  return pageMetadata({ title: `${r.a.name} and ${r.b.name} Chinese zodiac compatibility`, description: `${r.a.name} and ${r.b.name}: ${RELATION_NAME[s.relation]}, ${s.score}% match. How these animals connect in love, friendship and work.`, path: `/chinese-compatibility/${r.canonical}`, type: "article" });
}

export default async function ChinesePair({ params }: Params) {
  const slug = (await params).pair;
  const r = resolve(slug);
  if (!r) notFound();
  if (slug !== r.canonical) permanentRedirect(`/chinese-compatibility/${r.canonical}`);
  const [a, b] = [r.a, r.b].sort((x, y) => x.slug.localeCompare(y.slug));
  const s = chineseScore(a, b);
  const others = ANIMALS.filter((x) => x.slug !== a.slug && x.slug !== b.slug && chineseScore(a, x).relation === "three-harmonies").slice(0, 2);
  return (
    <PairPage a={a} b={b} set="animal" base="/chinese-compatibility/" crumb="Chinese compatibility" noun="animal"
      title={`${a.name} and ${b.name} Chinese zodiac compatibility`} description={`${a.name} and ${b.name}: ${s.score}% match.`}
      relationName={RELATION_NAME[s.relation]} score={s} copy={chineseCopy(a, b, s.relation, elementRelation(a.branchElement, b.branchElement))} options={ANIMALS}
      giftTitle="Zodiac animal gifts" giftText="Small, well-made gifts for the animals in your life."
      related={[
        ...others.map((o) => ({ href: `/chinese-compatibility/${pairSlug(a.slug, o.slug)}`, label: `${a.name} and ${o.name}` })),
        { href: `/chinese-zodiac/${a.slug}/2027`, label: `${a.name} in 2027` },
        { href: `/chinese-zodiac/${b.slug}/2027`, label: `${b.name} in 2027` },
        { href: `/chinese-zodiac/${a.slug}`, label: `${a.name} profile` },
      ]} />
  );
}
