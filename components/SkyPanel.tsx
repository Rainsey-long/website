/**
 * "The sky behind this reading" (research feature #17): the computed facts a
 * reading was built from, so accuracy is checkable rather than claimed.
 */
import { SIGNS } from "@/lib/western";
import type { DailyReading } from "@/lib/reading-engine";

const ord = (n: number) => n + (["th", "st", "nd", "rd"][(n % 100 - 20) % 10] || ["th", "st", "nd", "rd"][n % 100] || "th");
const deg = (lon: number) => `${Math.floor(lon % 30)}°`;

export default function SkyPanel({ reading }: { reading: DailyReading }) {
  const { sky } = reading;
  const retro = (["mercury", "venus", "mars"] as const).filter((p) => sky.planets[p].retrograde);
  return (
    <details className="mt-6 border-y border-rule">
      <summary className="flex min-h-tap cursor-pointer items-center py-3 font-semibold">The sky behind this reading</summary>
      <div className="pb-5 text-small">
        <dl className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 tabular">
          <div><dt className="text-muted">Moon</dt><dd>{SIGNS[sky.moon.signIndex].name} {deg(sky.moon.longitude)}</dd></div>
          <div><dt className="text-muted">Phase</dt><dd>{sky.moon.phaseName}, {sky.moon.illumination}% lit</dd></div>
          <div><dt className="text-muted">Sun</dt><dd>{SIGNS[sky.sunSignIndex].name} {deg(sky.sunLongitude)}</dd></div>
          {(["mercury", "venus", "mars"] as const).map((p) => (
            <div key={p}><dt className="text-muted">{p[0].toUpperCase() + p.slice(1)}</dt><dd>{SIGNS[sky.planets[p].signIndex].name} {deg(sky.planets[p].longitude)}{sky.planets[p].retrograde ? ", retrograde" : ""}</dd></div>
          ))}
        </dl>
        <p className="mt-4">
          The Moon sits in your {ord(reading.house)} solar house, the house of {reading.theme}. That sets today&apos;s themes.
          {retro.length > 0 && ` ${retro.map((p) => p[0].toUpperCase() + p.slice(1)).join(" and ")} ${retro.length > 1 ? "are" : "is"} retrograde, which colours the notes.`}
        </p>
        <p className="mt-2 text-muted">Positions are calculated for 12:00 UTC with astronomy-engine, tropical zodiac. The meanings are traditional, for reflection and entertainment.</p>
      </div>
    </details>
  );
}
