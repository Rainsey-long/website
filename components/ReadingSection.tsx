/**
 * ReadingSection (§6.3): sign + date header with prev/next, the four topics
 * in fixed order with EnergyMeters, hairline rules, then the LuckyRow.
 */
import Link from "@/components/client/LocaleLink";
import Glyph from "./Glyph";
import EnergyMeter from "./EnergyMeter";
import LuckyRow from "./LuckyRow";
import type { DailyReading } from "@/lib/reading-engine";
import { fullDate } from "@/lib/dates";
import { defineMessages } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { signName } from "@/lib/names";

const T = defineMessages({
  en: { day: "Day", prev: "Previous day", next: "Next day" },
});

export default async function ReadingSection({ reading, prevHref, nextHref, showHeader = true }: {
  reading: DailyReading; prevHref?: string | null; nextHref?: string | null; showHeader?: boolean;
}) {
  const lang = await getLang();
  const m = T[lang];
  return (
    <article data-date={reading.date}>
      {showHeader && (
        <header>
          <nav aria-label={m.day} className="flex justify-between text-small">
            {prevHref ? <Link className="link inline-flex min-h-tap items-center gap-1" href={prevHref} rel="prev"><Glyph name="chevron-left" set="ui" className="size-4" />{m.prev}</Link> : <span />}
            {nextHref ? <Link className="link inline-flex min-h-tap items-center gap-1" href={nextHref} rel="next">{m.next}<Glyph name="chevron-right" set="ui" className="size-4" /></Link> : <span />}
          </nav>
          <h1 className="mt-3 flex items-center gap-3 text-display">
            <Glyph name={reading.sign.slug} set="western" className="size-glyph-lg shrink-0" />
            <span>{signName(reading.sign.slug, lang)}</span>
          </h1>
          <p className="mt-2 text-small text-muted"><time dateTime={reading.date}>{fullDate(reading.date, lang)}</time></p>
        </header>
      )}
      <div className="mt-6">
        {reading.topics.map((t) => (
          <section key={t.topic} className="border-t border-rule py-5" aria-labelledby={`t-${t.topic}-${reading.date}`}>
            <div className="flex items-center justify-between gap-4">
              <h2 id={`t-${t.topic}-${reading.date}`} className="text-h3">{t.label}</h2>
              <EnergyMeter value={t.energy} lang={lang} />
            </div>
            <p className="reading mt-3">{t.text}</p>
          </section>
        ))}
      </div>
      <LuckyRow color={reading.lucky.color} number={reading.lucky.number} hour={reading.lucky.hour} seal={reading.lucky.seal} headingId={`lucky-${reading.date}`} />
    </article>
  );
}
