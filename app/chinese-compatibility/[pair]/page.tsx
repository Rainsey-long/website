import { notFound, permanentRedirect } from "next/navigation";
import PairPage from "@/components/PairPage";
import { ANIMALS, animalBySlug, elementRelation } from "@/lib/chinese";
import { chineseScore, pairSlug, parsePairSlug, relationName } from "@/lib/compatibility";
import { chineseCopy } from "@/lib/compat-copy";
import { pageMetadata } from "@/lib/seo";
import { defineMessages, localePath, num } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { animalName } from "@/lib/names";

const T = defineMessages({
  en: {
    title: (a: string, b: string) => `${a} and ${b} Chinese zodiac compatibility`,
    description: (a: string, b: string, rel: string, n: number) => `${a} and ${b}: ${rel}, ${n}% match. How these animals connect in love, friendship and work.`,
    short: (a: string, b: string, n: number) => `${a} and ${b}: ${n}% match.`,
    crumb: "Chinese compatibility", noun: "animal", giftTitle: "Zodiac animal gifts", giftText: "Small, well-made gifts for the animals in your life.",
    pair: (a: string, b: string) => `${a} and ${b}`, in2027: (a: string) => `${a} in 2027`, profile: (a: string) => `${a} profile`,
  },
  km: {
    title: (a: string, b: string) => `ភាពត្រូវគ្នារវាងឆ្នាំ${a} និងឆ្នាំ${b} តាមរាសីចិន`,
    description: (a: string, b: string, rel: string, n: number) => `ឆ្នាំ${a} និងឆ្នាំ${b}៖ ${rel} ត្រូវគ្នា ${num(n, "km")}%។ របៀបដែលសត្វរាសីទាំងពីរនេះភ្ជាប់គ្នាក្នុងស្នេហា មិត្តភាព និងការងារ។`,
    short: (a: string, b: string, n: number) => `ឆ្នាំ${a} និងឆ្នាំ${b}៖ ត្រូវគ្នា ${num(n, "km")}%។`,
    crumb: "ភាពត្រូវគ្នាតាមរាសីចិន", noun: "សត្វរាសី", giftTitle: "កាដូតាមសត្វរាសី", giftText: "កាដូតូចៗ ដែលធ្វើយ៉ាងល្អ សម្រាប់មនុស្សជាទីស្រឡាញ់របស់អ្នក។",
    pair: (a: string, b: string) => `ឆ្នាំ${a} និងឆ្នាំ${b}`, in2027: (a: string) => `ឆ្នាំ${a} ក្នុងឆ្នាំ ២០២៧`, profile: (a: string) => `ប្រវត្តិរូបឆ្នាំ${a}`,
  },
});

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
  const lang = await getLang();
  const [a, b] = [animalName(r.a.slug, lang), animalName(r.b.slug, lang)];
  return pageMetadata({ lang, title: T[lang].title(a, b), description: T[lang].description(a, b, relationName(s.relation, lang), s.score), path: `/chinese-compatibility/${r.canonical}`, type: "article" });
}

export default async function ChinesePair({ params }: Params) {
  const slug = (await params).pair;
  const r = resolve(slug);
  if (!r) notFound();
  const lang = await getLang();
  const t = T[lang];
  if (slug !== r.canonical) permanentRedirect(localePath(`/chinese-compatibility/${r.canonical}`, lang));
  const [a, b] = [r.a, r.b].sort((x, y) => x.slug.localeCompare(y.slug));
  const s = chineseScore(a, b);
  const n = (x: { slug: string }) => animalName(x.slug, lang);
  const others = ANIMALS.filter((x) => x.slug !== a.slug && x.slug !== b.slug && chineseScore(a, x).relation === "three-harmonies").slice(0, 2);
  return (
    <PairPage a={{ slug: a.slug, name: n(a) }} b={{ slug: b.slug, name: n(b) }} set="animal" base="/chinese-compatibility/" crumb={t.crumb} noun={t.noun}
      title={t.title(n(a), n(b))} description={t.short(n(a), n(b), s.score)}
      relationName={relationName(s.relation, lang)} score={s} copy={chineseCopy(a, b, s.relation, elementRelation(a.branchElement, b.branchElement), lang)} options={ANIMALS.map((x) => ({ slug: x.slug, name: n(x) }))}
      giftTitle={t.giftTitle} giftText={t.giftText}
      related={[
        ...others.map((o) => ({ href: `/chinese-compatibility/${pairSlug(a.slug, o.slug)}`, label: t.pair(n(a), n(o)) })),
        { href: `/chinese-zodiac/${a.slug}/2027`, label: t.in2027(n(a)) },
        { href: `/chinese-zodiac/${b.slug}/2027`, label: t.in2027(n(b)) },
        { href: `/chinese-zodiac/${a.slug}`, label: t.profile(n(a)) },
      ]} />
  );
}
