import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import ChipGrid from "@/components/ChipGrid";
import { signChips } from "@/lib/pages";
import { ELEMENT_LABEL, SIGNS } from "@/lib/western";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "The 12 zodiac signs", description: "Personality profiles for all 12 Western zodiac signs: strengths, challenges, love and work, grouped by element.", path: "/zodiac" });

export default function ZodiacIndex() {
  const byElement = (["fire", "earth", "air", "water"] as const).map((el) => ({ el, signs: SIGNS.filter((s) => s.element === el) }));
  return (
    <>
      <Breadcrumbs items={[{ name: "Zodiac signs", href: "/zodiac" }]} />
      <div className="mx-auto max-w-page safe-x py-6">
        <h1 className="text-h1">The 12 zodiac signs</h1>
        <p className="reading mt-3 text-muted">Your sun sign is where the Sun was on the day you were born. Pick a sign to read its profile.</p>
        <div className="mt-6"><ChipGrid items={signChips((s) => `/zodiac/${s}`)} set="western" remember /></div>
        <div className="mt-7 grid gap-6 border-t border-rule pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {byElement.map(({ el, signs }) => (
            <section key={el}>
              <h2 className="flex items-center gap-2 text-h3"><span className="swatch" style={{ background: `var(--el-${el})` }} aria-hidden="true" />{ELEMENT_LABEL[el]} signs</h2>
              <ul className="mt-2">{signs.map((s) => <li key={s.slug}><Link className="link inline-flex min-h-tap items-center" href={`/zodiac/${s.slug}`}>{s.name}</Link></li>)}</ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
