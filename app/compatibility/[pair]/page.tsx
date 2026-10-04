import { notFound, permanentRedirect } from "next/navigation";
import PairPage from "@/components/PairPage";
import { SIGNS, signBySlug } from "@/lib/western";
import { WESTERN_RELATION_NAME, pairSlug, parsePairSlug, westernScore } from "@/lib/compatibility";
import { westernCopy } from "@/lib/compat-copy";
import { pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ pair: string }> };
export function generateStaticParams() {
  const out: Array<{ pair: string }> = [];
  for (const a of SIGNS) for (const b of SIGNS) if (a.slug <= b.slug) out.push({ pair: pairSlug(a.slug, b.slug) });
  return out;
}

function resolve(slug: string) {
  const p = parsePairSlug(slug);
  const a = p && signBySlug(p[0]), b = p && signBySlug(p[1]);
  return a && b ? { a, b, canonical: pairSlug(a.slug, b.slug) } : null;
}

export async function generateMetadata({ params }: Params) {
  const r = resolve((await params).pair);
  if (!r) return {};
  const s = westernScore(r.a, r.b);
  return pageMetadata({ title: `${r.a.name} and ${r.b.name} compatibility`, description: `${r.a.name} and ${r.b.name}: ${WESTERN_RELATION_NAME[s.relation].toLowerCase()}, ${s.score}% match. How these signs connect in love, friendship and work.`, path: `/compatibility/${r.canonical}`, type: "article" });
}

export default async function WesternPair({ params }: Params) {
  const slug = (await params).pair;
  const r = resolve(slug);
  if (!r) notFound();
  if (slug !== r.canonical) permanentRedirect(`/compatibility/${r.canonical}`);
  const [a, b] = [r.a, r.b].sort((x, y) => x.slug.localeCompare(y.slug));
  const s = westernScore(a, b);
  const others = SIGNS.filter((x) => x.element === a.element && x.slug !== a.slug && x.slug !== b.slug).slice(0, 2);
  return (
    <PairPage a={a} b={b} set="western" base="/compatibility/" crumb="Compatibility" noun="sign"
      title={`${a.name} and ${b.name} compatibility`} description={`${a.name} and ${b.name}: ${s.score}% match.`}
      relationName={WESTERN_RELATION_NAME[s.relation]} score={s} copy={westernCopy(a, b, s.relation)} options={SIGNS}
      giftTitle="Zodiac gifts" giftText="Small, well-made gifts for the signs in your life."
      related={[
        ...others.map((o) => ({ href: `/compatibility/${pairSlug(a.slug, o.slug)}`, label: `${a.name} and ${o.name}` })),
        { href: `/horoscope/${a.slug}`, label: `${a.name} horoscope today` },
        { href: `/horoscope/${b.slug}`, label: `${b.name} horoscope today` },
        { href: `/zodiac/${a.slug}`, label: `${a.name} profile` },
      ]} />
  );
}
