"use client";
/**
 * "Find my sign" (§6.7, wireframe §7.3). Everything runs in the browser;
 * nothing is stored or sent (plan §2.3). Sections follow the visitor's
 * chosen traditions.
 */
import Link from "@/components/client/LocaleLink";
import { useId, useRef, useState } from "react";
import { calculate, type CalculatorResult, type City } from "@/lib/calculator";
import type { Tradition } from "@/lib/traditions";
import { localToday } from "@/lib/client";
import { useLang } from "./LangProvider";
import PeoplePicker from "./PeoplePicker";
import { cityTextForSlug, slugForCityText } from "@/lib/people";
import { defineMessages, khmerDigits, num, type Lang } from "@/lib/i18n";
import { animalName, colourName, elementName, signName, yearOf } from "@/lib/names";
import { VIETNAMESE_NAMES, type TraditionResult } from "@/lib/sea-variants";
import type { WesternSign } from "@/lib/western";

const T = defineMessages({
  en: {
    dateErr: "Enter a date between 1900 and today.", cityErr: "Pick a city from the list, or leave this empty.",
    birthDate: "Birth date", birthTime: "Birth time", optional: "(optional)", noTime: "I don't know my birth time",
    birthCity: "Birth city", cityHint: "Start typing and pick from the list. Choose the nearest large city if yours is missing.",
    sunrise: "Count the Khmer birth day from sunrise", sunriseNote: "(a birth before 6 am belongs to the day before)",
    submit: "Show my signs", yourSigns: "Your signs",
    cusp: (a: string, b: string) => `You were born on the cusp of ${a} and ${b}.`, checkTime: "Check with your birth time.",
    atTime: (a: string) => `At your birth time the Sun was in ${a}.`,
    western: "Western zodiac", sunSign: "Sun sign", moonSign: "Moon sign", risingSign: "Rising sign", todayReading: "Today's reading",
    moonChanged: "The Moon changed sign that day. Add your birth time to be sure.", midday: "Worked out for midday.",
    notKnown: "Not known", needsTime: "Needs your birth time and city.",
    chinese: "Chinese zodiac", animal: "Animal", profile: "Profile", element: "Element", yinYang: "Yin or yang", yang: "Yang", yin: "Yin",
    bazi: (year: number, pillar: string, label: string) => `Zodiac year ${year}, counted from Lunar New Year. Your BaZi year pillar, which turns at the start of spring (about 4 February), is ${pillar} (${label}).`,
    lucky: (colours: string, numbers: string) => <>Lucky colours: {colours}. Lucky numbers <span className="tabular">{numbers}</span>, by tradition.</>,
    khmer: "Khmer tradition", animalYear: "Animal year", birthDay: "Birth day", birthProfile: "Your birth-day profile", dayColour: "Day colour",
    planet: (p: string) => `Planet: ${p}`,
    bornOn: (label: string, be: number, shifted: boolean) => `Born on the ${label}, Buddhist Era ${be}${shifted ? ". Counted from sunrise, so your birth day is the day before the calendar date." : "."}`,
    three: "Your animal in three traditions",
    differ: "Your animal differs between traditions. In Cambodia the animal year changes at the Khmer New Year moment in mid-April, not at Lunar New Year.",
    agree: "All three traditions agree on your animal.",
    nextSteps: "Next steps", readNext: "Read next", horoscopeToday: (s: string) => `${s} horoscope today`, signProfile: (s: string) => `${s} profile`,
    fullChart: "Your full birth chart", in2027: (a: string) => `${a} in 2027`, newYear: "Khmer New Year and its angel",
  },
  km: {
    dateErr: "សូមបញ្ចូលកាលបរិច្ឆេទចន្លោះឆ្នាំ ១៩០០ និងថ្ងៃនេះ។", cityErr: "សូមជ្រើសរើសទីក្រុងពីបញ្ជី ឬទុកចន្លោះនេះឱ្យទទេ។",
    birthDate: "ថ្ងៃខែឆ្នាំកំណើត", birthTime: "ម៉ោងកំណើត", optional: "(មិនចាំបាច់)", noTime: "ខ្ញុំមិនដឹងម៉ោងកំណើតរបស់ខ្ញុំទេ",
    birthCity: "ទីក្រុងកំណើត", cityHint: "ចាប់ផ្ដើមវាយ ហើយជ្រើសរើសពីបញ្ជី។ បើរកមិនឃើញទីក្រុងរបស់អ្នក សូមជ្រើសទីក្រុងធំដែលនៅជិតបំផុត។",
    sunrise: "រាប់ថ្ងៃកំណើតតាមប្រពៃណីខ្មែរ ចាប់ពីពេលថ្ងៃរះ", sunriseNote: "(កំណើតមុនម៉ោង ៦ ព្រឹក ជាកម្មសិទ្ធិរបស់ថ្ងៃមុន)",
    submit: "បង្ហាញរាសីរបស់ខ្ញុំ", yourSigns: "រាសីរបស់អ្នក",
    cusp: (a: string, b: string) => `អ្នកកើតនៅចន្លោះរាសី${a} និងរាសី${b}។`, checkTime: "សូមពិនិត្យជាមួយម៉ោងកំណើតរបស់អ្នក។",
    atTime: (a: string) => `នៅម៉ោងកំណើតរបស់អ្នក ព្រះអាទិត្យស្ថិតនៅរាសី${a}។`,
    western: "រាសីលោកខាងលិច", sunSign: "រាសីព្រះអាទិត្យ", moonSign: "រាសីព្រះចន្ទ", risingSign: "រាសីឡើង", todayReading: "ការអានថ្ងៃនេះ",
    moonChanged: "ព្រះចន្ទបានប្ដូររាសីនៅថ្ងៃនោះ។ សូមបន្ថែមម៉ោងកំណើត ដើម្បីឱ្យប្រាកដ។", midday: "គណនាសម្រាប់ពេលថ្ងៃត្រង់។",
    notKnown: "មិនទាន់ដឹង", needsTime: "ត្រូវការម៉ោង និងទីក្រុងកំណើតរបស់អ្នក។",
    chinese: "រាសីចិន", animal: "សត្វ", profile: "ប្រវត្តិរូប", element: "ធាតុ", yinYang: "យីន ឬយ៉ាំង", yang: "យ៉ាំង", yin: "យីន",
    bazi: (year: number, pillar: string, label: string) => `ឆ្នាំរាសី ${khmerDigits(year)} រាប់ចាប់ពីបុណ្យចូលឆ្នាំចិន។ សសរឆ្នាំ BaZi របស់អ្នក ដែលប្ដូរនៅដើមនិទាឃរដូវ (ប្រហែលថ្ងៃទី៤ ខែកុម្ភៈ) គឺ ${pillar} (${label})។`,
    lucky: (colours: string, numbers: string) => <>ពណ៌សំណាង៖ {colours}។ លេខសំណាង <span className="tabular">{numbers}</span> តាមប្រពៃណី។</>,
    khmer: "ប្រពៃណីខ្មែរ", animalYear: "ឆ្នាំសត្វ", birthDay: "ថ្ងៃកំណើត", birthProfile: "ប្រវត្តិរូបថ្ងៃកំណើតរបស់អ្នក", dayColour: "ពណ៌ប្រចាំថ្ងៃ",
    planet: (p: string) => `ភព៖ ${p}`,
    bornOn: (label: string, be: number, shifted: boolean) => `ព.ស. ${khmerDigits(be)}${shifted ? "។ រាប់ចាប់ពីថ្ងៃរះ ដូច្នេះថ្ងៃកំណើតរបស់អ្នកគឺថ្ងៃមុនកាលបរិច្ឆេទតាមប្រតិទិន។" : "។"}`,
    three: "សត្វរាសីរបស់អ្នកតាមប្រពៃណីទាំងបី",
    differ: "សត្វរាសីរបស់អ្នកខុសគ្នាតាមប្រពៃណី។ នៅកម្ពុជា ឆ្នាំសត្វប្ដូរនៅពេលចូលឆ្នាំខ្មែរ ពាក់កណ្ដាលខែមេសា មិនមែននៅបុណ្យចូលឆ្នាំចិនទេ។",
    agree: "ប្រពៃណីទាំងបីយល់ស្របគ្នាលើសត្វរាសីរបស់អ្នក។",
    nextSteps: "ជំហានបន្ទាប់", readNext: "អានបន្ត", horoscopeToday: (s: string) => `ហោរាសាស្ត្រថ្ងៃនេះ រាសី${s}`, signProfile: (s: string) => `ប្រវត្តិរូបរាសី${s}`,
    fullChart: "តារាងកំណើតពេញលេញរបស់អ្នក", in2027: (a: string) => `${a} ក្នុងឆ្នាំ ២០២៧`, newYear: "ចូលឆ្នាំខ្មែរ និងទេវតាឆ្នាំថ្មី",
  },
});

/* Vietnamese names keep their own words (Mão, Sửu…); only the animal is translated. */
const VIET_KM: Record<number, string> = { 1: "ក្របី", 3: "ឆ្មា" };
function traditionAnimal(t: TraditionResult, lang: Lang): string {
  if (lang === "en") return t.animalName;
  if (t.tradition === "vietnamese") {
    const local = /\((.+)\)/.exec(VIETNAMESE_NAMES[t.animal.index])?.[1] ?? "";
    return `${VIET_KM[t.animal.index] ?? animalName(t.animal.slug, "km")} (${local})`;
  }
  return animalName(t.animal.slug, "km");
}

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
  const lang = useLang();
  const m = T[lang];
  const sn = (s: WesternSign) => signName(s.slug, lang);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < "1900-01-01" || date > localToday()) next.date = m.dateErr;
    let city: City | null = null;
    if (cityText.trim()) {
      const t = cityText.trim().toLowerCase();
      city = cities.find((c) => `${c.name}, ${c.country}`.toLowerCase() === t || c.name.toLowerCase() === t) ?? null;
      if (!city) next.city = m.cityErr;
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
        <PeoplePicker current={{ date, time: unknown ? "" : time, city: slugForCityText(cities, cityText) }}
          onPick={(p) => { setDate(p.date); setTime(p.time ?? ""); setUnknown(false); setCityText(cityTextForSlug(cities, p.city)); }} />
        <div>
          <label className="label" htmlFor={`${id}-date`}>{m.birthDate}</label>
          <input className="field tabular" type="date" id={`${id}-date`} required min="1900-01-01" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={!!errors.date} aria-describedby={`${id}-date-err`} />
          {errors.date && <p id={`${id}-date-err`} className="mt-2 text-small font-semibold text-cinnabar">{errors.date}</p>}
        </div>
        <div>
          <label className="label" htmlFor={`${id}-time`}>{m.birthTime} <span className="font-normal text-muted">{m.optional}</span></label>
          <input className="field tabular" type="time" id={`${id}-time`} value={time} disabled={unknown} onChange={(e) => setTime(e.target.value)} />
          <label className="mt-3 inline-flex min-h-tap items-center gap-3">
            <input type="checkbox" className="size-5 shrink-0" checked={unknown} onChange={(e) => { setUnknown(e.target.checked); if (e.target.checked) setTime(""); }} />
            <span>{m.noTime}</span>
          </label>
        </div>
        <div>
          <label className="label" htmlFor={`${id}-city`}>{m.birthCity} <span className="font-normal text-muted">{m.optional}</span></label>
          <input className="field" id={`${id}-city`} list={`${id}-cities`} autoComplete="off" value={cityText} onChange={(e) => setCityText(e.target.value)} aria-invalid={!!errors.city} aria-describedby={`${id}-city-hint`} />
          <datalist id={`${id}-cities`}>{cities.map((c) => <option key={c.name + c.country} value={`${c.name}, ${c.country}`} />)}</datalist>
          <p id={`${id}-city-hint`} className="mt-2 text-small text-muted">{m.cityHint}</p>
          {errors.city && <p className="mt-2 text-small font-semibold text-cinnabar">{errors.city}</p>}
        </div>
        {show("khmer") && (
          <label className="inline-flex min-h-tap items-center gap-3">
            <input type="checkbox" className="size-5 shrink-0" checked={sunrise} onChange={(e) => setSunrise(e.target.checked)} />
            <span>{m.sunrise} <span className="text-muted">{m.sunriseNote}</span></span>
          </label>
        )}
        <div><button type="submit" className="btn-primary">{m.submit}</button></div>
      </form>

      {r && (
        <section ref={results} tabIndex={-1} className="mt-8 scroll-mt-5" aria-labelledby={`${id}-res`}>
          <h2 id={`${id}-res`} className="text-h2">{m.yourSigns}</h2>
          {show("western") && (
            <>
              {r.sunCusp && <p className="mt-4 border border-rule p-4">{m.cusp(sn(r.sun), sn(r.sunCusp))} {r.assumedNoon ? m.checkTime : m.atTime(sn(r.sun))}</p>}
              <h3 className="mt-6 text-h3">{m.western}</h3>
              <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                <Cell label={m.sunSign} value={sn(r.sun)} note={<Link className="link" href={`/horoscope/${r.sun.slug}`}>{m.todayReading}</Link>} />
                <Cell label={m.moonSign} value={sn(r.moon)} note={r.moonUncertain ? m.moonChanged : r.assumedNoon ? m.midday : ""} />
                <Cell label={m.risingSign} value={r.rising ? sn(r.rising) : m.notKnown} note={r.rising ? "" : m.needsTime} />
              </dl>
            </>
          )}
          {show("chinese") && (
            <>
              <h3 className="mt-7 text-h3">{m.chinese}</h3>
              <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                <Cell label={m.animal} value={animalName(r.chinese.animal.slug, lang)} note={<Link className="link" href={`/chinese-zodiac/${r.chinese.animal.slug}`}>{m.profile}</Link>} />
                <Cell label={m.element} value={elementName(r.chinese.element, lang)} />
                <Cell label={m.yinYang} value={r.chinese.yinYang === "yang" ? m.yang : m.yin} />
              </dl>
              <p className="mt-3 text-small text-muted">{m.bazi(r.chinese.year, r.bazi.pillar, lang === "km" ? `${yearOf(r.bazi.animal, "km")} ធាតុ${elementName(r.bazi.element, "km")}` : r.bazi.label)}</p>
              <p className="mt-3">{m.lucky(r.luckyColors.map((c) => colourName(c, lang)).join(lang === "km" ? " " : ", "), num(r.luckyNumbers.join(", "), lang))}</p>
            </>
          )}
          {show("khmer") && (
            <>
              <h3 className="mt-7 text-h3">{m.khmer}</h3>
              <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                <Cell label={m.animalYear} value={lang === "km" ? yearOf(r.traditions[1].animal.slug, "km") : r.traditions[1].animal.name} note={lang === "km" ? "" : r.traditions[1].animalName.replace(`${r.traditions[1].animal.name} `, "")} />
                <Cell label={m.birthDay} value={lang === "km" ? r.khmer.weekday.km : <span><span lang="km">{r.khmer.weekday.km}</span> · {r.khmer.weekday.en}</span>} note={<Link className="link" href={`/khmer/born-on/${r.khmer.weekday.en.toLowerCase()}`}>{m.birthProfile}</Link>} />
                <Cell label={m.dayColour} value={<span className="inline-flex items-center gap-2"><span className="swatch" style={{ background: `var(--${r.khmer.weekday.swatch})` }} aria-hidden="true" />{lang === "km" ? r.khmer.weekday.colourKm : r.khmer.weekday.colourEn}</span>} note={m.planet(lang === "km" ? r.khmer.weekday.planetKm : r.khmer.weekday.planetEn)} />
              </dl>
              <p lang="km" className="mt-4 serif text-h3">{r.khmer.lunar.labelKm}</p>
              <p className="mt-1 text-small text-muted">{m.bornOn(r.khmer.lunar.labelEn, r.khmer.lunar.beYear, r.khmer.weekdayShifted)}</p>
              {lang === "km"
                ? <p className="mt-3">ទេវតាឆ្នាំថ្មីនៃថ្ងៃកំណើតរបស់អ្នក គឺ{r.khmer.weekday.angel.km}។</p>
                : <p className="mt-3">Your day&apos;s New Year angel is <span lang="km">{r.khmer.weekday.angel.km}</span> ({r.khmer.weekday.angel.roman}).</p>}
            </>
          )}
          {(show("chinese") || show("khmer")) && (
            <>
              <h3 className="mt-7 text-h3">{m.three}</h3>
              <ul className="mt-3">{r.traditions.map((t) => <li key={t.tradition} className="border-b border-rule py-2">{lang === "km" ? `${t.labelKm}៖ ${traditionAnimal(t, lang)}` : `${t.label}: ${t.animalName}`}</li>)}</ul>
              <p className="mt-3 text-small text-muted">{r.traditionsDiffer ? m.differ : m.agree}</p>
            </>
          )}
          <nav aria-label={m.nextSteps} className="mt-7 border-t border-rule pt-5">
            <h3 className="text-h3">{m.readNext}</h3>
            <ul className="mt-2">
              {show("western") && <li className="border-b border-rule py-2"><Link className="link" href={`/horoscope/${r.sun.slug}`}>{m.horoscopeToday(sn(r.sun))}</Link></li>}
              {show("western") && <li className="border-b border-rule py-2"><Link className="link" href={`/zodiac/${r.sun.slug}`}>{m.signProfile(sn(r.sun))}</Link></li>}
              {show("western") && <li className="border-b border-rule py-2"><Link className="link" href="/tools/birth-chart">{m.fullChart}</Link></li>}
              {(show("chinese") || show("khmer")) && <li className="border-b border-rule py-2"><Link className="link" href={`/chinese-zodiac/${r.chinese.animal.slug}/2027`}>{m.in2027(lang === "km" ? yearOf(r.chinese.animal.slug, "km") : r.chinese.animal.name)}</Link></li>}
              {show("khmer") && <li className="border-b border-rule py-2"><Link className="link" href="/khmer/new-year">{m.newYear}</Link></li>}
            </ul>
          </nav>
        </section>
      )}
    </>
  );
}

function Cell({ label, value, note }: { label: string; value: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="border-t border-rule pt-3">
      <dt className="text-small text-muted">{label}</dt>
      <dd className="mt-1 serif text-h2">{value}</dd>
      {note ? <dd className="text-small text-muted">{note}</dd> : null}
    </div>
  );
}
