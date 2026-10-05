import { notFound, permanentRedirect } from "next/navigation";
import PairPage from "@/components/PairPage";
import { SIGNS, signBySlug } from "@/lib/western";
import { pairSlug, parsePairSlug, westernRelationName, westernScore } from "@/lib/compatibility";
import { westernCopy } from "@/lib/compat-copy";
import { pageMetadata } from "@/lib/seo";
import { defineMessages } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { signName } from "@/lib/names";

const T = defineMessages({
  en: {
    title: (a: string, b: string) => `${a} and ${b} compatibility`,
    description: (a: string, b: string, rel: string, n: number) => `${a} and ${b}: ${rel.toLowerCase()}, ${n}% match. How these signs connect in love, friendship and work.`,
    short: (a: string, b: string, n: number) => `${a} and ${b}: ${n}% match.`,
    crumb: "Compatibility", noun: "sign", giftTitle: "Zodiac gifts", giftText: "Small, well-made gifts for the signs in your life.",
    pair: (a: string, b: string) => `${a} and ${b}`, today: (s: string) => `${s} horoscope today`, profile: (s: string) => `${s} profile`,
  },
});

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
  const lang = await getLang();
  const [a, b] = [signName(r.a.slug, lang), signName(r.b.slug, lang)];
  return pageMetadata({ lang, title: T[lang].title(a, b), description: T[lang].description(a, b, westernRelationName(s.relation, lang), s.score), path: `/compatibility/${r.canonical}`, type: "article" });
}

export default async function WesternPair({ params }: Params) {
  const slug = (await params).pair;
  const r = resolve(slug);
  if (!r) notFound();
  const lang = await getLang();
  const t = T[lang];
  if (slug !== r.canonical) permanentRedirect(`/compatibility/${r.canonical}`);
  const [a, b] = [r.a, r.b].sort((x, y) => x.slug.localeCompare(y.slug));
  const s = westernScore(a, b);
  const n = (x: { slug: string }) => signName(x.slug, lang);
  const others = SIGNS.filter((x) => x.element === a.element && x.slug !== a.slug && x.slug !== b.slug).slice(0, 2);
  return (
    <PairPage a={{ slug: a.slug, name: n(a) }} b={{ slug: b.slug, name: n(b) }} set="western" base="/compatibility/" crumb={t.crumb} noun={t.noun}
      title={t.title(n(a), n(b))} description={t.short(n(a), n(b), s.score)}
      relationName={westernRelationName(s.relation, lang)} score={s} copy={westernCopy(a, b, s.relation, lang)} options={SIGNS.map((x) => ({ slug: x.slug, name: n(x) }))}
      giftTitle={t.giftTitle} giftText={t.giftText}
      related={[
        ...others.map((o) => ({ href: `/compatibility/${pairSlug(a.slug, o.slug)}`, label: t.pair(n(a), n(o)) })),
        { href: `/horoscope/${a.slug}`, label: t.today(n(a)) },
        { href: `/horoscope/${b.slug}`, label: t.today(n(b)) },
        { href: `/zodiac/${a.slug}`, label: t.profile(n(a)) },
      ]} />
  );
}
