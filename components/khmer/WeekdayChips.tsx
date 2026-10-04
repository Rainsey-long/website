/** The seven birth weekdays as chips: Khmer name, English day, colour swatch. */
import Link from "next/link";
import { WEEKDAYS } from "@/lib/khmer";

export default function WeekdayChips({ heading = "Born on which day?", headingId = "weekday-h" }: { heading?: string; headingId?: string }) {
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="text-h2">{heading}</h2>
      <p className="reading mt-3 text-muted">In Khmer tradition the day of the week you were born on has its own planet, colour and New Year angel.</p>
      <ul className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-7">
        {WEEKDAYS.map((w) => (
          <li key={w.index}>
            <Link href={`/khmer/born-on/${w.en.toLowerCase()}`} className="chip">
              <span className="swatch" style={{ background: `var(--${w.swatch})`, width: 24, height: 24 }} aria-hidden="true" />
              <span lang="km" className="chip-name serif text-body">{w.km}</span>
              <span className="text-small text-muted">{w.en}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
