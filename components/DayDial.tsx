/**
 * DayDial — the signature element (DESIGN_SYSTEM.md §6.1). Real sky data from
 * lib/sky.ts; the Moon is drawn at its actual phase and eases into position
 * once (600ms, off under reduced motion). Tapping a sign opens its reading.
 */
import Link from "@/components/client/LocaleLink";
import { SIGNS } from "@/lib/western";
import type { SkyDay } from "@/lib/sky";
import { WESTERN_GLYPHS } from "@/lib/glyphs";
import { GlyphParts } from "./Glyph";
import type { CSSProperties } from "react";

const C = 200, R_OUT = 190, R_SIGN_OUT = 186, R_SIGN_IN = 142, R_GLYPH = 164, R_TICK_IN = 132, R_MOON = 112, R_SUN = 82, MR = 13;
const D = Math.PI / 180;
/** Astrological convention: 0° Aries on the left, longitudes counter-clockwise. */
const pt = (lon: number, r: number) => ({ x: C - r * Math.cos(lon * D), y: C + r * Math.sin(lon * D) });
const f = (n: number) => Math.round(n * 100) / 100;

function wedge(i: number) {
  const s = i * 30, e = s + 30;
  const p1 = pt(s, R_SIGN_IN), p2 = pt(s, R_SIGN_OUT), p3 = pt(e, R_SIGN_OUT), p4 = pt(e, R_SIGN_IN);
  return `M${f(p1.x)} ${f(p1.y)}L${f(p2.x)} ${f(p2.y)}A${R_SIGN_OUT} ${R_SIGN_OUT} 0 0 0 ${f(p3.x)} ${f(p3.y)}L${f(p4.x)} ${f(p4.y)}A${R_SIGN_IN} ${R_SIGN_IN} 0 0 1 ${f(p1.x)} ${f(p1.y)}Z`;
}

export function moonSentence(sky: SkyDay, when = "today"): string {
  const name = sky.moon.phaseName;
  const phase = name === "full moon" || name === "new moon" ? `a ${name}` : name;
  return `The Moon is in ${SIGNS[sky.moon.signIndex].name} ${when}, ${phase}.`;
}

export default function DayDial({ sky, selected, tone = "paper", size = "large", caption = true, linkSigns = true, id = "daydial" }: {
  sky: SkyDay; selected?: string; tone?: "night" | "paper"; size?: "large" | "small"; caption?: boolean; linkSigns?: boolean; id?: string;
}) {
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const lon = i * 5, major = lon % 30 === 0;
    return { a: pt(lon, R_TICK_IN), b: pt(lon, major ? R_SIGN_OUT : R_TICK_IN + 6), major };
  });
  const moonPos = pt(0, R_MOON);
  const angle = sky.moon.phaseAngle;
  const waxing = angle < 180;
  const rx = f(MR * Math.abs(Math.cos(angle * D)));
  const gibbous = angle > 90 && angle < 270;
  const top = `${f(moonPos.x)} ${f(moonPos.y - MR)}`, bottom = `${f(moonPos.x)} ${f(moonPos.y + MR)}`;
  // Waxing: right limb lit (northern-hemisphere view); waning: left limb lit.
  const litPath = sky.moon.phaseGroup === "new" || sky.moon.phaseGroup === "full" ? "" : waxing
    ? `M${top}A${MR} ${MR} 0 0 1 ${bottom}A${rx} ${MR} 0 0 ${gibbous ? 1 : 0} ${top}Z`
    : `M${top}A${MR} ${MR} 0 0 0 ${bottom}A${rx} ${MR} 0 0 ${gibbous ? 0 : 1} ${top}Z`;
  const sun = pt(sky.sunLongitude, R_SUN);
  const sentence = moonSentence(sky);
  const describe = `${sentence} The Sun is in ${SIGNS[sky.sunSignIndex].name}.`;

  return (
    <figure className={`daydial tone-${tone} flex flex-col items-center`}>
      <svg viewBox="0 0 400 400" className={size === "large" ? "size-dial" : "size-dial-small"} role="group" aria-labelledby={`${id}-cap`}>
        <circle cx={C} cy={C} r={R_OUT} className="ring" />
        <circle cx={C} cy={C} r={R_SIGN_OUT} className="ring-fine" />
        <circle cx={C} cy={C} r={R_SIGN_IN} className="ring" />
        <circle cx={C} cy={C} r={R_TICK_IN} className="ring-fine" />
        <circle cx={C} cy={C} r={R_SUN - 18} className="ring-fine" />
        {ticks.map((t, i) => <line key={i} x1={f(t.a.x)} y1={f(t.a.y)} x2={f(t.b.x)} y2={f(t.b.y)} className={t.major ? "tick-major" : "tick"} />)}
        {SIGNS.map((s) => {
          const g = pt(s.index * 30 + 15, R_GLYPH);
          const body = (
            <>
              <path d={wedge(s.index)} className="wedge" />
              {selected === s.slug && <circle cx={f(g.x)} cy={f(g.y)} r="19" className="selected" />}
              <g transform={`translate(${f(g.x - 12)} ${f(g.y - 12)})`} className="glyph"><GlyphParts parts={WESTERN_GLYPHS[s.slug]} /></g>
            </>
          );
          return linkSigns
            ? <Link key={s.slug} href={`/horoscope/${s.slug}`} aria-label={`${s.name} daily horoscope`} className="sign-link">{body}</Link>
            : <g key={s.slug}>{body}</g>;
        })}
        <g aria-hidden="true">
          <circle cx={f(sun.x)} cy={f(sun.y)} r="9" className="sun-disc" />
          <circle cx={f(sun.x)} cy={f(sun.y)} r="2" className="sun-dot" />
        </g>
        <g className="moon-orbit" style={{ "--to": `${f(-sky.moon.longitude)}deg` } as CSSProperties} aria-hidden="true">
          <line x1={f(pt(0, R_TICK_IN).x)} y1={C} x2={f(moonPos.x - MR)} y2={C} className="moon-lead" />
          <g className="moon-body" style={{ transformOrigin: `${f(moonPos.x)}px ${f(moonPos.y)}px` }}>
            <circle cx={f(moonPos.x)} cy={f(moonPos.y)} r={MR} className="moon-dark" />
            {sky.moon.phaseGroup === "full" ? <circle cx={f(moonPos.x)} cy={f(moonPos.y)} r={MR} className="moon-lit" /> : litPath && <path d={litPath} className="moon-lit" />}
            <circle cx={f(moonPos.x)} cy={f(moonPos.y)} r={MR} className="moon-edge" />
          </g>
        </g>
      </svg>
      {caption
        ? <figcaption id={`${id}-cap`} className="mt-4 max-w-reading text-center serif text-reading">{sentence}</figcaption>
        : <figcaption id={`${id}-cap`} className="sr-only">{describe}</figcaption>}
    </figure>
  );
}
