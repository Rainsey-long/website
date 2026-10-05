/** Index of every pair for one system, grouped by first sign/animal. */
import Link from "@/components/client/LocaleLink";
import Glyph from "./Glyph";
import { pairSlug } from "@/lib/compatibility";
import { num } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

export default async function PairIndex<T extends { slug: string; name: string }>({ items, set, base, score, label }: {
  items: T[]; set: "western" | "animal"; base: string; score: (a: T, b: T) => number; label?: (a: T, b: T) => string;
}) {
  const lang = await getLang();
  return (
    <div className="mt-7 grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s) => (
        <section key={s.slug} aria-labelledby={`c-${s.slug}`}>
          <h2 id={`c-${s.slug}`} className="flex items-center gap-2 text-h3"><Glyph name={s.slug} set={set} className="size-5" />{s.name}</h2>
          <ul className="mt-2">
            {items.map((o) => (
              <li key={o.slug} className="flex justify-between gap-3 border-b border-rule py-1">
                <Link className="link inline-flex min-h-tap items-center" href={`${base}${pairSlug(s.slug, o.slug)}`}>{`${s.name} and ${o.name}`}</Link>
                <span className="self-center text-small text-muted">{label && <span className="sr-only">{label(s, o)}, </span>}<span className="tabular">{num(score(s, o), lang)}</span></span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
