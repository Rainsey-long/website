/** The seven birth weekdays as chips: Khmer name, English day, colour swatch. */
import Link from "@/components/client/LocaleLink";
import { WEEKDAYS } from "@/lib/khmer";
import { getLang } from "@/lib/langServer";
import { defineMessages } from "@/lib/i18n";

const T = defineMessages({
  en: { heading: "Born on which day?", intro: "In Khmer tradition the day of the week you were born on has its own planet, colour and New Year angel." },
  km: { heading: "អ្នកកើតថ្ងៃអ្វី?", intro: "តាមប្រពៃណីខ្មែរ ថ្ងៃដែលអ្នកកើតមានភព ពណ៌ និងទេវតាឆ្នាំថ្មីផ្ទាល់ខ្លួនរបស់វា។" },
});

export default async function WeekdayChips({ heading, headingId = "weekday-h" }: { heading?: string; headingId?: string }) {
  const lang = await getLang();
  const t = T[lang];
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="text-h2">{heading ?? t.heading}</h2>
      <p className="reading mt-3 text-muted">{t.intro}</p>
      <ul className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-7">
        {WEEKDAYS.map((w) => (
          <li key={w.index}>
            <Link href={`/khmer/born-on/${w.en.toLowerCase()}`} className="chip">
              <span className="swatch" style={{ background: `var(--${w.swatch})`, width: 24, height: 24 }} aria-hidden="true" />
              <span lang="km" className="chip-name serif text-body">{w.km}</span>
              {lang === "km" ? <span className="text-small text-muted">{w.colourKm}</span> : <span className="text-small text-muted">{w.en}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
