"use client";
/** "Your reading today" (§8.1): first on the homepage once a sign is remembered. */
import Link from "@/components/client/LocaleLink";
import { MY_SIGN_EVENT, MY_SIGN_KEY, SIGN_NAMES, localToday, writeStore } from "@/lib/client";
import { WESTERN_GLYPHS } from "@/lib/glyphs";
import { GlyphParts } from "../Glyph";
import EnergyMeter from "../EnergyMeter";
import { useMySign } from "./HeaderControls";
import { useSyncExternalStore } from "react";

const TOPICS = ["Love", "Career", "Money", "Mood"];

export default function HomeMyReading({ summaries, today }: { summaries: Record<string, Record<string, { energy: number[]; line: string; date: string }>>; today: string }) {
  const sign = useMySign();
  const local = useSyncExternalStore(() => () => {}, localToday, () => today);
  const s = sign ? (summaries[local] ?? summaries[today])?.[sign] : null;
  if (!sign || !s) return null;
  return (
    <section className="border-b border-rule" aria-labelledby="my-reading-h">
      <div className="mx-auto max-w-page safe-x py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="my-reading-h" className="text-h2">Your reading today</h2>
          <button type="button" className="link min-h-tap text-small" onClick={() => {
            writeStore(MY_SIGN_KEY, null);
            window.dispatchEvent(new Event(MY_SIGN_EVENT));
            document.getElementById("pick-sign")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
          }}>Change sign</button>
        </div>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="size-glyph-lg" aria-hidden="true"><GlyphParts parts={WESTERN_GLYPHS[sign]} /></svg>
            <div>
              <p className="serif text-h3">{SIGN_NAMES[sign]}</p>
              <p className="text-small text-muted">{s.date}</p>
            </div>
          </div>
          <dl className="grid grid-cols-4 gap-4 text-small">
            {s.energy.map((v, i) => <div key={i}><dt className="text-muted">{TOPICS[i]}</dt><dd className="mt-1"><EnergyMeter value={v} label={`${TOPICS[i]} energy`} /></dd></div>)}
          </dl>
        </div>
        <p className="reading mt-4">{s.line}</p>
        <Link className="btn-primary mt-4" href={`/horoscope/${sign}`}>Read today&apos;s {SIGN_NAMES[sign]} horoscope</Link>
      </div>
    </section>
  );
}
