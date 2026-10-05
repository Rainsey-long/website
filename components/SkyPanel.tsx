/**
 * "The sky behind this reading" (research feature #17): the computed facts a
 * reading was built from, so accuracy is checkable rather than claimed.
 */
import { SIGNS } from "@/lib/western";
import type { DailyReading } from "@/lib/reading-engine";
import { defineMessages } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { moonPhaseName } from "@/lib/names";

const ord = (n: number) => n + (["th", "st", "nd", "rd"][(n % 100 - 20) % 10] || ["th", "st", "nd", "rd"][n % 100] || "th");
const deg = (lon: number) => `${Math.floor(lon % 30)}°`;
const cap = (p: string) => p[0].toUpperCase() + p.slice(1);

const T = defineMessages({
  en: {
    summary: "The sky behind this reading", moon: "Moon", phase: "Phase", sun: "Sun", retrograde: ", retrograde",
    lit: (pct: number) => `${pct}% lit`,
    house: (n: number, theme: string) => `The Moon sits in your ${ord(n)} solar house, the house of ${theme}. That sets today's themes.`,
    retro: (names: string[]) => ` ${names.join(" and ")} ${names.length > 1 ? "are" : "is"} retrograde, which colours the notes.`,
    method: "Positions are calculated for 12:00 UTC with astronomy-engine, tropical zodiac. The meanings are traditional, for reflection and entertainment.",
  },
});

export default async function SkyPanel({ reading }: { reading: DailyReading }) {
  const lang = await getLang();
  const t = T[lang];
  const { sky } = reading;
  const sign = (i: number) => SIGNS[i].name;
  const d = (lon: number) => deg(lon);
  const planet = (p: string) => cap(p);
  const retro = (["mercury", "venus", "mars"] as const).filter((p) => sky.planets[p].retrograde);
  return (
    <details className="mt-6 border-y border-rule">
      <summary className="flex min-h-tap cursor-pointer items-center py-3 font-semibold">{t.summary}</summary>
      <div className="pb-5 text-small">
        <dl className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 tabular">
          <div><dt className="text-muted">{t.moon}</dt><dd>{sign(sky.moon.signIndex)} {d(sky.moon.longitude)}</dd></div>
          <div><dt className="text-muted">{t.phase}</dt><dd>{moonPhaseName(sky.moon.phaseName, lang)}, {t.lit(sky.moon.illumination)}</dd></div>
          <div><dt className="text-muted">{t.sun}</dt><dd>{sign(sky.sunSignIndex)} {d(sky.sunLongitude)}</dd></div>
          {(["mercury", "venus", "mars"] as const).map((p) => (
            <div key={p}><dt className="text-muted">{planet(p)}</dt><dd>{sign(sky.planets[p].signIndex)} {d(sky.planets[p].longitude)}{sky.planets[p].retrograde ? t.retrograde : ""}</dd></div>
          ))}
        </dl>
        <p className="mt-4">
          {t.house(reading.house, reading.theme)}
          {retro.length > 0 && t.retro(retro.map(planet))}
        </p>
        <p className="mt-2 text-muted">{t.method}</p>
      </div>
    </details>
  );
}
