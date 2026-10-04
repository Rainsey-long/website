/**
 * Today in the Khmer calendar: lunar date in Khmer script with romanised
 * English, BE year, animal year and sak, holy day and festival flags.
 */
import Link from "@/components/client/LocaleLink";
import type { KhmerDay } from "@/lib/khmer";

export default function KhmerDayCard({ day, heading = "Today in the Khmer calendar", headingId = "khmer-today" }: { day: KhmerDay; heading?: string; headingId?: string }) {
  return (
    <section aria-labelledby={headingId} className="border-y-2 border-ink py-5">
      <h2 id={headingId} className="text-h3">{heading}</h2>
      <p lang="km" className="mt-3 serif text-h3">{day.labelKm}</p>
      <p className="mt-2 text-muted">
        {day.weekday.en}, the {day.labelEn}. Buddhist Era {day.beYear}, year of the {day.animal.en} ({day.animal.roman}), {day.sakRoman}.
      </p>
      {(day.sila || day.festival) && (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-small">
          {day.sila && <li className="inline-flex items-center gap-2"><span className="cal-sila" aria-hidden="true" /><span><span className="font-semibold">Holy day</span> <span lang="km">ថ្ងៃសីល</span></span></li>}
          {day.festival && <li className="font-semibold">{day.festival.en} <span lang="km" className="font-normal">{day.festival.km}</span></li>}
        </ul>
      )}
      <p className="mt-4 text-small"><Link className="link" href={`/lucky-days/${day.date.slice(0, 4)}/${day.date.slice(5, 7)}`}>This month in the Khmer calendar</Link></p>
    </section>
  );
}
