"use client";
/**
 * Birth chart (docs/research/FEATURES.md #4). Computed in the browser from
 * lib/natal.ts; nothing is stored or sent (owner rule). Form follows §6.7;
 * the wheel is §6.16.
 */
import { useId, useRef, useState } from "react";
import { natalChart, type NatalChart } from "@/lib/natal";
import type { City } from "@/lib/zone";
import { SIGNS } from "@/lib/western";
import { houseLabel, natalCopy } from "@/lib/natalCopy";
import { useLang } from "./LangProvider";
import PeoplePicker from "./PeoplePicker";
import { cityTextForSlug, slugForCityText } from "@/lib/people";
import { defineMessages, khmerDigits } from "@/lib/i18n";
import { signName } from "@/lib/names";
import { localToday } from "@/lib/client";
import BirthChartWheel from "@/components/BirthChartWheel";
import Glyph from "@/components/Glyph";

const deg = (d: number) => {
  const whole = Math.floor(d);
  return `${whole}°${String(Math.floor((d - whole) * 60)).padStart(2, "0")}′`;
};
const signOf = (lon: number) => SIGNS[Math.floor(lon / 30) % 12];

const T = defineMessages({
  en: {
    dateErr: "Enter a date between 1900 and today.", cityErr: "Pick a city from the list, or leave this empty.",
    birthDate: "Birth date", birthTime: "Birth time", optional: "(optional)", noTime: "I don't know my birth time",
    birthCity: "Birth city", cityHint: "A time and city add your rising sign and houses. Choose the nearest large city if yours is missing.",
    submit: "Draw my chart", yourChart: "Your birth chart",
    risingLeft: "Your rising sign is on the left, on the horizontal line.",
    noTimeWheel: "Without a birth time the wheel starts at 0° Aries on the left and shows no houses.",
    sun: "Sun", moon: "Moon", rising: "Rising",
    moonChanged: "The Moon changed sign that day; add your birth time to be sure.", midday: "Worked out for midday.",
    notKnown: "Not known", mc: (s: string) => `Midheaven in ${s}`, needsTime: "Needs your birth time and city.",
    planets: "Planets", inSign: (b: string, s: string) => `${b} in ${s}`, retrograde: ", retrograde",
    same: (topic: string, house: boolean, first: string) => `${topic}. Same sign${house ? " and house" : ""} as your ${first}, so the same style, gift and growth apply.`,
    changed: " It changed sign that day, so a birth time would confirm it.",
    topicStyle: (topic: string, style: string) => `${topic}: ${style}.`,
    giftGrowth: (gift: string, growth: string) => `Gift: ${gift}. Growth: ${growth}.`, showsIn: (h: string) => ` Shows up in ${h}.`,
    aspects: "Aspects", aspectsNote: "Angles between planets, closest first.", meaning: (m: string) => `${m}.`,
    aspectLine: (a: string, k: string, b: string) => `${a} ${k} ${b}`, orb: (o: number) => ` · ${o}° from exact`,
    how: "How this chart was computed",
    p1: (timeKnown: boolean, utc: string) => `Planet positions come from the open-source astronomy-engine library: geocentric, tropical zodiac, for the moment you were born${timeKnown ? "" : " (midday, since no time was given)"}, in UTC ${utc}.`,
    p2: "Houses use the whole-sign system: your rising sign is the 1st house, the next sign the 2nd, and so on. It works at every latitude.",
    p3: "Aspects allow 8° for conjunctions and oppositions, 7° for trines and squares and 5° for sextiles, 2° more when the Sun or Moon is involved. Aspects between Uranus, Neptune and Pluto are left out because whole generations share them.",
    p4: "Your birth details were used only in this browser and were not sent anywhere.",
  },
  km: {
    dateErr: "សូមបញ្ចូលកាលបរិច្ឆេទចន្លោះឆ្នាំ ១៩០០ និងថ្ងៃនេះ។", cityErr: "សូមជ្រើសរើសទីក្រុងពីបញ្ជី ឬទុកចន្លោះនេះឱ្យទទេ។",
    birthDate: "ថ្ងៃខែឆ្នាំកំណើត", birthTime: "ម៉ោងកំណើត", optional: "(មិនចាំបាច់)", noTime: "ខ្ញុំមិនដឹងម៉ោងកំណើតរបស់ខ្ញុំទេ",
    birthCity: "ទីក្រុងកំណើត", cityHint: "ម៉ោង និងទីក្រុងកំណើត បន្ថែមរាសីឡើង និងផ្ទះរបស់អ្នក។ បើរកមិនឃើញទីក្រុងរបស់អ្នក សូមជ្រើសទីក្រុងធំដែលនៅជិតបំផុត។",
    submit: "គូរតារាងរបស់ខ្ញុំ", yourChart: "តារាងកំណើតរបស់អ្នក",
    risingLeft: "រាសីឡើងរបស់អ្នកនៅខាងឆ្វេង លើបន្ទាត់ផ្ដេក។",
    noTimeWheel: "បើគ្មានម៉ោងកំណើត កង់នេះចាប់ផ្ដើមពី ០° រាសីមេស នៅខាងឆ្វេង ហើយមិនបង្ហាញផ្ទះទេ។",
    sun: "ព្រះអាទិត្យ", moon: "ព្រះចន្ទ", rising: "រាសីឡើង",
    moonChanged: "ព្រះចន្ទបានប្ដូររាសីនៅថ្ងៃនោះ។ សូមបន្ថែមម៉ោងកំណើត ដើម្បីឱ្យប្រាកដ។", midday: "គណនាសម្រាប់ពេលថ្ងៃត្រង់។",
    notKnown: "មិនទាន់ដឹង", mc: (s: string) => `កំពូលមេឃនៅរាសី${s}`, needsTime: "ត្រូវការម៉ោង និងទីក្រុងកំណើតរបស់អ្នក។",
    planets: "ភព", inSign: (b: string, s: string) => `${b}នៅរាសី${s}`, retrograde: " ដើរថយក្រោយ",
    same: (topic: string, house: boolean, first: string) => `${topic}។ រាសី${house ? " និងផ្ទះ" : ""}ដូចគ្នានឹង${first}របស់អ្នក ដូច្នេះរចនាបថ អំណោយ និងការលូតលាស់ដូចគ្នា។`,
    changed: " វាបានប្ដូររាសីនៅថ្ងៃនោះ ដូច្នេះម៉ោងកំណើតនឹងបញ្ជាក់វា។",
    topicStyle: (topic: string, style: string) => `${topic}៖ ${style}។`,
    giftGrowth: (gift: string, growth: string) => `អំណោយ៖ ${gift}។ ការលូតលាស់៖ ${growth}។`, showsIn: (h: string) => ` បង្ហាញខ្លួនក្នុង${h}។`,
    aspects: "មុំរវាងភព", aspectsNote: "មុំរវាងភពនានា ពីជិតបំផុតមុន។", meaning: (m: string) => `${m}។`,
    aspectLine: (a: string, k: string, b: string) => `${a} ${k} ${b}`, orb: (o: number) => ` · ឃ្លាតពីមុំពិត ${khmerDigits(o)}°`,
    how: "របៀបដែលតារាងនេះត្រូវបានគណនា",
    p1: (timeKnown: boolean, utc: string) => `ទីតាំងភពមកពីបណ្ណាល័យកូដចំហ astronomy-engine៖ គិតពីផែនដី រាសីត្រូពិក សម្រាប់ពេលដែលអ្នកកើត${timeKnown ? "" : " (ថ្ងៃត្រង់ ព្រោះមិនបានផ្ដល់ម៉ោង)"} គឺ UTC ${khmerDigits(utc)}។`,
    p2: "ផ្ទះប្រើប្រព័ន្ធមួយរាសីមួយផ្ទះ៖ រាសីឡើងរបស់អ្នកជាផ្ទះទី១ រាសីបន្ទាប់ជាផ្ទះទី២ ហើយបន្តបែបនេះ។ វាប្រើបាននៅគ្រប់រយៈទទឹង។",
    p3: "មុំរវាងភពអនុញ្ញាត ៨° សម្រាប់ការរួមគ្នា និងការទល់មុខគ្នា ៧° សម្រាប់មុំ ១២០ ដឺក្រេ និងមុំកែង និង ៥° សម្រាប់មុំ ៦០ ដឺក្រេ ហើយបន្ថែម ២° ពេលមានព្រះអាទិត្យ ឬព្រះចន្ទពាក់ព័ន្ធ។ មុំរវាងអ៊ុយរ៉ានុស ណិបទូន និងភ្លុយតូ មិនត្រូវបានរាប់ទេ ព្រោះមនុស្សមួយជំនាន់ទាំងមូលមានដូចគ្នា។",
    p4: "ព័ត៌មានកំណើតរបស់អ្នកត្រូវបានប្រើតែក្នុងកម្មវិធីរុករកនេះប៉ុណ្ណោះ ហើយមិនត្រូវបានផ្ញើទៅកន្លែងណាទេ។",
  },
});

export default function BirthChart({ cities }: { cities: City[] }) {
  const id = useId();
  const lang = useLang();
  const m = T[lang];
  const { body: BODY_COPY, sign: SIGN_COPY, house: HOUSE_TOPIC, aspect: ASPECT_COPY } = natalCopy(lang);
  const sn = (lon: number) => signName(signOf(lon).slug, lang);
  const dg = (d: number) => (lang === "km" ? khmerDigits(deg(d)) : deg(d));
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [unknown, setUnknown] = useState(false);
  const [cityText, setCityText] = useState("");
  const [errors, setErrors] = useState<{ date?: string; city?: string }>({});
  const [chart, setChart] = useState<NatalChart | null>(null);
  const results = useRef<HTMLElement>(null);

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
    const tz = city?.tz ?? (Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    setChart(natalChart({ date, time: !unknown && time ? time : null, tz, place: city ? { lat: city.lat, lon: city.lon } : null }));
    requestAnimationFrame(() => {
      results.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      results.current?.focus({ preventScroll: true });
    });
  }

  const get = (b: string) => chart?.placements.find((p) => p.body === b);
  const sun = get("sun"), moon = get("moon");

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
        <div><button type="submit" className="btn-primary">{m.submit}</button></div>
      </form>

      {chart && sun && moon && (
        <section ref={results} tabIndex={-1} className="mt-8 scroll-mt-5" aria-labelledby={`${id}-res`}>
          <h2 id={`${id}-res`} className="text-h2">{m.yourChart}</h2>
          <figure className="daydial tone-paper mt-5 flex flex-col items-center">
            <BirthChartWheel chart={chart} />
            <figcaption className="mt-3 max-w-reading text-center text-small text-muted">
              {chart.ascendant !== null ? m.risingLeft : m.noTimeWheel}
            </figcaption>
          </figure>

          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <Big label={m.sun} value={sn(sun.longitude)} />
            <Big label={m.moon} value={sn(moon.longitude)} note={moon.uncertain ? m.moonChanged : chart.timeKnown ? "" : m.midday} />
            <Big label={m.rising} value={chart.ascendant !== null ? sn(chart.ascendant) : m.notKnown} note={chart.ascendant !== null ? m.mc(sn(chart.midheaven!)) : m.needsTime} />
          </dl>

          <h3 className="mt-7 text-h3">{m.planets}</h3>
          <ul id={`${id}-list`} className="mt-2">
            {chart.placements.map((p, i) => {
              const copy = SIGN_COPY[p.signIndex];
              // Several planets often share a sign; give the sign's gift and growth once, then point back.
              const first = chart.placements.slice(0, i).find((q) => q.signIndex === p.signIndex && q.house === p.house);
              return (
                <li key={p.body} className="border-b border-rule py-4">
                  <p className="flex items-center gap-3 font-semibold">
                    <Glyph name={p.body} set="planet" className="size-5 shrink-0" />
                    <span>{m.inSign(BODY_COPY[p.body].name, signName(SIGNS[p.signIndex].slug, lang))} <span className="tabular font-normal text-muted">{dg(p.degree)}</span>
                      {p.house !== null && <span className="font-normal text-muted">{lang === "km" ? " " : ", "}{houseLabel(p.house, lang)}</span>}
                      {p.retrograde && <span className="font-normal text-muted">{m.retrograde}</span>}
                    </span>
                  </p>
                  {first ? (
                    <p className="mt-2">{m.same(BODY_COPY[p.body].topic, p.house !== null, BODY_COPY[first.body].name)}{p.uncertain ? m.changed : ""}</p>
                  ) : (
                    <>
                      <p className="mt-2">{m.topicStyle(BODY_COPY[p.body].topic, copy.style)}</p>
                      <p className="mt-1 text-small text-muted">{m.giftGrowth(copy.gift, copy.growth)}{p.house !== null ? m.showsIn(HOUSE_TOPIC[p.house - 1]) : ""}{p.uncertain ? m.changed : ""}</p>
                    </>
                  )}
                </li>
              );
            })}
          </ul>

          {chart.aspects.length > 0 && (
            <>
              <h3 className="mt-7 text-h3">{m.aspects}</h3>
              <p className="mt-2 text-small text-muted">{m.aspectsNote}</p>
              <dl className="mt-3 grid gap-x-4 gap-y-1 text-small sm:grid-cols-[auto_1fr]">
                {(Object.keys(ASPECT_COPY) as Array<keyof typeof ASPECT_COPY>).filter((k) => chart.aspects.slice(0, 12).some((a) => a.kind === k)).map((k) => (
                  <div key={k} className="contents">
                    <dt className="font-semibold capitalize">{ASPECT_COPY[k].name}</dt>
                    <dd className="mb-2 text-muted sm:mb-0">{m.meaning(ASPECT_COPY[k].meaning)}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-2">
                {chart.aspects.slice(0, 12).map((a) => (
                  <li key={`${a.a}-${a.b}`} className="border-b border-rule py-3">
                    <span className="font-semibold">{m.aspectLine(BODY_COPY[a.a].name, ASPECT_COPY[a.kind].name, BODY_COPY[a.b].name)}</span>
                    <span className="tabular text-small text-muted">{m.orb(a.orb)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <details className="mt-7 border-t border-rule pt-4">
            <summary className="min-h-tap cursor-pointer font-semibold">{m.how}</summary>
            <div className="reading mt-3 text-body">
              <p>{m.p1(chart.timeKnown, chart.instant.toISOString().slice(0, 16).replace("T", " "))}</p>
              <p>{m.p2}</p>
              <p>{m.p3}</p>
              <p>{m.p4}</p>
            </div>
          </details>
        </section>
      )}
    </>
  );
}

function Big({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border-t border-rule pt-3">
      <dt className="text-small text-muted">{label}</dt>
      <dd className="mt-1 serif text-h2">{value}</dd>
      {note ? <dd className="text-small text-muted">{note}</dd> : null}
    </div>
  );
}
