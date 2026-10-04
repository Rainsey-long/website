"use client";
/**
 * "Find my sign" (§6.7, wireframe §7.3). Everything runs in the browser;
 * nothing is stored or sent (plan §2.3). Sections follow the visitor's
 * chosen traditions.
 */
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { calculate, type CalculatorResult, type City } from "@/lib/calculator";
import { ELEMENT_NAME } from "@/lib/chinese";
import type { Tradition } from "@/lib/traditions";
import { localToday } from "@/lib/client";

export default function Calculator({ cities, traditions }: { cities: City[]; traditions: Tradition[] }) {
  const id = useId();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [unknown, setUnknown] = useState(false);
  const [cityText, setCityText] = useState("");
  const [sunrise, setSunrise] = useState(false);
  const [errors, setErrors] = useState<{ date?: string; city?: string }>({});
  const [r, setR] = useState<CalculatorResult | null>(null);
  const results = useRef<HTMLElement>(null);
  const show = (t: Tradition) => traditions.includes(t);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < "1900-01-01" || date > localToday()) next.date = "Enter a date between 1900 and today.";
    let city: City | null = null;
    if (cityText.trim()) {
      const t = cityText.trim().toLowerCase();
      city = cities.find((c) => `${c.name}, ${c.country}`.toLowerCase() === t || c.name.toLowerCase() === t) ?? null;
      if (!city) next.city = "Pick a city from the list, or leave this empty.";
    }
    setErrors(next);
    if (next.date || next.city) {
      document.getElementById(next.date ? `${id}-date` : `${id}-city`)?.focus();
      return;
    }
    setR(calculate({ date, time: !unknown && time ? time : null, city, fallbackTz: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", weekdayFromSunrise: sunrise }));
    requestAnimationFrame(() => {
      results.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      results.current?.focus({ preventScroll: true });
    });
  }

  return (
    <>
      <form className="mt-6 flex flex-col gap-5" noValidate onSubmit={submit}>
        <div>
          <label className="label" htmlFor={`${id}-date`}>Birth date</label>
          <input className="field tabular" type="date" id={`${id}-date`} required min="1900-01-01" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={!!errors.date} aria-describedby={`${id}-date-err`} />
          {errors.date && <p id={`${id}-date-err`} className="mt-2 text-small font-semibold text-cinnabar">{errors.date}</p>}
        </div>
        <div>
          <label className="label" htmlFor={`${id}-time`}>Birth time <span className="font-normal text-muted">(optional)</span></label>
          <input className="field tabular" type="time" id={`${id}-time`} value={time} disabled={unknown} onChange={(e) => setTime(e.target.value)} />
          <label className="mt-3 inline-flex min-h-tap items-center gap-3">
            <input type="checkbox" className="size-5" checked={unknown} onChange={(e) => { setUnknown(e.target.checked); if (e.target.checked) setTime(""); }} />
            <span>I don&apos;t know my birth time</span>
          </label>
        </div>
        <div>
          <label className="label" htmlFor={`${id}-city`}>Birth city <span className="font-normal text-muted">(optional)</span></label>
          <input className="field" id={`${id}-city`} list={`${id}-cities`} autoComplete="off" value={cityText} onChange={(e) => setCityText(e.target.value)} aria-invalid={!!errors.city} aria-describedby={`${id}-city-hint`} />
          <datalist id={`${id}-cities`}>{cities.map((c) => <option key={c.name + c.country} value={`${c.name}, ${c.country}`} />)}</datalist>
          <p id={`${id}-city-hint`} className="mt-2 text-small text-muted">Start typing and pick from the list. Choose the nearest large city if yours is missing.</p>
          {errors.city && <p className="mt-2 text-small font-semibold text-cinnabar">{errors.city}</p>}
        </div>
        {show("khmer") && (
          <label className="inline-flex min-h-tap items-center gap-3">
            <input type="checkbox" className="size-5" checked={sunrise} onChange={(e) => setSunrise(e.target.checked)} />
            <span>Count the Khmer birth day from sunrise <span className="text-muted">(a birth before 6 am belongs to the day before)</span></span>
          </label>
        )}
        <div><button type="submit" className="btn-primary">Show my signs</button></div>
      </form>

      {r && (
        <section ref={results} tabIndex={-1} className="mt-8 scroll-mt-5" aria-labelledby={`${id}-res`}>
          <h2 id={`${id}-res`} className="text-h2">Your signs</h2>
          {show("western") && (
            <>
              {r.sunCusp && <p className="mt-4 border border-rule p-4">You were born on the cusp of {r.sun.name} and {r.sunCusp.name}. {r.assumedNoon ? "Check with your birth time." : `At your birth time the Sun was in ${r.sun.name}.`}</p>}
              <h3 className="mt-6 text-h3">Western zodiac</h3>
              <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                <Cell label="Sun sign" value={r.sun.name} note={<Link className="link" href={`/horoscope/${r.sun.slug}`}>Today&apos;s reading</Link>} />
                <Cell label="Moon sign" value={r.moon.name} note={r.moonUncertain ? "The Moon changed sign that day. Add your birth time to be sure." : r.assumedNoon ? "Worked out for midday." : ""} />
                <Cell label="Rising sign" value={r.rising ? r.rising.name : "Not known"} note={r.rising ? "" : "Needs your birth time and city."} />
              </dl>
            </>
          )}
          {show("chinese") && (
            <>
              <h3 className="mt-7 text-h3">Chinese zodiac</h3>
              <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                <Cell label="Animal" value={r.chinese.animal.name} note={<Link className="link" href={`/chinese-zodiac/${r.chinese.animal.slug}`}>Profile</Link>} />
                <Cell label="Element" value={ELEMENT_NAME[r.chinese.element]} />
                <Cell label="Yin or yang" value={r.chinese.yinYang === "yang" ? "Yang" : "Yin"} />
              </dl>
              <p className="mt-3 text-small text-muted">Zodiac year {r.chinese.year}, counted from Lunar New Year. Your BaZi year pillar, which turns at the start of spring (about 4 February), is {r.bazi.pillar} ({r.bazi.label}).</p>
              <p className="mt-3">Lucky colours: {r.luckyColors.join(", ")}. Lucky numbers <span className="tabular">{r.luckyNumbers.join(", ")}</span>, by tradition.</p>
            </>
          )}
          {show("khmer") && (
            <>
              <h3 className="mt-7 text-h3">Khmer tradition</h3>
              <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                <Cell label="Animal year" value={r.traditions[1].animal.name} note={r.traditions[1].animalName.replace(`${r.traditions[1].animal.name} `, "")} />
                <Cell label="Birth day" value={<span><span lang="km">{r.khmer.weekday.km}</span> · {r.khmer.weekday.en}</span>} note={<Link className="link" href={`/khmer/born-on/${r.khmer.weekday.en.toLowerCase()}`}>Your birth-day profile</Link>} />
                <Cell label="Day colour" value={<span className="inline-flex items-center gap-2"><span className="swatch" style={{ background: `var(--${r.khmer.weekday.swatch})` }} aria-hidden="true" />{r.khmer.weekday.colourEn}</span>} note={`Planet: ${r.khmer.weekday.planetEn}`} />
              </dl>
              <p lang="km" className="mt-4 serif text-h3">{r.khmer.lunar.labelKm}</p>
              <p className="mt-1 text-small text-muted">Born on the {r.khmer.lunar.labelEn}, Buddhist Era {r.khmer.lunar.beYear}{r.khmer.weekdayShifted ? ". Counted from sunrise, so your birth day is the day before the calendar date." : "."}</p>
              <p className="mt-3">Your day&apos;s New Year angel is <span lang="km">{r.khmer.weekday.angel.km}</span> ({r.khmer.weekday.angel.roman}).</p>
            </>
          )}
          {(show("chinese") || show("khmer")) && (
            <>
              <h3 className="mt-7 text-h3">Your animal in three traditions</h3>
              <ul className="mt-3">{r.traditions.map((t) => <li key={t.tradition} className="border-b border-rule py-2">{t.label}: {t.animalName}</li>)}</ul>
              <p className="mt-3 text-small text-muted">{r.traditionsDiffer ? "Your animal differs between traditions. In Cambodia the animal year changes at the Khmer New Year moment in mid-April, not at Lunar New Year." : "All three traditions agree on your animal."}</p>
            </>
          )}
          <nav aria-label="Next steps" className="mt-7 border-t border-rule pt-5">
            <h3 className="text-h3">Read next</h3>
            <ul className="mt-2">
              {show("western") && <li className="border-b border-rule py-2"><Link className="link" href={`/horoscope/${r.sun.slug}`}>{r.sun.name} horoscope today</Link></li>}
              {show("western") && <li className="border-b border-rule py-2"><Link className="link" href={`/zodiac/${r.sun.slug}`}>{r.sun.name} profile</Link></li>}
              {(show("chinese") || show("khmer")) && <li className="border-b border-rule py-2"><Link className="link" href={`/chinese-zodiac/${r.chinese.animal.slug}/2027`}>{r.chinese.animal.name} in 2027</Link></li>}
              {show("khmer") && <li className="border-b border-rule py-2"><Link className="link" href="/khmer/new-year">Khmer New Year and its angel</Link></li>}
            </ul>
          </nav>
        </section>
      )}
    </>
  );
}

function Cell({ label, value, note }: { label: string; value: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="border-t-2 border-ink pt-3">
      <dt className="text-small text-muted">{label}</dt>
      <dd className="mt-1 serif text-h2">{value}</dd>
      {note ? <dd className="text-small text-muted">{note}</dd> : null}
    </div>
  );
}
