"use client";
/**
 * Age and birth year (docs/research/FEATURES.md §7, #50; DESIGN_SYSTEM.md
 * §6.18). Everything is worked out in the browser from lib/age.ts: the birth
 * date is never sent anywhere (CLAUDE.md owner rule), so this is a client
 * form and not part of the GET converter beside it.
 */
import Link from "@/components/client/LocaleLink";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { ageFacts, type AgeResult } from "@/lib/age";
import { localToday } from "@/lib/client";
import { fullDate } from "@/lib/dates";
import { defineMessages, khmerDigits } from "@/lib/i18n";
import { animalName, elementName } from "@/lib/names";
import { useLang } from "./LangProvider";

const T = defineMessages({
  en: {
    heading: "Your age and birth year",
    intro: "Worked out on your device. Your birth date is not sent anywhere.",
    birth: "Birth date", submit: "Show my age", dateErr: "Enter a date between 1900 and today.",
    age: "Age", years: (n: number) => `${n} ${n === 1 ? "year" : "years"}`,
    birthday: (n: number) => (n === 0 ? "Happy birthday: it is today." : `Next birthday in ${n} ${n === 1 ? "day" : "days"}.`),
    nominal: "Chinese nominal age", nominalNote: "Counted the traditional Chinese way: one at birth, and one more at every Lunar New Year.",
    chinese: "Chinese zodiac year", chineseValue: (el: string, an: string, y: number) => `${el} ${an} (${y})`,
    khmer: "Khmer calendar", khmerValue: (be: number, an: string, sak: string) => `Buddhist Era ${be}, year of the ${an}, ${sak}`,
    lunar: "Khmer lunar birth date", weekday: "Born on", weekdayValue: (day: string, colour: string) => `${day}, day colour ${colour.toLowerCase()}`,
    profile: (day: string) => `Your ${day} profile`,
    animalNote: "The Khmer animal year turns at the exact Khmer New Year moment in mid-April. For a birth on those days, add your birth time in the zodiac calculator.",
    calculator: "Open the zodiac calculator",
  },
  km: {
    heading: "អាយុ និងឆ្នាំកំណើតរបស់អ្នក",
    intro: "គណនានៅលើឧបករណ៍របស់អ្នក។ ថ្ងៃកំណើតរបស់អ្នកមិនត្រូវបានផ្ញើទៅកន្លែងណាទេ។",
    birth: "ថ្ងៃខែឆ្នាំកំណើត", submit: "បង្ហាញអាយុរបស់ខ្ញុំ", dateErr: "សូមបញ្ចូលកាលបរិច្ឆេទចន្លោះឆ្នាំ ១៩០០ និងថ្ងៃនេះ។",
    age: "អាយុ", years: (n: number) => `${khmerDigits(n)} ឆ្នាំ`,
    birthday: (n: number) => (n === 0 ? "រីករាយថ្ងៃកំណើត៖ គឺថ្ងៃនេះ។" : `ថ្ងៃកំណើតបន្ទាប់ក្នុងរយៈពេល ${khmerDigits(n)} ថ្ងៃទៀត។`),
    nominal: "អាយុតាមរបៀបចិន", nominalNote: "រាប់តាមរបៀបចិនបុរាណ៖ មួយឆ្នាំនៅពេលកើត ហើយបន្ថែមមួយឆ្នាំទៀតរាល់បុណ្យចូលឆ្នាំចិន។",
    chinese: "ឆ្នាំរាសីចិន", chineseValue: (el: string, an: string, y: number) => `ឆ្នាំ${an} ធាតុ${el} (${khmerDigits(y)})`,
    khmer: "ប្រតិទិនខ្មែរ", khmerValue: (be: number, an: string, sak: string) => `ព.ស. ${khmerDigits(be)} ឆ្នាំ${an} ${sak}`,
    lunar: "ថ្ងៃកំណើតតាមចន្ទគតិខ្មែរ", weekday: "កើតថ្ងៃ", weekdayValue: (day: string, colour: string) => `${day} ពណ៌ប្រចាំថ្ងៃ${colour}`,
    profile: (day: string) => `ប្រវត្តិរូបអ្នកកើតថ្ងៃ${day}`,
    animalNote: "ឆ្នាំសត្វខ្មែរប្ដូរនៅពេលចូលឆ្នាំខ្មែរពិតប្រាកដ ពាក់កណ្ដាលខែមេសា។ បើអ្នកកើតនៅថ្ងៃទាំងនោះ សូមបញ្ចូលម៉ោងកំណើតក្នុងកម្មវិធីគណនារាសី។",
    calculator: "បើកកម្មវិធីគណនារាសី",
  },
});

export default function AgeTool() {
  const lang = useLang();
  const t = T[lang];
  const km = lang === "km";
  const id = useId();
  const [date, setDate] = useState("");
  const [error, setError] = useState(false);
  const [r, setR] = useState<{ birth: string; facts: AgeResult } | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const today = localToday();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < "1900-01-01" || date > today) {
      setError(true);
      setR(null);
      return;
    }
    setError(false);
    setR({ birth: date, facts: ageFacts(date, today) });
  }

  const f = r?.facts;
  return (
    <section aria-labelledby={`${id}-h`} className="border-t border-rule pt-7">
      <h2 id={`${id}-h`} className="text-h2">{t.heading}</h2>
      <p className="mt-2 text-muted">{t.intro}</p>
      <form className="mt-5 flex flex-col gap-5" noValidate onSubmit={submit}>
        <div>
          <label className="label" htmlFor={`${id}-d`}>{t.birth}</label>
          <input className="field tabular" type="date" id={`${id}-d`} min="1900-01-01" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={error} aria-describedby={error ? `${id}-err` : undefined} />
          {error && <p id={`${id}-err`} className="mt-2 text-small font-semibold text-cinnabar">{t.dateErr}</p>}
        </div>
        <div><button type="submit" className="btn-secondary">{t.submit}</button></div>
      </form>
      {r && f && (
        <div aria-live="polite" className="mt-6">
          <p className="text-small text-muted">{fullDate(r.birth, lang)}</p>
          <dl className="mt-3">
            <Row label={t.age}>
              <span className="tabular">{t.years(f.years)}</span>
              <span className="block text-small text-muted">{t.birthday(f.daysToBirthday)}</span>
            </Row>
            <Row label={t.nominal}>
              <span className="tabular">{t.years(f.chineseNominal)}</span>
              <span className="block text-small text-muted">{t.nominalNote}</span>
            </Row>
            <Row label={t.chinese}>
              <Link className="link" href={`/chinese-zodiac/${f.chinese.animal.slug}`}>{t.chineseValue(elementName(f.chinese.element, lang), animalName(f.chinese.animal.slug, lang), f.chinese.year)}</Link>
            </Row>
            <Row label={t.khmer}>
              {km ? t.khmerValue(f.khmer.beYear, f.khmer.animal.km, f.khmer.sakKm) : <>{t.khmerValue(f.khmer.beYear, `${f.khmer.animal.en} (${f.khmer.animal.roman})`, f.khmer.sakRoman)} <span lang="km" className="text-muted">ឆ្នាំ{f.khmer.animal.km} {f.khmer.sakKm}</span></>}
              <span className="block text-small text-muted">{t.animalNote}</span>
            </Row>
            <Row label={t.lunar}>
              {km ? f.khmer.labelKmShort : <>{f.khmer.labelEn} <span lang="km" className="text-muted">{f.khmer.labelKmShort}</span></>}
            </Row>
            <Row label={t.weekday}>
              <span className="inline-flex items-center gap-2">
                <span className="swatch" style={{ background: `var(--${f.weekday.swatch})` }} aria-hidden="true" />
                {km ? t.weekdayValue(f.weekday.km, f.weekday.colourKm) : t.weekdayValue(f.weekday.en, f.weekday.colourEn)}
              </span>
              <span className="block text-small">
                <Link className="link" href={`/khmer/born-on/${f.weekday.en.toLowerCase()}`}>{t.profile(km ? f.weekday.km : f.weekday.en)}</Link>
              </span>
            </Row>
          </dl>
          <p className="mt-4 text-small"><Link className="link" href="/tools/zodiac-calculator">{t.calculator}</Link></p>
        </div>
      )}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-rule py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-5">
      <dt className="text-small font-semibold">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
