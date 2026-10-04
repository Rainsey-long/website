/** A New Year angel (one of the seven daughters of Kabil Moha Prom) and her attributes. */
import type { Weekday } from "@/lib/khmer";
import { getLang } from "@/lib/langServer";
import { defineMessages } from "@/lib/i18n";

const T = defineMessages({
  en: { day: "Her day", robe: "Robe", flower: "Flower", jewel: "Jewel", food: "Food", holds: "Holds", rides: "Rides" },
  km: { day: "ថ្ងៃរបស់នាង", robe: "ពណ៌សម្លៀកបំពាក់", flower: "ផ្កា", jewel: "គ្រឿងអលង្ការ", food: "ភក្សាហារ", holds: "ព្រះហស្តកាន់", rides: "ពាហនៈ" },
});

export default async function AngelCard({ weekday, headingLevel = "h3" }: { weekday: Weekday; headingLevel?: "h2" | "h3" }) {
  const lang = await getLang();
  const t = T[lang];
  const H = headingLevel;
  const a = weekday.angel;
  const km = lang === "km";
  return (
    <section className="border-t-2 border-ink pt-4">
      <H className="text-h3"><span lang="km">{a.km}</span> <span className="text-muted" lang={km ? "en" : undefined}>{a.roman}</span></H>
      <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 text-small">
        <div><dt className="text-muted">{t.day}</dt><dd>{km ? `ថ្ងៃ${weekday.km}` : <>{weekday.en} (<span lang="km">{weekday.km}</span>)</>}</dd></div>
        <div><dt className="text-muted">{t.robe}</dt><dd className="flex items-center gap-2"><span className="swatch" style={{ background: `var(--${weekday.swatch})` }} aria-hidden="true" />{km ? weekday.colourKm : weekday.colourEn}</dd></div>
        <div><dt className="text-muted">{t.flower}</dt><dd>{km ? a.flowerKm : a.flower}</dd></div>
        <div><dt className="text-muted">{t.jewel}</dt><dd>{km ? a.jewelKm : a.jewel}</dd></div>
        <div><dt className="text-muted">{t.food}</dt><dd>{km ? a.foodKm : a.food}</dd></div>
        <div><dt className="text-muted">{t.holds}</dt><dd>{km ? a.handsKm : a.hands}</dd></div>
        <div><dt className="text-muted">{t.rides}</dt><dd>{km ? a.mountKm : a.mount}</dd></div>
      </dl>
    </section>
  );
}
