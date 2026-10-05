"use client";
/**
 * Numerology form (docs/research/FEATURES.md #26). Worked out in the browser
 * from lib/numerology.ts: the birth date and name never join a URL, a form
 * submission or a request (CLAUDE.md owner rule). Layout follows the AgeTool
 * (DESIGN_SYSTEM.md §6.18): a client form, results as a definition list.
 */
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { localToday } from "@/lib/client";
import { defineMessages, khmerDigits, num } from "@/lib/i18n";
import { numerology, type NumerologyResult } from "@/lib/numerology";
import { CORE, CYCLE } from "@/lib/numerologyCopy";
import { useLang } from "./LangProvider";
import PeoplePicker from "./PeoplePicker";

const T = defineMessages({
  en: {
    birth: "Birth date", name: "Full name at birth", optional: "(optional)",
    nameHint: "Latin letters A to Z, as on a birth certificate. Leave it empty to skip the name number.",
    submit: "Show my numbers", dateErr: "Enter a date between 1900 and today.",
    results: "Your numbers",
    lifePath: "Life path", lifePathNote: "From your full birth date. The number most people mean by \"my number\".",
    birthday: "Birthday number", birthdayNote: "From the day of the month you were born.",
    expression: "Name number", expressionNote: "From the letters of your name (Pythagorean table).",
    noLatin: "Only Latin letters A to Z count for the name number, so it is left out.",
    year: (y: number) => `Personal year ${y}`, month: (m: string) => `Personal month: ${m}`,
    method: "Each part of the date is reduced to one digit and added; 11, 22 and 33 are kept as master numbers. For reflection and fun, not a forecast.",
  },
  km: {
    birth: "ថ្ងៃខែឆ្នាំកំណើត", name: "ឈ្មោះពេញនៅពេលកើត", optional: "(មិនចាំបាច់)",
    nameHint: "អក្សរឡាតាំង A ដល់ Z ដូចក្នុងសំបុត្រកំណើត។ ទុកឱ្យទទេ ដើម្បីរំលងលេខឈ្មោះ។",
    submit: "បង្ហាញលេខរបស់ខ្ញុំ", dateErr: "សូមបញ្ចូលកាលបរិច្ឆេទចន្លោះឆ្នាំ ១៩០០ និងថ្ងៃនេះ។",
    results: "លេខរបស់អ្នក",
    lifePath: "លេខផ្លូវជីវិត", lifePathNote: "គណនាពីថ្ងៃខែឆ្នាំកំណើតពេញ។ ជាលេខដែលមនុស្សភាគច្រើនហៅថា «លេខរបស់ខ្ញុំ»។",
    birthday: "លេខថ្ងៃកំណើត", birthdayNote: "គណនាពីថ្ងៃទីនៃខែដែលអ្នកកើត។",
    expression: "លេខឈ្មោះ", expressionNote: "គណនាពីអក្សរនៃឈ្មោះរបស់អ្នក (តារាងពីថាហ្គ័រ)។",
    noLatin: "មានតែអក្សរឡាតាំង A ដល់ Z ទេដែលរាប់សម្រាប់លេខឈ្មោះ ដូច្នេះលេខនេះត្រូវបានរំលង។",
    year: (y: number) => `ឆ្នាំផ្ទាល់ខ្លួន ${khmerDigits(y)}`, month: (m: string) => `ខែផ្ទាល់ខ្លួន៖ ខែ${m}`,
    method: "ផ្នែកនីមួយៗនៃកាលបរិច្ឆេទត្រូវបានបង្រួមមកនៅមួយខ្ទង់ រួចបូកបញ្ចូលគ្នា ដោយរក្សាលេខ ១១ ២២ និង ៣៣ ជាលេខមេ។ សម្រាប់ការពិចារណា និងការកម្សាន្ត មិនមែនជាការទស្សន៍ទាយទេ។",
  },
});

const MONTHS_KM = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Numerology() {
  const lang = useLang();
  const t = T[lang];
  const id = useId();
  const dateInput = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const [r, setR] = useState<{ res: NumerologyResult; year: number; month: number; hadName: boolean } | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const today = localToday();
    const res = date >= "1900-01-01" && date <= today ? numerology(date, today, name) : null;
    if (!res) {
      setError(true);
      setR(null);
      dateInput.current?.focus();
      return;
    }
    setError(false);
    setR({ res, year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)), hadName: name.trim() !== "" });
  }

  const n = (v: number) => num(v, lang);
  return (
    <>
      <form className="mt-6 flex flex-col gap-5" noValidate onSubmit={submit}>
        <PeoplePicker current={{ date }} onPick={(p) => setDate(p.date)} />
        <div>
          <label className="label" htmlFor={`${id}-d`}>{t.birth}</label>
          <input ref={dateInput} className="field tabular" type="date" id={`${id}-d`} min="1900-01-01" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={error} aria-describedby={error ? `${id}-err` : undefined} />
          {error && <p id={`${id}-err`} className="mt-2 text-small font-semibold text-cinnabar">{t.dateErr}</p>}
        </div>
        <div>
          <label className="label" htmlFor={`${id}-n`}>{t.name} <span className="font-normal text-muted">{t.optional}</span></label>
          <input className="field" id={`${id}-n`} autoComplete="off" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} aria-describedby={`${id}-nh`} />
          <p id={`${id}-nh`} className="mt-2 text-small text-muted">{t.nameHint}</p>
        </div>
        <div><button type="submit" className="btn-primary">{t.submit}</button></div>
      </form>
      {r && (
        <section aria-live="polite" aria-labelledby={`${id}-res`} className="mt-8">
          <h2 id={`${id}-res`} className="text-h2">{t.results}</h2>
          <dl className="mt-3">
            <Row label={t.lifePath} value={n(r.res.lifePath)} text={CORE[lang][r.res.lifePath]} note={t.lifePathNote} />
            <Row label={t.birthday} value={n(r.res.birthday)} text={CORE[lang][r.res.birthday]} note={t.birthdayNote} />
            {r.res.expression !== null
              ? <Row label={t.expression} value={n(r.res.expression)} text={CORE[lang][r.res.expression]} note={t.expressionNote} />
              : r.hadName && <Row label={t.expression} value="–" text={t.noLatin} />}
            <Row label={t.year(r.year)} value={n(r.res.personalYear)} text={CYCLE[lang][r.res.personalYear]} />
            <Row label={t.month((lang === "km" ? MONTHS_KM : MONTHS_EN)[r.month - 1])} value={n(r.res.personalMonth)} text={CYCLE[lang][r.res.personalMonth]} />
          </dl>
          <p className="mt-4 text-small text-muted">{t.method}</p>
        </section>
      )}
    </>
  );
}

function Row({ label, value, text, note }: { label: string; value: ReactNode; text: string; note?: string }) {
  return (
    <div className="grid gap-1 border-t border-rule py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-5">
      <dt className="text-small font-semibold">{label}{note && <span className="mt-1 block font-normal text-muted">{note}</span>}</dt>
      <dd className="flex items-baseline gap-4">
        <span className="serif text-h1 tabular" aria-hidden={value === "–" ? true : undefined}>{value}</span>
        <span>{text}</span>
      </dd>
    </div>
  );
}
