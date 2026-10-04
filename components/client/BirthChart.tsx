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
import { ASPECT_COPY, BODY_COPY, HOUSE_TOPIC, ORDINAL, SIGN_COPY } from "@/lib/natalCopy";
import { localToday } from "@/lib/client";
import BirthChartWheel from "@/components/BirthChartWheel";
import Glyph from "@/components/Glyph";

const deg = (d: number) => {
  const whole = Math.floor(d);
  return `${whole}°${String(Math.floor((d - whole) * 60)).padStart(2, "0")}′`;
};
const signOf = (lon: number) => SIGNS[Math.floor(lon / 30) % 12];

export default function BirthChart({ cities }: { cities: City[] }) {
  const id = useId();
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
        <div>
          <label className="label" htmlFor={`${id}-date`}>Birth date</label>
          <input className="field tabular" type="date" id={`${id}-date`} required min="1900-01-01" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={!!errors.date} aria-describedby={`${id}-date-err`} />
          {errors.date && <p id={`${id}-date-err`} className="mt-2 text-small font-semibold text-cinnabar">{errors.date}</p>}
        </div>
        <div>
          <label className="label" htmlFor={`${id}-time`}>Birth time <span className="font-normal text-muted">(optional)</span></label>
          <input className="field tabular" type="time" id={`${id}-time`} value={time} disabled={unknown} onChange={(e) => setTime(e.target.value)} />
          <label className="mt-3 inline-flex min-h-tap items-center gap-3">
            <input type="checkbox" className="size-5 shrink-0" checked={unknown} onChange={(e) => { setUnknown(e.target.checked); if (e.target.checked) setTime(""); }} />
            <span>I don&apos;t know my birth time</span>
          </label>
        </div>
        <div>
          <label className="label" htmlFor={`${id}-city`}>Birth city <span className="font-normal text-muted">(optional)</span></label>
          <input className="field" id={`${id}-city`} list={`${id}-cities`} autoComplete="off" value={cityText} onChange={(e) => setCityText(e.target.value)} aria-invalid={!!errors.city} aria-describedby={`${id}-city-hint`} />
          <datalist id={`${id}-cities`}>{cities.map((c) => <option key={c.name + c.country} value={`${c.name}, ${c.country}`} />)}</datalist>
          <p id={`${id}-city-hint`} className="mt-2 text-small text-muted">A time and city add your rising sign and houses. Choose the nearest large city if yours is missing.</p>
          {errors.city && <p className="mt-2 text-small font-semibold text-cinnabar">{errors.city}</p>}
        </div>
        <div><button type="submit" className="btn-primary">Draw my chart</button></div>
      </form>

      {chart && sun && moon && (
        <section ref={results} tabIndex={-1} className="mt-8 scroll-mt-5" aria-labelledby={`${id}-res`}>
          <h2 id={`${id}-res`} className="text-h2">Your birth chart</h2>
          <figure className="daydial tone-paper mt-5 flex flex-col items-center">
            <BirthChartWheel chart={chart} />
            <figcaption className="mt-3 max-w-reading text-center text-small text-muted">
              {chart.ascendant !== null ? "Your rising sign is on the left, on the horizontal line." : "Without a birth time the wheel starts at 0° Aries on the left and shows no houses."}
            </figcaption>
          </figure>

          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <Big label="Sun" value={signOf(sun.longitude).name} />
            <Big label="Moon" value={signOf(moon.longitude).name} note={moon.uncertain ? "The Moon changed sign that day; add your birth time to be sure." : chart.timeKnown ? "" : "Worked out for midday."} />
            <Big label="Rising" value={chart.ascendant !== null ? signOf(chart.ascendant).name : "Not known"} note={chart.ascendant !== null ? `Midheaven in ${signOf(chart.midheaven!).name}` : "Needs your birth time and city."} />
          </dl>

          <h3 className="mt-7 text-h3">Planets</h3>
          <ul id={`${id}-list`} className="mt-2">
            {chart.placements.map((p, i) => {
              const copy = SIGN_COPY[p.signIndex];
              // Several planets often share a sign; give the sign's gift and growth once, then point back.
              const first = chart.placements.slice(0, i).find((q) => q.signIndex === p.signIndex && q.house === p.house);
              return (
                <li key={p.body} className="border-b border-rule py-4">
                  <p className="flex items-center gap-3 font-semibold">
                    <Glyph name={p.body} set="planet" className="size-5 shrink-0" />
                    <span>{BODY_COPY[p.body].name} in {SIGNS[p.signIndex].name} <span className="tabular font-normal text-muted">{deg(p.degree)}</span>
                      {p.house !== null && <span className="font-normal text-muted">, {ORDINAL[p.house - 1]} house</span>}
                      {p.retrograde && <span className="font-normal text-muted">, retrograde</span>}
                    </span>
                  </p>
                  {first ? (
                    <p className="mt-2">{BODY_COPY[p.body].topic}. Same sign{p.house !== null ? " and house" : ""} as your {BODY_COPY[first.body].name}, so the same style, gift and growth apply.{p.uncertain ? " It changed sign that day, so a birth time would confirm it." : ""}</p>
                  ) : (
                    <>
                      <p className="mt-2">{BODY_COPY[p.body].topic}: {copy.style}.</p>
                      <p className="mt-1 text-small text-muted">Gift: {copy.gift}. Growth: {copy.growth}.{p.house !== null ? ` Shows up in ${HOUSE_TOPIC[p.house - 1]}.` : ""}{p.uncertain ? " It changed sign that day, so a birth time would confirm it." : ""}</p>
                    </>
                  )}
                </li>
              );
            })}
          </ul>

          {chart.aspects.length > 0 && (
            <>
              <h3 className="mt-7 text-h3">Aspects</h3>
              <p className="mt-2 text-small text-muted">Angles between planets, closest first.</p>
              <dl className="mt-3 grid gap-x-4 gap-y-1 text-small sm:grid-cols-[auto_1fr]">
                {(Object.keys(ASPECT_COPY) as Array<keyof typeof ASPECT_COPY>).filter((k) => chart.aspects.slice(0, 12).some((a) => a.kind === k)).map((k) => (
                  <div key={k} className="contents">
                    <dt className="font-semibold capitalize">{ASPECT_COPY[k].name}</dt>
                    <dd className="mb-2 text-muted sm:mb-0">{ASPECT_COPY[k].meaning}.</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-2">
                {chart.aspects.slice(0, 12).map((a) => (
                  <li key={`${a.a}-${a.b}`} className="border-b border-rule py-3">
                    <span className="font-semibold">{BODY_COPY[a.a].name} {ASPECT_COPY[a.kind].name} {BODY_COPY[a.b].name}</span>
                    <span className="tabular text-small text-muted"> · {a.orb}° from exact</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <details className="mt-7 border-t border-rule pt-4">
            <summary className="min-h-tap cursor-pointer font-semibold">How this chart was computed</summary>
            <div className="reading mt-3 text-body">
              <p>Planet positions come from the open-source astronomy-engine library: geocentric, tropical zodiac, for the moment you were born{chart.timeKnown ? "" : " (midday, since no time was given)"}, in UTC {chart.instant.toISOString().slice(0, 16).replace("T", " ")}.</p>
              <p>Houses use the whole-sign system: your rising sign is the 1st house, the next sign the 2nd, and so on. It works at every latitude.</p>
              <p>Aspects allow 8° for conjunctions and oppositions, 7° for trines and squares and 5° for sextiles, 2° more when the Sun or Moon is involved. Aspects between Uranus, Neptune and Pluto are left out because whole generations share them.</p>
              <p>Your birth details were used only in this browser and were not sent anywhere.</p>
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
