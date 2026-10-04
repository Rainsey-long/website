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

export default function ReadingSection({ reading, prevHref, nextHref, showHeader = true }: {
  reading: DailyReading; prevHref?: string | null; nextHref?: string | null; showHeader?: boolean;
}) {
  return (
    <article data-date={reading.date}>
      {showHeader && (
        <header>
          <nav aria-label="Day" className="flex justify-between text-small">
            {prevHref ? <Link className="link inline-flex min-h-tap items-center gap-1" href={prevHref} rel="prev"><Glyph name="chevron-left" set="ui" className="size-4" />Previous day</Link> : <span />}
            {nextHref ? <Link className="link inline-flex min-h-tap items-center gap-1" href={nextHref} rel="next">Next day<Glyph name="chevron-right" set="ui" className="size-4" /></Link> : <span />}
          </nav>
          <h1 className="mt-3 flex items-center gap-3 text-display">
            <Glyph name={reading.sign.slug} set="western" className="size-glyph-lg shrink-0" />
            <span>{reading.sign.name}</span>
          </h1>
          <p className="mt-2 text-small text-muted"><time dateTime={reading.date}>{fullDate(reading.date)}</time></p>
        </header>
      )}
      <div className="mt-6">
        {reading.topics.map((t) => (
          <section key={t.topic} className="border-t border-rule py-5" aria-labelledby={`t-${t.topic}-${reading.date}`}>
            <div className="flex items-center justify-between gap-4">
              <h2 id={`t-${t.topic}-${reading.date}`} className="text-h3">{t.label}</h2>
              <EnergyMeter value={t.energy} />
            </div>
            <p className="reading mt-3">{t.text}</p>
          </section>
        ))}
      </div>
      <LuckyRow color={reading.lucky.color} number={reading.lucky.number} hour={reading.lucky.hour} seal={reading.lucky.seal} headingId={`lucky-${reading.date}`} />
    </article>
  );
}
