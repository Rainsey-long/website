/**
 * ChipGrid — SignPicker / AnimalPicker (§6.2): 12 chips, 4×3 mobile, 6×2 desktop,
 * tap targets ≥ 48px. The remembered sign gets the cinnabar ring (client island).
 */
import Link from "@/components/client/LocaleLink";
import Glyph from "./Glyph";
import { RememberedChipStyle } from "./client/Remembered";
import { getLang } from "@/lib/langServer";

export default async function ChipGrid({ items, set, heading, headingId = `chips-${set}`, remember = false, selected }: {
  items: Array<{ slug: string; name: string; sub: string; href: string }>;
  set: "western" | "animal";
  heading?: string;
  headingId?: string;
  remember?: boolean;
  selected?: string;
}) {
  const lang = await getLang();
  return (
    <section aria-labelledby={heading ? headingId : undefined}>
      {heading && <h2 id={headingId} className="text-h2">{heading}</h2>}
      {remember && <RememberedChipStyle />}
      <ul className="mt-5 grid grid-cols-4 gap-2 md:grid-cols-6 md:gap-3" data-remember={remember ? "" : undefined}>
        {items.map((it) => (
          <li key={it.slug}>
            <Link href={it.href} className={`chip${selected === it.slug ? " is-selected" : ""}`} data-slug={it.slug} aria-current={selected === it.slug ? "page" : undefined}>
              <Glyph name={it.slug} set={set} className="size-glyph-lg" />
              <span className="chip-name text-small font-semibold" lang={lang === "km" ? "km" : undefined}>{it.name}</span>
              <span className="chip-sub text-small tabular text-muted">{it.sub}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
