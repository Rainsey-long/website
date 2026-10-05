/**
 * Colour of the day (docs/research/FEATURES.md §7, #19). Each weekday's
 * auspicious colour (ពណ៌មង្គល) from the km.wikipedia table the research reads
 * as PRIMARY (docs/research/KHMER-TRADITIONS.md §3), with the variant colours
 * newer books give, because almanacs differ and the page says so.
 *
 * The Thai/Khmer Daksa "unlucky colour" lists are deliberately not shown: no
 * Khmer source was found for them (research §5).
 */
import Link from "@/components/client/LocaleLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import { WEEKDAYS } from "@/lib/khmer";
import { addDays, fromKey, fullDate } from "@/lib/dates";
import { today } from "@/lib/today";
import { pageMetadata } from "@/lib/seo";
import { getLang } from "@/lib/langServer";
import { defineMessages } from "@/lib/i18n";

export const dynamic = "force-dynamic";

/** Newer books' colours for three days (km.wikipedia, same article). Keyed by weekday index. */
const NEWER: Record<number, { en: string }> = {
  3: { en: "Sky blue" },
  5: { en: "White" },
  6: { en: "Blue" },
};

const T = defineMessages({
  en: {
    title: "Colour of the day: Khmer weekday colours",
    description: "Today's auspicious colour in Khmer tradition, the colours for the week ahead, and what each one stands for.",
    hub: "Khmer traditions", h1: "Colour of the day",
    intro: "In Khmer tradition each day of the week has its own auspicious colour, ពណ៌មង្គល, tied to the day's planet. Some people like to wear it, or a touch of it.",
    today: "Today", todayLine: (day: string, colour: string) => `${day}: ${colour}`,
    meaning: (planet: string, quality: string) => `The day of ${planet}. Its colour stands for ${quality}.`,
    angel: (name: string) => `It is also the robe colour of the day's New Year angel, ${name}.`,
    week: "The week ahead",
    variants: "Colours vary between almanacs",
    variantsBody: "These are the ancestral colours in the Khmer table. Newer books give a different colour for three days:",
    variantRow: (day: string, colour: string) => `${day}: ${colour}`,
    variantsEnd: "Use whichever your family or pagoda calendar uses. Either way it is a tradition to enjoy, not a rule.",
    born: "Your birth-day colour",
    bornBody: "Your birth weekday has a colour too, the same set of seven.",
    bornLink: "Find your birth-day colour and angel",
    calendar: "Today in the Khmer calendar",
  },
});

export async function generateMetadata() {
  const lang = await getLang();
  return pageMetadata({ lang, title: T[lang].title, description: T[lang].description, path: "/khmer/colours" });
}

export default async function Colours() {
  const lang = await getLang();
  const t = T[lang];
  const date = await today();
  const dow = (key: string) => WEEKDAYS[fromKey(key).getUTCDay()];
  const w = dow(date);
  const week = Array.from({ length: 7 }, (_, i) => addDays(date, i + 1));
  const name = (x: (typeof WEEKDAYS)[number]) => (x.colourEn);

  return (
    <>
      <Breadcrumbs items={[{ name: t.hub, href: "/khmer" }, { name: t.h1, href: "/khmer/colours" }]} />
      <div className="mx-auto max-w-reading safe-x py-5">
        <h1 className="text-h1">Colour of the day <span lang="km" className="text-muted">ពណ៌ប្រចាំថ្ងៃ</span></h1>
        <p className="reading mt-3 text-muted">In Khmer tradition each day of the week has its own auspicious colour, <span lang="km">ពណ៌មង្គល</span>, tied to the day&apos;s planet. Some people like to wear it, or a touch of it.</p>

        <section className="mt-6 border-y-2 border-ink py-5" aria-labelledby="today-h">
          <h2 id="today-h" className="text-h3">{t.today} <span className="text-small font-normal text-muted"><time dateTime={date}>{fullDate(date, lang)}</time></span></h2>
          <p className="mt-4 flex items-center gap-4">
            <span className="swatch" style={{ width: "var(--size-glyph-lg)", height: "var(--size-glyph-lg)", background: `var(--${w.swatch})` }} aria-hidden="true" />
            <span className="serif text-h2">{t.todayLine(w.en, name(w))}<span lang="km" className="text-h3 text-muted"> {w.colourKm}</span></span>
          </p>
          <p className="mt-3">{t.meaning(w.planetEn, w.quality)} It is also the robe colour of the day&apos;s New Year angel, <span lang="km">{w.angel.km}</span> ({w.angel.roman}).</p>
        </section>

        <section className="mt-7" aria-labelledby="week-h">
          <h2 id="week-h" className="text-h2">{t.week}</h2>
          <ul className="mt-3">
            {week.map((d) => {
              const x = dow(d);
              return (
                <li key={d} className="flex min-h-tap items-center gap-4 border-t border-rule py-3">
                  <span className="swatch" style={{ width: "var(--size-glyph)", height: "var(--size-glyph)", background: `var(--${x.swatch})` }} aria-hidden="true" />
                  <span className="grow"><time dateTime={d}>{fullDate(d, lang)}</time></span>
                  <span className="shrink-0 text-right font-semibold">{name(x)}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-7 border-t border-rule pt-7" aria-labelledby="var-h">
          <h2 id="var-h" className="text-h3">{t.variants}</h2>
          <div className="reading mt-3">
            <p>{t.variantsBody}</p>
            <ul className="my-3 list-disc pl-6">
              {Object.entries(NEWER).map(([i, c]) => {
                const x = WEEKDAYS[Number(i)];
                return <li key={i}>{t.variantRow(x.en, c.en)}{` (ancestral: ${x.colourEn.toLowerCase()})`}</li>;
              })}
            </ul>
            <p>{t.variantsEnd}</p>
          </div>
        </section>

        <section className="mt-7 border-t border-rule pt-7" aria-labelledby="born-h">
          <h2 id="born-h" className="text-h3">{t.born}</h2>
          <p className="mt-2">{t.bornBody}</p>
          <p className="mt-4"><Link className="link" href="/tools/zodiac-calculator">{t.bornLink}</Link> · <Link className="link" href="/khmer">{t.calendar}</Link></p>
        </section>
      </div>
    </>
  );
}
