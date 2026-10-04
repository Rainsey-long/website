/**
 * BirthChartWheel (DESIGN_SYSTEM.md §6.16) — the natal chart in the DayDial's
 * hand. Pure render from lib/natal.ts; no directive, so it can sit inside the
 * client calculator. With a birth time the ascendant is drawn on the left (the
 * usual chart orientation); without one, 0° Aries is on the left.
 * Hidden from screen readers (aria-hidden): the placements list below it carries
 * the same data, so describing the wheel too would read everything twice.
 * The ascendant axis runs past the rings on the left only; the descendant end
 * stops at the sign ring so the left reads as the rising point.
 */
import { SIGNS } from "@/lib/western";
import { PLANET_GLYPHS, WESTERN_GLYPHS } from "@/lib/glyphs";
import type { NatalChart } from "@/lib/natal";
import { GlyphParts } from "./Glyph";

const C = 200, R_OUT = 190, R_SIGN_OUT = 186, R_SIGN_IN = 142, R_GLYPH = 164, R_TICK_IN = 132, R_ASPECT = 62;
const PLANET_R = [112, 92, 72] as const;
const D = Math.PI / 180;
const f = (n: number) => Math.round(n * 100) / 100;

export default function BirthChartWheel({ chart }: { chart: NatalChart }) {
  const offset = chart.ascendant ?? 0;
  // Longitudes run counter-clockwise from the left, rotated so `offset` sits on the left.
  const pt = (lon: number, r: number) => ({ x: C - r * Math.cos((lon - offset) * D), y: C + r * Math.sin((lon - offset) * D) });
  const wedge = (i: number) => {
    const s = i * 30, e = s + 30;
    const p1 = pt(s, R_SIGN_IN), p2 = pt(s, R_SIGN_OUT), p3 = pt(e, R_SIGN_OUT), p4 = pt(e, R_SIGN_IN);
    return `M${f(p1.x)} ${f(p1.y)}L${f(p2.x)} ${f(p2.y)}A${R_SIGN_OUT} ${R_SIGN_OUT} 0 0 0 ${f(p3.x)} ${f(p3.y)}L${f(p4.x)} ${f(p4.y)}A${R_SIGN_IN} ${R_SIGN_IN} 0 0 1 ${f(p1.x)} ${f(p1.y)}Z`;
  };
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const lon = i * 5, major = lon % 30 === 0;
    return { a: pt(lon, R_TICK_IN), b: pt(lon, major ? R_SIGN_IN : R_TICK_IN + 6), major };
  });
  // Step planets closer than 7° inwards so their glyphs never overlap.
  const sorted = [...chart.placements].sort((a, b) => a.longitude - b.longitude);
  const tier = new Map<string, number>();
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    tier.set(p.body, prev && p.longitude - prev.longitude < 7 ? (tier.get(prev.body)! + 1) % PLANET_R.length : 0);
  });
  const byBody = new Map(chart.placements.map((p) => [p.body, p]));
  return (
    <svg viewBox="0 0 400 400" className="size-dial" aria-hidden="true" focusable="false">
      <circle cx={C} cy={C} r={R_OUT} className="ring" />
      <circle cx={C} cy={C} r={R_SIGN_OUT} className="ring-fine" />
      <circle cx={C} cy={C} r={R_SIGN_IN} className="ring" />
      <circle cx={C} cy={C} r={R_TICK_IN} className="ring-fine" />
      <circle cx={C} cy={C} r={R_ASPECT} className="ring-fine" />
      {ticks.map((t, i) => <line key={i} x1={f(t.a.x)} y1={f(t.a.y)} x2={f(t.b.x)} y2={f(t.b.y)} className={t.major ? "tick-major" : "tick"} />)}
      {SIGNS.map((s) => {
        const g = pt(s.index * 30 + 15, R_GLYPH);
        return (
          <g key={s.slug}>
            <path d={wedge(s.index)} className="wedge" />
            <g transform={`translate(${f(g.x - 12)} ${f(g.y - 12)})`} className="glyph"><GlyphParts parts={WESTERN_GLYPHS[s.slug]} /></g>
          </g>
        );
      })}
      {chart.ascendant !== null && (
        <g className="axis">
          <line x1={f(pt(chart.ascendant, R_OUT + 10).x)} y1={f(pt(chart.ascendant, R_OUT + 10).y)} x2={f(pt(chart.ascendant, R_TICK_IN).x)} y2={f(pt(chart.ascendant, R_TICK_IN).y)} />
          <line x1={f(pt(chart.ascendant + 180, R_SIGN_IN).x)} y1={f(pt(chart.ascendant + 180, R_SIGN_IN).y)} x2={f(pt(chart.ascendant + 180, R_TICK_IN).x)} y2={f(pt(chart.ascendant + 180, R_TICK_IN).y)} />
        </g>
      )}
      {chart.aspects.filter((a) => a.kind !== "conjunction").map((a) => {
        const p = pt(byBody.get(a.a)!.longitude, R_ASPECT), q = pt(byBody.get(a.b)!.longitude, R_ASPECT);
        return <line key={`${a.a}-${a.b}`} x1={f(p.x)} y1={f(p.y)} x2={f(q.x)} y2={f(q.y)} className={a.kind === "trine" || a.kind === "sextile" ? "asp-soft" : "asp-hard"} />;
      })}
      {chart.placements.map((p) => {
        const r = PLANET_R[tier.get(p.body)!];
        const g = pt(p.longitude, r);
        const m1 = pt(p.longitude, R_TICK_IN), m2 = pt(p.longitude, R_TICK_IN - 6);
        return (
          <g key={p.body}>
            <line x1={f(m1.x)} y1={f(m1.y)} x2={f(m2.x)} y2={f(m2.y)} className="tick-major" />
            <g transform={`translate(${f(g.x - 9)} ${f(g.y - 9)}) scale(0.75)`} className="glyph"><GlyphParts parts={PLANET_GLYPHS[p.body]} /></g>
          </g>
        );
      })}
    </svg>
  );
}
