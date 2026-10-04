"use client";
/**
 * AlmanacCalendar (§6.8): Monday-first grid, tabular numerals. Shows the
 * traditions the visitor chose: Chinese almanac marks (seal = good day, clay
 * dot = challenging) and the Khmer lunar calendar (ring = holy day, festivals).
 * Today outlined in cinnabar; arrow keys move between days; the detail panel
 * follows the selection.
 */
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import Seal from "../Seal";
import { localToday } from "@/lib/client";

export interface CalDay {
  date: string;
  full: string;
  chinese?: { lunarShort: string; lunarLabel: string; pillar: string; quality: "good" | "neutral" | "challenging"; good: string[]; avoid: string[]; clash: { slug: string; name: string } };
  khmer?: { short: string; phase: string; labelKm: string; labelEn: string; sila: boolean; festival: { km: string; en: string } | null };
}

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

const QUALITY = { good: "Good day", neutral: "Ordinary day", challenging: "Challenging day" } as const;

export default function AlmanacCalendar({ firstDow, days }: { firstDow: number; days: CalDay[] }) {
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
  const DOW: Array<[string, string]> = [["Mon", "Monday"], ["Tue", "Tuesday"], ["Wed", "Wednesday"], ["Thu", "Thursday"], ["Fri", "Friday"], ["Sat", "Saturday"], ["Sun", "Sunday"]];
  const list = (x: string[]) => (x.length ? x.join(", ") : "Nothing in particular");

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
                    aria-label={[d.full, d.khmer?.labelEn, d.khmer?.sila ? "Buddhist holy day" : "", d.khmer?.festival?.en, d.chinese ? QUALITY[d.chinese.quality] : ""].filter(Boolean).join(". ")}
                    onClick={() => choose(d.date)}
                    onKeyDown={(e) => {
                      const i = days.findIndex((x) => x.date === d.date);
                      const step = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 } as Record<string, number>)[e.key];
                      if (step === undefined) return;
                      e.preventDefault();
                      choose(days[Math.max(0, Math.min(days.length - 1, i + step))].date, true);
                    }}>
                    <span className="cal-num">{Number(d.date.slice(8))}</span>
                    <span className="cal-foot">
                      <span className="text-small text-muted" lang={d.khmer ? "km" : undefined}>{d.khmer ? <>{d.khmer.short}<span className="max-sm:sr-only">{d.khmer.phase}</span></> : d.chinese?.lunarShort}</span>
                      <span className="flex items-center gap-1" aria-hidden="true">
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
        {days[0].chinese && <><span className="inline-flex items-center gap-2"><Seal size="sm" /> Good day</span><span className="inline-flex items-center gap-2"><span className="cal-dot" /> Challenging day</span></>}
        {days[0].khmer && <span className="inline-flex items-center gap-2"><span className="cal-sila" /> Buddhist holy day</span>}
        <span className="inline-flex items-center gap-2"><span className="today-key" /> Today</span>
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
            <p className="text-small text-muted">Chinese almanac: lunar {day.chinese.lunarLabel}. Day of {day.chinese.pillar}. {QUALITY[day.chinese.quality]}.</p>
            <dl className="mt-3 grid gap-5 sm:grid-cols-2">
              <div><dt className="font-semibold">Good for</dt><dd className="mt-1">{list(day.chinese.good)}</dd></div>
              <div><dt className="font-semibold">Avoid</dt><dd className="mt-1">{list(day.chinese.avoid)}</dd></div>
            </dl>
            <p className="mt-4">Clashes with the <Link className="link" href={`/chinese-zodiac/${day.chinese.clash.slug}`}>{day.chinese.clash.name}</Link>. People born in that year may prefer a quieter day.</p>
          </div>
        )}
      </section>
    </div>
  );
}
