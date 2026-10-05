/**
 * Today in the Khmer calendar: lunar date in Khmer script with romanised
 * English, BE year, animal year and sak, holy day and festival flags.
 */
import Link from "@/components/client/LocaleLink";
import type { KhmerDay } from "@/lib/khmer";
import { getLang } from "@/lib/langServer";
import { defineMessages } from "@/lib/i18n";

const T = defineMessages({
  en: { heading: "Today in the Khmer calendar", holy: "Holy day", month: "This month in the Khmer calendar", colour: (c: string) => `Colour of the day: ${c}`, colours: "The week's colours" },
});

export default async function KhmerDayCard({ day, heading, headingId = "khmer-today" }: { day: KhmerDay; heading?: string; headingId?: string }) {
  const lang = await getLang();
  const t = T[lang];
  return (
    <section aria-labelledby={headingId} className="border-y-2 border-ink py-5">
      <h2 id={headingId} className="text-h3">{heading ?? t.heading}</h2>
      <p lang="km" className="mt-3 serif text-h3">{day.labelKm}</p>
      <p className="mt-2 text-muted">
        {day.weekday.en}, the {day.labelEn}. Buddhist Era {day.beYear}, year of the {day.animal.en} ({day.animal.roman}), {day.sakRoman}.
      </p>
      {(day.sila || day.festival) && (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-small">
          {day.sila && <li className="inline-flex items-center gap-2"><span className="cal-sila" aria-hidden="true" /><span><span className="font-semibold">{t.holy}</span> <span lang="km">ថ្ងៃសីល</span></span></li>}
          {day.festival && <li className="font-semibold">{day.festival.en} <span lang="km" className="font-normal">{day.festival.km}</span></li>}
        </ul>
      )}
      <p className="mt-3 flex items-center gap-2">
        <span className="swatch" style={{ background: `var(--${day.weekday.swatch})` }} aria-hidden="true" />
        {t.colour(day.weekday.colourEn)}<span lang="km" className="text-muted"> {day.weekday.colourKm}</span>
      </p>
      <p className="mt-4 text-small"><Link className="link" href={`/lucky-days/${day.date.slice(0, 4)}/${day.date.slice(5, 7)}`}>{t.month}</Link> · <Link className="link" href="/khmer/colours">{t.colours}</Link></p>
    </section>
  );
}
