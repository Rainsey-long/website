/**
 * CompatibilityResult (§6.6): glyphs facing each other with the relationship
 * name between, a large tabular score with "match", sub-scores as meters.
 * Colour (jade/clay) only reinforces the band label, which says it in words.
 */
import Glyph from "./Glyph";
import EnergyMeter from "./EnergyMeter";
import { scoreBand, toMeter, type PairScore } from "@/lib/compatibility";
import { defineMessages, num } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";

const T = defineMessages({
  en: { match: "match", love: "Love", friendship: "Friendship", work: "Work" },
  km: { match: "ត្រូវគ្នា", love: "ស្នេហា", friendship: "មិត្តភាព", work: "ការងារ" },
});

type Side = { slug: string; name: string };
export default async function CompatibilityResult({ a, b, set, relationName, score, title }: {
  a: Side; b: Side; set: "western" | "animal"; relationName: string; score: PairScore; title?: string;
}) {
  const lang = await getLang();
  const t = T[lang];
  const band = scoreBand(score.score, lang);
  return (
    <section className="border-b-2 border-ink pb-6">
      {title && <h1 className="text-h1">{title}</h1>}
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <Glyph name={a.slug} set={set} className="size-9" />
          <span className="serif text-h3">{a.name}</span>
        </div>
        <p className="text-center text-small font-semibold text-muted">{relationName}</p>
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="mirror"><Glyph name={b.slug} set={set} className="size-9" /></span>
          <span className="serif text-h3">{b.name}</span>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
        <p className="flex items-baseline gap-2">
          <span className="serif text-display tabular">{num(score.score, lang)}</span>
          <span className="text-small text-muted">{t.match}</span>
          <span className={`ml-3 text-small font-semibold ${band.tone === "high" ? "text-jade" : band.tone === "low" ? "text-clay" : "text-ink"}`}>{band.label}</span>
        </p>
        <dl className="grid grid-cols-3 gap-5 text-small">
          <div><dt className="text-muted">{t.love}</dt><dd className="mt-1"><EnergyMeter value={toMeter(score.love)} label={t.love} lang={lang} /></dd></div>
          <div><dt className="text-muted">{t.friendship}</dt><dd className="mt-1"><EnergyMeter value={toMeter(score.friendship)} label={t.friendship} lang={lang} /></dd></div>
          <div><dt className="text-muted">{t.work}</dt><dd className="mt-1"><EnergyMeter value={toMeter(score.work)} label={t.work} lang={lang} /></dd></div>
        </dl>
      </div>
    </section>
  );
}
