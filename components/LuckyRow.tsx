/**
 * LuckyRow (§6.5): lucky colour (swatch + name), number, hour. On auspicious
 * days the cinnabar seal with "Good day for …".
 */
import Seal from "./Seal";
import { defineMessages, num } from "@/lib/i18n";
import { getLang } from "@/lib/langServer";
import { luckyColourName } from "@/lib/reading-engine";
import { hourRange } from "@/lib/pages";

const T = defineMessages({
  en: { heading: "Lucky today", colour: "Colour", number: "Number", hour: "Hour", goodFor: "Good day for", and: " and " },
});

export default async function LuckyRow({ color, number, hour, seal, heading, headingId = "lucky-h" }: {
  color?: { name: string; element: string };
  number?: number | string;
  hour?: string;
  seal?: string[] | null;
  heading?: string;
  headingId?: string;
}) {
  const lang = await getLang();
  const t = T[lang];
  const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
  return (
    <section aria-labelledby={headingId} className="border-y-2 border-ink py-5">
      <h2 id={headingId} className="text-h3">{heading ?? t.heading}</h2>
      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {color && (
          <div>
            <dt className="text-small text-muted">{t.colour}</dt>
            <dd className="mt-1 flex items-center gap-2 font-semibold">
              <span className="swatch" style={{ background: `var(--el-${color.element})` }} aria-hidden="true" />{luckyColourName(color.name, lang)}
            </dd>
          </div>
        )}
        {number !== undefined && (
          <div>
            <dt className="text-small text-muted">{t.number}</dt>
            <dd className="mt-1 serif text-h3 tabular">{num(number, lang)}</dd>
          </div>
        )}
        {hour && (
          <div>
            <dt className="text-small text-muted">{t.hour}</dt>
            <dd className="mt-1 font-semibold tabular">{hourRange(hour, lang)}</dd>
          </div>
        )}
      </dl>
      {seal && seal.length > 0 && (
        <p className="mt-5 flex items-center gap-3">
          <Seal />
          <span><span className="font-semibold">{t.goodFor}</span> {seal.map(lower).join(t.and)}.</span>
        </p>
      )}
    </section>
  );
}
