"use client";
/**
 * AlmanacCalendar (§6.8): Monday-first grid, tabular numerals. Shows the
 * traditions the visitor chose: Chinese almanac marks (seal = good day, clay
 * dot = challenging) and the Khmer lunar calendar (ring = holy day, festivals).
 * Today outlined in cinnabar; arrow keys move between days; the detail panel
 * follows the selection.
 */
import Link from "@/components/client/LocaleLink";
import { useRef, useState, useSyncExternalStore } from "react";
import Seal from "../Seal";
import { localToday } from "@/lib/client";
import { useLang } from "./LangProvider";
import { defineMessages, num } from "@/lib/i18n";

/**
 * `full`, `chinese.lunarLabel`, `chinese.good` and `chinese.avoid` arrive
 * already in the page language (the server page picks them).
 */
export interface CalDay {
  date: string;
  full: string;
  chinese?: { lunarShort: string; lunarLabel: string; pillar: string; quality: "good" | "neutral" | "challenging"; good: string[]; avoid: string[]; clash: { slug: string; name: string } };
  khmer?: { short: string; phase: string; labelKm: string; labelEn: string; labelKmShort?: string; sila: boolean; festival: { km: string; en: string } | null };
}

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

const T = defineMessages({
  en: {
    quality: { good: "Good day", neutral: "Ordinary day", challenging: "Challenging day" },
    dow: [["Mon", "Monday"], ["Tue", "Tuesday"], ["Wed", "Wednesday"], ["Thu", "Thursday"], ["Fri", "Friday"], ["Sat", "Saturday"], ["Sun", "Sunday"]].map(([a, b]) => `${a}|${b}`).join(","),
    nothing: "Nothing in particular",
    holy: "Buddhist holy day",
    today: "Today",
    chineseLine: (lunar: string, pillar: string, q: string) => `Chinese almanac: lunar ${lunar}. Day of ${pillar}. ${q}.`,
    goodFor: "Good for",
    avoid: "Avoid",
    clashA: "Clashes with the ",
    clashB: ". People born in that year may prefer a quieter day.",
    dayPage: "The full almanac for this day",
  },
});

export default function AlmanacCalendar({ firstDow, days }: { firstDow: number; days: CalDay[] }) {
  const lang = useLang();
  const t = T[lang];
  const QUALITY = t.quality;
  const today = useSyncExternalStore(() => () => {}, localToday, () => "");
  const hash = useSyncExternalStore(subscribeHash, () => location.hash.slice(1), () => "");
  const [sel, setSel] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const has = (d: string) => days.some((x) => x.date === d);
  const current = sel ?? (has(hash) ? hash : has(today) ? today : days[0].date);
  const day = days.find((d) => d.date === current)!;

  const choose = (date: string, focus = false) => {
    setSel(date);
    history.replaceState(null, "", `#${date}`);
    if (focus) refs.current[date]?.focus();
  };

  const cells: Array<CalDay | null> = [...Array(firstDow).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const DOW = t.dow.split(",").map((x) => x.split("|") as [string, string]);
  const list = (x: string[]) => (x.length ? x.join(", ") : t.nothing);

  return (
    <div>
      <table role="grid" className="w-full table-fixed border-collapse tabular" aria-labelledby="month-h">
        <thead><tr>{DOW.map(([s, l]) => <th key={s} scope="col" className="py-2 text-small font-medium text-muted"><abbr title={l} className="no-underline">{s}</abbr></th>)}</tr></thead>
        <tbody>
          {weeks.map((w, wi) => (
            <tr key={wi}>
              {w.map((d, di) => d ? (
                <td key={d.date} className="border-t border-rule p-0 align-top" role="gridcell" aria-selected={d.date === current}>
                  <button type="button" ref={(el) => { refs.current[d.date] = el; }}
                    className={`cal-day${d.date === today ? " is-today" : ""}${d.date === current ? " is-selected" : ""}`} aria-current={d.date === today ? "date" : undefined}
                    tabIndex={d.date === current ? 0 : -1}
                    aria-label={[d.full, d.khmer?.labelEn, d.khmer?.sila ? t.holy : "", d.khmer?.festival?.en, d.chinese ? QUALITY[d.chinese.quality] : ""].filter(Boolean).join(". ")}
                    onClick={() => choose(d.date)}
                    onKeyDown={(e) => {
                      const i = days.findIndex((x) => x.date === d.date);
                      const step = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 } as Record<string, number>)[e.key];
                      if (step === undefined) return;
                      e.preventDefault();
                      choose(days[Math.max(0, Math.min(days.length - 1, i + step))].date, true);
                    }}>
                    <span className="cal-num">{num(Number(d.date.slice(8)), lang)}</span>
                    <span className="cal-foot">
                      <span className="text-small text-muted">{d.khmer ? <>{d.khmer.short}<span className="max-sm:sr-only">{d.khmer.phase}</span></> : d.chinese ? num(d.chinese.lunarShort, lang) : null}</span>
                      <span className="cal-marks" aria-hidden="true">
                        {d.khmer?.sila && <span className="cal-sila" />}
                        {d.chinese?.quality === "good" && <Seal size="sm" />}
                        {d.chinese?.quality === "challenging" && <span className="cal-dot" />}
                      </span>
                    </span>
                  </button>
                </td>
              ) : <td key={`e${wi}-${di}`} className="border-t border-rule" aria-hidden="true" />)}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-small text-muted">
        {days[0].chinese && <><span className="inline-flex items-center gap-2"><Seal size="sm" /> {QUALITY.good}</span><span className="inline-flex items-center gap-2"><span className="cal-dot" /> {QUALITY.challenging}</span></>}
        {days[0].khmer && <span className="inline-flex items-center gap-2"><span className="cal-sila" /> {t.holy}</span>}
        <span className="inline-flex items-center gap-2"><span className="today-key" /> {t.today}</span>
      </p>

      <section className="mt-6 border-y-2 border-ink py-5" aria-live="polite" aria-labelledby="detail-h">
        <h2 id="detail-h" className="text-h3">{day.full}</h2>
        {day.khmer && (
          <div className="mt-3">
            <p lang="km" className="serif">{day.khmer.labelKm}</p>
            <p className="text-small text-muted">The {day.khmer.labelEn}.{day.khmer.sila ? <> A Buddhist holy day (<span lang="km">ថ្ងៃសីល</span>).</> : ""}</p>
            {day.khmer.festival && <p className="mt-2 font-semibold">{day.khmer.festival.en} <span lang="km" className="font-normal">{day.khmer.festival.km}</span></p>}
          </div>
        )}
        {day.chinese && (
          <div className="mt-4">
            <p className="text-small text-muted">{t.chineseLine(day.chinese.lunarLabel, day.chinese.pillar, QUALITY[day.chinese.quality])}</p>
            <dl className="mt-3 grid gap-5 sm:grid-cols-2">
              <div><dt className="font-semibold">{t.goodFor}</dt><dd className="mt-1">{list(day.chinese.good)}</dd></div>
              <div><dt className="font-semibold">{t.avoid}</dt><dd className="mt-1">{list(day.chinese.avoid)}</dd></div>
            </dl>
            <p className="mt-4">{t.clashA}<Link className="link" href={`/chinese-zodiac/${day.chinese.clash.slug}`}>{day.chinese.clash.name}</Link>{t.clashB}</p>
          </div>
        )}
        <p className="mt-4"><Link className="link inline-flex min-h-tap items-center" href={`/lucky-days/day/${day.date}`}>{t.dayPage}</Link></p>
      </section>
    </div>
  );
}
